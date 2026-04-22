import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4242);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = new Set([
  frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]);

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe checkout endpoint will fail until it is set.');
}

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set on the server');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Allow non-browser tools (curl/postman) and configured frontend origins.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

function toStripeLineItem(item) {
  const baseName = item?.title || item?.name || 'Product';
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const amount = Math.max(1, Math.round(Number(item?.price || 0) * 100));
  const size = item?.selectedSize || item?.size || null;
  const rawColor = item?.selectedColor || item?.color || null;
  const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;
  const variantLabel = [size ? `Size ${size}` : null, color ? `Color ${color}` : null]
    .filter(Boolean)
    .join(' | ');
  
  const details = [
    variantLabel,
  ].filter(Boolean);


  return {
    price_data: {
      currency: 'gbp',
      unit_amount: amount,
      product_data: {
        name: baseName,
        description: details.join(' - ').slice(0, 500) || undefined,
        metadata: {
          slug: String(item?.slug || ''),
          size: String(size || ''),
          color: String(color || ''),
        },
      },
    },
    quantity,
  };
}

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripeClient();
    const {
      items = [],
      email,
      shippingMethod = 'standard',
      shipping = 0,
      firstName,
      lastName,
      phone,
      address1,
      address2,
      city,
      postcode,
      country,
      notes,
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const lineItems = items.map(toStripeLineItem);
    const shippingAmount = Math.max(0, Math.round(Number(shipping || 0) * 100));

    if (shippingAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          unit_amount: shippingAmount,
          product_data: {
            name: shippingMethod === 'express' ? 'Express shipping' : 'Standard shipping',
          },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${frontendUrl}/Checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/Checkout?payment=cancelled`,
      customer_email: email,
      metadata: {
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        address1: address1 || '',
        address2: address2 || '',
        city: city || '',
        postcode: postcode || '',
        country: country || '',
        notes: notes || '',
      },
    });

    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    return res.status(500).json({ error: 'Unable to create Stripe checkout session.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Stripe API listening on http://localhost:${port}`);
});
