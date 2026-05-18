const { claim } = require('./idempotency');
const { updateOrderStatus, getOrder } = require('./orders');
const { logPaymentAttempt } = require('./logger');
const momo = require('./providers/momo');
const zalopay = require('./providers/zalopay');
const vnpay = require('./providers/vnpay');

function ack(res) {
  res.status(200).send('OK');
}

function handleMomoIpn(req, res) {
  const payload = req.body;
  if (!payload?.signature || !momo.verifyIpnSignature(payload)) {
    return res.status(400).json({ message: 'Invalid MoMo signature' });
  }

  const eventKey = `momo:${payload.transId || payload.requestId}`;
  if (!claim(eventKey)) return ack(res);

  const orderId = payload.orderId;
  const order = getOrder(orderId);
  if (!order) {
    logPaymentAttempt({
      provider: 'momo',
      amountVnd: Number(payload.amount) || 0,
      orderId,
      status: 'webhook_unknown_order',
    });
    return ack(res);
  }

  if (Number(payload.resultCode) === 0) {
    updateOrderStatus(orderId, 'paid', { providerTransId: String(payload.transId) });
    logPaymentAttempt({ provider: 'momo', amountVnd: order.amountVnd, orderId, status: 'paid' });
  } else {
    updateOrderStatus(orderId, 'failed', { failureMessage: payload.message });
    logPaymentAttempt({
      provider: 'momo',
      amountVnd: order.amountVnd,
      orderId,
      status: 'failed',
      message: payload.message,
    });
  }

  return ack(res);
}

function handleZalopayCallback(req, res) {
  const payload = req.body;
  if (!zalopay.verifyCallbackMac(payload)) {
    return res.status(400).json({ return_code: -1, return_message: 'mac not equal' });
  }

  const eventKey = `zalopay:${payload.app_trans_id}:${payload.status}`;
  if (!claim(eventKey)) {
    return res.json({ return_code: 1, return_message: 'success' });
  }

  const appTransId = String(payload.app_trans_id || '');
  const orderId = appTransId.includes('_') ? appTransId.slice(appTransId.indexOf('_') + 1) : appTransId;
  const order = getOrder(orderId);

  const resolvedOrderId = order?.orderId || orderId;
  const amountVnd = Number(payload.amount) || order?.amountVnd || 0;

  if (Number(payload.status) === 1) {
    if (order) updateOrderStatus(resolvedOrderId, 'paid', { providerTransId: payload.zp_trans_id });
    logPaymentAttempt({ provider: 'zalopay', amountVnd, orderId: resolvedOrderId, status: 'paid' });
  } else if (Number(payload.status) === 2) {
    if (order) updateOrderStatus(resolvedOrderId, 'refunded');
    logPaymentAttempt({ provider: 'zalopay', amountVnd, orderId: resolvedOrderId, status: 'refunded' });
  } else {
    if (order) updateOrderStatus(resolvedOrderId, 'failed');
    logPaymentAttempt({ provider: 'zalopay', amountVnd, orderId: resolvedOrderId, status: 'failed' });
  }

  return res.json({ return_code: 1, return_message: 'success' });
}

function handleVnpayIpn(req, res) {
  const query = req.query;
  if (!vnpay.verifyIpnQuery(query)) {
    return res.status(400).json({ RspCode: '97', Message: 'Invalid signature' });
  }

  const eventKey = `vnpay:${query.vnp_TxnRef}:${query.vnp_TransactionNo}`;
  if (!claim(eventKey)) {
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  }

  const orderId = query.vnp_TxnRef;
  const order = getOrder(orderId);
  const amountVnd = Number(query.vnp_Amount) / 100;

  if (query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00') {
    if (order) updateOrderStatus(orderId, 'paid', { providerTransId: query.vnp_TransactionNo });
    logPaymentAttempt({ provider: 'vnpay', amountVnd, orderId, status: 'paid' });
  } else {
    if (order) updateOrderStatus(orderId, 'failed', { failureMessage: query.vnp_ResponseCode });
    logPaymentAttempt({
      provider: 'vnpay',
      amountVnd,
      orderId,
      status: 'failed',
      message: query.vnp_ResponseCode,
    });
  }

  return res.json({ RspCode: '00', Message: 'Confirm Success' });
}

function handlePaypalWebhook(event) {
  const eventKey = `paypal:${event.id}`;
  if (!claim(eventKey)) return;

  const resource = event.resource || {};
  const orderId =
    resource.purchase_units?.[0]?.reference_id ||
    resource.custom_id ||
    resource.invoice_id;

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const amountVnd = Number(resource.amount?.value) || 0;
    if (orderId && getOrder(orderId)) {
      updateOrderStatus(orderId, 'paid', { providerTransId: resource.id });
    }
    logPaymentAttempt({
      provider: 'paypal',
      amountVnd,
      orderId: orderId || null,
      status: 'paid',
    });
  } else if (
    event.event_type === 'PAYMENT.CAPTURE.DENIED' ||
    event.event_type === 'CHECKOUT.ORDER.DECLINED'
  ) {
    if (orderId && getOrder(orderId)) updateOrderStatus(orderId, 'failed');
    logPaymentAttempt({
      provider: 'paypal',
      amountVnd: 0,
      orderId: orderId || null,
      status: 'failed',
      message: event.event_type,
    });
  } else if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
    if (orderId && getOrder(orderId)) updateOrderStatus(orderId, 'refunded');
    logPaymentAttempt({
      provider: 'paypal',
      amountVnd: 0,
      orderId: orderId || null,
      status: 'refunded',
    });
  }
}

module.exports = {
  handleMomoIpn,
  handleZalopayCallback,
  handleVnpayIpn,
  handlePaypalWebhook,
};
