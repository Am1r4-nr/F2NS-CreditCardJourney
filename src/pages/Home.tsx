import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, navigate } from '../lib/router.ts';
import { Callout, Card, LinkButton, Sheet } from '../components/ui.tsx';
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
    <div className="space-y-6">
      <section aria-labelledby="page-title" className="relative isolate overflow-hidden rounded-[2rem] text-white shadow-[0_30px_80px_rgba(60,8,8,0.4)]" style={{ background: 'linear-gradient(135deg, #a3121b 0%, #c0161c 50%, #d92b1c 100%)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="grain absolute inset-0 opacity-70 mix-blend-soft-light" />
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#f46a1a]/80 blur-3xl" />
          <div className="absolute -bottom-40 left-1/2 h-[26rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#fdbe3a]/80 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#4d080c]/85 via-[#4d080c]/45 to-transparent" />
          <p className="absolute inset-x-0 -bottom-2 select-none text-center font-bold leading-[0.8] tracking-tight text-white/15" style={{ fontSize: 'clamp(9rem, 30vw, 26rem)' }}>KAF</p>
          <span className="absolute inset-y-0 left-1/3 hidden w-px bg-white/25 lg:block" />
          <span className="absolute inset-y-0 left-2/3 hidden w-px bg-white/25 lg:block" />
          <span className="absolute inset-x-0 top-6 h-px bg-white/25" />
        </div>

        <div className="px-6 pb-0 pt-10 sm:px-10 lg:px-14">
          <div className="text-sm leading-6">
            <p>01 / 05</p>
            <p>{t(bi('Responsible credit, 2026', 'Kredit bertanggungjawab, 2026'))}</p>
            <p className="font-semibold">{t(bi('For first-time cardholders in Malaysia', 'Untuk pemegang kad kali pertama di Malaysia'))}</p>
          </div>

          <div className="mt-6 flex flex-col gap-8 lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h1 id="page-title" tabIndex={-1} className="text-3xl font-bold leading-[1.1] tracking-[0.08em] sm:text-5xl lg:text-6xl">
                {t(bi('Your first card,|made simple.', 'Kad pertama anda,|dipermudahkan.')).split('|').map((line, i) => (<span key={i} className="block">{line}</span>))}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={href('cost')} className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-wide text-[#1c1412] hover:bg-orange-50">{t(bi('See what it costs', 'Lihat kosnya'))}</a>
                <a href={href('compare')} className="inline-flex min-h-12 items-center rounded-full border-2 border-white px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white/10">{t(bi('Compare cards', 'Banding kad'))}</a>
              </div>
              <p className="mt-4 text-sm">
                {t(bi('Decision: in-principle right away. Final approval ', 'Keputusan: dalam prinsip serta-merta. Kelulusan akhir '))}
                {t(bi(DECISION_TIME.en, DECISION_TIME.ms))}.
              </p>
            </div>
            <p className="max-w-xs text-sm leading-6 lg:text-right">
              {t(bi(
                'A calm, step-by-step guide. No payslip needed. No hidden fees. Clear reasons for every decision.',
                'Panduan tenang, langkah demi langkah. Tiada slip gaji diperlukan. Tiada yuran tersembunyi. Sebab jelas untuk setiap keputusan.',
              ))}
              {' '}{t(bi(`Compare ${CARDS.length} real cards from ${BANKS.length} banks.`, `Banding ${CARDS.length} kad sebenar daripada ${BANKS.length} bank.`))}
            </p>
          </div>

          <div className="relative mx-auto mt-6 w-full max-w-md sm:max-w-lg lg:-mb-2">
            <HeroCard />
            <a
              href={href('ready')}
              className="absolute -bottom-2 right-0 grid h-32 w-32 place-items-center rounded-full border border-white/70 p-2 sm:-right-10 sm:h-36 sm:w-36"
              aria-label={t(bi('Get started: check if I am ready', 'Mulakan: semak jika saya sedia'))}
            >
              <span className="grid h-full w-full place-items-center rounded-full bg-white text-center text-sm font-bold uppercase leading-5 tracking-wide text-[#1c1412] shadow-xl">
                {t(bi('Get started', 'Mulakan'))}
                <span aria-hidden="true" className="-mt-4 block text-xl">→</span>
              </span>
            </a>
          </div>

          <ul className="relative mt-4 grid border-t border-white/30 text-center text-sm font-medium sm:grid-cols-3">
            {[
              bi('Know the cost first', 'Ketahui kosnya dahulu'),
              bi('No payslip needed', 'Tiada slip gaji diperlukan'),
              bi('Clear reasons, always', 'Sebab yang jelas, sentiasa'),
            ].map((c, i) => (
              <li key={c.en} className={`relative px-4 py-5 ${i > 0 ? 'sm:border-l sm:border-white/30' : ''}`}>
                <span aria-hidden="true" className="absolute -top-1 left-1/2 hidden h-2 w-2 -translate-x-1/2 rounded-full bg-white sm:block" />
                {t(c)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Sheet className="space-y-10">

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

      <section aria-labelledby="promise-h" className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 id="promise-h" className="mb-3 text-2xl font-extrabold">{t(bi('Our promises', 'Janji kami'))}</h2>
        <ul className="grid gap-3 text-lg sm:grid-cols-3">
          <li>✅ {t(bi('Every fee shown before you submit.', 'Setiap yuran ditunjukkan sebelum anda hantar.'))}</li>
          <li>✅ {t(bi('Know every document you need, and the alternatives.', 'Tahu setiap dokumen diperlukan, dan alternatifnya.'))}</li>
          <li>✅ {t(bi('If the answer is no, you get reasons and next steps.', 'Jika jawapannya tidak, anda dapat sebab dan langkah seterusnya.'))}</li>
        </ul>
      </section>
      </Sheet>
    </div>
  );
}
