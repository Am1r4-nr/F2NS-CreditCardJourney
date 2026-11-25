import type { Bi } from '../lib/eligibility.ts';

export interface Option {
  key: string;
  label: Bi;
}

const o = (key: string, en: string, ms: string): Option => ({ key, label: { en, ms } });

export const SEAMLESS: Option[] = [
  o('prefill', 'My details are filled in for me (for example from my MyKad)', 'Butiran saya diisi untuk saya (contohnya daripada MyKad)'),
  o('fewSteps', 'Only a few short steps', 'Hanya beberapa langkah pendek'),
  o('oneQuestion', 'One question at a time on my phone', 'Satu soalan pada satu masa di telefon saya'),
  o('progress', 'A progress bar and time left', 'Bar kemajuan dan masa yang tinggal'),
  o('save', 'Save and continue later', 'Simpan dan sambung kemudian'),
  o('docList', 'A clear list of documents at the start', 'Senarai dokumen yang jelas di permulaan'),
  o('instant', 'A first answer right away', 'Jawapan pertama serta-merta'),
  o('plain', 'Plain, simple language', 'Bahasa yang mudah dan jelas'),
  o('help', 'A person I can ask for help', 'Seseorang yang boleh saya minta bantuan'),
];

export const DEAL_BREAKERS: Option[] = [
  o('hiddenFees', 'Hidden or unclear fees', 'Yuran tersembunyi atau tidak jelas'),
  o('docsNoHave', 'Asked for documents I do not have', 'Diminta dokumen yang saya tiada'),
  o('noReason', 'A rejection with no reason', 'Penolakan tanpa sebab'),
  o('longForms', 'Long forms', 'Borang yang panjang'),
  o('slow', 'Waiting too long for an answer', 'Menunggu terlalu lama untuk jawapan'),
  o('unclearProof', 'Not clear how to prove my income', 'Tidak jelas cara membuktikan pendapatan saya'),
  o('tooMuchData', 'Asked for too much personal information', 'Diminta terlalu banyak maklumat peribadi'),
  o('notSafe', 'It does not feel safe', 'Ia tidak terasa selamat'),
  o('noHelp', 'No one to ask for help', 'Tiada sesiapa untuk dimintai bantuan'),
];

export const PROOF_CHOICES: Option[] = [
  o('bank', 'Connect my bank or e-wallet', 'Hubungkan bank atau e-dompet saya'),
  o('lhdn', 'LHDN tax record', 'Rekod cukai LHDN'),
  o('upload', 'Upload a payslip or earnings statement', 'Muat naik slip gaji atau penyata pendapatan'),
  o('other', 'Something else', 'Sesuatu yang lain'),
];

export const TIME_CHOICES: Option[] = [
  o('instant', 'Right away', 'Serta-merta'),
  o('sameDay', 'The same day', 'Hari yang sama'),
  o('threeDays', 'Up to 3 days', 'Sehingga 3 hari'),
  o('week', 'Up to a week', 'Sehingga seminggu'),
];

export const TRUST_BUILDERS: Option[] = [
  o('bnm', 'A Bank Negara Malaysia licence', 'Lesen Bank Negara Malaysia'),
  o('pidm', 'PIDM protection', 'Perlindungan PIDM'),
  o('clearFees', 'Clear fees shown upfront', 'Yuran yang jelas ditunjukkan di awal'),
  o('dataExplained', 'Knowing how my data is used', 'Mengetahui bagaimana data saya digunakan'),
  o('humanHelp', 'Being able to talk to a person', 'Dapat bercakap dengan seseorang'),
  o('scamWarning', 'Clear scam warnings', 'Amaran penipuan yang jelas'),
  o('reasons', 'Clear reasons for every decision', 'Sebab yang jelas bagi setiap keputusan'),
  o('knownBank', 'A bank I already know', 'Bank yang sudah saya kenali'),
  o('reviews', 'Good reviews from other people', 'Ulasan baik daripada orang lain'),
];

export const CARD_FEATURES: Option[] = [
  o('fee', 'Annual fee', 'Yuran tahunan'),
  o('rate', 'Interest rate', 'Kadar faedah'),
  o('rewards', 'Rewards', 'Ganjaran'),
  o('income', 'Income requirement', 'Keperluan pendapatan'),
  o('brand', 'Brand or bank trust', 'Kepercayaan kepada jenama atau bank'),
];

export const MAX_PICKS = 3;
export const TARGET_TESTERS = 3;
