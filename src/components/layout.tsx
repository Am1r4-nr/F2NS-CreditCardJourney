import { useEffect, useRef, useState } from 'react';
import { useLang, bi } from '../i18n/index.tsx';
import { hafizDemoState, useApp } from '../state/store.tsx';
import { href, navigate, type Route } from '../lib/router.ts';
import { PLACEHOLDERS } from '../config/rates.ts';
import type { StageKey } from '../state/types.ts';
import { Button, Callout } from './ui.tsx';
import { delay } from '../lib/mockApi.ts';

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

export const MAIN_NAV: { route: Route; label: ReturnType<typeof bi> }[] = [
  { route: 'home', label: bi('Home', 'Utama') },
  { route: 'ready', label: bi('Am I ready?', 'Sedia kah saya?') },
  { route: 'compare', label: bi('Compare cards', 'Banding kad') },
  { route: 'cost', label: bi('Cost', 'Kos') },
  { route: 'apply', label: bi('Apply', 'Mohon') },
  { route: 'track', label: bi('Track', 'Jejak') },
  { route: 'use', label: bi('Use it well', 'Guna dengan bijak') },
  { route: 'pricing', label: bi('Pricing', 'Harga') },
];

export function Header({ route }: { route: Route }) {
  const { state, patch, update } = useApp();
  const { t, lang } = useLang();

  function toggleDemo() {
    if (state.demo) {
      patch({ demo: false });
    } else {
      update((s) => hafizDemoState(s));
      navigate('home');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 sm:px-8 lg:px-12 py-2">
        <a href={href('home')} className="flex min-h-11 items-center gap-2 rounded-lg text-xl font-extrabold text-cyan-800">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white">K</span>
          KAF First Card
        </a>
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
      <nav aria-label={t(bi('Main', 'Utama'))} className="mx-auto flex max-w-screen-2xl gap-1 overflow-x-auto px-4 sm:px-8 lg:px-12 pb-2">
        {MAIN_NAV.map((n) => (
          <a
            key={n.route}
            href={href(n.route)}
            aria-current={route === n.route ? 'page' : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold ${route === n.route ? 'bg-cyan-700 text-white' : 'text-cyan-900 hover:bg-cyan-50'}`}
          >
            {t(n.label)}
          </a>
        ))}
      </nav>
    </header>
  );
}

export function Stepper({ route }: { route: Route }) {
  const { state } = useApp();
  const { t } = useLang();
  const current = STAGES.findIndex((s) => s.route === route);
  const onCompare = route === 'compare';
  const compareItem = (
    <li key="compare" className="flex-none self-stretch" aria-current={onCompare ? 'step' : undefined}>
      <a
        href={href('compare')}
        className={`flex h-full min-h-14 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-2 text-center text-xs font-semibold sm:text-sm ${onCompare ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-cyan-300 bg-white text-cyan-900'}`}
      >
        <span>{t(bi('Compare cards', 'Banding kad'))}</span>
        <span className="text-[0.7rem] font-normal opacity-90">({t(bi('optional', 'pilihan'))})</span>
      </a>
    </li>
  );
  return (
    <nav aria-label={t(bi('Your journey', 'Perjalanan anda'))} className="mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 pt-4">
      <ol className="flex gap-1 sm:gap-2">
        {STAGES.flatMap((s, i) => {
          const isCurrent = i === current;
          const done = state.done[s.key];
          const item = (
            <li key={s.key} className="min-w-0 flex-1" aria-current={isCurrent ? 'step' : undefined}>
              <a
                href={href(s.route)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center text-xs font-semibold sm:flex-row sm:gap-2 sm:text-sm ${
                  isCurrent ? 'bg-cyan-700 text-white' : done ? 'bg-emerald-100 text-emerald-900' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${isCurrent ? 'bg-white text-cyan-800' : done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  {done && !isCurrent ? '✓' : i + 1}
                </span>
                <span>
                  {t(s.label)}
                  {done && <span className="sr-only"> ({t(bi('done', 'siap'))})</span>}
                </span>
              </a>
            </li>
          );
          return i === 0 ? [item, compareItem] : [item];
        })}
      </ol>
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
    <footer className="mt-12 border-t border-slate-200 bg-white">
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
export function HelpWidget({ lifted }: { lifted: boolean }) {
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
    <div className={`fixed right-4 z-40 ${lifted ? 'bottom-28 sm:bottom-24' : 'bottom-4'}`}>
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
