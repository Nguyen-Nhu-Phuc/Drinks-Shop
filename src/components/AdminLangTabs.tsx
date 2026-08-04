'use client';

import type { LocaleCode } from '@/lib/localized';

interface Props {
  value: LocaleCode;
  onChange: (locale: LocaleCode) => void;
}

export default function AdminLangTabs({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex rounded-pill border border-hairline-light bg-canvas-cream p-0.5"
      role="tablist"
      aria-label="Ngôn ngữ nội dung"
    >
      {(['vi', 'en'] as LocaleCode[]).map((code) => (
        <button
          key={code}
          type="button"
          role="tab"
          aria-selected={value === code}
          onClick={() => onChange(code)}
          className={`rounded-pill px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wide transition ${
            value === code
              ? 'bg-ink text-on-primary'
              : 'text-shade-50 hover:text-ink'
          }`}
        >
          {code === 'vi' ? 'Tiếng Việt' : 'English'}
        </button>
      ))}
    </div>
  );
}
