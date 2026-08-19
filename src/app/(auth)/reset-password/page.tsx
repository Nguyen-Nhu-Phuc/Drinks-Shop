'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import AuthShell from '@/components/AuthShell';
import PasswordInput from '@/components/PasswordInput';
import { apiClient } from '@/lib/apiClient';

function ResetForm() {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('auth.resetMissing'));
      return;
    }
    const parsed = z
      .object({ password: z.string().min(6, t('auth.passwordMin')) })
      .safeParse({ password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      toast.success(t('auth.resetOk'));
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.resetInvalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      lead={t('auth.resetLead')}
      lead2={t('auth.resetLead2')}
      hint={t('auth.resetHint')}
      title={t('auth.resetTitle')}
      subtitle={
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          {t('auth.forgotBack')}
        </Link>
      }
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
          {t('auth.password')}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={loading || !token}>
          {loading ? t('auth.resetSaving') : t('auth.resetSubmit')}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
