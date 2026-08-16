'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Roboto } from 'next/font/google';
import { useT } from '@/context/LocaleContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

const roboto = Roboto({
  subsets: ['latin', 'latin-ext'],
  weight: '500',
  display: 'swap',
});

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

type Props = {
  mode: 'login' | 'register';
  disabled?: boolean;
  onAccessToken: (accessToken: string) => Promise<void>;
};

function GoogleLogo() {
  return (
    <svg className="gsi-icon" viewBox="0 0 48 48" aria-hidden>
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
      <path fill="none" d="M0 0h48v48H0z" />
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
  const { theme } = useTheme();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const tokenClient = useRef<TokenClient | null>(null);
  const pending = useRef<((token: string) => Promise<void>) | null>(null);
  const [busy, setBusy] = useState(false);

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
          callback: (response) => {
            if (response.error || !response.access_token) {
              setBusy(false);
              return;
            }
            void (async () => {
              try {
                await pending.current?.(response.access_token);
              } finally {
                setBusy(false);
              }
            })();
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

  const click = useCallback(() => {
    if (busy || disabled) return;
    if (!clientId || !tokenClient.current) {
      toast.error(t('auth.googleNotConfigured'));
      return;
    }
    setBusy(true);
    tokenClient.current.requestAccessToken({ prompt: '' });
  }, [busy, clientId, disabled, t, toast]);

  const label = busy
    ? t('auth.googleLoading')
    : mode === 'register'
      ? t('auth.googleRegister')
      : t('auth.googleLogin');

  return (
    <button
      type="button"
      onClick={click}
      disabled={disabled || busy}
      className={`gsi-material-button ${theme === 'dark' ? 'gsi-material-button-dark' : ''} ${roboto.className}`}
      aria-label={label}
    >
      <div className="gsi-material-button-state" />
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <GoogleLogo />
        </div>
        <span className="gsi-material-button-contents">{label}</span>
        <span className="gsi-material-button-contents-hidden">{label}</span>
      </div>
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
            callback: (response: {
              access_token?: string;
              error?: string;
            }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}
