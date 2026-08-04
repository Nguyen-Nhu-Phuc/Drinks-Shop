'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';

export default function RegisterPage() {
  const t = useT();
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      router.push('/account');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.registerFail'));
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
            {t('auth.registerLead')}
            <br />
            {t('auth.registerLead2')}
          </p>
          <p className="mt-4 max-w-sm text-link-cool-1">
            {t('auth.registerHint')}
          </p>
        </div>
        <p className="text-xs text-link-cool-3">Fresh · Fast · Local</p>
      </div>
      <div className="flex items-center px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <p className="eyebrow lg:hidden">Account</p>
          <h1 className="section-title mt-2">{t('auth.registerTitle')}</h1>
          <p className="mt-3 text-shade-50">
            {t('auth.hasAccount')}{' '}
            <Link href="/login" className="font-medium text-ink underline underline-offset-2">
              {t('auth.loginLink')}
            </Link>
          </p>
          <form onSubmit={submit} className="mt-10 space-y-4">
            {(
              [
                ['name', 'auth.name', 'text'],
                ['email', 'auth.email', 'email'],
                ['password', 'auth.password', 'password'],
              ] as const
            ).map(([key, labelKey, type]) => (
              <label
                key={key}
                className="block text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50"
              >
                {t(labelKey)}
                <input
                  type={type}
                  className="input-field mt-1.5"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                />
              </label>
            ))}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? t('auth.creating') : t('auth.create')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
