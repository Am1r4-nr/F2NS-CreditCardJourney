import { createPortal } from 'react-dom';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang, bi } from '../i18n/index.tsx';
import { hafizDemoState, useApp } from '../state/store.tsx';
import { href, navigate, type Route } from '../lib/router.ts';
import { PLACEHOLDERS } from '../config/rates.ts';
import type { StageKey } from '../state/types.ts';
import { Button, Callout } from './ui.tsx';
import { delay } from '../lib/mockApi.ts';
import { useDialog } from '../lib/useDialog.ts';

export const STAGES: { key: StageKey; route: Route; label: ReturnType<typeof bi> }[] = [
  { key: 'ready', route: 'ready', label: bi('Am I ready?', 'Sedia kah saya?') },
  { key: 'cost', route: 'cost', label: bi('What will it cost?', 'Berapa kosnya?') },
  { key: 'apply', route: 'apply', label: bi('Apply', 'Mohon') },
  { key: 'track', route: 'track', label: bi('Track', 'Jejak') },
  { key: 'use', route: 'use', label: bi('Use it well', 'Guna dengan bijak') },
];

export function PrototypeBanner() {
  const { t } = useLang();
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
      {t(bi(
        'Prototype. Illustrative only. This is not a real bank offer.',
        'Prototaip. Untuk ilustrasi sahaja. Ini bukan tawaran bank sebenar.',
      ))}
    </div>
  );
}

/** Sidebar entries: Home plus the five journey stages. */
export const SIDEBAR_NAV: { route: Route; label: ReturnType<typeof bi> }[] = [
  { route: 'home', label: bi('Home', 'Utama') },
  ...STAGES.map((s) => ({ route: s.route, label: s.label })),
];

/**
 * Moving forward in the journey. A stage is "skipping" when it is further along than the
 * first stage that is not done yet. Going back, staying put, or visiting non-stage pages is free.
 */
interface JourneyNav {
  /** Call from a link's onClick. Lets normal navigation through, or asks for confirmation. */
  guard: (route: Route, e: React.MouseEvent) => void;
}
const JourneyNavContext = createContext<JourneyNav>({ guard: () => {} });

export function JourneyNavProvider({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const { t } = useLang();
  const [pending, setPending] = useState<Route | null>(null);
  const firstOpen = STAGES.findIndex((s) => !state.done[s.key]);

  const guard: JourneyNav['guard'] = (route, e) => {
    const target = STAGES.findIndex((s) => s.route === route);
    if (target === -1 || firstOpen === -1 || target <= firstOpen) return;
    e.preventDefault();
    setPending(route);
  };

  const close = () => setPending(null);
  const ref = useDialog<HTMLDivElement>(pending !== null, close);
  const skipped = pending ? STAGES.slice(firstOpen, STAGES.findIndex((s) => s.route === pending)) : [];
  const targetLabel = pending ? STAGES.find((s) => s.route === pending)?.label : undefined;

  return (
    <JourneyNavContext.Provider value={{ guard }}>
      {children}
      {pending && targetLabel && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/50 p-4">
          <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="skip-h" aria-describedby="skip-d" tabIndex={-1} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 id="skip-h" className="text-xl font-extrabold">{t(bi('Skip ahead?', 'Langkau ke hadapan?'))}</h2>
            <p id="skip-d" className="mt-2 text-slate-700">
              {t(bi(
                `You have not finished: ${skipped.map((x) => x.label.en).join(', ')}. Do you want to skip to "${targetLabel.en}" anyway?`,
                `Anda belum selesai: ${skipped.map((x) => x.label.ms).join(', ')}. Adakah anda mahu langkau ke "${targetLabel.ms}" juga?`,
              ))}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button data-autofocus variant="secondary" onClick={close}>{t(bi('Stay here', 'Kekal di sini'))}</Button>
              <Button onClick={() => { const r = pending; close(); navigate(r); }}>{t(bi('Yes, skip', 'Ya, langkau'))}</Button>
            </div>
          </div>
        </div>
      )}
    </JourneyNavContext.Provider>
  );
}

