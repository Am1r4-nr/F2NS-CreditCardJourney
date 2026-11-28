import { useEffect, useRef, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { signInWithGoogle } from '../lib/account.ts';
import { Callout } from './ui.tsx';

/**
 * "Continue with Google".
 * - With VITE_GOOGLE_CLIENT_ID set (in a .env file), this shows Google's real sign-in button and reads
 *   the name and email from the ID token it returns.
 * - Without it, the button runs a clearly labelled simulation with a sample profile, so the flow can
 *   be tried without a Google project.
 * Either way the account is stored in this browser only. A real service must verify the token on a server.
 */
const CLIENT_ID = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_GOOGLE_CLIENT_ID;
const SAMPLE = { name: 'Sample Google User', email: 'sample.user@gmail.example' };

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
}
declare global {
  interface Window { google?: { accounts: { id: GoogleId } } }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('load'));
    document.head.appendChild(s);
  });
}

function decodeToken(token: string): { name?: string; email?: string; email_verified?: boolean } | null {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(part).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function GoogleButton({ onDone }: { onDone?: () => void }) {
  const { t } = useLang();
  const { signInAs } = useApp();
  const [error, setError] = useState<ReturnType<typeof bi> | null>(null);
  const holder = useRef<HTMLDivElement>(null);

  const finish = (profile: { name: string; email: string }) => {
    const res = signInWithGoogle(profile);
    if (!res.ok) { setError(res.error); return; }
    signInAs(res.account);
    onDone?.();
  };

  useEffect(() => {
    if (!CLIENT_ID || !holder.current) return;
    let alive = true;
    loadScript()
      .then(() => {
        if (!alive || !holder.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (r) => {
            const p = decodeToken(r.credential);
            if (!p?.email || p.email_verified === false) { setError(bi('Google did not return a verified email. Please try again.', 'Google tidak memulangkan e-mel yang disahkan. Sila cuba lagi.')); return; }
            finish({ name: p.name ?? '', email: p.email });
          },
        });
        window.google.accounts.id.renderButton(holder.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 320 });
      })
      .catch(() => setError(bi('Google sign-in could not load. Check your connection, or use email.', 'Log masuk Google tidak dapat dimuatkan. Semak sambungan anda, atau guna e-mel.')));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {CLIENT_ID ? (
        <div ref={holder} className="flex min-h-11 justify-center" />
      ) : (
        <>
          <button
            type="button"
            onClick={() => finish(SAMPLE)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-[#1c1412] hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" />
              <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0012 24z" />
              <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 010-4.6v-3H1.8a12 12 0 000 10.6z" />
              <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A12 12 0 001.8 7.1l3.8 3C6.5 6.8 9 4.8 12 4.8z" />
            </svg>
            {t(bi('Continue with Google', 'Teruskan dengan Google'))}
          </button>
          <p className="text-center text-sm text-slate-700">{t(bi('Simulated in this prototype. It uses a sample Google profile, not your real account.', 'Disimulasi dalam prototaip ini. Ia menggunakan profil Google contoh, bukan akaun sebenar anda.'))}</p>
        </>
      )}
      {error && <Callout tone="bad">{t(error)}</Callout>}
    </div>
  );
}