import { CmsHomeSections } from '@/components/cms/CmsHomeSections';
import type { PublicSite } from '@/types/site';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getSite(): Promise<PublicSite | null> {
  try {
    const res = await fetch(`${API}/site/public`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as PublicSite;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const site = await getSite();
  const sections = site?.homeSections ?? [];

  if (sections.length === 0) {
    return (
      <div className="section-pad page-shell text-center">
        <p className="eyebrow">CMS</p>
        <h1 className="section-title mt-3">Chưa có layout</h1>
        <p className="mt-4 text-shade-50">
          Vào Admin → Giao diện để kéo thả và xuất bản trang chủ.
        </p>
      </div>
    );
  }

  return <CmsHomeSections sections={sections} />;
}
