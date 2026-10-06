// /admin/* — 관리자 화면
//   /admin/login · /admin/logout · /admin/setup      로그인 없이 접근
//   /admin/applications(.csv)                        대출신청 목록 · 상태 변경 · 엑셀
//   /admin/posts/new · /admin/posts/:id/edit         게시글 쓰기 · 수정 · 삭제
//   /admin/password                                  비밀번호 변경
// 게시글 목록은 따로 두지 않는다. 로그인한 채로 공개 게시판을 열면 관리 버튼이 붙는다.
import { BOARDS, SITE, esc, fmtDateTime, html, redirect, readForm, nowIso } from '../_lib/util.js';
import {
  currentAdmin, startSession, endSession, verifyPassword, hashPassword, constEq,
  clientIp, lockRemaining, recordFail, clearFails, sameOrigin,
} from '../_lib/auth.js';

const STATUS = { new: '신규', contacted: '연락함', done: '완료', drop: '제외' };
const APP_PER_PAGE = 30;

export async function onRequest(ctx) {
  const { request, env, params } = ctx;
  const segs = params.path || [];
  const path = '/' + segs.join('/');
  const method = request.method;

  if (method === 'POST' && !sameOrigin(request)) return html('잘못된 요청입니다.', 403);

  // ── 로그인 없이 접근하는 화면 ──
  if (path === '/login') return method === 'POST' ? loginPost(ctx) : loginForm();
  if (path === '/setup') return method === 'POST' ? setupPost(ctx) : setupForm(env);
  if (path === '/logout') {
    const cookie = await endSession(env, request);
    return redirect('/', { 'set-cookie': cookie });
  }

  const user = await currentAdmin(env, request);
  if (!user) return redirect('/admin/login');
  ctx.user = user;

  if (path === '/' ) return redirect('/admin/applications');
  if (path === '/applications' && method === 'GET') return applications(ctx);
  if (path === '/applications.csv' && method === 'GET') return applicationsCsv(ctx);
  if (path === '/password') return method === 'POST' ? passwordPost(ctx) : passwordForm(ctx);
  if (path === '/posts' && method === 'GET') return redirect('/board/notice');
  if (path === '/posts/new' && method === 'GET') return postForm(ctx, null);
  if (path === '/posts' && method === 'POST') return postSave(ctx, null);

  let m;
  if ((m = path.match(/^\/applications\/(\d+)\/(status|delete)$/)) && method === 'POST') return appUpdate(ctx, +m[1], m[2]);
  if ((m = path.match(/^\/posts\/(\d+)\/edit$/)) && method === 'GET') return postForm(ctx, +m[1]);
  if ((m = path.match(/^\/posts\/(\d+)$/)) && method === 'POST') return postSave(ctx, +m[1]);
  if ((m = path.match(/^\/posts\/(\d+)\/delete$/)) && method === 'POST') return postDelete(ctx, +m[1]);

  return shell('찾을 수 없음', `<div class="admin-card"><p>없는 화면입니다.</p></div>`, { user, status: 404 });
}

// ── 레이아웃 ─────────────────────────────────────────

function shell(title, body, { user, tab, status = 200, headers } = {}) {
  const tabs = user ? `
  <div class="admin-head">
    <h1>플랜비대부 사이트 관리</h1>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
      <span style="color:var(--muted);font-size:14px;margin-right:4px">${esc(user)}</span>
      <a class="mini" href="/" target="_blank" rel="noopener">사이트 보기</a>
      <a class="mini" href="/admin/password">비밀번호 변경</a>
      <a class="mini" href="/admin/logout">로그아웃</a>
    </div>
  </div>
  <div class="admin-tabs">
    <a href="/admin/applications"${tab === 'apps' ? ' class="on"' : ''}>대출신청</a>
    ${Object.entries(BOARDS).map(([k, v]) => `<a href="/board/${k}"${tab === k ? ' class="on"' : ''}>${v}</a>`).join('\n    ')}
  </div>` : '';

  return html(`<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} | ${SITE}</title>
<link rel="stylesheet" href="/assets/site.css">
</head><body class="bare">

<main>
<div class="admin-wrap">${tabs}
${body}
</div></main>
</body></html>`, status, headers);
}

