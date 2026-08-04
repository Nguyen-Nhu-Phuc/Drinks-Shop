'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';

function LoginForm() {
  const t = useT();
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
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
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="hidden bg-canvas-night lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="font-display text-2xl font-medium tracking-tight text-on-night">
          Drinks
        </Link>
        <div>
          <p className="font-display text-5xl font-light leading-tight tracking-tight text-on-night">
            {t('auth.loginLead')}
            <br />
            {t('auth.loginLead2')}
          </p>
          <p className="mt-4 max-w-sm text-link-cool-1">
            {t('auth.loginHint')}
          </p>
        </div>
        <p className="text-xs text-link-cool-3">Fresh · Fast · Local</p>
      </div>
      <div className="flex items-center px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <p className="eyebrow lg:hidden">Account</p>
          <h1 className="section-title mt-2">{t('auth.loginTitle')}</h1>
          <p className="mt-3 text-shade-50">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="font-medium text-ink underline underline-offset-2">
              {t('auth.registerLink')}
            </Link>
          </p>
          <form onSubmit={submit} className="mt-10 space-y-4">
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
              {t('auth.email')}
              <input
                type="email"
                className="input-field mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
              {t('auth.password')}
              <input
                type="password"
                className="input-field mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? t('auth.loggingIn') : t('auth.loginTitle')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
