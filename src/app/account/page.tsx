'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import type { Address } from '@/types';

export default function AccountPage() {
  const t = useT();
  const { user, loading, updateProfile } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/account');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.address) setAddress(user.address);
      else setAddress((a) => ({ ...a, fullName: user.name }));
    }
  }, [user]);

  if (loading || !user) {
    return <div className="section-pad text-center text-shade-50">{t('common.loading')}</div>;
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, address });
      toast.success(t('account.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('account.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const addressFields = [
    ['fullName', 'checkout.fullName'],
    ['phone', 'checkout.phone'],
    ['street', 'checkout.street'],
    ['ward', 'checkout.ward'],
    ['district', 'checkout.district'],
    ['city', 'checkout.city'],
  ] as const;

  return (
    <div className="section-pad mx-auto max-w-reading">
      <h1 className="font-display text-display-md max-md:text-4xl">
        {t('account.title')}
      </h1>
      <p className="mt-2 text-shade-50">{user.email}</p>
      <Link href="/account/orders" className="btn-outline-light mt-6 inline-flex">
        {t('account.ordersLink')}
      </Link>

      <form onSubmit={save} className="mt-10 space-y-4">
        <label className="block text-sm text-shade-50">
          {t('account.displayName')}
          <input
            className="input-field mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <p className="font-display text-heading-md pt-4">{t('account.defaultAddress')}</p>
        {addressFields.map(([key, labelKey]) => (
          <label key={key} className="block text-sm text-shade-50">
            {t(labelKey)}
            <input
              className="input-field mt-1"
              value={address[key]}
              onChange={(e) =>
                setAddress((a) => ({ ...a, [key]: e.target.value }))
              }
            />
          </label>
        ))}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t('account.saving') : t('account.save')}
        </button>
      </form>
    </div>
  );
}
