import type { Bi } from '../lib/eligibility.ts';
import { simulate } from '../lib/cost.ts';
import { money } from '../lib/format.ts';
import { RATES, UTILISATION_TARGET } from '../config/rates.ts';
import type { Route } from '../lib/router.ts';

export type Topic = 'record' | 'paying' | 'habits' | 'myths' | 'safety';

export const TOPICS: { id: Topic; label: Bi }[] = [
  { id: 'record', label: { en: 'Your credit record', ms: 'Rekod kredit anda' } },
  { id: 'paying', label: { en: 'Paying your bill', ms: 'Membayar bil anda' } },
  { id: 'habits', label: { en: 'Good habits', ms: 'Tabiat baik' } },
  { id: 'myths', label: { en: 'Myths', ms: 'Mitos' } },
  { id: 'safety', label: { en: 'Staying safe', ms: 'Kekal selamat' } },
];

export interface LearnCard {
  id: string;
  topic: Topic;
  icon: string;
  title: Bi;
  paragraphs: Bi[];
  bullets: Bi[];
  takeaway: Bi;
  /** A place in the app where the user can practise what the card taught. */
  link?: { route: Route; label: Bi };
}

const R = RATES;
// Numbers in the minimum-vs-full card come from the same config and simulator as the cost page.
const spend = 500;
const minOnly = simulate({ spend, mode: 'minimum', fixed: 0 });
const extra = Math.round((minOnly.total - spend) * 100) / 100;
const limit = R.approvedDemoLimit;
const target = Math.round((limit * UTILISATION_TARGET) / 100);

