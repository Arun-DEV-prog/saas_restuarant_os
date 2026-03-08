# Quick Start - 5 Minutes to Running

> 📖 **Main Documentation**: See [README.md](README.md) for complete documentation hub

Get the project running in 5 minutes! For detailed setup, see [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md).

---

## Prerequisites (1 min)

Have these ready:

- **Node.js 18+** installed
- **MongoDB Atlas** account with connection string
- **Stripe** test keys (optional for now)

---

## Setup (5 min)

### 1. Install Dependencies (2 min)

```bash
cd saas_frontend
npm install
```

### 2. Create `.env.local` (1 min)

Create file named `.env.local` in root directory with:

```env
NEXTAUTH_SECRET=my-super-secret-key-min-32-chars-123456789abc
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_saas?retryWrites=true&w=majority
NEXT_PUBLIC_DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_saas?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=test
CLOUDINARY_API_SECRET=test
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_SECRET_KEY=sk_test_dummy
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_test
STRIPE_PLATFORM_FEE_PERCENT=2.5
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**Replace:**

- `username:password` with your MongoDB credentials
- Keep other values as-is for now

### 3. Create Admin Account (1 min)

```bash
npm run setup-owner
```

You'll get:

- Email: `admin@restaurant.com`
- Password: `Admin@12345`

### 4. Start Server (1 min)

```bash
npm run dev
```

Open: http://localhost:3000/login

Login with credentials from step 3.

---

## You're Done! 🎉

Your app is now running at **http://localhost:3000**

### Next Steps

- Explore the admin dashboard
- Check [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md) for production setup
- Read other setup documents for specific features

### Common Issues?

**"Cannot connect to MongoDB"**

- Verify connection string in `.env.local`
- Add your IP to MongoDB Atlas whitelist

**"Port 3000 already in use"**

- Kill the process or use different port:
  ```bash
  npm run dev -- -p 3001
  ```

**"Module not found"**

- Run: `npm install`
- Restart: `npm run dev`

---

Need more help? See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md) for detailed setup.
