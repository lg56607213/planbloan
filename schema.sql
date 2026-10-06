-- planbloan D1 (운영 DB 이름: planbloan) 테이블 구조
-- 운영 DB 에서 그대로 옮겨 적은 것이다. 로컬 테스트 DB 를 만들 때만 쓴다:
--   npx wrangler d1 execute planbloan --local --file schema.sql

CREATE TABLE IF NOT EXISTS posts (
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
CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board, pinned DESC, id DESC);

CREATE TABLE IF NOT EXISTS admins (
  username      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,               -- pbkdf2$반복수$salt(b64)$hash(b64)
  created_at    TEXT NOT NULL,
  last_login    TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  username   TEXT    NOT NULL,
  expires_at INTEGER NOT NULL,               -- epoch ms
  created_at TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip           TEXT PRIMARY KEY,
  fail_count   INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,   -- epoch ms
  updated_at   TEXT
);

CREATE TABLE IF NOT EXISTS applications (
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
CREATE INDEX IF NOT EXISTS idx_app_created ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_term ON applications(utm_term);
