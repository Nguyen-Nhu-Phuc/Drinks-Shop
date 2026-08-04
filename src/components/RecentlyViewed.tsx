'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useT } from '@/context/LocaleContext';
import type { Product } from '@/types';

const KEY = 'drinks-recently-viewed';

export function trackRecentlyViewed(product: Product): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: Product[] = raw ? (JSON.parse(raw) as Product[]) : [];
    const next = [
      product,
      ...list.filter((p) => p._id !== product._id),
    ].slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const t = useT();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const list = (JSON.parse(raw) as Product[]).filter(
        (p) => p._id !== excludeId
      );
      setItems(list.slice(0, 4));
    } catch {
      // ignore
    }
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="font-display text-heading-xl">{t('product.recentlyViewed')}</h2>
      <div className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
