-- Donors (people who donate)
CREATE TABLE IF NOT EXISTS donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One-time donation orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL UNIQUE,
  donor_id INTEGER NOT NULL REFERENCES donors(id),
  provider TEXT NOT NULL,
  amount_vnd INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  status TEXT NOT NULL,
  provider_order_id TEXT,
  provider_trans_id TEXT,
  failure_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_donor_id ON orders(donor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_provider ON orders(provider);

-- Audit log for payment lifecycle + webhooks
CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT,
  amount_vnd INTEGER,
  event_key TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_event_key ON payment_events(event_key) WHERE event_key IS NOT NULL;

-- Webhook idempotency (duplicate provider callbacks)
CREATE TABLE IF NOT EXISTS webhook_receipts (
  event_key TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  order_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
