Welcome to your Base44 project.

## About

View and edit your app on [Base44.com](http://Base44.com).

This project contains everything you need to run your app locally.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies:

```bash
npm install
```

## Environment Variables

Create a local env file at `.env.local` in the project root.

Frontend variables (safe for browser):

```env
VITE_BASE44_APP_ID=69a360b5d01250f7bbc90fea
VITE_BASE44_APP_BASE_URL=http://192.168.1.161:5173/
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_API_BASE_URL=http://localhost:4242
```

Backend variables (do not put these in frontend code):

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
FRONTEND_URL=http://localhost:5173
PORT=4242
```

You can keep backend variables in `.env.local` for local development because they are only read by `server/index.js` on the Node server.

## Run Locally

Run the frontend:

```bash
npm run dev
```

Run the Stripe backend endpoint in a second terminal:

```bash
npm run dev:server
```

Run frontend on local IP (if needed):

```bash
npm run dev -- --host
```

## Stripe Checkout

The checkout page posts order data to `POST /api/create-checkout-session` on the local server, then redirects the user to Stripe Checkout.

API server file:

- `server/index.js`

## Publish Changes

Open [Base44.com](http://Base44.com) and click Publish.

## Docs and Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

## Colour Scheme From Logo

- `#161616` Dull Black
- `#3b3b3b` Rich Grey