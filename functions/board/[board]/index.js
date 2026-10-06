// GET /board/:board — 게시판 목록 (검색 ?q= · 페이지 ?page=)
import { BOARDS, esc, fmtDate, page, notFound } from '../../_lib/util.js';
import { currentAdmin } from '../../_lib/auth.js';

const PER_PAGE = 10;

export async function onRequestGet({ request, env, params }) {
  const board = params.board;
  if (!BOARDS[board]) return notFound(env, request);

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 50);
  const admin = await currentAdmin(env, request);

  let where = 'board = ?';
  const bind = [board];
  if (q) {
    where += ' AND (title LIKE ? OR body LIKE ?)';
    bind.push(`%${q}%`, `%${q}%`);
  }

  const total = (await env.DB.prepare(`SELECT count(*) AS n FROM posts WHERE ${where}`).bind(...bind).first()).n;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const cur = Math.min(pages, Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1));
  const offset = (cur - 1) * PER_PAGE;

  const { results } = await env.DB.prepare(
    `SELECT id, title, pinned, views, created_at FROM posts WHERE ${where}
     ORDER BY pinned DESC, id DESC LIMIT ? OFFSET ?`
  ).bind(...bind, PER_PAGE, offset).all();

  const rows = results.length
    ? results.map((p, i) => `<tr>
          <td class="no">${total - offset - i}</td>
          <td class="subject">${p.pinned ? '<span class="pin">공지</span>' : ''}<a href="/board/${board}/${p.id}">${esc(p.title)}</a></td>
          <td class="date">${fmtDate(p.created_at)}</td>
          <td class="hit">${p.views}</td>
          ${admin ? manageCell(board, p.id) : ''}
        </tr>`).join('')
    : `<tr><td class="empty" colspan="${admin ? 5 : 4}">${q ? '검색 결과가 없습니다.' : '등록된 글이 없습니다.'}</td></tr>`;

  const main = `<section class="section section-narrow">
  <h1 class="page-title">${BOARDS[board]}</h1>
  ${admin ? `<p style="text-align:right;margin:0 0 14px"><a class="btn btn-blue" href="/admin/posts/new?board=${board}">글쓰기</a></p>` : ''}
  <table class="board">
    <thead><tr>
      <th class="no">번호</th><th>제목</th><th class="date">작성일</th><th class="hit">조회</th>
      ${admin ? '<th class="manage">관리</th>' : ''}
    </tr></thead>
    <tbody>
    ${rows}
    </tbody>
  </table>

  ${pager(board, q, cur, pages)}

  <form method="get" style="display:flex;gap:8px;max-width:420px;margin:26px auto 0">
    <input type="text" name="q" value="${esc(q)}" placeholder="제목 또는 내용 검색">
    <button class="btn btn-blue" style="flex:none;padding:13px 22px">검색</button>
  </form>
</section>`;

  return page(env, request, `/board/${board}`, { main });
}

function manageCell(board, id) {
  return `<td class="manage"><a class="mini" href="/admin/posts/${id}/edit">수정</a><form method="post" action="/admin/posts/${id}/delete" style="display:inline" onsubmit="return confirm('이 글을 삭제할까요?')"><button class="mini del">삭제</button></form></td>`;
}

function pager(board, q, cur, pages) {
  if (pages <= 1) return '';
  const link = (n, label = n) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (n > 1) p.set('page', n);
    const s = p.toString();
    return `<a href="/board/${board}${s ? '?' + s : ''}">${label}</a>`;
  };
  const start = Math.max(1, cur - 4), end = Math.min(pages, start + 9);
  let h = cur > 1 ? link(cur - 1, '‹') : '';
  for (let n = start; n <= end; n++) h += n === cur ? `<span class="cur">${n}</span>` : link(n);
  if (cur < pages) h += link(cur + 1, '›');
  return `<div class="pager">${h}</div>`;
}
