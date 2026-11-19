import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'rhb',
  name: 'RHB',
  short: 'RH',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: RHB credit cards (Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/rhb/' }],
  interest: { min: 15, max: 18, note: bi('15% after 12 on-time months, 17% after 10 of 12, otherwise 18%. New cardholders start at 18%. Islamic cards use the same figures as an effective profit rate.', '15% selepas 12 bulan tepat masa, 17% selepas 10 daripada 12, jika tidak 18%. Pemegang kad baharu bermula pada 18%. Kad Islamik menggunakan angka yang sama sebagai kadar keuntungan efektif.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 5, min: 15 },
  fxPercent: 1,
  fxNote: bi('The Visa or Mastercard conversion rate plus 1%', 'Kadar tukaran Visa atau Mastercard serta 1%'),
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn'],
  supplementary: { annualFee: 0 },
  approvalTime: null,
  instalment0: bi('Smart Instalment: 0% at selected merchants for up to 36 months', 'Smart Instalment: 0% di peniaga terpilih sehingga 36 bulan'),
};

const list = [
  { n: 'Shell Visa Credit Card', net: 'Visa', tier: 'classic', inc: 2000, fee: 195, fw: { first: true, txn: 24 }, variant: true,
    rw: rw('cashback', 12, 'Up to 12% cashback at Shell petrol stations if you spend RM3,000 a month (3% at RM1,000, 5% at RM2,000). Other categories have their own caps.', 'Tunai balik sehingga 12% di stesen minyak Shell jika anda berbelanja RM3,000 sebulan (3% pada RM1,000, 5% pada RM2,000). Kategori lain ada had tersendiri.') },
  { n: 'Cash Back Credit Card', net: null, tier: 'classic', inc: 2000, fee: 70, fw: { first: true, spend: 10000 }, variant: true,
    rw: rw('cashback', 10, '10% cashback on online dining and groceries if you spend RM2,500 a month (RM10 cap each). Up to 5% on petrol, dining, utilities and groceries.', 'Tunai balik 10% untuk makan dan barangan runcit dalam talian jika anda berbelanja RM2,500 sebulan (had RM10 setiap satu). Sehingga 5% untuk minyak, makan, utiliti dan barangan runcit.') },
  { n: 'Rewards Credit Card', net: null, tier: 'platinum', inc: 2000, fee: 200, fw: { first: true, spend: 10000 }, variant: true, perks: [perk('golf')],
    rw: rw('points', null, 'Up to 10x Loyalty points at cinemas, 4x LoyaltyPlus points overseas and 3x online.', 'Sehingga 10x mata Loyalty di pawagam, 4x mata LoyaltyPlus di luar negara dan 3x dalam talian.') },
  { n: 'Visa MyEG Credit Card', net: 'Visa', tier: 'classic', inc: 2000, fee: 88,
    rw: rw('points', null, '5x Loyalty points on MyEG transactions and 1x on other spending.', '5x mata Loyalty untuk transaksi MyEG dan 1x untuk perbelanjaan lain.') },
  { n: 'Visa Signature Credit Card', net: 'Visa', tier: 'premium', inc: 6666.67, fee: 0, perks: [perk('lounge', 6), perk('golf'), perk('travelIns', 600000)],
    rw: rw('cashback', 6, 'Up to 6% cashback on domestic online, entertainment and shopping if you spend RM3,500 a month (RM30 cap each). Up to 2% overseas (RM100 cap).', 'Tunai balik sehingga 6% untuk dalam talian, hiburan dan beli-belah domestik jika anda berbelanja RM3,500 sebulan (had RM30 setiap satu). Sehingga 2% di luar negara (had RM100).') },
  { n: 'World MasterCard Credit Card', net: 'Mastercard', tier: 'premium', inc: 6666.67, fee: 0, variant: true, perks: [perk('lounge', 6), perk('golf'), perk('travelIns', 600000)],
    rw: rw('cashback', 6, 'Up to 6% cashback on local petrol, travel and dining if you spend RM3,500 a month (RM30 cap each). Up to 2% overseas (RM100 cap).', 'Tunai balik sehingga 6% untuk minyak, perjalanan dan makan tempatan jika anda berbelanja RM3,500 sebulan (had RM30 setiap satu). Sehingga 2% di luar negara (had RM100).') },
  { n: 'Visa Infinite Credit Card', net: 'Visa', tier: 'premium', inc: 12500, fee: 0, perks: [perk('lounge', 12), perk('golf'), perk('travelIns', 2000000)],
    rw: rw('points', null, '5x LoyaltyPlus points overseas and 1x on airlines, hotels and travel. 1x Loyalty on other spending.', '5x mata LoyaltyPlus di luar negara dan 1x untuk penerbangan, hotel dan perjalanan. 1x Loyalty untuk perbelanjaan lain.') },
  { n: 'Premier Visa Infinite Credit Card', net: 'Visa', tier: 'premium', inc: null, incNote: ['By invitation to RHB Premier Banking customers', 'Dengan jemputan kepada pelanggan RHB Premier Banking'], fee: 0, variant: true, perks: [perk('lounge', 12), perk('golf'), perk('travelIns', 2000000)],
    rw: rw('points', null, '8x LoyaltyPlus points overseas (10x from RM10,000 of monthly overseas spend) and 3x on local airlines, hotels and online travel.', '8x mata LoyaltyPlus di luar negara (10x dari RM10,000 perbelanjaan luar negara sebulan) dan 3x untuk penerbangan, hotel dan perjalanan dalam talian tempatan.') },
];

export const cards = list.flatMap((c) => {
  const { variant, ...rest } = c;
  const out = [card('rhb', rest)];
  if (variant) {
    const isl = { ...rest, n: `${rest.n.replace(/Credit Card$/, 'Credit Card-i')}`, islamic: true };
    if (rest.n.startsWith('World')) isl.perks = (rest.perks ?? []).filter((p) => p.k !== 'travelIns');
    out.push(card('rhb', isl));
  }
  return out;
});
