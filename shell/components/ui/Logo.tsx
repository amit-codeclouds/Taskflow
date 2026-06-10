export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3h10M2 7h6M2 11h8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-text-100 font-semibold text-[15px] tracking-tight">Taskflow</span>
    </div>
  );
}
