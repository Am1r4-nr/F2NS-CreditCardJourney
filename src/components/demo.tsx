import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { navigate } from '../lib/router.ts';
import { WALKTHROUGH } from '../data/walkthrough.ts';
import { Button } from './ui.tsx';

/** A step-by-step guide on how to use the site. Shown while the guide is open. */
export function Walkthrough() {
  const { t } = useLang();
  const { state, update, patch } = useApp();

  const total = WALKTHROUGH.length;
  const i = Math.max(0, Math.min(total - 1, state.walkStep));
  const step = WALKTHROUGH[i];

  function go(next: number) {
    const target = Math.max(0, Math.min(total - 1, next));
    update((st) => ({ ...st, walkStep: target }));
    navigate(WALKTHROUGH[target].route);
  }

  return (
    <aside aria-label={t(bi('How to use this site', 'Cara guna laman ini'))} className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-cyan-700 bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.18)]">
      <div className="mx-auto max-w-screen-2xl space-y-2 px-4 py-3 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-cyan-800">
            {t(bi('How to use this site', 'Cara guna laman ini'))} · {t(bi('Step', 'Langkah'))} {i + 1} / {total}
          </p>
          <Button variant="ghost" onClick={() => patch({ demo: false })}>{t(bi('Close guide', 'Tutup panduan'))}</Button>
        </div>
        <h2 className="text-lg font-extrabold">{t(step.title)}</h2>
        <ul className="list-disc space-y-1 pl-6 text-base">
          {step.points.map((p, k) => <li key={k}>{t(p)}</li>)}
        </ul>
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <Button variant="secondary" onClick={() => go(i - 1)} disabled={i === 0}>{t(bi('Back', 'Kembali'))}</Button>
          {i < total - 1 ? (
            <Button onClick={() => go(i + 1)}>{t(bi('Next', 'Seterusnya'))}</Button>
          ) : (
            <Button onClick={() => patch({ demo: false })}>{t(bi('Finish', 'Selesai'))}</Button>
          )}
        </div>
      </div>
    </aside>
  );
}