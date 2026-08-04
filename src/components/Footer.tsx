'use client';

import Link from 'next/link';
import { useSite } from '@/context/SiteContext';
import { useLocale, useT } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { pickLocale } from '@/lib/localized';

export default function Footer() {
  const { site } = useSite();
  const t = useT();
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const columns = site?.footerColumns ?? [];
  const brandName = pickLocale(site?.brandName, locale, 'Drinks');

  return (
    <footer
      className={
        isDark
          ? 'grain-dark bg-canvas-night text-on-night'
          : 'border-t border-hairline-light bg-canvas-light text-ink'
      }
    >
      <div className="page-shell grid gap-14 py-20 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-10 md:py-24">
        <div>
          <p className="flex items-center gap-3 font-display text-4xl font-light tracking-tight">
            {site?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={site.logoUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : null}
            {brandName}
          </p>
          <p
            className={`mt-5 max-w-xs text-sm leading-relaxed ${
              isDark ? 'text-link-cool-1' : 'text-shade-60'
            }`}
          >
            {pickLocale(site?.footerAbout, locale)}
          </p>
        </div>

        {columns.map((col) => {
          const title = pickLocale(col.title, locale);
          return (
            <div key={title}>
              <p
                className={`mb-5 text-[11px] uppercase tracking-[0.14em] ${
                  isDark ? 'text-link-cool-3' : 'text-shade-50'
                }`}
              >
                {title}
              </p>
              <ul
                className={`space-y-3 text-sm ${
                  isDark ? 'text-link-cool-1' : 'text-shade-60'
                }`}
              >
                {col.links.map((l) => {
                  const label = pickLocale(l.label, locale);
                  return (
                    <li key={`${title}-${l.href}-${label}`}>
                      <Link
                        href={l.href}
                        className={`transition ${
                          isDark ? 'hover:text-on-night' : 'hover:text-ink'
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div>
          <p
            className={`mb-5 text-[11px] uppercase tracking-[0.14em] ${
              isDark ? 'text-link-cool-3' : 'text-shade-50'
            }`}
          >
            {t('footer.contact')}
          </p>
          <p
            className={`text-sm ${
              isDark ? 'text-link-cool-1' : 'text-shade-60'
            }`}
          >
            {site?.contactEmail}
          </p>
          <p
            className={`mt-2 text-sm ${
              isDark ? 'text-link-cool-1' : 'text-shade-60'
            }`}
          >
            {site?.contactPhone}
          </p>
        </div>
      </div>

      <div
        className={`page-shell flex flex-col gap-2 py-6 text-[12px] sm:flex-row sm:justify-between ${
          isDark
            ? 'border-t border-white/10 text-link-cool-2'
            : 'border-t border-hairline-light text-shade-50'
        }`}
      >
        <span>
          © {new Date().getFullYear()} {brandName}
        </span>
        <span>{pickLocale(site?.footerNote, locale)}</span>
      </div>
    </footer>
  );
}
