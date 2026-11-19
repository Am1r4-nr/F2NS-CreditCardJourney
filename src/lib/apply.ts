import type { Bi } from './eligibility.ts';
import { parseAmount } from './format.ts';
import type { Draft } from '../state/types.ts';

export type QId = 'scan' | 'phone' | 'email' | 'employment' | 'income' | 'commitments' | 'proof' | 'review';

export interface Question {
  id: QId;
  /** 1 to 5 */
  step: number;
}

/** Flat question list. On mobile one question is shown at a time. On desktop a whole step is shown. */
export const QUESTIONS: Question[] = [
  { id: 'scan', step: 1 },
  { id: 'phone', step: 2 },
  { id: 'email', step: 2 },
  { id: 'employment', step: 3 },
  { id: 'income', step: 3 },
  { id: 'commitments', step: 3 },
  { id: 'proof', step: 4 },
  { id: 'review', step: 5 },
];

export const STEPS: { n: number; label: Bi }[] = [
  { n: 1, label: { en: 'Identity', ms: 'Identiti' } },
  { n: 2, label: { en: 'Contact', ms: 'Hubungan' } },
  { n: 3, label: { en: 'Work and income', ms: 'Kerja dan pendapatan' } },
  { n: 4, label: { en: 'Income proof', ms: 'Bukti pendapatan' } },
  { n: 5, label: { en: 'Review and submit', ms: 'Semak dan hantar' } },
];

export const SECONDS_PER_QUESTION = 20;

export function questionsOfStep(step: number): number[] {
  return QUESTIONS.map((q, i) => (q.step === step ? i : -1)).filter((i) => i >= 0);
}

export function firstQuestionOfStep(step: number): number {
  return questionsOfStep(step)[0] ?? 0;
}

/** Minutes left, rounded up, never less than 1 until the end. */
export function minutesLeft(q: number): number {
  const remaining = QUESTIONS.length - q;
  return Math.max(1, Math.ceil((remaining * SECONDS_PER_QUESTION) / 60));
}

export const PHONE_RE = /^(?:\+?60|0)1\d{8,9}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isMalaysianMobile(s: string): boolean {
  return PHONE_RE.test(s.replace(/[\s-]/g, ''));
}

/** Age in whole years from text such as "12 April 2001" or "2001-04-12". Returns NaN if it cannot be read. */
export function ageFromDob(dob: string, now: Date = new Date()): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Returns a friendly message, or undefined when the answer is fine. */
export function validateQuestion(id: QId, d: Draft): Bi | undefined {
  switch (id) {
    case 'scan': {
      if (d.scanned) return undefined;
      if (d.manualIdentity) {
        if (!d.identity.name.trim()) return { en: 'Please type your full name as on your MyKad.', ms: 'Sila taip nama penuh anda seperti pada MyKad.' };
        if (Number.isNaN(ageFromDob(d.identity.dob))) return { en: 'Please pick your date of birth.', ms: 'Sila pilih tarikh lahir anda.' };
        if (d.identity.address.trim().length < 8) return { en: 'Please type your home address.', ms: 'Sila taip alamat rumah anda.' };
        return undefined;
      }
      return { en: 'Please scan your MyKad, or choose to type your details.', ms: 'Sila imbas MyKad anda, atau pilih untuk menaip butiran anda.' };
    }
    case 'phone':
      if (!d.phone.trim()) return { en: 'Please type your mobile number.', ms: 'Sila taip nombor telefon bimbit anda.' };
      if (!isMalaysianMobile(d.phone)) return { en: 'That does not look like a Malaysian mobile number. Try 012-345 6789 or +6012 345 6789.', ms: 'Ini tidak nampak seperti nombor telefon bimbit Malaysia. Cuba 012-345 6789 atau +6012 345 6789.' };
      return undefined;
    case 'email':
      if (!d.email.trim()) return { en: 'Please type your email address.', ms: 'Sila taip alamat e-mel anda.' };
      if (!EMAIL_RE.test(d.email.trim())) return { en: 'That email looks incomplete. It should look like name@example.com.', ms: 'E-mel ini nampak tidak lengkap. Ia perlu seperti nama@contoh.com.' };
      return undefined;
    case 'employment':
      return undefined;
    case 'income': {
      const n = parseAmount(d.income);
      if (Number.isNaN(n)) return { en: 'Please type your usual monthly income. Type 0 if you have none.', ms: 'Sila taip pendapatan bulanan biasa anda. Taip 0 jika tiada.' };
      if (n > 1_000_000) return { en: 'That looks too high. Please check the amount.', ms: 'Jumlah ini nampak terlalu tinggi. Sila semak.' };
      return undefined;
    }
    case 'commitments': {
      if (d.commitments.trim() === '') return undefined;
      if (Number.isNaN(parseAmount(d.commitments))) return { en: 'Please type numbers only, or leave it blank.', ms: 'Sila taip nombor sahaja, atau biarkan kosong.' };
      return undefined;
    }
    case 'proof':
      if (d.proof && d.proof.method === d.proofMethod) return undefined;
      if (d.proofMethod === 'bank') return { en: 'Please agree and connect your account first, or pick another way to prove your income.', ms: 'Sila bersetuju dan hubungkan akaun anda dahulu, atau pilih cara lain untuk membuktikan pendapatan.' };
      if (d.proofMethod === 'lhdn') return { en: 'Please agree and check your LHDN record first, or pick another way.', ms: 'Sila bersetuju dan semak rekod LHDN anda dahulu, atau pilih cara lain.' };
      return { en: 'Please add your file first, or pick another way to prove your income.', ms: 'Sila tambah fail anda dahulu, atau pilih cara lain untuk membuktikan pendapatan.' };
    case 'review':
      if (!d.costRead) return { en: 'Please tick the box to confirm you have read the costs.', ms: 'Sila tandakan kotak untuk mengesahkan anda telah membaca kos.' };
      return undefined;
  }
}