export const LEARN_CARDS: LearnCard[] = [
  {
    id: 'credit-score',
    topic: 'record',
    icon: '📒',
    title: { en: 'What are a credit score and CCRIS?', ms: 'Apakah skor kredit dan CCRIS?' },
    paragraphs: [
      { en: 'Banks want to know if you pay back what you borrow. They look at your credit record to find out.', ms: 'Bank mahu tahu sama ada anda membayar balik apa yang anda pinjam. Mereka melihat rekod kredit anda untuk mengetahuinya.' },
      { en: 'CCRIS is a record kept by Bank Negara Malaysia. It lists your loans and credit cards, and whether you paid on time. Credit bureaus such as CTOS and Experian use records like this to work out a credit score. A higher score means less risk for the bank.', ms: 'CCRIS ialah rekod yang disimpan oleh Bank Negara Malaysia. Ia menyenaraikan pinjaman dan kad kredit anda, dan sama ada anda membayar tepat masa. Biro kredit seperti CTOS dan Experian menggunakan rekod seperti ini untuk menentukan skor kredit. Skor lebih tinggi bermakna risiko lebih rendah untuk bank.' },
      { en: 'If you have never borrowed, your record is thin. That is not bad credit. It only means the bank has little to look at. A first card, paid on time, starts your record.', ms: 'Jika anda belum pernah meminjam, rekod anda nipis. Itu bukan kredit buruk. Ia hanya bermakna bank tidak banyak untuk dilihat. Kad pertama, yang dibayar tepat masa, memulakan rekod anda.' },
    ],
    bullets: [
      { en: 'You can ask Bank Negara Malaysia for your own CCRIS report.', ms: 'Anda boleh meminta laporan CCRIS anda sendiri daripada Bank Negara Malaysia.' },
      { en: 'Late payments show up on your record and can make a later loan harder to get.', ms: 'Bayaran lewat dipaparkan pada rekod anda dan boleh menyukarkan pinjaman kemudian.' },
    ],
    takeaway: { en: 'Pay on time, and your record gets stronger every month.', ms: 'Bayar tepat masa, dan rekod anda menjadi lebih kukuh setiap bulan.' },
    link: { route: 'ready', label: { en: 'Check if I am ready', ms: 'Semak jika saya sedia' } },
  },
  {
    id: 'min-vs-full',
    topic: 'paying',
    icon: '💳',
    title: { en: 'Minimum payment or full payment?', ms: 'Bayaran minimum atau bayaran penuh?' },
    paragraphs: [
      { en: `Say you spend ${money(spend)}. Your statement shows two numbers: the full amount, and the minimum. The minimum is ${R.minPaymentPercent}% of what you owe or ${money(R.minPaymentFloor)}, whichever is higher.`, ms: `Katakan anda berbelanja ${money(spend)}. Penyata anda menunjukkan dua angka: jumlah penuh, dan minimum. Minimum ialah ${R.minPaymentPercent}% daripada hutang atau ${money(R.minPaymentFloor)}, mana yang lebih tinggi.` },
      { en: `Pay the full amount by the due date and you pay no interest. Pay only the minimum and the rest costs ${R.aprPercent}% a year. On ${money(spend)}, that is about ${money(extra, 2)} extra and ${minOnly.months} months to clear it, if you add no new spending.`, ms: `Bayar jumlah penuh sebelum tarikh akhir dan anda tidak membayar faedah. Bayar minimum sahaja dan bakinya dikenakan ${R.aprPercent}% setahun. Atas ${money(spend)}, itu kira-kira ${money(extra, 2)} tambahan dan ${minOnly.months} bulan untuk melunaskan, jika anda tidak menambah perbelanjaan baharu.` },
      { en: 'The minimum only keeps you out of the late fee. It does not keep you out of debt.', ms: 'Minimum hanya menjauhkan anda daripada fi lewat. Ia tidak menjauhkan anda daripada hutang.' },
    ],
    bullets: [
      { en: `Most cards give about ${R.graceDays} days with no interest after the statement date, if you paid the last bill in full.`, ms: `Kebanyakan kad memberi kira-kira ${R.graceDays} hari tanpa faedah selepas tarikh penyata, jika anda membayar bil lepas secara penuh.` },
      { en: 'Paying more than the minimum, even a little, cuts the interest.', ms: 'Membayar lebih daripada minimum, walaupun sedikit, mengurangkan faedah.' },
    ],
    takeaway: { en: 'Pay in full when you can. If you cannot, pay as much above the minimum as you can.', ms: 'Bayar penuh apabila boleh. Jika tidak, bayar sebanyak mungkin melebihi minimum.' },
    link: { route: 'cost', label: { en: 'Try the cost simulator', ms: 'Cuba simulator kos' } },
  },
  {
    id: 'utilisation',
    topic: 'paying',
    icon: '📊',
    title: { en: 'What is utilisation?', ms: 'Apakah penggunaan had (utilisation)?' },
    paragraphs: [
      { en: `Your limit is the most you can spend on the card. Utilisation is the share of that limit you are using. With a ${money(limit)} limit and ${money(target)} spent, your utilisation is ${UTILISATION_TARGET}%.`, ms: `Had anda ialah jumlah paling banyak yang boleh anda belanjakan pada kad. Utilisation ialah peratusan had itu yang anda gunakan. Dengan had ${money(limit)} dan ${money(target)} dibelanjakan, utilisation anda ialah ${UTILISATION_TARGET}%.` },
      { en: `A common tip is to stay under ${UTILISATION_TARGET}%. Using most of your limit can look risky to lenders, even if you always pay on time.`, ms: `Petua biasa ialah kekal di bawah ${UTILISATION_TARGET}%. Menggunakan kebanyakan had anda boleh kelihatan berisiko kepada pemberi pinjaman, walaupun anda sentiasa membayar tepat masa.` },
      { en: 'Banks usually report your balance each month. Paying part of your bill before the statement date lowers the balance they see.', ms: 'Bank biasanya melaporkan baki anda setiap bulan. Membayar sebahagian bil sebelum tarikh penyata merendahkan baki yang mereka lihat.' },
    ],
    bullets: [
      { en: 'Ask for a higher limit only if you will not spend more because of it.', ms: 'Minta had lebih tinggi hanya jika anda tidak akan berbelanja lebih kerananya.' },
      { en: 'Our tracker shows your utilisation with a marker at 30%.', ms: 'Penjejak kami menunjukkan utilisation anda dengan penanda pada 30%.' },
    ],
    takeaway: { en: 'Use a small part of your limit, and pay it off.', ms: 'Gunakan sebahagian kecil had anda, dan lunaskannya.' },
    link: { route: 'use', label: { en: 'See my usage', ms: 'Lihat penggunaan saya' } },
  },
  {
    id: 'dos-donts',
    topic: 'habits',
    icon: '✅',
    title: { en: 'Dos and don’ts of a first card', ms: 'Perkara patut dan tak patut bagi kad pertama' },
    paragraphs: [
      { en: 'A card is a tool. It works well with a few simple habits.', ms: 'Kad ialah alat. Ia berfungsi baik dengan beberapa tabiat mudah.' },
    ],
    bullets: [
      { en: 'Do pay the full bill on time, every month.', ms: 'Patut bayar bil penuh tepat masa, setiap bulan.' },
      { en: 'Do set a reminder before the due date, or set auto-debit.', ms: 'Patut tetapkan peringatan sebelum tarikh akhir, atau tetapkan debit automatik.' },
      { en: 'Do spend only what you would pay with cash.', ms: 'Patut berbelanja hanya apa yang anda akan bayar dengan tunai.' },
      { en: 'Do read your statement each month.', ms: 'Patut baca penyata anda setiap bulan.' },
      { en: 'Do not take cash out with the card. The fee is high and interest starts at once.', ms: 'Jangan keluarkan wang tunai dengan kad. Yurannya tinggi dan faedah bermula serta-merta.' },
      { en: 'Do not apply for many cards at once.', ms: 'Jangan memohon banyak kad serentak.' },
      { en: 'Do not pay only the minimum for months.', ms: 'Jangan bayar minimum sahaja selama berbulan-bulan.' },
      { en: 'Do not lend your card or share your PIN.', ms: 'Jangan pinjamkan kad anda atau kongsi PIN anda.' },
    ],
    takeaway: { en: 'Small, steady habits matter more than big rewards.', ms: 'Tabiat kecil dan tetap lebih penting daripada ganjaran besar.' },
    link: { route: 'compare', label: { en: 'Compare cards', ms: 'Banding kad' } },
  },
  {
    id: 'myths',
    topic: 'myths',
    icon: '🧠',
    title: { en: 'Common myths about credit', ms: 'Mitos biasa tentang kredit' },
    paragraphs: [
      { en: 'Myth: “Applying for a card always hurts my score.” Not exactly. When you apply, the bank checks your record and this is noted. One application has a small effect. Many applications in a short time can worry lenders. That is why we suggest you compare first and apply for one card.', ms: 'Mitos: “Memohon kad sentiasa menjejaskan skor saya.” Tidak tepat. Apabila anda memohon, bank menyemak rekod anda dan ini dicatat. Satu permohonan ada kesan kecil. Banyak permohonan dalam masa singkat boleh membimbangkan pemberi pinjaman. Sebab itu kami cadangkan anda banding dahulu dan memohon satu kad.' },
      { en: 'Myth: “Carrying a balance builds credit.” No. Paying on time builds credit. A balance only adds interest.', ms: 'Mitos: “Membawa baki membina kredit.” Tidak. Membayar tepat masa membina kredit. Baki hanya menambah faedah.' },
      { en: 'Myth: “No credit history means bad credit.” No. It means a thin record. You can build it.', ms: 'Mitos: “Tiada sejarah kredit bermakna kredit buruk.” Tidak. Ia bermakna rekod nipis. Anda boleh membinanya.' },
    ],
    bullets: [
      { en: 'The “Am I ready?” check in this app does not touch your record.', ms: 'Semakan “Sedia kah saya?” dalam aplikasi ini tidak menyentuh rekod anda.' },
    ],
    takeaway: { en: 'Apply with care, pay on time, and your record will grow.', ms: 'Mohon dengan berhati-hati, bayar tepat masa, dan rekod anda akan berkembang.' },
    link: { route: 'ready', label: { en: 'Check if I am ready', ms: 'Semak jika saya sedia' } },
  },
  {
    id: 'stay-safe',
    topic: 'safety',
    icon: '🛡️',
    title: { en: 'Staying safe from scams', ms: 'Kekal selamat daripada penipuan' },
    paragraphs: [
      { en: 'Scammers pretend to be a bank, the police or a courier. They scare you or rush you, then ask for your TAC, password or PIN.', ms: 'Penipu menyamar sebagai bank, polis atau kurier. Mereka menakutkan atau mendesak anda, kemudian meminta TAC, kata laluan atau PIN anda.' },
      { en: 'A real bank will never ask for your TAC or password by WhatsApp or phone call. We will not either.', ms: 'Bank sebenar tidak akan meminta TAC atau kata laluan anda melalui WhatsApp atau panggilan telefon. Kami juga tidak akan.' },
    ],
    bullets: [
      { en: 'Hang up. Call the number on the back of your card.', ms: 'Letak telefon. Hubungi nombor di belakang kad anda.' },
      { en: 'Never share a TAC, even with someone who sounds sure.', ms: 'Jangan kongsi TAC, walaupun dengan orang yang kedengaran yakin.' },
      { en: 'If you think you were scammed, call your bank at once and ask them to block your card.', ms: 'Jika anda rasa anda ditipu, hubungi bank anda serta-merta dan minta mereka menyekat kad anda.' },
      { en: 'Be careful with links in messages. Type your bank’s web address yourself.', ms: 'Berhati-hati dengan pautan dalam mesej. Taip sendiri alamat web bank anda.' },
    ],
    takeaway: { en: 'No one real needs your TAC. Stop and check.', ms: 'Tiada sesiapa yang sebenar memerlukan TAC anda. Berhenti dan semak.' },
  },
];

