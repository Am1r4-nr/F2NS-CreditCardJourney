import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, navigate } from '../lib/router.ts';
import { Callout, Card, LinkButton } from '../components/ui.tsx';
import { PERSONAS } from '../state/personas.ts';
import { STAGES } from '../components/layout.tsx';
import { DECISION_TIME } from '../config/rates.ts';

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
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-700 via-cyan-800 to-teal-700 p-6 text-white sm:p-10">
        <p className="text-sm font-bold uppercase tracking-wider text-cyan-100">{t(bi('Your first credit card', 'Kad kredit pertama anda'))}</p>
        <h1 id="page-title" tabIndex={-1} className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          {t(bi('Get your first card. Know the cost. Build good credit.', 'Dapatkan kad pertama anda. Ketahui kosnya. Bina kredit yang baik.'))}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-cyan-50">
          {t(bi(
            'A calm, step-by-step guide for young adults in Malaysia. No payslip needed. No hidden fees. Clear reasons for every decision.',
            'Panduan tenang, langkah demi langkah untuk anak muda di Malaysia. Tiada slip gaji diperlukan. Tiada yuran tersembunyi. Sebab jelas untuk setiap keputusan.',
          ))}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href={href('ready')} className="!bg-white !text-cyan-900 hover:!bg-cyan-50">
            {t(bi('Check if I am ready', 'Semak jika saya sedia'))}
          </LinkButton>
          <LinkButton href={href('cost')} variant="secondary" className="!border-white !bg-transparent !text-white hover:!bg-white/10">
            {t(bi('See what it costs', 'Lihat kosnya'))}
          </LinkButton>
        </div>
        <p className="mt-4 text-sm text-cyan-100">
          {t(bi('Decision: in-principle right away. Final approval ', 'Keputusan: dalam prinsip serta-merta. Kelulusan akhir '))}
          {t(bi(DECISION_TIME.en, DECISION_TIME.ms))}.
        </p>
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
          {t(bi('See cards from 12 Malaysian banks side by side: fees, rates, income needed and what proof they accept. This step is optional.', 'Lihat kad daripada 12 bank di Malaysia secara bersebelahan: yuran, kadar, pendapatan diperlukan dan bukti yang diterima. Langkah ini pilihan.'))}
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
