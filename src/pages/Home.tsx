import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, navigate } from '../lib/router.ts';
import { Callout, Card, LinkButton } from '../components/ui.tsx';
import { PERSONAS } from '../state/personas.ts';
import { STAGES } from '../components/layout.tsx';
import { DECISION_TIME } from '../config/rates.ts';
import { BANKS, CARDS } from '../data/cards.ts';
import { HeroCard } from '../components/HeroCard.tsx';

const STAGE_TEXT = [
  bi('Check if you are likely to qualify. Free. No effect on your credit record.', 'Semak jika anda berkemungkinan layak. Percuma. Tiada kesan pada rekod kredit.'),
  bi('See what a purchase really costs if you pay late or only the minimum.', 'Lihat kos sebenar pembelian jika anda bayar lewat atau bayar minimum sahaja.'),
  bi('Apply in about 5 minutes. No payslip? There are other ways to prove income.', 'Mohon dalam kira-kira 5 minit. Tiada slip gaji? Ada cara lain membuktikan pendapatan.'),
  bi('See where your application is and why a decision was made.', 'Lihat status permohonan dan sebab keputusan dibuat.'),
  bi('A simple guide for your first 3 months to build a good record.', 'Panduan mudah untuk 3 bulan pertama bagi membina rekod yang baik.'),
];

