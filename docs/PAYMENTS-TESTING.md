# Payment testing guide (sandbox)

## Local webhooks (ngrok)

1. Start the server: `npm run server`
2. Install and run [ngrok](https://ngrok.com/): `ngrok http 3000`
3. Set `APP_BASE_URL` in `.env` to the ngrok HTTPS URL (e.g. `https://abc123.ngrok-free.app`)
4. Register webhook URLs in each provider portal:
   - MoMo IPN: `{APP_BASE_URL}/api/webhooks/momo`
   - ZaloPay: `{APP_BASE_URL}/api/webhooks/zalopay`
   - VNPay IPN: `{APP_BASE_URL}/api/webhooks/vnpay`
   - PayPal: `{APP_BASE_URL}/api/webhooks/paypal`

Watch server logs for `[payment]` JSON lines.

---

## PayPal (sandbox)

**Credentials:** [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) → Sandbox app → Client ID & Secret.

| Step | Action |
|------|--------|
| Success | Create donation → PayPal → log in with **sandbox personal** account → approve |
| Failure | Use an account with insufficient balance or cancel on PayPal |
| Webhook | Dashboard → Webhooks → subscribe to `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED` |

Sandbox buyers are created under **Sandbox → Accounts** (not real card numbers).

---

## MoMo (test)

**Credentials:** [MoMo M4B portal](https://business.momo.vn/) → Payment Integration Center (test environment).

| Step | Action |
|------|--------|
| Success | Complete payment in MoMo test app / redirect with `resultCode=0` |
| Failure | Cancel in app or use invalid test flow → non-zero `resultCode` |
| Webhook | MoMo POSTs IPN to `MOMO_IPN_URL` with signed body |

Sandbox host: `https://test-payment.momo.vn`

---

## ZaloPay (sandbox)

**Credentials:** [sbmc.zalopay.vn](https://sbmc.zalopay.vn/) or trial AppID `554` with keys from docs.

| Step | Action |
|------|--------|
| Success | Pay in **ZaloPay Sandbox** app; status `1` in callback |
| Failure | Cancel payment; status ≠ `1` |
| Webhook | Callback POST to `ZALOPAY_CALLBACK_URL` with `mac` |

---

## VNPay (sandbox)

**Credentials:** [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn/) merchant portal → TMN code + hash secret.

| Step | Action |
|------|--------|
| Success | Use [sandbox test cards](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html) → `vnp_ResponseCode=00` |
| Failure | Cancel on payment page or use declined test card |
| Webhook | VNPay calls `VNPAY_IPN_URL` (GET query params + secure hash) |

Amount rule: `vnp_Amount` = VND × 100 (server handles this).

---

## Bank transfer

| Step | Action |
|------|--------|
| “Success” | Submit form → bank details panel with reference `ICUE-DONATE-{orderId}` |
| Confirm | Manually mark paid in your ops process (no webhook) |

---

## Verify outcomes

- Browser: `/donations/return?provider=...&orderId=...`
- Disk: `data/orders.json` status (`pending` → `paid` / `failed` / `awaiting_transfer`)
- Logs: `[payment]` lines in server stdout
