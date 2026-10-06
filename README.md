# planbloan.co.kr — 플랜비대부주식회사 홈페이지

> ## 경고 — 이 저장소로 배포하지 말 것
>
> **이 저장소에는 서버 코드가 빠져 있다.** 정적 HTML 만 들어 있다.
>
> 실제 서비스에는 Cloudflare Pages Functions 로 도는 서버 코드가 함께 올라가 있고,
> 그 코드가 D1 데이터베이스 `planbloan` 과 환경변수를 쓴다.
> 이 저장소 상태로 `wrangler pages deploy` 를 하면 아래가 전부 멈춘다.
>
> - 관리자 로그인 (`/admin` — 지금은 302 로 응답한다)
> - 게시판 글·조회수 (`posts` 테이블)
> - 대출신청 접수와 메일 알림 (`applications` 테이블, Resend)
>
> 데이터는 D1 에 남아 있으므로 서버 코드만 되찾으면 복구된다.
> 그때까지 **배포 금지.**
>
> ### 빠진 것
> ```
> functions/          Pages Functions 서버 코드
> wrangler.toml       D1 바인딩 · 환경변수 설정
> ```
>
> ### 쓰이는 자원 (Cloudflare 에 그대로 있다)
> | 종류 | 이름 |
> |---|---|
> | D1 | `planbloan` (c76d142f-40f5-4d53-87eb-cb63442e6a37) |
> | 테이블 | admins · sessions · login_attempts · posts · applications |
> | 환경변수 | RESEND_API_KEY · MAIL_FROM · NOTIFY_TO · SETUP_TOKEN · SITE_NAME |
>
> ### 되찾는 방법
> 1. 예전에 planbloan 을 작업하던 PC 에서 `functions/` 와 `wrangler.toml` 을 찾아
>    이 저장소에 커밋한다. (가장 빠르고 확실하다)
> 2. 못 찾으면 D1 스키마와 사이트 동작을 보고 새로 작성한다.
>    시간이 걸리고 기존과 똑같이 동작한다는 보장이 없다.

Cloudflare **Pages** 프로젝트 `planbloan` 이 서비스하는 정적 사이트.

| 항목 | 값 |
|---|---|
| 주소 | https://planbloan.co.kr · https://www.planbloan.co.kr |
| 미리보기 | https://planbloan.pages.dev |
| 호스팅 | Cloudflare Pages (프로젝트명 `planbloan`) |
| 배포 방식 | **직접 업로드** — Git 자동배포 연결 없음 |

## 이 저장소가 만들어진 경위

원본 작업 파일이 어느 PC에도 남아 있지 않았다.
Cloudflare Pages 에 Git 연결도 없어서, 지금 서비스 중인 결과물이
유일한 사본이었다. 그래서 **배포본을 그대로 내려받아** 저장소로 만들었다.

받아오면서 Cloudflare 가 서빙할 때 끼워 넣는 것들을 걷어냈다.

- 이메일 난독화(`__cf_email__` / `data-cfemail`) → 원래 주소 `jdgp@jdgp.co.kr` 로 복원
- 분석용 beacon 스크립트 제거 (배포하면 Cloudflare 가 자동으로 다시 붙인다)
- 이메일 복호화 스크립트 제거

즉 **이것은 '서비스되던 결과물'이지 원래 작업 소스가 아니다.**
빌드 도구나 템플릿을 쓴 흔적은 없고 순수 HTML·CSS 라 차이는 없을 것으로 보이지만,
다른 PC 에 원본이 남아 있다면 그쪽이 기준이다.

## 구조

```
index.html              홈
company/                회사소개
company/location/       오시는 길
loan/credit/            신용대출
loan/secured/           담보대출
calculator/             대출 계산기
apply/  apply/form/     대출 신청
board/notice/           공지사항
board/rights/           권리 안내
board/faq/              자주 묻는 질문
terms/provision/        약관
terms/privacy/          개인정보 처리방침
terms/no-email/         이메일 무단수집 거부
assets/site.css         전체 스타일
assets/img/             이미지
```

주소가 `/company` 처럼 확장자 없이 쓰이므로 각 폴더에 `index.html` 을 둔다.

## 로컬에서 보기

```
python -m http.server 8000
```

→ http://127.0.0.1:8000

## 배포

Pages 프로젝트에 Git 이 연결돼 있지 않다. 두 가지 방법이 있다.

**1) 직접 업로드 — 서버 코드를 되찾기 전에는 하지 말 것**

```
npx wrangler pages deploy . --project-name planbloan
```

**2) 이 저장소를 Pages 에 연결** (권장)

Cloudflare 대시보드 → Workers & Pages → `planbloan` → 설정 → Git 연결.
연결해 두면 `git push` 만으로 배포된다. mytruck·todayhero 가 이 방식이다.
