'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

interface WishlistContextValue {
  ids: Set<string>;
  products: Product[];
  loading: boolean;
  toggle: (productId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ products: Product[] }>('/wishlist');
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = async (productId: string) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để thêm yêu thích');
    }
    const { data } = await apiClient.post<{ added: boolean; count: number }>(
      '/wishlist/toggle',
      { productId }
    );
    await refresh();
    return data.added;
  };

  const ids = new Set(products.map((p) => p._id));

  return (
    <WishlistContext.Provider
      value={{
        ids,
        products,
        loading,
        toggle,
        refresh,
        count: products.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
