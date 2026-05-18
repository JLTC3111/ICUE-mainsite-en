function getBaseUrl(req) {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, '');
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}`;
}

function isProviderConfigured(provider) {
  switch (provider) {
    case 'paypal':
      return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
    case 'momo':
      return Boolean(
        process.env.MOMO_PARTNER_CODE &&
          process.env.MOMO_ACCESS_KEY &&
          process.env.MOMO_SECRET_KEY
      );
    case 'zalopay':
      return Boolean(
        process.env.ZALOPAY_APP_ID && process.env.ZALOPAY_KEY1 && process.env.ZALOPAY_KEY2
      );
    case 'vnpay':
      return Boolean(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET);
    case 'bank_transfer':
      return Boolean(
        process.env.BANK_TRANSFER_ACCOUNT_NUMBER && process.env.BANK_TRANSFER_BANK_NAME
      );
    default:
      return false;
  }
}

module.exports = { getBaseUrl, isProviderConfigured };
