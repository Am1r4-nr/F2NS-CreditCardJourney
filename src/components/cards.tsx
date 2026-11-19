import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, navigate } from '../lib/router.ts';
import { money, parseAmount } from '../lib/format.ts';
import type { CardRecord, Tier } from '../data/cardTypes.ts';
import { BANKS, CARDS, findCard } from '../data/cards.ts';
import {
  CRITERIA_LABEL, INCOME_SLIDER_MAX, TIER_INFO, TIER_ORDER, INCOME_SLIDER_STEP, REWARD_LABEL, bestMatches, derive,
  type Criterion, type Filters,
} from '../lib/cards.ts';
import { Badge, Button, Callout, Card } from './ui.tsx';
import { CARDS_META } from '../data/cards.ts';

// ---------- Small pieces ----------

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  const { t } = useLang();
  return (
    <p role="note" className={`rounded-xl border border-amber-300 bg-amber-50 text-amber-950 ${compact ? 'p-2 text-sm' : 'p-3 text-base'}`}>
      <span aria-hidden="true">ⓘ </span>
      <strong>
        {t(bi(
          'Illustrative comparison for a prototype. Not financial advice. Check the bank’s official terms before applying.',
          'Perbandingan ilustrasi untuk prototaip. Bukan nasihat kewangan. Semak terma rasmi bank sebelum memohon.',
        ))}
      </strong>
    </p>
  );
}

export function BankLogo({ card }: { card: CardRecord }) {
  return (
    <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50 text-sm font-extrabold text-cyan-800">
      {card.bankShort}
    </span>
  );
}

export function Stars({ n }: { n: number }) {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center gap-1 font-bold" title={t(bi('First-card friendliness', 'Kemesraan kad pertama'))}>
      <span aria-hidden="true" className="text-amber-600">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
      <span>{n} {t(bi('out of 5', 'daripada 5'))}</span>
    </span>
  );
}

/** The card's tier as text with a symbol, for example "◆ Gold tier". */
export function TierTag({ tier }: { tier: Tier }) {
  const { t } = useLang();
  const info = TIER_INFO[tier];
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-800" title={t(info.blurb)}>
      <span aria-hidden="true">{info.icon}</span>
      {t(info.label)} {t(bi('tier', 'tahap'))}
    </span>
  );
}

export function CardBadges({ card }: { card: CardRecord }) {
  const { t } = useLang();
  const d = derive(card);
  const items: { key: string; label: string; tone: 'good' | 'info' | 'warn' }[] = [];
  if (d.gigFriendly) items.push({ key: 'gig', label: '🛵 ' + t(bi('Gig-worker friendly', 'Mesra pekerja gig')), tone: 'good' });
  if (d.feeKind === 'free') items.push({ key: 'free', label: '✔ ' + t(bi('No annual fee', 'Tiada yuran tahunan')), tone: 'good' });
  if (d.feeKind === 'waivable') items.push({ key: 'waive', label: '↺ ' + t(bi('Fee waivable', 'Yuran boleh dikecualikan')), tone: 'info' });
  if (card.kind === 'islamic') items.push({ key: 'islamic', label: '☪ ' + t(bi('Islamic', 'Islamik')), tone: 'info' });
  if (card.secured) items.push({ key: 'secured', label: '🔒 ' + t(bi('Secured', 'Bercagar')), tone: 'info' });
  if (d.studentFriendly) items.push({ key: 'student', label: '🎓 ' + t(bi('Student', 'Pelajar')), tone: 'info' });
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t(bi('Badges', 'Lencana'))}>
      {items.map((i) => (
        <li key={i.key}><Badge tone={i.tone}>{i.label}</Badge></li>
      ))}
    </ul>
  );
}

/** Plain-language fee text with the waiver condition next to it. */
export function FeeText({ card }: { card: CardRecord }) {
  const { t } = useLang();
  return (
    <span>
      <span className="font-bold">{card.annualFee === 0 ? t(bi('RM0 a year', 'RM0 setahun')) : `${money(card.annualFee)} ${t(bi('a year', 'setahun'))}`}</span>
      {card.annualFeeWaiver && <span className="block text-sm font-normal text-slate-700">{t(card.annualFeeWaiver)}</span>}
    </span>
  );
}

