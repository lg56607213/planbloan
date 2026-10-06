-- planbloan.co.kr D1 데이터베이스 스키마
--
-- Cloudflare 운영 DB 에서 그대로 뽑았다.
--   이름: planbloan
--   id  : c76d142f-40f5-4d53-87eb-cb63442e6a37
--
-- 서버 코드(Pages Functions)가 사라져 저장소에 없다.
-- 다시 만들 경우 이 구조에 맞춰야 기존 데이터를 그대로 쓸 수 있다.
--
-- 읽어낼 수 있는 것
--   - 관리자 비밀번호는 pbkdf2 로 해싱한다 (형식이 아래 주석에 있다)
--   - 세션은 토큰 기반, 만료는 epoch ms
--   - 로그인 실패는 IP 단위로 잠근다
--   - 대출신청은 UTM 유입 정보까지 같이 저장한다
--   - 게시판은 notice / rights / faq 세 종류

CREATE TABLE posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  board       TEXT    NOT NULL,              -- notice | rights | faq
  title       TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  pinned      INTEGER NOT NULL DEFAULT 0,    -- 상단 고정
  views       INTEGER NOT NULL DEFAULT 0,
  author      TEXT    NOT NULL DEFAULT '플랜비대부주식회사',
  created_at  TEXT    NOT NULL,
  updated_at  TEXT
);

CREATE TABLE admins (
  username      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,               -- pbkdf2$반복수$salt(b64)$hash(b64)
  created_at    TEXT NOT NULL,
  last_login    TEXT
);

CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  username   TEXT    NOT NULL,
  expires_at INTEGER NOT NULL,               -- epoch ms
  created_at TEXT    NOT NULL
);

CREATE TABLE login_attempts (
  ip           TEXT PRIMARY KEY,
  fail_count   INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,   -- epoch ms
  updated_at   TEXT
);

CREATE TABLE applications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  product      TEXT,                          -- 신용대출 | 담보대출
  amount       TEXT,                          -- 요청금액(만원)
  timing       TEXT,                          -- 자금필요시기
  memo         TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_term     TEXT,                          -- 유입 키워드
  referrer     TEXT,
  landing      TEXT,
  status       TEXT NOT NULL DEFAULT 'new',   -- new | contacted | done | drop
  created_at   TEXT NOT NULL
);
