PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token   TEXT NOT NULL UNIQUE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_queries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NULL,
  city          TEXT NOT NULL,
  lat           REAL,
  lon           REAL,
  source        TEXT NOT NULL,
  status_code   INTEGER NOT NULL,
  error_message TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  city       TEXT NOT NULL,
  lat        REAL,
  lon        REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, city),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weather_cache (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cache_key   TEXT NOT NULL UNIQUE,
  city        TEXT NOT NULL,
  lat         REAL,
  lon         REAL,
  data_json   TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_limits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER,
  day        DATE NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  daily_max  INTEGER NOT NULL,
  UNIQUE(user_id, day),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stats_daily (
  day              DATE PRIMARY KEY,
  total_requests   INTEGER NOT NULL DEFAULT 0,
  from_cache       INTEGER NOT NULL DEFAULT 0,
  from_api         INTEGER NOT NULL DEFAULT 0,
  errors           INTEGER NOT NULL DEFAULT 0
);
