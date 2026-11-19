import { ELIGIBILITY } from '../config/rates.ts';
import { money, parseAmount } from './format.ts';

export type Lang = 'en' | 'ms';
/** A user-facing string in both languages. */
export type Bi = { en: string; ms: string };

export type IncomeType = 'salaried' | 'gig' | 'parttime' | 'student';
export type Verdict = 'likely' | 'maybe' | 'notyet';

export interface ReadyInput {
  age: string;
  incomeType: IncomeType;
  income: string;
  commitments: string;
}

export interface Reason {
  status: 'good' | 'check' | 'problem';
  text: Bi;
}

export interface ReadyResult {
  verdict: Verdict;
  reasons: Reason[];
  plan: Bi[];
}

export function checkReadiness(input: ReadyInput): ReadyResult {
  const E = ELIGIBILITY;
  const age = parseAmount(input.age);
  const income = parseAmount(input.income);
  const commitments = Number.isNaN(parseAmount(input.commitments)) ? 0 : parseAmount(input.commitments);
  const reasons: Reason[] = [];
  const plan: Bi[] = [];

  // Age
  if (age >= E.minAge) {
    reasons.push({ status: 'good', text: { en: `You are ${age}. The minimum age is ${E.minAge}.`, ms: `Anda berumur ${age}. Umur minimum ialah ${E.minAge}.` } });
  } else {
    reasons.push({ status: 'problem', text: { en: `The minimum age for our card is ${E.minAge}. You are ${age}.`, ms: `Umur minimum untuk kad kami ialah ${E.minAge}. Anda berumur ${age}.` } });
    plan.push({
      en: `Wait until you turn ${E.minAge}, or ask a parent to apply for a supplementary card on their account.`,
      ms: `Tunggu sehingga anda berumur ${E.minAge}, atau minta ibu bapa memohon kad tambahan di bawah akaun mereka.`,
    });
  }

  // Income level
  const minInc = E.minMonthlyIncome;
  if (income >= minInc + E.incomeBuffer) {
    reasons.push({ status: 'good', text: { en: `Your income of ${money(income)} a month is above the ${money(minInc)} we look for.`, ms: `Pendapatan anda ${money(income)} sebulan melebihi ${money(minInc)} yang kami cari.` } });
  } else if (income >= minInc) {
    reasons.push({ status: 'check', text: { en: `Your income of ${money(income)} a month is just above the ${money(minInc)} minimum. We will check it carefully.`, ms: `Pendapatan anda ${money(income)} sebulan hanya sedikit melebihi minimum ${money(minInc)}. Kami akan menyemaknya dengan teliti.` } });
  } else {
    reasons.push({ status: 'problem', text: { en: `Your income of ${money(income)} a month is below the ${money(minInc)} we look for.`, ms: `Pendapatan anda ${money(income)} sebulan di bawah ${money(minInc)} yang kami cari.` } });
    plan.push({
      en: `Grow your regular income to at least ${money(minInc)} a month. Take more part-time hours or add a steady side income.`,
      ms: `Naikkan pendapatan tetap anda kepada sekurang-kurangnya ${money(minInc)} sebulan. Ambil lebih jam kerja separuh masa atau tambah pendapatan sampingan yang tetap.`,
    });
    plan.push({
      en: 'Keep your earnings in one bank or e-wallet account. This makes it easy to prove your income later.',
      ms: 'Simpan pendapatan anda dalam satu akaun bank atau e-dompet. Ini memudahkan anda membuktikan pendapatan kelak.',
    });
  }

  // Commitments
  if (income > 0) {
    const ratio = commitments / income;
    const pct = Math.round(ratio * 100);
    if (ratio <= E.comfortableCommitmentsRatio) {
      reasons.push({ status: 'good', text: { en: `Your monthly commitments take about ${pct}% of your income. That is comfortable.`, ms: `Komitmen bulanan anda ambil kira-kira ${pct}% daripada pendapatan. Itu selesa.` } });
    } else if (ratio <= E.maxCommitmentsRatio) {
      reasons.push({ status: 'check', text: { en: `Your commitments take about ${pct}% of your income. Lower than ${Math.round(E.comfortableCommitmentsRatio * 100)}% is safer.`, ms: `Komitmen anda ambil kira-kira ${pct}% daripada pendapatan. Di bawah ${Math.round(E.comfortableCommitmentsRatio * 100)}% lebih selamat.` } });
    } else {
      reasons.push({ status: 'problem', text: { en: `Your commitments take about ${pct}% of your income. That leaves little room for a card bill.`, ms: `Komitmen anda ambil kira-kira ${pct}% daripada pendapatan. Ini tinggal sedikit ruang untuk bil kad.` } });
      plan.push({
        en: `Pay down loans such as BNPL, a car loan or PTPTN until commitments are under ${Math.round(E.comfortableCommitmentsRatio * 100)}% of your income.`,
        ms: `Kurangkan pinjaman seperti BNPL, pinjaman kereta atau PTPTN sehingga komitmen di bawah ${Math.round(E.comfortableCommitmentsRatio * 100)}% daripada pendapatan.`,
      });
    }
  }

  // Income type
  switch (input.incomeType) {
    case 'salaried':
      reasons.push({ status: 'good', text: { en: 'A regular salary makes it easy to show your income.', ms: 'Gaji tetap memudahkan anda menunjukkan pendapatan.' } });
      break;
    case 'gig':
      reasons.push({ status: 'good', text: { en: 'Gig income is fine. You can prove it with a bank or e-wallet link. No payslip needed.', ms: 'Pendapatan gig tidak mengapa. Anda boleh membuktikannya dengan pautan bank atau e-dompet. Slip gaji tidak diperlukan.' } });
      break;
    case 'parttime':
      reasons.push({ status: 'check', text: { en: 'Part-time income can vary. We look at your average over 6 months.', ms: 'Pendapatan separuh masa boleh berubah-ubah. Kami melihat purata 6 bulan anda.' } });
      break;
    case 'student':
      if (income >= minInc) {
        reasons.push({ status: 'check', text: { en: 'As a student, we will check that your income is steady, not just one month.', ms: 'Sebagai pelajar, kami akan menyemak sama ada pendapatan anda tetap, bukan sebulan sahaja.' } });
      } else {
        reasons.push({ status: 'check', text: { en: 'Students need steady income of their own. Allowance from family may not count.', ms: 'Pelajar perlu ada pendapatan tetap sendiri. Elaun daripada keluarga mungkin tidak dikira.' } });
        plan.push({
          en: 'Build 6 months of steady part-time or internship income before you apply, and keep it in one account.',
          ms: 'Kumpulkan 6 bulan pendapatan separuh masa atau latihan industri yang tetap sebelum memohon. Simpan dalam satu akaun.',
        });
      }
      break;
  }

  if (input.incomeType === 'gig' || input.incomeType === 'parttime') {
    if (plan.length > 0) {
      plan.push({
        en: 'Gig and part-time workers: 6 months of steady records in one account is the strongest proof.',
        ms: 'Pekerja gig dan separuh masa: rekod tetap selama 6 bulan dalam satu akaun ialah bukti yang paling kuat.',
      });
    }
  }

  const hasProblem = reasons.some((r) => r.status === 'problem');
  const hasCheck = reasons.some((r) => r.status === 'check');
  const verdict: Verdict = hasProblem ? 'notyet' : hasCheck ? 'maybe' : 'likely';
  if (verdict === 'notyet') {
    plan.push({
      en: 'Come back and check again in 3 months. This check is free and does not affect your credit record.',
      ms: 'Datang semula dan semak lagi dalam 3 bulan. Semakan ini percuma dan tidak menjejaskan rekod kredit anda.',
    });
  }
  return { verdict, reasons, plan };
}

