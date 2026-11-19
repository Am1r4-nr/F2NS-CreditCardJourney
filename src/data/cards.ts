import raw from './cards.json' with { type: 'json' };
import type { CardRecord, CardsFile, RawBank } from './cardTypes.ts';
import { resolveCards } from './resolve.ts';

const file = raw as unknown as CardsFile;

export const CARDS: CardRecord[] = resolveCards(file);
export const CARDS_META = file.meta;
export const BANK_RECORDS: RawBank[] = file.banks;

export function findCard(id: string | null | undefined): CardRecord | undefined {
  return id ? CARDS.find((c) => c.id === id) : undefined;
}

export function findBank(id: string): RawBank | undefined {
  return file.banks.find((b) => b.id === id);
}

/** Bank names for the filter, in alphabetical order. */
export const BANKS: string[] = [...new Set(CARDS.map((c) => c.bank))].sort((a, b) => a.localeCompare(b));
