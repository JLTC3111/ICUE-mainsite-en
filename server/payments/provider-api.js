/**
 * Per-provider API endpoints and env requirements (sandbox vs production).
 */
const { isProviderConfigured } = require('./config');

const PROVIDER_API = {
  paypal: {
    sandbox: {
      apiBase: 'https://api-m.sandbox.paypal.com',
      oauthPath: '/v1/oauth2/token',
      createOrderPath: '/v2/checkout/orders',
      capturePath: '/v2/checkout/orders/{id}/capture',
      webhookPath: '/api/webhooks/paypal',
    },
    production: {
      apiBase: 'https://api-m.paypal.com',
      oauthPath: '/v1/oauth2/token',
      createOrderPath: '/v2/checkout/orders',
      capturePath: '/v2/checkout/orders/{id}/capture',
      webhookPath: '/api/webhooks/paypal',
    },
    envKeys: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_MODE'],
  },
  momo: {
    sandbox: {
      apiBase: 'https://test-payment.momo.vn',
      createPath: '/v2/gateway/api/create',
      ipnPath: '/api/webhooks/momo',
    },
    production: {
      apiBase: 'https://payment.momo.vn',
      createPath: '/v2/gateway/api/create',
      ipnPath: '/api/webhooks/momo',
    },
    envKeys: ['MOMO_PARTNER_CODE', 'MOMO_ACCESS_KEY', 'MOMO_SECRET_KEY', 'MOMO_ENV'],
  },
  zalopay: {
    sandbox: {
      apiBase: 'https://sb-openapi.zalopay.vn',
      createPath: '/v2/create',
      callbackPath: '/api/webhooks/zalopay',
    },
    production: {
      apiBase: 'https://openapi.zalopay.vn',
      createPath: '/v2/create',
      callbackPath: '/api/webhooks/zalopay',
    },
    envKeys: ['ZALOPAY_APP_ID', 'ZALOPAY_KEY1', 'ZALOPAY_KEY2', 'ZALOPAY_ENV'],
  },
  vnpay: {
    sandbox: {
      apiBase: 'https://sandbox.vnpayment.vn',
      payPath: '/paymentv2/vpcpay.html',
      ipnPath: '/api/webhooks/vnpay',
    },
    production: {
      apiBase: 'https://vnpayment.vn',
      payPath: '/paymentv2/vpcpay.html',
      ipnPath: '/api/webhooks/vnpay',
    },
    envKeys: ['VNPAY_TMN_CODE', 'VNPAY_HASH_SECRET', 'VNPAY_ENV'],
  },
  bank_transfer: {
    sandbox: { mode: 'manual' },
    production: { mode: 'manual' },
    envKeys: ['BANK_TRANSFER_ACCOUNT_NUMBER', 'BANK_TRANSFER_BANK_NAME'],
  },
};

function isSandbox(provider) {
  switch (provider) {
    case 'paypal':
      return process.env.PAYPAL_MODE !== 'live';
    case 'momo':
      return process.env.MOMO_ENV !== 'production';
    case 'zalopay':
      return process.env.ZALOPAY_ENV !== 'production';
    case 'vnpay':
      return process.env.VNPAY_ENV !== 'production';
    default:
      return true;
  }
}

function getProviderApi(provider) {
  const spec = PROVIDER_API[provider];
  if (!spec) return null;
  const mode = isSandbox(provider) ? 'sandbox' : 'production';
  return {
    provider,
    mode,
    configured: isProviderConfigured(provider),
    endpoints: spec[mode],
    requiredEnv: spec.envKeys,
  };
}

function listProviderApis() {
  return Object.keys(PROVIDER_API).map((id) => getProviderApi(id));
}

module.exports = { PROVIDER_API, getProviderApi, listProviderApis, isSandbox };
