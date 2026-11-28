import { createPortal } from 'react-dom';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang, bi } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, navigate, useRoute, type Route } from '../lib/router.ts';
import { PLACEHOLDERS } from '../config/rates.ts';
import type { StageKey } from '../state/types.ts';
import { Button, Callout } from './ui.tsx';
import { WALKTHROUGH } from '../data/walkthrough.ts';
import { delay } from '../lib/mockApi.ts';
import { useDialog } from '../lib/useDialog.ts';

export const STAGES: { key: StageKey; route: Route; label: ReturnType<typeof bi> }[] = [
  { key: 'ready', route: 'ready', label: bi('Am I ready?', 'Sedia kah saya?') },
  { key: 'cost', route: 'cost', label: bi('What will it cost?', 'Berapa kosnya?') },
  { key: 'apply', route: 'apply', label: bi('Apply', 'Mohon') },
  { key: 'track', route: 'track', label: bi('Track', 'Jejak') },
  { key: 'use', route: 'use', label: bi('Use it well', 'Guna dengan bijak') },
];

/** The timeline covers getting ready to apply. Track and Use it well are separate pages. */
export const TIMELINE_STAGES = STAGES.slice(0, 3);

/** Sidebar entries. */
export const SIDEBAR_NAV: { route: Route; label: ReturnType<typeof bi> }[] = [
  { route: 'home', label: bi('Home', 'Utama') },
  { route: 'apply', label: bi('Start applying', 'Mula memohon') },
  { route: 'track', label: bi('Track Application', 'Jejak Permohonan') },
  { route: 'use', label: bi('Use it well', 'Guna dengan bijak') },
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
  const { state, update } = useApp();
  const { t } = useLang();
  const currentRoute = useRoute();
  const [pending, setPending] = useState<Route | null>(null);
  const firstOpen = TIMELINE_STAGES.findIndex((s) => !state.done[s.key]);

  const guard: JourneyNav['guard'] = (route, e) => {
    const target = TIMELINE_STAGES.findIndex((s) => s.route === route);
    const here = TIMELINE_STAGES.findIndex((s) => s.route === currentRoute);
    // Going back (or staying) never needs a warning.
    if (target === -1 || firstOpen === -1 || target <= firstOpen || target <= here) return;
    e.preventDefault();
    setPending(route);
  };

  const close = () => setPending(null);
  const ref = useDialog<HTMLDivElement>(pending !== null, close);
  const skipped = pending ? TIMELINE_STAGES.slice(firstOpen, TIMELINE_STAGES.findIndex((s) => s.route === pending)) : [];
  const targetLabel = pending ? TIMELINE_STAGES.find((s) => s.route === pending)?.label : undefined;

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
              <Button onClick={() => {
                const r = pending;
                update((st) => {
                  // Skipped stages count as not done, even if the user only opened the page.
                  const flags = Object.fromEntries(skipped.map((x) => [x.key, true]));
                  const notDone = Object.fromEntries(skipped.map((x) => [x.key, false]));
                  return { ...st, skipped: { ...st.skipped, ...flags }, done: { ...st.done, ...notDone } };
                });
                close();
                navigate(r);
              }}>{t(bi('Yes, skip', 'Ya, langkau'))}</Button>
            </div>
          </div>
        </div>
      )}
    </JourneyNavContext.Provider>
  );
}

const MORE_NAV: { route: Route; label: ReturnType<typeof bi> }[] = [
  { route: 'compare', label: bi('Compare cards', 'Banding kad') },
  { route: 'learn', label: bi('Learn', 'Belajar') },
  { route: 'pricing', label: bi('Pricing', 'Harga') },
  { route: 'trust', label: bi('Trust and safety', 'Kepercayaan') },
  { route: 'workshop', label: bi('Workshop', 'Bengkel') },
];

const ICON_PATHS: Record<Route, string> = {
  home: 'M4 11l8-7 8 7v9H4z',
  ready: 'M5 12l4 4 10-10',
  compare: 'M4 6h16M4 12h10M4 18h16',
  cost: 'M12 3v18M16 7H10a3 3 0 000 6h4a3 3 0 010 6H8',
  apply: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  track: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  use: 'M3 7h18v12H3zM3 11h18',
  learn: 'M3 8l9-4 9 4-9 4zM7 11v5c3 2 7 2 10 0v-5',
  pricing: 'M4 4h8l8 8-8 8-8-8z',
  trust: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z',
  workshop: 'M5 20V9l7-5 7 5v11M10 20v-6h4v6',
};

