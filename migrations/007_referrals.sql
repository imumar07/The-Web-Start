-- The Web Start — Migration 007: Referral Commissions
-- Run: node scripts/migrate.mjs

CREATE TABLE IF NOT EXISTS referrals (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  referred_name      TEXT    NOT NULL,
  referred_email     TEXT,
  referred_phone     TEXT,
  commission_amount  REAL    NOT NULL DEFAULT 0,
  status             TEXT    NOT NULL DEFAULT 'pending',  -- 'pending'|'paid'|'cancelled'
  referral_date      TEXT    NOT NULL DEFAULT (date('now')),
  paid_date          TEXT,
  notes              TEXT,
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_client_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status   ON referrals(status);
