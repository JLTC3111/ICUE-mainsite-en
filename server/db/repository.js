const crypto = require('crypto');
const { getDb } = require('./client');

const ORDER_STATUSES = new Set([
  'pending',
  'awaiting_transfer',
  'paid',
  'failed',
  'refunded',
  'cancelled',
]);

function generateOrderId() {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `ICUE-${Date.now()}-${suffix}`;
}

function upsertDonor({ email, firstName, lastName, phone, company }) {
  const database = getDb();
  const existing = database
    .prepare('SELECT id FROM donors WHERE email = ? COLLATE NOCASE')
    .get(email);

  if (existing) {
    database
      .prepare(
        `UPDATE donors
         SET first_name = ?, last_name = ?, phone = ?, company = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
      .run(firstName, lastName, phone || null, company || null, existing.id);
    return existing.id;
  }

  const result = database
    .prepare(
      `INSERT INTO donors (email, first_name, last_name, phone, company)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(email, firstName, lastName, phone || null, company || null);

  return Number(result.lastInsertRowid);
}

function getDonorById(donorId) {
  return getDb().prepare('SELECT * FROM donors WHERE id = ?').get(donorId) || null;
}

function mapOrder(row, donor) {
  if (!row) return null;
  return {
    orderId: row.order_id,
    provider: row.provider,
    amountVnd: row.amount_vnd,
    currency: row.currency,
    status: row.status,
    providerOrderId: row.provider_order_id,
    providerTransId: row.provider_trans_id,
    failureMessage: row.failure_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    donor: donor
      ? {
          email: donor.email,
          firstName: donor.first_name,
          lastName: donor.last_name,
          phone: donor.phone,
          company: donor.company,
        }
      : undefined,
  };
}

function getOrderRow(orderId) {
  return (
    getDb()
      .prepare(
        `SELECT o.*, d.email, d.first_name, d.last_name, d.phone, d.company
         FROM orders o
         JOIN donors d ON d.id = o.donor_id
         WHERE o.order_id = ?`
      )
      .get(orderId) || null
  );
}

function getOrder(orderId) {
  const row = getOrderRow(orderId);
  if (!row) return null;
  const donor = {
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
    company: row.company,
  };
  return mapOrder(row, donor);
}

function recordPaymentEvent({
  orderId,
  provider,
  eventType,
  status,
  amountVnd,
  eventKey,
  metadata,
}) {
  getDb()
    .prepare(
      `INSERT INTO payment_events (order_id, provider, event_type, status, amount_vnd, event_key, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      orderId || null,
      provider,
      eventType,
      status || null,
      amountVnd ?? null,
      eventKey || null,
      metadata ? JSON.stringify(metadata) : null
    );
}

function createOrder({ provider, amountVnd, donor }) {
  const database = getDb();
  const orderId = generateOrderId();
  const donorId = upsertDonor({
    email: donor.email,
    firstName: donor.firstName,
    lastName: donor.lastName,
    phone: donor.phone,
    company: donor.company,
  });

  database
    .prepare(
      `INSERT INTO orders (order_id, donor_id, provider, amount_vnd, currency, status)
       VALUES (?, ?, ?, ?, 'VND', 'pending')`
    )
    .run(orderId, donorId, provider, amountVnd);

  recordPaymentEvent({
    orderId,
    provider,
    eventType: 'order_created',
    status: 'pending',
    amountVnd,
    metadata: { email: donor.email },
  });

  return getOrder(orderId);
}

function updateOrderStatus(orderId, status, extra = {}) {
  if (!ORDER_STATUSES.has(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  const database = getDb();
  const current = database.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!current) return null;

  const providerOrderId = extra.providerOrderId ?? current.provider_order_id;
  const providerTransId = extra.providerTransId ?? current.provider_trans_id;
  const failureMessage = extra.failureMessage ?? current.failure_message;

  database
    .prepare(
      `UPDATE orders
       SET status = ?,
           provider_order_id = ?,
           provider_trans_id = ?,
           failure_message = ?,
           updated_at = datetime('now')
       WHERE order_id = ?`
    )
    .run(status, providerOrderId, providerTransId, failureMessage, orderId);

  recordPaymentEvent({
    orderId,
    provider: current.provider,
    eventType: 'status_changed',
    status,
    amountVnd: current.amount_vnd,
    metadata: {
      providerOrderId,
      providerTransId,
      failureMessage: failureMessage || undefined,
    },
  });

  return getOrder(orderId);
}

function claimWebhookEvent(eventKey, provider, orderId) {
  const database = getDb();
  try {
    database
      .prepare(
        'INSERT INTO webhook_receipts (event_key, provider, order_id) VALUES (?, ?, ?)'
      )
      .run(eventKey, provider, orderId || null);
    return true;
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) return false;
    throw err;
  }
}

function listRecentOrders(limit = 50) {
  const rows = getDb()
    .prepare(
      `SELECT o.order_id, o.provider, o.amount_vnd, o.status, o.created_at,
              d.email, d.first_name, d.last_name
       FROM orders o
       JOIN donors d ON d.id = o.donor_id
       ORDER BY o.created_at DESC
       LIMIT ?`
    )
    .all(limit);

  return rows.map((row) => ({
    orderId: row.order_id,
    provider: row.provider,
    amountVnd: row.amount_vnd,
    status: row.status,
    createdAt: row.created_at,
    donor: {
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
    },
  }));
}

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrder,
  getOrderRow,
  recordPaymentEvent,
  claimWebhookEvent,
  listRecentOrders,
  upsertDonor,
  getDonorById,
};
