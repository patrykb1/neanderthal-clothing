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
        // attempt to include an image for Stripe Checkout (absolute URL required)
        images: (() => {
          const candidate = (item && (item.images && item.images[0])) || item?.image || null;
          if (!candidate) return undefined;
          if (/^https?:\/\//i.test(candidate)) return [candidate];
          if (frontendUrl) return [`${String(frontendUrl).replace(/\/$/, '')}/${String(candidate).replace(/^\//, '')}`];
          return undefined;
        })(),
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

    const shippingOptions = [];
    if (shippingAmount > 0) {
      const isExpress = shippingMethod === 'express';
      shippingOptions.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: shippingAmount,
            currency: 'gbp',
          },
          display_name: isExpress ? 'Express shipping' : 'Standard shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: isExpress ? 1 : 3,
            },
            maximum: {
              unit: 'business_day',
              value: isExpress ? 2 : 5,
            },
          },
        },
      });
    }

    const sessionConfig = {
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
    };

    if (shippingOptions.length > 0) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['GB', 'US', 'IE', 'CA', 'AU'],
      };
      sessionConfig.shipping_options = shippingOptions;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    return res.status(500).json({ error: 'Unable to create Stripe checkout session.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Admin authentication endpoints (server-side)
app.post('/api/admin-login', (req, res) => {
  const password = req.body && req.body.password;
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured on the server' });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    res.cookie('admin-auth', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

app.post('/api/admin-logout', (_req, res) => {
  res.cookie('admin-auth', '', { httpOnly: true, maxAge: 0 });
  return res.json({ ok: true });
});

app.get('/api/admin-check', (req, res) => {
  const cookieHeader = req.headers && req.headers.cookie;
  const authenticated = Boolean(cookieHeader && cookieHeader.includes('admin-auth=true'));
  return res.json({ authenticated });
});

app.listen(port, () => {
  console.log(`Stripe API listening on http://localhost:${port}`);
});
