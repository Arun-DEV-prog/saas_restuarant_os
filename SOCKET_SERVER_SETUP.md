# MenuTiger - Socket.IO Server Deployment Guide

## 📋 Overview

Your MenuTiger frontend now uses an **external Socket.IO server** for real-time updates instead of relying on a server.js in Vercel (which doesn't work there).

### Architecture:

```
┌─────────────────────────────────────┐
│  Vercel (Frontend + API Routes)     │
│  - Next.js App                      │
│  - API endpoints (/api/orders)      │
│  - Connects to external socket      │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               ↓
┌─────────────────────────────────────┐
│  Railway/External (Socket.IO Server)│
│  - Standalone Node.js app           │
│  - Handles real-time connections    │
│  - Broadcasts order updates         │
└─────────────────────────────────────┘
```

---

## 🚀 Step 1: Deploy Socket.IO Server to Railway

### Prerequisites:

- GitHub account
- Railway.app account (sign up at https://railway.app)

### Steps:

1. **Push to GitHub**

   ```bash
   git add socket-server/
   git commit -m "Add standalone socket.io server"
   git push origin main
   ```

2. **Create New Railway Project**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `saas_frontend` repository

3. **Configure Railway Service**
   - Set **Root Directory** to `socket-server`
   - Click "Create Service"
   - Railway auto-detects and deploys

4. **Add Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add these variables:
     ```
     PORT=3001
     NODE_ENV=production
     FRONTEND_URL=https://saas-frontend-gules.vercel.app
     ```
     (Replace with your actual Vercel URL)

5. **Get Your Socket Server URL**
   - After deployment, Railway shows your public URL
   - Example: `https://socket-server-production-xxx.up.railway.app`
   - Copy this URL (you'll need it next)

---

## 🔌 Step 2: Update Frontend Environment Variables

### In Vercel Dashboard:

1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add new variable:

   ```
   NEXT_PUBLIC_SOCKET_URL=https://socket-server-production-xxx.up.railway.app
   ```

   (Use your actual Railway URL)

4. Also add on Railway dashboard (for backend to call socket server):

   ```
   SOCKET_SERVER_URL=https://socket-server-production-xxx.up.railway.app
   ```

5. **Redeploy Frontend**
   - In Vercel, go to Deployments
   - Click redeploy of latest commit (or push new commit)

---

## 🧪 Step 3: Test Locally First (Optional)

Before deploying, test locally:

### Terminal 1 - Start Socket Server:

```bash
cd socket-server
npm install
npm start
```

Should show: `Socket.IO Server Ready! ➜ Port: 3001`

### Terminal 2 - Start Frontend:

```bash
# Make sure .env.local has:
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
# SOCKET_SERVER_URL=http://localhost:3001

npm run dev
```

### Test the Flow:

1. Open public menu page → click "My Orders"
2. Open kitchen dashboard in another tab
3. Create new order from public menu
4. Update status in kitchen dashboard
5. Check: Public menu page should update instantly

---

## ✅ Verification Checklist

- [ ] Socket server deployed to Railway
- [ ] Railway URL copied
- [ ] `NEXT_PUBLIC_SOCKET_URL` set in Vercel
- [ ] Frontend redeployed
- [ ] Browser console shows `[Socket] ✅ Connected`
- [ ] Order status updates appear in real-time

---

## 🔍 Troubleshooting

### "WebSocket connection failed"

- Check if `NEXT_PUBLIC_SOCKET_URL` is correct
- Verify Railway domain is accessible (check Railway logs)
- Make sure CORS allows your Vercel URL

### "Socket connected but no events received"

- Check Restaurant ID is being passed correctly
- Look at Railway server logs for event broadcasts
- Check Vercel logs for API errors when updating orders

### Railway Deployment Failed

- Check root directory is set to `socket-server`
- Verify `package.json` and `Procfile` exist
- Check Railway build logs for Node.js version issues

### Check Railway Logs:

```bash
# Via Railway CLI
railway logs

# Or web dashboard
https://railway.app/dashboard → Your Project → Logs
```

---

## 📝 Environment Variables Reference

### Frontend (.env.local / Vercel):

```
# Socket server for browser to connect
NEXT_PUBLIC_SOCKET_URL=https://socket-server-prod.railway.app

# Socket server for backend API to call
SOCKET_SERVER_URL=https://socket-server-prod.railway.app
```

### Socket Server (Railway):

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://saas-frontend-gules.vercel.app
```

---

## 🚨 Alternative Deployment Platforms

If Railway has issues:

### **Render.com**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Set build command: `cd socket-server && npm install`
5. Set start command: `npm start`

### **Fly.io**

```bash
# Install flyctl CLI
# Then in socket-server directory:
fly launch
fly deploy
```

### **Heroku** (requires paid plan now)

```bash
heroku create socket-server-menutiger
cd socket-server
git push heroku main
```

---

## 🔄 How It Works Now

1. **Order Status Updated** (Kitchen Dashboard)
   - User clicks "Confirm" on order
   - Frontend PATCH to `/api/orders/{id}`

2. **Backend Updates Database**
   - API updates MongoDB
   - API makes HTTP POST to Socket Server with update

3. **Socket Server Broadcasts**
   - Receives HTTP notification
   - Emits to all connected clients in `restaurant-{id}` room

4. **Customers See Update**
   - Socket listener on public menu receives event
   - React state updates
   - UI shows new order status immediately

---

## 📊 Monitoring

### Monitor Socket Server Health:

```bash
# Check if running
curl https://socket-server-prod.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2026-03-03T..."}
```

### View Logs:

- **Railway**: Dashboard → Project → Logs
- **Render**: Dashboard → Service → Logs
- **Fly**: `fly logs`

---

## 💡 Pro Tips

1. **Keep Railway URL in secrets**: Store in `.env` files, not in code
2. **Monitor costs**: Free tier supports many concurrent connections
3. **Set up alerts**: Enable notifications for deployment failures
4. **Regular testing**: Occasionally test full order workflow
5. **Cache results**: Socket server caches nothing, so restarts are safe

---

Need help? Check:

- Socket server logs on Railway
- Frontend browser console (F12)
- Vercel deployment logs
- API errors in Network tab (DevTools)
