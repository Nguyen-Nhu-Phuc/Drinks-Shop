'use client';

import type { ReactNode } from 'react';
import { IconSquare, IconSquareCheckFilled, IconSquareMinusFilled } from '@tabler/icons-react';

interface Props {
  count: number;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  children: ReactNode;
}

/** Sticky bulk toolbar shown when ≥1 row is selected */
export default function BulkActionBar({
  count,
  allSelected,
  someSelected,
  onToggleAll,
  onClear,
  children,
}: Props) {
  const SelectIcon = allSelected
    ? IconSquareCheckFilled
    : someSelected
      ? IconSquareMinusFilled
      : IconSquare;

  return (
    <div className="sticky top-0 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-hairline-light bg-canvas-cream/95 px-4 py-3 shadow-card-light backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggleAll}
        className="inline-flex items-center gap-2 text-sm text-ink"
        aria-pressed={allSelected}
      >
        <SelectIcon size={20} stroke={1.5} className="text-ink" />
        <span style={{ fontWeight: 550 }}>
          {count > 0 ? `Đã chọn ${count}` : 'Chọn tất cả'}
        </span>
      </button>
      {count > 0 && (
        <>
          <div className="hidden h-5 w-px bg-hairline-light sm:block" />
          <div className="flex flex-wrap items-center gap-2">{children}</div>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-xs text-shade-50 underline"
          >
            Bỏ chọn
          </button>
        </>
      )}
    </div>
  );
}
