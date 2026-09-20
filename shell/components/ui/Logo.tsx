import Image from 'next/image';

export default function Logo({ height = 24, showText = true }: { height?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/brand/icon-mark.png"
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
