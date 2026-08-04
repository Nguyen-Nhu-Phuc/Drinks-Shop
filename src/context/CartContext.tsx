'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product, ProductSize } from '@/types';
import { getEffectivePrice } from '@/lib/apiClient';
import { useLocale } from '@/context/LocaleContext';
import { pickLocale } from '@/lib/localized';
import {
  cartLineKey,
  priceWithSize,
  resolveProductSizes,
} from '@/lib/productSizes';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size: ProductSize, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'drinks-cart-v2';

function migrateLegacyItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item as Partial<CartItem> & { productId?: string };
      if (!row.productId || typeof row.price !== 'number') return null;
      const sizeLabel = row.sizeLabel || 'M';
      const volumeMl = row.volumeMl || 0;
      const lineId = row.lineId || cartLineKey(row.productId, sizeLabel);
      return {
        lineId,
        productId: row.productId,
        name: String(row.name || ''),
        image: String(row.image || ''),
        price: row.price,
        quantity: Number(row.quantity) || 1,
        stock: Number(row.stock) || 99,
        sizeLabel,
        volumeMl,
      } satisfies CartItem;
    })
    .filter((x): x is CartItem => x != null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(migrateLegacyItems(JSON.parse(raw)));
      } else {
        // migrate từ key cũ nếu có
        const legacy = localStorage.getItem('drinks-cart');
        if (legacy) {
          setItems(migrateLegacyItems(JSON.parse(legacy)));
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = (product: Product, size: ProductSize, quantity = 1) => {
    const sizes = resolveProductSizes(product.sizes, product.volumeMl);
    const selected =
      sizes.find((s) => s.label === size.label) ?? sizes[0] ?? size;
    const lineId = cartLineKey(product._id, selected.label);
    const unitPrice = priceWithSize(getEffectivePrice(product), selected);

    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId
            ? {
                ...i,
                quantity: Math.min(i.quantity + quantity, product.stock),
                price: unitPrice,
                volumeMl: selected.volumeMl,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          lineId,
          productId: product._id,
          name: pickLocale(product.name, locale),
          image: product.images[0],
          price: unitPrice,
          quantity: Math.min(quantity, product.stock),
          stock: product.stock,
          sizeLabel: selected.label,
          volumeMl: selected.volumeMl,
        },
      ];
    });
  };

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.lineId === lineId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
