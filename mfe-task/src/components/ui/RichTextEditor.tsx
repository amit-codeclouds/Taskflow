'use client';

import dynamic from 'next/dynamic';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;  // default 360
}

// Base64 upload adapter — works without a backend (stub for Cloudinary later)
function Base64UploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => ({
    upload() {
      return loader.file.then(
        (file: File) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload  = () => resolve({ default: reader.result as string });
            reader.onerror = (err) => reject(err);
          }),
      );
    },
    abort() {},
  });
}

// The actual CKEditor render — imported dynamically to avoid SSR
const CKEditorDynamic = dynamic(
  async () => {
    const [{ CKEditor }, { default: ClassicEditor }] = await Promise.all([
      import('@ckeditor/ckeditor5-react'),
      import('@ckeditor/ckeditor5-build-classic'),
    ]);

    function Editor({ value, onChange, placeholder = 'Add more context, links, or steps...', minHeight = 180 }: RichTextEditorProps) {
      return (
        <div className="ck-editor-wrapper" style={{ '--ck-min-height': `${minHeight}px` } as React.CSSProperties}>
          <CKEditor
            editor={ClassicEditor as any}
            data={value}
            config={{
              placeholder,
              toolbar: [
                'heading', '|',
                'bold', 'italic', 'underline', '|',
                'alignment', '|',
                'bulletedList', 'numberedList', 'indent', 'outdent', '|',
                'link', 'blockQuote', 'code', '|',
                'imageUpload', '|',
                'undo', 'redo',
              ],
              alignment: { options: ['left', 'center', 'right', 'justify'] },
              extraPlugins: [Base64UploadAdapterPlugin],
              image: {
                // 'side' floats image right so text wraps beside it — use it after upload
                toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative'],
                styles: ['full', 'side'],
              },
            }}
            onChange={(_: unknown, editor: any) => onChange(editor.getData())}
          />
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
  return <CKEditorDynamic {...props} />;
}