export interface ReadyErrors {
  age?: Bi;
  income?: Bi;
  commitments?: Bi;
}

export function validateReady(input: ReadyInput): ReadyErrors {
  const e: ReadyErrors = {};
  const age = parseAmount(input.age);
  if (Number.isNaN(age)) e.age = { en: 'Please type your age, for example 24.', ms: 'Sila taip umur anda, contohnya 24.' };
  else if (age < 16 || age > 100) e.age = { en: 'Please check your age. It should be between 16 and 100.', ms: 'Sila semak umur anda. Ia mesti antara 16 dan 100.' };
  const income = parseAmount(input.income);
  if (Number.isNaN(income)) e.income = { en: 'Please type a rough monthly income. Type 0 if you have none.', ms: 'Sila taip anggaran pendapatan bulanan. Taip 0 jika tiada.' };
  else if (income > 1_000_000) e.income = { en: 'That looks too high. Please check the amount.', ms: 'Jumlah ini nampak terlalu tinggi. Sila semak.' };
  const c = parseAmount(input.commitments);
  if (input.commitments.trim() !== '' && Number.isNaN(c)) e.commitments = { en: 'Please type numbers only. Type 0 if you have none.', ms: 'Sila taip nombor sahaja. Taip 0 jika tiada.' };
  return e;
}
