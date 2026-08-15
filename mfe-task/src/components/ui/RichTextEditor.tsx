'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Link2, Quote, Code as CodeIcon, ImagePlus, Undo2, Redo2, X, ChevronDown,
} from 'lucide-react';
import { ANNOTATION_COLORS, ANNOTATION_FONT_SIZE, boundingBox, boundingShape, drawActions, type Action, type Stroke, type Tool } from '@/lib/imageAnnotation';
import { openImageLightbox } from '@/lib/imageLightbox';

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

          // Small overlay toolbar (hover/selected, like the resize handle) — its
          // "annotate" button opens an in-place pen/highlighter/shape overlay
          // directly on this image, at wherever it's already rendered on the
          // page. No separate modal: keeps quality (the final composite is
          // rendered at the image's native resolution, not the on-page display
          // size) and edits happen exactly where the image already lives.
          const toolbar = document.createElement('div');
          toolbar.className = 'tf-image-toolbar';
          toolbar.contentEditable = 'false';

          imgBox.appendChild(img);
          imgBox.appendChild(toolbar);
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

          // ── Inline annotate overlay ──────────────────────────────────────
          const ICONS = {
            pen: '<path d="M9.5 1.5a1.6 1.6 0 012.3 2.3L4 11.5l-3 .5.5-3 8-7.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
            highlighter: '<path d="M2 12h10M4 9l4-4 3 3-4 4H4V9z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
            rect: '<rect x="2" y="3" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/>',
            circle: '<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3"/>',
            arrow: '<path d="M2 12L12 2M12 2H6M12 2V8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
            text: '<text x="7" y="10.5" font-size="10" font-weight="700" fill="currentColor" text-anchor="middle" font-family="system-ui, sans-serif">T</text>',
            undo: '<path d="M3 7a4.5 4.5 0 118 3.2M3 7V3M3 7h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
            clear: '<path d="M2.5 3.5h9M5 3.5v-1a1 1 0 011-1h2a1 1 0 011 1v1M4 3.5v8a1 1 0 001 1h4a1 1 0 001-1v-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
            check: '<path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
            x: '<path d="M2.5 2.5l9 9M11.5 2.5l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
            expand: '<path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
          };

          let drawing = false;
          let overlayCanvas: HTMLCanvasElement | null = null;
          let overlayCtx: CanvasRenderingContext2D | null = null;
          let tool: Tool = 'highlighter';
          let color = ANNOTATION_COLORS[0];
          let actions: Action[] = [];
          let currentStroke: Stroke | null = null;
          let dragStart: { x: number; y: number } | null = null;
          let activeTextEditor: HTMLTextAreaElement | null = null;

          function redrawOverlay() {
            if (!overlayCtx || !overlayCanvas) return;
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            drawActions(overlayCtx, currentStroke ? [...actions, currentStroke] : actions);
          }

          function toOverlayPoint(e: PointerEvent) {
            const rect = overlayCanvas!.getBoundingClientRect();
            return {
              x: ((e.clientX - rect.left) / rect.width) * overlayCanvas!.width,
              y: ((e.clientY - rect.top) / rect.height) * overlayCanvas!.height,
            };
          }

          function onOverlayPointerDown(e: PointerEvent) {
            e.preventDefault();
            overlayCanvas!.setPointerCapture(e.pointerId);
            const pt = toOverlayPoint(e);
            if (tool === 'pen' || tool === 'highlighter') currentStroke = { tool, color, points: [pt] };
            else dragStart = pt; // rect / circle / arrow / text all drag from a start point
          }

          function onOverlayPointerMove(e: PointerEvent) {
            const pt = toOverlayPoint(e);
            if ((tool === 'pen' || tool === 'highlighter') && currentStroke) {
              currentStroke.points.push(pt);
              redrawOverlay();
            } else if ((tool === 'rect' || tool === 'circle') && dragStart) {
              overlayCtx!.clearRect(0, 0, overlayCanvas!.width, overlayCanvas!.height);
              drawActions(overlayCtx!, [...actions, boundingShape(tool, color, dragStart, pt)]);
            } else if (tool === 'arrow' && dragStart) {
              overlayCtx!.clearRect(0, 0, overlayCanvas!.width, overlayCanvas!.height);
              drawActions(overlayCtx!, [...actions, { tool: 'arrow', color, x1: dragStart.x, y1: dragStart.y, x2: pt.x, y2: pt.y }]);
            } else if (tool === 'text' && dragStart) {
              // Dashed placement guide only — the box itself is never part of
              // the rendered output, so this preview isn't run through drawActions.
              overlayCtx!.clearRect(0, 0, overlayCanvas!.width, overlayCanvas!.height);
              drawActions(overlayCtx!, actions);
              const box = boundingBox(dragStart, pt);
              overlayCtx!.save();
              overlayCtx!.setLineDash([4, 3]);
              overlayCtx!.strokeStyle = color;
              overlayCtx!.lineWidth = 1;
              overlayCtx!.strokeRect(box.x, box.y, box.w, box.h);
              overlayCtx!.restore();
            }
          }

          function onOverlayPointerUp(e: PointerEvent) {
            const pt = toOverlayPoint(e);
            if ((tool === 'pen' || tool === 'highlighter') && currentStroke) {
              actions.push(currentStroke);
              currentStroke = null;
              redrawOverlay();
            } else if ((tool === 'rect' || tool === 'circle') && dragStart) {
              const shape = boundingShape(tool, color, dragStart, pt);
              if (shape.w > 2 && shape.h > 2) actions.push(shape);
              dragStart = null;
              redrawOverlay();
            } else if (tool === 'arrow' && dragStart) {
              const dx = pt.x - dragStart.x;
              const dy = pt.y - dragStart.y;
              if (Math.hypot(dx, dy) > 6) {
                actions.push({ tool: 'arrow', color, x1: dragStart.x, y1: dragStart.y, x2: pt.x, y2: pt.y });
              }
              dragStart = null;
              redrawOverlay();
            } else if (tool === 'text' && dragStart) {
              const box = boundingBox(dragStart, pt);
              dragStart = null;
              if (box.w > 20 && box.h > 16) startTextBox(box.x, box.y, box.w, box.h);
              else redrawOverlay();
            }
          }

          // Draw the box first (like other editors), then type into it — only
          // the text itself ends up rendered; the box was purely for sizing
          // and placement, matching the currently selected color.
          function startTextBox(x: number, y: number, w: number, h: number) {
            const rect = overlayCanvas!.getBoundingClientRect();
            const scaleX = rect.width / overlayCanvas!.width;
            const scaleY = rect.height / overlayCanvas!.height;

            const textarea = document.createElement('textarea');
            textarea.className = 'tf-image-textarea';
            textarea.style.left = `${x * scaleX}px`;
            textarea.style.top = `${y * scaleY}px`;
            textarea.style.width = `${w * scaleX}px`;
            textarea.style.height = `${h * scaleY}px`;
            textarea.style.color = color;
            textarea.style.fontSize = `${ANNOTATION_FONT_SIZE * scaleY}px`;
            imgBox.appendChild(textarea);
            activeTextEditor = textarea;

            // ProseMirror's own pointer/mousedown handling on the contentEditable
            // root can otherwise steal focus back before the browser finishes
            // focusing this field — stop it from ever seeing these events.
            textarea.addEventListener('pointerdown', (ev) => ev.stopPropagation());
            textarea.addEventListener('mousedown', (ev) => ev.stopPropagation());
            textarea.focus();

            let done = false;
            function commit() {
              if (done) return;
              done = true;
              const text = textarea.value.trim();
              textarea.remove();
              activeTextEditor = null;
              if (text) {
                actions.push({ tool: 'text', color, x, y, w, h, text });
              }
              redrawOverlay();
            }
            function cancelInput() {
              if (done) return;
              done = true;
              textarea.remove();
              activeTextEditor = null;
              redrawOverlay();
            }

            textarea.addEventListener('keydown', (ev) => {
              ev.stopPropagation();
              if (ev.key === 'Escape') { ev.preventDefault(); cancelInput(); }
            });
            textarea.addEventListener('blur', commit);
          }

          function onDocPointerDown(e: PointerEvent) {
            if (drawing && !imgBox.contains(e.target as Node)) exitDrawMode();
          }

          function enterDrawMode() {
            if (drawing) return;
            drawing = true;
            actions = [];
            currentStroke = null;
            dragStart = null;
            imgBox.classList.add('tf-drawing');

            overlayCanvas = document.createElement('canvas');
            overlayCanvas.className = 'tf-image-annotate-canvas';
            overlayCanvas.width = img.clientWidth;
            overlayCanvas.height = img.clientHeight;
            overlayCtx = overlayCanvas.getContext('2d');
            overlayCanvas.addEventListener('pointerdown', onOverlayPointerDown);
            overlayCanvas.addEventListener('pointermove', onOverlayPointerMove);
            overlayCanvas.addEventListener('pointerup', onOverlayPointerUp);
            imgBox.insertBefore(overlayCanvas, toolbar);

            renderToolbar();
            document.addEventListener('pointerdown', onDocPointerDown, true);
          }

          function exitDrawMode() {
            drawing = false;
            imgBox.classList.remove('tf-drawing');
            document.removeEventListener('pointerdown', onDocPointerDown, true);
            if (overlayCanvas) {
              overlayCanvas.removeEventListener('pointerdown', onOverlayPointerDown);
              overlayCanvas.removeEventListener('pointermove', onOverlayPointerMove);
              overlayCanvas.removeEventListener('pointerup', onOverlayPointerUp);
              overlayCanvas.remove();
            }
            overlayCanvas = null;
            overlayCtx = null;
            actions = [];
            renderToolbar();
          }

          // Composites the base image + all actions at the image's NATIVE
          // resolution (not the capped on-page display size the overlay was
          // drawn at) — this is what avoids the blur/quality-loss bug: strokes
          // are recorded in overlay-canvas space and scaled up at export time.
          function applyAnnotation() {
            if (!overlayCanvas) return;
            const natural = document.createElement('canvas');
            natural.width = img.naturalWidth || overlayCanvas.width;
            natural.height = img.naturalHeight || overlayCanvas.height;
            const ctx = natural.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, 0, 0, natural.width, natural.height);
            ctx.save();
            ctx.scale(natural.width / overlayCanvas.width, natural.height / overlayCanvas.height);
            drawActions(ctx, actions);
            ctx.restore();

            const dataUrl = natural.toDataURL('image/png');
            const pos = typeof getPos === 'function' ? getPos() : null;
            if (pos !== null && pos !== undefined) {
              editor.view.dispatch(
                editor.view.state.tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, src: dataUrl })
              );
            }
            exitDrawMode();
          }

          function makeIconButton(iconPath: string, label: string, active = false): HTMLButtonElement {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `tf-image-toolbar-btn${active ? ' tf-image-toolbar-btn--active' : ''}`;
            btn.setAttribute('data-tooltip', label);
            btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none">${iconPath}</svg>`;
            return btn;
          }

          function renderToolbar() {
            toolbar.innerHTML = '';

            if (!drawing) {
              const expandBtn = makeIconButton(ICONS.expand, 'View full size');
              expandBtn.addEventListener('click', (e) => { e.stopPropagation(); openImageLightbox(img.src, img.alt); });
              toolbar.appendChild(expandBtn);

              const annotateBtn = makeIconButton(ICONS.pen, 'Annotate');
              annotateBtn.addEventListener('click', (e) => { e.stopPropagation(); enterDrawMode(); });
              toolbar.appendChild(annotateBtn);
              return;
            }

            const tools: { value: Tool; icon: string; label: string }[] = [
              { value: 'pen', icon: ICONS.pen, label: 'Pen' },
              { value: 'highlighter', icon: ICONS.highlighter, label: 'Highlighter' },
              { value: 'rect', icon: ICONS.rect, label: 'Rectangle' },
              { value: 'circle', icon: ICONS.circle, label: 'Circle' },
              { value: 'arrow', icon: ICONS.arrow, label: 'Arrow' },
              { value: 'text', icon: ICONS.text, label: 'Text' },
            ];
            for (const t of tools) {
              const btn = makeIconButton(t.icon, t.label, tool === t.value);
              btn.addEventListener('click', (e) => { e.stopPropagation(); tool = t.value; renderToolbar(); });
              toolbar.appendChild(btn);
            }

            const sep1 = document.createElement('div');
            sep1.className = 'tf-image-toolbar-sep';
            toolbar.appendChild(sep1);

            for (const c of ANNOTATION_COLORS) {
              const dot = document.createElement('button');
              dot.type = 'button';
              dot.className = `tf-image-color-dot${color === c ? ' tf-image-color-dot--active' : ''}`;
              dot.style.background = c;
              dot.setAttribute('data-tooltip', 'Color');
              dot.addEventListener('click', (e) => { e.stopPropagation(); color = c; renderToolbar(); });
              toolbar.appendChild(dot);
            }

            const sep2 = document.createElement('div');
            sep2.className = 'tf-image-toolbar-sep';
            toolbar.appendChild(sep2);

            const undoBtn = makeIconButton(ICONS.undo, 'Undo');
            undoBtn.disabled = actions.length === 0;
            undoBtn.addEventListener('click', (e) => { e.stopPropagation(); actions.pop(); redrawOverlay(); });
            toolbar.appendChild(undoBtn);

            const clearBtn = makeIconButton(ICONS.clear, 'Clear all');
            clearBtn.disabled = actions.length === 0;
            clearBtn.addEventListener('click', (e) => { e.stopPropagation(); actions = []; redrawOverlay(); });
            toolbar.appendChild(clearBtn);

            const cancelBtn = makeIconButton(ICONS.x, 'Cancel');
            cancelBtn.className += ' tf-image-toolbar-btn--danger';
            cancelBtn.addEventListener('click', (e) => { e.stopPropagation(); exitDrawMode(); });
            toolbar.appendChild(cancelBtn);

            const applyBtn = makeIconButton(ICONS.check, 'Apply changes');
            applyBtn.className += ' tf-image-toolbar-btn--primary';
            applyBtn.addEventListener('click', (e) => { e.stopPropagation(); applyAnnotation(); });
            toolbar.appendChild(applyBtn);
          }

          renderToolbar();

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
            // `image` is a leaf/atom node — ProseMirror doesn't expect it to
            // have any editable DOM content of its own. Without these two
            // hooks, focusing and typing into the text tool's <textarea>
            // (which lives inside this node's DOM) made ProseMirror think the
            // node's content had been tampered with from outside and re-render
            // this node view from scratch — tearing down and recreating the
            // <img> (which has to reload), which showed up as the whole image
            // flashing/vanishing on every keystroke. Both hooks scope to just
            // our own interactive UI (toolbar, drawing overlay, text input) so
            // clicking the image itself still lets ProseMirror select the node
            // normally (that's what drives the align buttons + selected outline).
            stopEvent(event: Event) {
              const target = event.target as Node;
              if (toolbar.contains(target)) return true;
              if (overlayCanvas && overlayCanvas.contains(target)) return true;
              if (activeTextEditor && activeTextEditor.contains(target)) return true;
              return false;
            },
            ignoreMutation() {
              // Everything inside this node view (img resize/align styles, the
              // drawing overlay, the toolbar, the text input) is mutated only
              // by our own code above, never by ProseMirror or by the user
              // typing directly into contenteditable content — a leaf/atom
              // node like `image` has no editable content of its own, so it's
              // always safe to tell ProseMirror to leave this subtree alone.
              return true;
            },
            destroy() {
              document.removeEventListener('pointerdown', onDocPointerDown, true);
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
        <div className="tf-editor-wrapper rounded-lg border border-border-subtle overflow-hidden bg-[var(--color-bg-800)] focus-within:border-accent transition-colors">
          {/* Toolbar */}
          <div className="flex items-center flex-wrap gap-1 p-2 bg-[var(--color-bg-800)] border-b border-border-subtle">
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
