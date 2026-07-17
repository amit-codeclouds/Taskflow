'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Link2, Quote, Code as CodeIcon, ImagePlus, Undo2, Redo2, X, ChevronDown,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number; // default 180
  variant?: 'full' | 'compact'; // default 'full' — 'compact' is text + link only, no toolbar dropdowns/image/align/lists
}

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
];

const FONT_SIZE_OPTIONS = [
  { value: '', label: 'Normal' },
  { value: '12px', label: 'Small' },
  { value: '18px', label: 'Large' },
  { value: '24px', label: 'X-Large' },
  { value: '32px', label: 'XX-Large' },
];

// The actual Tiptap editor + toolbar — imported dynamically to avoid SSR
// (ProseMirror manipulates the DOM directly and only makes sense client-side).
const TiptapDynamic = dynamic(
  async () => {
    const [
      { useEditor, EditorContent },
      { default: StarterKit },
      { default: Underline },
      { default: Link },
      { default: Image },
      { default: TextAlign },
      { default: Placeholder },
      { default: TextStyle },
    ] = await Promise.all([
      import('@tiptap/react'),
      import('@tiptap/starter-kit'),
      import('@tiptap/extension-underline'),
      import('@tiptap/extension-link'),
      import('@tiptap/extension-image'),
      import('@tiptap/extension-text-align'),
      import('@tiptap/extension-placeholder'),
      import('@tiptap/extension-text-style'),
    ]);

    // ── Resizable image — extends the base Image node with a `width` attribute
    // and a drag handle rendered via a plain-DOM NodeView ─────────────────────
    const ResizableImage = Image.extend({
      addAttributes(this: any) {
        return {
          ...this.parent?.(),
          width: {
            default: null,
            // Style is built jointly with `align` below (both would collide if each
            // returned their own `style` key — Tiptap merges renderHTML output shallowly).
            renderHTML: () => ({}),
            parseHTML: (element: HTMLElement) => {
              const styleWidth = element.style.width;
              if (styleWidth) return parseInt(styleWidth, 10);
              const attrWidth = element.getAttribute('width');
              return attrWidth ? parseInt(attrWidth, 10) : null;
            },
          },
          align: {
            default: 'left',
            renderHTML: (attributes: any) => {
              const styles = ['display: block'];
              if (attributes.width) styles.push(`width: ${attributes.width}px`);
              const align = attributes.align || 'left';
              if (align === 'center') styles.push('margin-left: auto', 'margin-right: auto');
              else if (align === 'right') styles.push('margin-left: auto', 'margin-right: 0');
              else styles.push('margin-left: 0', 'margin-right: auto');
              return { style: styles.join('; ') };
            },
            parseHTML: (element: HTMLElement) => {
              if (element.style.marginLeft === 'auto' && element.style.marginRight === 'auto') return 'center';
              if (element.style.marginLeft === 'auto') return 'right';
              return 'left';
            },
          },
        };
      },
      addNodeView(this: any) {
        return ({ node, editor, getPos }: any) => {
          let currentNode = node;

          // `wrapper` spans the full text column (mirrors the exported <img>'s own
          // block box) so that `imgBox`'s auto-margins have real room to align within.
          const wrapper = document.createElement('div');
          wrapper.className = 'tf-image-wrapper';

          // `imgBox` shrink-wraps tightly around the image so the resize handle
          // always sits at the image's own corner, regardless of alignment.
          const imgBox = document.createElement('div');
          imgBox.className = 'tf-image-box';

          const img = document.createElement('img');
          img.src = node.attrs.src;
          if (node.attrs.alt) img.alt = node.attrs.alt;

          const handle = document.createElement('div');
          handle.className = 'tf-image-resize-handle';
          handle.contentEditable = 'false';

          imgBox.appendChild(img);
          imgBox.appendChild(handle);
          wrapper.appendChild(imgBox);

          function applyAttrs(attrs: any) {
            img.style.width = attrs.width ? `${attrs.width}px` : '';
            const align = attrs.align || 'left';
            if (align === 'center') { imgBox.style.marginLeft = 'auto'; imgBox.style.marginRight = 'auto'; }
            else if (align === 'right') { imgBox.style.marginLeft = 'auto'; imgBox.style.marginRight = '0'; }
            else { imgBox.style.marginLeft = '0'; imgBox.style.marginRight = 'auto'; }
          }
          applyAttrs(node.attrs);

          let startX = 0;
          let startWidth = 0;

          function onPointerMove(e: PointerEvent) {
            const delta = e.clientX - startX;
            img.style.width = `${Math.max(80, Math.round(startWidth + delta))}px`;
          }

          function onPointerUp() {
            document.removeEventListener('pointermove', onPointerMove);
            const pos = typeof getPos === 'function' ? getPos() : null;
            if (pos !== null && pos !== undefined) {
              const width = Math.round(img.getBoundingClientRect().width);
              editor.view.dispatch(
                editor.view.state.tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, width })
              );
            }
          }

          handle.addEventListener('pointerdown', (e: PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            startX = e.clientX;
            startWidth = img.getBoundingClientRect().width;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp, { once: true });
          });

          return {
            dom: wrapper,
            update(updatedNode: any) {
              if (updatedNode.type.name !== 'image') return false;
              currentNode = updatedNode;
              img.src = updatedNode.attrs.src;
              img.alt = updatedNode.attrs.alt ?? '';
              applyAttrs(updatedNode.attrs);
              return true;
            },
          };
        };
      },
    });

    // ── Font size — a custom attribute on the generic TextStyle mark ─────────
    const FontSize = TextStyle.extend({
      addAttributes(this: any) {
        return {
          ...this.parent?.(),
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attrs: any) => (attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {}),
          },
        };
      },
    });

    function toolbarBtnClass(active: boolean) {
      return `w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
        active ? 'bg-accent-bg text-accent' : 'text-text-300 hover:bg-bg-600 hover:text-text-100'
      }`;
    }

    function Divider() {
      return <div className="w-px h-6 bg-border-subtle mx-1" />;
    }

    function ToolbarDropdown({
      label,
      activeLabel,
      options,
      activeValue,
      onSelect,
    }: {
      label: string;
      activeLabel: string;
      options: { value: string; label: string }[];
      activeValue: string;
      onSelect: (value: string) => void;
    }) {
      const [open, setOpen] = useState(false);
      const ref = useRef<HTMLDivElement>(null);

      useEffect(() => {
        function onMouseDown(e: MouseEvent) {
          if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
      }, []);

      return (
        <div className="relative" ref={ref}>
          <button
            type="button"
            data-tooltip={label}
            onClick={() => setOpen((o) => !o)}
            className="h-9 px-3 rounded-md flex items-center gap-1.5 text-sm font-medium text-text-200 hover:bg-bg-600 hover:text-text-100 transition-colors"
          >
            {activeLabel}
            <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute z-20 top-[calc(100%+6px)] left-0 min-w-[170px] bg-bg-800 border border-border-subtle rounded-lg shadow-elevated p-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onSelect(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeValue === opt.value ? 'bg-accent-bg text-accent-hover' : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    function Editor({ value, onChange, placeholder = 'Add more context, links, or steps...', minHeight = 180, variant = 'full' }: RichTextEditorProps) {
      const isCompact = variant === 'compact';
      const [linkOpen, setLinkOpen] = useState(false);
      const [linkUrl, setLinkUrl] = useState('');
      const linkPopoverRef = useRef<HTMLDivElement>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);

      const editor = useEditor({
        immediatelyRender: false,
        extensions: isCompact
          ? [
              StarterKit.configure({ heading: false }),
              Link.configure({ openOnClick: false, autolink: true }),
              Placeholder.configure({ placeholder }),
            ]
          : [
              StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
              Underline,
              Link.configure({ openOnClick: false, autolink: true }),
              // allowBase64 is required — otherwise Tiptap's HTML-parsing rule excludes
              // `img[src^="data:"]`, so a saved base64 image silently disappears on reload.
              ResizableImage.configure({ allowBase64: true }),
              TextAlign.configure({ types: ['heading', 'paragraph'] }),
              Placeholder.configure({ placeholder }),
              FontSize,
            ],
        content: value,
        editorProps: {
          attributes: { class: 'tf-editor-content' },
          handleDrop(_view: unknown, event: DragEvent) {
            const file = event.dataTransfer?.files?.[0];
            if (!isCompact && file && file.type.startsWith('image/')) {
              event.preventDefault();
              insertImageFile(file);
              return true;
            }
            return false;
          },
          handlePaste(_view: unknown, event: ClipboardEvent) {
            const file = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
            if (!isCompact && file) {
              event.preventDefault();
              insertImageFile(file);
              return true;
            }
            return false;
          },
        },
        onUpdate({ editor }: { editor: any }) {
          onChange(editor.getHTML());
        },
      });

      function insertImageFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
          editor?.chain().focus().setImage({ src: reader.result as string }).run();
        };
        reader.readAsDataURL(file);
      }

      // Keep the editor in sync if `value` changes externally (e.g. Formik reinitializing
      // once async edit-task data arrives) — but never while the change originated from
      // this editor itself, or the cursor would jump to the start on every keystroke.
      useEffect(() => {
        if (editor && value !== editor.getHTML()) {
          editor.commands.setContent(value, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [value, editor]);

      useEffect(() => {
        function onMouseDown(e: MouseEvent) {
          if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target as Node)) {
            setLinkOpen(false);
          }
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
      }, []);

      if (!editor) {
        return (
          <div
            className="w-full rounded-lg bg-bg-700 border border-border-subtle animate-pulse"
            style={{ minHeight }}
          />
        );
      }

      function openLinkPopover() {
        setLinkUrl(editor!.getAttributes('link').href ?? '');
        setLinkOpen(true);
      }

      function applyLink() {
        const url = linkUrl.trim();
        if (!url) {
          editor!.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
          const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
          editor!.chain().focus().extendMarkRange('link').setLink({ href }).run();
        }
        setLinkOpen(false);
      }

      function removeLink() {
        editor!.chain().focus().unsetLink().run();
        setLinkOpen(false);
      }

      const activeHeading = editor.isActive('heading', { level: 1 })
        ? 'h1'
        : editor.isActive('heading', { level: 2 })
        ? 'h2'
        : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'paragraph';

      function selectHeading(v: string) {
        if (v === 'paragraph') {
          editor.chain().focus().setParagraph().run();
        } else {
          const level = parseInt(v.slice(1), 10) as 1 | 2 | 3;
          editor.chain().focus().toggleHeading({ level }).run();
        }
      }

      const activeFontSize = editor.getAttributes('textStyle').fontSize ?? '';

      function selectFontSize(v: string) {
        if (!v) {
          editor.chain().focus().unsetMark('textStyle').run();
        } else {
          editor.chain().focus().setMark('textStyle', { fontSize: v }).run();
        }
      }

      // Align buttons apply to whichever is currently selected — the image itself
      // (when a picture is selected) or the surrounding text otherwise.
      const isImageSelected = editor.isActive('image');
      const activeImageAlign = isImageSelected ? (editor.getAttributes('image').align || 'left') : null;

      function isAlignActive(dir: 'left' | 'center' | 'right' | 'justify') {
        return isImageSelected ? activeImageAlign === dir : editor.isActive({ textAlign: dir });
      }

      function applyAlign(dir: 'left' | 'center' | 'right' | 'justify') {
        if (isImageSelected) {
          if (dir === 'justify') return;
          editor.chain().focus().updateAttributes('image', { align: dir }).run();
        } else {
          editor.chain().focus().setTextAlign(dir).run();
        }
      }

      return (
        <div className="tf-editor-wrapper rounded-lg border border-border-subtle overflow-hidden bg-[#1c1c21] focus-within:border-accent transition-colors">
          {/* Toolbar */}
          <div className="flex items-center flex-wrap gap-1 p-2 bg-[#1A1A1E] border-b border-border-subtle">
            {!isCompact && (
              <>
                <ToolbarDropdown
                  label="Text style"
                  activeLabel={HEADING_OPTIONS.find((o) => o.value === activeHeading)?.label ?? 'Paragraph'}
                  options={HEADING_OPTIONS}
                  activeValue={activeHeading}
                  onSelect={selectHeading}
                />

                <ToolbarDropdown
                  label="Text size"
                  activeLabel={FONT_SIZE_OPTIONS.find((o) => o.value === activeFontSize)?.label ?? 'Normal'}
                  options={FONT_SIZE_OPTIONS}
                  activeValue={activeFontSize}
                  onSelect={selectFontSize}
                />

                <Divider />
              </>
            )}

            <button type="button" data-tooltip="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtnClass(editor.isActive('bold'))}><Bold size={16} /></button>
            <button type="button" data-tooltip="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtnClass(editor.isActive('italic'))}><Italic size={16} /></button>
            {!isCompact && (
              <button type="button" data-tooltip="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolbarBtnClass(editor.isActive('underline'))}><UnderlineIcon size={16} /></button>
            )}

            {!isCompact && (
              <>
                <Divider />

                <button type="button" data-tooltip="Align left" onClick={() => applyAlign('left')} className={toolbarBtnClass(isAlignActive('left'))}><AlignLeft size={16} /></button>
                <button type="button" data-tooltip="Align center" onClick={() => applyAlign('center')} className={toolbarBtnClass(isAlignActive('center'))}><AlignCenter size={16} /></button>
                <button type="button" data-tooltip="Align right" onClick={() => applyAlign('right')} className={toolbarBtnClass(isAlignActive('right'))}><AlignRight size={16} /></button>
                <button type="button" data-tooltip="Justify" onClick={() => applyAlign('justify')} disabled={isImageSelected} className={`${toolbarBtnClass(isAlignActive('justify'))} ${isImageSelected ? 'opacity-30 cursor-not-allowed' : ''}`}><AlignJustify size={16} /></button>

                <Divider />

                <button type="button" data-tooltip="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarBtnClass(editor.isActive('bulletList'))}><List size={16} /></button>
                <button type="button" data-tooltip="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarBtnClass(editor.isActive('orderedList'))}><ListOrdered size={16} /></button>
                <button type="button" data-tooltip="Indent" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!editor.can().sinkListItem('listItem')} className={`${toolbarBtnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}><Indent size={16} /></button>
                <button type="button" data-tooltip="Outdent" onClick={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!editor.can().liftListItem('listItem')} className={`${toolbarBtnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}><Outdent size={16} /></button>

                <Divider />
              </>
            )}

            <div className="relative" ref={linkPopoverRef}>
              <button type="button" data-tooltip="Link" onClick={() => (linkOpen ? setLinkOpen(false) : openLinkPopover())} className={toolbarBtnClass(editor.isActive('link'))}><Link2 size={16} /></button>
              {linkOpen && (
                <div className="absolute z-20 top-[calc(100%+6px)] left-0 w-64 bg-bg-800 border border-border-subtle rounded-lg shadow-elevated p-2 flex items-center gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                      if (e.key === 'Escape') setLinkOpen(false);
                    }}
                    placeholder="https://…"
                    className="flex-1 h-9 px-2 rounded-md bg-bg-700 border border-border-subtle text-xs text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent"
                  />
                  <button type="button" onClick={applyLink} className="h-9 px-2.5 shrink-0 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors">Apply</button>
                  {editor.isActive('link') && (
                    <button type="button" data-tooltip="Remove link" onClick={removeLink} className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center text-text-300 hover:text-status-red hover:bg-red-bg transition-colors"><X size={14} /></button>
                  )}
                </div>
              )}
            </div>

            {!isCompact && (
              <>
                <button type="button" data-tooltip="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toolbarBtnClass(editor.isActive('blockquote'))}><Quote size={16} /></button>
                <button type="button" data-tooltip="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} className={toolbarBtnClass(editor.isActive('code'))}><CodeIcon size={16} /></button>

                <Divider />

                <button type="button" data-tooltip="Insert image" onClick={() => fileInputRef.current?.click()} className={toolbarBtnClass(false)}>
                  <ImagePlus size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) insertImageFile(file);
                    e.target.value = '';
                  }}
                />
              </>
            )}

            <div className="flex-1" />

            {!isCompact && (
              <>
                <button type="button" data-tooltip="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${toolbarBtnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}><Undo2 size={16} /></button>
                <button type="button" data-tooltip="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${toolbarBtnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}><Redo2 size={16} /></button>
              </>
            )}
          </div>

          {/* Content */}
          <div style={{ '--tf-editor-min-height': `${minHeight}px` } as CSSProperties}>
            <EditorContent editor={editor} />
          </div>
        </div>
      );
    }

    return Editor;
  },
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-lg bg-bg-700 border border-border-subtle animate-pulse"
        style={{ minHeight: 500 }}
      />
    ),
  },
);

export default function RichTextEditor(props: RichTextEditorProps) {
  return <TiptapDynamic {...props} />;
}
