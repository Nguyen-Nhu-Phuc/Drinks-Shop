'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiClient, formatVnd } from '@/lib/apiClient';
import { useT } from '@/context/LocaleContext';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';

function SuccessContent() {
  const t = useT();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    void apiClient
      .get<Order>('/payments/session', { params: { session_id: sessionId } })
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null));
  }, [sessionId]);

  return (
    <div className="section-pad mx-auto max-w-reading text-center">
      <div className="rounded-lg bg-aloe-10 p-12 animate-fade-up">
        <h1 className="font-display text-display-md max-md:text-4xl">
          {t('checkoutSuccess.title')}
        </h1>
        <p className="mt-4 text-shade-60">
          {t('checkoutSuccess.body')}
          {(order?.orderNumber || orderNumber) && (
            <>
              {' '}
              <strong>{order?.orderNumber || orderNumber}</strong>
            </>
          )}
        </p>
        {order && (
          <div className="mt-6 space-y-2 text-sm text-shade-60">
            <p>{ORDER_STATUS_LABELS[order.status]}</p>
            <p>{formatVnd(order.total)}</p>
            <p>{order.deliverySlot}</p>
          </div>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/account/orders" className="btn-primary">
            {t('checkoutSuccess.orders')}
          </Link>
          <Link href="/" className="btn-outline-light">
            {t('checkoutSuccess.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function SuccessFallback() {
  const t = useT();
  return <div className="section-pad text-center">{t('common.loading')}</div>;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
