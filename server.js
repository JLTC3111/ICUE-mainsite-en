const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./server/db/client');
const { apiRouter, pagesRouter } = require('./server/payments/routes');
const { handlePaypalWebhook } = require('./server/payments/webhooks');
const paypal = require('./server/payments/providers/paypal');

initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

async function handlePaypalWebhookRoute(req, res) {
  try {
    const event = JSON.parse(req.body.toString('utf8'));
    // Verify signature via PayPal REST endpoint before processing.
    await paypal.verifyWebhookSignature(req.headers, event);
    handlePaypalWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('[webhook] PayPal parse error:', err.message);
    res.status(400).send('Invalid payload');
  }
}

app.post(
  '/api/webhooks/paypal',
  express.raw({ type: 'application/json' }),
  handlePaypalWebhookRoute
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticOpts = {
  index: false,
  dotfiles: 'deny',
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
};
app.use('/public', express.static(path.join(ROOT, 'public'), staticOpts));
app.use('/src', express.static(path.join(ROOT, 'src'), staticOpts));
app.get('/styles.css', (_req, res) => {
  res.sendFile(path.join(ROOT, 'styles.css'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use('/api', apiRouter);
app.use(pagesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} and open #/donations to donate`);
});
