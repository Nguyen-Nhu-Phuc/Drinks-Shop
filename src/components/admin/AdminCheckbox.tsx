'use client';

import {
  IconSquare,
  IconSquareCheckFilled,
} from '@tabler/icons-react';

interface Props {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

/** Accessible checkbox using Tabler icons */
export default function AdminCheckbox({
  checked,
  onChange,
  label = 'Chọn',
}: Props) {
  const Icon = checked ? IconSquareCheckFilled : IconSquare;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="inline-flex shrink-0 text-ink transition hover:opacity-80"
    >
      <Icon size={22} stroke={1.5} />
    </button>
  );
}
