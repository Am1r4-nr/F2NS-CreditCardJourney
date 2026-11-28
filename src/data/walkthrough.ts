import type { Bi } from '../lib/eligibility.ts';
import type { Route } from '../lib/router.ts';

export interface GuideStep {
  route: Route;
  title: Bi;
  /** Plain instructions for a visitor: what this page is for and what to try. */
  points: Bi[];
}

/** A short tour that tells a visitor how to use the site, one page at a time. */
export const WALKTHROUGH: GuideStep[] = [
  {
    route: 'home',
    title: { en: 'Welcome', ms: 'Selamat datang' },
    points: [
      { en: 'This site takes you from “Can I get a card?” to using it well, in five stages: Am I ready, Cost, Apply, Track, Use it well.', ms: 'Laman ini membawa anda daripada “Boleh saya dapat kad?” hingga menggunakannya dengan bijak, dalam lima peringkat: Sedia kah saya, Kos, Mohon, Jejak, Guna dengan bijak.' },
      { en: 'Use the menu button (top left) to jump to any page, and EN / BM (top right) to change language. Nothing is sent to a bank.', ms: 'Guna butang menu (kiri atas) untuk ke mana-mana halaman, dan EN / BM (kanan atas) untuk tukar bahasa. Tiada apa dihantar kepada bank.' },
    ],
  },
  {
    route: 'ready',
    title: { en: '1. Am I ready?', ms: '1. Sedia kah saya?' },
    points: [
      { en: 'Answer a few short questions about your age, work and income. Gig or freelance income is fine.', ms: 'Jawab beberapa soalan ringkas tentang umur, kerja dan pendapatan anda. Pendapatan gig atau bebas tidak mengapa.' },
      { en: 'You get a result with reasons in plain words. This check does not affect your credit record.', ms: 'Anda mendapat keputusan dengan sebab dalam bahasa mudah. Semakan ini tidak menjejaskan rekod kredit anda.' },
    ],
  },
  {
    route: 'compare',
    title: { en: 'Compare cards', ms: 'Banding kad' },
    points: [
      { en: 'Browse real cards from Malaysian banks. Use the filters and tier buttons to narrow the list. “Best match for me” uses your answers.', ms: 'Layari kad sebenar daripada bank di Malaysia. Guna penapis dan butang tahap untuk menyempitkan senarai. “Padanan terbaik untuk saya” menggunakan jawapan anda.' },
      { en: 'Tick up to 3 cards and press Compare to see them side by side. Open a card for its fees and a link to the bank’s website.', ms: 'Tanda sehingga 3 kad dan tekan Banding untuk melihatnya bersebelahan. Buka kad untuk yuran dan pautan ke laman web bank.' },
    ],
  },
  {
    route: 'cost',
    title: { en: '2. What will it cost?', ms: '2. Berapa kosnya?' },
    points: [
      { en: 'Move the slider to set how much you spend, then choose how you pay: in full, the minimum, or a fixed amount.', ms: 'Gerakkan slaid untuk menetapkan perbelanjaan anda, kemudian pilih cara bayar: penuh, minimum, atau jumlah tetap.' },
      { en: 'You see the extra cost month by month. Paying in full costs nothing extra.', ms: 'Anda melihat kos tambahan bulan demi bulan. Bayar penuh tidak mengenakan kos tambahan.' },
    ],
  },
  {
    route: 'apply',
    title: { en: '3. Apply', ms: '3. Mohon' },
    points: [
      { en: 'Start with the document checklist. Each item has a backup if you do not have it, for example a bank or e-wallet link instead of a payslip.', ms: 'Mulakan dengan senarai semak dokumen. Setiap item ada alternatif jika anda tidak memilikinya, contohnya pautan bank atau e-dompet ganti slip gaji.' },
      { en: 'Then fill in 5 short steps. Tap “Why we ask this” to see the reason for a question. Your progress is saved, so you can come back later.', ms: 'Kemudian isi 5 langkah pendek. Tekan “Mengapa kami tanya” untuk melihat sebab sesuatu soalan. Kemajuan anda disimpan, jadi anda boleh kembali kemudian.' },
    ],
  },
  {
    route: 'track',
    title: { en: '4. Track', ms: '4. Jejak' },
    points: [
      { en: 'After you submit, this page shows where your application is and what happens next.', ms: 'Selepas anda hantar, halaman ini menunjukkan di mana permohonan anda dan apa yang berlaku seterusnya.' },
      { en: 'Every answer comes with reasons and next steps, including how to reach a person.', ms: 'Setiap jawapan disertakan sebab dan langkah seterusnya, termasuk cara menghubungi seseorang.' },
    ],
  },
  {
    route: 'use',
    title: { en: '5. Use it well', ms: '5. Guna dengan bijak' },
    points: [
      { en: 'Add your spending and payments to see your balance, your due date and how much of your limit you use. Turn on a reminder so you pay on time.', ms: 'Tambah perbelanjaan dan bayaran anda untuk melihat baki, tarikh akhir dan berapa banyak had yang anda guna. Hidupkan peringatan supaya anda bayar tepat masa.' },
      { en: 'The first-3-months checklist helps you build a good record.', ms: 'Senarai semak 3 bulan pertama membantu anda membina rekod yang baik.' },
    ],
  },
  {
    route: 'learn',
    title: { en: 'Learn and get help', ms: 'Belajar dan dapatkan bantuan' },
    points: [
      { en: 'Short lessons and a 5-question quiz explain interest, minimum payments and credit scores.', ms: 'Pelajaran ringkas dan kuiz 5 soalan menerangkan faedah, bayaran minimum dan skor kredit.' },
      { en: 'Need help on any page? Use the help button at the bottom right to chat or call. You can reopen this guide any time from the Guide button at the top.', ms: 'Perlukan bantuan di mana-mana halaman? Guna butang bantuan di kanan bawah untuk sembang atau telefon. Anda boleh buka semula panduan ini bila-bila masa melalui butang Panduan di atas.' },
    ],
  },
];