'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import AuthShell from '@/components/AuthShell';
import { apiClient } from '@/lib/apiClient';

export default function ForgotPasswordPage() {
  const t = useT();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z
      .object({ email: z.string().email(t('auth.emailInvalid')) })
      .safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      toast.success(t('auth.forgotOk'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.forgotOk'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      lead={t('auth.forgotLead')}
      lead2={t('auth.forgotLead2')}
      hint={t('auth.forgotHint')}
      title={t('auth.forgotTitle')}
      subtitle={
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          {t('auth.forgotBack')}
        </Link>
      }
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
          {t('auth.email')}
          <input
            type="email"
            className="input-field mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t('auth.forgotSending') : t('auth.forgotSubmit')}
        </button>
      </form>
    </AuthShell>
  );
}
