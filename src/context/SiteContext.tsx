'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '@/lib/apiClient';
import type { PublicSite } from '@/types/site';

interface SiteContextValue {
  site: PublicSite | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const fallback: PublicSite = {
  brandName: { vi: 'Drinks', en: 'Drinks' },
  tagline: {
    vi: 'Đồ uống tươi giao nhanh',
    en: 'Fresh drinks, fast delivery',
  },
  contactEmail: 'hello@drinksshop.vn',
  contactPhone: '1900 1234',
  navLinks: [
    { label: { vi: 'Menu', en: 'Menu' }, href: '/products', enabled: true },
    {
      label: { vi: 'Sale', en: 'Sale' },
      href: '/products?onSale=true',
      enabled: true,
    },
    {
      label: { vi: 'Đã lưu', en: 'Saved' },
      href: '/wishlist',
      enabled: true,
    },
  ],
  footerAbout: {
    vi: 'Đồ uống tươi — pha đúng lúc, giao đúng khung giờ.',
    en: 'Fresh drinks — made to order, delivered on time.',
  },
  footerColumns: [],
  footerNote: {
    vi: 'Tươi · Nhanh · Gần bạn',
    en: 'Fresh · Fast · Local',
  },
  aiWidget: {
    enabled: true,
    title: { vi: 'Drinks AI', en: 'Drinks AI' },
    subtitle: {
      vi: 'Gợi ý đồ uống',
      en: 'Drink suggestions',
    },
    buttonLabel: { vi: '✦ Hỏi AI', en: '✦ Ask AI' },
    welcomeMessage: {
      vi: 'Xin chào! Mình có thể gợi ý đồ uống...',
      en: 'Hi! I can suggest drinks for you...',
    },
  },
  homeSections: [],
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<PublicSite | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await apiClient.get<PublicSite>('/site/public');
      setSite(data);
    } catch {
      setSite(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SiteContext.Provider value={{ site: site ?? fallback, loading, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}
