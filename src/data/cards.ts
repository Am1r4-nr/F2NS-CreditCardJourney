import raw from './cards.json' with { type: 'json' };
import type { CardRecord, CardsFile } from './cardTypes.ts';

const file = raw as unknown as CardsFile;

export const CARDS: CardRecord[] = file.cards;
export const CARDS_META = file.meta;

export function findCard(id: string | null | undefined): CardRecord | undefined {
  return id ? CARDS.find((c) => c.id === id) : undefined;
}

export const BANKS: string[] = [...new Set(CARDS.map((c) => c.bank))].sort((a, b) => a.localeCompare(b));
