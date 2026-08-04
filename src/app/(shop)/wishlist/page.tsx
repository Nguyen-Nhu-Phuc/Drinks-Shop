'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useT } from '@/context/LocaleContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const t = useT();
  const { user, loading: authLoading } = useAuth();
  const { products, loading, refresh } = useWishlist();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/wishlist');
    } else if (user) {
      void refresh().finally(() => setReady(true));
    }
  }, [user, authLoading, router, refresh]);

  if (authLoading || !user || !ready) {
    return (
      <div className="section-pad text-center text-shade-50">{t('common.loading')}</div>
    );
  }

  return (
    <div className="section-pad mx-auto max-w-cinematic">
      <h1 className="mt-2 font-display text-display-md max-md:text-4xl">
        {t('wishlist.title')}
      </h1>
      <p className="mt-3 text-shade-50">
        {t('wishlist.count', { n: products.length })}
      </p>

      {loading ? (
        <p className="mt-10 text-shade-50">{t('common.loading')}</p>
      ) : products.length === 0 ? (
        <div className="mt-12 rounded-lg bg-pistachio-10 p-10 text-center">
          <p className="text-shade-60">{t('wishlist.empty')}</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            {t('wishlist.explore')}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
