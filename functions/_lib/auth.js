// 관리자 인증 — PBKDF2 비밀번호, D1 세션, 로그인 잠금

const COOKIE = 'pb_admin';
const SESSION_MS = 12 * 3600 * 1000;      // 로그인 유지 12시간
const MAX_FAIL = 5;                        // 이 횟수만큼 틀리면
const LOCK_MS = 15 * 60 * 1000;            // 15분 잠근다
const ITER = 100000;                       // Workers 의 PBKDF2 상한

const enc = new TextEncoder();

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(t + '='.repeat((4 - t.length % 4) % 4)), (c) => c.charCodeAt(0));
};

async function derive(password, salt, iter, hash, bytes) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash }, key, bytes * 8));
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// 저장 형식 : pbkdf2$반복수$salt(b64)$hash(b64)
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const out = await derive(password, salt, ITER, 'SHA-256', 32);
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(out)}`;
}

// 기존 계정의 해시 알고리즘이 기록에 남아 있지 않아 SHA-256 → 512 → 1 순으로 맞춰 본다.
export async function verifyPassword(password, stored) {
  const [kind, iterS, saltS, hashS] = String(stored || '').split('$');
  if (kind !== 'pbkdf2' || !iterS || !saltS || !hashS) return false;
  const iter = parseInt(iterS, 10), salt = unb64(saltS), want = unb64(hashS);
  for (const h of ['SHA-256', 'SHA-512', 'SHA-1']) {
    try {
      if (same(await derive(password, salt, iter, h, want.length), want)) return true;
    } catch (e) { /* 반복수가 상한을 넘는 등 — 다음 알고리즘으로 */ }
  }
  return false;
}

export function constEq(a, b) {
  return same(enc.encode(String(a)), enc.encode(String(b)));
}

function cookieOf(request) {
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? m[1] : null;
}

// 로그인한 관리자 아이디, 아니면 null
export async function currentAdmin(env, request) {
  const token = cookieOf(request);
  if (!token) return null;
  const row = await env.DB.prepare('SELECT username FROM sessions WHERE token = ? AND expires_at > ?')
    .bind(token, Date.now()).first();
  return row ? row.username : null;
}

export async function startSession(env, username) {
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (token, username, expires_at, created_at) VALUES (?, ?, ?, ?)')
      .bind(token, username, now + SESSION_MS, new Date(now).toISOString()),
    env.DB.prepare('UPDATE admins SET last_login = ? WHERE username = ?').bind(new Date(now).toISOString(), username),
  ]);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MS / 1000}`;
}

export async function endSession(env, request) {
  const token = cookieOf(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export const clientIp = (request) => request.headers.get('cf-connecting-ip') || 'local';

// 남은 잠금 시간(ms). 0 이면 시도 가능
export async function lockRemaining(env, ip) {
  const row = await env.DB.prepare('SELECT locked_until FROM login_attempts WHERE ip = ?').bind(ip).first();
  return row ? Math.max(0, row.locked_until - Date.now()) : 0;
}

export async function recordFail(env, ip) {
  const now = Date.now();
  const row = await env.DB.prepare('SELECT fail_count FROM login_attempts WHERE ip = ?').bind(ip).first();
  const n = (row ? row.fail_count : 0) + 1;
  const lock = n >= MAX_FAIL ? now + LOCK_MS : 0;
  await env.DB.prepare(
    `INSERT INTO login_attempts (ip, fail_count, locked_until, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(ip) DO UPDATE SET fail_count = excluded.fail_count, locked_until = excluded.locked_until, updated_at = excluded.updated_at`
  ).bind(ip, lock ? 0 : n, lock, new Date(now).toISOString()).run();
  return lock ? LOCK_MS : 0;
}

export async function clearFails(env, ip) {
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
}

// 다른 사이트에서 날아온 POST 를 막는다 (SameSite 쿠키와 이중으로)
export function sameOrigin(request) {
  const origin = new URL(request.url).origin;
  const o = request.headers.get('origin');
  if (o) return o === origin;
  const r = request.headers.get('referer');
  return !!r && r.startsWith(origin + '/');
}
