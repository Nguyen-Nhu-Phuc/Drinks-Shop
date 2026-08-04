'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useT } from '@/context/LocaleContext';
import { useConfirm } from '@/context/ConfirmContext';
import { formatVnd } from '@/lib/apiClient';

export default function CartPage() {
  const t = useT();
  const confirm = useConfirm();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const shipping = subtotal >= 300000 || subtotal === 0 ? 0 : 25000;

  const handleRemove = async (lineId: string) => {
    const ok = await confirm({
      title: t('cart.removeConfirm'),
      description: t('cart.removeDescription'),
      confirmLabel: t('cart.removeAction'),
      cancelLabel: t('common.cancel'),
      variant: 'danger',
    });
    if (!ok) return;
    removeItem(lineId);
  };

  if (items.length === 0) {
    return (
      <div className="section-pad mx-auto max-w-reading text-center">
        <h1 className="font-display text-display-md max-md:text-4xl">{t('cart.title')}</h1>
        <p className="mt-4 text-shade-50">{t('cart.empty')}</p>
        <Link href="/products" className="btn-primary mt-8 inline-flex">
          {t('cart.continue')}
        </Link>
      </div>
    );
  }

  return (
    <div className="section-pad mx-auto max-w-cinematic">
      <h1 className="font-display text-display-md max-md:text-4xl">{t('cart.title')}</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-6">
          {items.map((item) => (
            <li
              key={item.lineId}
              className="flex gap-4 border-b border-hairline-light pb-6"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-canvas-night">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-display text-heading-md hover:opacity-70"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-shade-50">
                  {t('cart.sizeLine', {
                    size: item.sizeLabel,
                    ml: String(item.volumeMl),
                  })}
                  {' · '}
                  {formatVnd(item.price)}
                </p>
                <div className="mt-auto flex items-center gap-4 pt-3">
                  <div className="flex items-center rounded-pill border border-hairline-light">
                    <button
                      type="button"
                      className="px-3 py-1"
                      onClick={() =>
                        updateQuantity(item.lineId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-3 py-1"
                      onClick={() =>
                        updateQuantity(item.lineId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-shade-50 underline"
                    onClick={() => void handleRemove(item.lineId)}
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              </div>
              <p className="text-right" style={{ fontWeight: 550 }}>
                {formatVnd(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-hairline-light bg-canvas-light p-8 shadow-card-light">
          <h2 className="font-display text-heading-xl">{t('cart.summary')}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-shade-50">{t('cart.subtotal')}</dt>
              <dd>{formatVnd(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-shade-50">{t('cart.shipping')}</dt>
              <dd>{shipping === 0 ? t('cart.free') : formatVnd(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-hairline-light pt-3 text-base" style={{ fontWeight: 550 }}>
              <dt>{t('cart.total')}</dt>
              <dd>{formatVnd(subtotal + shipping)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-shade-50">
            {t('cart.freeshipNote')}
          </p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            {t('cart.checkout')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
