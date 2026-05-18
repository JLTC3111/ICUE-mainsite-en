const crypto = require('crypto');
const { getProviderApi } = require('../provider-api');

function getMomoApiBase() {
  return getProviderApi('momo').endpoints.apiBase;
}

function signCreateRequest(fields) {
  const raw =
    `accessKey=${fields.accessKey}` +
    `&amount=${fields.amount}` +
    `&extraData=${fields.extraData}` +
    `&ipnUrl=${fields.ipnUrl}` +
    `&orderId=${fields.orderId}` +
    `&orderInfo=${fields.orderInfo}` +
    `&partnerCode=${fields.partnerCode}` +
    `&redirectUrl=${fields.redirectUrl}` +
    `&requestId=${fields.requestId}` +
    `&requestType=${fields.requestType}`;
  return crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY).update(raw).digest('hex');
}

function verifyIpnSignature(payload) {
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const raw =
    `accessKey=${accessKey}` +
    `&amount=${payload.amount}` +
    `&extraData=${payload.extraData || ''}` +
    `&message=${payload.message}` +
    `&orderId=${payload.orderId}` +
    `&orderInfo=${payload.orderInfo}` +
    `&orderType=${payload.orderType}` +
    `&partnerCode=${payload.partnerCode}` +
    `&payType=${payload.payType}` +
    `&requestId=${payload.requestId}` +
    `&responseTime=${payload.responseTime}` +
    `&resultCode=${payload.resultCode}` +
    `&transId=${payload.transId}`;
  const expected = crypto
    .createHmac('sha256', process.env.MOMO_SECRET_KEY)
    .update(raw)
    .digest('hex');
  return expected === payload.signature;
}

async function createPayment({ order, baseUrl }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const requestId = order.orderId;
  const ipnUrl = process.env.MOMO_IPN_URL || `${baseUrl}/api/webhooks/momo`;
  const redirectUrl =
    process.env.MOMO_REDIRECT_URL ||
    `${baseUrl}/donations/return?provider=momo&orderId=${encodeURIComponent(order.orderId)}`;
  const extraData = Buffer.from(
    JSON.stringify({ email: order.donor.email })
  ).toString('base64');
  const orderInfo = `ICUE donation ${order.orderId}`;

  const fields = {
    accessKey,
    amount: String(order.amountVnd),
    extraData,
    ipnUrl,
    orderId: order.orderId,
    orderInfo,
    partnerCode,
    redirectUrl,
    requestId,
    requestType: 'captureWallet',
  };

  const signature = signCreateRequest(fields);

  const res = await fetch(`${getMomoApiBase()}${getProviderApi('momo').endpoints.createPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      partnerCode,
      partnerName: 'iCUE Vietnam',
      storeId: process.env.MOMO_STORE_ID || 'ICUE',
      requestId,
      amount: order.amountVnd,
      orderId: order.orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType: 'captureWallet',
      autoCapture: true,
      extraData,
      signature,
    }),
  });

  const body = await res.json();
  if (body.resultCode !== 0 || !body.payUrl) {
    throw new Error(body.message || `MoMo error code ${body.resultCode}`);
  }

  return { redirectUrl: body.payUrl, providerOrderId: body.requestId };
}

module.exports = { createPayment, verifyIpnSignature, getMomoApiBase };
