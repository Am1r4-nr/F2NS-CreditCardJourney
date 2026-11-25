import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RATES, SIM_LIMITS } from '../config/rates.ts';
import type { AppState, CompareState, Draft, Outcome } from './types.ts';
import { DEFAULT_FILTERS } from '../lib/cards.ts';
import { CARDS } from '../data/cards.ts';
import { HAFIZ_CONTACT, MOCK_IDENTITY, PERSONAS } from './personas.ts';

const KEY = 'kaf-first-card-v1';

function initialDraft(): Draft {
  return {
    q: 0,
    scanned: false,
    manualIdentity: false,
    identity: { name: '', ic: '', dob: '', address: '' },
    phone: '',
    email: '',
    employment: 'gig',
    income: '',
    commitments: '',
    proofMethod: 'bank',
    consent: false,
    proof: null,
    costRead: false,
    savedAt: null,
    started: false,
  };
}

function initialCompare(): CompareState {
  return { query: '', filters: { ...DEFAULT_FILTERS }, sort: 'best', selected: [], log: { compared: [], viewed: [] } };
}

export function initialState(): AppState {
  const stored = typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ms');
  return {
    lang: stored ? 'ms' : 'en',
    demo: false,
    walkStep: 0,
    walkStartedAt: null,
    ready: { age: '', incomeType: 'gig', income: '', commitments: '' },
    readyDone: false,
    sim: { spend: SIM_LIMITS.spendDefault, mode: 'minimum', fixed: SIM_LIMITS.fixedDefault },
    draft: initialDraft(),
    submission: null,
    track: { outcome: 'approved', stage: 0 },
    use: { limit: RATES.approvedDemoLimit, statementDay: 15, txns: [], payments: [], reminderOn: false, daysBefore: 3, quiz: [null, null, null, null, null] },
    entries: [],
    compare: initialCompare(),
    selectedCardId: null,
    done: { ready: false, cost: false, apply: false, track: false, use: false },
  };
}

function load(): AppState {
  const base = initialState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const known = new Set(CARDS.map((c) => c.id));
    const keep = (ids: unknown): string[] => (Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string' && known.has(x)) : []);
    // Filters saved by an older version of the page (they had a digital key) are dropped.
    const oldFilters = parsed.compare?.filters && 'digital' in (parsed.compare.filters as object);
    const compare = {
      ...base.compare,
      ...parsed.compare,
      filters: oldFilters ? base.compare.filters : { ...base.compare.filters, ...parsed.compare?.filters },
      selected: keep(parsed.compare?.selected).slice(0, 3),
      log: { compared: keep(parsed.compare?.log?.compared), viewed: keep(parsed.compare?.log?.viewed) },
    };
    return {
      ...base,
      ...parsed,
      draft: { ...base.draft, ...parsed.draft },
      use: { ...base.use, ...parsed.use },
      compare,
      selectedCardId: parsed.selectedCardId && known.has(parsed.selectedCardId) ? parsed.selectedCardId : null,
      done: { ...base.done, ...parsed.done },
    };
  } catch {
    return base;
  }
}

/** The state of a pre-filled Hafiz journey, used by Demo mode. */
export function hafizDemoState(prev: AppState): AppState {
  const hafiz = PERSONAS[0];
  return {
    ...prev,
    demo: true,
    walkStep: 0,
    walkStartedAt: Date.now(),
    ready: hafiz.ready,
    readyDone: false,
    sim: { spend: 500, mode: 'minimum', fixed: 100 },
    draft: {
      ...initialDraft(),
      scanned: true,
      identity: MOCK_IDENTITY,
      phone: HAFIZ_CONTACT.phone,
      email: HAFIZ_CONTACT.email,
      employment: 'gig',
      income: hafiz.ready.income,
      commitments: hafiz.ready.commitments,
      proofMethod: 'bank',
      started: false,
    },
    submission: null,
    track: { outcome: 'approved', stage: 0 },
    use: { ...initialState().use },
    done: { ready: false, cost: false, apply: false, track: false, use: false },
  };
}

interface Ctx {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  patch: (p: Partial<AppState>) => void;
  patchDraft: (p: Partial<Draft>) => void;
  setOutcome: (o: Outcome) => void;
  resetAll: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage may be full or blocked: the prototype still works in memory */
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.lang === 'ms' ? 'ms' : 'en';
  }, [state.lang]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);
  const patch = useCallback((p: Partial<AppState>) => setState((s) => ({ ...s, ...p })), []);
  const patchDraft = useCallback((p: Partial<Draft>) => setState((s) => ({ ...s, draft: { ...s.draft, ...p } })), []);
  const setOutcome = useCallback((outcome: Outcome) => setState((s) => ({ ...s, track: { ...s.track, outcome } })), []);
  const resetAll = useCallback(() => {
    setState((s) => ({ ...initialState(), lang: s.lang, entries: s.entries }));
  }, []);

  const value = useMemo(() => ({ state, update, patch, patchDraft, setOutcome, resetAll }), [state, update, patch, patchDraft, setOutcome, resetAll]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
}