export function HomePage() {
  const { t } = useLang();
  const { state, update } = useApp();
  const d = state.draft;
  const hasDraft = d.savedAt !== null && !state.submission;

  function tryPersona(id: string) {
    const p = PERSONAS.find((x) => x.id === id)!;
    update((s) => ({ ...s, ready: p.ready, readyDone: false }));
    navigate('ready');
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 p-6 shadow-[0_20px_60px_rgba(31,37,99,0.08)] backdrop-blur-sm sm:p-10 lg:p-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">{t(bi('Your first credit card', 'Kad kredit pertama anda'))}</p>
            <h1 id="page-title" tabIndex={-1} className="mt-3 max-w-xl text-4xl font-bold leading-[1.1] text-cyan-800 sm:text-5xl">
              {t(bi('Credit, made simple. Know the cost first.', 'Kredit, dipermudahkan. Ketahui kosnya dahulu.'))}
            </h1>
            <p className="mt-4 max-w-md text-lg text-cyan-800/80">
              {t(bi(
                'A calm, step-by-step guide for young adults in Malaysia. No payslip needed. No hidden fees. Clear reasons for every decision.',
                'Panduan tenang, langkah demi langkah untuk anak muda di Malaysia. Tiada slip gaji diperlukan. Tiada yuran tersembunyi. Sebab jelas untuk setiap keputusan.',
              ))}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton href={href('ready')}>{t(bi('Get started', 'Mulakan'))}</LinkButton>
              <LinkButton href={href('cost')} variant="secondary">{t(bi('See what it costs', 'Lihat kosnya'))}</LinkButton>
            </div>
            <p className="mt-4 text-sm text-cyan-800/70">
              {t(bi('Decision: in-principle right away. Final approval ', 'Keputusan: dalam prinsip serta-merta. Kelulusan akhir '))}
              {t(bi(DECISION_TIME.en, DECISION_TIME.ms))}.
            </p>
            <ul className="mt-9 max-w-sm">
              <li className="border-t border-cyan-700/20">
                <a href={href('ready')} className="flex min-h-16 items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-xs text-cyan-800/75">{t(bi('Free. No effect on your credit record', 'Percuma. Tiada kesan pada rekod kredit anda'))}</span>
                    <span className="block text-lg font-semibold text-cyan-800">{t(bi('Am I ready?', 'Sedia kah saya?'))}</span>
                  </span>
                  <span aria-hidden="true" className="text-2xl text-cyan-700">→</span>
                </a>
              </li>
              <li className="border-t border-cyan-700/20">
                <a href={href('compare')} className="flex min-h-16 items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-xs text-cyan-800/75">{t(bi(`${CARDS.length} real cards from ${BANKS.length} banks`, `${CARDS.length} kad sebenar daripada ${BANKS.length} bank`))}</span>
                    <span className="block text-lg font-semibold text-cyan-800">{t(bi('Compare cards', 'Banding kad'))}</span>
                  </span>
                  <span aria-hidden="true" className="text-2xl text-cyan-700">→</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroCard />
          </div>
        </div>
      </section>

      {hasDraft && (
        <Callout tone="info" title={t(bi('You have a saved application', 'Anda ada permohonan tersimpan'))}>
          <p className="mb-3">{t(bi('Pick up where you left off.', 'Sambung dari tempat anda berhenti.'))}</p>
          <LinkButton href={href('apply')}>{t(bi('Continue my application', 'Sambung permohonan saya'))}</LinkButton>
        </Callout>
      )}

      <section aria-labelledby="journey-h">
        <h2 id="journey-h" className="mb-4 text-2xl font-extrabold">{t(bi('Your journey in 5 stages', 'Perjalanan anda dalam 5 peringkat'))}</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.key}>
              <a href={href(s.route)} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 hover:border-cyan-600">
                <span className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-cyan-700 font-bold text-white">{i + 1}</span>
                <span className="text-lg font-bold">{t(s.label)}</span>
                <span className="mt-1 text-base text-slate-700">{t(STAGE_TEXT[i])}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="cmp-h" className="rounded-3xl border border-cyan-300 bg-cyan-50 p-6">
        <h2 id="cmp-h" className="text-2xl font-extrabold">{t(bi('Not sure which card? Compare them first', 'Tidak pasti kad mana? Banding dahulu'))}</h2>
        <p className="mb-4 mt-1 text-lg text-slate-700">
          {t(bi(`See ${CARDS.length} cards from ${BANKS.length} Malaysian banks side by side: fees, rates, income needed and what proof they list. This step is optional.`, `Lihat ${CARDS.length} kad daripada ${BANKS.length} bank di Malaysia secara bersebelahan: yuran, kadar, pendapatan diperlukan dan bukti yang disenaraikan. Langkah ini pilihan.`))}
        </p>
        <LinkButton href={href('compare')}>{t(bi('Compare cards', 'Banding kad'))}</LinkButton>
      </section>

      <section aria-labelledby="who-h">
        <h2 id="who-h" className="mb-1 text-2xl font-extrabold">{t(bi('Who is this for?', 'Untuk siapa ini?'))}</h2>
        <p className="mb-4 text-lg text-slate-700">{t(bi('Tap a person to try the readiness check with their details.', 'Ketik seseorang untuk cuba semakan dengan butiran mereka.'))}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PERSONAS.map((p) => (
            <Card key={p.id}>
              <p className="text-xl font-bold">{p.name}</p>
              <p className="mb-4 text-slate-700">{t(p.tagline)}</p>
              <button type="button" onClick={() => tryPersona(p.id)} className="min-h-12 w-full rounded-xl border-2 border-cyan-700 font-semibold text-cyan-800 hover:bg-cyan-50">
                {t(bi('Try as ', 'Cuba sebagai '))}{p.name.split(',')[0]}
              </button>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="promise-h" className="rounded-3xl bg-white p-6">
        <h2 id="promise-h" className="mb-3 text-2xl font-extrabold">{t(bi('Our promises', 'Janji kami'))}</h2>
        <ul className="grid gap-3 text-lg sm:grid-cols-3">
          <li>✅ {t(bi('Every fee shown before you submit.', 'Setiap yuran ditunjukkan sebelum anda hantar.'))}</li>
          <li>✅ {t(bi('Know every document you need, and the alternatives.', 'Tahu setiap dokumen diperlukan, dan alternatifnya.'))}</li>
          <li>✅ {t(bi('If the answer is no, you get reasons and next steps.', 'Jika jawapannya tidak, anda dapat sebab dan langkah seterusnya.'))}</li>
        </ul>
      </section>
    </div>
  );
}
