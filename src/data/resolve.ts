import type { CardRecord, CardsFile } from './cardTypes.ts';

/** Fills each card with the rules of its bank. A card's own values win. */
export function resolveCards(file: CardsFile): CardRecord[] {
  const banks = new Map(file.banks.map((b) => [b.id, b]));
  return file.cards.map((c) => {
    const b = banks.get(c.bank);
    if (!b) throw new Error(`Card ${c.id} points to an unknown bank "${c.bank}"`);
    const interest = c.interestOverride ?? (b.interest ? { min: b.interest.min, max: b.interest.max } : null);
    return {
      id: c.id,
      bankId: b.id,
      bank: b.name,
      bankShort: b.short,
      bankWebsite: b.website,
      name: c.name,
      network: c.network,
      kind: c.kind,
      tier: c.tier,
      annualFee: c.annualFee,
      annualFeeWaiver: c.annualFeeWaiver,
      serviceTax: b.serviceTax,
      interest,
      interestNote: c.interestOverride ? null : (b.interest?.note ?? null),
      minPayment: b.minPayment,
      lateFee: c.lateFeeOverride ?? b.lateFee,
      cashAdvance: c.cashAdvanceOverride ?? b.cashAdvance,
      fxPercent: b.fxPercent,
      fxNote: b.fxNote,
      minAge: c.minAge ?? b.minAge,
      maxAge: b.maxAge,
      minAnnualIncome: c.minAnnualIncome,
      incomeNote: c.incomeNote ?? null,
      incomeProof: c.incomeProof ?? b.incomeProof,
      supplementary: c.supplementary ?? b.supplementary,
      rewards: c.rewards,
      perks: c.perks,
      instalment0: b.instalment0,
      approvalTime: b.approvalTime,
      secured: c.secured,
      securedDeposit: c.securedDeposit ?? null,
      lastUpdated: c.lastChecked,
      sourceUrl: c.sourceUrl ?? b.cardsUrl ?? b.website,
      hasOwnPage: !!c.sourceUrl,
      feesUrl: b.feesUrl,
      pdsUrl: b.pdsUrl,
      dataSources: b.sources,
    };
  });
}
