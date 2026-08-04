'use client';

import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { LOCALE_LABELS, type Locale } from '@/i18n/dictionaries';

interface Props {
  darkSurface?: boolean;
}

export default function ThemeLocaleControls({ darkSurface = false }: Props) {
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-pill border text-[15px] transition ${
          darkSurface
            ? 'border-white/25 bg-white/10 text-on-night hover:bg-white/20'
            : 'border-hairline-light bg-canvas-cream text-ink hover:border-ink/30 hover:bg-shade-30/50'
        }`}
        aria-label={
          theme === 'dark' ? t('nav.themeToLight') : t('nav.themeToDark')
        }
        title={theme === 'dark' ? t('nav.themeToLight') : t('nav.themeToDark')}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>

      <div
        className={`flex rounded-pill border p-0.5 text-[11px] font-semibold tracking-wide ${
          darkSurface
            ? 'border-white/25 bg-white/5'
            : 'border-hairline-light bg-canvas-cream'
        }`}
        role="group"
        aria-label={t('nav.lang')}
      >
        {(['vi', 'en'] as Locale[]).map((code) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-pill px-2.5 py-1.5 transition ${
                active
                  ? darkSurface
                    ? 'bg-on-night text-canvas-night'
                    : 'bg-ink text-on-primary'
                  : darkSurface
                    ? 'text-on-night/55 hover:text-on-night'
                    : 'text-shade-50 hover:text-ink'
              }`}
            >
              {LOCALE_LABELS[code]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
