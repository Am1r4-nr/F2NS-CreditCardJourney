import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'ambank',
  name: 'AmBank',
  short: 'AM',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: AmBank credit cards (checked against AmBank terms and fee schedule, Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/ambank/' }],
  interest: { min: 15, max: 18, note: bi('15% if you paid the minimum on time every month, 17% if on time in 10 of the last 12 months, otherwise 18%. Islamic cards use the same tiers as a profit rate.', '15% jika anda membayar minimum tepat masa setiap bulan, 17% jika tepat masa dalam 10 daripada 12 bulan terakhir, jika tidak 18%. Kad Islamik menggunakan peringkat yang sama sebagai kadar keuntungan.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 1.3 },
  fxPercent: 1,
  fxNote: bi('A 1% markup on top of the Visa, Mastercard or UnionPay rate', 'Tambahan 1% atas kadar Visa, Mastercard atau UnionPay'),
  serviceTax: 25,
  minAge: 21,
  maxAge: 65,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: bi('AmBank decides within up to a week', 'AmBank memutuskan dalam masa sehingga seminggu'),
  instalment0: bi('Easy Payment Plan: 0% at participating merchants for 3 to 36 months', 'Easy Payment Plan: 0% di peniaga terpilih selama 3 hingga 36 bulan'),
};

const isl = { ca: { flat: 16 }, late: { flat: 0, percent: 1, max: 100 } };
const ins = (n) => perk('travelIns', n);
const pts = (en, ms) => rw('points', null, en, ms);

export const cards = [
  card('ambank', { n: 'Cash Rebate Visa Platinum', net: 'Visa', tier: 'platinum', inc: 2000, fee: 0, perks: [ins(500000)],
    rw: rw('cashback', 10, '10% cashback on online, shopping and groceries, dining and public transport if you spend RM1,500 a month (RM10 cap each). 0.2% on other spending.', 'Tunai balik 10% untuk dalam talian, beli-belah dan barangan runcit, makan dan pengangkutan awam jika anda berbelanja RM1,500 sebulan (had RM10 setiap satu). 0.2% untuk perbelanjaan lain.') }),
  card('ambank', { n: 'Visa Platinum', net: 'Visa', tier: 'platinum', inc: 2000, fee: 0, perks: [ins(500000)], rw: pts('2 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '2 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'Islamic Visa Platinum Card-i', net: 'Visa', tier: 'platinum', islamic: true, inc: 2000, fee: 0, perks: [ins(500000)], ...isl, rw: pts('2 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '2 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'Islamic Visa Platinum CARz Card-i', net: 'Visa', tier: 'platinum', islamic: true, inc: 2000, fee: 0, perks: [ins(500000)], ...isl,
    rw: rw('cashback', 5, 'Petrol rebate of up to 5% if you pay the minimum or part of your bill (RM80 cap a month), or 2% if you pay in full (RM20 cap).', 'Rebat minyak sehingga 5% jika anda membayar minimum atau sebahagian bil (had RM80 sebulan), atau 2% jika membayar penuh (had RM20).') }),
  card('ambank', { n: 'BonusLink Visa Platinum', net: 'Visa', tier: 'platinum', inc: 2000, fee: 90, fw: { text: ['Free for the first 2 years. After that, free with 12 transactions a year', 'Percuma untuk 2 tahun pertama. Selepas itu, percuma dengan 12 transaksi setahun'] }, perks: [ins(500000)],
    rw: pts('3X BonusLink points per RM1 at Shell and Parkson (3,000 extra points cap a statement). 1X on local dining, groceries, shopping and overseas.', '3X mata BonusLink setiap RM1 di Shell dan Parkson (had 3,000 mata tambahan setiap penyata). 1X untuk makan, barangan runcit, beli-belah tempatan dan luar negara.') }),
  card('ambank', { n: 'UnionPay Platinum', net: 'UnionPay', tier: 'platinum', inc: 5000, fee: 450, fw: { first: true, spend: 20000 }, perks: [perk('lounge', 6), perk('golf'), ins(1000000)],
    rw: pts('5 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '5 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'Visa Signature', net: 'Visa', tier: 'premium', inc: 6666.67, fee: 0, perks: [perk('lounge', 6), perk('golf'), ins(1000000)], rw: pts('3 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '3 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'Islamic Visa Signature Card-i', net: 'Visa', tier: 'premium', islamic: true, inc: 6666.67, fee: 0, perks: [perk('lounge', 6), perk('golf'), ins(1000000)], ...isl, rw: pts('3 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '3 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'BonusLink Visa Signature', net: 'Visa', tier: 'premium', inc: 6666.67, fee: 550, fw: { text: ['Free for the first 2 years. After that, free with 12 transactions a year', 'Percuma untuk 2 tahun pertama. Selepas itu, percuma dengan 12 transaksi setahun'] }, perks: [ins(1000000)],
    rw: pts('5X BonusLink points per RM1 at Shell and Parkson (3,000 extra points cap a statement). 2X on local dining, groceries, shopping and overseas.', '5X mata BonusLink setiap RM1 di Shell dan Parkson (had 3,000 mata tambahan setiap penyata). 2X untuk makan, barangan runcit, beli-belah tempatan dan luar negara.') }),
  card('ambank', { n: 'Visa Infinite', net: 'Visa', tier: 'premium', inc: 10000, fee: 0, perks: [perk('lounge', 6), perk('golf'), perk('dining'), ins(2000000)], rw: pts('5 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '5 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'Islamic Visa Infinite Card-i', net: 'Visa', tier: 'premium', islamic: true, inc: 10000, fee: 0, perks: [perk('lounge', 6), perk('golf'), perk('dining'), ins(2000000)], ...isl, rw: pts('5 AmBonus points per RM1 overseas (not online) and 1 point per RM1 locally.', '5 mata AmBonus setiap RM1 di luar negara (bukan dalam talian) dan 1 mata setiap RM1 di dalam negara.') }),
  card('ambank', { n: 'SIGNATURE Priority Banking The Metal Visa Infinite', net: 'Visa', tier: 'premium', inc: null, incNote: ['By Priority Banking tier', 'Mengikut peringkat Priority Banking'], fee: 0, perks: [perk('lounge', 6), perk('golf'), perk('fastTrack'), perk('dining'), ins(2000000)],
    rw: pts('Up to 15X AmBonus points per RM1 overseas (not online), 6X on local dining and 1X on other spending. By invitation. Lounge visits go up to 12 or unlimited by reward tier.', 'Sehingga 15X mata AmBonus setiap RM1 di luar negara (bukan dalam talian), 6X untuk makan tempatan dan 1X untuk perbelanjaan lain. Dengan jemputan. Lawatan lounge meningkat kepada 12 atau tanpa had mengikut peringkat ganjaran.') }),
  card('ambank', { n: 'SIGNATURE Priority Banking Visa Infinite', net: 'Visa', tier: 'premium', inc: null, incNote: ['By Priority Banking tier', 'Mengikut peringkat Priority Banking'], fee: 0, perks: [perk('lounge', 6), perk('golf'), ins(2000000)],
    rw: pts('Up to 10X AmBonus points per RM1 overseas (not online), 6X on local dining and 1X on other spending. By invitation.', 'Sehingga 10X mata AmBonus setiap RM1 di luar negara (bukan dalam talian), 6X untuk makan tempatan dan 1X untuk perbelanjaan lain. Dengan jemputan.') }),
  card('ambank', { n: 'SIGNATURE Priority Banking Visa Infinite Card-i', net: 'Visa', tier: 'premium', islamic: true, inc: null, incNote: ['By Priority Banking tier', 'Mengikut peringkat Priority Banking'], fee: 0, perks: [perk('lounge', 6), perk('golf'), ins(2000000)], ...isl,
    rw: pts('Earns AmBonus points, with higher rates overseas. By invitation.', 'Memperoleh mata AmBonus, dengan kadar lebih tinggi di luar negara. Dengan jemputan.') }),
];
