'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';

interface Props {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: Props) {
  const t = useT();
  const { user } = useAuth();
  const { ids, toggle } = useWishlist();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const active = ids.has(productId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info(t('wishlist.loginPrompt'));
      router.push('/login?redirect=/wishlist');
      return;
    }
    setBusy(true);
    try {
      const added = await toggle(productId);
      toast.success(added ? t('wishlist.addedToast') : t('wishlist.removedToast'));
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={active ? t('wishlist.remove') : t('wishlist.add')}
      disabled={busy}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-pill border border-hairline-light bg-canvas-light text-base text-ink shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur transition hover:scale-105 hover:border-ink/25 active:scale-95 ${className}`}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}
