'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import PasswordInput from '@/components/PasswordInput';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import AuthShell from '@/components/AuthShell';
import LegalAgreeCopy from '@/components/LegalAgreeCopy';

export default function RegisterPage() {
  const t = useT();
  const { register, loginWithGoogle } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [legalOk, setLegalOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalOk) {
      toast.error(t('auth.legalNeed'));
      return;
    }
    const schema = z.object({
      name: z.string().min(2, t('auth.nameMin')),
      email: z.string().email(t('auth.emailInvalid')),
      password: z.string().min(6, t('auth.passwordMin')),
    });
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success(t('auth.registerOk'));
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.registerFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      lead={t('auth.registerLead')}
      lead2={t('auth.registerLead2')}
      hint={t('auth.registerHint')}
      title={t('auth.registerTitle')}
      subtitle={
        <>
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            {t('auth.loginLink')}
          </Link>
        </>
      }
    >
      <div className="mt-8 space-y-5">
        <GoogleAuthButton
          mode="register"
          disabled={loading}
          onAccessToken={async (accessToken) => {
            setLoading(true);
            try {
              const { isNewUser } = await loginWithGoogle(accessToken);
              toast.success(isNewUser ? t('auth.registerOk') : t('auth.loginOk'));
              if (isNewUser) toast.info(t('auth.googleWelcomeMail'));
              router.push('/');
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : t('auth.registerFail')
              );
            } finally {
              setLoading(false);
            }
          }}
        />
        <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-shade-40">
          <span className="h-px flex-1 bg-hairline-light" />
          {t('auth.orEmail')}
          <span className="h-px flex-1 bg-hairline-light" />
        </p>
        <form onSubmit={submit} className="space-y-4">
          {(
            [
              ['name', 'auth.name', 'text', 'name'],
              ['email', 'auth.email', 'email', 'email'],
            ] as const
          ).map(([key, labelKey, type, autoComplete]) => (
            <label
              key={key}
              className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50"
            >
              {t(labelKey)}
              <input
                type={type}
                autoComplete={autoComplete}
                className="input-field mt-1.5"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required
              />
            </label>
          ))}
          <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
            {t('auth.password')}
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-snug text-ink">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
              checked={legalOk}
              disabled={loading}
              onChange={(e) => setLegalOk(e.target.checked)}
            />
            <LegalAgreeCopy prefixKey="auth.legalAgree" />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={loading || !legalOk}>
            {loading ? t('auth.creating') : t('auth.create')}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
