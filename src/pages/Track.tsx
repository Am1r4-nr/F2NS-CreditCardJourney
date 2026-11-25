import { useEffect, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href } from '../lib/router.ts';
import { Badge, Button, Callout, Card, LinkButton, PageTitle } from '../components/ui.tsx';
import { SelectedCardChip } from '../components/cards.tsx';
import { ScamNote } from '../components/layout.tsx';
import { DECISION_TIME, RATES } from '../config/rates.ts';
import { fmtDate, money } from '../lib/format.ts';
import { TRACK_STAGES, addWorkingDays, decisionReached, decisionText, latestDecisionDate, stageStatus } from '../lib/track.ts';
import { todayIso } from '../lib/usage.ts';
import type { Outcome } from '../state/types.ts';

const DEMO_REF = 'KAF-DEMO01';

export function TrackPage() {
  const { t, lang } = useLang();
  const { state, update } = useApp();
  const { submission, track, draft } = state;
  const [controls, setControls] = useState(true);
  const [announce, setAnnounce] = useState('');

  const isDemo = !submission;
  const ref = submission?.ref ?? DEMO_REF;
  const submittedOn = submission ? submission.at.slice(0, 10) : todayIso();
  const reached = decisionReached(track.stage);
  const text = decisionText(track.outcome, draft);

  // Mark the Track stage as done once the decision is out.
  useEffect(() => {
    if (reached && !state.done.track) update((s) => ({ ...s, done: { ...s.done, track: true } }));
  }, [reached, state.done.track, update]);

  const setStage = (n: number) => {
    const stage = Math.max(0, Math.min(3, n)) as 0 | 1 | 2 | 3;
    update((s) => ({ ...s, track: { ...s.track, stage } }));
    setAnnounce(t(bi(`Now at: ${TRACK_STAGES[stage].label.en}`, `Kini di: ${TRACK_STAGES[stage].label.ms}`)));
  };
  const setOutcome = (outcome: Outcome) => {
    update((s) => ({ ...s, track: { ...s.track, outcome } }));
    setAnnounce(outcome === 'approved' ? t(bi('Showing the Approved demo.', 'Menunjukkan demo Diluluskan.')) : t(bi('Showing the Rejected demo.', 'Menunjukkan demo Ditolak.')));
  };

  const dates = [
    fmtDate(submittedOn, lang),
    fmtDate(submittedOn, lang),
    `${fmtDate(submittedOn, lang)} – ${fmtDate(addWorkingDays(submittedOn, 2), lang)}`,
    `${t(bi('by', 'sebelum'))} ${fmtDate(latestDecisionDate(submittedOn), lang)}`,
  ];

  const verdictLine = submission
    ? {
        likely: bi('In principle: likely to be approved.', 'Dalam prinsip: berkemungkinan diluluskan.'),
        maybe: bi('In principle: needs a closer look.', 'Dalam prinsip: perlu disemak lebih teliti.'),
        notyet: bi('In principle: may be hard to approve.', 'Dalam prinsip: mungkin sukar diluluskan.'),
      }[submission.inPrinciple]
    : null;

  return (
    <div className="space-y-6">
      <PageTitle
        title={t(bi('Track your application', 'Jejak permohonan anda'))}
        intro={t(bi('See where your application is, how long it takes, and why a decision was made.', 'Lihat di mana permohonan anda, berapa lama ia mengambil masa, dan sebab keputusan dibuat.'))}
      />

      <SelectedCardChip showClear={false} />

      {isDemo && (
        <Callout tone="info" title={t(bi('This is a demo', 'Ini ialah demo'))}>
          <p>{t(bi('You have not sent an application yet, so this shows an example. Send one in the Apply stage to track your own.', 'Anda belum menghantar permohonan, jadi ini menunjukkan contoh. Hantar satu di peringkat Mohon untuk menjejak permohonan anda sendiri.'))}</p>
          <div className="mt-3"><LinkButton href={href('apply')}>{t(bi('Go to Apply', 'Ke Mohon'))}</LinkButton></div>
        </Callout>
      )}

      <Card className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-slate-600">{t(bi('Reference number', 'Nombor rujukan'))}</p>
          <p className="text-2xl font-bold tracking-wide">{ref}</p>
          {isDemo && <Badge tone="warn">{t(bi('Demo', 'Demo'))}</Badge>}
        </div>
        <div>
          <p className="text-sm text-slate-600">{t(bi('Final approval', 'Kelulusan akhir'))}</p>
          <p className="text-lg font-bold">{t(bi(DECISION_TIME.en, DECISION_TIME.ms))}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">{t(bi('First answer (in principle)', 'Jawapan pertama (dalam prinsip)'))}</p>
          <p className="text-lg font-bold">{verdictLine ? t(verdictLine) : t(bi('Shown after you apply', 'Dipaparkan selepas anda memohon'))}</p>
        </div>
      </Card>

      <section aria-labelledby="timeline-h">
        <h2 id="timeline-h" className="mb-3 text-2xl font-extrabold">{t(bi('Where is my application?', 'Di mana permohonan saya?'))}</h2>
        <ol className="space-y-0">
          {TRACK_STAGES.map((s, i) => {
            const st = stageStatus(i, track.stage);
            const mark = st === 'done' ? '✓' : st === 'current' ? '●' : '○';
            const word = st === 'done' ? bi('Done', 'Siap') : st === 'current' ? bi('In progress', 'Sedang berjalan') : bi('Waiting', 'Menunggu');
            return (
              <li key={s.key} aria-current={st === 'current' ? 'step' : undefined} className="relative flex gap-4 pb-6 last:pb-0">
                {i < TRACK_STAGES.length - 1 && <span aria-hidden="true" className={`absolute left-[1.15rem] top-10 bottom-0 w-1 rounded ${st === 'done' ? 'bg-emerald-500' : 'bg-slate-300'}`} />}
                <span aria-hidden="true" className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 text-lg font-bold ${st === 'done' ? 'border-emerald-600 bg-emerald-600 text-white' : st === 'current' ? 'border-cyan-700 bg-white text-cyan-700' : 'border-slate-300 bg-white text-slate-500'}`}>
                  {mark}
                </span>
                <div className={`min-w-0 flex-1 rounded-2xl border p-4 ${st === 'current' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-extrabold">{t(s.label)}</h3>
                    <Badge tone={st === 'done' ? 'good' : st === 'current' ? 'info' : 'warn'}><span aria-hidden="true">{mark} </span>{t(word)}</Badge>
                  </div>
                  <p className="mt-1 text-base">{t(s.what)}</p>
                  <p className="mt-1 text-sm text-slate-700">⏱ {t(s.time)} · {dates[i]}</p>
                  {s.key === 'verified' && st !== 'waiting' && draft.proof && (
                    <p className="mt-1 text-sm text-slate-700">
                      {t(bi('Income proof: ', 'Bukti pendapatan: '))}{draft.proof.source}. {t(bi('Average', 'Purata'))} {money(draft.proof.avgMonthly)} {t(bi('a month', 'sebulan'))}.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {reached ? (
        <section aria-labelledby="decision-h" className="space-y-4">
          <h2 id="decision-h" tabIndex={-1} className="text-2xl font-extrabold">{t(bi('Your decision', 'Keputusan anda'))}</h2>
          {track.outcome === 'approved' ? (
            <Card className="space-y-4 border-emerald-400 bg-emerald-50/60">
              <p className="text-3xl font-bold text-emerald-900">✔ {t(bi('Approved', 'Diluluskan'))}</p>
              <p className="text-lg">
                {t(bi('Your illustrative credit limit is', 'Had kredit ilustrasi anda ialah'))} <strong>{money(RATES.approvedDemoLimit)}</strong>. {t(bi('This is a demo, not a real limit.', 'Ini demo, bukan had sebenar.'))}
              </p>
              <ReasonList title={bi('Why we said yes', 'Mengapa kami kata ya')} items={text.reasons} />
              <StepList title={bi('What to do first', 'Apa yang perlu dibuat dahulu')} items={text.nextSteps} />
              <div className="flex flex-wrap gap-3">
                <LinkButton href={href('use')}>{t(bi('Next: Use it well', 'Seterusnya: Guna dengan bijak'))}</LinkButton>
                <LinkButton href={href('learn')} variant="secondary">{t(bi('Learn how to use it well', 'Belajar cara menggunakannya dengan bijak'))}</LinkButton>
              </div>
            </Card>
          ) : (
            <Card className="space-y-4 border-rose-300 bg-rose-50/50">
              <p className="text-3xl font-bold text-rose-900">✘ {t(bi('Not approved this time', 'Tidak diluluskan kali ini'))}</p>
              <p className="text-lg">{t(bi('Thank you for applying. Here is why, and what you can do next. This is not the end. You can apply again later.', 'Terima kasih kerana memohon. Ini sebabnya, dan apa yang boleh anda buat seterusnya. Ini bukan pengakhiran. Anda boleh memohon semula kemudian.'))}</p>
              <ReasonList title={bi('Why', 'Sebabnya')} items={text.reasons} />
              <StepList title={bi('What you can do next', 'Apa yang boleh anda buat seterusnya')} items={text.nextSteps} />
              <div className="flex flex-wrap gap-3">
                <LinkButton href={href('ready')}>{t(bi('See my "how to qualify" plan', 'Lihat pelan "cara untuk layak" saya'))}</LinkButton>
                <LinkButton href={href('compare')} variant="secondary">{t(bi('Compare other cards', 'Banding kad lain'))}</LinkButton>
              </div>
              <p className="text-sm text-slate-700">{t(bi('Banks can see that you applied. Try not to apply for many cards at once.', 'Bank boleh melihat bahawa anda telah memohon. Cuba elakkan memohon banyak kad serentak.'))}</p>
            </Card>
          )}
        </section>
      ) : (
        <Callout tone="info" title={t(bi('Your decision is not ready yet', 'Keputusan anda belum sedia'))}>
          {t(bi(`We will tell you within ${DECISION_TIME.en}. You do not need to do anything now.`, `Kami akan memberitahu anda dalam ${DECISION_TIME.ms}. Anda tidak perlu buat apa-apa sekarang.`))}
        </Callout>
      )}

      <Card className="space-y-3">
        <h2 className="text-xl font-extrabold">{t(bi('Need a hand?', 'Perlukan bantuan?'))}</h2>
        <p className="text-base">{t(bi('Use the “Help: chat or call” button at the bottom right. A person can tell you where your application is.', 'Guna butang “Bantuan: chat atau panggil” di bahagian bawah kanan. Seseorang boleh memberitahu anda di mana permohonan anda.'))}</p>
        <ScamNote />
      </Card>

      <section aria-labelledby="demo-h" className="rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="demo-h" className="text-xl font-extrabold">{t(bi('Demo controls', 'Kawalan demo'))}</h2>
          <Button variant="secondary" aria-expanded={controls} aria-controls="demo-body" onClick={() => setControls((c) => !c)}>
            {controls ? t(bi('Hide', 'Sembunyi')) : t(bi('Show', 'Tunjuk'))}
          </Button>
        </div>
        {controls && (
          <div id="demo-body" className="mt-3 space-y-4">
            <p className="text-base">{t(bi('For presenting only. Switch the result and move the timeline.', 'Untuk pembentangan sahaja. Tukar keputusan dan gerakkan garis masa.'))}</p>
            <fieldset>
              <legend className="mb-2 font-extrabold">{t(bi('Outcome to show', 'Keputusan untuk ditunjukkan'))}</legend>
              <div className="grid max-w-md grid-cols-2 gap-2">
                {(['approved', 'rejected'] as const).map((o) => (
                  <label key={o} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 font-semibold ${track.outcome === o ? 'border-cyan-700 bg-white' : 'border-slate-300 bg-white/60'}`}>
                    <input type="radio" name="outcome" className="h-5 w-5" checked={track.outcome === o} onChange={() => setOutcome(o)} />
                    {o === 'approved' ? t(bi('Approved', 'Diluluskan')) : t(bi('Rejected', 'Ditolak'))}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setStage(track.stage - 1)} disabled={track.stage === 0}>{t(bi('Back one step', 'Undur satu langkah'))}</Button>
              <Button onClick={() => setStage(track.stage + 1)} disabled={reached}>{t(bi('Next step', 'Langkah seterusnya'))}</Button>
              <Button variant="secondary" onClick={() => setStage(3)} disabled={reached}>{t(bi('Skip to decision', 'Terus ke keputusan'))}</Button>
              <Button variant="ghost" onClick={() => setStage(0)}>{t(bi('Restart timeline', 'Mula semula garis masa'))}</Button>
            </div>
          </div>
        )}
      </section>

      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
    </div>
  );
}

function ReasonList({ title, items }: { title: ReturnType<typeof bi>; items: ReturnType<typeof bi>[] }) {
  const { t } = useLang();
  return (
    <div>
      <h3 className="mb-1 text-lg font-extrabold">{t(title)}</h3>
      <ul className="list-disc space-y-1 pl-5 text-base">{items.map((x, i) => <li key={i}>{t(x)}</li>)}</ul>
    </div>
  );
}

function StepList({ title, items }: { title: ReturnType<typeof bi>; items: ReturnType<typeof bi>[] }) {
  const { t } = useLang();
  return (
    <div>
      <h3 className="mb-1 text-lg font-extrabold">{t(title)}</h3>
      <ol className="list-decimal space-y-1 pl-5 text-base">{items.map((x, i) => <li key={i}>{t(x)}</li>)}</ol>
    </div>
  );
}
