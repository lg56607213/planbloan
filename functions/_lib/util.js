// 공통 도우미 — HTML 이스케이프, 날짜, 응답, 레이아웃 껍데기

export const BOARDS = {
  notice: '공지사항',
  rights: '소비자권리',
  faq: 'FAQ',
};

export const SITE = '플랜비대부주식회사';

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// DB 의 created_at 은 ISO(UTC) 이거나 'YYYY-MM-DD HH:MM:SS'(이미 한국시간) 일 수 있다.
// 어느 쪽이든 한국시간 기준으로 보여 준다.
function kstParts(s) {
  const str = String(s || '');
  if (/T/.test(str) || /Z$|[+-]\d\d:?\d\d$/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d)) {
      const k = new Date(d.getTime() + 9 * 3600 * 1000).toISOString();
      return { date: k.slice(0, 10), time: k.slice(11, 16) };
    }
  }
  return { date: str.slice(0, 10), time: str.slice(11, 16) };
}

export const fmtDate = (s) => kstParts(s).date.replace(/-/g, '.');
export const fmtDateTime = (s) => { const p = kstParts(s); return `${p.date} ${p.time}`.trim(); };

export function html(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export function redirect(location, headers = {}) {
  return new Response(null, { status: 302, headers: { location, 'cache-control': 'no-store', ...headers } });
}

// 정적 페이지 하나를 레이아웃 껍데기로 쓴다.
// 헤더·푸터·유입 기록 스크립트를 정적 HTML 과 똑같이 유지하려는 것이다 —
// 정적 파일의 머리말·꼬리말을 고치면 게시판 화면에도 그대로 반영된다.
export async function page(env, request, shellPath, { title, main, status = 200 }) {
  const res = await env.ASSETS.fetch(new URL(shellPath, request.url));
  let h = await res.text();
  if (title) {
    const full = `${esc(title)} | ${SITE}`;
    h = h.replace(/<title>[^<]*<\/title>/, `<title>${full}</title>`)
         .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${full}$2`);
  }
  if (main != null) {
    const a = h.indexOf('<main class="site-main">');
    const b = h.indexOf('</main>', a);
    if (a >= 0 && b > a) h = h.slice(0, a) + '<main class="site-main">\n' + main + '</main>' + h.slice(b + 7);
  }
  return html(h, status);
}

export async function notFound(env, request) {
  const res = await env.ASSETS.fetch(new URL('/404', request.url));
  return html(await res.text(), 404);
}

export async function readForm(request) {
  const f = await request.formData();
  const o = {};
  for (const [k, v] of f.entries()) if (typeof v === 'string') o[k] = v.trim();
  return o;
}

export const nowIso = () => new Date().toISOString();
