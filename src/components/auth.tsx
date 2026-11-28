import { useMemo, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { MIN_PASSWORD, logIn, signUp, validateSignUp, type SignUpErrors } from '../lib/account.ts';
import { Callout, Field, Spinner, inputClass } from './ui.tsx';

type Mode = 'signup' | 'login';

/** Sign up or log in. Calls onDone once the visitor is signed in. */
export function AuthPanel({ onDone, initialMode = 'signup', reason }: { onDone?: () => void; initialMode?: Mode; reason?: ReturnType<typeof bi> }) {
  const { t } = useLang();
  const { signInAs } = useApp();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [formError, setFormError] = useState<ReturnType<typeof bi> | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (mode === 'signup') {
      const errs = validateSignUp({ name, email, password, agree });
      setErrors(errs);
      if (Object.keys(errs).length > 0) {
        setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50);
        return;
      }
    } else {
      const errs: SignUpErrors = {};
      if (!email.trim()) errs.email = bi('Please type your email address.', 'Sila taip alamat e-mel anda.');
      if (!password) errs.password = bi('Please type your password.', 'Sila taip kata laluan anda.');
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    setBusy(true);
    try {
      const res = mode === 'signup' ? await signUp({ name, email, password, agree }) : await logIn(email, password);
      if (!res.ok) { setFormError(res.error); return; }
      signInAs(res.account);
      onDone?.();
    } finally {
      setBusy(false);
    }
  }

  const tab = (m: Mode, label: ReturnType<typeof bi>) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => { setMode(m); setErrors({}); setFormError(null); }}
      className={`min-h-11 flex-1 rounded-full px-4 text-base font-semibold ${mode === m ? 'bg-[#1c1412] text-white' : 'text-slate-800 hover:bg-white'}`}
    >
      {t(label)}
    </button>
  );

  const signup = mode === 'signup';
  const input = (invalid: boolean) => `${inputClass(invalid)} bg-white/80 pr-12`;

  return (
    <div className="grid overflow-hidden rounded-[2rem] bg-[#fff1e8] md:grid-cols-2">
      <div className="space-y-6 p-6 sm:p-10">
        <p className="flex items-center justify-center gap-2 text-lg font-bold tracking-[0.2em] text-[#1c1412]">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M12 1c.6 5.6 5.4 10.4 11 11-5.6.6-10.4 5.4-11 11-.6-5.6-5.4-10.4-11-11C6.6 11.4 11.4 6.6 12 1z" /></svg>
          KAF
        </p>
        <div className="text-center">
          <h1 id="page-title" tabIndex={-1} style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: 500 }} className="text-3xl leading-tight text-[#1c1412] sm:text-4xl">
            {signup ? t(bi('Create your', 'Daftar')) : t(bi('Welcome', 'Selamat'))}{' '}
            <span className="text-cyan-700">{signup ? t(bi('account', 'akaun anda')) : t(bi('back', 'kembali'))}</span>
          </h1>
          <p className="mt-2 text-lg text-slate-700">
            {reason
              ? t(reason)
              : signup
                ? t(bi('Free. It takes about a minute.', 'Percuma. Mengambil masa kira-kira seminit.'))
                : t(bi('Log in to pick up where you stopped.', 'Log masuk untuk sambung dari tempat anda berhenti.'))}
          </p>
        </div>

        <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5">
          <div role="tablist" aria-label={t(bi('Account', 'Akaun'))} className="flex gap-1 rounded-full bg-white/70 p-1">
            {tab('signup', bi('Create account', 'Daftar akaun'))}
            {tab('login', bi('I have an account', 'Saya ada akaun'))}
          </div>

          {signup && (
            <Field label={bi('Your name', 'Nama anda')} error={errors.name}>
              {({ id, describedBy, invalid }) => (
                <div className="relative">
                  <input id={id} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="name" placeholder={t(bi('Your full name', 'Nama penuh anda'))} value={name} onChange={(e) => setName(e.target.value)} className={input(invalid)} />
                  <FieldIcon d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6" />
                </div>
              )}
            </Field>
          )}
          <Field label={bi('Email address', 'Alamat e-mel')} error={errors.email}>
            {({ id, describedBy, invalid }) => (
              <div className="relative">
                <input id={id} type="email" aria-describedby={describedBy} aria-invalid={invalid} autoComplete="email" placeholder={t(bi('Enter your email', 'Masukkan e-mel anda'))} value={email} onChange={(e) => setEmail(e.target.value)} className={input(invalid)} />
                <FieldIcon d="M3 6h18v12H3zM3 7l9 6 9-6" />
              </div>
            )}
          </Field>
          <Field
            label={bi('Password', 'Kata laluan')}
            hint={signup ? bi(`At least ${MIN_PASSWORD} characters.`, `Sekurang-kurangnya ${MIN_PASSWORD} aksara.`) : undefined}
            error={errors.password}
          >
            {({ id, describedBy, invalid }) => (
              <div className="relative">
                <input id={id} type="password" aria-describedby={describedBy} aria-invalid={invalid} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? t(bi('Create a password', 'Cipta kata laluan')) : t(bi('Your password', 'Kata laluan anda'))} value={password} onChange={(e) => setPassword(e.target.value)} className={input(invalid)} />
                <FieldIcon d="M6 11h12v9H6zM8 11V8a4 4 0 018 0v3" />
              </div>
            )}
          </Field>

          {signup && (
            <div>
              <label className="flex min-h-11 items-start gap-3 text-base">
                <input type="checkbox" checked={agree} aria-invalid={!!errors.agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-cyan-700" />
                <span>{t(bi('I understand this prototype saves my details on this device only, and nothing is sent to a bank.', 'Saya faham prototaip ini menyimpan butiran saya pada peranti ini sahaja, dan tiada apa dihantar kepada bank.'))}</span>
              </label>
              {errors.agree && <p role="alert" className="mt-1 text-base font-semibold text-rose-700">{t(errors.agree)}</p>}
            </div>
          )}

          {formError && <Callout tone="bad">{t(formError)}</Callout>}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a3121b] to-[#d12a1f] px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Spinner label={t(bi('Please wait…', 'Sila tunggu…'))} /> : (
              <>
                {signup ? t(bi('Create account', 'Daftar akaun')) : t(bi('Log in', 'Log masuk'))}
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      <AuthArt />
    </div>
  );
}

function FieldIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Contour-line artwork with three plain promises. Decorative lines are hidden from screen readers. */
function AuthArt() {
  const { t } = useLang();
  const lines = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 34; i++) {
      const y = i * 16 - 40;
      let d = `M-20 ${y}`;
      for (let x = 0; x <= 520; x += 10) {
        const wave = Math.sin(x / 70 + i * 0.35) * 26 + Math.cos(x / 110 - i * 0.2) * 20;
        d += ` L${x} ${(y + wave).toFixed(1)}`;
      }
      out.push(d);
    }
    return out;
  }, []);
  const points = [
    bi('Your answers are saved as you go', 'Jawapan anda disimpan semasa anda isi'),
    bi('Log in later and carry on where you stopped', 'Log masuk kemudian dan sambung dari tempat anda berhenti'),
    bi('Nothing is sent to a bank', 'Tiada apa dihantar kepada bank'),
  ];
  return (
    <div className="relative hidden min-h-[34rem] overflow-hidden bg-gradient-to-br from-[#a3121b] via-[#e8552b] to-[#fba32a] md:block">
      <svg viewBox="0 0 500 540" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={i % 3 === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(122,15,20,0.35)'} strokeWidth={i % 3 === 0 ? 1.4 : 1} />
        ))}
      </svg>
      <div className="absolute inset-x-6 bottom-6 rounded-3xl bg-[#3d0a08]/70 p-5 text-white backdrop-blur-md">
        <p className="text-lg font-semibold">{t(bi('Your first card, made simple.', 'Kad pertama anda, dipermudahkan.'))}</p>
        <ul className="mt-3 space-y-2 text-base">
          {points.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5">✓</span>
              {t(p)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}