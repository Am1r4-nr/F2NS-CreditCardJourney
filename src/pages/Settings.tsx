import { useState, type ReactNode } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp, initialState } from '../state/store.tsx';
import { navigate } from '../lib/router.ts';
import { changePassword, deleteAccount, hasPassword, MIN_PASSWORD, renameAccount } from '../lib/account.ts';
import { ProfileOverview } from '../components/ProfileOverview.tsx';
import { Button, Callout, Field, inputClass } from '../components/ui.tsx';
import type { DaysBefore } from '../state/types.ts';

type Bi = ReturnType<typeof bi>;
type SectionKey = 'overview' | 'account' | 'security' | 'display' | 'reminders' | 'data';

const SECTIONS: { key: SectionKey; label: Bi; hint: Bi; icon: string }[] = [
  { key: 'overview', label: bi('Overview', 'Ringkasan'), hint: bi('Your card, activity and what is coming up', 'Kad, aktiviti dan apa yang akan datang'), icon: 'M4 11l8-7 8 7v9H4z' },
  { key: 'account', label: bi('Account', 'Akaun'), hint: bi('Your name and email', 'Nama dan e-mel anda'), icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6' },
  { key: 'security', label: bi('Password', 'Kata laluan'), hint: bi('Keep your account safe', 'Pastikan akaun anda selamat'), icon: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3' },
  { key: 'display', label: bi('Display and language', 'Paparan dan bahasa'), hint: bi('Text size and language', 'Saiz teks dan bahasa'), icon: 'M4 5h16v11H4zM9 20h6M12 16v4' },
  { key: 'reminders', label: bi('Payment reminders', 'Peringatan bayaran'), hint: bi('Never miss a due date', 'Jangan terlepas tarikh akhir'), icon: 'M6 17h12l-1.5-2V10a4.5 4.5 0 00-9 0v5zM10 20h4' },
  { key: 'data', label: bi('Your data', 'Data anda'), hint: bi('Clear or delete', 'Kosongkan atau padam'), icon: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13' },
];

export function ProfilePage() {
  return <Profile />;
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** One setting: its name and help on the left, the control on the right. */
function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <div className="min-w-0 max-w-md">
        <p className="font-semibold">{title}</p>
        {hint && <p className="text-sm text-slate-600">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 rounded-full transition-colors ${on ? 'bg-cyan-700' : 'bg-slate-400'}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${on ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

function Profile() {
  const { t } = useLang();
  const { state, patch, update, signOut } = useApp();
  const account = state.account!;
  const [section, setSection] = useState<SectionKey>('overview');
  const [name, setName] = useState(account.name);
  const [nameErr, setNameErr] = useState<Bi | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: Bi } | null>(null);
  const [confirm, setConfirm] = useState<'clear' | 'delete' | null>(null);
  const passwordAccount = hasPassword(account.email);
  const current = SECTIONS.find((s) => s.key === section)!;

  function saveName() {
    const acc = renameAccount(account.email, name);
    if (!acc) { setNameErr(bi('Please type a name with at least 2 letters.', 'Sila taip nama sekurang-kurangnya 2 huruf.')); setNameSaved(false); return; }
    patch({ account: acc });
    setNameErr(null);
    setNameSaved(true);
  }

  async function savePassword() {
    const res = await changePassword(account.email, cur, next);
    if (res.ok) { setCur(''); setNext(''); setPwMsg({ ok: true, text: bi('Your password was changed.', 'Kata laluan anda telah ditukar.') }); }
    else setPwMsg({ ok: false, text: res.error });
  }

  const setReminder = (reminderOn: boolean) => update((s) => ({ ...s, use: { ...s.use, reminderOn } }));
  const setDays = (daysBefore: DaysBefore) => update((s) => ({ ...s, use: { ...s.use, daysBefore } }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="page-title" tabIndex={-1} className="text-3xl font-extrabold sm:text-4xl">{t(bi('My profile', 'Profil saya'))}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Left: who you are and the list of settings */}
        <aside className="soft space-y-4 rounded-3xl p-4 lg:self-start">
          <div className="flex items-center gap-3 px-1">
            <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cyan-700 text-lg font-bold text-white">{account.name.trim()[0]?.toUpperCase() ?? '?'}</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-semibold">{account.name}</span>
              <span className="block truncate text-sm text-slate-700">{account.email}</span>
            </span>
          </div>
          <div role="tablist" aria-orientation="vertical" aria-label={t(bi('Settings sections', 'Bahagian tetapan'))} className="space-y-1">
            {SECTIONS.map((s) => {
              const active = s.key === section;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  id={`tab-${s.key}`}
                  aria-selected={active}
                  aria-controls="settings-panel"
                  onClick={() => { setSection(s.key); setConfirm(null); }}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-full px-4 text-left text-base font-semibold transition-colors ${active ? 'bg-[#1c1412] text-white' : 'hover:bg-white'}`}
                >
                  <Icon d={s.icon} />
                  {t(s.label)}
                </button>
              );
            })}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => { signOut(); navigate('home'); }}>{t(bi('Log out', 'Log keluar'))}</Button>
        </aside>

        {/* Right: the chosen section */}
        <section id="settings-panel" role="tabpanel" aria-labelledby={`tab-${section}`} className="soft rounded-3xl p-5 sm:p-8">
          {section !== 'overview' && (
            <>
              <h2 className="text-2xl font-extrabold">{t(current.label)}</h2>
              <p className="mb-2 text-base text-slate-700">{t(current.hint)}</p>
            </>
          )}

          {section === 'overview' && <ProfileOverview name={account.name} />}

          {section === 'account' && (
            <div className="space-y-4">
              <Row title={t(bi('Email', 'E-mel'))} hint={t(bi('You cannot change this here.', 'Anda tidak boleh menukarnya di sini.'))}>
                <span className="font-semibold">{account.email}</span>
              </Row>
              <div className="max-w-md space-y-3 pt-2">
                <Field label={bi('Your name', 'Nama anda')} error={nameErr ?? undefined}>
                  {({ id, describedBy, invalid }) => (
                    <input id={id} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setNameErr(null); setNameSaved(false); }} className={inputClass(invalid)} />
                  )}
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={saveName}>{t(bi('Save name', 'Simpan nama'))}</Button>
                  {nameSaved && <span role="status" className="font-semibold text-emerald-800">{t(bi('Saved.', 'Disimpan.'))}</span>}
                </div>
              </div>
            </div>
          )}

          {section === 'security' && (
            passwordAccount ? (
              <div className="max-w-md space-y-4 pt-2">
                <Field label={bi('Current password', 'Kata laluan semasa')}>
                  {({ id, describedBy, invalid }) => <input id={id} type="password" aria-describedby={describedBy} autoComplete="current-password" value={cur} onChange={(e) => { setCur(e.target.value); setPwMsg(null); }} className={inputClass(invalid)} />}
                </Field>
                <Field label={bi('New password', 'Kata laluan baharu')} hint={bi(`At least ${MIN_PASSWORD} characters.`, `Sekurang-kurangnya ${MIN_PASSWORD} aksara.`)}>
                  {({ id, describedBy, invalid }) => <input id={id} type="password" aria-describedby={describedBy} autoComplete="new-password" value={next} onChange={(e) => { setNext(e.target.value); setPwMsg(null); }} className={inputClass(invalid)} />}
                </Field>
                {pwMsg && <Callout tone={pwMsg.ok ? 'good' : 'bad'}>{t(pwMsg.text)}</Callout>}
                <Button onClick={() => void savePassword()} disabled={!cur || !next}>{t(bi('Change password', 'Tukar kata laluan'))}</Button>
              </div>
            ) : (
              <Callout tone="info">{t(bi('You signed in with Google, so there is no password to change here.', 'Anda log masuk dengan Google, jadi tiada kata laluan untuk ditukar di sini.'))}</Callout>
            )
          )}

          {section === 'display' && (
            <div>
              <Row title={t(bi('Language', 'Bahasa'))} hint={t(bi('The whole site changes language.', 'Seluruh laman bertukar bahasa.'))}>
                <div role="group" aria-label={t(bi('Language', 'Bahasa'))} className="flex overflow-hidden rounded-full border-2 border-cyan-700">
                  {(['en', 'ms'] as const).map((l) => (
                    <button key={l} type="button" aria-pressed={state.lang === l} onClick={() => patch({ lang: l })} className={`min-h-11 px-4 text-base font-bold ${state.lang === l ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-800'}`}>
                      {l === 'en' ? 'English' : 'Bahasa Malaysia'}
                    </button>
                  ))}
                </div>
              </Row>
              <Row title={t(bi('Larger text', 'Teks lebih besar'))} hint={t(bi('Makes all text on the site bigger.', 'Menjadikan semua teks di laman lebih besar.'))}>
                <Switch on={state.largeText} onChange={(largeText) => patch({ largeText })} label={t(bi('Larger text', 'Teks lebih besar'))} />
              </Row>
            </div>
          )}

          {section === 'reminders' && (
            <div>
              <Row title={t(bi('Remind me before my bill is due', 'Ingatkan saya sebelum bil tiba tempoh'))} hint={t(bi('Shows a reminder on the Use it well page.', 'Memaparkan peringatan di halaman Guna dengan bijak.'))}>
                <Switch on={state.use.reminderOn} onChange={setReminder} label={t(bi('Payment reminders', 'Peringatan bayaran'))} />
              </Row>
              <Row title={t(bi('How early?', 'Berapa awal?'))} hint={t(bi('How many days before the due date.', 'Berapa hari sebelum tarikh akhir.'))}>
                <select aria-label={t(bi('Days before the due date', 'Hari sebelum tarikh akhir'))} value={state.use.daysBefore} onChange={(e) => setDays(Number(e.target.value) as DaysBefore)} disabled={!state.use.reminderOn} className={`${inputClass(false)} min-w-44 disabled:opacity-50`}>
                  {([1, 3, 5, 7] as DaysBefore[]).map((d) => (
                    <option key={d} value={d}>{d} {t(bi('day(s) before', 'hari sebelum'))}</option>
                  ))}
                </select>
              </Row>
            </div>
          )}

          {section === 'data' && (
            <div className="space-y-4">
              <p className="text-base text-slate-700">{t(bi('Everything is saved on this device only.', 'Semuanya disimpan pada peranti ini sahaja.'))}</p>
              {confirm === null ? (
                <div>
                  <Row title={t(bi('Clear my application and activity', 'Kosongkan permohonan dan aktiviti saya'))} hint={t(bi('Removes your answers, application, spending and payments. You stay signed in.', 'Membuang jawapan, permohonan, perbelanjaan dan bayaran anda. Anda kekal log masuk.'))}>
                    <Button variant="secondary" onClick={() => setConfirm('clear')}>{t(bi('Clear', 'Kosongkan'))}</Button>
                  </Row>
                  <Row title={t(bi('Delete my account', 'Padam akaun saya'))} hint={t(bi('Removes your account and everything saved under it. This cannot be undone.', 'Membuang akaun anda dan semua yang disimpan. Ini tidak boleh dibatalkan.'))}>
                    <Button variant="secondary" onClick={() => setConfirm('delete')}>{t(bi('Delete', 'Padam'))}</Button>
                  </Row>
                </div>
              ) : (
                <Callout tone="warn" title={confirm === 'clear' ? t(bi('Clear your application and activity?', 'Kosongkan permohonan dan aktiviti anda?')) : t(bi('Delete your account?', 'Padam akaun anda?'))}>
                  <p>{confirm === 'clear'
                    ? t(bi('Your answers, application, spending and payments are removed.', 'Jawapan, permohonan, perbelanjaan dan bayaran anda dibuang.'))
                    : t(bi('Your account and everything saved under it are removed from this device.', 'Akaun anda dan semua yang disimpan dibuang daripada peranti ini.'))}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        if (confirm === 'clear') {
                          update((s) => ({ ...initialState(), lang: s.lang, largeText: s.largeText, entries: s.entries, account: s.account }));
                          setConfirm(null);
                        } else {
                          deleteAccount(account.email);
                          signOut();
                          navigate('home');
                        }
                      }}
                    >
                      {confirm === 'clear' ? t(bi('Yes, clear it', 'Ya, kosongkan')) : t(bi('Yes, delete my account', 'Ya, padam akaun saya'))}
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirm(null)}>{t(bi('Keep it', 'Simpan'))}</Button>
                  </div>
                </Callout>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
