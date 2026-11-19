import type { Bi } from '../lib/eligibility.ts';
import type { ProofMethod } from '../state/types.ts';

export interface DocItem {
  id: string;
  icon: string;
  name: Bi;
  why: Bi;
  /** What to do if the user does not have it. */
  alternatives: Bi[];
}

/** Shown before any question is asked (REQ-3b). */
export const DOCUMENTS: DocItem[] = [
  {
    id: 'id',
    icon: '🪪',
    name: { en: 'Your MyKad', ms: 'MyKad anda' },
    why: { en: 'To confirm who you are. We scan it with your phone camera.', ms: 'Untuk mengesahkan identiti anda. Kami mengimbasnya dengan kamera telefon.' },
    alternatives: [
      { en: 'Camera not working? Type your details by hand.', ms: 'Kamera tidak berfungsi? Taip butiran anda secara manual.' },
      { en: 'No MyKad with you? Use your passport (Malaysians) or visit a branch.', ms: 'Tiada MyKad bersama anda? Guna pasport (warganegara) atau pergi ke cawangan.' },
    ],
  },
  {
    id: 'income',
    icon: '💵',
    name: { en: 'Proof of income', ms: 'Bukti pendapatan' },
    why: { en: 'To check you can afford the monthly payments.', ms: 'Untuk menyemak anda mampu membayar ansuran bulanan.' },
    alternatives: [
      { en: 'No payslip? Connect your bank or e-wallet (recommended).', ms: 'Tiada slip gaji? Hubungkan bank atau e-dompet anda (disyorkan).' },
      { en: 'Or use your LHDN tax record.', ms: 'Atau guna rekod cukai LHDN anda.' },
      { en: 'Or upload a gig-platform earnings statement.', ms: 'Atau muat naik penyata pendapatan platform gig.' },
    ],
  },
  {
    id: 'address',
    icon: '🏠',
    name: { en: 'Proof of address', ms: 'Bukti alamat' },
    why: { en: 'To know where to send your card and statements.', ms: 'Untuk tahu ke mana hendak menghantar kad dan penyata anda.' },
    alternatives: [
      { en: 'We use the address on your MyKad. Nothing extra to upload.', ms: 'Kami guna alamat pada MyKad anda. Tiada apa-apa tambahan untuk dimuat naik.' },
      { en: 'Moved house? Add a utility bill or bank statement.', ms: 'Sudah berpindah? Tambah bil utiliti atau penyata bank.' },
    ],
  },
  {
    id: 'selfie',
    icon: '🤳',
    name: { en: 'A quick selfie check', ms: 'Semakan swafoto ringkas' },
    why: { en: 'To make sure it is really you, and to protect you from fraud.', ms: 'Untuk memastikan ia benar-benar anda, dan melindungi anda daripada penipuan.' },
    alternatives: [
      { en: 'No camera? Do a short video call with us instead.', ms: 'Tiada kamera? Buat panggilan video ringkas dengan kami.' },
      { en: 'Or visit a branch with your MyKad.', ms: 'Atau pergi ke cawangan dengan MyKad anda.' },
    ],
  },
];

export interface ProofOption {
  id: ProofMethod;
  icon: string;
  title: Bi;
  summary: Bi;
  /** How it helps people with irregular income (REQ-4.3). */
  helpsGig: Bi;
}

export const PROOF_OPTIONS: ProofOption[] = [
  {
    id: 'bank',
    icon: '🏦',
    title: { en: 'Connect bank or e-wallet', ms: 'Hubungkan bank atau e-dompet' },
    summary: { en: 'Safe, read-only view of your last 6 months. Takes about 1 minute.', ms: 'Paparan baca sahaja yang selamat untuk 6 bulan terakhir. Mengambil masa kira-kira 1 minit.' },
    helpsGig: { en: 'Best for gig work. We average 6 months, so slow weeks do not hurt you. No payslip needed.', ms: 'Terbaik untuk kerja gig. Kami purata 6 bulan, jadi minggu perlahan tidak menjejaskan anda. Slip gaji tidak diperlukan.' },
  },
  {
    id: 'lhdn',
    icon: '🧾',
    title: { en: 'LHDN tax record', ms: 'Rekod cukai LHDN' },
    summary: { en: 'We check the income you declared for tax. Takes about 30 seconds.', ms: 'Kami semak pendapatan yang anda isytiharkan untuk cukai. Mengambil masa kira-kira 30 saat.' },
    helpsGig: { en: 'Good if you file taxes. It shows your full year, so busy and quiet months even out.', ms: 'Baik jika anda memfailkan cukai. Ia menunjukkan setahun penuh, jadi bulan sibuk dan senggang seimbang.' },
  },
  {
    id: 'upload',
    icon: '📄',
    title: { en: 'Upload payslip or earnings statement', ms: 'Muat naik slip gaji atau penyata pendapatan' },
    summary: { en: 'Add a payslip, or a statement from your delivery or e-hailing app.', ms: 'Tambah slip gaji, atau penyata daripada aplikasi penghantaran atau e-hailing anda.' },
    helpsGig: { en: 'Works if you have a gig-app statement. Upload up to 6 months so we can see the average.', ms: 'Berkesan jika anda ada penyata aplikasi gig. Muat naik sehingga 6 bulan supaya kami boleh lihat puratanya.' },
  },
];

export const BANK_ACCESS = {
  yes: [
    { en: 'Total money coming in each month (your income)', ms: 'Jumlah wang masuk setiap bulan (pendapatan anda)' },
    { en: 'Total money going out each month (your spending)', ms: 'Jumlah wang keluar setiap bulan (perbelanjaan anda)' },
    { en: 'Your name on the account, to match it to you', ms: 'Nama anda pada akaun, untuk memadankannya dengan anda' },
  ],
  no: [
    { en: 'Your password, PIN or TAC', ms: 'Kata laluan, PIN atau TAC anda' },
    { en: 'Any way to move money or make payments', ms: 'Sebarang cara untuk memindahkan wang atau membuat pembayaran' },
    { en: 'Details of who you paid or who paid you', ms: 'Butiran kepada siapa anda bayar atau siapa membayar anda' },
  ],
};
