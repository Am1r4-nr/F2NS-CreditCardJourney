import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'uob',
  name: 'UOB',
  short: 'UO',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: UOB credit cards (checked against UOB fee sheet and card terms, 13 Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/uob/' }],
  interest: { min: 15, max: 18, note: bi('15% if you paid the minimum on time in all of the last 12 months, 17% if in 10 or 11, otherwise 18%. Cash advances are 18%.', '15% jika anda membayar minimum tepat masa dalam semua 12 bulan terakhir, 17% jika dalam 10 atau 11, jika tidak 18%. Pendahuluan tunai 18%.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 0.37 },
  fxPercent: 1,
  fxNote: bi('A 1% UOB markup, plus up to 1.22% from Visa or Mastercard', 'Tambahan 1% UOB, serta sehingga 1.22% daripada Visa atau Mastercard'),
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: null,
};

const W20 = { spend: 20000 };
const W50 = { spend: 50000 };
const un = (en, ms) => rw('points', null, en, ms);

export const cards = [
  card('uob', { n: 'Simple Card', net: null, tier: 'classic', inc: 2000, fee: 0,
    rw: rw('cashback', null, 'Returns 10% of the interest you are charged, if you paid the minimum on time. Nothing back if you pay in full.', 'Memulangkan 10% daripada faedah yang dikenakan, jika anda membayar minimum tepat masa. Tiada pulangan jika anda membayar penuh.') }),
  card('uob', { n: 'Lazada UOB Card', net: null, tier: 'classic', inc: 2000, fee: 100, fw: W20,
    rw: un('10X UNIRinggit on Lazada (up to RM500 a month) and 5X on online entertainment, food delivery, telco and insurance. 1X on other spending.', '10X UNIRinggit di Lazada (sehingga RM500 sebulan) dan 5X untuk hiburan dalam talian, penghantaran makanan, telco dan insurans. 1X untuk perbelanjaan lain.') }),
  card('uob', { n: 'ONE Card (Platinum)', net: null, tier: 'platinum', inc: 3000, fee: 195, fw: W20,
    rw: rw('cashback', 10, '10% cashback on petrol, groceries, dining and Grab if you spend RM1,500 a month (RM15 cap per category, RM60 in total). 0.2% on other spending.', 'Tunai balik 10% untuk minyak, barangan runcit, makan dan Grab jika anda berbelanja RM1,500 sebulan (had RM15 setiap kategori, RM60 keseluruhan). 0.2% untuk perbelanjaan lain.') }),
  card('uob', { n: 'EVOL Card', net: null, tier: 'classic', inc: 3000, fee: 90, fw: { text: ['Waived with one retail transaction in each statement month', 'Dikecualikan dengan satu transaksi runcit dalam setiap bulan penyata'] },
    rw: rw('cashback', 10, '10% cashback on online spending if you spend RM1,000 a month, and 5% on e-wallet top-ups (RM15 cap per category, RM30 in total).', 'Tunai balik 10% untuk perbelanjaan dalam talian jika anda berbelanja RM1,000 sebulan, dan 5% untuk tambah nilai e-dompet (had RM15 setiap kategori, RM30 keseluruhan).') }),
  card('uob', { n: 'Preferred Card', net: null, tier: 'platinum', inc: 3000, fee: 198, fw: W20,
    rw: un('Up to 10X UNIRinggit on streaming, 5X on dining, entertainment and groceries, and 3X on petrol and recurring payments.', 'Sehingga 10X UNIRinggit untuk penstriman, 5X untuk makan, hiburan dan barangan runcit, dan 3X untuk minyak dan bayaran berulang.') }),
  card('uob', { n: 'Lady’s Card (Classic)', net: null, tier: 'classic', inc: 5000, fee: 68, fw: { spend: 15000 }, rw: un('Up to 10X UNIRinggit on fashion and beauty and 5X on groceries.', 'Sehingga 10X UNIRinggit untuk fesyen dan kecantikan dan 5X untuk barangan runcit.') }),
  card('uob', { n: 'Lady’s Card (Platinum)', net: null, tier: 'platinum', inc: 5000, fee: 128, fw: W20, rw: un('Up to 10X UNIRinggit on fashion and beauty and 5X on groceries.', 'Sehingga 10X UNIRinggit untuk fesyen dan kecantikan dan 5X untuk barangan runcit.') }),
  card('uob', { n: 'World Card', net: 'Mastercard', tier: 'premium', inc: 5000, fee: 600, fw: W50,
    rw: un('Up to 12X UNIRinggit on selected e-commerce and e-wallet reloads (up to RM300 per merchant) and 5X on selected stores and overseas. 1X locally.', 'Sehingga 12X UNIRinggit untuk e-dagang terpilih dan tambah nilai e-dompet (sehingga RM300 setiap peniaga) dan 5X di kedai terpilih dan luar negara. 1X di dalam negara.') }),
  card('uob', { n: 'PRVI Miles Elite Card', net: null, tier: 'premium', inc: 8333, fee: 600, fw: W50, perks: [perk('lounge', 8), perk('grabRides')],
    rw: rw('miles', null, 'Up to 12X UNIRinggit overseas (12X in Singapore, Thailand, Vietnam and Indonesia, 10X elsewhere) and 5X on airlines. 12,000 UNIRinggit convert to 1,000 miles.', 'Sehingga 12X UNIRinggit di luar negara (12X di Singapura, Thailand, Vietnam dan Indonesia, 10X di tempat lain) dan 5X untuk syarikat penerbangan. 12,000 UNIRinggit ditukar kepada 1,000 batu.') }),
  card('uob', { n: 'Lady’s Solitaire Card', net: null, tier: 'premium', inc: 10000, fee: 300, fw: W50, perks: [perk('lounge', 6)], rw: un('Up to 10X UNIRinggit on fashion and 5X on groceries and foreign currency spending.', 'Sehingga 10X UNIRinggit untuk fesyen dan 5X untuk barangan runcit dan perbelanjaan mata wang asing.') }),
  card('uob', { n: 'Visa Infinite Card', net: 'Visa', tier: 'premium', inc: 10000, fee: 600, fw: W50, perks: [perk('lounge', 12), perk('airportTransfer')],
    rw: un('10X UNIRinggit when the merchant bills you in a foreign currency, and 5X on local dining (after RM1,000 of dining in a month).', '10X UNIRinggit apabila peniaga mengebil anda dalam mata wang asing, dan 5X untuk makan tempatan (selepas RM1,000 makan dalam sebulan).') }),
];
