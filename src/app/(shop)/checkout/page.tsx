'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import { apiClient, formatVnd } from '@/lib/apiClient';
import { DELIVERY_SLOTS } from '@/types';

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(9),
  street: z.string().min(3),
  ward: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
});

export default function CheckoutPage() {
  const t = useT();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: 'TP. Hồ Chí Minh',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.address) {
      setForm({
        fullName: user.address.fullName,
        phone: user.address.phone,
        street: user.address.street,
        ward: user.address.ward,
        district: user.address.district,
        city: user.address.city,
      });
    } else if (user) {
      setForm((f) => ({ ...f, fullName: user.name }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.replace('/cart');
    }
  }, [items, authLoading, router]);

  const shipping = subtotal >= 300000 ? 0 : 25000;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const { data } = await apiClient.post<{
        code: string;
        discount: number;
        description: string;
      }>('/coupons/validate', {
        code: couponInput.trim(),
        subtotal,
      });
      setCouponCode(data.code);
      setDiscount(data.discount);
      toast.success(
        t('checkout.couponOk', {
          code: data.code,
          amount: formatVnd(data.discount),
        })
      );
    } catch (err) {
      setCouponCode('');
      setDiscount(0);
      toast.error(err instanceof Error ? err.message : t('checkout.couponBad'));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(t('checkout.addressError'));
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post<{ url: string }>(
        '/payments/checkout',
        {
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            sizeLabel: i.sizeLabel,
          })),
          shippingAddress: parsed.data,
          deliverySlot,
          couponCode: couponCode || undefined,
          note: note || undefined,
        }
      );
      clearCart();
      toast.success(t('checkout.redirect'));
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('checkout.payError'));
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="section-pad text-center text-shade-50">{t('common.loading')}</div>
    );
  }

  const addressFields = [
    ['fullName', 'checkout.fullName'],
    ['phone', 'checkout.phone'],
    ['street', 'checkout.street'],
    ['ward', 'checkout.ward'],
    ['district', 'checkout.district'],
    ['city', 'checkout.city'],
  ] as const;

  return (
    <div className="section-pad mx-auto max-w-cinematic">
      <h1 className="font-display text-display-md max-md:text-4xl">{t('checkout.title')}</h1>
      <form
        onSubmit={submit}
        className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6">
          <fieldset className="space-y-4 rounded-lg border border-hairline-light bg-canvas-light p-6">
            <legend className="font-display text-heading-md px-2">
              {t('checkout.address')}
            </legend>
            {addressFields.map(([key, labelKey]) => (
              <label key={key} className="block text-sm text-shade-50">
                {t(labelKey)}
                <input
                  className="input-field mt-1"
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  required
                />
              </label>
            ))}
          </fieldset>

          <fieldset className="rounded-lg border border-hairline-light bg-canvas-light p-6">
            <legend className="font-display text-heading-md px-2">
              {t('checkout.slot')}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DELIVERY_SLOTS.map((slot) => (
                <label
                  key={slot}
                  className={`cursor-pointer rounded-pill border px-4 py-3 text-sm ${
                    deliverySlot === slot
                      ? 'border-ink bg-aloe-10'
                      : 'border-hairline-light'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot"
                    className="sr-only"
                    checked={deliverySlot === slot}
                    onChange={() => setDeliverySlot(slot)}
                  />
                  {slot}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-hairline-light bg-canvas-light p-6">
            <legend className="font-display text-heading-md px-2">
              {t('checkout.coupon')}
            </legend>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="VD: DRINKS10"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="btn-outline-light shrink-0"
                onClick={() => void applyCoupon()}
              >
                {t('checkout.apply')}
              </button>
            </div>
            <textarea
              className="input-field min-h-[80px]"
              placeholder={t('checkout.note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </fieldset>
        </div>

        <aside className="h-fit rounded-lg border border-hairline-light bg-canvas-light p-8 shadow-card-light">
          <h2 className="font-display text-heading-xl">{t('checkout.order')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="text-shade-60">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatVnd(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-hairline-light pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-shade-50">{t('cart.subtotal')}</dt>
              <dd>{formatVnd(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-shade-60">
                <dt>
                  {t('checkout.discount')} ({couponCode})
                </dt>
                <dd>−{formatVnd(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-shade-50">{t('cart.shipping')}</dt>
              <dd>{shipping === 0 ? t('cart.free') : formatVnd(shipping)}</dd>
            </div>
            <div
              className="flex justify-between pt-2 text-base"
              style={{ fontWeight: 550 }}
            >
              <dt>{t('cart.total')}</dt>
              <dd>{formatVnd(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            className="btn-primary mt-6 w-full"
            disabled={loading}
          >
            {loading ? t('checkout.paying') : t('checkout.pay')}
          </button>
        </aside>
      </form>
    </div>
  );
}
