# Socket.IO Server Deployment on Railway

This is a standalone Socket.IO server for MenuTiger real-time updates. Deploy it to Railway.app for free.

## 🚀 Quick Deployment Steps

### Step 1: Create Railway Account

- Go to [Railway.app](https://railway.app)
- Sign up with GitHub (recommended for easy connection)

### Step 2: Deploy from GitHub

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize Railway and select the `saas_frontend` repository
4. Railway will auto-detect the Node.js project

### Step 3: Configure Root Directory

In Railway Project Settings:

- Set **Root Directory** to: `socket-server`
- This tells Railway where the server.js file is located

### Step 4: Add Environment Variables

In Railway dashboard Variables section, add these variables:

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://saas-frontend-gules.vercel.app
```

**IMPORTANT:** Update `FRONTEND_URL` with your actual Vercel frontend URL.

### Step 5: Deploy

Click "Deploy" and wait for Railway to:

1. Build the Docker image
2. Install dependencies from `socket-server/package.json`
3. Start the server with `npm start`

### Step 6: Get Your Socket Server URL

After deployment completes:

- Go to Railway project settings
- Find the "Domain" section
- Copy your public URL (looks like: `https://socket-server-production-abc123.up.railway.app`)

### Step 7: Update Frontend Environment

Add this to your Vercel environment variables:

```
NEXT_PUBLIC_SOCKET_URL=https://socket-server-production-abc123.up.railway.app
```

Then redeploy your frontend on Vercel.

---

## 🔧 Local Development

### Run Locally

```bash
cd socket-server
npm install
npm start
```

Server will run on `http://localhost:3001`

### Test Connection

Open in browser: `http://localhost:3001/health`

You should see:

```json
{
  "status": "ok",
  "timestamp": "2024-04-05T...",
  "environment": "development",
  "port": 3001
}
```

### Local Environment Setup

Create `.env` or update `.env.local`:

```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 📡 API Endpoints

### Health Check

```
GET /health
```

Returns server status (used by Railway to monitor uptime)

### Notifications

```
POST /notify
```

Receive event notifications from backend APIs

### Socket.IO Connection

```
WebSocket ws://socket-server:3001/socket.io
```

Real-time bidirectional communication

---

## 🔌 Socket Events

### Client → Server

| Event              | Data           | Purpose               |
| ------------------ | -------------- | --------------------- |
| `join-restaurant`  | `restaurantId` | Join restaurant room  |
| `leave-restaurant` | `restaurantId` | Leave restaurant room |
| `ping`             | -              | Keep-alive heartbeat  |

### Server → Client

| Event               | Data                   | Purpose              |
| ------------------- | ---------------------- | -------------------- |
| `joined-restaurant` | `{restaurantId, room}` | Confirm room joined  |
| `order-updated`     | Order object           | Order status change  |
| `order-created`     | Order object           | New order created    |
| `menu-updated`      | Menu data              | Menu changed         |
| `table-updated`     | Table data             | Table status changed |
| `pong`              | -                      | Heartbeat response   |

---

## 🐛 Troubleshooting

### Connection Refused

- Check if Railway deployment succeeded
- Verify `NEXT_PUBLIC_SOCKET_URL` is set in Vercel
- Check browser console for connection errors

### CORS Errors

- Verify `FRONTEND_URL` matches your Vercel domain
- Check that both frontend and socket server URLs are correct
- Make sure HTTPS is used in production

### Server Won't Start

- Check Railway build logs
- Verify `PORT` environment variable is set to `3001`
- Ensure `NODE_ENV` is `production` for Railway

### Health Check Failed

- Visit `https://your-socket-url/health`
- Should return JSON with status "ok"
- If 404, the server may not be running

---

## 📊 Monitoring

### View Logs

In Railway dashboard:

1. Open your Socket.IO project
2. Click "Deployments" tab
3. Click your latest deployment
4. View logs in real-time

### Common Log Messages

```
✅ Socket connected: 123abc...     → Client connected
✅ Socket joined room: restaurant-xxx  → Client joined room
📨 Order update received              → Notification processed
❌ Client disconnected                → Client left
```

### Health Monitoring

Railway automatically monitors:

- Memory usage
- CPU usage
- Uptime
- RestartGuard tracks failed deployments

---

## 🆘 Support & Alternatives

If Railway doesn't work:

- **Render.com** - Similar to Railway, generous free tier
- **Fly.io** - Global edge deployment, very reliable
- **Replit** - Good for testing and development
- **Self-hosted Socket.IO** - Deploy to your own VPS

All support Node.js Socket.IO servers!

---

## ✅ Deployment Checklist

- [ ] GitHub repo connected to Railway
- [ ] Root directory set to `socket-server`
- [ ] Environment variables added (PORT, NODE_ENV, FRONTEND_URL)
- [ ] Deployment successful (no build errors)
- [ ] Health check endpoint returns 200
- [ ] Public URL generated and copied
- [ ] `NEXT_PUBLIC_SOCKET_URL` added to Vercel
- [ ] Frontend redeployed on Vercel
- [ ] Socket connections working in browser console
- [ ] Real-time events (orders, menus) updating correctly

---

**Last Updated:** April 2024
**Status:** Production Ready ✅
