const express = require('express');
const { PROVIDERS } = require('./constants');
const { parseAmountVnd, sanitizeDonor, parseProvider } = require('./validate');
const { getBaseUrl, isProviderConfigured } = require('./config');
const { paymentRateLimit } = require('./rateLimit');
const { logPaymentAttempt } = require('./logger');
const { createOrder, updateOrderStatus, getOrder } = require('./orders');
const { listProviderApis, getProviderApi } = require('./provider-api');
const { initiate } = require('./providers');
const paypal = require('./providers/paypal');
const vnpay = require('./providers/vnpay');
const {
  handleMomoIpn,
  handleZalopayCallback,
  handleVnpayIpn,
} = require('./webhooks');

const apiRouter = new express.Router();

apiRouter.get('/payments/methods', (_req, res) => {
  const methods = [
    { id: 'paypal', label: 'PayPal' },
    { id: 'momo', label: 'MoMo' },
    { id: 'zalopay', label: 'ZaloPay' },
    { id: 'vnpay', label: 'VNPay' },
    { id: 'bank_transfer', label: 'Bank transfer' },
  ].map((m) => ({
    ...m,
    configured: isProviderConfigured(m.id),
    api: getProviderApi(m.id),
  }));

  res.json({
    currency: 'VND',
    methods: methods.filter((m) => m.configured),
    allMethods: methods,
  });
});

apiRouter.get('/payments/config', (_req, res) => {
  res.json({ providers: listProviderApis() });
});

apiRouter.get('/payments/orders/:orderId', (req, res) => {
  const order = getOrder(req.params.orderId);
  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found.' });
  }
  return res.json({
    orderId: order.orderId,
    provider: order.provider,
    amountVnd: order.amountVnd,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    donor: order.donor,
  });
});

async function initiatePaymentForProvider(provider, req, res) {
  let order;
  try {
    if (!isProviderConfigured(provider)) {
      return res.status(503).json({
        code: 'PROVIDER_NOT_CONFIGURED',
        message: `${provider} is not configured. Add credentials to your .env file.`,
      });
    }

    const amountVnd = parseAmountVnd(req.body.amountVnd ?? req.body.amount);
    if (amountVnd === null) {
      return res.status(400).json({
        code: 'INVALID_AMOUNT',
        message: 'Enter a valid donation amount in VND (whole numbers only).',
      });
    }

    const donorResult = sanitizeDonor(req.body);
    if (donorResult.error) {
      return res.status(400).json({
        code: 'INVALID_DONOR',
        message: donorResult.error,
      });
    }

    const baseUrl = getBaseUrl(req);
    order = createOrder({ provider, amountVnd, donor: donorResult });

    logPaymentAttempt({
      provider,
      amountVnd,
      orderId: order.orderId,
      status: 'initiated',
    });

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    const result = await initiate(provider, { order, baseUrl, clientIp });

    if (result.providerOrderId) {
      updateOrderStatus(order.orderId, 'pending', {
        providerOrderId: result.providerOrderId,
      });
    }

    if (provider === 'bank_transfer') {
      updateOrderStatus(order.orderId, 'awaiting_transfer');
      logPaymentAttempt({
        provider,
        amountVnd,
        orderId: order.orderId,
        status: 'awaiting_transfer',
      });
      return res.json({
        orderId: order.orderId,
        provider,
        bankDetails: result.bankDetails,
      });
    }

    return res.json({
      orderId: order.orderId,
      provider,
      redirectUrl: result.redirectUrl,
    });
  } catch (err) {
    console.error('[payment] initiate error:', err.message);
    if (order?.orderId) {
      try {
        updateOrderStatus(order.orderId, 'failed', { failureMessage: err.message });
      } catch {
        // ignore secondary failure
      }
    }
    return res.status(502).json({
      code: 'PAYMENT_INIT_FAILED',
      message: err.message || 'Could not start payment. Please try again.',
    });
  }
}

// Generic initiation (kept for backward compatibility)
apiRouter.post('/payments/create', paymentRateLimit, async (req, res) => {
  const provider = parseProvider(req.body.provider);
  if (!provider) {
    return res.status(400).json({
      code: 'INVALID_PROVIDER',
      message: `Payment method must be one of: ${PROVIDERS.join(', ')}`,
    });
  }
  return initiatePaymentForProvider(provider, req, res);
});

// One endpoint per provider (explicit initiation routes)
apiRouter.post(
  '/payments/paypal/initiate',
  paymentRateLimit,
  async (req, res) => initiatePaymentForProvider('paypal', req, res)
);
apiRouter.post(
  '/payments/momo/initiate',
  paymentRateLimit,
  async (req, res) => initiatePaymentForProvider('momo', req, res)
);
apiRouter.post(
  '/payments/zalopay/initiate',
  paymentRateLimit,
  async (req, res) => initiatePaymentForProvider('zalopay', req, res)
);
apiRouter.post(
  '/payments/vnpay/initiate',
  paymentRateLimit,
  async (req, res) => initiatePaymentForProvider('vnpay', req, res)
);
apiRouter.post(
  '/payments/bank_transfer/initiate',
  paymentRateLimit,
  async (req, res) => initiatePaymentForProvider('bank_transfer', req, res)
);

