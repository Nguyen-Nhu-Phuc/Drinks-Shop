'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSite } from '@/context/SiteContext';
import { useLocale, useT } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { pickLocale } from '@/lib/localized';
import SearchSuggest from '@/components/SearchSuggest';
import ThemeLocaleControls from '@/components/ThemeLocaleControls';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const { site } = useSite();
  const { theme } = useTheme();
  const t = useT();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === '/';
  /**
   * Dark chrome (white text) only in dark theme on home.
   * Light theme always uses a solid light bar + dark text — avoids
   * invisible white text over cream sections.
   */
  const darkChrome = isHome && theme === 'dark';
  const navLinks = site?.navLinks?.filter((l) => l.enabled) ?? [];
  const brandName = pickLocale(site?.brandName, locale, 'Drinks');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const headerClass = darkChrome
    ? scrolled
      ? 'bg-canvas-night/95 text-on-night backdrop-blur-md border-b border-white/10'
      : 'bg-transparent text-on-night'
    : 'bg-canvas-light text-ink border-b border-hairline-light shadow-[0_1px_0_rgb(var(--hairline-light)),0_10px_28px_-14px_rgba(0,0,0,0.18)] backdrop-blur-md';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="page-shell flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-[1.35rem] font-medium tracking-[-0.03em] transition-opacity hover:opacity-70"
        >
          {site?.logoUrl ? (
            <span className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-current/15">
              <Image
                src={site.logoUrl}
                alt={brandName}
                fill
                className="object-cover"
                sizes="32px"
              />
            </span>
          ) : null}
          {brandName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => {
            const label = pickLocale(l.label, locale);
            return (
            <Link
              key={`${l.href}-${label}`}
              href={l.href}
              className={`relative text-[13px] font-medium tracking-wide transition-colors hover:opacity-100 ${
                darkChrome ? 'text-on-night/75 hover:text-on-night' : 'text-shade-60 hover:text-ink'
              }`}
            >
              {label}
              {l.href.includes('wishlist') && wishCount > 0 && (
                <span className={darkChrome ? 'ml-1 text-on-night/45' : 'ml-1 text-shade-40'}>
                  {wishCount}
                </span>
              )}
            </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`text-[13px] font-medium tracking-wide transition-colors ${
                darkChrome ? 'text-on-night/75 hover:text-on-night' : 'text-shade-60 hover:text-ink'
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
        </nav>

        <div className="hidden flex-1 justify-center px-6 xl:flex">
          <div className="w-full max-w-xs">
            <SearchSuggest dark={darkChrome} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <ThemeLocaleControls darkSurface={darkChrome} />
          </div>

          <Link
            href="/cart"
            className={`relative inline-flex h-10 items-center gap-2 rounded-pill px-3 text-[13px] font-medium transition-colors ${
              darkChrome
                ? 'text-on-night hover:bg-white/10'
                : 'text-ink hover:bg-shade-30/60'
            }`}
            aria-label={t('nav.cart')}
          >
            <span className="hidden sm:inline">{t('nav.cart')}</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-[11px] font-semibold ${
                darkChrome
                  ? 'bg-on-night text-canvas-night'
                  : 'bg-ink text-on-primary'
              }`}
            >
              {totalItems}
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link
                  href="/account"
                  className={
                    darkChrome
                      ? 'btn-outline-dark !h-10 !min-h-0 !px-4 !py-0 text-[13px]'
                      : 'btn-outline-light !h-10 !min-h-0 !px-4 !py-0 text-[13px]'
                  }
                >
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className={`text-[13px] font-medium transition ${
                    darkChrome
                      ? 'text-on-night/55 hover:text-on-night'
                      : 'text-shade-50 hover:text-ink'
                  }`}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-[13px] font-medium transition ${
                    darkChrome
                      ? 'text-on-night/75 hover:text-on-night'
                      : 'text-shade-60 hover:text-ink'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className={
                    darkChrome
                      ? 'btn-outline-dark !h-10 !min-h-0 !px-5 !py-0 text-[13px]'
                      : 'btn-primary !h-10 !min-h-0 !px-5 !py-0 text-[13px]'
                  }
                >
                  {t('nav.join')}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-pill transition lg:hidden ${
              darkChrome ? 'hover:bg-white/10' : 'hover:bg-shade-30/60'
            }`}
            aria-label={t('nav.menu')}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${open ? 'translate-y-[3.5px] rotate-45' : ''}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${open ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div
          className={`animate-float-in border-t px-6 py-6 lg:hidden ${
            darkChrome
              ? 'border-white/10 bg-canvas-night text-on-night'
              : 'border-hairline-light bg-canvas-light text-ink'
          }`}
        >
          <div className="mb-4 sm:hidden">
            <ThemeLocaleControls darkSurface={darkChrome} />
          </div>
          <div className="mb-6">
            <SearchSuggest dark={darkChrome} />
          </div>
          <div className="flex flex-col gap-4">
            {navLinks.map((l) => {
              const label = pickLocale(l.label, locale);
              return (
              <Link
                key={`${l.href}-${label}`}
                href={l.href}
                className="font-display text-2xl font-light tracking-tight"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
              );
            })}
            {user ? (
              <>
                <Link
                  href="/account"
                  className="font-display text-2xl font-light"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.account')}
                </Link>
                <button
                  type="button"
                  className={`text-left font-display text-2xl font-light ${
                    darkChrome ? 'text-on-night/50' : 'text-shade-50'
                  }`}
                  onClick={() => void logout()}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="font-display text-2xl font-light"
                onClick={() => setOpen(false)}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
