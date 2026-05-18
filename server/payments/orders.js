const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const memory = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromDisk() {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) return;
  try {
    const rows = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    if (Array.isArray(rows)) {
      rows.forEach((row) => memory.set(row.orderId, row));
    }
  } catch {
    // ignore corrupt file
  }
}

function persist() {
  ensureDataDir();
  const rows = Array.from(memory.values()).slice(-500);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(rows, null, 2));
}

function generateOrderId() {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `ICUE-${Date.now()}-${suffix}`;
}

function createOrder({ provider, amountVnd, donor }) {
  const orderId = generateOrderId();
  const order = {
    orderId,
    provider,
    amountVnd,
    currency: 'VND',
    status: 'pending',
    donor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memory.set(orderId, order);
  persist();
  return order;
}

function updateOrderStatus(orderId, status, extra = {}) {
  const order = memory.get(orderId);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  Object.assign(order, extra);
  memory.set(orderId, order);
  persist();
  return order;
}

function getOrder(orderId) {
  return memory.get(orderId) || null;
}

loadFromDisk();

module.exports = { createOrder, updateOrderStatus, getOrder };
