import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { MIN_PASSWORD, logIn, signUp, validateSignUp, type SignUpErrors } from '../lib/account.ts';
import { Button, Callout, Field, Spinner, inputClass } from './ui.tsx';

type Mode = 'signup' | 'login';

/** Sign up or log in. Calls onDone once the visitor is signed in. */
export function AuthPanel({ onDone, initialMode = 'signup' }: { onDone?: () => void; initialMode?: Mode }) {
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

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5">
      <div role="tablist" aria-label={t(bi('Account', 'Akaun'))} className="flex gap-1 rounded-full bg-slate-200 p-1">
        {tab('signup', bi('Create account', 'Daftar akaun'))}
        {tab('login', bi('I have an account', 'Saya ada akaun'))}
      </div>

      {mode === 'signup' && (
        <Field label={bi('Your name', 'Nama anda')} error={errors.name}>
          {({ id, describedBy, invalid }) => (
            <input id={id} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass(invalid)} />
          )}
        </Field>
      )}
      <Field label={bi('Email address', 'Alamat e-mel')} error={errors.email}>
        {({ id, describedBy, invalid }) => (
          <input id={id} type="email" aria-describedby={describedBy} aria-invalid={invalid} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(invalid)} />
        )}
      </Field>
      <Field
        label={bi('Password', 'Kata laluan')}
        hint={mode === 'signup' ? bi(`At least ${MIN_PASSWORD} characters.`, `Sekurang-kurangnya ${MIN_PASSWORD} aksara.`) : undefined}
        error={errors.password}
      >
        {({ id, describedBy, invalid }) => (
          <input id={id} type="password" aria-describedby={describedBy} aria-invalid={invalid} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass(invalid)} />
        )}
      </Field>

      {mode === 'signup' && (
        <div>
          <label className="flex min-h-11 items-start gap-3 text-base">
            <input type="checkbox" checked={agree} aria-invalid={!!errors.agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-cyan-700" />
            <span>{t(bi('I understand this prototype saves my details on this device only, and nothing is sent to a bank.', 'Saya faham prototaip ini menyimpan butiran saya pada peranti ini sahaja, dan tiada apa dihantar kepada bank.'))}</span>
          </label>
          {errors.agree && <p role="alert" className="mt-1 text-base font-semibold text-rose-700">{t(errors.agree)}</p>}
        </div>
      )}

      {formError && <Callout tone="bad">{t(formError)}</Callout>}

      <Button type="submit" disabled={busy}>
        {busy ? <Spinner label={t(bi('Please wait…', 'Sila tunggu…'))} /> : mode === 'signup' ? t(bi('Create account and continue', 'Daftar akaun dan teruskan')) : t(bi('Log in and continue', 'Log masuk dan teruskan'))}
      </Button>
    </form>
  );
}
