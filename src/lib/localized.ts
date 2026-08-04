export type LocaleCode = 'vi' | 'en';

export interface LocalizedString {
  vi: string;
  en: string;
}

export function emptyLocalized(vi = '', en = ''): LocalizedString {
  return { vi, en };
}

/**
 * Parse without cross-filling empty locales.
 * Use this in admin editors so users can clear a field.
 */
export function toLocalizedRaw(input: unknown): LocalizedString {
  if (typeof input === 'string') {
    return { vi: input, en: input };
  }
  if (input && typeof input === 'object') {
    const o = input as Record<string, unknown>;
    return {
      vi: typeof o.vi === 'string' ? o.vi : '',
      en: typeof o.en === 'string' ? o.en : '',
    };
  }
  return { vi: '', en: '' };
}

/** Raw value for one locale (no fallback) — for admin inputs */
export function localeField(
  input: unknown,
  locale: LocaleCode = 'vi'
): string {
  const loc = toLocalizedRaw(input);
  return locale === 'en' ? loc.en : loc.vi;
}

/**
 * Normalize for storage/display helpers.
 * Does NOT copy vi↔en (keeps empty strings).
 */
export function toLocalized(
  input: unknown,
  fallback = ''
): LocalizedString {
  const raw = toLocalizedRaw(input);
  if (!raw.vi && !raw.en && fallback) {
    return { vi: fallback, en: fallback };
  }
  return raw;
}

/** Shop display: prefer current locale, else the other, else fallback */
export function pickLocale(
  input: unknown,
  locale: LocaleCode = 'vi',
  fallback = ''
): string {
  const loc = toLocalizedRaw(input);
  const primary = locale === 'en' ? loc.en : loc.vi;
  const secondary = locale === 'en' ? loc.vi : loc.en;
  return primary || secondary || fallback;
}

/** When saving: fill empty side from the other if needed */
export function fillLocalized(
  input: unknown,
  fallback = ''
): LocalizedString {
  const raw = toLocalizedRaw(input);
  const vi = raw.vi.trim() || raw.en.trim() || fallback;
  const en = raw.en.trim() || raw.vi.trim() || fallback;
  return { vi, en };
}
