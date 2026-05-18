const crypto = require('crypto');
const querystring = require('querystring');

const VNPAY_HOST =
  process.env.VNPAY_ENV === 'production'
    ? 'https://vnpayment.vn'
    : 'https://sandbox.vnpayment.vn';

function sortAndSign(params, secret) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();
  const signData = sorted.map((k) => `${k}=${params[k]}`).join('&');
  const secureHash = crypto.createHmac('sha512', secret).update(signData, 'utf8').digest('hex');
  return { signData, secureHash };
}

function verifyReturn(params) {
  const secret = process.env.VNPAY_HASH_SECRET;
  const received = params.vnp_SecureHash;
  const clone = { ...params };
  delete clone.vnp_SecureHash;
  delete clone.vnp_SecureHashType;
  const { secureHash } = sortAndSign(clone, secret);
  return secureHash === received;
}

async function createPayment({ order, baseUrl, clientIp }) {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secret = process.env.VNPAY_HASH_SECRET;
  const returnUrl =
    process.env.VNPAY_RETURN_URL ||
    `${baseUrl}/donations/return?provider=vnpay&orderId=${encodeURIComponent(order.orderId)}`;
  const ipnUrl = process.env.VNPAY_IPN_URL || `${baseUrl}/api/webhooks/vnpay`;

  const createDate = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const vnp_CreateDate = `${createDate.getFullYear()}${pad(createDate.getMonth() + 1)}${pad(createDate.getDate())}${pad(createDate.getHours())}${pad(createDate.getMinutes())}${pad(createDate.getSeconds())}`;

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(order.amountVnd * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: order.orderId,
    vnp_OrderInfo: `ICUE donation ${order.orderId}`.slice(0, 255),
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: clientIp || '127.0.0.1',
    vnp_CreateDate,
  };

  const { secureHash } = sortAndSign(params, secret);
  params.vnp_SecureHash = secureHash;

  const paymentUrl = `${VNPAY_HOST}/paymentv2/vpcpay.html?${querystring.stringify(params)}`;

  return { redirectUrl: paymentUrl, providerOrderId: order.orderId, ipnUrl };
}

function verifyIpnQuery(query) {
  return verifyReturn(query);
}

module.exports = { createPayment, verifyReturn, verifyIpnQuery, VNPAY_HOST };
