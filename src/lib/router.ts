import { useEffect, useState } from 'react';

export type Route = 'home' | 'ready' | 'compare' | 'cost' | 'apply' | 'track' | 'use' | 'learn' | 'pricing' | 'trust' | 'workshop';

export const ROUTES: Route[] = ['home', 'ready', 'compare', 'cost', 'apply', 'track', 'use', 'learn', 'pricing', 'trust', 'workshop'];

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  return (ROUTES as string[]).includes(h) ? (h as Route) : 'home';
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function navigate(r: Route): void {
  window.location.hash = r === 'home' ? '#/' : `#/${r}`;
}

export function href(r: Route): string {
  return r === 'home' ? '#/' : `#/${r}`;
}