const msgBox = (m, ok) => (m ? `<div class="msg ${ok ? 'msg-ok' : 'msg-err'}">${esc(m)}</div>` : '');

function back(request, fallback) {
  const r = request.headers.get('referer');
  const origin = new URL(request.url).origin;
  return r && r.startsWith(origin + '/') ? r : fallback;
}

// ── 로그인 ───────────────────────────────────────────

function loginForm(msg = '', ok = false, status = 200) {
  return shell('관리자 로그인', `<div class="login-box">
    <h1 style="font-size:22px;color:var(--navy);margin:0 0 6px">관리자 로그인</h1>
    <p style="color:var(--ink-2);font-size:14.5px;margin:0 0 22px">플랜비대부 사이트 관리</p>
    <form class="admin-card" method="post" action="/admin/login">
      ${msgBox(msg, ok)}
      <div class="form-row">
        <label class="lb" for="u">아이디</label>
        <input type="text" id="u" name="username" required autocomplete="username" autofocus>
      </div>
      <div class="form-row">
        <label class="lb" for="p">비밀번호</label>
        <input type="password" id="p" name="password" required autocomplete="current-password">
      </div>
      <button class="btn btn-blue" style="width:100%" type="submit">로그인</button>
    </form>
    <p style="text-align:center;margin-top:18px"><a href="/" style="color:var(--muted);font-size:14px">사이트로 돌아가기</a></p>
  </div>`, { status });
}

async function loginPost({ request, env }) {
  const ip = clientIp(request);
  const locked = await lockRemaining(env, ip);
  if (locked) return loginForm(`로그인 시도가 너무 많습니다. ${Math.ceil(locked / 60000)}분 뒤에 다시 시도해 주세요.`, false, 429);

  const f = await readForm(request);
  const row = await env.DB.prepare('SELECT username, password_hash FROM admins WHERE username = ?').bind(f.username || '').first();
  const ok = row && (await verifyPassword(f.password || '', row.password_hash));

  if (!ok) {
    const lock = await recordFail(env, ip);
    return loginForm(lock ? '로그인 시도가 너무 많아 15분 동안 잠갔습니다.' : '아이디 또는 비밀번호가 올바르지 않습니다.', false, 401);
  }
  await clearFails(env, ip);
  const cookie = await startSession(env, row.username);
  return redirect('/admin/applications', { 'set-cookie': cookie });
}

// ── 첫 관리자 계정 만들기 (SETUP_TOKEN 필요, 계정이 하나도 없을 때만) ──

async function adminCount(env) {
  return (await env.DB.prepare('SELECT count(*) AS n FROM admins').first()).n;
}

async function setupForm(env, msg = '', ok = false, status = 200) {
  if (!msg && (await adminCount(env)) > 0) msg = '이미 관리자 계정이 존재합니다. 추가 생성은 차단됩니다.';
  return shell('관리자 계정 생성', `<div class="login-box">
    <h1 style="font-size:21px;color:var(--navy);margin:0 0 20px">관리자 계정 생성</h1>
    <div class="admin-card">
      ${msgBox(msg, ok)}
      <form method="post" action="/admin/setup">
        <div class="form-row">
          <label class="lb" for="t">설치 토큰</label>
          <input type="password" id="t" name="token" required>
          <p class="form-note">환경변수 SETUP_TOKEN 에 설정한 값</p>
        </div>
        <div class="form-row">
          <label class="lb" for="u">아이디</label>
          <input type="text" id="u" name="username" required minlength="4" maxlength="30">
        </div>
        <div class="form-row">
          <label class="lb" for="p">비밀번호</label>
          <input type="password" id="p" name="password" required minlength="10">
          <p class="form-note">10자 이상. 영문·숫자·기호를 섞어 주세요.</p>
        </div>
        <button class="btn btn-blue" style="width:100%" type="submit">계정 만들기</button>
      </form>
    </div>
  </div>`, { status });
}

