// GET /board/:board/:id — 게시글 보기 (조회수 +1)
import { BOARDS, esc, fmtDate, page, notFound } from '../../_lib/util.js';
import { currentAdmin } from '../../_lib/auth.js';

export async function onRequestGet({ request, env, params }) {
  const board = params.board;
  const id = parseInt(params.id, 10);
  if (!BOARDS[board] || !(id > 0) || String(id) !== params.id) return notFound(env, request);

  const admin = await currentAdmin(env, request);

  // 관리자가 확인하느라 여는 것은 조회수에 넣지 않는다
  if (!admin) {
    await env.DB.prepare('UPDATE posts SET views = views + 1 WHERE id = ? AND board = ?').bind(id, board).run();
  }
  const p = await env.DB.prepare('SELECT * FROM posts WHERE id = ? AND board = ?').bind(id, board).first();
  if (!p) return notFound(env, request);

  const manage = admin
    ? `<span><a class="mini" href="/admin/posts/${p.id}/edit">수정</a><form method="post" action="/admin/posts/${p.id}/delete" style="display:inline" onsubmit="return confirm('이 글을 삭제할까요?')"><button class="mini del">삭제</button></form></span>`
    : '';

  const main = `<section class="section section-narrow">
  <div class="post-head">
    <h1>${esc(p.title)}</h1>
    <div class="post-meta">${esc(p.author)} &nbsp;|&nbsp; ${fmtDate(p.created_at)} &nbsp;|&nbsp; 조회 ${p.views}</div>
  </div>
  <div class="post-body">${esc(p.body)}</div>

  <div class="post-nav">
    <a class="btn" style="border-color:var(--line);color:var(--ink-2)" href="/board/${board}">목록으로</a>
    ${manage}
  </div>
</section>`;

  return page(env, request, `/board/${board}`, { title: p.title, main });
}
