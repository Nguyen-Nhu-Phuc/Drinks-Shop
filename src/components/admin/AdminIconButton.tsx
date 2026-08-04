'use client';

import type { ReactNode } from 'react';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'primary';
  children: ReactNode;
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  default:
    'border-hairline-light bg-canvas-light text-ink hover:bg-canvas-cream',
  danger:
    'border-hairline-light bg-canvas-light text-ink hover:bg-ink hover:text-on-primary',
  primary: 'border-transparent bg-ink text-on-primary hover:opacity-90',
};

/** Icon-only (or icon+label) action button for admin tables */
export default function AdminIconButton({
  label,
  onClick,
  disabled,
  variant = 'default',
  children,
}: Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
