const paypal = require('./paypal');
const momo = require('./momo');
const zalopay = require('./zalopay');
const vnpay = require('./vnpay');
const bankTransfer = require('./bank-transfer');

const providers = {
  paypal,
  momo,
  zalopay,
  vnpay,
  bank_transfer: bankTransfer,
};

async function initiate(provider, context) {
  const impl = providers[provider];
  if (!impl?.createPayment) {
    throw new Error(`Unknown payment provider: ${provider}`);
  }
  return impl.createPayment(context);
}

module.exports = { initiate, providers };
