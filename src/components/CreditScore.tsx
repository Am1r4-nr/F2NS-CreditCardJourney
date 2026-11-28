import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href } from '../lib/router.ts';
import { fmtDate } from '../lib/format.ts';
import { newId, todayIso } from '../lib/usage.ts';
import { SCORE_MAX, SCORE_MIN, SCORE_SOURCES, chartPoints, chartRange, scoreTrend, sortedScores, validateScore } from '../lib/score.ts';
import { Button, Callout, Field, inputClass } from './ui.tsx';

const W = 560;
const H = 180;

/** Track a credit score over time. The user types in what their own report shows. */
export function CreditScore() {
  const { t, lang } = useLang();
  const { state, update } = useApp();
  const today = todayIso();
  const [score, setScore] = useState('');
  const [date, setDate] = useState(today);
  const [source, setSource] = useState<string>(SCORE_SOURCES[0]);
  const [error, setError] = useState<ReturnType<typeof bi> | null>(null);

  const entries = state.scores;
  const trend = scoreTrend(entries);
  const sorted = sortedScores(entries);
  const pts = chartPoints(entries, W, H, 12, 44);
  const range = chartRange(entries);
  const ticks = [0, 1, 2, 3].map((k) => Math.round((range.min + ((range.max - range.min) * k) / 3) / 5) * 5);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const err = validateScore(score, date, today);
    setError(err ?? null);
    if (err) return;
    update((s) => ({ ...s, scores: [...s.scores, { id: newId('sc'), date, score: Number(score), source }] }));
    setScore('');
  }
  const remove = (id: string) => update((s) => ({ ...s, scores: s.scores.filter((x) => x.id !== id) }));

  const arrow = trend?.direction === 'up' ? '▲' : trend?.direction === 'down' ? '▼' : '■';
  const trendWords = trend?.change == null
    ? bi('Add another check later to see how it moves.', 'Tambah semakan lain kemudian untuk melihat perubahannya.')
    : trend.direction === 'up'
      ? bi(`Up ${trend.change} since your last check`, `Naik ${trend.change} sejak semakan terakhir anda`)
      : trend.direction === 'down'
        ? bi(`Down ${Math.abs(trend.change)} since your last check`, `Turun ${Math.abs(trend.change)} sejak semakan terakhir anda`)
        : bi('No change since your last check', 'Tiada perubahan sejak semakan terakhir anda');

  return (
    <div className="mt-4 space-y-6">
      <Callout tone="info" title={t(bi('We cannot see your credit score', 'Kami tidak dapat melihat skor kredit anda'))}>
        {t(bi('Get your score from your own report, for example from CTOS or RAM Credit, then type it in here. We keep the history and show how it moves. Each bureau has its own scale, so only compare scores from the same one.', 'Dapatkan skor anda daripada laporan anda sendiri, contohnya daripada CTOS atau RAM Credit, kemudian taip di sini. Kami menyimpan sejarah dan menunjukkan perubahannya. Setiap biro ada skala sendiri, jadi bandingkan skor daripada biro yang sama sahaja.'))}
      </Callout>

      <form onSubmit={add} noValidate className="grid gap-4 rounded-2xl bg-white/60 p-4 sm:grid-cols-3">
        <Field label={bi('Score', 'Skor')} hint={bi(`${SCORE_MIN} to ${SCORE_MAX}`, `${SCORE_MIN} hingga ${SCORE_MAX}`)} error={error ?? undefined}>
          {({ id, describedBy, invalid }) => (
            <input id={id} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} value={score} onChange={(e) => setScore(e.target.value)} className={inputClass(invalid)} />
          )}
        </Field>
        <Field label={bi('Date checked', 'Tarikh disemak')}>
          {({ id }) => <input id={id} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(false)} />}
        </Field>
        <Field label={bi('Where from', 'Daripada mana')}>
          {({ id }) => (
            <select id={id} value={source} onChange={(e) => setSource(e.target.value)} className={inputClass(false)}>
              {SCORE_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <div className="sm:col-span-3">
          <Button type="submit">{t(bi('Add score', 'Tambah skor'))}</Button>
        </div>
      </form>

      {!trend ? (
        <p className="rounded-2xl bg-[#fff1e8] p-4 text-base text-slate-700">{t(bi('No scores yet. Add the first one above and your history starts here.', 'Belum ada skor. Tambah yang pertama di atas dan sejarah anda bermula di sini.'))}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600">{t(bi('Latest score', 'Skor terkini'))} · {trend.latest.source} · {fmtDate(trend.latest.date, lang)}</p>
              <p className="text-5xl font-extrabold">{trend.latest.score}</p>
            </div>
            <p className={`text-base font-semibold ${trend.direction === 'up' ? 'text-emerald-800' : trend.direction === 'down' ? 'text-rose-800' : 'text-slate-800'}`}>
              <span aria-hidden="true">{arrow} </span>{t(trendWords)}
            </p>
          </div>

          <figure>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-2xl bg-white ring-1 ring-black/10" role="img" aria-label={t(bi(`Credit score history, ${sorted.length} checks, latest ${trend.latest.score}`, `Sejarah skor kredit, ${sorted.length} semakan, terkini ${trend.latest.score}`))}>
              {ticks.map((v) => {
                const y = 12 + (1 - (v - range.min) / (range.max - range.min)) * (H - 24);
                return (
                  <g key={v}>
                    <line x1="0" x2={W} y1={y} y2={y} stroke="#e2e8f0" />
                    <text x="4" y={y - 3} fontSize="10" fill="#475569">{v}</text>
                  </g>
                );
              })}
              {pts.length > 1 && <polyline fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinejoin="round" points={pts.map((p) => `${p.x},${p.y}`).join(' ')} />}
              {pts.map((p) => <circle key={p.entry.id} cx={p.x} cy={p.y} r="5" fill="#b91c1c" stroke="#fff" strokeWidth="2" />)}
            </svg>
            <figcaption className="mt-1 text-sm text-slate-600">{t(bi('Each dot is one check, oldest on the left. The scale zooms to your scores.', 'Setiap titik ialah satu semakan, yang terlama di kiri. Skala disesuaikan dengan skor anda.'))}</figcaption>
          </figure>

          <ul className="divide-y divide-slate-200">
            {[...sorted].reverse().map((e) => (
              <li key={e.id} className="flex items-center gap-4 py-3">
                <span className="w-16 text-2xl font-extrabold">{e.score}</span>
                <span className="min-w-0 flex-1 text-sm text-slate-600">{fmtDate(e.date, lang)} · {e.source}</span>
                <button type="button" onClick={() => remove(e.id)} aria-label={`${t(bi('Remove score', 'Buang skor'))} ${e.score}, ${fmtDate(e.date, lang)}`} className="min-h-11 rounded-lg px-3 font-semibold text-cyan-800 underline">{t(bi('Remove', 'Buang'))}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-[#fff1e8] p-4">
        <h3 className="text-lg font-bold">{t(bi('What moves your score', 'Apa yang menggerakkan skor anda'))}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-base">
          <li>{t(bi('Pay at least the minimum by the due date, every month. Paying in full is best.', 'Bayar sekurang-kurangnya minimum sebelum tarikh akhir, setiap bulan. Bayar penuh adalah terbaik.'))}</li>
          <li>{t(bi('Keep your balance under about 30% of your limit.', 'Pastikan baki anda di bawah kira-kira 30% daripada had anda.'))}</li>
          <li>{t(bi('Do not apply for many cards at once. Each application is recorded.', 'Jangan memohon banyak kad serentak. Setiap permohonan direkodkan.'))}</li>
        </ul>
        <p className="mt-3 text-base">
          <a href={href('use')} className="font-semibold text-cyan-800 underline">{t(bi('See your card usage', 'Lihat penggunaan kad anda'))}</a>
          {' · '}
          <a href={href('learn')} className="font-semibold text-cyan-800 underline">{t(bi('Learn how credit scores work', 'Ketahui cara skor kredit berfungsi'))}</a>
        </p>
      </div>
    </div>
  );
}
