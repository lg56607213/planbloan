/* 공지 팝업 : 신용대출 취급 중지 (2026-10-06~)
   사이트에 처음 들어오면 한 번 띄운다.
   - 닫기               : 이번 방문(탭) 동안 다시 띄우지 않는다
   - 오늘 하루 보지 않기 : 오늘 자정까지 띄우지 않는다
   내릴 때는 각 HTML 의 <script src="/assets/notice-popup.js"> 줄과 이 파일,
   site.css 의 '공지 팝업' 규칙을 지운다. */
(function () {
  var KEY = 'pb_popup_credit_stop';
  var d = new Date();
  var today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();   // 방문자 기준 날짜

  try {
    if (sessionStorage.getItem(KEY) === '1') return;
    if (localStorage.getItem(KEY) === today) return;
  } catch (e) { /* 저장소를 못 쓰면 매번 띄운다 */ }

  var wrap = document.createElement('div');
  wrap.className = 'np-overlay';
  wrap.innerHTML =
    '<div class="np-card" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="np-title">' +
      '<div class="np-head">' +
        '<span class="np-badge">공지</span>' +
        '<h2 id="np-title">신용대출 취급 중지 안내</h2>' +
        '<span class="np-date">시행일 2026년 10월 06일</span>' +
      '</div>' +
      '<div class="np-body">' +
        '<p>2026년 10월 06일부터 <b>신용대출</b> 취급을 중지합니다.<br>이용에 참고해 주시기 바랍니다.</p>' +
        '<div class="np-ok"><span class="np-check" aria-hidden="true">✓</span>담보대출은 정상 진행합니다.</div>' +
        '<div class="np-actions">' +
          '<a class="btn btn-blue" href="/loan/secured">담보대출 알아보기</a>' +
          '<a class="btn np-tel" href="tel:02-6925-0517">전화 상담 02-6925-0517</a>' +
        '</div>' +
      '</div>' +
      '<div class="np-foot">' +
        '<button type="button" data-np="today">오늘 하루 보지 않기</button>' +
        '<button type="button" data-np="close" class="np-close">닫기</button>' +
      '</div>' +
    '</div>';

  function close(mode) {
    try {
      sessionStorage.setItem(KEY, '1');
      if (mode === 'today') localStorage.setItem(KEY, today);
    } catch (e) {}
    wrap.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close('close'); }

  wrap.addEventListener('click', function (e) {
    var t = e.target;
    if (t === wrap) return close('close');                  // 바깥 어두운 곳을 누르면 닫는다
    var m = t.getAttribute && t.getAttribute('data-np');
    if (m) close(m);
  });
  document.addEventListener('keydown', onKey);

  function show() {
    document.body.appendChild(wrap);
    var card = wrap.querySelector('.np-card');
    if (card) card.focus({ preventScroll: true });   // 키보드 사용자를 팝업 안으로 옮긴다
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
  else show();
})();