export function Sidebar({ open, onClose, route }: { open: boolean; onClose: () => void; route: Route }) {
  const { t } = useLang();
  const { guard } = useContext(JourneyNavContext);
  const ref = useDialog<HTMLDivElement>(open, onClose);
  // Stay mounted while the closing animation plays, then unmount.
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(id);
    }
    setEntered(false);
    const id = window.setTimeout(() => setRendered(false), 300);
    return () => window.clearTimeout(id);
  }, [open]);
  if (!open && !rendered) return null;
  // Portal to <body>: the header's backdrop blur would otherwise trap a fixed element inside the header.
  return createPortal(
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ease-out motion-reduce:transition-none ${entered && open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={t(bi('Menu', 'Menu'))}
        tabIndex={-1}
        className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white p-4 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${entered && open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-bold text-cyan-800">{t(bi('Menu', 'Menu'))}</p>
          <button type="button" onClick={onClose} aria-label={t(bi('Close menu', 'Tutup menu'))} className="min-h-11 min-w-11 rounded-lg text-2xl">×</button>
        </div>
        <nav aria-label={t(bi('Main', 'Utama'))}>
          <ul className="space-y-1">
            {SIDEBAR_NAV.map((n) => (
              <li key={n.route}>
                <a
                  href={href(n.route)}
                  aria-current={route === n.route ? 'page' : undefined}
                  onClick={(e) => { onClose(); guard(n.route, e); }}
                  className={`flex min-h-11 items-center rounded-xl px-4 text-base font-semibold ${route === n.route ? 'bg-cyan-700 text-white' : 'text-cyan-900 hover:bg-cyan-50'}`}
                >
                  {t(n.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>,
    document.body,
  );
}

export function Header({ route }: { route: Route }) {
  const { state, patch, update } = useApp();
  const { t, lang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleDemo() {
    if (state.demo) {
      patch({ demo: false });
    } else {
      update((s) => hafizDemoState(s));
      navigate('home');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 sm:px-8 lg:px-12 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-label={t(bi('Open menu', 'Buka menu'))}
            className="grid min-h-11 min-w-11 place-items-center rounded-lg border-2 border-cyan-700 bg-white text-cyan-800"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 5h16M3 11h16M3 17h16" />
            </svg>
          </button>
          <a href={href('home')} className="flex min-h-11 items-center gap-2 rounded-lg text-xl font-bold text-cyan-800">
            <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl border-[1.5px] border-cyan-700 bg-white/50 text-base font-bold text-cyan-700">K</span>
            KAF First Card
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={state.demo}
            onClick={toggleDemo}
            className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${state.demo ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-slate-300 bg-white text-slate-700'}`}
          >
            {t(bi('Demo mode', 'Mod demo'))}: {state.demo ? t(bi('On', 'Hidup')) : t(bi('Off', 'Mati'))}
          </button>
          <div role="group" aria-label={t(bi('Language', 'Bahasa'))} className="flex overflow-hidden rounded-full border-2 border-cyan-700">
            {(['en', 'ms'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => patch({ lang: l })}
                className={`min-h-11 min-w-12 px-3 text-sm font-bold ${lang === l ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-800'}`}
              >
                {l === 'en' ? 'EN' : 'BM'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} route={route} />
    </header>
  );
}

/** Journey timeline: shows where the user is. Jumping ahead of the first unfinished stage asks first. */
export function Stepper({ route }: { route: Route }) {
  const { state } = useApp();
  const { t } = useLang();
  const { guard } = useContext(JourneyNavContext);
  const current = STAGES.findIndex((s) => s.route === route);
  const onCompare = route === 'compare';
  return (
    <nav aria-label={t(bi('Your journey', 'Perjalanan anda'))} className="mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 pt-4">
      <ol className="flex">
        {STAGES.map((s, i) => {
          const isCurrent = i === current;
          const done = state.done[s.key];
          const last = i === STAGES.length - 1;
          return (
            <li key={s.key} className="relative min-w-0 flex-1" aria-current={isCurrent ? 'step' : undefined}>
              {!last && (
                <span aria-hidden="true" className={`absolute left-1/2 top-[1.15rem] h-1 w-full rounded ${done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              )}
              <a
                href={href(s.route)}
                onClick={(e) => guard(s.route, e)}
                className="relative flex min-h-14 flex-col items-center gap-1 px-1 text-center text-xs font-semibold sm:text-sm"
              >
                <span
                  aria-hidden="true"
                  className={`z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-4 text-base font-bold ${
                    isCurrent ? 'border-cyan-700 bg-cyan-700 text-white' : done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  {done && !isCurrent ? '✓' : i + 1}
                </span>
                <span className={isCurrent ? 'text-cyan-800' : done ? 'text-emerald-900' : 'text-slate-700'}>
                  {t(s.label)}
                  <span className="sr-only">
                    {' '}({isCurrent ? t(bi('you are here', 'anda di sini')) : done ? t(bi('done', 'siap')) : t(bi('not started', 'belum bermula'))})
                  </span>
                </span>
                {isCurrent && <span aria-hidden="true" className="text-[0.7rem] font-bold uppercase tracking-wide text-cyan-700">{t(bi('You are here', 'Anda di sini'))}</span>}
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-1 text-center text-sm">
        <a
          href={href('compare')}
          aria-current={onCompare ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-4 font-semibold ${onCompare ? 'bg-cyan-700 text-white' : 'text-cyan-800 underline'}`}
        >
          {t(bi('Compare cards', 'Banding kad'))} ({t(bi('optional', 'pilihan'))})
        </a>
      </p>
    </nav>
  );
}

export function TrustStrip() {
  const { t } = useLang();
  const items = [
    { icon: '🏛️', title: bi('Licensed by Bank Negara Malaysia', 'Dilesenkan oleh Bank Negara Malaysia'), note: bi(PLACEHOLDERS.license, 'Placeholder: no. lesen BNM XXXX') },
    { icon: '🛡️', title: bi('Deposits protected by PIDM', 'Deposit dilindungi PIDM'), note: bi('Placeholder note. Covers eligible deposits up to the legal limit.', 'Nota placeholder. Melindungi deposit layak sehingga had yang ditetapkan.') },
    { icon: '🔒', title: bi('Your data stays private', 'Data anda kekal sulit'), note: bi('We explain how we use it in 3 simple points.', 'Kami terangkan penggunaannya dalam 3 perkara mudah.') },
  ];
  return (
    <section aria-label={t(bi('Trust and safety', 'Kepercayaan dan keselamatan'))} className="grid gap-3 sm:grid-cols-3">
      {items.map((i) => (
        <div key={i.title.en} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span aria-hidden="true" className="text-3xl">{i.icon}</span>
          <div>
            <p className="font-bold">{t(i.title)}</p>
            <p className="text-sm text-slate-600">{t(i.note)}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function ScamNote() {
  const { t } = useLang();
  return (
    <Callout tone="warn" title={t(bi('Stay safe from scams', 'Berwaspada terhadap penipuan'))}>
      {t(bi(
        'We will never ask for your TAC or password via WhatsApp or call.',
        'Kami tidak akan sekali-kali meminta TAC atau kata laluan anda melalui WhatsApp atau panggilan.',
      ))}
    </Callout>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-12 border-t border-white/60 bg-white/55 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl space-y-4 px-4 sm:px-8 lg:px-12 py-8">
        <TrustStrip />
        <ScamNote />
        <nav aria-label={t(bi('More', 'Lagi'))} className="flex flex-wrap gap-x-5 gap-y-1 text-base font-semibold text-cyan-800">
          <a className="flex min-h-11 items-center" href={href('pricing')}>{t(bi('Pricing', 'Harga'))}</a>
          <a className="flex min-h-11 items-center" href={href('trust')}>{t(bi('Trust and data', 'Kepercayaan dan data'))}</a>
          <a className="flex min-h-11 items-center" href={href('learn')}>{t(bi('Learn', 'Belajar'))}</a>
          <a className="flex min-h-11 items-center" href={href('workshop')}>{t(bi('Workshop feedback', 'Maklum balas bengkel'))}</a>
        </nav>
        <p className="text-sm text-slate-600">
          {t(bi(
            'KAF First Card is a workshop prototype for the MDEC-KAF Digital Bank Launchpad Accelerator. All names, rates and licence details are placeholders.',
            'KAF First Card ialah prototaip bengkel untuk MDEC-KAF Digital Bank Launchpad Accelerator. Semua nama, kadar dan butiran lesen ialah placeholder.',
          ))}
        </p>
      </div>
    </footer>
  );
}

/** Chat or call, available on every screen. */
export function HelpWidget({ lifted, demo = false }: { lifted: boolean; demo?: boolean }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ from: 'me' | 'bot'; text: string }[]>([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send() {
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [...m, { from: 'me', text: v }]);
    setText('');
    setTyping(true);
    await delay(1100);
    setTyping(false);
    setMsgs((m) => [
      ...m,
      {
        from: 'bot',
        text: t(bi(
          'Thanks for asking. This is a simulated chat. A real team member would reply here within a few minutes. Remember: we never ask for your TAC or password.',
          'Terima kasih. Ini chat simulasi. Ahli pasukan sebenar akan membalas di sini dalam beberapa minit. Ingat: kami tidak pernah meminta TAC atau kata laluan anda.',
        )),
      },
    ]);
  }

  return (
    <div className={`fixed right-4 z-40 ${demo ? 'bottom-72 sm:bottom-60' : lifted ? 'bottom-28 sm:bottom-24' : 'bottom-4'}`}>
      {open && (
        <div ref={panel} role="dialog" aria-label={t(bi('Get help', 'Dapatkan bantuan'))} className="mb-2 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{t(bi('Need a hand?', 'Perlukan bantuan?'))}</p>
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 min-w-11 rounded-lg text-xl" aria-label={t(bi('Close', 'Tutup'))}>×</button>
          </div>
          <a href={`tel:${PLACEHOLDERS.phone.replace(/-/g, '')}`} className="mt-1 flex min-h-12 items-center gap-2 rounded-xl bg-cyan-50 px-3 font-semibold text-cyan-900">
            📞 {t(bi('Call', 'Hubungi'))} {PLACEHOLDERS.phone} <span className="text-xs font-normal">({t(bi('placeholder', 'placeholder'))})</span>
          </a>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto" aria-live="polite">
            {msgs.length === 0 && <p className="text-sm text-slate-600">{t(bi('Or type a question. A person will answer (simulated).', 'Atau taip soalan. Seorang akan menjawab (simulasi).'))}</p>}
            {msgs.map((m, i) => (
              <p key={i} className={`rounded-2xl px-3 py-2 text-sm ${m.from === 'me' ? 'ml-8 bg-cyan-700 text-white' : 'mr-8 bg-slate-100'}`}>{m.text}</p>
            ))}
            {typing && <p className="text-sm text-slate-500">…</p>}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label={t(bi('Your question', 'Soalan anda'))}
              className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-slate-400 px-3"
            />
            <Button type="submit">{t(bi('Send', 'Hantar'))}</Button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="ml-auto flex min-h-14 items-center gap-2 rounded-full bg-teal-700 px-5 text-base font-bold text-white shadow-lg hover:bg-teal-800"
      >
        <span aria-hidden="true">💬</span>
        {t(bi('Help: chat or call', 'Bantuan: chat atau panggil'))}
      </button>
    </div>
  );
}
