import { useEffect, type ReactElement } from 'react';
import { useRoute, type Route } from './lib/router.ts';
import { Footer, HelpWidget, Header, JourneyNavProvider, PrototypeBanner, Stepper, STAGES } from './components/layout.tsx';
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
import { Walkthrough } from './components/demo.tsx';



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
};

export function App() {
  const route = useRoute();
  const { state } = useApp();
  const Page = PAGES[route] ?? HomePage;
  const showStepper = route === 'compare' || STAGES.some((s) => s.route === route);
  const lifted = state.demo || (route === 'compare' && state.compare.selected.length > 0);

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
      <PrototypeBanner />
      <Header route={route} />
      {showStepper && <Stepper route={route} />}
      <main id="main" className={`mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 py-6 ${state.demo ? 'pb-64' : ''}`}>
        <Page />
      </main>
      <Footer />
      {state.demo && <Walkthrough />}
      <HelpWidget lifted={lifted} demo={state.demo} />
    </div>
    </JourneyNavProvider>
  );
}
