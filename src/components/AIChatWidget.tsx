'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useSite } from '@/context/SiteContext';
import { useLocale, useT } from '@/context/LocaleContext';
import { pickLocale } from '@/lib/localized';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  url: string;
}

export default function AIChatWidget() {
  const t = useT();
  const { locale } = useLocale();
  const pathname = usePathname();
  const { site, loading: siteLoading } = useSite();
  const widget = site?.aiWidget;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<ChatProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = pickLocale(widget?.welcomeMessage, locale);
  const title = pickLocale(widget?.title, locale, 'Drinks AI');
  const subtitle = pickLocale(widget?.subtitle, locale);
  const buttonLabel = pickLocale(widget?.buttonLabel, locale, '✦ Ask AI');
  const hiddenOnAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (welcomeMessage) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [welcomeMessage]);

  // Auto-scroll khi có tin nhắn mới / typing
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, products, loading, open]);

  if (siteLoading || hiddenOnAdmin || widget?.enabled !== true) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setProducts([]);

    try {
      const { data } = await apiClient.post<{
        answer: string;
        products: ChatProduct[];
      }>('/chat', { message: text });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ]);
      setProducts(data.products ?? []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error ? err.message : t('chat.error'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    try {
      return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    } catch {
      return `${price}đ`;
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <Link
            key={i}
            href={match[2]}
            className="underline"
            onClick={() => setOpen(false)}
          >
            {match[1]}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 md:bottom-8 md:right-8">
      {open && (
        <div className="mb-3 flex h-[480px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-hairline-light bg-canvas-light shadow-elevated-light animate-float-in">
          <div className="flex items-center justify-between bg-canvas-night px-5 py-4 text-on-night">
            <div>
              <p className="font-display text-lg font-light tracking-tight">
                {title}
              </p>
              <p className="text-[11px] text-link-cool-2">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('chat.close')}
              className="text-on-night/60 hover:text-on-night"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-8 bg-pistachio-10 text-ink'
                    : 'mr-4 bg-canvas-cream text-shade-70'
                }`}
              >
                {renderContent(m.content)}
              </div>
            ))}

            {loading && (
              <div
                className="mr-4 flex items-center gap-1.5 rounded-lg bg-canvas-cream px-3.5 py-2.5 text-[13px] text-shade-70"
                aria-live="polite"
                aria-label={t('chat.typing')}
              >
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-shade-40" />
                <span
                  className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-shade-40"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-shade-40"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            )}

            {products.length > 0 && !loading && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-shade-40">
                  {t('chat.productsUsed')}
                </p>
                <div className="flex flex-col gap-2">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={p.url}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-hairline-light bg-canvas-light px-3 py-2 text-[12px] transition hover:border-aloe/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">
                          {p.name}
                        </span>
                        <span className="text-shade-40">{p.category}</span>
                      </span>
                      <span className="shrink-0 text-aloe">
                        {formatPrice(p.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-hairline-light p-3">
            <input
              className="input-field flex-1 !min-h-[42px] py-2"
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void send();
              }}
              disabled={loading}
            />
            <button
              type="button"
              className="btn-primary !min-h-[42px] !px-4 !py-2 text-[13px]"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
            >
              {t('chat.send')}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-aloe shadow-elevated-light !px-5"
      >
        {open ? t('chat.close') : buttonLabel}
      </button>
    </div>
  );
}
