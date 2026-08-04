'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { Product, ProductsResponse } from '@/types';
import type { PageSection, SiteSettings } from '@/types/site';
import CmsSectionsView, {
  type CategoryStat,
  type CouponPublic,
} from '@/components/cms/CmsSectionsView';
import { str, num } from '@/lib/cmsConfig';
import { pickLocale } from '@/lib/localized';
import { useLocale } from '@/context/LocaleContext';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
}

async function loadProductsForSections(
  sections: PageSection[]
): Promise<Record<string, Product[]>> {
  const enabled = sections.filter((s) => s.enabled && s.type === 'productGrid');
  const results = await Promise.all(
    enabled.map(async (s) => {
      const source = str(s.config, 'source', 'featured');
      const limit = num(s.config, 'limit', 6);
      const params: Record<string, string | number | boolean> = { limit };
      if (source === 'featured') {
        params.featured = true;
      } else if (source === 'sale') {
        params.onSale = true;
        params.sort = 'rating';
      } else if (source === 'bestseller') {
        params.sort = 'bestseller';
      } else {
        params.sort = 'newest';
      }
      try {
        const { data } = await apiClient.get<ProductsResponse>('/products', {
          params,
        });
        return { id: s.id, products: data.products };
      } catch {
        return { id: s.id, products: [] as Product[] };
      }
    })
  );
  return Object.fromEntries(results.map((r) => [r.id, r.products]));
}

export default function SitePreviewDialog({ open, onClose, settings }: Props) {
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [coupons, setCoupons] = useState<CouponPublic[]>([]);
  const [productsBySection, setProductsBySection] = useState<
    Record<string, Product[]>
  >({});

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const sections = settings.homeSections;
        const needsCategories = sections.some(
          (s) => s.enabled && s.type === 'categories'
        );
        const needsCoupons = sections.some(
          (s) =>
            s.enabled &&
            (s.type === 'couponBanner' ||
              (s.type === 'marquee' && s.config.mode === 'coupons'))
        );

        const [cats, coups, productsMap] = await Promise.all([
          needsCategories
            ? apiClient
                .get<CategoryStat[]>('/products/categories/stats')
                .then((r) => r.data)
                .catch(() => [])
            : Promise.resolve([] as CategoryStat[]),
          needsCoupons
            ? apiClient
                .get<CouponPublic[]>('/coupons/public')
                .then((r) => r.data)
                .catch(() => [])
            : Promise.resolve([] as CouponPublic[]),
          loadProductsForSections(sections),
        ]);

        if (!cancelled) {
          setCategories(cats);
          setCoupons(coups);
          setProductsBySection(productsMap);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [open, settings]);

  if (!open) return null;

  const enabledCount = settings.homeSections.filter((s) => s.enabled).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước giao diện"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        aria-label="Đóng overlay"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-hairline-light bg-canvas-cream shadow-elevated-light animate-float-in">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-hairline-light bg-canvas-light px-4 py-3 md:px-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
              Preview
            </p>
            <p className="font-display text-lg font-light tracking-tight">
              {pickLocale(settings.brandName, locale)} · {enabledCount} section
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-shade-50 sm:inline">
              Bản nháp hiện tại (chưa cần lưu)
            </span>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-light !min-h-0 !px-4 !py-2 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-shade-50">
              Đang tải xem trước…
            </div>
          ) : enabledCount === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="font-display text-xl font-light">Không có section nào bật</p>
              <p className="text-sm text-shade-50">
                Bật ít nhất một khối ở bên trái rồi xem lại.
              </p>
            </div>
          ) : (
            <CmsSectionsView
              sections={settings.homeSections}
              categories={categories}
              coupons={coupons}
              productsBySection={productsBySection}
              compact
            />
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-hairline-light bg-canvas-light px-4 py-2.5 text-[11px] text-shade-50 md:px-5">
          <span>
            Nav:{' '}
            {settings.navLinks
              .filter((l) => l.enabled)
              .map((l) => pickLocale(l.label, locale))
              .join(' · ') || '—'}
          </span>
          <span>
            {settings.contactEmail}
            {settings.contactPhone ? ` · ${settings.contactPhone}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
