# Vercel Environment Variables Setup

The build is failing on Vercel because the following environment variables need to be set in your Vercel project settings.

## Required Environment Variables for Vercel

Go to: **Vercel Dashboard → Project Settings → Environment Variables**

Add these variables (copy values from your `.env.local` file):

### NextAuth

- `NEXTAUTH_SECRET` = your-secret-key (should be: `supersecretkey123`)
- `NEXTAUTH_URL` = `https://saas-frontend-xxxx.vercel.app` (will be your Vercel domain)

### Database

- `NEXT_PUBLIC_DATABASE_URI` = your MongoDB connection string
- `MONGODB_URI` = same as above (some code might use this)

### Cloudinary (Optional for build, needed at runtime)

- `CLOUDINARY_CLOUD_NAME` = your cloud name
- `CLOUDINARY_API_KEY` = your API key
- `CLOUDINARY_API_SECRET` = your secret
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = your cloud name

### Stripe (Optional for build, needed at runtime)

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your publishable key
- `STRIPE_SECRET_KEY` = your secret key
- `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID` = your client ID
- `STRIPE_PLATFORM_FEE_PERCENT` = `2.5`

### Socket Server

- `NEXT_PUBLIC_SOCKET_URL` = your Socket.IO server URL
- `SOCKET_SERVER_URL` = same as above

### Other

- `NEXT_PUBLIC_BASE_URL` = `https://saas-frontend-xxxx.vercel.app` (your Vercel domain)
- `FRONTEND_URL` = same as above

## Steps

1. Go to https://vercel.com/arun-kumar-roys-projects/saas-frontend/settings/environment-variables
2. Add each variable from your `.env.local` file
3. Make sure to set them for Production only if desired
4. Redeploy from Vercel dashboard or push a new commit to trigger rebuild

## Important Notes

- **DO NOT** commit `.env.local` to git (check .gitignore)
- **DO NOT** put sensitive keys directly in code
- Always use environment variables for secrets
- Each environment (dev, staging, prod) can have different variables
