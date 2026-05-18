# iCUE Vietnam — English main site

Vite SPA with hash routing (`#/donations`, `#/aboutUs`, …) and an Express server for payments and static assets.

## Quick start

```bash
npm install
cp .env.example .env   # add provider credentials
npm run server         # http://localhost:3000
```

For frontend-only dev with API proxy:

```bash
npm run server         # terminal 1 — port 3000
npm run dev            # terminal 2 — Vite proxies /api → 3000
```

Open `http://localhost:3000/#/donations` to use the donation form.

## Payments

Integrated providers (one-time donations, **VND**):

| Provider | Role |
|----------|------|
| **MoMo** | E-wallet redirect + IPN webhook |
| **ZaloPay** | E-wallet redirect + callback webhook |
| **VNPay** | Card/bank redirect + IPN webhook |
| **PayPal** | International cards/wallets (VND) + webhook |
| **Bank transfer** | Manual instructions (no automatic capture) |

### Configuration

1. Copy `.env.example` to `.env`.
2. Fill credentials for each provider you enable (see comments in `.env.example`).
3. Set `APP_BASE_URL` to your public HTTPS URL in production (required for return URLs and webhooks).

### Test vs production

| Provider | Sandbox / test | Production |
|----------|----------------|------------|
| MoMo | `MOMO_ENV=test`, host `test-payment.momo.vn` | `MOMO_ENV=production` |
| ZaloPay | `ZALOPAY_ENV=sandbox` | `ZALOPAY_ENV=production` |
| VNPay | `VNPAY_ENV=sandbox` | `VNPAY_ENV=production` |
| PayPal | `PAYPAL_MODE=sandbox` | `PAYPAL_MODE=live` |

Only methods with complete env vars are returned from `GET /api/payments/methods`; the donations UI hides unconfigured providers.

### Database (SQLite)

Donations are stored in **`data/icue-payments.sqlite`** (override with `DATABASE_PATH` in `.env`).

| Table | Purpose |
|-------|---------|
| `donors` | Email, name, phone, company (upserted by email) |
| `orders` | Amount, provider, status, provider transaction IDs |
| `payment_events` | Audit log (created, status changes, webhooks) |
| `webhook_receipts` | Idempotency keys for provider callbacks |

Migrations run automatically on server start. To apply manually:

```bash
npm run db:migrate
```

Inspect locally: `sqlite3 data/icue-payments.sqlite` → `SELECT * FROM orders;`

For production at scale, point `DATABASE_PATH` at a persistent volume or migrate the schema to PostgreSQL.

### API

- `GET /api/payments/methods` — configured methods + endpoint metadata
- `GET /api/payments/config` — provider API bases (sandbox vs production)
- `GET /api/payments/orders/:orderId` — order + donor status
- `POST /api/payments/create` — start payment (rate-limited)
- `GET /donations/return` — user return after redirect
- Webhooks: `/api/webhooks/momo`, `/api/webhooks/zalopay`, `/api/webhooks/vnpay`, `/api/webhooks/paypal`

### Known limitations

- **VNPay / MoMo** — merchant registration and URL whitelisting required.
- **PayPal** — account must support VND; business verification may apply.
- **Bank transfer** — donations stay `awaiting_transfer` until confirmed manually.

See [docs/PAYMENTS-TESTING.md](docs/PAYMENTS-TESTING.md) for sandbox test steps.

## Legacy Stripe

The previous Stripe Checkout flow (`README-STRIPE.md`) is replaced by the VN payment stack. Stripe env vars remain in `.env.example` for reference only.
