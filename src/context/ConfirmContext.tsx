'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ConfirmVariant = 'danger' | 'default';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface DialogState extends ConfirmOptions {
  open: boolean;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

const defaultState: DialogState = {
  open: false,
  title: '',
  description: '',
  confirmLabel: 'Xác nhận',
  cancelLabel: 'Huỷ',
  variant: 'danger',
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(defaultState);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Xác nhận',
        cancelLabel: options.cancelLabel ?? 'Huỷ',
        variant: options.variant ?? 'danger',
      });
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [state.open, close]);

  const api = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      <ConfirmDialogHost
        state={state}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

function ConfirmDialogHost({
  state,
  onCancel,
  onConfirm,
}: {
  state: DialogState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!state.open) return null;

  const isDanger = state.variant !== 'default';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-canvas-night/50 backdrop-blur-[2px]"
        aria-label={state.cancelLabel}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={state.description ? 'confirm-dialog-desc' : undefined}
        className="relative z-[1] w-full max-w-md animate-float-in rounded-xl border border-hairline-light bg-canvas-light p-6 shadow-elevated-light"
      >
        <h2
          id="confirm-dialog-title"
          className="font-display text-xl font-light tracking-tight text-ink"
        >
          {state.title}
        </h2>
        {state.description ? (
          <p
            id="confirm-dialog-desc"
            className="mt-2 text-sm leading-relaxed text-shade-60"
          >
            {state.description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-outline-light !px-5 !py-2.5 text-sm"
            onClick={onCancel}
          >
            {state.cancelLabel}
          </button>
          <button
            type="button"
            className={
              isDanger
                ? 'btn-primary !bg-ink !px-5 !py-2.5 text-sm'
                : 'btn-primary !px-5 !py-2.5 text-sm'
            }
            onClick={onConfirm}
            autoFocus
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
