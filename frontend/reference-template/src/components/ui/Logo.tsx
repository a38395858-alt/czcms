import { cn } from '../../utils/cn';

interface LogoProps {
  tone?: 'light' | 'dark';
  /** Accent colour of the destination node — each template uses its own decisive colour. */
  accent?: string;
  /** Pass the template's font utility (font-de-display, font-fr-serif, font-es) to set the wordmark face. */
  className?: string;
}

export function Logo({ tone = 'light', accent = '#ff7a1a', className }: LogoProps) {
  // The wordmark uses the template's display face; English Global falls back to Barlow (font-display).
  const family = className?.match(/\bfont-(?:de-display|fr-serif|es)\b/)?.[0] ?? 'font-display';

  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'light' ? 'text-white' : 'text-current', className)}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false" className="h-[26px] w-[26px] shrink-0 min-[380px]:h-[30px] min-[380px]:w-[30px]">
        <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="4" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeOpacity="0.3" />
        <path d="M7 22 13 12l6 6 6-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="22" r="2.5" fill="currentColor" />
        <circle cx="25" cy="9" r="3.1" fill={accent} />
      </svg>
      <span className={cn(family, 'text-[1.05rem] font-bold leading-none tracking-[-0.01em] min-[380px]:text-[1.2rem] sm:text-[1.4rem]')}>
        Freight<span className="font-semibold opacity-80">Vanta</span>
      </span>
    </span>
  );
}