/** Words a person reads per second. About 200 words a minute. */
export const WORDS_PER_SECOND = 3.3;

export function cardText(c: LearnCard, lang: 'en' | 'ms'): string {
  return [c.title[lang], ...c.paragraphs.map((p) => p[lang]), ...c.bullets.map((b) => b[lang]), c.takeaway[lang]].join(' ');
}

/** Estimated reading time in seconds, to the nearest 5. */
export function readingSeconds(c: LearnCard, lang: 'en' | 'ms'): number {
  const words = cardText(c, lang).split(/\s+/).filter(Boolean).length;
  return Math.round(words / WORDS_PER_SECOND / 5) * 5;
}

export function findLearnCard(id: string | null | undefined): LearnCard | undefined {
  return id ? LEARN_CARDS.find((c) => c.id === id) : undefined;
}

// ---------- Quiz ----------

export interface QuizQuestion {
  id: string;
  question: Bi;
  options: Bi[];
  /** Index of the right option. */
  answer: number;
  /** One sentence. */
  explain: Bi;
  /** The learning card to review if the answer was wrong. */
  review: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q-min',
    question: { en: 'You pay only the minimum on your card bill. What happens to the rest?', ms: 'Anda hanya membayar minimum pada bil kad anda. Apa berlaku kepada bakinya?' },
    options: [
      { en: 'It is cleared and costs nothing', ms: 'Ia dilunaskan dan tidak berkos' },
      { en: 'You are charged interest on it', ms: 'Anda dikenakan faedah ke atasnya' },
      { en: 'The bank forgets it', ms: 'Bank melupakannya' },
    ],
    answer: 1,
    explain: { en: 'The minimum keeps you out of the late fee, but the rest still earns interest.', ms: 'Minimum menjauhkan anda daripada fi lewat, tetapi baki masih dikenakan faedah.' },
    review: 'min-vs-full',
  },
  {
    id: 'q-util',
    question: { en: 'About how much of your limit is a good amount to use?', ms: 'Kira-kira berapa banyak had anda yang elok digunakan?' },
    options: [
      { en: 'Under 30%', ms: 'Di bawah 30%' },
      { en: 'Exactly 100%', ms: 'Tepat 100%' },
      { en: 'It does not matter', ms: 'Ia tidak penting' },
    ],
    answer: 0,
    explain: { en: 'Using a small part of your limit looks safer to lenders.', ms: 'Menggunakan sebahagian kecil had anda kelihatan lebih selamat kepada pemberi pinjaman.' },
    review: 'utilisation',
  },
  {
    id: 'q-apply',
    question: { en: 'What is true about applying for many cards at the same time?', ms: 'Apa yang benar tentang memohon banyak kad pada masa yang sama?' },
    options: [
      { en: 'It always raises your score', ms: 'Ia sentiasa menaikkan skor anda' },
      { en: 'It can worry lenders, so it is best to apply for one', ms: 'Ia boleh membimbangkan pemberi pinjaman, jadi lebih baik memohon satu' },
      { en: 'Banks never see it', ms: 'Bank tidak pernah melihatnya' },
    ],
    answer: 1,
    explain: { en: 'Each application is noted, and many in a short time can look risky.', ms: 'Setiap permohonan dicatat, dan banyak dalam masa singkat boleh kelihatan berisiko.' },
    review: 'myths',
  },
  {
    id: 'q-habit',
    question: { en: 'Which habit best builds credit and avoids interest?', ms: 'Tabiat mana yang paling membina kredit dan mengelakkan faedah?' },
    options: [
      { en: 'Pay the full bill on time every month', ms: 'Bayar bil penuh tepat masa setiap bulan' },
      { en: 'Take cash out with the card', ms: 'Keluarkan wang tunai dengan kad' },
      { en: 'Keep a balance on purpose', ms: 'Sengaja membawa baki' },
    ],
    answer: 0,
    explain: { en: 'Paying in full and on time builds your record and costs no interest.', ms: 'Membayar penuh dan tepat masa membina rekod anda dan tidak berkos faedah.' },
    review: 'dos-donts',
  },
  {
    id: 'q-scam',
    question: { en: 'Someone says they are from your bank and asks for your TAC on WhatsApp. What do you do?', ms: 'Seseorang mendakwa dari bank anda dan meminta TAC anda di WhatsApp. Apa anda buat?' },
    options: [
      { en: 'Share it, to be helpful', ms: 'Kongsikannya, supaya membantu' },
      { en: 'Share it if they sound sure', ms: 'Kongsikannya jika mereka kedengaran yakin' },
      { en: 'Never share it, and call the number on your card', ms: 'Jangan kongsi, dan hubungi nombor pada kad anda' },
    ],
    answer: 2,
    explain: { en: 'A real bank will never ask for your TAC by WhatsApp or call.', ms: 'Bank sebenar tidak akan meminta TAC anda melalui WhatsApp atau panggilan.' },
    review: 'stay-safe',
  },
];

export interface QuizResult {
  score: number;
  total: number;
  answered: number;
  /** Questions answered wrongly, so the user can be pointed to the right learning card. */
  wrong: QuizQuestion[];
}

export function scoreQuiz(answers: (number | null)[]): QuizResult {
  let score = 0;
  let answered = 0;
  const wrong: QuizQuestion[] = [];
  QUIZ.forEach((q, i) => {
    const a = answers[i];
    if (a === null || a === undefined) return;
    answered += 1;
    if (a === q.answer) score += 1;
    else wrong.push(q);
  });
  return { score, total: QUIZ.length, answered, wrong };
}
