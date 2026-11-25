import { useEffect, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { hafizDemoState, useApp } from '../state/store.tsx';
import { navigate } from '../lib/router.ts';
import { TARGET_SECONDS, WALKTHROUGH, WALK_TOTAL_SECONDS, formatClock } from '../data/walkthrough.ts';
import { Button } from './ui.tsx';

/** A guided walkthrough for the presenter. Shown while Demo mode is on. */
export function Walkthrough() {
  const { t } = useLang();
  const { state, update, patch } = useApp();
  const [now, setNow] = useState(() => Date.now());
  const [notes, setNotes] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const total = WALKTHROUGH.length;
  const i = Math.max(0, Math.min(total - 1, state.walkStep));
  const step = WALKTHROUGH[i];
  const elapsed = state.walkStartedAt ? Math.floor((now - state.walkStartedAt) / 1000) : 0;
  const over = elapsed > TARGET_SECONDS;
  // Where the presenter should be by now if every step takes its suggested time.
  const planned = WALKTHROUGH.slice(0, i).reduce((n, s) => n + s.seconds, 0);

  function go(next: number) {
    const target = Math.max(0, Math.min(total - 1, next));
    const s = WALKTHROUGH[target];
    update((st) => {
      const patched = s.patch ? s.patch(st) : st;
      return { ...patched, walkStep: target };
    });
    navigate(s.route);
  }

  function reset() {
    update((s) => hafizDemoState(s));
    navigate('home');
  }

  return (
    <aside aria-label={t(bi('Demo walkthrough', 'Panduan demo'))} className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-amber-500 bg-amber-50 shadow-[0_-6px_20px_rgba(0,0,0,0.18)]">
      <div className="mx-auto max-w-screen-2xl space-y-2 px-4 py-2 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-amber-950">
            🎬 {t(bi('Demo walkthrough', 'Panduan demo'))} · {t(bi('Step', 'Langkah'))} {i + 1} / {total}
          </p>
          <p className={`text-sm font-bold ${over ? 'text-rose-800' : 'text-amber-950'}`} aria-live="off">
            ⏱ {formatClock(elapsed)} / {formatClock(TARGET_SECONDS)} {over ? `(${t(bi('over time', 'lebih masa'))})` : ''}
            <span className="ml-2 font-normal text-slate-700">{t(bi('plan', 'rancangan'))} {formatClock(planned)} → {formatClock(planned + step.seconds)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg font-extrabold">{t(step.title)} <span className="text-sm font-semibold text-slate-700">({t(bi(`about ${step.seconds}s`, `kira-kira ${step.seconds}s`))})</span></h2>
          <button type="button" onClick={() => setNotes((n) => !n)} aria-expanded={notes} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-amber-950 underline">
            {notes ? t(bi('Hide talking points', 'Sembunyi nota')) : t(bi('Show talking points', 'Tunjuk nota'))}
          </button>
        </div>
        {notes && (
          <ul className="list-disc space-y-1 pl-6 text-base">
            {step.points.map((p, k) => <li key={k}>{t(p)}</li>)}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <Button variant="secondary" onClick={() => go(i - 1)} disabled={i === 0}>{t(bi('Back', 'Kembali'))}</Button>
          {i < total - 1 ? (
            <Button onClick={() => go(i + 1)}>{t(bi('Next', 'Seterusnya'))}</Button>
          ) : (
            <Button onClick={() => patch({ demo: false })}>{t(bi('Finish', 'Selesai'))}</Button>
          )}
          <Button variant="ghost" onClick={reset}>{t(bi('Reset demo', 'Set semula demo'))}</Button>
          <Button variant="ghost" onClick={() => patch({ demo: false })}>{t(bi('Turn off demo mode', 'Matikan mod demo'))}</Button>
          <span className="text-sm text-slate-700">{t(bi(`All steps add up to ${formatClock(WALK_TOTAL_SECONDS)}.`, `Semua langkah berjumlah ${formatClock(WALK_TOTAL_SECONDS)}.`))}</span>
        </div>
      </div>
    </aside>
  );
}
