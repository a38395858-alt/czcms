import { cn } from '../../utils/cn';

export function Logo({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'light' ? 'text-white' : 'text-navy-900', className)}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false" className="shrink-0">
        <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="4" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeOpacity="0.3" />
        <path d="M7 22 13 12l6 6 6-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="22" r="2.5" fill="currentColor" />
        <circle cx="25" cy="9" r="3.1" fill="#ff7a1a" />
      </svg>
      <span className="font-display text-[1.4rem] font-bold leading-none tracking-[-0.01em]">
        Freight<span className="font-semibold opacity-80">Vanta</span>
      </span>
    </span>
  );
}
