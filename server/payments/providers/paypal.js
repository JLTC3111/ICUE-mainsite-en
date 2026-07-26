const { getProviderApi } = require('../provider-api');

function getPaypalApiBase() {
  return getProviderApi('paypal').endpoints.apiBase;
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${getPaypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function createPayment({ order, baseUrl }) {
  const token = await getAccessToken();
  const returnUrl = `${baseUrl}/donations/return?provider=paypal&orderId=${encodeURIComponent(order.orderId)}`;
  const cancelUrl = `${process.env.SITE_BASE_URL?.replace(/\/$/, '') || baseUrl}/donations?cancelled=1`;

  const res = await fetch(`${getPaypalApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.orderId,
          description: 'ICUE one-time donation',
          amount: {
            currency_code: 'VND',
            value: String(order.amountVnd),
          },
        },
      ],
      application_context: {
        brand_name: 'iCUE Vietnam',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    const detail = body?.details?.[0]?.description || body?.message || res.statusText;
    throw new Error(`PayPal order creation failed: ${detail}`);
  }

  const approveLink = (body.links || []).find((l) => l.rel === 'approve');
  if (!approveLink?.href) {
    throw new Error('PayPal did not return an approval URL.');
  }

  return {
    redirectUrl: approveLink.href,
    providerOrderId: body.id,
  };
}

async function captureOrder(paypalOrderId) {
  const token = await getAccessToken();
  const res = await fetch(`${getPaypalApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await res.json();
  return { ok: res.ok, body };
}

async function verifyWebhookSignature(reqHeaders, webhookEvent) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error('Missing PAYPAL_WEBHOOK_ID for PayPal webhook verification.');
  }

  const transmissionId = reqHeaders['paypal-transmission-id'];
  const transmissionTime = reqHeaders['paypal-transmission-time'];
  const certUrl = reqHeaders['paypal-cert-url'];
  const authAlgo = reqHeaders['paypal-auth-algo'];
  const transmissionSig = reqHeaders['paypal-transmission-sig'];

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    throw new Error('Missing PayPal webhook signature headers.');
  }

  const token = await getAccessToken();
  const res = await fetch(
    `${getPaypalApiBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_event: webhookEvent,
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `PayPal webhook verification HTTP ${res.status}: ${data?.message || res.statusText}`
    );
  }

  if (data?.verification_status !== 'SUCCESS') {
    throw new Error(
      `PayPal webhook verification failed: ${data?.verification_status || 'UNKNOWN'}`
    );
  }

  return data;
}

module.exports = { createPayment, captureOrder, getPaypalApiBase, verifyWebhookSignature };
