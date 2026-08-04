'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient, formatVnd, getEffectivePrice } from '@/lib/apiClient';
import { useLocale, useT } from '@/context/LocaleContext';
import { pickLocale } from '@/lib/localized';
import type { Product } from '@/types';

export default function SearchSuggest({ dark = false }: { dark?: boolean }) {
  const t = useT();
  const { locale } = useLocale();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    timer.current = setTimeout(() => {
      void apiClient
        .get<{ suggestions: Product[] }>('/products/suggest', {
          params: { q: q.trim(), limit: 6 },
        })
        .then((res) => {
          setItems(res.data.suggestions);
          setOpen(true);
        })
        .catch(() => setItems([]));
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  const goSearch = () => {
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          placeholder={t('search.placeholder')}
          className={`h-10 w-full rounded-pill border px-4 text-[13px] outline-none transition focus:ring-1 ${
            dark
              ? 'border-white/20 bg-white/10 text-on-night placeholder:text-on-night/40 focus:border-white/45 focus:ring-white/15'
              : 'border-hairline-light bg-canvas-cream text-ink placeholder:text-shade-40 focus:border-ink/40 focus:ring-ink/10'
          }`}
        />
      </form>
      {open && items.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-hairline-light bg-canvas-light shadow-elevated-light animate-float-in">
          {items.map((p) => (
            <li key={p._id}>
              <Link
                href={`/products/${p._id}`}
                className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-canvas-cream"
                onClick={() => setOpen(false)}
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-canvas-night">
                  <Image
                    src={p.images[0]}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {pickLocale(p.name, locale)}
                  </p>
                  <p className="text-[12px] text-shade-50">
                    {p.category} · {formatVnd(getEffectivePrice(p))}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="w-full border-t border-hairline-light px-3 py-2.5 text-left text-[13px] font-medium text-shade-60 hover:bg-canvas-cream"
              onClick={goSearch}
            >
              {t('search.viewAll', { q })}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
