import { cookies } from 'next/headers';
import { translate, type Locale } from '@/i18n/dictionaries';

export function getServerLocale(): Locale {
  const value = cookies().get('drinks-locale')?.value;
  return value === 'en' ? 'en' : 'vi';
}

export function tServer(
  key: string,
  params?: Record<string, string | number>
): string {
  return translate(getServerLocale(), key, params);
}
