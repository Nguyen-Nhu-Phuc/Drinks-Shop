'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { PRODUCT_CATEGORIES } from '@/types';
import { useT } from '@/context/LocaleContext';

export default function SearchFilterBar() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div
      className={`grid gap-3 rounded-xl border border-hairline-light bg-canvas-light p-4 md:grid-cols-2 lg:grid-cols-6 ${
        pending ? 'opacity-60' : ''
      }`}
    >
      <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50 lg:col-span-2">
        {t('filter.search')}
        <input
          className="input-field"
          defaultValue={searchParams.get('q') ?? ''}
          placeholder={t('filter.searchPlaceholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              update('q', (e.target as HTMLInputElement).value);
            }
          }}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
        {t('filter.category')}
        <select
          className="input-field"
          value={searchParams.get('category') ?? ''}
          onChange={(e) => update('category', e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
        {t('filter.sale')}
        <select
          className="input-field"
          value={searchParams.get('onSale') ?? ''}
          onChange={(e) => update('onSale', e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          <option value="true">{t('filter.onSale')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
        {t('filter.sort')}
        <select
          className="input-field"
          value={searchParams.get('sort') ?? 'newest'}
          onChange={(e) => update('sort', e.target.value)}
        >
          <option value="newest">{t('filter.newest')}</option>
          <option value="price_asc">{t('filter.priceAsc')}</option>
          <option value="price_desc">{t('filter.priceDesc')}</option>
          <option value="rating">{t('filter.rating')}</option>
          <option value="bestseller">{t('filter.bestseller')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
        {t('filter.maxPrice')}
        <input
          type="number"
          className="input-field"
          defaultValue={searchParams.get('maxPrice') ?? ''}
          placeholder="VND"
          onBlur={(e) => update('maxPrice', e.target.value)}
        />
      </label>
    </div>
  );
}
