'use client';

import type { ReactNode } from 'react';

interface Props {
  label: string;
  /** Chú thích ngắn — field này hiển thị ở đâu / dùng để làm gì */
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

/** Label + chú thích cho field form Admin */
export default function AdminField({
  label,
  hint,
  children,
  htmlFor,
  className = '',
}: Props) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-shade-50">
        {label}
      </span>
      {hint ? (
        <span className="block text-[12px] leading-snug text-shade-40">
          {hint}
        </span>
      ) : null}
      <span className="block" {...(htmlFor ? { id: htmlFor } : {})}>
        {children}
      </span>
    </label>
  );
}