async function setupPost({ request, env }) {
  if ((await adminCount(env)) > 0) return setupForm(env, '', false, 403);
  const f = await readForm(request);
  if (!env.SETUP_TOKEN || !constEq(f.token || '', env.SETUP_TOKEN)) return setupForm(env, '설치 토큰이 올바르지 않습니다.', false, 403);
  if (!/^[A-Za-z0-9_.-]{4,30}$/.test(f.username || '')) return setupForm(env, '아이디는 영문·숫자 4~30자로 입력해 주세요.', false, 400);
  if ((f.password || '').length < 10) return setupForm(env, '비밀번호는 10자 이상이어야 합니다.', false, 400);

  await env.DB.prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)')
    .bind(f.username, await hashPassword(f.password), nowIso()).run();
  return loginForm('관리자 계정을 만들었습니다. 로그인해 주세요.', true);
}

// ── 비밀번호 변경 ────────────────────────────────────

function passwordForm({ user }, msg = '', ok = false, status = 200) {
  return shell('비밀번호 변경', `<div class="admin-card" style="max-width:460px">
    ${msgBox(msg, ok)}
    <form method="post" action="/admin/password">
      <div class="form-row"><label class="lb" for="c">현재 비밀번호</label>
        <input type="password" id="c" name="current" required autocomplete="current-password"></div>
      <div class="form-row"><label class="lb" for="n">새 비밀번호</label>
        <input type="password" id="n" name="next" required minlength="10" autocomplete="new-password">
        <p class="form-note">10자 이상. 영문·숫자·기호를 섞어 주세요.</p></div>
      <div class="form-row"><label class="lb" for="n2">새 비밀번호 확인</label>
        <input type="password" id="n2" name="next2" required minlength="10" autocomplete="new-password"></div>
      <button class="btn btn-blue" type="submit">변경하기</button>
    </form>
  </div>`, { user, status });
}

async function passwordPost(ctx) {
  const { request, env, user } = ctx;
  const f = await readForm(request);
  const row = await env.DB.prepare('SELECT password_hash FROM admins WHERE username = ?').bind(user).first();
  if (!row || !(await verifyPassword(f.current || '', row.password_hash))) return passwordForm(ctx, '현재 비밀번호가 올바르지 않습니다.', false, 400);
  if ((f.next || '').length < 10) return passwordForm(ctx, '새 비밀번호는 10자 이상이어야 합니다.', false, 400);
  if (f.next !== f.next2) return passwordForm(ctx, '새 비밀번호 확인이 일치하지 않습니다.', false, 400);
  await env.DB.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').bind(await hashPassword(f.next), user).run();
  return passwordForm(ctx, '비밀번호를 변경했습니다.', true);
}

// ── 대출신청 ─────────────────────────────────────────

function appFilter(url) {
  const status = STATUS[url.searchParams.get('status')] ? url.searchParams.get('status') : '';
  const q = (url.searchParams.get('q') || '').trim().slice(0, 30);
  let where = '1 = 1';
  const bind = [];
  if (status) { where += ' AND status = ?'; bind.push(status); }
  if (q) { where += ' AND (name LIKE ? OR phone LIKE ?)'; bind.push(`%${q}%`, `%${q}%`); }
  return { status, q, where, bind };
}

