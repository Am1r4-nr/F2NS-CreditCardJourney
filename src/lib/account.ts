import type { Bi } from './eligibility.ts';

/**
 * Prototype accounts. There is no server: accounts and saved applications live in this browser's
 * localStorage. The password is salted and hashed, never stored as typed. A real service would
 * do this on a server with a slow password hash, a session cookie and email verification.
 */
export interface Account {
  name: string;
  email: string;
}

interface Stored extends Account {
  salt: string;
  hash: string;
}

const ACCOUNTS_KEY = 'kaf-accounts-v1';
const DATA_PREFIX = 'kaf-user-data-v1:';
export const MIN_PASSWORD = 8;

const normEmail = (e: string) => e.trim().toLowerCase();

function readAll(): Stored[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? (list as Stored[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Stored[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Only reached on a page that is not a secure context. Weak, but this is a prototype.
  let h = 5381;
  for (const b of data) h = ((h << 5) + h + b) | 0;
  return `weak-${h}`;
}

function newSalt(): string {
  const a = new Uint8Array(16);
  globalThis.crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  agree: boolean;
}

export type SignUpErrors = Partial<Record<keyof SignUpInput, Bi>>;

export function validateSignUp(i: SignUpInput): SignUpErrors {
  const e: SignUpErrors = {};
  if (i.name.trim().length < 2) e.name = { en: 'Please type your name.', ms: 'Sila taip nama anda.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email.trim())) e.email = { en: 'Please type a valid email address, like name@example.com.', ms: 'Sila taip alamat e-mel yang sah, seperti nama@contoh.com.' };
  if (i.password.length < MIN_PASSWORD) e.password = { en: `Use at least ${MIN_PASSWORD} characters.`, ms: `Guna sekurang-kurangnya ${MIN_PASSWORD} aksara.` };
  if (!i.agree) e.agree = { en: 'Please tick the box to continue.', ms: 'Sila tandakan kotak untuk teruskan.' };
  return e;
}

export async function signUp(i: SignUpInput): Promise<{ ok: true; account: Account } | { ok: false; error: Bi }> {
  const email = normEmail(i.email);
  const list = readAll();
  if (list.some((a) => a.email === email)) {
    return { ok: false, error: { en: 'There is already an account with this email. Please log in instead.', ms: 'Sudah ada akaun dengan e-mel ini. Sila log masuk.' } };
  }
  const salt = newSalt();
  const rec: Stored = { name: i.name.trim(), email, salt, hash: await hashPassword(i.password, salt) };
  try {
    writeAll([...list, rec]);
  } catch {
    return { ok: false, error: { en: 'We could not save your account on this device. Check that the browser allows storage.', ms: 'Kami tidak dapat menyimpan akaun anda pada peranti ini. Semak bahawa pelayar membenarkan storan.' } };
  }
  return { ok: true, account: { name: rec.name, email } };
}

export async function logIn(emailIn: string, password: string): Promise<{ ok: true; account: Account } | { ok: false; error: Bi }> {
  const email = normEmail(emailIn);
  const rec = readAll().find((a) => a.email === email);
  const wrong: Bi = { en: 'The email or password is not right. Please try again.', ms: 'E-mel atau kata laluan tidak betul. Sila cuba lagi.' };
  if (!rec) return { ok: false, error: wrong };
  if (!rec.hash) return { ok: false, error: { en: 'This account uses Google. Please choose Continue with Google.', ms: 'Akaun ini menggunakan Google. Sila pilih Teruskan dengan Google.' } };
  const h = await hashPassword(password, rec.salt);
  if (h !== rec.hash) return { ok: false, error: wrong };
  return { ok: true, account: { name: rec.name, email: rec.email } };
}

/**
 * Signs in with a Google profile, creating the account the first time. Google accounts have no
 * password here (empty hash), so the password form can never log into them.
 * NOTE: the profile comes from the browser. A real service must verify Google's ID token on a server.
 */
export function signInWithGoogle(profile: { name: string; email: string }): { ok: true; account: Account } | { ok: false; error: Bi } {
  const email = normEmail(profile.email);
  const list = readAll();
  const found = list.find((a) => a.email === email);
  if (found) return { ok: true, account: { name: found.name, email: found.email } };
  const rec: Stored = { name: profile.name.trim() || email.split('@')[0], email, salt: '', hash: '' };
  try {
    writeAll([...list, rec]);
  } catch {
    return { ok: false, error: { en: 'We could not save your account on this device. Check that the browser allows storage.', ms: 'Kami tidak dapat menyimpan akaun anda pada peranti ini. Semak bahawa pelayar membenarkan storan.' } };
  }
  return { ok: true, account: { name: rec.name, email } };
}

/** The saved journey for one account: the app state as a plain object, or null if nothing was saved yet. */
export function loadUserData(email: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + normEmail(email));
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function saveUserData(email: string, data: unknown) {
  try {
    localStorage.setItem(DATA_PREFIX + normEmail(email), JSON.stringify(data));
  } catch {
    /* storage full or blocked: the in-memory state still works */
  }
}

/** True when the account signs in with a password (Google accounts do not). */
export function hasPassword(email: string): boolean {
  return !!readAll().find((a) => a.email === normEmail(email))?.hash;
}

export function renameAccount(email: string, name: string): Account | null {
  const list = readAll();
  const rec = list.find((a) => a.email === normEmail(email));
  if (!rec || name.trim().length < 2) return null;
  rec.name = name.trim();
  try { writeAll(list); } catch { return null; }
  return { name: rec.name, email: rec.email };
}

export async function changePassword(email: string, current: string, next: string): Promise<{ ok: true } | { ok: false; error: Bi }> {
  if (next.length < MIN_PASSWORD) return { ok: false, error: { en: `Use at least ${MIN_PASSWORD} characters for the new password.`, ms: `Guna sekurang-kurangnya ${MIN_PASSWORD} aksara untuk kata laluan baharu.` } };
  const list = readAll();
  const rec = list.find((a) => a.email === normEmail(email));
  if (!rec || !rec.hash) return { ok: false, error: { en: 'This account has no password.', ms: 'Akaun ini tiada kata laluan.' } };
  if ((await hashPassword(current, rec.salt)) !== rec.hash) return { ok: false, error: { en: 'The current password is not right.', ms: 'Kata laluan semasa tidak betul.' } };
  rec.salt = newSalt();
  rec.hash = await hashPassword(next, rec.salt);
  try { writeAll(list); } catch { return { ok: false, error: { en: 'We could not save the new password.', ms: 'Kami tidak dapat menyimpan kata laluan baharu.' } }; }
  return { ok: true };
}

/** Removes the account and everything saved under it from this browser. */
export function deleteAccount(email: string) {
  const e = normEmail(email);
  try {
    writeAll(readAll().filter((a) => a.email !== e));
    localStorage.removeItem(DATA_PREFIX + e);
  } catch { /* nothing more to do */ }
}