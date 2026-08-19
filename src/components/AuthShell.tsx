import type { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  lead: string;
  lead2: string;
  hint: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
};

export default function AuthShell({
  lead,
  lead2,
  hint,
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-canvas-night lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{ backgroundImage: 'var(--grain)' }}
        />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-aloe-10/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-pistachio-10/30 blur-3xl" />

        <Link
          href="/"
          className="relative font-display text-2xl font-medium tracking-tight text-on-night"
        >
          Drinks
        </Link>
        <div className="relative max-w-lg">
          <p className="font-display text-6xl font-light leading-[0.95] tracking-tight text-on-night xl:text-7xl">
            {lead}
            <br />
            <span className="text-aloe-10">{lead2}</span>
          </p>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-link-cool-1">
            {hint}
          </p>
        </div>
        <p className="relative text-[11px] uppercase tracking-[0.18em] text-link-cool-3">
          Fresh · Fast · Local
        </p>
      </aside>

      <div className="flex items-center px-6 py-14 md:px-12">
        <div className="mx-auto w-full max-w-[420px] animate-fade-up">
          <p className="eyebrow lg:hidden">Drinks</p>
          <h1 className="section-title mt-2">{title}</h1>
          <p className="mt-3 text-[15px] text-shade-50">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
