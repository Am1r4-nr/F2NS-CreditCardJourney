import { useEffect, useRef, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { initialState, useApp } from '../state/store.tsx';
import { href, navigate } from '../lib/router.ts';
import { Button, Callout, LinkButton, PageTitle, ProgressBar, Spinner } from '../components/ui.tsx';
import { ScamNote } from '../components/layout.tsx';
import { SelectedCardChip } from '../components/cards.tsx';
import { CommitmentsQ, DocChecklist, EmailQ, EmploymentQ, IdentityQ, IncomeQ, PhoneQ, ProofQ, ReviewQ, SubmittedView, type QProps } from '../components/apply.tsx';
import { QUESTIONS, STEPS, ageFromDob, firstQuestionOfStep, minutesLeft, questionsOfStep, validateQuestion, type QId } from '../lib/apply.ts';
import { checkReadiness } from '../lib/eligibility.ts';
import { findCard } from '../data/cards.ts';
import { parseAmount } from '../lib/format.ts';
import { submitApplication } from '../lib/mockApi.ts';
import { useMedia } from '../lib/useMedia.ts';
import { AuthPanel } from '../components/auth.tsx';

export function ApplyPage() {
  const { t } = useLang();
  const { state, update, patchDraft } = useApp();
  const draft = state.draft;
  const card = findCard(state.selectedCardId);
  const isDesktop = useMedia('(min-width: 768px)');
  const [needAccount, setNeedAccount] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Set<QId>>(new Set());
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const q = Math.min(draft.q, QUESTIONS.length - 1);
  const cur = QUESTIONS[q];
  const step = cur.step;

  // Move focus to the step heading when the question or step changes.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    stepTitle.current?.focus();
  }, [q, saved]);

  // ----- Submitted -----
  if (state.submission) {
    return (
      <div>
        <PageTitle title={t(bi('Application sent', 'Permohonan dihantar'))} />
        <div className="mb-4"><SelectedCardChip showClear={false} /></div>
        <SubmittedView
          submission={state.submission}
          onTrack={() => navigate('track')}
          onNew={() => update((s) => ({ ...s, draft: initialState().draft, submission: null, done: { ...s.done, apply: false, track: false } }))}
        />
      </div>
    );
  }

  function beginApplication() {
    const fromReady = state.readyDone && draft.income === '';
    patchDraft({
      started: true,
      q: draft.savedAt !== null ? draft.q : 0,
      ...(fromReady ? { employment: state.ready.incomeType, income: state.ready.income, commitments: state.ready.commitments } : {}),
    });
  }

  // ----- Sign up first, so the answers can be saved -----
  if (!state.account && (needAccount || draft.started)) {
    return (
      <div className="space-y-4">
        <AuthPanel
          reason={bi('An account saves your answers as you go, so you can stop and carry on later.', 'Akaun menyimpan jawapan anda semasa anda isi, jadi anda boleh berhenti dan sambung kemudian.')}
          onDone={() => { setNeedAccount(false); if (!draft.started) beginApplication(); }}
        />
        <Button variant="ghost" onClick={() => { setNeedAccount(false); patchDraft({ started: false }); }}>{t(bi('Back to the checklist', 'Kembali ke senarai semak'))}</Button>
      </div>
    );
  }

  // ----- Intro: checklist first -----
  if (!draft.started) {
    const hasSaved = draft.savedAt !== null;
    const start = () => (state.account ? beginApplication() : setNeedAccount(true));

    return (
      <div className="space-y-6">
        <PageTitle
          title={t(bi('Apply for your first card', 'Mohon kad pertama anda'))}
          intro={t(bi('It takes about 5 minutes. Here is everything you may need, and what to do if you do not have it.', 'Ia mengambil masa kira-kira 5 minit. Ini semua yang mungkin anda perlukan, dan apa yang perlu dilakukan jika anda tidak memilikinya.'))}
        />
        <SelectedCardChip />
        {!card && (
          <Callout tone="info" title={t(bi('Not sure which card?', 'Tidak pasti kad mana?'))}>
            <p>{t(bi('You can pick one first. Or carry on and use our standard example terms.', 'Anda boleh pilih satu dahulu. Atau teruskan dan guna terma contoh standard kami.'))}</p>
            <a href={href('compare')} className="mt-1 inline-flex min-h-11 items-center font-semibold underline">{t(bi('Compare cards', 'Banding kad'))} →</a>
          </Callout>
        )}
        <section aria-labelledby="docs-h">
          <h2 id="docs-h" className="mb-3 text-2xl font-extrabold">{t(bi('Your document checklist', 'Senarai semak dokumen anda'))}</h2>
          <DocChecklist />
        </section>
        <ScamNote />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={start}>{hasSaved ? t(bi('Continue my saved application', 'Sambung permohonan tersimpan saya')) : t(bi('I am ready. Start', 'Saya sedia. Mula'))}</Button>
          <LinkButton href={href('ready')} variant="ghost">{t(bi('Check if I am ready first', 'Semak kesediaan saya dahulu'))}</LinkButton>
        </div>
      </div>
    );
  }

  // ----- Wizard -----
  const visible = isDesktop ? questionsOfStep(step) : [q];
  const isLast = visible.includes(QUESTIONS.length - 1);
  const progressIdx = isDesktop ? firstQuestionOfStep(step) : q;
  const progress = (progressIdx / QUESTIONS.length) * 100;
  const mins = minutesLeft(progressIdx);
  const stepLabel = STEPS.find((s) => s.n === step)!.label;

  const errorFor = (i: number) => {
    const id = QUESTIONS[i].id;
    return attempted || touched.has(id) ? validateQuestion(id, draft) : undefined;
  };
  const propsFor = (i: number): QProps => {
    const id = QUESTIONS[i].id;
    return {
      draft,
      patch: patchDraft,
      error: errorFor(i),
      onBlur: () => setTouched((s) => new Set(s).add(id)),
    };
  };

  function go(to: number) {
    setAttempted(false);
    setTouched(new Set());
    setSaved(false);
    patchDraft({ q: Math.max(0, Math.min(QUESTIONS.length - 1, to)) });
  }

  function validateVisible(): boolean {
    const bad = visible.filter((i) => validateQuestion(QUESTIONS[i].id, draft));
    if (bad.length === 0) return true;
    setAttempted(true);
    setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }), 50);
    setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 80);
    return false;
  }

  function next() {
    if (!validateVisible()) return;
    go(isDesktop ? firstQuestionOfStep(step + 1) : q + 1);
  }

  function back() {
    if (q === 0 || (isDesktop && step === 1)) {
      patchDraft({ started: false });
      return;
    }
    go(isDesktop ? firstQuestionOfStep(step - 1) : q - 1);
  }

  async function submit() {
    if (!validateVisible()) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      const dobAge = ageFromDob(draft.identity.dob);
      const readyAge = parseAmount(state.ready.age);
      const age = !Number.isNaN(dobAge) ? dobAge : !Number.isNaN(readyAge) ? readyAge : 25;
      const income = draft.proof ? String(draft.proof.avgMonthly) : draft.income;
      const verdict = checkReadiness({ age: String(age), incomeType: draft.employment, income, commitments: draft.commitments }).verdict;
      const submission = await submitApplication(verdict);
      update((s) => ({
        ...s,
        submission,
        track: { outcome: verdict === 'notyet' ? 'rejected' : 'approved', stage: 0 },
        done: { ...s.done, apply: true },
        draft: { ...s.draft, savedAt: null },
      }));
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function saveForLater() {
    patchDraft({ savedAt: new Date().toISOString() });
    setSaved(true);
  }

  function renderQuestion(i: number) {
    const id = QUESTIONS[i].id;
    const p = propsFor(i);
    switch (id) {
      case 'scan': return <IdentityQ {...p} />;
      case 'phone': return <PhoneQ {...p} />;
      case 'email': return <EmailQ {...p} />;
      case 'employment': return <EmploymentQ {...p} />;
      case 'income': return <IncomeQ {...p} />;
      case 'commitments': return <CommitmentsQ {...p} />;
      case 'proof': return <ProofQ {...p} />;
      case 'review': return <ReviewQ {...p} card={card} onEditStep={(s) => go(firstQuestionOfStep(s))} />;
    }
  }

  // ----- Saved confirmation -----
  if (saved) {
    return (
      <div className="space-y-4">
        <PageTitle title={t(bi('Saved. Come back any time.', 'Disimpan. Kembali bila-bila masa.'))} />
        <h2 ref={stepTitle} tabIndex={-1} className="sr-only">{t(bi('Application saved', 'Permohonan disimpan'))}</h2>
        <Callout tone="good" title={t(bi('Your progress is saved on this device', 'Kemajuan anda disimpan pada peranti ini'))}>
          {t(bi('We saved your answers up to here. When you come back, you will pick up where you stopped. Nothing is sent to anyone.', 'Kami menyimpan jawapan anda sehingga di sini. Apabila anda kembali, anda akan sambung dari tempat anda berhenti. Tiada apa-apa dihantar kepada sesiapa.'))}
        </Callout>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setSaved(false)}>{t(bi('Keep going now', 'Teruskan sekarang'))}</Button>
          <LinkButton href={href('home')} variant="secondary">{t(bi('Go to home', 'Ke utama'))}</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={t(bi('Apply for your first card', 'Mohon kad pertama anda'))} />
      <div className="mb-4"><SelectedCardChip /></div>

      <div className="mb-6 space-y-2" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-base font-bold">
            {t(bi('Step', 'Langkah'))} {step} {t(bi('of', 'daripada'))} {STEPS.length}: {t(stepLabel)}
          </p>
          <p className="text-base text-slate-700">⏱ {t(bi(`About ${mins} min left`, `Kira-kira ${mins} min lagi`))}</p>
        </div>
        <ProgressBar value={progress} label={t(bi('Application progress', 'Kemajuan permohonan'))} />
      </div>

      <h2 ref={stepTitle} tabIndex={-1} className="sr-only">
        {t(bi('Step', 'Langkah'))} {step}: {t(stepLabel)}
      </h2>

      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
        {visible.map((i) => <div key={QUESTIONS[i].id}>{renderQuestion(i)}</div>)}

        {submitError && <Callout tone="bad" title={t(bi('Something went wrong', 'Sesuatu tidak kena'))}>{t(bi('We could not send your application. Your answers are safe. Please try again.', 'Kami tidak dapat menghantar permohonan anda. Jawapan anda selamat. Sila cuba lagi.'))}</Callout>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={back} disabled={submitting}>{t(bi('Back', 'Kembali'))}</Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={saveForLater} disabled={submitting}>{t(bi('Save and continue later', 'Simpan dan sambung kemudian'))}</Button>
            {isLast ? (
              <Button onClick={() => void submit()} disabled={submitting}>
                {submitting ? <Spinner label={t(bi('Sending…', 'Menghantar…'))} /> : t(bi('Submit application', 'Hantar permohonan'))}
              </Button>
            ) : (
              <Button onClick={next}>{t(bi('Next', 'Seterusnya'))}</Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6"><ScamNote /></div>
    </div>
  );
}
