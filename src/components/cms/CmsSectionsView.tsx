'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import type { PageSection, SectionCanvas } from '@/types/site';
import { formatVnd } from '@/lib/apiClient';
import { str } from '@/lib/cmsConfig';
import { useLocale, useT } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { pickLocale, type LocalizedString } from '@/lib/localized';

export interface CategoryStat {
  category: string;
  count: number;
  minPrice: number;
  image?: string;
}

export interface CouponPublic {
  code: string;
  description: LocalizedString | string;
  type: string;
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
}

function canvasClass(canvas?: SectionCanvas | string): string {
  switch (canvas) {
    case 'night':
      return 'bg-canvas-night text-on-night';
    case 'pistachio':
      return 'bg-pistachio-10 text-ink';
    case 'light':
      return 'bg-canvas-light text-ink';
    default:
      return 'bg-canvas-cream text-ink';
  }
}

interface Props {
  sections: PageSection[];
  categories: CategoryStat[];
  coupons: CouponPublic[];
  productsBySection: Record<string, Product[]>;
  compact?: boolean;
}

export default function CmsSectionsView({
  sections,
  categories,
  coupons,
  productsBySection,
  compact = false,
}: Props) {
  const enabled = sections.filter((s) => s.enabled);

  return (
    <div className={compact ? 'preview-compact' : undefined}>
      {enabled.map((section) => {
        switch (section.type) {
          case 'hero':
            return (
              <HeroSection
                key={section.id}
                config={section.config}
                compact={compact}
              />
            );
          case 'marquee':
            return (
              <MarqueeSection
                key={section.id}
                config={section.config}
                coupons={coupons}
              />
            );
          case 'categories':
            return (
              <CategoriesSection
                key={section.id}
                config={section.config}
                categories={categories}
                compact={compact}
              />
            );
          case 'productGrid':
            return (
              <ProductGridSection
                key={section.id}
                config={section.config}
                products={productsBySection[section.id] || []}
                compact={compact}
              />
            );
          case 'ctaBand':
            return (
              <CtaBandSection
                key={section.id}
                config={section.config}
                compact={compact}
              />
            );
          case 'richText':
            return (
              <RichTextSection
                key={section.id}
                config={section.config}
                compact={compact}
              />
            );
          case 'couponBanner':
            return (
              <CouponBannerSection
                key={section.id}
                config={section.config}
                coupons={coupons}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function HeroSection({
  config,
  compact,
}: {
  config: Record<string, unknown>;
  compact: boolean;
}) {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      className={`relative ${
        isDark
          ? 'grain-dark bg-canvas-night text-on-night'
          : 'bg-canvas-cream text-ink'
      } ${compact ? '' : '-mt-16 md:-mt-[72px]'}`}
    >
      <div
        className={`page-shell flex flex-col justify-end ${
          compact
            ? 'min-h-[280px] px-4 pb-6 pt-10'
            : 'min-h-[100svh] pb-10 pt-28 md:pb-14 md:pt-36'
        }`}
      >
        <div className="max-w-4xl">
          <p className={isDark ? 'eyebrow-on-dark' : 'eyebrow'}>
            {str(config, 'eyebrow', 'Fresh pour', locale)}
          </p>
          <h1
            className={`font-display font-light tracking-[-0.02em] ${
              compact
                ? 'mt-3 text-5xl leading-none'
                : 'display-hero mt-5'
            }`}
          >
            {str(config, 'brandTitle', 'Drinks', locale)}
          </h1>
          <p
            className={`max-w-md ${
              isDark ? 'text-link-cool-1' : 'text-shade-60'
            } ${compact ? 'mt-3 text-sm' : 'mt-6 text-base md:text-lg'}`}
          >
            {str(config, 'subtitle', '', locale)}
          </p>
          {str(config, 'ctaLabel', '', locale) && (
            <div className={compact ? 'mt-5' : 'mt-10'}>
              <Link
                href={str(config, 'ctaHref', '/products', locale)}
                className={isDark ? 'btn-outline-dark' : 'btn-outline-light'}
                onClick={(e) => compact && e.preventDefault()}
              >
                {str(config, 'ctaLabel', '', locale)}
              </Link>
            </div>
          )}
        </div>
      </div>
      {str(config, 'imageUrl', '', locale) && (
        <div className={`w-full overflow-hidden ${compact ? 'max-h-[200px]' : ''}`}>
          <Image
            src={str(config, 'imageUrl', '', locale)}
            alt={str(config, 'brandTitle', 'Hero', locale)}
            width={2400}
            height={1350}
            sizes="100vw"
            className={
              compact ? 'h-[200px] w-full object-cover' : 'h-auto w-full'
            }
            style={compact ? undefined : { width: '100%', height: 'auto' }}
            priority={!compact}
          />
        </div>
      )}
    </section>
  );
}

function MarqueeSection({
  config,
  coupons,
}: {
  config: Record<string, unknown>;
  coupons: CouponPublic[];
}) {
  const { locale } = useLocale();
  const mode = str(config, 'mode', 'custom', locale);
  let items: string[] = [];
  if (mode === 'coupons' && coupons.length > 0) {
    items = coupons.map((c) => {
      const deal =
        c.type === 'percent' ? `−${c.value}%` : `−${formatVnd(c.value)}`;
      const desc = pickLocale(c.description, locale);
      return `${c.code}  ${deal}${desc ? `  ·  ${desc}` : ''}`;
    });
  } else if (Array.isArray(config.items)) {
    items = (config.items as unknown[])
      .map((item) => pickLocale(item, locale))
      .filter(Boolean);
  }
  if (items.length === 0) {
    items = locale === 'en' ? ['Fast delivery', 'Fresh drinks'] : ['Giao nhanh', 'Đồ uống tươi'];
  }
  const loop = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-y border-hairline-light bg-canvas-light py-4">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap px-6 text-[13px] font-medium tracking-wide text-shade-60">
        {loop.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-12">
            {t}
            <span className="text-shade-30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const MOOD_KEYS: Record<string, string> = {
  'Cà phê': 'mood.coffee',
  Trà: 'mood.tea',
  'Nước ép': 'mood.juice',
  'Sinh tố': 'mood.smoothie',
  'Nước giải khát': 'mood.soft',
  'Đồ uống có cồn nhẹ': 'mood.lightAlcohol',
};

function CategoriesSection({
  config,
  categories,
  compact,
}: {
  config: Record<string, unknown>;
  categories: CategoryStat[];
  compact: boolean;
}) {
  const t = useT();
  const { locale } = useLocale();

  return (
    <section className="bg-canvas-cream text-ink">
      <div className={`page-shell ${compact ? 'px-4 py-8' : 'section-pad'}`}>
        <div className="max-w-xl">
          <p className="eyebrow">{str(config, 'eyebrow', 'Danh mục', locale)}</p>
          <h2
            className={`mt-3 font-display font-light tracking-[-0.02em] ${
              compact ? 'text-2xl' : 'text-[clamp(2rem,5vw,3rem)]'
            }`}
          >
            {str(config, 'heading', 'Chọn theo mood', locale)}
          </h2>
        </div>

        <ul
          className={`mt-8 grid gap-3 sm:gap-4 ${
            compact
              ? 'grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {categories.map((c, i) => {
            const moodKey = MOOD_KEYS[c.category];
            const mood = moodKey ? t(moodKey) : c.category;

            return (
              <li key={c.category}>
                <Link
                  href={`/products?category=${encodeURIComponent(c.category)}`}
                  onClick={(e) => compact && e.preventDefault()}
                  className="group flex h-full min-h-[88px] items-stretch overflow-hidden rounded-xl border border-hairline-light bg-canvas-light transition-all duration-300 hover:border-ink/40 hover:bg-ink hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.99]"
                  style={{ animationDelay: `${Math.min(i, 5) * 0.06}s` }}
                >
                  <div
                    className={`relative shrink-0 overflow-hidden bg-canvas-night ${
                      compact ? 'w-[72px]' : 'w-[96px] sm:w-[112px]'
                    }`}
                  >
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="112px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-shade-70" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3.5 sm:px-5">
                    <p className="font-display text-xl font-light tracking-tight sm:text-2xl">
                      {mood}
                    </p>
                    <p className="truncate text-[13px] text-shade-50 transition-colors group-hover:text-on-primary/55">
                      {c.category}
                      <span className="mx-1.5 opacity-40">·</span>
                      {c.count}
                      <span className="mx-1.5 opacity-40">·</span>
                      {t('home.mood.from', { price: formatVnd(c.minPrice) })}
                    </p>
                  </div>

                  <span
                    className="flex shrink-0 items-center pr-4 text-lg text-shade-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-on-primary sm:pr-5"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ProductGridSection({
  config,
  products,
  compact,
}: {
  config: Record<string, unknown>;
  products: Product[];
  compact: boolean;
}) {
  const t = useT();
  const { locale } = useLocale();
  const canvas = str(config, 'canvas', 'cream', locale) as SectionCanvas;
  const isDark = canvas === 'night';
  if (products.length === 0 && str(config, 'source', '', locale) === 'sale') return null;

  return (
    <section className={`${compact ? 'px-4 py-10' : 'section-pad'} ${canvasClass(canvas)}`}>
      <div className="page-shell !px-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={isDark ? 'eyebrow-on-dark' : 'eyebrow'}>
              {str(config, 'eyebrow', 'Products', locale)}
            </p>
            <h2
              className={`mt-2 font-display font-light tracking-[-0.02em] ${
                isDark ? 'text-on-night' : 'text-ink'
              } ${compact ? 'text-2xl' : 'text-[clamp(2rem,5vw,3rem)]'}`}
            >
              {str(config, 'heading', 'Sản phẩm', locale)}
            </h2>
            {str(config, 'subtitle', '', locale) && (
              <p
                className={`mt-2 max-w-sm text-sm ${
                  isDark ? 'text-link-cool-1' : 'text-shade-60'
                }`}
              >
                {str(config, 'subtitle', '', locale)}
              </p>
            )}
          </div>
        </div>
        <div
          className={`mt-8 grid gap-x-4 gap-y-8 ${
            compact
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          }`}
        >
          {products.length === 0 ? (
            <p className={isDark ? 'text-link-cool-1' : 'text-shade-50'}>
              {t('home.productsEmpty')}
            </p>
          ) : (
            products
              .slice(0, compact ? 4 : undefined)
              .map((p) => <ProductCard key={p._id} product={p} />)
          )}
        </div>
      </div>
    </section>
  );
}

function CtaBandSection({
  config,
  compact,
}: {
  config: Record<string, unknown>;
  compact: boolean;
}) {
  const { locale } = useLocale();
  const canvas = str(config, 'canvas', 'night', locale) as SectionCanvas;
  const isDark = canvas === 'night';
  return (
    <section className={`${isDark ? 'grain-dark' : ''} ${canvasClass(canvas)}`}>
      <div
        className={`page-shell flex flex-col gap-6 ${
          compact ? 'px-4 py-10' : 'section-pad md:flex-row md:items-end md:justify-between'
        }`}
      >
        <div className="max-w-xl">
          <p className={isDark ? 'eyebrow-on-dark' : 'eyebrow'}>
            {str(config, 'eyebrow', '', locale)}
          </p>
          <h2
            className={`mt-3 font-display font-light tracking-[-0.02em] ${
              isDark ? 'text-on-night' : 'text-ink'
            } ${compact ? 'text-2xl' : 'text-[clamp(2rem,5vw,3.25rem)]'}`}
          >
            {str(config, 'heading', '', locale)}
          </h2>
          <p
            className={`mt-3 text-sm leading-relaxed ${
              isDark ? 'text-link-cool-1' : 'text-shade-60'
            }`}
          >
            {str(config, 'body', '', locale)}
          </p>
        </div>
        {str(config, 'ctaLabel', '', locale) && (
          <Link
            href={str(config, 'ctaHref', '/products', locale)}
            className={isDark ? 'btn-outline-dark shrink-0' : 'btn-primary shrink-0'}
            onClick={(e) => compact && e.preventDefault()}
          >
            {str(config, 'ctaLabel', '', locale)}
          </Link>
        )}
      </div>
    </section>
  );
}

function RichTextSection({
  config,
  compact,
}: {
  config: Record<string, unknown>;
  compact: boolean;
}) {
  const { locale } = useLocale();
  const canvas = str(config, 'canvas', 'cream', locale) as SectionCanvas;
  return (
    <section className={`${compact ? 'px-4 py-10' : 'section-pad'} ${canvasClass(canvas)}`}>
      <div className="page-shell max-w-reading !px-0">
        <h2 className={compact ? 'font-display text-2xl font-light' : 'section-title'}>
          {str(config, 'heading', '', locale)}
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-shade-60">
          {str(config, 'body', '', locale)}
        </p>
      </div>
    </section>
  );
}

function formatCouponDate(value: string | undefined, locale: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildCouponTerms(
  c: CouponPublic,
  t: (key: string, params?: Record<string, string | number>) => string,
  locale: string
): string[] {
  const terms: string[] = [
    c.type === 'percent'
      ? t('home.coupons.term.discountPercent', { value: c.value })
      : t('home.coupons.term.discountFixed', { amount: formatVnd(c.value) }),
  ];

  if (c.minOrder != null && c.minOrder > 0) {
    terms.push(
      t('home.coupons.term.minOrder', { amount: formatVnd(c.minOrder) })
    );
  } else {
    terms.push(t('home.coupons.term.minOrderNone'));
  }

  if (c.maxDiscount != null && c.maxDiscount > 0) {
    terms.push(
      t('home.coupons.term.maxDiscount', { amount: formatVnd(c.maxDiscount) })
    );
  }

  if (c.usageLimit != null && c.usageLimit > 0) {
    terms.push(t('home.coupons.term.usageLimit', { n: c.usageLimit }));
  } else {
    terms.push(t('home.coupons.term.usageUnlimited'));
  }

  const starts = formatCouponDate(c.startsAt, locale);
  const expires = formatCouponDate(c.expiresAt, locale);
  if (starts) terms.push(t('home.coupons.term.starts', { date: starts }));
  if (expires) terms.push(t('home.coupons.term.expires', { date: expires }));
  if (!starts && !expires) terms.push(t('home.coupons.term.noExpiry'));

  terms.push(t('home.coupons.term.checkoutOnly'));
  return terms;
}

function CouponTermsDialog({
  coupon,
  onClose,
  onCopy,
  copied,
}: {
  coupon: CouponPublic;
  onClose: () => void;
  onCopy: (code: string) => void;
  copied: boolean;
}) {
  const { locale } = useLocale();
  const t = useT();
  const deal =
    coupon.type === 'percent'
      ? `−${coupon.value}%`
      : `−${formatVnd(coupon.value)}`;
  const desc = pickLocale(coupon.description, locale);
  const terms = buildCouponTerms(coupon, t, locale);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-canvas-night/55 backdrop-blur-[2px]"
        aria-label={t('home.coupons.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-terms-title"
        className="relative z-[1] w-full max-w-md animate-float-in overflow-hidden rounded-xl border border-hairline-light bg-canvas-light shadow-elevated-light"
      >
        <div className="flex items-start justify-between gap-3 border-b border-hairline-light px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-shade-50">
              {t('home.coupons.terms')}
            </p>
            <h2
              id="coupon-terms-title"
              className="mt-1 font-display text-2xl font-light tracking-tight text-ink"
            >
              {coupon.code}
            </h2>
            <p className="mt-1 text-sm font-medium text-shade-60">{deal}</p>
          </div>
          <button
            type="button"
            className="rounded-pill p-2 text-shade-50 transition hover:bg-shade-30/40 hover:text-ink"
            aria-label={t('home.coupons.close')}
            onClick={onClose}
          >
            <IconX size={18} stroke={1.75} />
          </button>
        </div>

        <div className="px-5 py-4">
          {desc ? (
            <p className="text-sm leading-relaxed text-shade-60">{desc}</p>
          ) : null}
          <ul className={`space-y-2.5 ${desc ? 'mt-4' : ''}`}>
            {terms.map((term) => (
              <li
                key={term}
                className="flex gap-2.5 text-sm leading-snug text-shade-60"
              >
                <span
                  className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink"
                  aria-hidden
                />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-hairline-light px-5 py-4">
          <button
            type="button"
            className="btn-outline-light !px-5 !py-2.5 text-sm"
            onClick={onClose}
          >
            {t('home.coupons.close')}
          </button>
          <button
            type="button"
            className="btn-primary !px-5 !py-2.5 text-sm"
            onClick={() => onCopy(coupon.code)}
          >
            {copied ? (
              <>
                <IconCheck size={16} stroke={1.75} className="mr-1.5 inline" />
                {t('home.coupons.copiedShort')}
              </>
            ) : (
              <>
                <IconCopy size={16} stroke={1.75} className="mr-1.5 inline" />
                {t('home.coupons.copy')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CouponBannerSection({
  config,
  coupons,
}: {
  config: Record<string, unknown>;
  coupons: CouponPublic[];
}) {
  const { locale } = useLocale();
  const t = useT();
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [termsCoupon, setTermsCoupon] = useState<CouponPublic | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (coupons.length === 0) return null;

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(t('home.coupons.copied', { code }));
    } catch {
      toast.error(t('home.coupons.copyFail'));
    }
  };

  return (
    <section className="grain-dark relative overflow-hidden border-b border-hairline-dark bg-canvas-night text-on-night">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 12% 20%, rgb(var(--aloe-10) / 0.18), transparent 55%), radial-gradient(ellipse 55% 45% at 88% 80%, rgb(var(--pistachio-10) / 0.14), transparent 50%)',
        }}
      />

      <div className="page-shell relative section-pad">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg animate-fade-up">
            <p className="eyebrow-on-dark">
              {str(config, 'eyebrow', t('home.coupons.eyebrow'), locale)}
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.02] tracking-[-0.02em] text-on-night">
              {str(config, 'heading', t('home.coupons.heading'), locale)}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-link-cool-1">
              {t('home.coupons.hint')}
            </p>
          </div>
          <Link
            href="/checkout"
            className="btn-outline-dark animate-fade-up animate-delay-1 shrink-0 !min-h-11 !px-5 !py-2.5 text-sm"
          >
            {t('home.coupons.checkout')}
          </Link>
        </div>

        <ul className="coupon-rail no-scrollbar mt-10 items-start animate-float-in animate-delay-1">
          {coupons.map((c, i) => {
            const deal =
              c.type === 'percent' ? `−${c.value}%` : `−${formatVnd(c.value)}`;
            const desc = pickLocale(c.description, locale);
            const isCopied = copied === c.code;
            return (
              <li
                key={c.code}
                className={`coupon-ticket ${isCopied ? 'is-copied' : ''}`}
                style={{ animationDelay: `${0.08 * Math.min(i, 4)}s` }}
              >
                <div className="coupon-ticket__stub">
                  <span className="coupon-ticket__perforation" aria-hidden />
                  <span className="font-display text-[1.85rem] font-light leading-none tracking-tight">
                    {deal}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-55">
                    {c.type === 'percent' ? 'OFF' : 'SAVE'}
                  </span>
                </div>

                <div className="coupon-ticket__body">
                  <div>
                    <p className="font-display text-[1.45rem] font-normal tracking-tight">
                      {c.code}
                    </p>
                    {desc ? (
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[rgb(var(--ticket-muted))]">
                        {desc}
                      </p>
                    ) : null}
                    {c.minOrder != null && c.minOrder > 0 ? (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[rgb(var(--ticket-soft))]">
                        {t('home.coupons.minOrder', {
                          amount: formatVnd(c.minOrder),
                        })}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="coupon-ticket__copy"
                      onClick={() => void copyCode(c.code)}
                      aria-label={`${t('home.coupons.copy')} ${c.code}`}
                    >
                      {isCopied ? (
                        <>
                          <IconCheck size={15} stroke={1.75} />
                          {t('home.coupons.copiedShort')}
                        </>
                      ) : (
                        <>
                          <IconCopy size={15} stroke={1.75} />
                          {t('home.coupons.copy')}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="coupon-ticket__terms-toggle"
                      onClick={() => setTermsCoupon(c)}
                    >
                      {t('home.coupons.terms')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {termsCoupon ? (
        <CouponTermsDialog
          coupon={termsCoupon}
          onClose={() => setTermsCoupon(null)}
          onCopy={(code) => void copyCode(code)}
          copied={copied === termsCoupon.code}
        />
      ) : null}
    </section>
  );
}
