import type { Bi } from '../lib/eligibility.ts';
import type { Route } from '../lib/router.ts';
import type { AppState } from '../state/types.ts';
import { sampleData, todayIso } from '../lib/usage.ts';

export interface WalkStep {
  route: Route;
  title: Bi;
  /** One or two sentences for the presenter to say. */
  points: Bi[];
  /** Suggested time in seconds. */
  seconds: number;
  /** Puts the app in the right state for this step. Safe to run again. */
  patch?: (s: AppState) => AppState;
}

export const TARGET_SECONDS = 300;

export const WALKTHROUGH: WalkStep[] = [
  {
    route: 'home',
    seconds: 25,
    title: { en: 'Meet Hafiz', ms: 'Kenali Hafiz' },
    points: [
      { en: 'Hafiz is 25 and drives for a delivery app. He has no payslip and has never had a credit card.', ms: 'Hafiz berumur 25 dan memandu untuk aplikasi penghantaran. Dia tiada slip gaji dan tidak pernah ada kad kredit.' },
      { en: 'His worry: “How do I prove my income?” Five stages answer it, shown at the top.', ms: 'Kebimbangannya: “Bagaimana saya membuktikan pendapatan?” Lima peringkat menjawabnya, ditunjukkan di atas.' },
    ],
  },
  {
    route: 'ready',
    seconds: 35,
    title: { en: '1. Am I ready?', ms: '1. Sedia kah saya?' },
    points: [
      { en: 'A quick check before he applies. Gig income is fine. It tells him the reasons, in plain words.', ms: 'Semakan pantas sebelum dia memohon. Pendapatan gig tidak mengapa. Ia memberitahunya sebab-sebab, dalam bahasa mudah.' },
      { en: 'Point out: this check does NOT affect his credit record.', ms: 'Tunjukkan: semakan ini TIDAK menjejaskan rekod kreditnya.' },
    ],
    patch: (s) => ({ ...s, readyDone: true, done: { ...s.done, ready: true } }),
  },
  {
    route: 'compare',
    seconds: 40,
    title: { en: 'Compare real cards', ms: 'Banding kad sebenar' },
    points: [
      { en: 'Real cards from 15 Malaysian banks, side by side. “Best match for me” uses what Hafiz told us.', ms: 'Kad sebenar daripada 15 bank di Malaysia, bersebelahan. “Padanan terbaik untuk saya” menggunakan apa yang Hafiz beritahu kami.' },
      { en: 'Show the filters, the tier buttons, and the Compare button (up to 3 cards).', ms: 'Tunjukkan penapis, butang tahap, dan butang Banding (sehingga 3 kad).' },
    ],
  },
  {
    route: 'cost',
    seconds: 40,
    title: { en: '2. What will it cost?', ms: '2. Berapa kosnya?' },
    points: [
      { en: 'Move the slider. Pay in full and it costs nothing extra. Pay only the minimum and he pays more, for months.', ms: 'Gerakkan slaid. Bayar penuh dan tiada kos tambahan. Bayar minimum sahaja dan dia membayar lebih, selama berbulan-bulan.' },
      { en: 'No hidden fees: every rate comes from one settings file.', ms: 'Tiada yuran tersembunyi: setiap kadar datang daripada satu fail tetapan.' },
    ],
    patch: (s) => ({ ...s, sim: { spend: 500, mode: 'minimum', fixed: 100 }, done: { ...s.done, cost: true } }),
  },
  {
    route: 'apply',
    seconds: 60,
    title: { en: '3. Apply', ms: '3. Mohon' },
    points: [
      { en: 'The document checklist comes first, with a backup for each item. Then 5 short steps: MyKad scan fills his details in.', ms: 'Senarai semak dokumen datang dahulu, dengan alternatif bagi setiap item. Kemudian 5 langkah pendek: imbasan MyKad mengisi butirannya.' },
      { en: 'Income proof: “connect bank or e-wallet” is recommended, so no payslip is needed. Show the “Why we ask this” notes and the full cost summary before submit.', ms: 'Bukti pendapatan: “hubungkan bank atau e-dompet” disyorkan, jadi slip gaji tidak diperlukan. Tunjukkan nota “Mengapa kami tanya” dan ringkasan kos penuh sebelum hantar.' },
    ],
    patch: (s) => ({ ...s, submission: null, draft: { ...s.draft, started: false, q: 0 } }),
  },
  {
    route: 'track',
    seconds: 35,
    title: { en: '4. Track: approved', ms: '4. Jejak: diluluskan' },
    points: [
      { en: 'He gets a first answer at once, and a clear timeline. Final approval: same day, at most 3 days.', ms: 'Dia mendapat jawapan pertama serta-merta, dan garis masa yang jelas. Kelulusan akhir: hari yang sama, paling lama 3 hari.' },
      { en: 'The approved screen gives the reasons and what to do first.', ms: 'Skrin diluluskan memberi sebab dan apa yang perlu dibuat dahulu.' },
    ],
    patch: (s) => ({
      ...s,
      submission: s.submission ?? { ref: 'KAF-DEMO01', at: new Date().toISOString(), inPrinciple: 'likely' },
      track: { outcome: 'approved', stage: 3 },
      done: { ...s.done, apply: true, track: true },
    }),
  },
  {
    route: 'track',
    seconds: 25,
    title: { en: '4. Track: rejected', ms: '4. Jejak: ditolak' },
    points: [
      { en: 'Now the other outcome. A rejection always comes with reasons and next steps, never a blank “no”.', ms: 'Kini keputusan yang satu lagi. Penolakan sentiasa disertakan sebab dan langkah seterusnya, bukan “tidak” kosong.' },
      { en: 'It says he can apply again later and how to reach a person.', ms: 'Ia menyatakan dia boleh memohon semula kemudian dan cara menghubungi seseorang.' },
    ],
    patch: (s) => ({ ...s, track: { outcome: 'rejected', stage: 3 } }),
  },
  {
    route: 'use',
    seconds: 40,
    title: { en: '5. Use it well', ms: '5. Guna dengan bijak' },
    points: [
      { en: 'After approval: when to pay, pay-in-full vs minimum, usage against his limit, and the on-time tracker.', ms: 'Selepas kelulusan: bila untuk bayar, bayar penuh vs minimum, penggunaan berbanding had, dan penjejak tepat masa.' },
      { en: 'The first-3-months checklist and the Learn quiz help him build a good record.', ms: 'Senarai semak 3 bulan pertama dan kuiz Belajar membantunya membina rekod yang baik.' },
    ],
    patch: (s) => {
      const d = sampleData(todayIso());
      return {
        ...s,
        track: { ...s.track, outcome: 'approved', stage: 3 },
        use: { ...s.use, statementDay: d.statementDay, txns: d.txns, payments: d.payments },
        done: { ...s.done, use: true },
      };
    },
  },
];

export const WALK_TOTAL_SECONDS = WALKTHROUGH.reduce((n, s) => n + s.seconds, 0);

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
