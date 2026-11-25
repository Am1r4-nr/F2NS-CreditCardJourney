import { useEffect, useState } from 'react';

export type Route = 'home' | 'ready' | 'compare' | 'cost' | 'apply' | 'track' | 'use' | 'learn' | 'pricing' | 'trust' | 'workshop';

export const ROUTES: Route[] = ['home', 'ready', 'compare', 'cost', 'apply', 'track', 'use', 'learn', 'pricing', 'trust', 'workshop'];

function segments(): string[] {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

function parse(): Route {
  const h = segments()[0] ?? '';
  return (ROUTES as string[]).includes(h) ? (h as Route) : 'home';
}

/** The part after the route, for example "myths" in #/learn/myths. */
function parseArg(): string {
  return segments()[1] ?? '';
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

export function useRouteArg(): string {
  const [arg, setArg] = useState<string>(parseArg);
  useEffect(() => {
    const on = () => setArg(parseArg());
    on();
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return arg;
}

export function navigate(r: Route): void {
  window.location.hash = r === 'home' ? '#/' : `#/${r}`;
}

export function href(r: Route): string {
  return r === 'home' ? '#/' : `#/${r}`;
}

/** A link to one learning card, for example #/learn/myths. */
export function learnHref(cardId: string): string {
  return `#/learn/${cardId}`;
}
