# MenuTiger Socket.IO Server

A standalone Socket.IO server for real-time order updates in MenuTiger restaurant management system.

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your settings
FRONTEND_URL=http://localhost:3000
```

### Running Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3001`

### Health Check

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Deployment to Railway

### Step 1: Generate package-lock.json

Before deploying, ensure `package-lock.json` exists locally:

```bash
npm install
```

Then commit:

```bash
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Step 2: Deploy on Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repo
5. Railway auto-builds in `socket-server` directory
6. Add environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

### Step 3: Get Your Socket Server URL

After deployment, Railway generates a public URL:

- Example: `https://socket-server-production-xxx.up.railway.app`

Add this to your frontend's Vercel environment variables:

```
NEXT_PUBLIC_SOCKET_URL=https://socket-server-production-xxx.up.railway.app
SOCKET_SERVER_URL=https://socket-server-production-xxx.up.railway.app
```

## API Endpoints

### `POST /notify`

Receive event notifications from backend APIs.

**Request:**

```json
{
  "event": "order-update",
  "data": {
    "restaurantId": "...",
    "orderId": "...",
    "status": "confirmed",
    "updatedAt": "2026-03-03T..."
  }
}
```

**Response:**

```json
{
  "success": true,
  "event": "order-update"
}
```

### `GET /health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-03-03T..."
}
```

## Socket Events

### Client → Server

- **`join-restaurant`** - Join restaurant-specific room

  ```javascript
  socket.emit("join-restaurant", restaurantId);
  ```

- **`leave-restaurant`** - Leave restaurant room
  ```javascript
  socket.emit("leave-restaurant", restaurantId);
  ```

### Server → Client (Broadcasting)

- **`order-created`** - New order placed
- **`order-updated`** - Order status changed
- **`table-updated`** - Table status changed
- **`menu-updated`** - Menu items updated

## Environment Variables

```env
# Server port (Railway sets this automatically)
PORT=3001

# Environment
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-url.com
```

## Troubleshooting

### Build fails on Railway

- Ensure `package-lock.json` is committed
- Check Node.js version compatibility (should be 18+)
- View Railway logs: Dashboard → Logs tab

### WebSocket connection fails

- Check CORS origin matches your frontend URL
- Verify Railway deployment is running
- Check browser network tab for connection errors

### Events not broadcasting

- Verify backend is sending to `/notify` endpoint
- Check Railway logs for received notifications
- Ensure restaurant IDs match between frontend and backend

## Production Checklist

- [ ] `package-lock.json` committed
- [ ] `FRONTEND_URL` set in Railway
- [ ] Vercel has `NEXT_PUBLIC_SOCKET_URL` set
- [ ] tested locally with `npm start`
- [ ] Verified health check endpoint: `/health`
- [ ] Tested order creation and status updates
- [ ] Monitored Railway logs for errors

## Support

Check the main project documentation at `../SOCKET_SERVER_SETUP.md` for complete setup guide.
