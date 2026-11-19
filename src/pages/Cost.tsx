import { useEffect } from 'react';
import { bi, useLang, C } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href } from '../lib/router.ts';
import { Callout, Card, LinkButton, PageTitle } from '../components/ui.tsx';
import { SIM_LIMITS } from '../config/rates.ts';
import { money } from '../lib/format.ts';
import { DEFAULT_TERMS, simulate, type RepayMode, type SimResult } from '../lib/cost.ts';
import { findCard } from '../data/cards.ts';
import { termsFromCard } from '../lib/cards.ts';
import { Disclaimer, SelectedCardChip } from '../components/cards.tsx';
import { Button } from '../components/ui.tsx';

function Scenario({ title, r, spend, highlight }: { title: string; r: SimResult; spend: number; highlight?: boolean }) {
  const { t } = useLang();
  const rows: [string, string][] = [
    [t(bi('Interest charged', 'Faedah dikenakan')), money(r.interest, 2)],
    [t(bi('Minimum payment (first month)', 'Bayaran minimum (bulan pertama)')), money(r.firstMinPayment, 2)],
    [t(bi('Late fee if you miss the due date', 'Fi lewat jika anda terlepas tarikh akhir')), money(r.lateFee, 2)],
    [t(bi('Months to repay', 'Bulan untuk melunaskan')), r.neverEnds ? '∞' : String(r.months)],
  ];
  return (
    <Card className={highlight ? 'border-emerald-300 bg-emerald-50/40' : ''}>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <dl className="mt-3 divide-y divide-slate-200">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="text-slate-700">{k}</dt>
            <dd className="text-lg font-bold">{v}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 pt-3">
          <dt className="font-bold">{t(bi('Total you pay', 'Jumlah yang anda bayar'))}</dt>
          <dd className="text-2xl font-extrabold">{money(r.total, 2)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-sm text-slate-600">{t(bi('You bought', 'Anda beli'))} {money(spend)}.</p>
    </Card>
  );
}

export function CostPage() {
  const { t } = useLang();
  const { state, update, patch } = useApp();
  const sim = state.sim;
  const card = findCard(state.selectedCardId);
  const terms = card ? termsFromCard(card) : DEFAULT_TERMS;
  const set = (p: Partial<typeof sim>) => update((s) => ({ ...s, sim: { ...s.sim, ...p } }));

  useEffect(() => {
    update((s) => (s.done.cost ? s : { ...s, done: { ...s.done, cost: true } }));
  }, [update]);

  const chosen = simulate(sim, terms);
  const minimum = simulate({ ...sim, mode: 'minimum' }, terms);
  const full = simulate({ ...sim, mode: 'full' }, terms);
  const extra = Math.round((minimum.total - full.total) * 100) / 100;

  const modes: { id: RepayMode; label: ReturnType<typeof bi> }[] = [
    { id: 'minimum', label: bi('Minimum only', 'Minimum sahaja') },
    { id: 'fixed', label: bi('Fixed amount', 'Jumlah tetap') },
    { id: 'full', label: bi('Pay in full', 'Bayar penuh') },
  ];

  return (
    <div>
      <PageTitle
        title={t(bi('What will it really cost?', 'Berapa kos sebenarnya?'))}
        intro={t(bi('Move the slider to pick a purchase. See what you pay under each way of repaying.', 'Gerakkan slaid untuk pilih pembelian. Lihat apa yang anda bayar dengan setiap cara bayaran.'))}
      />

      <div className="mb-6 space-y-3">
        {card ? (
          <>
            <SelectedCardChip showClear={false} />
            <Callout tone="info" title={t(bi('Using this card’s rates', 'Menggunakan kadar kad ini'))}>
              <p>
                {t(bi(
                  `Interest ${card.interestPa}% a year. Other fees not in the simulation below: annual fee ${money(card.annualFee)}${card.annualFeeWaiver ? ` (${card.annualFeeWaiver.en.toLowerCase()})` : ''}, cash advance ${card.cashAdvance.percent}% (at least ${money(card.cashAdvance.min)}), foreign currency ${card.fxFeePercent}%.`,
                  `Faedah ${card.interestPa}% setahun. Yuran lain yang tiada dalam simulasi di bawah: yuran tahunan ${money(card.annualFee)}${card.annualFeeWaiver ? ` (${card.annualFeeWaiver.ms.toLowerCase()})` : ''}, pendahuluan tunai ${card.cashAdvance.percent}% (sekurang-kurangnya ${money(card.cashAdvance.min)}), mata wang asing ${card.fxFeePercent}%.`,
                ))}
              </p>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => patch({ selectedCardId: null })}>{t(bi('Use standard rates', 'Guna kadar standard'))}</Button>
              </div>
            </Callout>
            <Disclaimer compact />
          </>
        ) : (
          <Callout tone="info" title={t(bi('Standard rates', 'Kadar standard'))}>
            <p>{t(bi('These figures use our standard example rates. Want to see a real-looking card? Pick one in the comparison hub.', 'Angka ini guna kadar contoh standard kami. Mahu lihat kad yang nampak sebenar? Pilih satu di hab perbandingan.'))}</p>
            <a href={href('compare')} className="mt-1 inline-flex min-h-11 items-center font-semibold underline">{t(bi('Compare cards', 'Banding kad'))} →</a>
          </Callout>
        )}
      </div>

      <Card className="mb-6 space-y-6">
        <div>
          <label htmlFor="spend" className="block text-lg font-semibold">{t(bi('How much do you spend?', 'Berapa banyak anda belanja?'))}</label>
          <p className="my-1 text-4xl font-extrabold text-cyan-800">{money(sim.spend)}</p>
          <input id="spend" type="range" min={SIM_LIMITS.spendMin} max={SIM_LIMITS.spendMax} step={SIM_LIMITS.spendStep} value={sim.spend} onChange={(e) => set({ spend: Number(e.target.value) })} className="h-12 w-full" aria-valuetext={money(sim.spend)} />
          <div className="flex justify-between text-sm text-slate-600"><span>{money(SIM_LIMITS.spendMin)}</span><span>{money(SIM_LIMITS.spendMax)}</span></div>
        </div>

        <fieldset>
          <legend className="mb-2 text-lg font-semibold">{t(bi('How will you pay it back?', 'Bagaimana anda akan membayarnya semula?'))}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {modes.map((m) => (
              <label key={m.id} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 font-semibold ${sim.mode === m.id ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300'}`}>
                <input type="radio" name="mode" className="h-5 w-5" checked={sim.mode === m.id} onChange={() => set({ mode: m.id })} />
                {t(m.label)}
              </label>
            ))}
          </div>
        </fieldset>

        {sim.mode === 'fixed' && (
          <div>
            <label htmlFor="fixed" className="block text-lg font-semibold">{t(bi('Your monthly payment (RM)', 'Bayaran bulanan anda (RM)'))}</label>
            <input id="fixed" type="number" inputMode="numeric" min={0} value={sim.fixed} onChange={(e) => set({ fixed: Math.max(0, Number(e.target.value) || 0) })} className="mt-1 min-h-12 w-full max-w-xs rounded-xl border-2 border-slate-400 px-4 text-lg" />
            {chosen.usedMinimum && (
              <p className="mt-2 font-semibold text-amber-800">
                {t(bi(`That is below the minimum, so we used the minimum payment instead (${money(chosen.firstMinPayment)}).`, `Itu di bawah minimum, jadi kami guna bayaran minimum (${money(chosen.firstMinPayment)}).`))}
              </p>
            )}
          </div>
        )}
      </Card>

      <section aria-live="polite" className="mb-6">
        <Callout tone={extra > 0 ? 'warn' : 'good'} title={t(bi('In plain words', 'Dalam bahasa mudah'))}>
          <p className="text-lg">
            {t(bi(
              `If you only pay the minimum on ${money(sim.spend)}, you'll pay ${money(extra, 2)} extra over ${minimum.months} months.`,
              `Jika anda hanya bayar minimum untuk ${money(sim.spend)}, anda akan bayar ${money(extra, 2)} lebih dalam ${minimum.months} bulan.`,
            ))}
          </p>
          <p className="mt-1">
            {t(bi(
              `If you pay in full by the due date, you pay no interest. That is ${money(full.total, 2)} in total.`,
              `Jika anda bayar penuh sebelum tarikh akhir, tiada faedah. Jumlahnya ${money(full.total, 2)}.`,
            ))}
          </p>
        </Callout>
      </section>

      {sim.mode === 'fixed' && (
        <div className="mb-6">
          <Scenario title={t(bi(`Your plan: ${money(Math.max(sim.fixed, chosen.firstMinPayment))} a month`, `Pelan anda: ${money(Math.max(sim.fixed, chosen.firstMinPayment))} sebulan`))} r={chosen} spend={sim.spend} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Scenario title={t(bi('Pay minimum only', 'Bayar minimum sahaja'))} r={minimum} spend={sim.spend} />
        <Scenario title={t(bi('Pay in full', 'Bayar penuh'))} r={full} spend={sim.spend} highlight />
      </div>

      <div className="mt-6 space-y-3">
        <Callout tone="info" title={t(bi('How we work this out', 'Bagaimana kami kira'))}>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t(bi(`Interest: ${terms.aprPercent}% a year on what you still owe.`, `Faedah: ${terms.aprPercent}% setahun atas baki yang masih terhutang.`))}</li>
            <li>{t(bi(`Minimum payment: ${terms.minPercent}% of what you owe or ${money(terms.minFloor)}, whichever is higher.`, `Bayaran minimum: ${terms.minPercent}% daripada hutang atau ${money(terms.minFloor)}, mana yang lebih tinggi.`))}</li>
            <li>{t(bi(`Late fee: ${money(terms.lateFlat)} or ${terms.latePercent}% of what you owe, whichever is higher.`, `Fi lewat: ${money(terms.lateFlat)} atau ${terms.latePercent}% daripada hutang, mana yang lebih tinggi.`))}</li>
            <li>{t(C.illustrative)}</li>
          </ul>
        </Callout>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={href('apply')}>{t(bi('Next: Apply', 'Seterusnya: Mohon'))}</LinkButton>
          <LinkButton href={href('pricing')} variant="secondary">{t(bi('See all fees', 'Lihat semua yuran'))}</LinkButton>
        </div>
      </div>
    </div>
  );
}
