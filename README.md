# 🍽️ SaaS Restaurant Management Platform

A complete multi-tenant SaaS platform for restaurant management, built with Next.js, MongoDB, and Stripe. Manage menus, orders, reservations, and analytics all in one place.

## 📖 Documentation Hub

Start here! Choose your role:

| Role                              | Document                                               | Time   | Purpose                      |
| --------------------------------- | ------------------------------------------------------ | ------ | ---------------------------- |
| **👨‍💻 Developer (First Time)**     | [QUICK_START.md](QUICK_START.md)                       | 5 min  | Get running in 5 minutes     |
| **👨‍💻 Developer (Complete Setup)** | [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md)       | 30 min | Full setup & configuration   |
| **🎯 Business Users & Clients**   | [CLIENT_HANDOFF.md](CLIENT_HANDOFF.md)                 | 10 min | Platform overview & features |
| **🔐 Admin Users**                | [ADMIN_PROTECTION_SETUP.md](ADMIN_PROTECTION_SETUP.md) | 10 min | Admin routes & permissions   |
| **👤 Initial Setup**              | [OWNER_SETUP.md](OWNER_SETUP.md)                       | 5 min  | Creating owner/admin account |
| **🔌 Real-time Features**         | [SOCKET_SERVER_SETUP.md](SOCKET_SERVER_SETUP.md)       | 20 min | Socket.IO server setup       |
| **🚀 Production Deployment**      | [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)             | 15 min | Deploy to Vercel             |

---

## ⚡ Quick Start (5 Minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local` in root directory

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

### 3. Create admin account

```bash
npm run setup-owner
```

### 4. Start development server

```bash
npm run dev
```

Open: http://localhost:3000/login

**Credentials**:

- Email: `admin@restaurant.com`
- Password: `Admin@12345`

✅ **Done!** For detailed setup, see [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md)

---

## 🎯 Key Features

### 🍴 Menu Management

- Create and manage menu categories
- Add/edit/delete food items
- Upload food images to Cloudinary
- Manage pricing and descriptions
- Real-time menu updates

### 📋 Order Management

- Real-time order notifications
- Process orders from multiple channels
- Track order status
- Generate invoices
- Payment processing via Stripe

### 🪑 Table Reservations

- Manage available tables
- Accept/decline reservations
- Send reservation confirmations
- Track table availability in real-time

### 📊 Analytics & Reports

- Revenue tracking and analytics
- Order statistics and trends
- Popular items analysis
- Customer insights
- Exportable reports

### 🔐 Admin Dashboard

- Role-based access control
- User management
- System configuration
- Performance metrics
- Real-time monitoring

### 💳 Payment Processing

- Stripe integration for payments
- Multiple payment methods
- Payment history and reconciliation
- Automated invoicing

---

## 📚 Technology Stack

| Layer            | Technology   | Version |
| ---------------- | ------------ | ------- |
| **Frontend**     | Next.js      | 16.1.6  |
| **Runtime**      | Node.js      | 18+     |
| **UI Framework** | React        | 19.2.3  |
| **Styling**      | Tailwind CSS | 4       |
| **Database**     | MongoDB      | Latest  |
| **Auth**         | NextAuth.js  | 4.24.13 |
| **Payments**     | Stripe       | 20.4.0  |
| **Real-time**    | Socket.IO    | 4.8.3   |
| **Images**       | Cloudinary   | 2.9.0   |

---

## 📂 Project Structure

```
saas_frontend/
├── src/
│   ├── app/                      # Next.js app routes
│   │   ├── api/                  # Backend API routes
│   │   ├── (dashboard)/          # Protected dashboard pages
│   │   ├── admin/                # Admin pages
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── page.js               # Home page
│   ├── components/               # React components
│   │   ├── Dashboard/            # Dashboard components
│   │   ├── ui/                   # Reusable UI components
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities & helpers
│   │   ├── models/               # MongoDB schemas
│   │   ├── stripe/               # Stripe utilities
│   │   ├── auth.js               # Auth configuration
│   │   ├── db.js                 # Database connection
│   │   └── ...
│   └── app/globals.css           # Global styles
├── socket-server/                # Socket.IO server
│   ├── server.js                 # Socket server logic
│   ├── package.json              # Socket server deps
│   └── README.md                 # Socket server docs
├── public/                       # Static assets
├── scripts/                      # Setup scripts
│   ├── setup-owner.js            # Create admin account
│   └── check-owner.js            # Verify admin account
├── .env.local                    # Environment variables (create this)
├── middleware.js                 # Route protection
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.mjs            # PostCSS configuration
└── package.json                  # Dependencies

```

---

## 🚀 Available Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)

# Production
npm run build            # Build optimized production bundle
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint checks

# Database
npm run setup-owner      # Create initial admin account
```

---

## 🔧 Configuration

### Environment Variables

All configuration is done through `.env.local` file. See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md#environment-configuration) for complete list and detailed setup instructions.

### Database

MongoDB Atlas is used for the database. See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md#database-setup) for setup steps.

### Authentication

NextAuth.js handles authentication. See [ADMIN_PROTECTION_SETUP.md](ADMIN_PROTECTION_SETUP.md) for role management.

### Payments

Stripe integration for payment processing. See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md#environment-configuration) for API keys.

### Real-time Features

Socket.IO for real-time notifications and updates. See [SOCKET_SERVER_SETUP.md](SOCKET_SERVER_SETUP.md) for configuration.

---

## 🌐 Deployment

### Vercel (Recommended)

Easiest deployment option. See [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) for step-by-step instructions.

```bash
# Push to GitHub and connect to Vercel
# Vercel auto-deploys on push to main branch
```

### Self-Hosted

Deploy to any Node.js hosting:

```bash
npm run build
npm run start
```

See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md#deployment) for other deployment options.

---

## 🔐 Security

- Passwords are bcrypt hashed
- JWT tokens for session management
- Role-based access control (RBAC)
- Protected API routes
- CORS configuration enabled
- SQL injection prevention via Mongoose

**Security Checklist** before production:

- [ ] Change default admin password
- [ ] Update NEXTAUTH_SECRET to random 32+ chars
- [ ] Use HTTPS in production
- [ ] Whitelist MongoDB IPs
- [ ] Use production Stripe keys only
- [ ] Enable rate limiting on APIs
- [ ] Regular security audits

See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md#security-checklist) for more.

---

## 🐛 Troubleshooting

### Common Issues

**"Can't connect to MongoDB"**

- Check `.env.local` has correct connection string
- Verify MongoDB cluster is running
- Whitelist your IP in MongoDB Atlas

**"Port 3000 already in use"**

```bash
npm run dev -- -p 3001
```

**"Module not found"**

```bash
npm install
npm run dev
```

**For more help**: See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md#troubleshooting)

---

## 📞 Support

### Documentation

- Full setup guide: [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md)
- Quick start: [QUICK_START.md](QUICK_START.md)
- Client handoff: [CLIENT_HANDOFF.md](CLIENT_HANDOFF.md)
- Admin setup: [ADMIN_PROTECTION_SETUP.md](ADMIN_PROTECTION_SETUP.md)
- Owner setup: [OWNER_SETUP.md](OWNER_SETUP.md)
- Socket server: [SOCKET_SERVER_SETUP.md](SOCKET_SERVER_SETUP.md)
- Vercel deployment: [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)

---

## 📄 License

This project is private and proprietary.

---

## 👥 Contributors

Built and maintained by the development team.

---

**Last Updated**: March 2026  
**Version**: 1.0

**Ready to get started?** → Read [QUICK_START.md](QUICK_START.md) (5 minutes)
