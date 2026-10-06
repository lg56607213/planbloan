// POST /apply/form — 대출신청 접수 → D1 저장 → 담당자 메일 알림
// GET 은 정의하지 않는다. 신청 화면은 정적 파일 apply/form/index.html 이 그대로 나간다.
import { SITE, esc, fmtDateTime, html, page, readForm, nowIso } from '../_lib/util.js';

const PRODUCTS = ['신용대출', '담보대출'];

export async function onRequestPost({ request, env, waitUntil }) {
  const f = await readForm(request);

  const name = (f.name || '').slice(0, 30);
  const phone = [f.p1, f.p2, f.p3].map((s) => (s || '').replace(/\D/g, '')).join('-');
  const product = PRODUCTS.includes(f.product) ? f.product : '';
  const amount = (f.amount || '').replace(/[^\d]/g, '').slice(0, 8);
  const timing = (f.timing || '').slice(0, 40);

  let err = '';
  if (!name) err = '성명을 입력해 주세요.';
  else if (!/^0\d{1,2}-\d{3,4}-\d{4}$/.test(phone)) err = '연락처를 정확히 입력해 주세요.';
  else if (!product) err = '상품 종류를 선택해 주세요.';
  else if (f.agree !== '1') err = '개인정보 수집 및 이용에 동의해 주세요.';
  if (err) return formWithError(env, request, err);

  const cut = (s, n) => (s || '').slice(0, n) || null;
  const row = {
    name, phone, product,
    amount: amount || null,
    timing: timing || null,
    // 폼에는 메모 칸이 없다. utm_content 는 담을 컬럼이 없어 메모에 남긴다.
    memo: f.utm_content ? `utm_content: ${cut(f.utm_content, 100)}` : null,
    utm_source: cut(f.utm_source, 100),
    utm_medium: cut(f.utm_medium, 100),
    utm_campaign: cut(f.utm_campaign, 100),
    utm_term: cut(f.utm_term, 100),
    referrer: cut(f.referrer, 300),
    landing: cut(f.landing, 300),
    created_at: nowIso(),
  };

  const r = await env.DB.prepare(
    `INSERT INTO applications (name, phone, product, amount, timing, memo, utm_source, utm_medium, utm_campaign, utm_term, referrer, landing, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
  ).bind(row.name, row.phone, row.product, row.amount, row.timing, row.memo, row.utm_source, row.utm_medium,
         row.utm_campaign, row.utm_term, row.referrer, row.landing, row.created_at).run();

  waitUntil(notify(env, { id: r.meta.last_row_id, ...row }).catch((e) => console.error('메일 발송 실패', e)));

  return done(env, request);
}

async function notify(env, a) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_TO) return;
  const site = env.SITE_NAME || SITE;
  const text = [
    `[${site}] 새 대출신청이 접수되었습니다.`,
    '',
    `접수번호 : ${a.id}`,
    `접수시각 : ${fmtDateTime(a.created_at)}`,
    `성명     : ${a.name}`,
    `연락처   : ${a.phone}`,
    `상품     : ${a.product}`,
    `요청금액 : ${a.amount ? a.amount + '만원' : '-'}`,
    `필요시기 : ${a.timing || '-'}`,
    `유입경로 : ${a.referrer || '-'}`,
    a.utm_term ? `키워드   : ${a.utm_term}` : null,
    '',
    '관리자 화면 : https://www.planbloan.co.kr/admin/applications',
  ].filter((l) => l !== null).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: env.NOTIFY_TO.split(',').map((s) => s.trim()).filter(Boolean),
      subject: `[${site}] 대출신청 - ${a.name} / ${a.product}`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status} ${await res.text()}`);
}

async function shell(env, request) {
  return (await env.ASSETS.fetch(new URL('/apply/form', request.url))).text();
}

async function formWithError(env, request, msg) {
  const h = (await shell(env, request))
    .replace('<form method="post" action="/apply/form"', `<div class="msg msg-err">${esc(msg)}</div>\n\n  <form method="post" action="/apply/form"`);
  return html(h, 400);
}

function done(env, request) {
  return page(env, request, '/apply/form', {
    title: '신청 완료',
    main: `<section class="section section-narrow" style="text-align:center;padding-top:70px">
  <h1 class="page-title">신청이 접수되었습니다</h1>
  <p class="page-lead">담당자가 확인 후 남겨주신 연락처로 연락드리겠습니다.<br>상담시간 09시 ~ 18시 · 급하시면 <a href="tel:02-6925-0517">02-6925-0517</a></p>
  <p><a class="btn btn-blue" href="/">홈으로</a></p>
</section>`,
  });
}
