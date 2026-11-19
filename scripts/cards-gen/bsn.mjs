import { bi, card, perk, rw } from './lib.mjs';

// Cash advance fees and the deposit-pledge option come from BSN's own disclosure sheets. Other details come from an undated RinggitPlus page.
export const bank = {
  id: 'bsn',
  name: 'BSN',
  short: 'BS',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'BSN: product disclosure sheet, conventional cards', url: 'https://www.bsn.com.my/cms/upload/pdf/personal/cards/product-disclosure-sheet-pds-conventional-pds-eng_1.pdf' }, { name: 'BSN: Visa Cash Back product disclosure sheet', url: 'https://www.bsn.com.my/cms/upload/pdf/personal/cards/visa-cash-back/pds.pdf' }, { name: 'RinggitPlus: BSN credit cards (page is not dated)', url: 'https://ringgitplus.com/en/credit-card/bsn/' }],
  interest: { min: 11, max: 13.5, note: bi('As low as 11% a year for government employees and 13.5% for private sector employees. Higher if your payment record is inconsistent.', 'Serendah 11% setahun untuk penjawat awam dan 13.5% untuk pekerja swasta. Lebih tinggi jika rekod pembayaran anda tidak konsisten.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 0, percent: 1, max: 100 },
  cashAdvance: { percent: 5, min: 10 },
  fxPercent: null,
  serviceTax: null,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  supplementary: { annualFee: 0 },
  approvalTime: null,
  instalment0: bi('Instalment-Pay Plan: 0% for 6, 12 or 24 months with a one-time upfront fee of 3% to 5%', 'Pelan Bayaran Ansuran: 0% selama 6, 12 atau 24 bulan dengan yuran pendahuluan sekali bayar 3% hingga 5%'),
};

const pts = rw('points', null, '1 Happy Point for every RM1 spent locally and double overseas.', '1 Mata Happy untuk setiap RM1 dibelanjakan di dalam negara dan dua kali ganda di luar negara.');
const base = { fee: 0, fw: { life: true }, rw: pts };
const V = 'Visa';
const M = 'Mastercard';
const ISL_CA = { percent: 2.69, min: 12.75 };

export const cards = [
  card('bsn', { ...base, n: 'Classic Visa', net: V, tier: 'classic', inc: 2000, url: 'https://www.bsn.com.my/PersonalBanking/Cards/bsn-classic-credit-card' }),
  card('bsn', { ...base, n: 'Visa Cash Back Credit Card', net: V, tier: 'classic', inc: 4000, secured: true, dep: 4000, incNote: ['RM48,000 a year, or pledge a BSN term deposit or Sijil Simpanan Premium of at least RM4,000 instead of showing income', 'RM48,000 setahun, atau cagarkan deposit berjangka BSN atau Sijil Simpanan Premium sekurang-kurangnya RM4,000 sebagai ganti menunjukkan pendapatan'], url: 'https://www.bsn.com.my/cms/upload/pdf/personal/cards/visa-cash-back/pds.pdf', rw: rw('cashback', null, 'Cash back on local and overseas retail purchases, credited monthly.', 'Tunai balik untuk pembelian runcit tempatan dan luar negara, dikreditkan setiap bulan.') }),
  card('bsn', { ...base, n: 'Classic Mastercard', net: M, tier: 'classic', inc: 2000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'Classic Visa Credit Card-i', net: V, tier: 'classic', islamic: true, inc: 2000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'Classic Mastercard Credit Card-i', net: M, tier: 'classic', islamic: true, inc: 2000 }),
  card('bsn', { ...base, n: '1 TeachersCard Mastercard', net: M, tier: 'classic', inc: 2000, rate: { min: 8.88, max: 13.5 } }),
  card('bsn', { ...base, ca: ISL_CA, n: '1 TeachersCard Mastercard Credit Card-i', net: M, tier: 'classic', islamic: true, inc: 2000, rate: { min: 8.88, max: 13.5 } }),
  card('bsn', { ...base, n: 'G-Card Visa Credit Card', net: V, tier: 'classic', inc: 2000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'G-Card Credit Card-i', net: null, tier: 'classic', islamic: true, inc: 2000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'UUM-BSN Gold Mastercard Credit Card-i', net: M, tier: 'gold', islamic: true, inc: 2000 }),
  card('bsn', { ...base, n: 'Gold Visa', net: V, tier: 'gold', inc: 3000 }),
  card('bsn', { ...base, n: 'Gold Mastercard', net: M, tier: 'gold', inc: 3000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'Gold Visa Credit Card-i', net: V, tier: 'gold', islamic: true, inc: 3000, rw: rw('points', null, '1 Happy Point for every RM1 spent locally and double overseas. Comes with a free BSN Zing PLUSMiles card for toll rebates.', '1 Mata Happy untuk setiap RM1 dibelanjakan di dalam negara dan dua kali ganda di luar negara. Disertakan kad BSN Zing PLUSMiles percuma untuk rebat tol.') }),
  card('bsn', { ...base, ca: ISL_CA, n: 'Gold Mastercard Credit Card-i', net: M, tier: 'gold', islamic: true, inc: 3000 }),
  card('bsn', { ...base, n: 'BSN-AIAFAM Visa Platinum Credit Card', net: V, tier: 'platinum', inc: 2666 }),
  card('bsn', { ...base, n: 'Visa Platinum', net: V, tier: 'platinum', inc: 4000 }),
  card('bsn', { ...base, n: 'Platinum Mastercard', net: M, tier: 'platinum', inc: 4000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'Platinum Visa Credit Card-i', net: V, tier: 'platinum', islamic: true, inc: 4000, perks: [perk('travelIns', 300000)] }),
  card('bsn', { ...base, ca: ISL_CA, n: 'Platinum Mastercard Credit Card-i', net: M, tier: 'platinum', islamic: true, inc: 4000 }),
  card('bsn', { ...base, ca: ISL_CA, n: 'UUM-BSN Platinum Mastercard Credit Card-i', net: M, tier: 'platinum', islamic: true, inc: 5000 }),
];