apiRouter.post('/webhooks/momo', handleMomoIpn);
apiRouter.post(
  '/webhooks/zalopay',
  express.urlencoded({ extended: false }),
  express.json(),
  handleZalopayCallback
);
apiRouter.get('/webhooks/vnpay', handleVnpayIpn);

async function handleDonationReturn(req, res) {
  const provider = String(req.query.provider || '');
  const orderId = String(req.query.orderId || '');
  const order = orderId ? getOrder(orderId) : null;
  const baseUrl = getBaseUrl(req);
  const homeLink = `${baseUrl}/#/donations`;

  let status = 'pending';
  let message = 'Your payment is being processed.';

  try {
    if (provider === 'paypal' && (req.query.token || order?.providerOrderId)) {
      const paypalOrderId = req.query.token || order?.providerOrderId;
      if (paypalOrderId) {
        const { ok, body } = await paypal.captureOrder(paypalOrderId);
        if (ok && body.status === 'COMPLETED') {
          updateOrderStatus(orderId, 'paid', { providerTransId: body.id });
          status = 'success';
          message = 'Thank you! Your PayPal donation was completed.';
        } else {
          updateOrderStatus(orderId, 'failed', {
            failureMessage: body?.message || 'PayPal capture failed',
          });
          status = 'failed';
          message = 'PayPal could not complete this payment.';
        }
      }
    } else if (provider === 'momo') {
      if (Number(req.query.resultCode) === 0) {
        updateOrderStatus(orderId, 'paid');
        status = 'success';
        message = 'Thank you! Your MoMo payment was successful.';
      } else if (req.query.resultCode) {
        updateOrderStatus(orderId, 'failed', {
          failureMessage: req.query.message || 'MoMo payment failed',
        });
        status = 'failed';
        message = req.query.message || 'MoMo payment was not completed.';
      }
    } else if (provider === 'vnpay') {
      if (vnpay.verifyReturn(req.query) && req.query.vnp_ResponseCode === '00') {
        updateOrderStatus(orderId, 'paid', { providerTransId: req.query.vnp_TransactionNo });
        status = 'success';
        message = 'Thank you! Your VNPay payment was successful.';
      } else {
        updateOrderStatus(orderId, 'failed', {
          failureMessage: req.query.vnp_ResponseCode || 'VNPay declined',
        });
        status = 'failed';
        message = 'VNPay payment was cancelled or declined.';
      }
    } else if (provider === 'zalopay') {
      if (Number(req.query.status) === 1 || req.query.return_code === '1') {
        updateOrderStatus(orderId, 'paid');
        status = 'success';
        message = 'Thank you! Your ZaloPay payment was successful.';
      } else if (req.query.status || req.query.return_code) {
        updateOrderStatus(orderId, 'failed');
        status = 'failed';
        message = 'ZaloPay payment was not completed.';
      }
    } else if (order?.status === 'paid') {
      status = 'success';
      message = 'Thank you! Your donation was received.';
    }
  } catch (err) {
    console.error('[payment] return error:', err.message);
    status = 'failed';
    message = 'We could not confirm your payment. Contact us if you were charged.';
  }

  const amountLabel = order
    ? `${order.amountVnd.toLocaleString('vi-VN')} ₫`
    : '';

  res.send(renderResultPage({ status, message, orderId, amountLabel, homeLink }));
}

function renderResultPage({ status, message, orderId, amountLabel, homeLink }) {
  const icon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '⏳';
  const title =
    status === 'success'
      ? 'Donation successful'
      : status === 'failed'
        ? 'Payment failed'
        : 'Payment pending';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - iCUE</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 560px; margin: 48px auto; padding: 24px; text-align: center; background: #f8fafc; }
    .card { background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 1.5rem; color: #1e293b; margin-bottom: 12px; }
    p { color: #475569; line-height: 1.6; }
    .amount { font-size: 1.25rem; font-weight: 700; color: #052f71; margin: 12px 0; }
    .meta { font-size: 0.875rem; color: #64748b; }
    a.btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #1d9ae7; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    ${amountLabel ? `<p class="amount">${amountLabel}</p>` : ''}
    <p>${message}</p>
    ${orderId ? `<p class="meta">Reference: ${orderId}</p>` : ''}
    <a class="btn" href="${homeLink}">Back to donations</a>
  </div>
</body>
</html>`;
}

const pagesRouter = new express.Router();
pagesRouter.get('/donations/return', handleDonationReturn);

module.exports = { apiRouter, pagesRouter, handleDonationReturn, renderResultPage };
