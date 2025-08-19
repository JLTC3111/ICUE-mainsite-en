const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, frequency, firstName, lastName, email, phone, company } = req.body;

    // Validate required fields
    if (!amount || !frequency || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create customer in Stripe (optional but recommended for subscriptions)
    const customer = await stripe.customers.create({
      email: email,
      name: `${firstName} ${lastName}`,
      phone: phone || '',
      metadata: {
        company: company || '',
      }
    });

    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Donation to ICUE`,
            description: `Thank you for supporting ICUE with your ${frequency} donation!`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: {
        donor_name: `${firstName} ${lastName}`,
        donor_email: email,
        frequency: frequency,
        amount: amount.toString(),
      }
    };

    // Handle recurring donations
    if (frequency !== 'one-time') {
      sessionConfig.mode = 'subscription';
      sessionConfig.line_items[0].price_data.recurring = {
        interval: frequency === 'yearly' ? 'year' : 'month'
      };
    } else {
      sessionConfig.mode = 'payment';
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Success page endpoint
app.get('/success', async (req, res) => {
  const { session_id } = req.query;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Successful - ICUE</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          .success-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success-icon {
            font-size: 60px;
            color: #4CAF50;
            margin-bottom: 20px;
          }
          h1 { color: #333; }
          .amount { font-size: 24px; color: #4CAF50; font-weight: bold; }
          .details { margin: 20px 0; color: #666; }
          .btn {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="success-container">
          <div class="success-icon">✅</div>
          <h1>Thank You for Your Donation!</h1>
          <div class="amount">$${session.metadata.amount}</div>
          <div class="details">
            <p><strong>Donation Type:</strong> ${session.metadata.frequency}</p>
            <p><strong>Donor:</strong> ${session.metadata.donor_name}</p>
            <p><strong>Email:</strong> ${session.metadata.donor_email}</p>
          </div>
          <p>Your donation helps us continue our important work. You will receive an email confirmation shortly.</p>
          <a href="/" class="btn">Return to Home</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.send(`
      <h1>Thank You!</h1>
      <p>Your donation was successful. You will receive an email confirmation shortly.</p>
      <a href="/">Return to Home</a>
    `);
  }
});

// Cancel page endpoint
app.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Donation Cancelled - ICUE</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          text-align: center;
          background-color: #f9f9f9;
        }
        .cancel-container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .cancel-icon {
          font-size: 60px;
          color: #f44336;
          margin-bottom: 20px;
        }
        h1 { color: #333; }
        .btn {
          background: #007cba;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="cancel-container">
        <div class="cancel-icon">❌</div>
        <h1>Donation Cancelled</h1>
        <p>Your donation was cancelled. No charges were made to your card.</p>
        <p>If you'd like to try again or have any questions, please don't hesitate to contact us.</p>
        <a href="/" class="btn">Try Again</a>
      </div>
    </body>
    </html>
  `);
});

// Webhook endpoint for Stripe events (optional but recommended)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object);
      // Handle successful payment (send confirmation email, update database, etc.)
      break;
    case 'invoice.payment_succeeded':
      console.log('Subscription payment succeeded:', event.data.object);
      // Handle successful subscription payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view your donation page`);
});
