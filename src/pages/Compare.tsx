import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { Button, Callout, PageTitle } from '../components/ui.tsx';
import { CARDS, CARDS_META } from '../data/cards.ts';
import { DEFAULT_FILTERS, TIER_INFO, TIER_ORDER, activeFilterCount, filterCards, sortCards, tierCounts, type Filters, type SortKey } from '../lib/cards.ts';
import { BestMatchPanel, CardTile, Disclaimer, FilterPanel, SampleNote, TipsStrip } from '../components/cards.tsx';
import { CardDetail, CompareBar, CompareTable } from '../components/compare.tsx';
import type { CompareState } from '../state/types.ts';

const MAX_COMPARE = 3;

export function ComparePage() {
  const { t } = useLang();
  const { state, update } = useApp();
  const cmp = state.compare;
  const [detailId, setDetailId] = useState<string | null>(null);
  const [tableOpen, setTableOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [limitMsg, setLimitMsg] = useState(false);

  const setCmp = (fn: (c: CompareState) => CompareState) => update((s) => ({ ...s, compare: fn(s.compare) }));
  const setFilters = (p: Partial<Filters>) => setCmp((c) => ({ ...c, filters: { ...c.filters, ...p } }));
  const active = activeFilterCount(cmp.filters, cmp.query);

  const counts = tierCounts(CARDS, cmp.query, cmp.filters);
  const totalInTiers = TIER_ORDER.reduce((a, k) => a + counts[k], 0);
  const results = sortCards(filterCards(CARDS, cmp.query, cmp.filters), cmp.sort);

  function clearFilters() {
    setCmp((c) => ({ ...c, query: '', filters: { ...DEFAULT_FILTERS } }));
    setAnnounce(t(bi('Filters cleared. Showing all cards.', 'Penapis dikosongkan. Menunjukkan semua kad.')));
  }

  function toggle(id: string) {
    const card = CARDS.find((c) => c.id === id);
    const name = card ? `${card.bank} ${card.name}` : id;
    if (cmp.selected.includes(id)) {
      setCmp((c) => ({ ...c, selected: c.selected.filter((x) => x !== id) }));
      if (cmp.selected.length - 1 < 2) setTableOpen(false);
      setLimitMsg(false);
      setAnnounce(t(bi(`${name} removed from compare.`, `${name} dibuang daripada banding.`)));
      return;
    }
    if (cmp.selected.length >= MAX_COMPARE) {
      setLimitMsg(true);
      setAnnounce(t(bi('You can compare up to 3 cards. Remove one first.', 'Anda boleh membanding sehingga 3 kad. Buang satu dahulu.')));
      return;
    }
    setLimitMsg(false);
    setCmp((c) => ({ ...c, selected: [...c.selected, id] }));
    setAnnounce(t(bi(`${name} added to compare.`, `${name} ditambah untuk banding.`)));
  }

  function openDetails(id: string) {
    setDetailId(id);
    setCmp((c) => (c.log.viewed.includes(id) ? c : { ...c, log: { ...c.log, viewed: [...c.log.viewed, id] } }));
  }

  function openTable() {
    setTableOpen(true);
    setCmp((c) => ({ ...c, log: { ...c.log, compared: [...new Set([...c.log.compared, ...c.selected])] } }));
  }

  const sorts: { id: SortKey; label: ReturnType<typeof bi> }[] = [
    { id: 'best', label: bi('Best for first-time users', 'Terbaik untuk pengguna kali pertama') },
    { id: 'fee', label: bi('Lowest annual fee', 'Yuran tahunan terendah') },
    { id: 'rate', label: bi('Lowest interest rate', 'Kadar faedah terendah') },
    { id: 'income', label: bi('Lowest minimum income', 'Pendapatan minimum terendah') },
    { id: 'rewards', label: bi('Best rewards', 'Ganjaran terbaik') },
  ];

  const manyTip = cmp.selected.length >= MAX_COMPARE || cmp.log.viewed.length > 3;

  return (
    <div className={cmp.selected.length > 0 ? 'pb-28' : ''}>
      <PageTitle
        title={t(bi('Compare credit cards', 'Banding kad kredit'))}
        intro={t(bi('See cards from Malaysian banks side by side, before you apply. Find one that suits a beginner.', 'Lihat kad daripada bank di Malaysia secara bersebelahan, sebelum anda memohon. Cari yang sesuai untuk pemula.'))}
      />
      <div className="mb-6 space-y-3">
        <Disclaimer />
        <SampleNote />
      </div>

      <div className="mb-6">
        <BestMatchPanel onDetails={(id) => openDetails(id)} onCompare={toggle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside aria-label={t(bi('Filters', 'Penapis'))}>
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="filter-body"
            onClick={() => setFiltersOpen((o) => !o)}
            className="mb-3 flex min-h-12 w-full items-center justify-between rounded-xl border-2 border-cyan-700 bg-white px-4 font-bold text-cyan-900 lg:hidden"
          >
            <span>{t(bi('Filters', 'Penapis'))}{active > 0 ? ` (${active})` : ''}</span>
            <span aria-hidden="true">{filtersOpen ? '▲' : '▼'}</span>
          </button>
          <div id="filter-body" className={`${filtersOpen ? 'block' : 'hidden'} rounded-3xl border border-slate-200 bg-white p-4 lg:block`}>
            <FilterPanel filters={cmp.filters} onChange={setFilters} onClear={clearFilters} activeCount={active} />
          </div>
        </aside>

        <section aria-labelledby="results-h">
          <h2 id="results-h" className="sr-only">{t(bi('Cards', 'Kad'))}</h2>
          <div className="mb-4">
            <p id="tier-h" className="mb-1 font-semibold">{t(bi('Card tier', 'Tahap kad'))}</p>
            <div role="group" aria-labelledby="tier-h" className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={cmp.filters.tier === ''} onClick={() => setFilters({ tier: '' })} className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${cmp.filters.tier === '' ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
                {t(bi('All tiers', 'Semua tahap'))} ({totalInTiers})
              </button>
              {TIER_ORDER.map((k) => {
                const on = cmp.filters.tier === k;
                return (
                  <button key={k} type="button" aria-pressed={on} onClick={() => setFilters({ tier: on ? '' : k })} className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${on ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
                    <span aria-hidden="true">{TIER_INFO[k].icon} </span>{t(TIER_INFO[k].label)} ({counts[k]})
                  </button>
                );
              })}
            </div>
            {cmp.filters.tier && <p className="mt-2 text-base text-slate-700">{t(TIER_INFO[cmp.filters.tier].blurb)}</p>}
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="search" className="mb-1 block font-semibold">{t(bi('Search by bank or card name', 'Cari ikut nama bank atau kad'))}</label>
              <input
                id="search"
                type="search"
                value={cmp.query}
                onChange={(e) => setCmp((c) => ({ ...c, query: e.target.value }))}
                placeholder={t(bi('e.g. Maybank or Secured', 'cth. Maybank atau Bercagar'))}
                className="min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-4 text-base"
              />
            </div>
            <div>
              <label htmlFor="sort" className="mb-1 block font-semibold">{t(bi('Sort by', 'Susun ikut'))}</label>
              <select
                id="sort"
                value={cmp.sort}
                onChange={(e) => {
                  const v = e.target.value as SortKey;
                  setCmp((c) => ({ ...c, sort: v }));
                  setAnnounce(t(bi('Sorted by: ', 'Disusun ikut: ')) + t(sorts.find((s) => s.id === v)!.label));
                }}
                className="min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-3 text-base sm:w-72"
              >
                {sorts.map((s) => <option key={s.id} value={s.id}>{t(s.label)}</option>)}
              </select>
            </div>
          </div>
          <p className="mb-3 text-sm text-slate-700">
            ℹ️ {t(bi('Ranking is based on suitability for first-time users, not sponsorship.', 'Kedudukan berdasarkan kesesuaian untuk pengguna kali pertama, bukan penajaan.'))}
          </p>

          <p className="mb-3 font-semibold" aria-live="polite">
            {t(bi(`Showing ${results.length} of ${CARDS.length} cards`, `Menunjukkan ${results.length} daripada ${CARDS.length} kad`))}
          </p>

          {limitMsg && (
            <div className="mb-3">
              <Callout tone="warn" title={t(bi('You can compare up to 3 cards', 'Anda boleh membanding sehingga 3 kad'))}>
                {t(bi('Remove one of your selected cards first, then add the new one.', 'Buang satu kad pilihan anda dahulu, kemudian tambah yang baharu.'))}
              </Callout>
            </div>
          )}

          {results.length === 0 ? (
            <div role="status" className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-4xl" aria-hidden="true">🔍</p>
              <h3 className="mt-2 text-xl font-extrabold">{t(bi('No cards match yet', 'Belum ada kad yang sepadan'))}</h3>
              <p className="mx-auto mt-1 max-w-md text-lg text-slate-700">{t(bi('Try fewer filters or a different search. Nothing is wrong. We just have a small sample list.', 'Cuba kurangkan penapis atau carian lain. Tiada yang salah. Kami cuma ada senarai contoh yang kecil.'))}</p>
              <Button className="mt-4" onClick={clearFilters}>{t(bi('Clear filters', 'Kosongkan penapis'))}</Button>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {results.map((c) => (
                <CardTile key={c.id} card={c} selected={cmp.selected.includes(c.id)} onToggle={toggle} onDetails={(id) => openDetails(id)} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10">
        <TipsStrip highlightMany={manyTip} />
      </div>

      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
      <p className="mt-6 text-sm text-slate-600">{t(CARDS_META.note)}</p>

      <CompareBar
        onOpen={openTable}
        onRemove={toggle}
        onClear={() => { setCmp((c) => ({ ...c, selected: [] })); setLimitMsg(false); setAnnounce(t(bi('Compare list cleared.', 'Senarai banding dikosongkan.'))); }}
      />

      {tableOpen && !detailId && cmp.selected.length >= 2 && (
        <CompareTable ids={cmp.selected} onClose={() => setTableOpen(false)} onRemove={toggle} onDetails={(id) => openDetails(id)} />
      )}
      {detailId && <CardDetail cardId={detailId} onClose={() => setDetailId(null)} onToggleCompare={toggle} />}
    </div>
  );
}
