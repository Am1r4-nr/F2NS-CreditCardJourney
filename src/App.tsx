import { useEffect, type ReactElement } from 'react';
import { useRoute, type Route } from './lib/router.ts';
import { Footer, HelpWidget, Header, PrototypeBanner, Stepper, STAGES } from './components/layout.tsx';
import { useApp } from './state/store.tsx';
import { bi } from './i18n/index.tsx';
import { HomePage } from './pages/Home.tsx';
import { ReadyPage } from './pages/Ready.tsx';
import { ComparePage } from './pages/Compare.tsx';
import { CostPage } from './pages/Cost.tsx';
import { ApplyPage } from './pages/Apply.tsx';
import { UsePage } from './pages/Use.tsx';
import { ComingSoonPage } from './pages/ComingSoon.tsx';

const SOON: Partial<Record<Route, ReturnType<typeof bi>>> = {
  track: bi('Track your application', 'Jejak permohonan anda'),
  learn: bi('Learn', 'Belajar'),
  pricing: bi('Pricing', 'Harga'),
  trust: bi('Trust and data', 'Kepercayaan dan data'),
  workshop: bi('Workshop feedback', 'Maklum balas bengkel'),
};

const PAGES: Partial<Record<Route, () => ReactElement>> = {
  home: HomePage,
  ready: ReadyPage,
  compare: ComparePage,
  cost: CostPage,
  apply: ApplyPage,
  use: UsePage,
};

export function App() {
  const route = useRoute();
  const { state } = useApp();
  const soon = SOON[route];
  const Page = PAGES[route] ?? HomePage;
  const showStepper = route === 'compare' || STAGES.some((s) => s.route === route);
  const lifted = state.demo || (route === 'compare' && state.compare.selected.length > 0);

  // Move focus to the new screen heading when the screen changes.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus();
  }, [route]);

  return (
    <div className="min-h-screen">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus(); }} className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">
        Skip to content
      </a>
      <PrototypeBanner />
      <Header route={route} />
      {showStepper && <Stepper route={route} />}
      <main id="main" className={`mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 py-6 ${state.demo ? 'pb-40' : ''}`}>
        {soon ? <ComingSoonPage name={soon} /> : <Page />}
      </main>
      <Footer />
      <HelpWidget lifted={lifted} />
    </div>
  );
}
