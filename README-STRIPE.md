# ICUE Donation Site - Stripe Integration Setup

## Quick Start

1. **Get Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from the dashboard

2. **Setup Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file and add your Stripe keys
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Server**
   ```bash
   # Development mode (auto-restart on changes)
   npm run server-dev
   
   # Or production mode
   npm run server
   ```

5. **Visit Your Site**
   - Open http://localhost:3000 in your browser
   - Test the donation form with Stripe test cards

## Stripe Test Cards

Use these test card numbers for testing:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

## Configuration

### Environment Variables
Edit `.env` file with your Stripe keys:
```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Webhooks (Optional)
For production, set up webhooks in your Stripe dashboard:
1. Add endpoint: `https://yoursite.com/webhook`
2. Select events: `payment_intent.succeeded`, `invoice.payment_succeeded`
3. Add webhook secret to `.env`

## Going Live

1. **Get Live Keys**
   - Switch to live mode in Stripe dashboard
   - Get live API keys (start with `sk_live_` and `pk_live_`)

2. **Update Environment**
   - Replace test keys with live keys in production `.env`
   - Set `NODE_ENV=production`

3. **Deploy**
   - Deploy to your hosting platform (Heroku, Vercel, etc.)
   - Ensure environment variables are set on your hosting platform

## Features

- ✅ One-time donations
- ✅ Recurring donations (monthly/yearly)
- ✅ Stripe Checkout integration
- ✅ Customer creation
- ✅ Success/cancel pages
- ✅ Webhook support
- ✅ Responsive design
- ✅ Error handling

## Security

- Never commit `.env` file
- Use HTTPS in production
- Validate all inputs on backend
- Use webhook secrets for verification
