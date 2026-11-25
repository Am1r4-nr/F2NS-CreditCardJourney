import type { Bi } from '../lib/eligibility.ts';
import type { Route } from '../lib/router.ts';

export interface GuideAction {
  id: string;
  text: Bi;
  /** Where in the app the user can do or learn this. */
  link?: { route: Route; label: Bi };
}

export interface GuideMonth {
  n: 1 | 2 | 3;
  title: Bi;
  intro: Bi;
  actions: GuideAction[];
}

/** First three months with a card. Each month has at least three actions. */
export const GUIDE: GuideMonth[] = [
  {
    n: 1,
    title: { en: 'Month 1: Get set up', ms: 'Bulan 1: Sediakan' },
    intro: { en: 'Start small and set up the habits that keep you safe.', ms: 'Mulakan kecil dan sediakan tabiat yang memastikan anda selamat.' },
    actions: [
      { id: 'm1-activate', text: { en: 'Activate your card and set a PIN in the bank’s app.', ms: 'Aktifkan kad anda dan tetapkan PIN dalam aplikasi bank.' } },
      { id: 'm1-statement', text: { en: 'Find your statement date and due date, and put them in the tracker below.', ms: 'Cari tarikh penyata dan tarikh akhir anda, dan masukkan dalam penjejak di bawah.' }, link: { route: 'use', label: { en: 'Open the tracker', ms: 'Buka penjejak' } } },
      { id: 'm1-reminder', text: { en: 'Turn on a payment reminder, or set auto-debit for the full bill.', ms: 'Hidupkan peringatan bayaran, atau tetapkan debit automatik untuk bil penuh.' } },
      { id: 'm1-small', text: { en: 'Make one or two small purchases and pay the full bill on time.', ms: 'Buat satu atau dua pembelian kecil dan bayar bil penuh tepat masa.' } },
    ],
  },
  {
    n: 2,
    title: { en: 'Month 2: Build the habit', ms: 'Bulan 2: Bina tabiat' },
    intro: { en: 'Keep it simple. Pay in full and keep your spending low.', ms: 'Kekalkan mudah. Bayar penuh dan kekalkan perbelanjaan anda rendah.' },
    actions: [
      { id: 'm2-full', text: { en: 'Pay the full statement balance before the due date.', ms: 'Bayar baki penyata penuh sebelum tarikh akhir.' } },
      { id: 'm2-util', text: { en: 'Keep your spending under 30% of your limit.', ms: 'Kekalkan perbelanjaan anda di bawah 30% daripada had anda.' }, link: { route: 'learn', label: { en: 'What is utilisation?', ms: 'Apakah utilisation?' } } },
      { id: 'm2-check', text: { en: 'Read your statement and check every charge. Report any you do not know.', ms: 'Baca penyata anda dan semak setiap caj. Laporkan yang anda tidak kenal.' } },
      { id: 'm2-log', text: { en: 'Log your spending for the month so there are no surprises.', ms: 'Rekod perbelanjaan anda untuk bulan ini supaya tiada kejutan.' } },
    ],
  },
  {
    n: 3,
    title: { en: 'Month 3: Check your progress', ms: 'Bulan 3: Semak kemajuan anda' },
    intro: { en: 'Three on-time payments is a good start to your record.', ms: 'Tiga bayaran tepat masa ialah permulaan yang baik untuk rekod anda.' },
    actions: [
      { id: 'm3-ontime', text: { en: 'Check that you have paid on time every month. Aim for 3 out of 3.', ms: 'Semak anda telah membayar tepat masa setiap bulan. Sasar 3 daripada 3.' } },
      { id: 'm3-fee', text: { en: 'Look at the annual fee and what waives it. Plan to meet it, or ask the bank.', ms: 'Lihat yuran tahunan dan apa yang mengecualikannya. Rancang untuk memenuhinya, atau tanya bank.' } },
      { id: 'm3-learn', text: { en: 'Take the quick quiz to see what you remember.', ms: 'Ambil kuiz pantas untuk lihat apa yang anda ingat.' }, link: { route: 'learn', label: { en: 'Go to the quiz', ms: 'Ke kuiz' } } },
      { id: 'm3-more', text: { en: 'Hold off on applying for other cards for now. Let your record grow first.', ms: 'Tangguhkan memohon kad lain buat masa ini. Biar rekod anda berkembang dahulu.' } },
    ],
  },
];

export const GUIDE_TOTAL = GUIDE.reduce((n, m) => n + m.actions.length, 0);
