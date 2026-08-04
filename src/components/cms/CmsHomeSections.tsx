import type { Product, ProductsResponse } from '@/types';
import type { PageSection } from '@/types/site';
import CmsSectionsView, {
  type CategoryStat,
  type CouponPublic,
} from '@/components/cms/CmsSectionsView';
import { str, num } from '@/lib/cmsConfig';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getProducts(params: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?${params}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ProductsResponse;
    return data.products;
  } catch {
    return [];
  }
}

async function getCategories(): Promise<CategoryStat[]> {
  try {
    const res = await fetch(`${API}/products/categories/stats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as CategoryStat[];
  } catch {
    return [];
  }
}

async function getCoupons(): Promise<CouponPublic[]> {
  try {
    const res = await fetch(`${API}/coupons/public`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as CouponPublic[];
  } catch {
    return [];
  }
}

export async function CmsHomeSections({
  sections,
}: {
  sections: PageSection[];
}) {
  const enabled = sections.filter((s) => s.enabled);
  const needsCategories = enabled.some((s) => s.type === 'categories');
  const needsCoupons = enabled.some(
    (s) =>
      s.type === 'couponBanner' ||
      (s.type === 'marquee' && s.config.mode === 'coupons')
  );

  const [categories, coupons] = await Promise.all([
    needsCategories ? getCategories() : Promise.resolve([] as CategoryStat[]),
    needsCoupons ? getCoupons() : Promise.resolve([] as CouponPublic[]),
  ]);

  const productSections = enabled.filter((s) => s.type === 'productGrid');
  const productResults = await Promise.all(
    productSections.map(async (s) => {
      const source = str(s.config, 'source', 'featured');
      const limit = num(s.config, 'limit', 6);
      let params = `limit=${limit}`;
      if (source === 'featured') params = `featured=true&limit=${limit}`;
      else if (source === 'sale') params = `onSale=true&limit=${limit}&sort=rating`;
      else if (source === 'bestseller') params = `sort=bestseller&limit=${limit}`;
      else if (source === 'newest') params = `sort=newest&limit=${limit}`;
      else if (source === 'manual') {
        const ids = Array.isArray(s.config.productIds)
          ? (s.config.productIds as string[])
          : [];
        if (ids.length === 0) return { id: s.id, products: [] as Product[] };
        const all = await getProducts(`limit=50&sort=newest`);
        return {
          id: s.id,
          products: ids
            .map((pid) => all.find((p) => p._id === pid))
            .filter(Boolean) as Product[],
        };
      }
      return { id: s.id, products: await getProducts(params) };
    })
  );
  const productsBySection = Object.fromEntries(
    productResults.map((r) => [r.id, r.products])
  );

  return (
    <CmsSectionsView
      sections={sections}
      categories={categories}
      coupons={coupons}
      productsBySection={productsBySection}
    />
  );
}
