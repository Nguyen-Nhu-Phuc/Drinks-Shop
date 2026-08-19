'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import PasswordInput from '@/components/PasswordInput';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import AuthShell from '@/components/AuthShell';

function LoginForm() {
  const t = useT();
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      email: z.string().email(t('auth.emailInvalid')),
      password: z.string().min(1, t('auth.passwordRequired')),
    });
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('auth.loginOk'));
      router.push(redirect);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.loginFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      lead={t('auth.loginLead')}
      lead2={t('auth.loginLead2')}
      hint={t('auth.loginHint')}
      title={t('auth.loginTitle')}
      subtitle={
        <>
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="font-medium text-ink underline underline-offset-4">
            {t('auth.registerLink')}
          </Link>
        </>
      }
    >
      <div className="mt-8 space-y-5">
        <GoogleAuthButton
          mode="login"
          disabled={loading}
          onAccessToken={async (accessToken) => {
            setLoading(true);
            try {
              const { isNewUser } = await loginWithGoogle(accessToken);
              toast.success(isNewUser ? t('auth.registerOk') : t('auth.loginOk'));
              if (isNewUser) toast.info(t('auth.googleWelcomeMail'));
              router.push(redirect);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : t('auth.loginFail'));
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
          <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
            {t('auth.password')}
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <p className="text-right text-[13px]">
            <Link
              href="/forgot-password"
              className="font-medium text-ink underline underline-offset-4"
            >
              {t('auth.forgotLink')}
            </Link>
          </p>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.loginTitle')}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
