'use client';

import { useEffect } from 'react';
import type { Product } from '@/types';
import { trackRecentlyViewed } from '@/components/RecentlyViewed';

export default function TrackProductView({ product }: { product: Product }) {
  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product]);
  return null;
}
