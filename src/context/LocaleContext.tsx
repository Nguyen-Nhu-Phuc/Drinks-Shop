'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { translate, type Locale } from '@/i18n/dictionaries';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  ready: boolean;
}

const STORAGE_KEY = 'drinks-locale';
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>('vi');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const next = stored === 'en' || stored === 'vi' ? stored : 'vi';
    setLocaleState(next);
    document.documentElement.lang = next;
    document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
    setReady(true);
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
      document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, ready }),
    [locale, setLocale, t, ready]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT() {
  return useLocale().t;
}
