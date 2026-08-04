'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { formatVnd, getEffectivePrice } from '@/lib/apiClient';
import { useLocale, useT } from '@/context/LocaleContext';
import { pickLocale } from '@/lib/localized';
import WishlistButton from './WishlistButton';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const name = pickLocale(product.name, locale);
  const price = getEffectivePrice(product);
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const pct = onSale
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0;

  return (
    <article className="group relative">
      <div className="absolute right-2 top-2 z-10 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <WishlistButton productId={product._id} />
      </div>

      <Link href={`/products/${product._id}`} className="block">
        <div className="overflow-hidden rounded-lg">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0]}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            />
            {onSale && (
              <span className="absolute left-2 top-2 rounded-pill bg-aloe-10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-ink">
                −{pct}%
              </span>
            )}
            {product.stock < 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-[12px] font-medium text-on-night backdrop-blur-[2px]">
                {t('product.outOfStock')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-shade-50">
            {product.category}
            <span className="mx-1.5 text-shade-30">·</span>
            {t('product.sizeFrom', { ml: product.volumeMl })}
          </p>
          <h3 className="line-clamp-2 font-display text-base font-normal leading-snug tracking-tight text-ink transition-opacity group-hover:opacity-70">
            {name}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-semibold tracking-tight text-ink">
              {formatVnd(price)}
            </p>
            {onSale && (
              <p className="text-xs text-shade-40 line-through">
                {formatVnd(product.price)}
              </p>
            )}
          </div>
          {product.rating > 0 && (
            <p className="text-[11px] text-shade-50">
              ★ {product.rating.toFixed(1)}
              <span className="text-shade-40"> ({product.numReviews})</span>
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
