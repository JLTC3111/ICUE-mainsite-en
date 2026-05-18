const PAYPAL_API =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
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
  const cancelUrl = `${baseUrl}/#/donations?cancelled=1`;

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
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
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await res.json();
  return { ok: res.ok, body };
}

module.exports = { createPayment, captureOrder, PAYPAL_API };
