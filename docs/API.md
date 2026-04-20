# BB Enterprise API

Base URL (development): `http://localhost:5000/api`

Unless noted, send JSON with header `Content-Type: application/json`. Authenticated routes require:

```http
Authorization: Bearer <JWT>
```

---

## Health

| Method | Path | Description |
|--------|------|---------------|
| GET | `/health` | Service status |

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Body: `name`, `email`, `password`. Returns user + JWT. |
| POST | `/auth/login` | No | Body: `email`, `password`. Returns user + JWT. |
| POST | `/auth/forgot-password` | No | Body: `email`. Sends reset email if configured. |
| POST | `/auth/reset-password/:token` | No | Body: `password`. |

---

## Users

All routes require **Bearer JWT**.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/profile` | Current user (includes wishlist). |
| PUT | `/users/profile` | Update `name`, `phone`, `address`, `avatar`. |
| GET | `/users/wishlist` | Wishlist products. |
| POST | `/users/wishlist/:productId` | Add to wishlist. |
| DELETE | `/users/wishlist/:productId` | Remove from wishlist. |

---

## Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | List categories. |
| GET | `/categories/:slug` | No | Category by slug. |
| POST | `/categories` | Admin | Create (`name`, `slug?`, `description`, `image`). |
| PUT | `/categories/:id` | Admin | Update. |
| DELETE | `/categories/:id` | Admin | Delete. |

---

## Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | No | Query: `page`, `limit`, `keyword`, `category`, `featured`, `minPrice`, `maxPrice`, `sort`, `order`. |
| GET | `/products/featured` | No | Featured products. |
| GET | `/products/id/:id` | No | By MongoDB id. |
| GET | `/products/:slug` | No | By slug (public, active only). |
| POST | `/products` | Admin | Create product. |
| PUT | `/products/:id` | Admin | Update. |
| DELETE | `/products/:id` | Admin | Delete. |

---

## Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | User | Body: `orderItems` (`productId`, `qty`), `shippingAddress`, optional `taxPrice`, `shippingPrice`. |
| GET | `/orders/my` | User | User’s orders. |
| GET | `/orders/:id` | User/Admin | Order detail (owner or admin). |
| GET | `/orders/all` | Admin | All orders. |
| PUT | `/orders/:id/status` | Admin | Body: `status` (`pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`). |

---

## Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reviews/product/:productId` | No | List reviews. |
| POST | `/reviews` | User | Body: `product`, `rating` (1–5), `comment`. |
| PUT | `/reviews/:id` | User | Update own review. |
| DELETE | `/reviews/:id` | User/Admin | Delete (owner or admin). |

---

## Upload (Cloudinary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload/image` | Admin | `multipart/form-data` field `image`. Returns `{ url, publicId }`. |
| POST | `/upload/images` | Admin | Field `images` (multiple). Returns `{ urls }`. |

---

## Payments (Stripe)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/create-checkout-session` | User | Body: same cart shape as order creation + `shippingAddress`, `taxPrice`, `shippingPrice`. Returns `{ url, sessionId, orderId }`. Redirects client to Stripe. |
| POST | `/payments/webhook` | Stripe | **Raw body** — Stripe signature only. Not for manual calls. |

---

## Admin

All routes require **Admin** role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Counts, recent orders, orders by status. |
| GET | `/admin/products` | All products (including inactive). |
| GET | `/admin/categories` | All categories. |
| GET | `/admin/users` | List users. |
| PUT | `/admin/users/:id/role` | Body: `role` (`user` or `admin`). |
| DELETE | `/admin/users/:id` | Delete user (not self). |

---

## Error format

```json
{
  "message": "Human-readable message",
  "stack": "...",
  "errors": [ { "field": "...", "msg": "..." } ]
}
```

Validation errors use `errors` when `express-validator` is involved.
