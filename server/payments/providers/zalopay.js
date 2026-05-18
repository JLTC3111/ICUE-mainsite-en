const crypto = require('crypto');

const ZALOPAY_CREATE_URL =
  process.env.ZALOPAY_ENV === 'production'
    ? 'https://openapi.zalopay.vn/v2/create'
    : 'https://sb-openapi.zalopay.vn/v2/create';

function buildMac(payload) {
  const data =
    `${payload.app_id}|${payload.app_trans_id}|${payload.app_user}|` +
    `${payload.amount}|${payload.app_time}|${payload.embed_data}|${payload.item}`;
  return crypto.createHmac('sha256', process.env.ZALOPAY_KEY1).update(data).digest('hex');
}

function verifyCallbackMac(payload) {
  const data =
    `${payload.app_id}|${payload.app_trans_id}|${payload.pmc_id}|` +
    `${payload.bank_code}|${payload.amount}|${payload.discount_amount}|` +
    `${payload.status}`;
  const expected = crypto
    .createHmac('sha256', process.env.ZALOPAY_KEY2)
    .update(data)
    .digest('hex');
  return expected === payload.mac;
}

async function createPayment({ order, baseUrl }) {
  const appId = Number(process.env.ZALOPAY_APP_ID);
  const appTime = Date.now();
  const appTransId = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}_${order.orderId}`;
  const embedData = JSON.stringify({ redirecturl: `${baseUrl}/donations/return?provider=zalopay&orderId=${encodeURIComponent(order.orderId)}` });
  const item = JSON.stringify([{ itemid: 'donation', itemname: 'ICUE Donation', itemprice: order.amountVnd, itemquantity: 1 }]);

  const payload = {
    app_id: appId,
    app_user: order.donor.email.slice(0, 50),
    app_time: appTime,
    amount: order.amountVnd,
    app_trans_id: appTransId,
    embed_data: embedData,
    item,
    description: `ICUE donation ${order.orderId}`,
    bank_code: '',
    callback_url: process.env.ZALOPAY_CALLBACK_URL || `${baseUrl}/api/webhooks/zalopay`,
  };

  payload.mac = buildMac({
    app_id: payload.app_id,
    app_trans_id: payload.app_trans_id,
    app_user: payload.app_user,
    amount: payload.amount,
    app_time: payload.app_time,
    embed_data: payload.embed_data,
    item: payload.item,
  });

  const res = await fetch(ZALOPAY_CREATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(
      Object.entries(payload).map(([k, v]) => [k, String(v)])
    ),
  });

  const body = await res.json();
  if (body.return_code !== 1 || !body.order_url) {
    throw new Error(body.return_message || `ZaloPay error ${body.return_code}`);
  }

  return { redirectUrl: body.order_url, providerOrderId: appTransId };
}

module.exports = { createPayment, verifyCallbackMac };
