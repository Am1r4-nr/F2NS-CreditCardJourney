import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href } from '../lib/router.ts';
import { GUIDE, GUIDE_TOTAL } from '../data/guide.ts';
import { Card, ProgressBar } from './ui.tsx';

export function Guide() {
  const { t } = useLang();
  const { state, update } = useApp();
  const done = new Set(state.use.guide ?? []);
  const count = GUIDE.reduce((n, m) => n + m.actions.filter((a) => done.has(a.id)).length, 0);

  function toggle(id: string) {
    update((s) => {
      const set = new Set(s.use.guide ?? []);
      if (set.has(id)) set.delete(id); else set.add(id);
      return { ...s, use: { ...s.use, guide: [...set] } };
    });
  }

  return (
    <section aria-labelledby="guide-h" className="space-y-4">
      <div>
        <h2 id="guide-h" className="text-2xl font-extrabold">{t(bi('Your first 3 months', '3 bulan pertama anda'))}</h2>
        <p className="text-base text-slate-700">{t(bi('A simple checklist. Tick things off as you go.', 'Senarai semak mudah. Tandakan apabila siap.'))}</p>
        <div className="mt-2 space-y-1">
          <p className="font-semibold" aria-live="polite">{count} {t(bi('of', 'daripada'))} {GUIDE_TOTAL} {t(bi('done', 'siap'))}</p>
          <ProgressBar value={(count / GUIDE_TOTAL) * 100} label={t(bi('Checklist progress', 'Kemajuan senarai semak'))} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {GUIDE.map((m) => (
          <Card key={m.n} className="space-y-3">
            <h3 className="text-xl font-extrabold">{t(m.title)}</h3>
            <p className="text-base text-slate-700">{t(m.intro)}</p>
            <ul className="space-y-2">
              {m.actions.map((a) => (
                <li key={a.id}>
                  <label className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 p-3 text-base ${done.has(a.id) ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 bg-white'}`}>
                    <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={done.has(a.id)} onChange={() => toggle(a.id)} />
                    <span>
                      {t(a.text)}
                      {done.has(a.id) && <span className="sr-only"> ({t(bi('done', 'siap'))})</span>}
                    </span>
                  </label>
                  {a.link && <a href={href(a.link.route)} className="ml-3 inline-flex min-h-11 items-center font-semibold text-cyan-800 underline">{t(a.link.label)} →</a>}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
