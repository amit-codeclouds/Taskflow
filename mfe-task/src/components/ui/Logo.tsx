import Image from 'next/image';

export default function Logo({ height = 24, showText = true }: { height?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {/* next/image doesn't prepend basePath into the optimizer's `url` query param
          for a plain string src, so it must be hardcoded here or the image 404s. */}
      <Image
        src="/tasks/brand/icon-mark.png"
        alt="Taskflow"
        width={height}
        height={height}
        priority
        style={{ height, width: height }}
      />
      {showText && (
        <span className="text-text-100 font-semibold tracking-tight" style={{ fontSize: Math.round(height * 0.62) }}>
          Taskflow
        </span>
      )}
    </div>
  );
}
