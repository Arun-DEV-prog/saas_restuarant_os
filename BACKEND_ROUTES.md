# Backend Routes Documentation

**Base URL (Vercel):** `https://your-vercel-deployment.vercel.app/api`

> Replace `your-vercel-deployment` with your actual Vercel deployment domain

---

## Table of Contents

- [Authentication](#authentication)
- [Admin Routes](#admin-routes)
- [Orders](#orders)
- [Restaurants](#restaurants)
- [Tables](#tables)
- [Stripe Integration](#stripe-integration)
- [User Profile](#user-profile)
- [Public Routes](#public-routes)
- [Debug Routes](#debug-routes)
- [File Upload](#file-upload)

---

## Authentication

| Method     | Endpoint              | Description                     |
| ---------- | --------------------- | ------------------------------- |
| `GET/POST` | `/auth/[...nextauth]` | NextAuth authentication handler |
| `POST`     | `/auth/register`      | User registration endpoint      |

---

## Admin Routes

### Users Management

| Method           | Endpoint                 | Description       |
| ---------------- | ------------------------ | ----------------- |
| `GET/POST`       | `/admin/users/list`      | List all users    |
| `GET/PUT/DELETE` | `/admin/users/[id]/role` | Manage user roles |

### Restaurants Management

| Method                | Endpoint                   | Description               |
| --------------------- | -------------------------- | ------------------------- |
| `GET/POST/PUT/DELETE` | `/admin/restaurants/[id]`  | Manage restaurant details |
| `GET`                 | `/admin/restaurants/list`  | List all restaurants      |
| `GET/POST`            | `/admin/restaurants-plans` | Manage restaurant plans   |

### Tables Management

| Method                | Endpoint               | Description         |
| --------------------- | ---------------------- | ------------------- |
| `GET/POST/PUT/DELETE` | `/admin/tables`        | Manage tables       |
| `GET/POST/PUT/DELETE` | `/admin/tables/config` | Table configuration |

### Settings & Analytics

| Method     | Endpoint                    | Description        |
| ---------- | --------------------------- | ------------------ |
| `GET/POST` | `/admin/settings`           | Admin settings     |
| `GET`      | `/admin/system/stats`       | System statistics  |
| `GET`      | `/admin/analytics/overview` | Analytics overview |
| `GET`      | `/admin/activity/logs`      | Activity logs      |

---

## Orders

| Method           | Endpoint                   | Description                      |
| ---------------- | -------------------------- | -------------------------------- |
| `GET/POST`       | `/orders`                  | Create/list orders               |
| `GET/PUT/DELETE` | `/orders/[id]`             | Get/update/delete specific order |
| `POST`           | `/orders/calculate`        | Calculate order total            |
| `POST`           | `/orders/checkout`         | Process order checkout           |
| `POST`           | `/orders/orders/checkout`  | Alternative checkout endpoint    |
| `POST`           | `/orders/checkout-preview` | Preview checkout details         |
| `GET/POST`       | `/orders/test`             | Test orders endpoint             |
| `GET`            | `/debug/orders`            | Debug orders information         |

---

## Restaurants

### General

| Method                | Endpoint                               | Description              |
| --------------------- | -------------------------------------- | ------------------------ |
| `GET/POST/PUT/DELETE` | `/restaurants/[restaurantId]`          | Restaurant details       |
| `GET/POST/PUT/DELETE` | `/restaurants/[restaurantId]/settings` | Restaurant settings      |
| `GET`                 | `/restaurants/[restaurantId]/usage`    | Plan usage statistics    |
| `GET`                 | `/restaurants/[restaurantId]/plan`     | Current plan information |

### Media & Branding

| Method | Endpoint                                 | Description            |
| ------ | ---------------------------------------- | ---------------------- |
| `POST` | `/restaurants/[restaurantId]/logo`       | Upload restaurant logo |
| `POST` | `/restaurants/[restaurantId]/hero-image` | Upload hero image      |

### Menu Management

| Method                | Endpoint                                                    | Description        |
| --------------------- | ----------------------------------------------------------- | ------------------ |
| `GET/POST/PUT/DELETE` | `/restaurants/[restaurantId]/categories`                    | Manage categories  |
| `GET/PUT/DELETE`      | `/restaurants/[restaurantId]/categories/[categoryId]`       | Specific category  |
| `GET/POST/PUT/DELETE` | `/restaurants/[restaurantId]/categories/[categoryId]/foods` | Foods in category  |
| `GET/PUT/DELETE`      | `/restaurants/[restaurantId]/foods/[foodId]`                | Specific food item |

### Integration & Webhooks

| Method                | Endpoint                                       | Description           |
| --------------------- | ---------------------------------------------- | --------------------- |
| `GET/POST/PUT/DELETE` | `/restaurants/[restaurantId]/webhooks`         | Manage webhooks       |
| `POST`                | `/restaurants/[restaurantId]/webhooks`         | Handle webhook events |
| `GET/POST/PUT/DELETE` | `/restaurants/[restaurantId]/api-keys`         | Manage API keys       |
| `GET`                 | `/restaurants/[restaurantId]/stripe-dashboard` | Stripe dashboard link |

### Table & Requests

| Method           | Endpoint                                                 | Description                |
| ---------------- | -------------------------------------------------------- | -------------------------- |
| `GET/POST`       | `/restaurants/[restaurantId]/table-requests`             | Table reservation requests |
| `GET/PUT/DELETE` | `/restaurants/[restaurantId]/table-requests/[requestId]` | Specific request           |

---

## Tables

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| `POST` | `/tables/reserve`      | Reserve a table             |
| `POST` | `/tables/release`      | Release a table reservation |
| `GET`  | `/tables/availability` | Check table availability    |
| `POST` | `/tables/auto-release` | Auto-release tables         |

---

## Stripe Integration

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| `POST` | `/stripe/checkout` | Create Stripe checkout session |
| `POST` | `/stripe/connect`  | Stripe Connect integration     |
| `POST` | `/stripe/webhook`  | Handle Stripe webhooks         |

---

## User Profile

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| `GET`  | `/me/restaurant`            | Get authenticated user's restaurant |
| `GET`  | `/me/restaurant/stats`      | Restaurant statistics               |
| `GET`  | `/me/restaurant/chart-data` | Chart data for dashboard            |
| `GET`  | `/me/restaurant/qr-scans`   | QR code scan analytics              |

---

## Public Routes

| Method     | Endpoint                     | Description                            |
| ---------- | ---------------------------- | -------------------------------------- |
| `GET`      | `/public/restaurants/[slug]` | Get restaurant by slug (public access) |
| `GET/POST` | `/public/settings`           | Public settings                        |

---

## Debug Routes

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| `GET`  | `/debug/orders` | Debug orders endpoint |

---

## File Upload

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| `POST` | `/upload` | File upload handler |

---

## Usage Example

```bash
# Authentication
curl -X POST "https://your-vercel-deployment.vercel.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Restaurant Data
curl -X GET "https://your-vercel-deployment.vercel.app/api/me/restaurant" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Order
curl -X POST "https://your-vercel-deployment.vercel.app/api/orders" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":"123","items":[...]}'

# List Users (Admin)
curl -X GET "https://your-vercel-deployment.vercel.app/api/admin/users/list" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Environment Variables Required

Add these to your Vercel deployment:

```
NEXT_PUBLIC_API_URL=https://your-vercel-deployment.vercel.app/api
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Deployment Link

**Current Vercel Deployment:** [Add your Vercel URL here]

---

_Last Updated: March 11, 2026_
