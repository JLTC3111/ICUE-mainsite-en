const { recordPaymentEvent } = require('../db/repository');

function logPaymentAttempt({ provider, amountVnd, orderId, status, message, eventKey }) {
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

  try {
    recordPaymentEvent({
      orderId: orderId || null,
      provider,
      eventType: 'payment_attempt',
      status,
      amountVnd,
      eventKey: eventKey || null,
      metadata: message ? { message } : undefined,
    });
  } catch (err) {
    console.error('[payment] could not write payment_events:', err.message);
  }
}

module.exports = { logPaymentAttempt };
