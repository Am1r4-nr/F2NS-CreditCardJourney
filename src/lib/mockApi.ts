import { MOCK_IDENTITY } from '../state/personas.ts';
import type { Identity, ProofMethod, ProofResult, Submission } from '../state/types.ts';
import type { Verdict } from './eligibility.ts';

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Pretend eKYC / MyKad scan. Always returns the same fixed, fake person. */
export async function scanMyKad(): Promise<Identity> {
  await delay(1500);
  return MOCK_IDENTITY;
}

const SOURCES: Record<ProofMethod, string> = {
  bank: 'Bank / e-wallet (read-only, simulated)',
  lhdn: 'LHDN record (simulated)',
  upload: 'Earnings statement (simulated upload)',
};

/** Pretend income check. Returns a 6-month summary. */
export async function verifyIncome(method: ProofMethod, declaredMonthly: number, fileName?: string): Promise<ProofResult> {
  await delay(method === 'upload' ? 900 : 1600);
  const base = Number.isFinite(declaredMonthly) && declaredMonthly > 0 ? declaredMonthly : 2800;
  const avg = Math.round(base * (method === 'lhdn' ? 0.97 : 1));
  return {
    method,
    avgMonthly: avg,
    lowest: Math.round(avg * 0.78 / 10) * 10,
    highest: Math.round(avg * 1.22 / 10) * 10,
    source: fileName ? `${SOURCES[method]}: ${fileName}` : SOURCES[method],
  };
}

export async function submitApplication(verdict: Verdict): Promise<Submission> {
  await delay(1400);
  const n = Math.floor(100000 + Math.random() * 900000);
  return { ref: `KAF-${n}`, at: new Date().toISOString(), inPrinciple: verdict };
}
