import type { ProductSize } from '@/types';

/** Sinh S/M/L mặc định từ volumeMl gốc */
export function defaultProductSizes(volumeMl: number): ProductSize[] {
  const base = Math.max(1, Math.round(volumeMl) || 350);
  return [
    { label: 'S', volumeMl: base, priceExtra: 0 },
    { label: 'M', volumeMl: Math.round(base * 1.25), priceExtra: 5000 },
    { label: 'L', volumeMl: Math.round(base * 1.5), priceExtra: 10000 },
  ];
}

export function resolveProductSizes(
  sizes: ProductSize[] | undefined | null,
  volumeMl: number
): ProductSize[] {
  if (Array.isArray(sizes) && sizes.length > 0) {
    return sizes.map((s) => ({
      label: String(s.label || '').trim() || 'M',
      volumeMl: Math.max(1, Number(s.volumeMl) || volumeMl),
      priceExtra: Math.max(0, Number(s.priceExtra) || 0),
    }));
  }
  return defaultProductSizes(volumeMl);
}

export function priceWithSize(
  basePrice: number,
  size: ProductSize | undefined
): number {
  return Math.max(0, basePrice + (size?.priceExtra ?? 0));
}

export function cartLineKey(productId: string, sizeLabel: string): string {
  return `${productId}::${sizeLabel}`;
}
