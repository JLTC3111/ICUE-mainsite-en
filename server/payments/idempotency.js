const { claimWebhookEvent } = require('../db/repository');

function claim(eventKey, provider, orderId) {
  return claimWebhookEvent(eventKey, provider, orderId);
}

module.exports = { claim };
