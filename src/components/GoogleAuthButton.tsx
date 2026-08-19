'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/context/LocaleContext';
import { useToast } from '@/context/ToastContext';
import LegalAgreeCopy from '@/components/LegalAgreeCopy';

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

type Props = {
  mode: 'login' | 'register';
  disabled?: boolean;
  onAccessToken: (accessToken: string) => Promise<void>;
};

function GoogleLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src="https://accounts.google.com/gsi/client"]'
  );
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không tải được Google SDK'));
    document.head.appendChild(script);
  });
}

export default function GoogleAuthButton({
  mode,
  disabled,
  onAccessToken,
}: Props) {
  const t = useT();
  const toast = useToast();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const tokenClient = useRef<TokenClient | null>(null);
  const pending = useRef<((token: string) => Promise<void>) | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'idle' | 'consent'>('idle');
  const [shareData, setShareData] = useState(false);

  pending.current = onAccessToken;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    void loadGisScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.oauth2) return;
        tokenClient.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          enable_granular_consent: true,
          callback: (response) => {
            const accessToken = response.access_token;
            if (response.error || !accessToken) {
              setBusy(false);
              return;
            }
            void (async () => {
              try {
                await pending.current?.(accessToken);
              } finally {
                setBusy(false);
              }
            })();
          },
          error_callback: () => {
            setBusy(false);
          },
        });
      })
      .catch(() => {
        tokenClient.current = null;
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const openConsent = useCallback(() => {
    if (busy || disabled) return;
    if (!clientId || !tokenClient.current) {
      toast.error(t('auth.googleNotConfigured'));
      return;
    }
    setShareData(false);
    setStep('consent');
  }, [busy, clientId, disabled, t, toast]);

  const cancelConsent = useCallback(() => {
    if (busy) return;
    setStep('idle');
    setShareData(false);
  }, [busy]);

  const continueToGoogle = useCallback(() => {
    if (busy || disabled) return;
    if (!shareData) {
      toast.error(t('auth.googleNeedConsent'));
      return;
    }
    if (!tokenClient.current) {
      toast.error(t('auth.googleNotConfigured'));
      return;
    }
    setBusy(true);
    tokenClient.current.requestAccessToken({ prompt: 'select_account consent' });
  }, [busy, disabled, shareData, t, toast]);

  const ctaLabel =
    mode === 'register' ? t('auth.googleRegister') : t('auth.googleLogin');

  if (step === 'consent') {
    return (
      <div className="rounded-2xl border border-hairline-light bg-canvas-light p-5">
        <div className="flex items-center gap-3">
          <GoogleLogo className="h-6 w-6" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-shade-40">
              Google
            </p>
            <h2 className="text-[17px] font-medium tracking-tight text-ink">
              {t('auth.googleConsentTitle')}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-shade-60">
          {t('auth.googleConsentLead')}
        </p>
        <ul className="mt-3 space-y-2 text-[14px] text-ink">
          <li className="flex gap-2">
            <span className="text-shade-40">·</span>
            {t('auth.googleConsentEmail')}
          </li>
          <li className="flex gap-2">
            <span className="text-shade-40">·</span>
            {t('auth.googleConsentProfile')}
          </li>
        </ul>
        <p className="mt-3 text-[13px] leading-relaxed text-shade-50">
          {t('auth.googleConsentNext')}
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-[14px] leading-snug text-ink">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
            checked={shareData}
            disabled={busy}
            onChange={(e) => setShareData(e.target.checked)}
          />
          <span>
            <LegalAgreeCopy prefixKey="auth.googleConsentAgree" />
          </span>
        </label>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn-outline-light"
            onClick={cancelConsent}
            disabled={busy}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={continueToGoogle}
            disabled={busy || !shareData}
          >
            {busy ? t('auth.googleLoading') : t('auth.googleContinue')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openConsent}
      disabled={disabled || busy}
      className="btn-google"
      aria-label={ctaLabel}
    >
      <GoogleLogo />
      <span>{ctaLabel}</span>
    </button>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            enable_granular_consent?: boolean;
            callback: (response: {
              access_token?: string;
              error?: string;
            }) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}
