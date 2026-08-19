import Link from 'next/link';
import { tServer } from '@/i18n/server';

export default function NotFound() {
  return (
    <div className="section-pad mx-auto max-w-reading text-center">
      <p className="eyebrow">{tServer('notFound.eyebrow')}</p>
      <h1 className="section-title mt-2">{tServer('notFound.title')}</h1>
      <p className="mt-4 text-shade-50">{tServer('notFound.body')}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          {tServer('notFound.home')}
        </Link>
        <Link href="/products" className="btn-outline-light">
          {tServer('notFound.menu')}
        </Link>
      </div>
    </div>
  );
}
