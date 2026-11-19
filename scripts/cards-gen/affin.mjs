import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'affin',
  name: 'AFFIN Bank',
  short: 'AF',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: AFFIN Bank credit cards (Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/affin-bank/' }],
  interest: { min: 15, max: 18, note: bi('15% after 12 on-time months, 17% after 10 of 12, otherwise 18%. Cash advances are 18% from day one.', '15% selepas 12 bulan tepat masa, 17% selepas 10 daripada 12, jika tidak 18%. Pendahuluan tunai 18% dari hari pertama.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 5, min: 20 },
  fxPercent: 1,
  fxNote: bi('1% above the Visa or Mastercard exchange rate', '1% melebihi kadar tukaran Visa atau Mastercard'),
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: bi('0% Easy Payment Plan at over 5,000 outlets for up to 60 months', 'Pelan Bayaran Mudah 0% di lebih 5,000 outlet sehingga 60 bulan'),
};

const free = (years, after, spend) => ({
  text: [
    `Free for ${years}. After that, free with 12 retail transactions a year${spend ? ` or RM${spend.toLocaleString('en-MY')} of spending` : ''}`,
    `Percuma untuk ${years === 'the first year' ? 'tahun pertama' : years.replace('years', 'tahun')}. Selepas itu, percuma dengan 12 transaksi runcit setahun${spend ? ` atau perbelanjaan RM${spend.toLocaleString('en-MY')}` : ''}`,
  ],
});
const lounge = (n) => [perk('lounge', n), perk('golf')];

export const cards = [
  card('affin', { n: 'DUO Visa Cash Back', net: 'Visa', tier: 'classic', inc: 2000, fee: 75, fw: free('3 years'),
    rw: rw('cashback', 3, '3% cashback on online, e-wallet and auto-billing spending (RM50 cap a month, or RM30 if last month’s balance was under RM3,000).', 'Tunai balik 3% untuk perbelanjaan dalam talian, e-dompet dan pengebilan automatik (had RM50 sebulan, atau RM30 jika baki bulan lalu di bawah RM3,000).') }),
  card('affin', { n: 'DUO Mastercard Rewards', net: 'Mastercard', tier: 'classic', inc: 2000, fee: 75, fw: free('3 years'),
    rw: rw('points', null, '3X points on dining, groceries and petrol.', '3X mata untuk makan, barangan runcit dan minyak.') }),
  card('affin', { n: 'DUO+ Visa', net: 'Visa', tier: 'classic', inc: 4000, fee: 100, fw: free('3 years'),
    rw: rw('cashback', 3, '3% cashback on contactless payments of RM250 and below (RM100 cap a month, or RM50 if last month’s balance was under RM8,000).', 'Tunai balik 3% untuk bayaran tanpa sentuh RM250 dan ke bawah (had RM100 sebulan, atau RM50 jika baki bulan lalu di bawah RM8,000).') }),
  card('affin', { n: 'DUO+ Mastercard', net: 'Mastercard', tier: 'classic', inc: 4000, fee: 100, fw: free('3 years'),
    rw: rw('points', null, '3X points, with no cap, on airlines, e-commerce, duty-free, hotels and overseas spending.', '3X mata, tanpa had, untuk syarikat penerbangan, e-dagang, bebas cukai, hotel dan perbelanjaan luar negara.') }),
  card('affin', { n: 'Visa Gold', net: 'Visa', tier: 'gold', inc: 2000, fee: 150, fw: free('the first year', null, 24000), rw: rw('points', null, '1X point on all retail spending.', '1X mata untuk semua perbelanjaan runcit.') }),
  card('affin', { n: 'Mastercard Gold', net: 'Mastercard', tier: 'gold', inc: 2000, fee: 150, fw: free('the first year', null, 24000), rw: rw('points', null, '1X point on all retail spending.', '1X mata untuk semua perbelanjaan runcit.') }),
  card('affin', { n: 'BHPetrol Mastercard', net: 'Mastercard', tier: 'classic', inc: 2000, fee: 150, fw: free('the first year', null, 2400),
    rw: rw('cashback', 10, '10% cashback at BHPetrol on weekends (5% if last month’s balance was under RM3,000) and 2% on weekdays, with a RM50 cap a month. 1X points elsewhere.', 'Tunai balik 10% di BHPetrol pada hujung minggu (5% jika baki bulan lalu di bawah RM3,000) dan 2% pada hari bekerja, dengan had RM50 sebulan. 1X mata di tempat lain.') }),
  card('affin', { n: 'World Mastercard', net: 'Mastercard', tier: 'premium', inc: 6667, fee: 500, fw: free('the first year', null, 48000), perks: lounge(6),
    rw: rw('points', null, '3X points on overseas retail and 1X locally.', '3X mata untuk runcit luar negara dan 1X di dalam negara.') }),
  card('affin', { n: 'INVIKTA World Mastercard', net: 'Mastercard', tier: 'premium', inc: 12500, fee: 500, fw: { text: ['Free for the first year. After that, free with 12 retail transactions or RM100,000 of spending a year. Waived for life for AFFIN Premier Wealth customers', 'Percuma untuk tahun pertama. Selepas itu, percuma dengan 12 transaksi runcit atau perbelanjaan RM100,000 setahun. Dikecualikan sepanjang hayat untuk pelanggan AFFIN Premier Wealth'] }, perks: lounge(12),
    rw: rw('points', null, '5X points on overseas retail and 1X locally.', '5X mata untuk runcit luar negara dan 1X di dalam negara.') }),
  card('affin', { n: 'INVIKTA Visa Infinite', net: 'Visa', tier: 'premium', inc: 12500, fee: 500, fw: { text: ['Free for the first year. After that, free with 12 retail transactions or RM100,000 of spending a year. Waived for life for AFFIN Premier Wealth customers', 'Percuma untuk tahun pertama. Selepas itu, percuma dengan 12 transaksi runcit atau perbelanjaan RM100,000 setahun. Dikecualikan sepanjang hayat untuk pelanggan AFFIN Premier Wealth'] }, perks: lounge(12),
    rw: rw('points', null, '5X points on overseas retail and 1X locally.', '5X mata untuk runcit luar negara dan 1X di dalam negara.') }),
  card('affin', { n: 'AURA Credit Card', net: null, tier: 'classic', inc: 2000, fee: 0, fw: { life: true }, rate: { min: 8, max: 18 },
    rw: rw('none', null, 'No points. A low interest rate: 8% in the first year, then 9% after 12 on-time months, 12% after 10 of 12, otherwise 18%.', 'Tiada mata. Kadar faedah rendah: 8% pada tahun pertama, kemudian 9% selepas 12 bulan tepat masa, 12% selepas 10 daripada 12, jika tidak 18%.') }),
  card('affin', { n: 'Avance Visa', net: 'Visa', tier: 'classic', inc: 7000, incNote: ['For AFFIN Avance banking members', 'Untuk ahli perbankan AFFIN Avance'], fee: 0, fw: { life: true },
    rw: rw('points', null, '3X points on dining and professional body payments in Malaysia, and 1X on other retail spending.', '3X mata untuk makan dan bayaran badan profesional di Malaysia, dan 1X untuk perbelanjaan runcit lain.') }),
  card('affin', { n: 'Avance Mastercard', net: 'Mastercard', tier: 'classic', inc: 7000, incNote: ['For AFFIN Avance banking members', 'Untuk ahli perbankan AFFIN Avance'], fee: 0, fw: { life: true },
    rw: rw('points', null, '3X points on dining and professional body payments in Malaysia, and 1X on other retail spending.', '3X mata untuk makan dan bayaran badan profesional di Malaysia, dan 1X untuk perbelanjaan runcit lain.') }),
];
