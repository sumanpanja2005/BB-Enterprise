# BB Enterprise — Product Showcase & Reviews

Cosmetic website built with **React (Vite)**, **Node.js / Express**, and **MongoDB**. It is focused on showcasing products with stock visibility and reviews, plus a colorful responsive interface and cosmetic shop location highlights.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally or a connection string (e.g. MongoDB Atlas)
- Optional: [Stripe](https://stripe.com/) account (test keys), [Cloudinary](https://cloudinary.com/) account, SMTP for email

## Quick start

### 1. MongoDB

For MongoDB Atlas:

1. Create a cluster in Atlas and create a database user.
2. In Atlas, go to **Network Access** and allow your current IP (or `0.0.0.0/0` for testing only).
3. Copy your connection string from **Connect > Drivers**.
4. Set `MONGODB_URI` in `server/.env` like this:

```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@<cluster-name>.mongodb.net/bb_enterprise?retryWrites=true&w=majority&appName=<app-name>
```

If your password contains special characters, URL-encode it.

### 2. Backend

```bash
cd server
copy .env.example .env
```

Edit `server/.env`: set `MONGODB_URI`, `JWT_SECRET`, and optionally Stripe, Cloudinary, and email variables.

You can generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
npm install
npm run seed
npm run dev
```

The API listens on **http://localhost:5000** by default.

- **Demo admin** (after seed): `admin@bbenterprise.com` / `Admin123!`

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend.

### 4. Stripe (checkout)

1. Create a [Stripe](https://dashboard.stripe.com/) account and copy **Secret key** and **Webhook signing secret**.
2. Add them to `server/.env` as `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
3. For local webhooks, use [Stripe CLI](https://stripe.com/docs/stripe-cli):  
   `stripe listen --forward-to localhost:5000/api/payments/webhook`  
   Use the printed webhook secret in `.env`.

Without Stripe, login and browsing still work; checkout returns an error until keys are set.

### 5. Cloudinary (product image upload)

Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to `server/.env`. Without them, the API rejects uploads; you can still paste image URLs manually in the admin product form.

### 6. Email

Set `EMAIL_USER` and `EMAIL_PASS` (e.g. Gmail app password) for password reset and order emails. If omitted, the API logs a warning and skips sending.

## Project structure

```
├── client/          # React (Vite) SPA
│   └── src/
│       ├── api/     # Axios instance
│       ├── context/ # Auth + cart state
│       ├── components/
│       └── pages/
├── server/          # Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── seed/
└── docs/
    └── API.md       # REST API reference
```

## Production build

```bash
cd client && npm run build
```

Serve `client/dist` with any static host and set `CLIENT_URL` and `VITE_API_URL` (or put the API behind the same origin).

## License

MIT — use freely for learning and projects.
