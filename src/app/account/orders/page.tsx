'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useT } from '@/context/LocaleContext';
import { apiClient, formatVnd } from '@/lib/apiClient';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';

export default function OrdersPage() {
  const t = useT();
  const { user, loading } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await apiClient.get<Order[]>('/orders/mine');
    setOrders(data);
  };

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/account/orders');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const cancel = async (id: string) => {
    const ok = await confirm({
      title: t('orders.cancelConfirm'),
      description: t('orders.cancelDescription'),
      confirmLabel: t('orders.cancelAction'),
      cancelLabel: t('common.cancel'),
      variant: 'danger',
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await apiClient.post(`/orders/${id}/cancel`, {
        reason: 'cancelled_by_customer',
      });
      toast.success(t('orders.cancelled'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('orders.cancelFail'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading || !user) {
    return <div className="section-pad text-center text-shade-50">{t('common.loading')}</div>;
  }

  return (
    <div className="section-pad mx-auto max-w-cinematic">
      <Link href="/account" className="text-sm text-shade-50 hover:underline">
        ← {t('nav.account')}
      </Link>
      <h1 className="mt-4 font-display text-display-md max-md:text-4xl">
        {t('orders.title')}
      </h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-shade-50">{t('orders.empty')}</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((o) => (
            <li
              key={o._id}
              className="rounded-lg border border-hairline-light bg-canvas-light p-6 shadow-card-light"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-heading-md">{o.orderNumber}</p>
                  <p className="mt-1 text-sm text-shade-50">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="pill-shade">{ORDER_STATUS_LABELS[o.status]}</span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-shade-60">
                {o.items.map((item, i) => (
                  <li key={i}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-4" style={{ fontWeight: 550 }}>
                {formatVnd(o.total)}
                {o.discount ? ` (−${formatVnd(o.discount)})` : ''} ·{' '}
                {o.deliverySlot}
              </p>
              {o.couponCode && (
                <p className="mt-1 text-sm text-shade-50">{o.couponCode}</p>
              )}
              {['pending', 'paid'].includes(o.status) && (
                <button
                  type="button"
                  className="btn-outline-light mt-4 !py-2 !px-4 text-sm"
                  disabled={busyId === o._id}
                  onClick={() => void cancel(o._id)}
                >
                  {busyId === o._id ? t('orders.cancelling') : t('orders.cancel')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
