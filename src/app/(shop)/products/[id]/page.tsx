import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Product } from '@/types';
import { getServerLocale, tServer } from '@/i18n/server';
import { pickLocale } from '@/lib/localized';
import RatingStars from '@/components/RatingStars';
import ReviewList from '@/components/ReviewList';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import WishlistButton from '@/components/WishlistButton';
import RecentlyViewed from '@/components/RecentlyViewed';
import AddToCartButton from './AddToCartButton';
import TrackProductView from './TrackProductView';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Props {
  params: { id: string };
}

async function getProduct(id: string): Promise<{
  product: Product;
  related: Product[];
} | null> {
  try {
    const res = await fetch(`${API}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as { product: Product; related: Product[] };
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const data = await getProduct(params.id);
  if (!data) notFound();

  const { product, related } = data;
  const locale = getServerLocale();
  const name = pickLocale(product.name, locale);
  const description = pickLocale(product.description, locale);
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const nutrition =
    product.nutrition instanceof Map
      ? Object.fromEntries(product.nutrition)
      : (product.nutrition as Record<string, number>);

  return (
    <div className="section-pad mx-auto max-w-cinematic">
      <TrackProductView product={product} />
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm text-shade-60 transition hover:text-ink"
      >
        <span aria-hidden>←</span>
        {tServer('product.back')}
      </Link>
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} name={name} />

        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill-mint">{product.category}</span>
            {onSale && <span className="pill-shade">{tServer('product.onSale')}</span>}
            {product.isFeatured && (
              <span className="pill-mint">{tServer('product.featured')}</span>
            )}
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="font-display text-display-md max-md:text-4xl">
              {name}
            </h1>
            <WishlistButton productId={product._id} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-shade-50">
            <RatingStars rating={product.rating} />
            <span className="text-sm">
              {product.rating} ({tServer('product.reviews', { n: product.numReviews })})
              {product.soldCount != null && product.soldCount > 0
                ? ` · ${tServer('product.sold', { n: product.soldCount })}`
                : ''}
            </span>
          </div>
          <p className="mt-2 text-sm text-shade-50">
            {tServer('product.inStock', { n: product.stock })}
            {' · '}
            {tServer('product.sizeFrom', { ml: product.volumeMl })}
          </p>
          <p className="mt-6 text-base leading-relaxed text-shade-60">
            {description}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="pill-shade">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {Object.keys(nutrition || {}).length > 0 && (
            <div className="mt-8 rounded-lg bg-pistachio-10 p-6">
              <p className="text-xs uppercase tracking-[0.72px]">
                {tServer('product.nutrition')}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-4">
                {Object.entries(nutrition).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm capitalize text-shade-50">{k}</dt>
                    <dd className="text-lg" style={{ fontWeight: 550 }}>
                      {String(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ReviewList productId={product._id} />
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-heading-xl">{tServer('product.related')}</h2>
          <div className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      <RecentlyViewed excludeId={product._id} />
    </div>
  );
}
