import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useLang, C } from '../i18n/index.tsx';
import type { Bi } from '../lib/eligibility.ts';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({ variant = 'primary', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: 'rounded-xl bg-cyan-700 text-white hover:bg-cyan-800 disabled:bg-slate-400',
    secondary: 'rounded-full border-[1.5px] border-cyan-700 bg-white/40 text-cyan-800 hover:bg-white disabled:opacity-50',
    ghost: 'rounded-xl bg-transparent text-cyan-800 hover:bg-white/60 underline-offset-2',
  };
  return (
    <button
      type="button"
      {...p}
      className={`inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}

export function LinkButton({ href, children, variant = 'primary', className = '', onClick }: { href: string; children: ReactNode; variant?: Variant; className?: string; onClick?: () => void }) {
  const styles: Record<Variant, string> = {
    primary: 'rounded-xl bg-cyan-700 text-white hover:bg-cyan-800',
    secondary: 'rounded-full border-[1.5px] border-cyan-700 bg-white/40 text-cyan-800 hover:bg-white',
    ghost: 'rounded-xl text-cyan-800 hover:bg-white/60',
  };
  return (
    <a href={href} onClick={onClick} className={`inline-flex min-h-12 items-center justify-center px-6 py-3 text-base font-semibold ${styles[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(31,37,99,0.06)] backdrop-blur-sm sm:p-6 ${className}`}>{children}</div>;
}

type Tone = 'info' | 'good' | 'warn' | 'bad';
const TONES: Record<Tone, string> = {
  info: 'border-cyan-300 bg-cyan-50 text-cyan-950',
  good: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  warn: 'border-amber-300 bg-amber-50 text-amber-950',
  bad: 'border-rose-300 bg-rose-50 text-rose-950',
};

export function Callout({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border p-4 text-base leading-relaxed ${TONES[tone]}`}>
      {title && <p className="mb-1 font-bold">{title}</p>}
      {children}
    </div>
  );
}

export function Badge({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${TONES[tone]}`}>{children}</span>;
}

/** "Why we ask this": a button that opens a short plain-language reason. Works by tap, click and keyboard. */
export function WhyAsk({ reason }: { reason: Bi }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <span ref={ref} className="block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-cyan-800 underline decoration-dotted underline-offset-4 hover:bg-cyan-50"
      >
        <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-cyan-700 text-xs text-white">?</span>
        {t(C.whyAsk)}
      </button>
      {open && (
        <span id={id} role="note" className="mt-1 block rounded-xl bg-cyan-50 p-3 text-sm leading-relaxed text-cyan-950">
          {t(reason)}
        </span>
      )}
    </span>
  );
}

interface FieldProps {
  label: Bi;
  hint?: Bi;
  why?: Bi;
  error?: Bi;
  children: (p: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

export function Field({ label, hint, why, error, children }: FieldProps) {
  const { t } = useLang();
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-lg font-semibold">
        {t(label)}
      </label>
      {hint && (
        <p id={hintId} className="text-base text-slate-600">
          {t(hint)}
        </p>
      )}
      {children({ id, describedBy, invalid: !!error })}
      {error && (
        <p id={errId} role="alert" className="text-base font-semibold text-rose-700">
          {t(error)}
        </p>
      )}
      {why && <WhyAsk reason={why} />}
    </div>
  );
}

export const inputClass = (invalid: boolean) =>
  `min-h-12 w-full rounded-xl border-2 bg-white px-4 py-3 text-lg ${invalid ? 'border-rose-600' : 'border-slate-400'} focus:border-cyan-700`;

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-base text-slate-700">
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-700" />
      {label}
    </span>
  );
}

export function PageTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mb-6">
      <h1 id="page-title" tabIndex={-1} className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      {intro && <p className="mt-2 max-w-2xl text-lg leading-relaxed text-slate-700">{intro}</p>}
    </div>
  );
}
