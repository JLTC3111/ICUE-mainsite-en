function logPaymentAttempt({ provider, amountVnd, orderId, status, message }) {
  const entry = {
    timestamp: new Date().toISOString(),
    provider,
    amountVnd,
    currency: 'VND',
    orderId: orderId || null,
    status,
    message: message || undefined,
  };
  console.log('[payment]', JSON.stringify(entry));
}

module.exports = { logPaymentAttempt };
