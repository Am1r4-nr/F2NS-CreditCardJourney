import type { Bi, Lang } from '../lib/eligibility.ts';
import { useApp } from '../state/store.tsx';

export type { Bi, Lang };

/** Returns `t`, which picks the active language from a { en, ms } object. */
export function useLang() {
  const { state } = useApp();
  const lang = state.lang;
  const t = (b: Bi) => b[lang];
  return { lang, t };
}

/** Shorthand to build a Bi object. */
export const bi = (en: string, ms: string): Bi => ({ en, ms });

/** Shared UI strings. */
export const C = {
  next: bi('Next', 'Seterusnya'),
  back: bi('Back', 'Kembali'),
  continue: bi('Continue', 'Teruskan'),
  submit: bi('Submit application', 'Hantar permohonan'),
  save: bi('Save and continue later', 'Simpan dan sambung kemudian'),
  whyAsk: bi('Why we ask this', 'Mengapa kami tanya'),
  recommended: bi('Recommended', 'Disyorkan'),
  illustrative: bi('Figures are illustrative only.', 'Angka hanya sebagai contoh.'),
  noCreditImpact: bi(
    'This check does NOT affect your credit record. No one will see it.',
    'Semakan ini TIDAK menjejaskan rekod kredit anda. Tiada sesiapa akan melihatnya.',
  ),
  perMonth: bi('a month', 'sebulan'),
  months: bi('months', 'bulan'),
  month: bi('month', 'bulan'),
  startOver: bi('Start over', 'Mula semula'),
  close: bi('Close', 'Tutup'),
};
