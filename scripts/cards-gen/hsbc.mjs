import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'hsbc',
  name: 'HSBC',
  short: 'HS',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: HSBC credit cards (checked against HSBC pages and waiver sheet, 13 Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/hsbc/' }],
  interest: { min: 15, max: 18, note: bi('15% after 12 prompt months, 17% after 10 of 12, otherwise 18%. Cash advances are 18%.', '15% selepas 12 bulan pembayaran segera, 17% selepas 10 daripada 12, jika tidak 18%. Pendahuluan tunai 18%.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { flat: 8.7 },
  fxPercent: 1,
  fxNote: bi('A 1% conversion cost, plus any Visa or Mastercard fee', 'Kos penukaran 1%, serta sebarang yuran Visa atau Mastercard'),
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: bi('Visa 0% Card Instalment Plan: online purchases from RM300 for 3 to 36 months (Visa cards)', 'Pelan Ansuran Kad Visa 0%: pembelian dalam talian dari RM300 selama 3 hingga 36 bulan (kad Visa)'),
};

const sp = (n) => ({ first: true, spend: n });

export const cards = [
  card('hsbc', { n: 'Live+ Credit Card', net: null, tier: 'platinum', inc: 8500, fee: 300, fw: sp(24000),
    rw: rw('cashback', 5, 'Up to 5% bonus cashback on dining, shopping and entertainment if you spend RM5,000 a month (RM30 cap per category). 0.2% locally and 0.5% overseas on other spending.', 'Tunai balik bonus sehingga 5% untuk makan, beli-belah dan hiburan jika anda berbelanja RM5,000 sebulan (had RM30 setiap kategori). 0.2% di dalam negara dan 0.5% di luar negara untuk perbelanjaan lain.') }),
  card('hsbc', { n: 'TravelOne Credit Card', net: 'Mastercard', tier: 'premium', inc: 8500, fee: 300, fw: sp(20000), perks: [perk('lounge', 6), perk('golf'), perk('travelIns')],
    rw: rw('points', null, '8x points on foreign currency spending and 5x on local travel and dining. 1x on everything else.', '8x mata untuk perbelanjaan mata wang asing dan 5x untuk perjalanan dan makan tempatan. 1x untuk yang lain.') }),
  card('hsbc', { n: 'Visa Signature Credit Card', net: 'Visa', tier: 'premium', inc: 8500, fee: 600, fw: sp(24000), perks: [perk('lounge', 6)],
    rw: rw('points', null, '8x points on foreign currency spending (online or overseas) and 5x on local online and shopping spending.', '8x mata untuk perbelanjaan mata wang asing (dalam talian atau luar negara) dan 5x untuk perbelanjaan dalam talian dan beli-belah tempatan.') }),
  card('hsbc', { n: 'Platinum Credit Card', net: 'Visa', tier: 'platinum', inc: 8500, fee: 240, fw: sp(6000),
    rw: rw('points', null, '8x points on contactless spending and 5x on online shopping, groceries and overseas spending (monthly caps apply).', '8x mata untuk perbelanjaan tanpa sentuh dan 5x untuk beli-belah dalam talian, barangan runcit dan luar negara (had bulanan dikenakan).') }),
  card('hsbc', { n: 'Amanah MPower Platinum-i', net: 'Visa', tier: 'platinum', islamic: true, inc: 8500, fee: 240, fw: sp(6000),
    rw: rw('cashback', 8, 'Up to 8% cashback on e-wallet, groceries and petrol if you spend RM2,000 a month (RM15 cap per category). 1% below that.', 'Tunai balik sehingga 8% untuk e-dompet, barangan runcit dan minyak jika anda berbelanja RM2,000 sebulan (had RM15 setiap kategori). 1% di bawah itu.') }),
  card('hsbc', { n: 'Premier World Mastercard', net: 'Mastercard', tier: 'premium', inc: null, incNote: ['For HSBC Premier customers (RM300,000 with HSBC)', 'Untuk pelanggan HSBC Premier (RM300,000 dengan HSBC)'], fee: 0, fw: { life: true }, perks: [perk('lounge', 6), perk('travelIns')],
    rw: rw('points', null, '10x points overseas and 8x on contactless. An extra 5x overseas until 31 December 2026 if you meet the monthly Premier criteria.', '10x mata di luar negara dan 8x untuk tanpa sentuh. Tambahan 5x di luar negara sehingga 31 Disember 2026 jika anda memenuhi kriteria Premier bulanan.') }),
  card('hsbc', { n: 'Amanah Premier World Mastercard-i', net: 'Mastercard', tier: 'premium', islamic: true, inc: null, incNote: ['For HSBC Amanah Premier customers', 'Untuk pelanggan HSBC Amanah Premier'], fee: 0, fw: { life: true }, perks: [perk('lounge', 6)],
    rw: rw('cashback', 1, '1% cashback on overseas spending and 0.5% on local spending.', 'Tunai balik 1% untuk perbelanjaan luar negara dan 0.5% untuk perbelanjaan tempatan.') }),
  card('hsbc', { n: 'Premier World Travel Mastercard', net: 'Mastercard', tier: 'premium', inc: null, incNote: ['By invitation, for HSBC Premier Elite customers (RM3,000,000 with HSBC)', 'Dengan jemputan, untuk pelanggan HSBC Premier Elite (RM3,000,000 dengan HSBC)'], fee: 600, fw: { text: ['Waived for Premier Elite customers. Otherwise free with RM45,000 of spending a year', 'Dikecualikan untuk pelanggan Premier Elite. Jika tidak, percuma dengan perbelanjaan RM45,000 setahun'] }, perks: [perk('lounge', 12), perk('travelIns')],
    rw: rw('miles', null, '1.1 air miles per RM1 overseas and 1 air mile per RM4 spent locally. 12 lounge visits a year worldwide.', '1.1 batu udara setiap RM1 di luar negara dan 1 batu udara setiap RM4 di dalam negara. 12 lawatan lounge setahun di seluruh dunia.') }),
];
