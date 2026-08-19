import Link from 'next/link';
import { tServer } from '@/i18n/server';

type Props = {
  titleKey: string;
  leadKey: string;
  paragraphs: string[];
};

export default function LegalPage({ titleKey, leadKey, paragraphs }: Props) {
  return (
    <div className="section-pad mx-auto max-w-reading">
      <p className="eyebrow">{tServer('legal.updated')}</p>
      <h1 className="section-title mt-2">{tServer(titleKey)}</h1>
      <p className="mt-3 text-shade-50">{tServer(leadKey)}</p>
      <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-shade-70">
        {paragraphs.map((key) => (
          <p key={key}>{tServer(key)}</p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/products" className="btn-primary">
          {tServer('notFound.menu')}
        </Link>
        <Link href="/" className="btn-outline-light">
          {tServer('notFound.home')}
        </Link>
      </div>
    </div>
  );
}
