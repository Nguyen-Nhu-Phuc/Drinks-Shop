'use client';

import { useToast, useToastState, type ToastVariant } from '@/context/ToastContext';

const styles: Record<ToastVariant, string> = {
  success: 'bg-canvas-night text-on-night border-white/10',
  error: 'bg-[#3a1414] text-[#ffd4d4] border-[#6b2a2a]',
  info: 'bg-[#2a2a28] text-on-night border-white/10',
};

const marks: Record<ToastVariant, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};

export default function ToastViewport() {
  const toasts = useToastState();
  const { dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-8"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-toast-in pointer-events-auto flex max-w-md items-start gap-3 rounded-pill border px-4 py-3 shadow-elevated-light ${styles[t.variant]}`}
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold"
            aria-hidden
          >
            {marks[t.variant]}
          </span>
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
            {t.message}
          </p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-current/50 transition hover:text-current"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
