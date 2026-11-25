import type { Bi } from './eligibility.ts';
import { checkReadiness } from './eligibility.ts';
import { ageFromDob } from './apply.ts';
import { ELIGIBILITY } from '../config/rates.ts';
import type { Draft, Outcome } from '../state/types.ts';
import { addDays } from './usage.ts';
import { money } from './format.ts';

export type StageStatus = 'done' | 'current' | 'waiting';

export interface TrackStage {
  key: 'submitted' | 'verified' | 'review' | 'decision';
  label: Bi;
  /** What happens in this stage, in plain words. */
  what: Bi;
  /** How long it usually takes. */
  time: Bi;
}

export const TRACK_STAGES: TrackStage[] = [
  {
    key: 'submitted',
    label: { en: 'Submitted', ms: 'Dihantar' },
    what: { en: 'We received your application and gave you a reference number.', ms: 'Kami menerima permohonan anda dan memberi anda nombor rujukan.' },
    time: { en: 'Done right away', ms: 'Siap serta-merta' },
  },
  {
    key: 'verified',
    label: { en: 'Documents verified', ms: 'Dokumen disahkan' },
    what: { en: 'We check your identity and your income proof.', ms: 'Kami menyemak identiti dan bukti pendapatan anda.' },
    time: { en: 'Usually within a few hours', ms: 'Biasanya dalam beberapa jam' },
  },
  {
    key: 'review',
    label: { en: 'Under review', ms: 'Dalam semakan' },
    what: { en: 'A person looks at your details, your income and what you already owe.', ms: 'Seseorang menyemak butiran, pendapatan dan hutang sedia ada anda.' },
    time: { en: 'Same day, or 1 to 2 working days', ms: 'Hari yang sama, atau 1 hingga 2 hari bekerja' },
  },
  {
    key: 'decision',
    label: { en: 'Decision', ms: 'Keputusan' },
    what: { en: 'You get a final answer, with the reasons.', ms: 'Anda mendapat jawapan akhir, dengan sebab-sebabnya.' },
    time: { en: 'Same day, and at most 3 working days', ms: 'Hari yang sama, dan paling lama 3 hari bekerja' },
  },
];

/** Stage 0 to 3 is the stage in progress. At 3 the decision is out and every stage is done. */
export function stageStatus(index: number, current: number): StageStatus {
  if (current >= 3) return 'done';
  if (index < current) return 'done';
  if (index === current) return 'current';
  return 'waiting';
}

export const decisionReached = (current: number): boolean => current >= 3;

/** Adds working days (Monday to Friday) to a YYYY-MM-DD date. Public holidays are not counted out. */
export function addWorkingDays(iso: string, days: number): string {
  let d = iso;
  let left = days;
  while (left > 0) {
    d = addDays(d, 1);
    const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (dow !== 0 && dow !== 6) left -= 1;
  }
  return d;
}

/** The latest day the final decision is promised: 3 working days after submitting. */
export const latestDecisionDate = (submittedIso: string): string => addWorkingDays(submittedIso, 3);

export interface DecisionText {
  outcome: Outcome;
  reasons: Bi[];
  nextSteps: Bi[];
}

const FALLBACK_REJECT: Bi[] = [
  { en: `The income we could confirm is below ${money(ELIGIBILITY.minMonthlyIncome)} a month.`, ms: `Pendapatan yang dapat kami sahkan di bawah ${money(ELIGIBILITY.minMonthlyIncome)} sebulan.` },
  { en: 'Your monthly commitments are high compared with your income, which leaves little room for a card bill.', ms: 'Komitmen bulanan anda tinggi berbanding pendapatan, yang meninggalkan sedikit ruang untuk bil kad.' },
  { en: 'We could not find enough steady income in the records you gave us.', ms: 'Kami tidak menemui pendapatan tetap yang mencukupi dalam rekod yang anda berikan.' },
];

const FALLBACK_APPROVE: Bi[] = [
  { en: 'Your income was confirmed from your records.', ms: 'Pendapatan anda disahkan daripada rekod anda.' },
  { en: 'Your monthly commitments are comfortable compared with your income.', ms: 'Komitmen bulanan anda selesa berbanding pendapatan anda.' },
  { en: 'Your identity and documents checked out.', ms: 'Identiti dan dokumen anda lulus semakan.' },
];

function unique(list: Bi[]): Bi[] {
  const seen = new Set<string>();
  return list.filter((b) => (seen.has(b.en) ? false : (seen.add(b.en), true)));
}

/** Builds the reasons and next steps for the demo decision from what the user entered. Always at least 2 reasons. */
export function decisionText(outcome: Outcome, draft: Draft): DecisionText {
  const dobAge = ageFromDob(draft.identity.dob);
  const age = Number.isNaN(dobAge) ? 25 : dobAge;
  const income = draft.proof ? String(draft.proof.avgMonthly) : draft.income || '0';
  const r = checkReadiness({ age: String(age), incomeType: draft.employment, income, commitments: draft.commitments });

  let reasons: Bi[];
  if (outcome === 'rejected') {
    const own = [...r.reasons.filter((x) => x.status === 'problem'), ...r.reasons.filter((x) => x.status === 'check')].map((x) => x.text);
    reasons = unique([...own, ...FALLBACK_REJECT]).slice(0, 3);
  } else {
    const own = r.reasons.filter((x) => x.status === 'good').map((x) => x.text);
    reasons = unique([...own, ...FALLBACK_APPROVE]).slice(0, 3);
  }

  const nextSteps: Bi[] =
    outcome === 'rejected'
      ? [
          { en: 'You can apply again. A no today does not stop you from applying later. A good time to try again is in 3 months.', ms: 'Anda boleh memohon semula. Jawapan tidak hari ini tidak menghalang anda daripada memohon kemudian. Masa yang baik untuk mencuba lagi ialah 3 bulan.' },
          { en: 'Keep your earnings in one bank or e-wallet account for the next 6 months. It is the easiest way to prove steady income.', ms: 'Simpan pendapatan anda dalam satu akaun bank atau e-dompet untuk 6 bulan akan datang. Ia cara termudah untuk membuktikan pendapatan tetap.' },
          { en: 'Pay down what you owe each month, so your commitments are under 40% of your income.', ms: 'Kurangkan hutang anda setiap bulan, supaya komitmen anda di bawah 40% daripada pendapatan anda.' },
          { en: 'Think about a card backed by a fixed deposit. Some banks offer them to people with little credit history.', ms: 'Fikirkan kad yang disandarkan dengan simpanan tetap. Sesetengah bank menawarkannya kepada mereka yang sejarah kreditnya sedikit.' },
          { en: 'Talk to a person. Use the Help button to chat or call, and ask what you can change.', ms: 'Bercakap dengan seseorang. Guna butang Bantuan untuk chat atau panggil, dan tanya apa yang boleh anda ubah.' },
        ]
      : [
          { en: 'Activate your card and set your PIN in the app.', ms: 'Aktifkan kad anda dan tetapkan PIN dalam aplikasi.' },
          { en: 'Set a reminder for your due date, and plan to pay the full bill each month.', ms: 'Tetapkan peringatan untuk tarikh akhir, dan rancang untuk membayar bil penuh setiap bulan.' },
          { en: 'Try to use less than 30% of your limit.', ms: 'Cuba gunakan kurang daripada 30% had anda.' },
          { en: 'We never ask for your TAC or password via WhatsApp or call.', ms: 'Kami tidak pernah meminta TAC atau kata laluan anda melalui WhatsApp atau panggilan.' },
        ];
  return { outcome, reasons, nextSteps };
}
