# planbloan.co.kr — 플랜비대부주식회사 홈페이지

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

**1) 지금처럼 직접 업로드**

```
npx wrangler pages deploy . --project-name planbloan
```

**2) 이 저장소를 Pages 에 연결** (권장)

Cloudflare 대시보드 → Workers & Pages → `planbloan` → 설정 → Git 연결.
연결해 두면 `git push` 만으로 배포된다. mytruck·todayhero 가 이 방식이다.
