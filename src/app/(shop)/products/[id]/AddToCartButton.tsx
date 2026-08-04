'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLocale, useT } from '@/context/LocaleContext';
import { pickLocale } from '@/lib/localized';
import { formatVnd, getEffectivePrice } from '@/lib/apiClient';
import {
  priceWithSize,
  resolveProductSizes,
} from '@/lib/productSizes';

export default function AddToCartButton({ product }: { product: Product }) {
  const t = useT();
  const { locale } = useLocale();
  const { addItem } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  const sizes = useMemo(
    () => resolveProductSizes(product.sizes, product.volumeMl),
    [product.sizes, product.volumeMl]
  );
  const [sizeLabel, setSizeLabel] = useState(sizes[0]?.label ?? 'S');

  const selected =
    sizes.find((s) => s.label === sizeLabel) ?? sizes[0] ?? {
      label: 'S',
      volumeMl: product.volumeMl,
      priceExtra: 0,
    };

  const base = getEffectivePrice(product);
  const displayPrice = priceWithSize(base, selected);
  const onSale = product.salePrice != null && product.salePrice < product.price;

  const handle = () => {
    addItem(product, selected, qty);
    toast.success(
      t('product.addedToast', {
        name: `${pickLocale(product.name, locale)} (${selected.label})`,
      })
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-shade-50">
          {t('product.size')}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const active = s.label === selected.label;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setSizeLabel(s.label)}
                className={`min-w-[4.5rem] rounded-lg border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-ink bg-ink text-on-primary'
                    : 'border-hairline-light bg-canvas-light text-ink hover:border-ink/40'
                }`}
              >
                <span className="block text-sm" style={{ fontWeight: 550 }}>
                  {s.label}
                </span>
                <span
                  className={`block text-[11px] ${
                    active ? 'text-on-primary/70' : 'text-shade-50'
                  }`}
                >
                  {s.volumeMl} ml
                  {s.priceExtra > 0 ? ` · +${formatVnd(s.priceExtra)}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-2xl" style={{ fontWeight: 550 }}>
        {formatVnd(displayPrice)}
        {onSale && (
          <span className="ml-3 text-base text-shade-40 line-through">
            {formatVnd(priceWithSize(product.price, selected))}
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-pill border border-hairline-light">
          <button
            type="button"
            className="px-4 py-2"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            type="button"
            className="px-4 py-2"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handle}
          disabled={product.stock < 1}
        >
          {product.stock < 1 ? t('product.outOfStock') : t('product.addToCart')}
        </button>
      </div>
    </div>
  );
}