function NavIcon({ route }: { route: Route }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON_PATHS[route]} />
    </svg>
  );
}

export function Sidebar({ open, onClose, route }: { open: boolean; onClose: () => void; route: Route }) {
  const { t } = useLang();
  const { guard } = useContext(JourneyNavContext);
  const { state } = useApp();
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
        className={`absolute bottom-3 left-3 top-3 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto rounded-[2rem] border border-white/80 bg-gradient-to-b from-white to-slate-200 p-4 text-[#1c1412] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${entered && open ? 'translate-x-0' : '-translate-x-[110%]'}`}
      >
        <div className="mb-3 flex items-center justify-between border-b border-slate-300/70 px-2 pb-4 pt-1">
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M12 1c.6 5.6 5.4 10.4 11 11-5.6.6-10.4 5.4-11 11-.6-5.6-5.4-10.4-11-11C6.6 11.4 11.4 6.6 12 1z" /></svg>
            {t(bi('Menu', 'Menu'))}
          </p>
          <button type="button" onClick={onClose} aria-label={t(bi('Close menu', 'Tutup menu'))} className="grid min-h-11 min-w-11 place-items-center rounded-full bg-white text-2xl shadow-sm">×</button>
        </div>
        <nav aria-label={t(bi('Main', 'Utama'))} className="space-y-4">
          {[
            { title: null, items: SIDEBAR_NAV },
            { title: bi('Explore', 'Terokai'), items: MORE_NAV },
          ].map((g, gi) => (
            <div key={gi} className={gi > 0 ? 'border-t border-slate-300/70 pt-4' : ''}>
              {g.title && <p className="mb-2 px-3 text-sm font-semibold text-slate-600">{t(g.title)}</p>}
              <ul className="space-y-1">
                {g.items.map((n) => {
                  // "Start applying" resumes the timeline step the user was last on.
                  const resume = n.route === 'apply';
                  const target: Route = resume ? state.lastStage : n.route;
                  const active = resume ? route === 'ready' || route === 'cost' || route === 'apply' : route === n.route;
                  return (
                    <li key={n.route}>
                      <a
                        href={href(target)}
                        aria-current={active ? 'page' : undefined}
                        onClick={(e) => { onClose(); if (!resume) guard(n.route, e); }}
                        className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-base font-semibold transition-colors ${active ? 'bg-[#1c1412] text-white' : 'hover:bg-white'}`}
                      >
                        <NavIcon route={n.route} />
                        {t(n.label)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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
      update((s) => ({ ...s, demo: true, walkStep: 0 }));
      navigate(WALKTHROUGH[0].route);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/20 bg-[#7a0f14]/85 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 sm:px-8 lg:px-12 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-label={t(bi('Open menu', 'Buka menu'))}
            className="grid min-h-11 min-w-11 place-items-center rounded-full bg-white text-[#1c1412]"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 5h16M3 11h16M3 17h16" />
            </svg>
          </button>
          <a href={href('home')} className="flex min-h-11 items-center gap-2 rounded-lg text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6;
                return <line key={i} x1={16 + Math.cos(a) * 5} y1={16 + Math.sin(a) * 5} x2={16 + Math.cos(a) * 14} y2={16 + Math.sin(a) * 14} />;
              })}
            </svg>
            KAF First Card
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={state.demo}
            onClick={toggleDemo}
            className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${state.demo ? 'border-white bg-white text-[#1c1412]' : 'border-white/80 bg-transparent text-white hover:bg-white/10'}`}
          >
            {t(bi('Guide', 'Panduan'))}
          </button>
          <div role="group" aria-label={t(bi('Language', 'Bahasa'))} className="flex overflow-hidden rounded-full border-2 border-white">
            {(['en', 'ms'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => patch({ lang: l })}
                className={`min-h-11 min-w-12 px-3 text-sm font-bold ${lang === l ? 'bg-white text-[#1c1412]' : 'bg-transparent text-white hover:bg-white/10'}`}
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
  const { state, resetAll } = useApp();
  const { t } = useLang();
  const { guard } = useContext(JourneyNavContext);
  const [confirmReset, setConfirmReset] = useState(false);
  const resetRef = useDialog<HTMLDivElement>(confirmReset, () => setConfirmReset(false));
  const current = TIMELINE_STAGES.findIndex((s) => s.route === route);
  // How far along the user is. Connector lines are only coloured up to this step.
  const reached = current >= 0 ? current : TIMELINE_STAGES.findIndex((s) => s.route === state.lastStage);
  const onCompare = route === 'compare';
  return (
    <nav aria-label={t(bi('Your journey', 'Perjalanan anda'))} className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-screen-2xl rounded-3xl bg-white/95 p-4 shadow-[0_16px_50px_rgba(60,8,8,0.28)] sm:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)]">
      <ol className="flex">
        {TIMELINE_STAGES.map((s, i) => {
          const isCurrent = i === current;
          const done = state.done[s.key];
          const skipped = !done && state.skipped[s.key];
          const last = i === TIMELINE_STAGES.length - 1;
          const circle = isCurrent
            ? 'border-cyan-700 bg-cyan-700 text-white'
            : done
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : skipped
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-slate-300 bg-white text-slate-600';
          const text = isCurrent ? 'text-cyan-800' : done ? 'text-emerald-900' : skipped ? 'text-orange-800' : 'text-slate-700';
          const status = isCurrent ? bi('you are here', 'anda di sini') : done ? bi('done', 'siap') : skipped ? bi('skipped', 'dilangkau') : bi('not started', 'belum bermula');
          return (
            <li key={s.key} className="relative min-w-0 flex-1" aria-current={isCurrent ? 'step' : undefined}>
              {!last && (
                <span aria-hidden="true" className={`absolute left-1/2 top-[1.15rem] h-1 w-full rounded ${i >= reached ? 'bg-slate-300' : done ? 'bg-emerald-500' : skipped ? 'bg-orange-400' : 'bg-slate-300'}`} />
              )}
              <a
                href={href(s.route)}
                onClick={(e) => guard(s.route, e)}
                className="relative flex min-h-14 flex-col items-center gap-1 px-1 text-center text-xs font-semibold sm:text-sm"
              >
                <span aria-hidden="true" className={`z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-4 text-base font-bold ${circle}`}>
                  {isCurrent ? i + 1 : done ? '✓' : skipped ? '!' : i + 1}
                </span>
                <span className={text}>
                  {t(s.label)}
                  <span className="sr-only"> ({t(status)})</span>
                </span>
                {isCurrent && <span aria-hidden="true" className="text-[0.7rem] font-bold uppercase tracking-wide text-cyan-700">{t(bi('You are here', 'Anda di sini'))}</span>}
                {skipped && !isCurrent && <span aria-hidden="true" className="text-[0.7rem] font-bold uppercase tracking-wide text-orange-700">{t(bi('Skipped', 'Dilangkau'))}</span>}
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 text-sm">
        <a
          href={href('compare')}
          aria-current={onCompare ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-4 font-semibold ${onCompare ? 'bg-cyan-700 text-white' : 'text-cyan-800 underline'}`}
        >
          {t(bi('Compare cards', 'Banding kad'))} ({t(bi('optional', 'pilihan'))})
        </a>
        <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold text-slate-700 underline">
          {t(bi('Reset and start over', 'Set semula dan mula semula'))}
        </button>
      </div>
      {confirmReset && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/50 p-4">
          <div ref={resetRef} role="alertdialog" aria-modal="true" aria-labelledby="reset-h" aria-describedby="reset-d" tabIndex={-1} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 id="reset-h" className="text-xl font-extrabold">{t(bi('Reset the whole process?', 'Set semula keseluruhan proses?'))}</h2>
            <p id="reset-d" className="mt-2 text-slate-700">
              {t(bi(
                'This clears your answers, application draft, chosen card and progress, then takes you back to Am I ready?. Workshop feedback is kept.',
                'Ini memadam jawapan, draf permohonan, kad pilihan dan kemajuan anda, kemudian membawa anda kembali ke Sedia kah saya?. Maklum balas bengkel dikekalkan.',
              ))}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button data-autofocus variant="secondary" onClick={() => setConfirmReset(false)}>{t(bi('Cancel', 'Batal'))}</Button>
              <Button onClick={() => { setConfirmReset(false); resetAll(); navigate('ready'); }}>{t(bi('Reset and start', 'Set semula dan mula'))}</Button>
            </div>
          </div>
        </div>
      )}
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
    <footer className="mt-12 rounded-t-[2rem] bg-white/95">
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
