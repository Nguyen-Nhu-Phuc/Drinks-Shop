'use client';

import Link from 'next/link';
import { useT } from '@/context/LocaleContext';

export default function LegalAgreeCopy({ prefixKey }: { prefixKey: string }) {
  const t = useT();
  const linkClass = 'font-medium text-ink underline underline-offset-4';
  return (
    <span>
      {t(prefixKey)}{' '}
      <Link href="/terms" className={linkClass} onClick={(e) => e.stopPropagation()}>
        {t('legal.terms')}
      </Link>{' '}
      {t('auth.and')}{' '}
      <Link href="/privacy" className={linkClass} onClick={(e) => e.stopPropagation()}>
        {t('legal.privacy')}
      </Link>
    </span>
  );
}
