# SaaS Restaurant Platform - Complete Setup Guide

> 📖 **Main Documentation**: See [README.md](README.md) for complete documentation hub  
> ⚡ **Quick Start**: For 5-minute setup, see [QUICK_START.md](QUICK_START.md)

Welcome! This guide walks you through setting up the entire SaaS restaurant management platform for development and production.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Socket Server Setup](#socket-server-setup)
8. [Creating Initial Admin Account](#creating-initial-admin-account)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This is a **SaaS restaurant management platform** built with:

- **Frontend**: Next.js 16 + React 19
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Real-time Communication**: Socket.IO
- **Payment Processing**: Stripe
- **Media Storage**: Cloudinary
- **Styling**: Tailwind CSS

### Key Features

- Multi-tenant SaaS platform
- Restaurant menu management
- Order management system
- Table reservation system
- Real-time notifications
- Stripe payment integration
- Admin dashboard with analytics

---

## Prerequisites

Before starting, ensure you have:

### Required Software

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ or **yarn** v3+
- **Git** ([Download](https://git-scm.com/))
- **MongoDB Atlas Account** ([Create Free](https://www.mongodb.com/cloud/atlas))

### Required Third-Party Accounts (Get these before setup)

- **MongoDB Atlas** - for database
- **Stripe Account** - for payment processing
- **Cloudinary Account** - for image hosting (optional but recommended)
- **NextAuth Secret** - for session management

### System Requirements

- **Disk Space**: ~500MB
- **RAM**: 2GB minimum
- **OS**: Windows, macOS, or Linux

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd saas_frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:

- Next.js framework
- React and React DOM
- Authentication (next-auth)
- Database (mongoose, mongodb)
- Payment processing (stripe)
- Real-time communication (socket.io)
- UI libraries (radix-ui, lucide-react, recharts)
- And more...

**Installation time**: 2-5 minutes depending on internet speed

### Step 3: Verify Installation

```bash
npm run lint
```

If no errors appear, your installation is successful!

---

## Environment Configuration

### Step 1: Create `.env.local` File

In the **root directory** (same level as package.json), create a file named `.env.local`:

```bash
# For Windows (PowerShell)
New-Item -Name ".env.local" -ItemType File

# For macOS/Linux
touch .env.local
```

### Step 2: Add Environment Variables

Copy and paste this into your `.env.local` file and fill in your credentials:

```env
# ==========================================
# NEXTAUTH CONFIGURATION
# ==========================================
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars-123456789
NEXTAUTH_URL=http://localhost:3000

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# Get this from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_saas?retryWrites=true&w=majority
NEXT_PUBLIC_DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_saas?retryWrites=true&w=majority

# ==========================================
# CLOUDINARY CONFIGURATION (Image Hosting)
# ==========================================
# Get these from Cloudinary Dashboard
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# ==========================================
# STRIPE CONFIGURATION (Payment Processing)
# ==========================================
# Get these from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_your_connect_client_id
STRIPE_PLATFORM_FEE_PERCENT=2.5

# ==========================================
# SOCKET.IO CONFIGURATION (Real-time Features)
# ==========================================
# Local development (will be localhost:3001)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_SERVER_URL=http://localhost:3001

# For production, use your deployed socket server URL
# NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.herokuapp.com
# SOCKET_SERVER_URL=https://your-socket-server.herokuapp.com

# ==========================================
# APPLICATION URLs
# ==========================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Getting Credentials - Quick Reference

| Service             | Where to Get                                    | Step-by-Step                                          |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| **MongoDB**         | [Atlas Dashboard](https://account.mongodb.com/) | Create cluster → Get connection string                |
| **Stripe**          | [Dashboard](https://dashboard.stripe.com/)      | View API keys → Copy pk_test and sk_test              |
| **Cloudinary**      | [Console](https://cloudinary.com/console/)      | View account details → Copy cloud name                |
| **NextAuth Secret** | Generate yourself                               | Use: `openssl rand -base64 32` or any 32+ char string |

---

## Database Setup

### Step 1: Create MongoDB Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up"
3. Create account with your email
4. Verify email

### Step 2: Create a Database Cluster

1. Click "Create" next to "Databases"
2. Choose **M0 (Free)** tier
3. Select your preferred region (closest to you)
4. Click "Create Cluster"
5. Wait 5-10 minutes for cluster creation

### Step 3: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Drivers"
3. Select **Node.js** as driver
4. Copy the connection string
5. Replace `<password>` with your database password
6. Add database name: `restaurant_saas`

Your final connection string should look like:

```
mongodb+srv://username:password@cluster123.mongodb.net/restaurant_saas?retryWrites=true&w=majority
```

### Step 4: Verify Connection

```bash
npm run setup-owner
```

If successful, you'll see:

```
✅ Connected to MongoDB
✅ Owner account created successfully!
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

You'll see output like:

```
▲ Next.js 16.1.6
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

### Production Build

```bash
npm run build
npm run start
```

### Stop the Server

Press `Ctrl + C` in the terminal

---

## Socket Server Setup

The Socket.IO server enables real-time features like notifications and live updates.

### Local Development (Same Machine)

Socket server runs alongside the Next.js app:

1. Ensure `.env.local` has:

   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   SOCKET_SERVER_URL=http://localhost:3001
   ```

2. Socket server starts automatically with:
   ```bash
   npm run dev
   ```

### Production Deployment

For production, deploy the socket server separately:

1. Navigate to socket server directory:

   ```bash
   cd socket-server
   ```

2. Refer to [SOCKET_SERVER_SETUP.md](SOCKET_SERVER_SETUP.md) for deployment

3. Update `.env.local` with production URL:
   ```env
   NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.herokuapp.com
   SOCKET_SERVER_URL=https://your-socket-server.herokuapp.com
   ```

---

## Creating Initial Admin Account

### Method 1: Automated Script (Recommended)

```bash
npm run setup-owner
```

This creates an admin account with:

- Email: `admin@restaurant.com`
- Password: `Admin@12345`
- Role: `owner`

You'll see:

```
✅ Connected to MongoDB
✅ Owner account created successfully!

═══════════════════════════════════════════
📝 LOGIN CREDENTIALS:
═══════════════════════════════════════════
Email:    admin@restaurant.com
Password: Admin@12345
═══════════════════════════════════════════

💡 You can now login at /login
```

### Method 2: Manual MongoDB Setup

1. Open [MongoDB Compass](https://www.mongodb.com/products/tools/compass) or use MongoDB Atlas UI
2. Navigate to: `restaurant_saas` database → `users` collection
3. Insert this document:

```json
{
  "name": "Admin User",
  "email": "admin@restaurant.com",
  "password": "$2a$10$...", // bcrypt hashed "Admin@12345"
  "role": "owner",
  "restaurantId": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

---

## First Login

1. Start the app: `npm run dev`
2. Go to: **http://localhost:3000/login**
3. Use credentials from admin setup
4. You'll be redirected to admin dashboard

---

## Project Structure

```
saas_frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/                # Backend API routes
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── page.js             # Home page
│   ├── components/             # React components
│   │   ├── Dashboard/          # Dashboard components
│   │   ├── ui/                 # UI components (buttons, cards, etc.)
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   │   ├── models/             # MongoDB models
│   │   └── stripe/             # Stripe utilities
│   └── ...
├── socket-server/              # Real-time server (Socket.IO)
├── public/                     # Static files
├── .env.local                  # Environment variables (create this)
├── middleware.js               # Route protection middleware
├── next.config.mjs             # Next.js configuration
└── package.json                # Dependencies
```

---

## Common Tasks

### Add a New Environment Variable

1. Add it to `.env.local`:

   ```env
   MY_NEW_VARIABLE=some-value
   ```

2. Restart the dev server: `Ctrl + C` then `npm run dev`

3. Access in code:
   ```js
   const value = process.env.MY_NEW_VARIABLE;
   ```

### Change Admin Credentials

1. Update in MongoDB or run setup script again
2. Remember password must be bcrypt hashed

### Check Database Connection

```bash
npm run setup-owner
```

If connection fails, verify:

- MongoDB URI is correct in `.env.local`
- Cluster is running in MongoDB Atlas
- IP whitelist allows your machine (in Atlas → Security → Network Access)

---

## Deployment

### Deploy to Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Add environment variables from [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)
6. Click "Deploy"

**Important**: Set environment variables before deploying!

See [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) for complete list of required variables.

### Deploy to Other Platforms

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo and deploy
- **AWS**: Follow Next.js AWS deployment guide
- **Self-hosted**: Use `npm run build && npm run start`

---

## Troubleshooting

### Problem: "Cannot find module"

**Solution**: Run `npm install` again and restart server

```bash
npm install
npm run dev
```

### Problem: Database connection fails

**Solution**: Check these things:

```
1. .env.local exists in root directory
2. MONGODB_URI is correctly formatted
3. Password in URI is URL-encoded (@ becomes %40)
4. MongoDB cluster is running (check Atlas dashboard)
5. Your IP is whitelisted in Atlas
```

To whitelist your IP in MongoDB Atlas:

1. Go to Atlas Dashboard
2. Security → Network Access
3. Click "Add Current IP Address"
4. Or add `0.0.0.0/0` to allow all IPs (less secure)

### Problem: NextAuth errors

**Solution**: Verify NextAuth configuration:

```env
NEXTAUTH_SECRET=your-secret-must-be-minimum-32-characters-long!
NEXTAUTH_URL=http://localhost:3000
```

To generate a new secret:

```bash
# PowerShell
[string]::join('', [char[]]$([guid]::NewGuid().ToString().GetHashCode()+[Random]::new().Next(1000000)) | Get-Random -Count 32)

# Or use a simple string of 32+ characters
```

### Problem: Socket connection fails

**Solution**: Verify Socket.IO configuration:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_SERVER_URL=http://localhost:3001
```

Check that socket server is running when you execute `npm run dev`

### Problem: Cloudinary/Stripe keys not working

**Solution**:

1. Verify credentials are in `.env.local`
2. Restart dev server after adding
3. Check that keys are for TEST mode, not LIVE mode

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## Security Checklist

- [ ] Change default admin password after first login
- [ ] Keep `.env.local` out of version control (add to `.gitignore`)
- [ ] Use different MongoDB user for production
- [ ] Use LIVE Stripe keys only in production
- [ ] Set `NEXTAUTH_URL` correctly for your domain
- [ ] Enable HTTPS in production
- [ ] Whitelist only necessary IPs in MongoDB
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)

---

## Next Steps

1. ✅ Complete setup steps above
2. 📖 Read [ADMIN_PROTECTION_SETUP.md](ADMIN_PROTECTION_SETUP.md) to understand admin routes
3. 👤 Read [OWNER_SETUP.md](OWNER_SETUP.md) for owner account management
4. 🔌 Read [SOCKET_SERVER_SETUP.md](SOCKET_SERVER_SETUP.md) for real-time features
5. 🚀 See [Deployment](#deployment) for going live

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **NextAuth Docs**: https://next-auth.js.org
- **Stripe Docs**: https://stripe.com/docs
- **Socket.IO Docs**: https://socket.io/docs/

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start development server

# Building
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Check code quality

# Database
npm run setup-owner      # Create initial admin account

# Stopping
Ctrl + C                 # Stop running server
```

---

**Last Updated**: March 2026  
**Version**: 1.0  
**Questions?** Check existing setup files or contact support.
