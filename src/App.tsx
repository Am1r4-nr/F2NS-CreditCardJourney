import { useEffect, type ReactElement } from 'react';
import { useRoute, type Route } from './lib/router.ts';
import { Footer, HelpWidget, Header, JourneyNavProvider, Stepper, TIMELINE_STAGES } from './components/layout.tsx';
import { useApp } from './state/store.tsx';
import { HomePage } from './pages/Home.tsx';
import { ReadyPage } from './pages/Ready.tsx';
import { ComparePage } from './pages/Compare.tsx';
import { CostPage } from './pages/Cost.tsx';
import { ApplyPage } from './pages/Apply.tsx';
import { UsePage } from './pages/Use.tsx';
import { TrackPage } from './pages/Track.tsx';
import { LearnPage } from './pages/Learn.tsx';
import { PricingPage } from './pages/Pricing.tsx';
import { TrustPage } from './pages/Trust.tsx';
import { WorkshopPage } from './pages/Workshop.tsx';
import { AccountPage } from './pages/Account.tsx';
import { Walkthrough } from './components/demo.tsx';
import { Sheet } from './components/ui.tsx';



const PAGES: Partial<Record<Route, () => ReactElement>> = {
  home: HomePage,
  ready: ReadyPage,
  compare: ComparePage,
  cost: CostPage,
  apply: ApplyPage,
  use: UsePage,
  track: TrackPage,
  learn: LearnPage,
  pricing: PricingPage,
  trust: TrustPage,
  workshop: WorkshopPage,
  account: AccountPage,
};

export function App() {
  const route = useRoute();
  const { state, patch, update } = useApp();
  const Page = PAGES[route] ?? HomePage;
  const showStepper = route === 'compare' || TIMELINE_STAGES.some((s) => s.route === route);
  const lifted = state.demo || (route === 'compare' && state.compare.selected.length > 0);

  // Remember the last timeline step, so "Start applying" can return to it.
  useEffect(() => {
    if (route === 'ready' || route === 'cost' || route === 'apply') patch({ lastStage: route });
  }, [route, patch]);

  // Going back to an earlier step clears the "skipped" mark on every step ahead of it.
  useEffect(() => {
    const at = TIMELINE_STAGES.findIndex((s) => s.route === route);
    if (at === -1) return;
    update((s) => {
      const ahead = TIMELINE_STAGES.slice(at + 1).filter((st) => s.skipped[st.key]);
      if (ahead.length === 0) return s;
      return { ...s, skipped: { ...s.skipped, ...Object.fromEntries(ahead.map((st) => [st.key, false])) } };
    });
  }, [route, update]);

  // Move focus to the new screen heading when the screen changes.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus();
  }, [route]);

  return (
    <JourneyNavProvider>
    <div className="min-h-screen">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus(); }} className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">
        Skip to content
      </a>
      <Header route={route} />
      {showStepper && <Stepper route={route} />}
      <main id="main" className={`mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 py-6 ${state.demo ? 'pb-64' : ''}`}>
        {route === 'home' ? <Page /> : <Sheet><Page /></Sheet>}
      </main>
      <Footer />
      {state.demo && <Walkthrough />}
      <HelpWidget lifted={lifted} demo={state.demo} />
    </div>
    </JourneyNavProvider>
  );
}