async function applications({ request, env, user }) {
  const url = new URL(request.url);
  const { status, q, where, bind } = appFilter(url);

  const counts = Object.fromEntries(
    (await env.DB.prepare('SELECT status, count(*) AS n FROM applications GROUP BY status').all()).results.map((r) => [r.status, r.n]));
  const all = Object.values(counts).reduce((a, b) => a + b, 0);

  const total = (await env.DB.prepare(`SELECT count(*) AS n FROM applications WHERE ${where}`).bind(...bind).first()).n;
  const pages = Math.max(1, Math.ceil(total / APP_PER_PAGE));
  const cur = Math.min(pages, Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1));
  const { results } = await env.DB.prepare(`SELECT * FROM applications WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .bind(...bind, APP_PER_PAGE, (cur - 1) * APP_PER_PAGE).all();

  const qs = (o) => {
    const p = new URLSearchParams();
    const v = { status, q, ...o };
    for (const k of ['status', 'q', 'page']) if (v[k] && !(k === 'page' && v[k] === 1)) p.set(k, v[k]);
    const s = p.toString();
    return s ? '?' + s : '';
  };

  const filters = [['', `전체 ${all}`], ...Object.entries(STATUS).map(([k, v]) => [k, `${v} ${counts[k] || 0}`])]
    .map(([k, label]) => `<a class="mini" href="/admin/applications${qs({ status: k, page: 1 })}"${k === status ? ' style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${label}</a>`)
    .join(' ');

  const rows = results.length ? results.map((a) => {
    const src = [a.referrer, a.utm_term && `키워드:${a.utm_term}`, a.utm_campaign && `캠페인:${a.utm_campaign}`].filter(Boolean).join(' · ');
    const detail = [a.landing && `첫 페이지: ${a.landing}`, a.memo].filter(Boolean).join('\n');
    return `<tr>
      <td class="no">${a.id}</td>
      <td class="date" style="white-space:nowrap">${fmtDateTime(a.created_at)}</td>
      <td><b>${esc(a.name)}</b></td>
      <td style="white-space:nowrap"><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></td>
      <td style="white-space:nowrap">${esc(a.product || '')}</td>
      <td style="white-space:nowrap">${a.amount ? esc(a.amount) + '만원' : '-'}</td>
      <td>${esc(a.timing || '-')}</td>
      <td style="font-size:13px;color:var(--ink-2)" title="${esc(detail)}">${esc(src || '-')}</td>
      <td class="manage">
        <form method="post" action="/admin/applications/${a.id}/status" style="display:flex;gap:4px;justify-content:center">
          <select name="status" style="width:auto;padding:6px 8px;font-size:14px">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${a.status === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
          <button class="mini">저장</button>
        </form>
        <form method="post" action="/admin/applications/${a.id}/delete" style="margin-top:4px" onsubmit="return confirm('이 신청을 삭제할까요? 되돌릴 수 없습니다.')"><button class="mini del">삭제</button></form>
      </td>
    </tr>`;
  }).join('') : `<tr><td class="empty" colspan="9">${q || status ? '조건에 맞는 신청이 없습니다.' : '접수된 신청이 없습니다.'}</td></tr>`;

  let pager = '';
  if (pages > 1) {
    const start = Math.max(1, cur - 4), end = Math.min(pages, start + 9);
    for (let n = start; n <= end; n++) pager += n === cur ? `<span class="cur">${n}</span>` : `<a href="/admin/applications${qs({ page: n })}">${n}</a>`;
    pager = `<div class="pager">${pager}</div>`;
  }

  return shell('대출신청', `<div class="admin-card">
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:16px">
      <div style="display:flex;gap:6px;flex-wrap:wrap">${filters}</div>
      <div style="display:flex;gap:6px">
        <form method="get" style="display:flex;gap:6px">
          ${status ? `<input type="hidden" name="status" value="${status}">` : ''}
          <input type="text" name="q" value="${esc(q)}" placeholder="이름 · 연락처" style="width:150px;padding:7px 10px;font-size:14px">
          <button class="mini">검색</button>
        </form>
        <a class="mini" href="/admin/applications.csv${qs({ page: 1 })}">엑셀 받기</a>
      </div>
    </div>
    <div style="overflow-x:auto">
    <table class="board" style="min-width:860px">
      <thead><tr>
        <th class="no">번호</th><th class="date">접수일시</th><th>성명</th><th>연락처</th><th>상품</th><th>금액</th><th>시기</th><th>유입</th><th class="manage">상태</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>
    ${pager}
    <p class="form-note">개인정보 보유기간은 수집일로부터 1년입니다. 기간이 지난 신청은 삭제해 주세요.</p>
  </div>`, { user, tab: 'apps' });
}

async function applicationsCsv({ request, env }) {
  const { status, where, bind } = appFilter(new URL(request.url));
  const { results } = await env.DB.prepare(`SELECT * FROM applications WHERE ${where} ORDER BY id DESC`).bind(...bind).all();
  const cols = [
    ['id', '번호'], ['created_at', '접수일시'], ['name', '성명'], ['phone', '연락처'], ['product', '상품'],
    ['amount', '요청금액(만원)'], ['timing', '자금필요시기'], ['status', '상태'], ['referrer', '유입경로'],
    ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'],
    ['utm_term', '키워드'], ['landing', '첫 페이지'], ['memo', '메모'],
  ];
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = "'" + s;          // 엑셀 수식 주입 방지
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.map((c) => c[1]).join(',')];
  for (const a of results) {
    lines.push(cols.map(([k]) => cell(k === 'created_at' ? fmtDateTime(a[k]) : k === 'status' ? STATUS[a[k]] || a[k] : a[k])).join(','));
  }
  const day = fmtDateTime(nowIso()).slice(0, 10);
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="applications-${status || 'all'}-${day}.csv"`,
      'cache-control': 'no-store',
    },
  });
}

async function appUpdate({ request, env }, id, action) {
  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM applications WHERE id = ?').bind(id).run();
  } else {
    const f = await readForm(request);
    if (STATUS[f.status]) await env.DB.prepare('UPDATE applications SET status = ? WHERE id = ?').bind(f.status, id).run();
  }
  return redirect(back(request, '/admin/applications'));
}

// ── 게시글 ───────────────────────────────────────────

async function postForm({ request, env, user }, id, msg = '', draft = null) {
  let p = draft;
  if (!p && id) {
    p = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    if (!p) return shell('찾을 수 없음', '<div class="admin-card"><p>없는 글입니다.</p></div>', { user, status: 404 });
  }
  if (!p) {
    const b = new URL(request.url).searchParams.get('board');
    p = { board: BOARDS[b] ? b : 'notice', title: '', body: '', pinned: 0 };
  }
  const title = id ? '글 수정' : '글쓰기';
  return shell(title, `<div class="admin-card">
    <h2 style="font-size:19px;margin:0 0 18px;color:var(--navy)">${title}</h2>
    ${msgBox(msg)}
    <form method="post" action="/admin/posts${id ? '/' + id : ''}">
      <div class="form-row"><label class="lb" for="b">게시판</label>
        <select id="b" name="board" style="max-width:260px">${Object.entries(BOARDS).map(([k, v]) => `<option value="${k}"${p.board === k ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
      <div class="form-row"><label class="lb" for="t">제목 <span class="req">*</span></label>
        <input type="text" id="t" name="title" required maxlength="200" value="${esc(p.title)}"></div>
      <div class="form-row"><label class="lb" for="c">내용 <span class="req">*</span></label>
        <textarea id="c" name="body" required style="min-height:320px">${esc(p.body)}</textarea>
        <p class="form-note">입력한 줄바꿈이 그대로 보입니다. HTML 태그는 글자 그대로 표시됩니다.</p></div>
      <div class="check-row" style="margin-bottom:24px">
        <input type="checkbox" id="pin" name="pinned" value="1"${p.pinned ? ' checked' : ''}>
        <label for="pin" style="margin:0">목록 맨 위에 고정</label></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-blue" type="submit">저장</button>
        <a class="btn" style="border-color:var(--line);color:var(--ink-2)" href="${id ? `/board/${p.board}/${id}` : `/board/${p.board}`}">취소</a>
      </div>
    </form>
  </div>`, { user, tab: p.board });
}

async function postSave(ctx, id) {
  const { request, env } = ctx;
  const f = await readForm(request);
  const d = {
    board: BOARDS[f.board] ? f.board : '',
    title: (f.title || '').slice(0, 200),
    body: (f.body || '').replace(/\r\n/g, '\n'),
    pinned: f.pinned === '1' ? 1 : 0,
  };
  if (!d.board || !d.title || !d.body) return postForm(ctx, id, '게시판 · 제목 · 내용을 모두 입력해 주세요.', d);

  if (id) {
    const r = await env.DB.prepare('UPDATE posts SET board = ?, title = ?, body = ?, pinned = ?, updated_at = ? WHERE id = ?')
      .bind(d.board, d.title, d.body, d.pinned, nowIso(), id).run();
    if (!r.meta.changes) return postForm(ctx, id);
  } else {
    const r = await env.DB.prepare('INSERT INTO posts (board, title, body, pinned, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(d.board, d.title, d.body, d.pinned, nowIso()).run();
    id = r.meta.last_row_id;
  }
  return redirect(`/board/${d.board}/${id}`);
}

async function postDelete({ env }, id) {
  const p = await env.DB.prepare('SELECT board FROM posts WHERE id = ?').bind(id).first();
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  return redirect(`/board/${p ? p.board : 'notice'}`);
}
