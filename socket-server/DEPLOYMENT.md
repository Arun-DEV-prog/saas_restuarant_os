# Socket.IO Server Deployment Guide

This is a standalone Socket.IO server for MenuTiger real-time updates. Deploy it to Railway.app for free.

## 🚀 Deployment Steps (Railway)

### 1. Create Railway Account

- Go to [Railway.app](https://railway.app)
- Sign up with GitHub (easiest)

### 2. Create New Project from GitHub

- Click "New Project"
- Select "Deploy from GitHub repo"
- Authorize Railway to access your GitHub
- Choose `saas_frontend` repo

### 3. Configure Railway Service

- After repository is connected:
  - **Root Directory**: `socket-server`
  - **Start Command**: `npm start`
  - Click "Deploy"

### 4. Set Environment Variables

- In Railway dashboard, go to **Variables**
- Add:
  ```
  PORT=3001
  NODE_ENV=production
  FRONTEND_URL=https://saas-frontend-gules.vercel.app
  ```
- (Update `FRONTEND_URL` with your actual Vercel URL)

### 5. Get Your Socket Server URL

- After deployment, Railway generates a public URL
- It looks like: `https://socket-server-production-xxx.up.railway.app`
- Copy this URL

### 6. Update Frontend Code

In your main frontend code (PublicMenuPage.jsx and dashboard), update the socket connection:

**OLD:**

```javascript
const socket = io({
  path: "/api/socket",
  ...
});
```

**NEW:**

```javascript
const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

### 7. Add Environment Variable to Frontend

- In your Vercel Project Settings
- Add new environment variable:

  ```
  NEXT_PUBLIC_SOCKET_URL=https://socket-server-production-xxx.up.railway.app
  ```

  (Replace with your actual Railway URL)

- Redeploy your frontend on Vercel

### 8. Update Backend API Endpoints

In `/api/orders/[id]` and other endpoints, change from:

```javascript
const io = global.io;
```

To call your external socket server via HTTP:

```javascript
const SOCKET_SERVER_URL =
  process.env.SOCKET_SERVER_URL || "http://localhost:3001";

try {
  await fetch(`${SOCKET_SERVER_URL}/socket.io/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "order-update",
      data: { orderId, status, restaurantId, updatedAt },
    }),
  });
} catch (e) {
  console.warn("Socket update failed:", e.message);
}
```

## 🔧 Local Development

### Run Socket Server Locally

```bash
cd socket-server
npm install
npm start
```

Server runs on http://localhost:3001

### Update .env.local

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_SERVER_URL=http://localhost:3001
```

## 📊 Monitoring

- Check Railway logs in dashboard
- Monitor memory/CPU usage
- Railway free tier includes: 500 hours/month (plenty for this)

## 💡 Alternative Platforms

If Railway doesn't work:

- **Render.com**: https://render.com (similar to Railway)
- **Fly.io**: https://fly.io (very reliable)
- **Replit**: https://replit.com (good for testing)

All support Node.js socket.io servers!
