# planbloan.co.kr — 플랜비대부주식회사 홈페이지

Cloudflare **Pages** 프로젝트 `planbloan`. 정적 HTML + Pages Functions(게시판·대출신청·관리자) + D1.

| 항목 | 값 |
|---|---|
| 주소 | https://planbloan.co.kr · https://www.planbloan.co.kr |
| 미리보기 | https://planbloan.pages.dev |
| 호스팅 | Cloudflare Pages (프로젝트명 `planbloan`) |
| 배포 방식 | **직접 업로드** — Git 자동배포 연결 없음 |
| DB | D1 `planbloan` (바인딩 이름 `DB`) |
| 관리자 | https://www.planbloan.co.kr/admin |

## 폴더 구조

```
public/                     ← 웹에 올라가는 것은 이 폴더뿐
  index.html                홈
  company.html              회사소개
  company/location.html     오시는 길
  loan/credit.html          신용대출
  loan/secured.html         담보대출
  calculator.html           대출 계산기
  apply.html                대출신청방법
  apply/form.html           대출신청 폼 (전송은 functions/apply/form.js 가 받는다)
  board/notice.html         ┐ 게시판 화면의 '틀'. 실제 목록·글은 DB 에서 나온다.
  board/rights.html         │ 머리말·꼬리말을 고치면 게시판 화면에도 반영된다.
  board/faq.html            ┘
  board/*/숫자.html          예전 글 화면 스냅샷 (서비스되지 않음 · 백업용)
  terms/*.html              약관 · 개인정보처리방침 · 이메일무단수집거부
  404.html                  없는 주소
  assets/                   CSS · 이미지
  _routes.json              어떤 주소를 Functions 가 처리할지

functions/                  서버 코드 (Pages Functions)
  board/[board]/index.js    GET  /board/:board        목록 · 검색 · 페이지
  board/[board]/[id].js     GET  /board/:board/:id    글 보기 · 조회수
  apply/form.js             POST /apply/form          신청 저장 → 메일 알림
  admin/[[path]].js         /admin/*                  관리자 화면 전체
  _lib/util.js              공통 (레이아웃 · 날짜 · 이스케이프)
  _lib/auth.js              로그인 · 세션 · 잠금

schema.sql                  D1 테이블 구조 (운영 DB 에서 옮겨 적음)
```

주소는 `/company` 처럼 확장자 없이 쓴다. `company.html` 이 `/company` 로 서비스된다.

## 배포

```
cd planbloan
npx wrangler pages deploy public --project-name planbloan
```

- 반드시 **저장소 최상위 폴더에서** 실행한다. 그래야 `functions/` 가 같이 올라간다.
- `.` 이 아니라 `public` 을 올린다. `.` 을 올리면 README · 서버 코드가 웹에 공개된다.
- **`wrangler.toml` 을 만들지 않는다.** 만들면 그 파일이 설정의 기준이 되어
  대시보드에 있는 환경변수(`MAIL_FROM` · `NOTIFY_TO` · `SITE_NAME`)가 지워질 수 있다.
  DB 연결과 환경변수는 Cloudflare 대시보드 설정을 그대로 쓴다.

## 관리자 기능

| 화면 | 주소 |
|---|---|
| 로그인 | `/admin/login` (5회 틀리면 15분 잠금) |
| 대출신청 목록 · 상태 변경 · 삭제 · 엑셀 받기 | `/admin/applications` |
| 게시글 쓰기 · 수정 · 삭제 | 로그인한 채로 `/board/notice` 등 공개 게시판을 열면 버튼이 보인다 |
| 비밀번호 변경 | `/admin/password` |
| 첫 계정 만들기 | `/admin/setup` — 관리자가 한 명도 없을 때만, `SETUP_TOKEN` 필요 |

### 기존 관리자 비밀번호로 로그인이 안 될 때

원래 서버 코드가 남아 있지 않아 다시 만들었다(2026-10). 비밀번호 저장 형식
`pbkdf2$반복수$salt$hash` 은 같지만 원래 코드의 해시 알고리즘은 알 수 없어
SHA-256 · SHA-512 · SHA-1 순으로 맞춰 본다. 그래도 안 되면 계정을 지우고 새로 만든다.

```
npx wrangler d1 execute planbloan --remote --command "DELETE FROM admins"
```

그다음 `/admin/setup` 에서 `SETUP_TOKEN` 값으로 새 계정을 만든다.
`SETUP_TOKEN` 값을 모르면 대시보드 → planbloan → 설정 → 환경변수에서 새로 지정한다.

## 대시보드에 있는 설정 (코드에 없음)

| 이름 | 종류 | 용도 |
|---|---|---|
| `DB` | D1 바인딩 | 게시판 · 관리자 · 신청 저장 |
| `RESEND_API_KEY` | 비밀 | 신청 알림 메일 발송 (resend.com) |
| `MAIL_FROM` | 변수 | 알림 메일 보내는 사람 |
| `NOTIFY_TO` | 변수 | 알림 받을 주소 (쉼표로 여러 개) |
| `SETUP_TOKEN` | 비밀 | `/admin/setup` 설치 토큰 |
| `SITE_NAME` | 변수 | 메일 제목에 쓰는 회사명 |

## 로컬에서 테스트

운영 DB 를 건드리지 않도록 저장소 밖에 임시 폴더를 만들어 돌린다.

```
# 임시 폴더에 functions · public · schema.sql 을 복사하고, 그 폴더에 아래 wrangler.toml 을 만든다
#   name = "planbloan-test"
#   pages_build_output_dir = "public"
#   compatibility_date = "2026-08-01"
#   [[d1_databases]]
#   binding = "DB"
#   database_name = "planbloan-test"
#   database_id = "00000000-0000-0000-0000-000000000000"
#   [vars]
#   SETUP_TOKEN = "test-setup-token"
npx wrangler d1 execute planbloan-test --local --file schema.sql
npx wrangler pages dev --port 8788
```

→ http://127.0.0.1:8788 , 관리자 계정은 `/admin/setup` 에서 `test-setup-token` 으로 만든다.

## 이 저장소의 경위

- 2026-10-06 이전 `main` 에는 ERP 시제품 코드가 있었다 → `erp` 브랜치로 옮겨 둠.
- 원본 작업 폴더가 어느 PC 에도 남아 있지 않아, 서비스 중인 화면을 내려받아 `public/` 을 만들었다.
  (Cloudflare 가 끼워 넣는 이메일 난독화 · beacon 스크립트는 걷어냄)
- 서버 코드(Pages Functions)는 내려받을 수 없어 D1 테이블 구조와 서비스 중인 화면 동작을 보고 새로 작성했다.
