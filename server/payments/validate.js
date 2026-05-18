const { MIN_AMOUNT_VND, MAX_AMOUNT_VND, PROVIDERS } = require('./constants');

function parseAmountVnd(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const normalized = String(raw).replace(/[,\s]/g, '');
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) return null;
  if (amount < MIN_AMOUNT_VND || amount > MAX_AMOUNT_VND) return null;
  return amount;
}

function sanitizeDonor(body) {
  const firstName = String(body.firstName || '').trim().slice(0, 100);
  const lastName = String(body.lastName || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().slice(0, 254);
  const phone = String(body.phone || '').trim().slice(0, 30);
  const company = String(body.company || '').trim().slice(0, 200);

  if (!firstName || !lastName || !email) {
    return { error: 'First name, last name, and email are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  return { firstName, lastName, email, phone, company };
}

function parseProvider(raw) {
  const provider = String(raw || '').toLowerCase().trim();
  if (!PROVIDERS.includes(provider)) return null;
  return provider;
}

module.exports = { parseAmountVnd, sanitizeDonor, parseProvider, MIN_AMOUNT_VND, MAX_AMOUNT_VND };
