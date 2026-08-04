import { Suspense } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import SearchFilterBar from '@/components/SearchFilterBar';
import { tServer } from '@/i18n/server';
import type { ProductsResponse } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Props {
  searchParams: Record<string, string | undefined>;
}

async function getProducts(
  params: Record<string, string | undefined>
): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  try {
    const res = await fetch(`${API}/products?${qs.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return { products: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } };
    }
    return (await res.json()) as ProductsResponse;
  } catch {
    return { products: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } };
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const data = await getProducts(searchParams);
  const page = data.pagination.page;

  const title = searchParams.onSale
    ? tServer('catalog.sale')
    : searchParams.category
      ? searchParams.category
      : searchParams.q
        ? `“${searchParams.q}”`
        : tServer('catalog.menu');

  return (
    <div className="bg-canvas-cream">
      <div className="page-shell section-pad !pb-10">
        <p className="eyebrow">{tServer('catalog.eyebrow')}</p>
        <h1 className="section-title mt-3">{title}</h1>
        <p className="mt-3 text-shade-50">
          {tServer('catalog.count', { n: data.pagination.total })}
        </p>

        <div className="mt-10">
          <Suspense
            fallback={<div className="h-24 animate-pulse rounded-xl bg-shade-30/50" />}
          >
            <SearchFilterBar />
          </Suspense>
        </div>
      </div>

      <div className="page-shell pb-24">
        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {data.products.length === 0 && (
          <div className="rounded-xl bg-pistachio-10 px-8 py-16 text-center">
            <p className="font-display text-2xl font-light">{tServer('catalog.empty')}</p>
            <p className="mt-2 text-shade-60">{tServer('catalog.emptyHint')}</p>
            <Link href="/products" className="btn-primary mt-8 inline-flex">
              {tServer('catalog.emptyCta')}
            </Link>
          </div>
        )}

        {data.pagination.pages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link
                href={`/products?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(searchParams).filter(([, v]) => v)
                  ),
                  page: String(page - 1),
                }).toString()}`}
                className="btn-outline-light"
              >
                {tServer('common.prev')}
              </Link>
            )}
            <span className="text-sm text-shade-50">
              {page} / {data.pagination.pages}
            </span>
            {page < data.pagination.pages && (
              <Link
                href={`/products?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(searchParams).filter(([, v]) => v)
                  ),
                  page: String(page + 1),
                }).toString()}`}
                className="btn-outline-light"
              >
                {tServer('common.next')}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
