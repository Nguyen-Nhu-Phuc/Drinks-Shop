'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useT } from '@/context/LocaleContext';
import { useToast } from '@/context/ToastContext';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export default function PasswordInput({ className = '', ...props }: Props) {
  const t = useT();
  const toast = useToast();
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    toast.info(next ? t('auth.passwordShown') : t('auth.passwordHidden'));
  };

  return (
    <div className="relative mt-1.5">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`input-field pr-12 ${className}`.trim()}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        title={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-shade-50 transition hover:bg-shade-30/40 hover:text-ink"
      >
        {visible ? <IconEyeOff size={18} stroke={1.6} /> : <IconEye size={18} stroke={1.6} />}
      </button>
    </div>
  );
}