export function SelectedCardChip({ showClear = true }: { showClear?: boolean }) {
  const { t } = useLang();
  const { state, patch } = useApp();
  const card = findCard(state.selectedCardId);
  if (!card) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-300 bg-cyan-50 p-3">
      <BankLogo card={card} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-cyan-900">{t(bi('Your selected card', 'Kad pilihan anda'))}</p>
        <p className="font-bold">{card.bank} {card.name}</p>
        <p className="text-sm text-slate-700">{t(bi('Annual fee', 'Yuran tahunan'))}: {card.annualFee === 0 ? 'RM0' : money(card.annualFee)}</p>
      </div>
      <a href={href('compare')} className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-cyan-800 underline">{t(bi('Change card', 'Tukar kad'))}</a>
      {showClear && (
        <button type="button" onClick={() => patch({ selectedCardId: null })} className="min-h-11 rounded-lg px-3 font-semibold text-slate-700 underline">
          {t(bi('Clear', 'Kosongkan'))}
        </button>
      )}
    </div>
  );
}

// ---------- Card tile ----------

interface TileProps {
  card: CardRecord;
  selected: boolean;
  onToggle: (id: string) => void;
  onDetails: (id: string, opener: HTMLElement) => void;
}

export function CardTile({ card, selected, onToggle, onDetails }: TileProps) {
  const { t } = useLang();
  const d = derive(card);
  const title = `${card.bank} ${card.name}`;
  return (
    <li>
      <Card className={`flex h-full flex-col gap-3 ${selected ? 'border-cyan-600 ring-2 ring-cyan-600' : ''}`}>
        <div className="flex items-center gap-3">
          <BankLogo card={card} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700">{card.bank} · {card.network}</p>
            <h3 className="text-lg font-extrabold leading-snug">{card.name}</h3>
            <TierTag tier={card.tier} />
          </div>
        </div>
        <CardBadges card={card} />
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-base">
          <div className="col-span-2">
            <dt className="text-sm text-slate-600">{t(bi('Annual fee', 'Yuran tahunan'))}</dt>
            <dd><FeeText card={card} /></dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">{card.kind === 'islamic' ? t(bi('Profit rate a year', 'Kadar keuntungan setahun')) : t(bi('Interest a year', 'Faedah setahun'))}</dt>
            <dd className="font-bold">{card.interestPa}%</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">{t(bi('Income needed', 'Pendapatan diperlukan'))}</dt>
            <dd className="font-bold">{money(Math.round(card.minAnnualIncome / 12))} {t(bi('a month', 'sebulan'))}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-slate-600">{t(bi('Key reward', 'Ganjaran utama'))}</dt>
            <dd><span className="font-bold">{t(REWARD_LABEL[card.rewards.type])}</span>{card.rewards.type !== 'none' && <>: {t(card.rewards.summary)}</>}</dd>
          </div>
        </dl>
        <p className="text-base">
          <span className="text-sm text-slate-600">{t(bi('First-card friendliness', 'Kemesraan kad pertama'))}: </span>
          <Stars n={d.friendliness} />
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Button variant="secondary" onClick={(e) => onDetails(card.id, e.currentTarget)} aria-label={`${t(bi('Details', 'Butiran'))}: ${title}`}>
            {t(bi('Details', 'Butiran'))}
          </Button>
          <label className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 font-semibold ${selected ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300'}`}>
            <input type="checkbox" className="h-5 w-5" checked={selected} onChange={() => onToggle(card.id)} aria-label={`${t(bi('Add to compare', 'Tambah untuk banding'))}: ${title}`} />
            {t(bi('Compare', 'Banding'))}
          </label>
        </div>
      </Card>
    </li>
  );
}

// ---------- Filters ----------

const selectClass = 'min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-3 text-base';

function Sel({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>{children}</select>
    </div>
  );
}

function Check({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 font-semibold ${checked ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
      <input id={id} type="checkbox" className="h-5 w-5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function FilterPanel({ filters, onChange, onClear, activeCount }: { filters: Filters; onChange: (p: Partial<Filters>) => void; onClear: () => void; activeCount: number }) {
  const { t } = useLang();
  const all = t(bi('All', 'Semua'));
  const slider = filters.maxMonthlyIncome;
  const atMax = slider >= INCOME_SLIDER_MAX;
  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">{t(bi('Filters', 'Penapis'))}</legend>
      <Sel id="f-bank" label={t(bi('Bank', 'Bank'))} value={filters.bank} onChange={(v) => onChange({ bank: v })}>
        <option value="">{all}</option>
        {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
      </Sel>
      <Sel id="f-kind" label={t(bi('Card type', 'Jenis kad'))} value={filters.kind} onChange={(v) => onChange({ kind: v as Filters['kind'] })}>
        <option value="">{all}</option>
        <option value="conventional">{t(bi('Conventional', 'Konvensional'))}</option>
        <option value="islamic">{t(bi('Islamic', 'Islamik'))}</option>
      </Sel>
      <Sel id="f-tier" label={t(bi('Card tier', 'Tahap kad'))} value={filters.tier} onChange={(v) => onChange({ tier: v as Filters['tier'] })}>
        <option value="">{all}</option>
        {TIER_ORDER.map((k) => <option key={k} value={k}>{t(TIER_INFO[k].label)}</option>)}
      </Sel>
      <Sel id="f-network" label={t(bi('Network', 'Rangkaian'))} value={filters.network} onChange={(v) => onChange({ network: v as Filters['network'] })}>
        <option value="">{all}</option>
        <option value="Visa">Visa</option>
        <option value="Mastercard">Mastercard</option>
        <option value="Amex">Amex</option>
      </Sel>
      <Sel id="f-fee" label={t(bi('Annual fee', 'Yuran tahunan'))} value={filters.fee} onChange={(v) => onChange({ fee: v as Filters['fee'] })}>
        <option value="">{all}</option>
        <option value="free">{t(bi('Free (RM0)', 'Percuma (RM0)'))}</option>
        <option value="waivable">{t(bi('Can be waived', 'Boleh dikecualikan'))}</option>
        <option value="paid">{t(bi('Paid', 'Berbayar'))}</option>
      </Sel>
      <Sel id="f-reward" label={t(bi('Rewards', 'Ganjaran'))} value={filters.reward} onChange={(v) => onChange({ reward: v as Filters['reward'] })}>
        <option value="">{all}</option>
        {(['cashback', 'points', 'miles', 'none'] as const).map((r) => <option key={r} value={r}>{t(REWARD_LABEL[r])}</option>)}
      </Sel>
      <div>
        <label htmlFor="f-income" className="mb-1 block font-semibold">
          {t(bi('Income the card asks for', 'Pendapatan yang diminta kad'))}:{' '}
          <span className="text-cyan-800">{atMax ? t(bi('any', 'mana-mana')) : `${t(bi('up to', 'sehingga'))} ${money(slider)} ${t(bi('a month', 'sebulan'))}`}</span>
        </label>
        <input id="f-income" type="range" min={0} max={INCOME_SLIDER_MAX} step={INCOME_SLIDER_STEP} value={slider} onChange={(e) => onChange({ maxMonthlyIncome: Number(e.target.value) })} className="h-12 w-full" aria-valuetext={atMax ? t(bi('any income', 'sebarang pendapatan')) : `${money(slider)} ${t(bi('a month', 'sebulan'))}`} />
        <div className="flex justify-between text-sm text-slate-600"><span>RM0</span><span>{t(bi('Any', 'Mana-mana'))}</span></div>
      </div>
      <div className="grid gap-2">
        <Check id="f-gig" label={t(bi('Accepts gig income proof', 'Terima bukti pendapatan gig'))} checked={filters.gig} onChange={(v) => onChange({ gig: v })} />
        <Check id="f-secured" label={t(bi('Secured card', 'Kad bercagar'))} checked={filters.secured} onChange={(v) => onChange({ secured: v })} />
        <Check id="f-digital" label={t(bi('Apply online', 'Mohon dalam talian'))} checked={filters.digital} onChange={(v) => onChange({ digital: v })} />
        <Check id="f-student" label={t(bi('Student-friendly', 'Mesra pelajar'))} checked={filters.student} onChange={(v) => onChange({ student: v })} />
      </div>
      <Button variant="secondary" className="w-full" onClick={onClear} disabled={activeCount === 0}>
        {t(bi('Clear filters', 'Kosongkan penapis'))}
      </Button>
    </fieldset>
  );
}

// ---------- Best match ----------

export function BestMatchPanel({ onDetails, onCompare }: { onDetails: (id: string, opener: HTMLElement) => void; onCompare: (id: string) => void }) {
  const { t } = useLang();
  const { state } = useApp();
  const r = state.ready;
  if (!state.readyDone) {
    return (
      <Card className="border-cyan-300 bg-cyan-50/60">
        <h2 className="text-xl font-extrabold">{t(bi('Best match for me', 'Padanan terbaik untuk saya'))}</h2>
        <p className="mt-1 text-lg text-slate-700">{t(bi('Take the quick “Am I ready?” check first. Then we can suggest cards that fit your age, income and type of work.', 'Buat semakan ringkas “Sedia kah saya?” dahulu. Kemudian kami boleh cadangkan kad yang sesuai dengan umur, pendapatan dan jenis kerja anda.'))}</p>
        <a href={href('ready')} className="mt-3 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 font-semibold text-white hover:bg-cyan-800">
          {t(bi('Take the readiness check', 'Buat semakan kesediaan'))}
        </a>
      </Card>
    );
  }
  const result = bestMatches(CARDS, r);
  const ex = result.excluded;
  const monthly = parseAmount(r.income);
  return (
    <Card className="border-cyan-300 bg-cyan-50/60">
      <h2 className="text-xl font-extrabold">{t(bi('Best match for me', 'Padanan terbaik untuk saya'))}</h2>
      <p className="mt-1 text-slate-700">
        {t(bi(`Based on your answers: age ${r.age}, ${money(Number.isNaN(monthly) ? 0 : monthly)} a month. This is a suggestion, not an approval.`, `Berdasarkan jawapan anda: umur ${r.age}, ${money(Number.isNaN(monthly) ? 0 : monthly)} sebulan. Ini cadangan, bukan kelulusan.`))}
      </p>
      {result.matches.length === 0 ? (
        <div className="mt-3">
          <Callout tone="warn" title={t(bi('No card fits yet', 'Belum ada kad yang sesuai'))}>
            <p>{t(bi('That is okay. Many people start here. Your “how to qualify” plan shows the next steps.', 'Tidak mengapa. Ramai bermula di sini. Pelan “cara untuk layak” menunjukkan langkah seterusnya.'))}</p>
            <a href={href('ready')} className="mt-2 inline-flex min-h-11 items-center font-semibold underline">{t(bi('See my plan', 'Lihat pelan saya'))}</a>
          </Callout>
        </div>
      ) : (
        <ol className="mt-4 grid gap-3 lg:grid-cols-3">
          {result.matches.map((m, i) => (
            <li key={m.card.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-cyan-800">#{i + 1} {t(bi('match', 'padanan'))}</p>
              <p className="text-lg font-extrabold">{m.card.bank} {m.card.name}</p>
              <ul className="my-2 list-disc space-y-1 pl-5 text-base">
                {m.reasons.map((x, j) => <li key={j}>{t(x)}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" onClick={(e) => onDetails(m.card.id, e.currentTarget)} aria-label={`${t(bi('Details', 'Butiran'))}: ${m.card.bank} ${m.card.name}`}>{t(bi('Details', 'Butiran'))}</Button>
                <Button variant="ghost" onClick={() => onCompare(m.card.id)} aria-label={`${t(bi('Add to compare', 'Tambah untuk banding'))}: ${m.card.bank} ${m.card.name}`}>{t(bi('+ Compare', '+ Banding'))}</Button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {(result.matches.length < 3) && (ex.tooYoung + ex.lowIncome + ex.noProof > 0) && (
        <p className="mt-3 text-base text-slate-700">
          {t(bi('Left out: ', 'Ditinggalkan: '))}
          {ex.tooYoung > 0 && t(bi(`${ex.tooYoung} need a higher minimum age. `, `${ex.tooYoung} memerlukan umur minimum lebih tinggi. `))}
          {ex.lowIncome > 0 && t(bi(`${ex.lowIncome} ask for more income. `, `${ex.lowIncome} meminta pendapatan lebih tinggi. `))}
          {ex.noProof > 0 && t(bi(`${ex.noProof} do not accept the income proof that suits your work type. `, `${ex.noProof} tidak menerima bukti pendapatan yang sesuai dengan jenis kerja anda. `))}
          {result.securedFit && t(bi(`A secured card such as ${result.securedFit.bank} ${result.securedFit.name} may help.`, `Kad bercagar seperti ${result.securedFit.bank} ${result.securedFit.name} mungkin membantu.`))}
        </p>
      )}
    </Card>
  );
}

// ---------- Tips ----------

export function TipsStrip({ highlightMany }: { highlightMany: boolean }) {
  const { t } = useLang();
  const tips = [
    { key: 'many', text: bi('Avoid applying for many cards at once. Each application can leave a mark on your record.', 'Elakkan memohon banyak kad serentak. Setiap permohonan boleh meninggalkan kesan pada rekod anda.'), link: bi('Learn: myths about applying', 'Belajar: mitos tentang memohon') },
    { key: 'fee', text: bi('Annual fee is not the only cost. Check the interest rate and late fees too.', 'Yuran tahunan bukan satu-satunya kos. Semak juga kadar faedah dan fi lewat.'), link: bi('Learn: minimum vs full payment', 'Belajar: bayaran minimum vs penuh') },
    { key: 'full', text: bi('A rewards card only pays off if you pay the full bill each month.', 'Kad ganjaran hanya berbaloi jika anda bayar bil penuh setiap bulan.'), link: bi('Learn: pay in full', 'Belajar: bayar penuh') },
  ];
  return (
    <section aria-labelledby="tips-h" className="space-y-3">
      <h2 id="tips-h" className="text-xl font-extrabold">{t(bi('Smart tips before you choose', 'Tip bijak sebelum anda memilih'))}</h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {tips.map((x) => (
          <li key={x.key} className={`rounded-2xl border p-4 ${x.key === 'many' && highlightMany ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <p className="text-base">💡 {t(x.text)}</p>
            <a href={href('learn')} className="mt-1 inline-flex min-h-11 items-center font-semibold text-cyan-800 underline">{t(x.link)} →</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Used by detail and others ----------

export function FriendlinessBreakdown({ card }: { card: CardRecord }) {
  const { t } = useLang();
  const d = derive(card);
  return (
    <div>
      <p className="mb-1"><Stars n={d.friendliness} /></p>
      <p className="mb-2 text-sm text-slate-700">{t(bi('The score adds up 5 things, up to 1 point each, and is rounded:', 'Skor ini menjumlahkan 5 perkara, sehingga 1 mata setiap satu, dan dibundarkan:'))}</p>
      <ul className="space-y-1 text-base">
        {(Object.keys(CRITERIA_LABEL) as Criterion[]).map((k) => {
          const p = d.points[k];
          const sym = p >= 1 ? '✔' : p > 0 ? '◐' : '✘';
          const word = p >= 1 ? t(bi('yes', 'ya')) : p > 0 ? t(bi('partly', 'sebahagian')) : t(bi('no', 'tidak'));
          return <li key={k}><span aria-hidden="true">{sym} </span>{t(CRITERIA_LABEL[k])}: <strong>{word}</strong></li>;
        })}
      </ul>
    </div>
  );
}

export function useCardActions() {
  const { update } = useApp();
  return {
    simulate(id: string) {
      update((s) => ({ ...s, selectedCardId: id }));
      navigate('cost');
    },
    apply(id: string) {
      update((s) => ({ ...s, selectedCardId: id }));
      navigate('apply');
    },
  };
}

export function SampleNote() {
  const { t } = useLang();
  return <p className="text-sm text-slate-600">{t(CARDS_META.note)} {t(bi('Last updated', 'Dikemas kini'))}: {CARDS_META.lastUpdated}.</p>;
}
