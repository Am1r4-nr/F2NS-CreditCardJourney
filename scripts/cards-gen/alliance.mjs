import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'alliance',
  name: 'Alliance Bank',
  short: 'AB',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: Alliance Bank credit cards (checked against Alliance Bank pages, Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/alliance-bank/' }],
  interest: { min: 15, max: 18, note: bi('15% after 12 on-time months, 17% after 10 of 12, otherwise 18%. Cash advances are 18%. The Visa Basic charges a flat 14%.', '15% selepas 12 bulan tepat masa, 17% selepas 10 daripada 12, jika tidak 18%. Pendahuluan tunai 18%. Visa Basic mengenakan kadar tetap 14%.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 1.25, min: 3 },
  fxPercent: 1,
  fxNote: bi('The Visa rate plus a 1% Alliance Bank spread (Visa Basic and Visa Virtual use the Visa rate only)', 'Kadar Visa serta 1% tambahan Alliance Bank (Visa Basic dan Visa Virtual guna kadar Visa sahaja)'),
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: bi('0% Instalment Payment Plans at participating merchants for 6 to 24 months', 'Pelan Bayaran Ansuran 0% di peniaga terpilih selama 6 hingga 24 bulan'),
};

const waived1 = { first: true };

export const cards = [
  card('alliance', { n: 'Visa Virtual', net: 'Visa', tier: 'classic', inc: 2000, fee: 0, fw: { life: true }, rate: undefined, digitalOnly: true,
    rw: rw('points', null, '8X Three-year Bonus Points on e-commerce and e-wallet top-ups (up to RM3,000 a statement cycle) and 1X on other spending. A virtual card you apply for and hold in the allianceonline app.', '8X Mata Bonus Tiga Tahun untuk e-dagang dan tambah nilai e-dompet (sehingga RM3,000 setiap kitaran penyata) dan 1X untuk perbelanjaan lain. Kad maya yang anda mohon dan simpan dalam aplikasi allianceonline.') }),
  card('alliance', { n: 'Visa Basic', net: 'Visa', tier: 'classic', inc: 2000, fee: 0, fw: { life: true }, rate: { min: 14, max: 14 },
    rw: rw('none', null, 'No rewards. A flat 14% a year on unpaid balances and a 0% Instalment Payment Plan at participating merchants.', 'Tiada ganjaran. Kadar tetap 14% setahun atas baki tertunggak dan Pelan Bayaran Ansuran 0% di peniaga terpilih.') }),
  card('alliance', { n: 'Visa Platinum', net: 'Visa', tier: 'platinum', inc: 2000, fee: 120, fw: { text: ['Free in the first year. After that, free with 12 swipes a year, or for Alliance Privilege and Alliance Personal customers', 'Percuma pada tahun pertama. Selepas itu, percuma dengan 12 swipe setahun, atau untuk pelanggan Alliance Privilege dan Alliance Personal'] },
    rw: rw('points', null, 'Up to 5X Three-year Bonus Points on overseas, dining, groceries, petrol and essentials. 1X on other spending.', 'Sehingga 5X Mata Bonus Tiga Tahun untuk luar negara, makan, barangan runcit, minyak dan keperluan. 1X untuk perbelanjaan lain.') }),
  card('alliance', { n: 'Visa Signature', net: 'Visa', tier: 'premium', inc: 4000, fee: 148, fw: waived1,
    rw: rw('cashback', 5, 'Tiered cashback on monthly retail spend: 5% on spend from RM2,001 to RM3,000 (RM50 at most), 0.5% from RM1,001 to RM2,000, 0.05% up to RM1,000 and 0.25% above RM3,000.', 'Tunai balik berperingkat atas perbelanjaan runcit bulanan: 5% untuk perbelanjaan RM2,001 hingga RM3,000 (paling banyak RM50), 0.5% RM1,001 hingga RM2,000, 0.05% sehingga RM1,000 dan 0.25% melebihi RM3,000.') }),
  card('alliance', { n: 'Visa Signature for Alliance Privilege', net: 'Visa', tier: 'premium', inc: 4000, incNote: ['For Alliance Privilege or Personal customers with RM300,000 or more in assets with the bank', 'Untuk pelanggan Alliance Privilege atau Personal dengan RM300,000 atau lebih aset bersama bank'], fee: 148, fw: waived1, perks: [perk('lounge', 6)],
    rw: rw('cashback', 5, 'The same tiered cashback as the Visa Signature, plus 0.5% to 3% extra on yearly retail spend of RM120,000 or more, by assets with the bank.', 'Tunai balik berperingkat yang sama seperti Visa Signature, serta tambahan 0.5% hingga 3% atas perbelanjaan runcit tahunan RM120,000 atau lebih, mengikut aset bersama bank.') }),
  card('alliance', { n: 'Visa Infinite', net: 'Visa', tier: 'premium', inc: 5000, fee: 438, fw: waived1, perks: [perk('lounge', 3)],
    rw: rw('points', null, '10X Three-year Bonus Points on overseas spending and 1X on local spending. 3 Plaza Premium lounge visits a year from 15 November 2026.', '10X Mata Bonus Tiga Tahun untuk perbelanjaan luar negara dan 1X untuk perbelanjaan tempatan. 3 lawatan lounge Plaza Premium setahun mulai 15 November 2026.') }),
];
