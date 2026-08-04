import {
  localeField,
  toLocalizedRaw,
  type LocaleCode,
} from '@/lib/localized';

export function str(
  config: Record<string, unknown>,
  key: string,
  fallback = '',
  locale: LocaleCode = 'vi'
): string {
  const v = config[key];
  if (v == null) return fallback;
  if (typeof v === 'string') return v || fallback;
  const primary = localeField(v, locale);
  if (primary) return primary;
  const other = localeField(v, locale === 'en' ? 'vi' : 'en');
  return other || fallback;
}

export function num(
  config: Record<string, unknown>,
  key: string,
  fallback: number
): number {
  const v = config[key];
  return typeof v === 'number' ? v : fallback;
}

/** Admin editor: exact locale value, no fallback */
export function getLocField(
  config: Record<string, unknown>,
  key: string,
  locale: LocaleCode
): string {
  return localeField(config[key], locale);
}

export function setLocField(
  config: Record<string, unknown>,
  key: string,
  locale: LocaleCode,
  value: string
): Record<string, unknown> {
  const cur = toLocalizedRaw(config[key]);
  return { ...config, [key]: { ...cur, [locale]: value } };
}
