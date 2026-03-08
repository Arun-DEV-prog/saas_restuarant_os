# Owner Setup Guide

> 📖 **Main Documentation**: See [README.md](README.md) for complete documentation hub

## Quick Start - 3 Ways to Setup Owner Account

---

## Method 1: Automated Script (Recommended) ✅

### Step 1: Ensure bcrypt is installed

```bash
npm install bcrypt
```

### Step 2: Run the setup script

```bash
node scripts/setup-owner.js
```

### Expected Output:

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

---

## Method 2: MongoDB Compass (GUI)

### Step 1: Open MongoDB Compass

- Connect to your MongoDB instance
- Select database: `restaurant_saas`
- Open `users` collection

### Step 2: Insert New Document

Click "INSERT DOCUMENT" and paste this JSON:

```json
{
  "_id": {
    "$oid": "507f1f77bcf86cd799439011"
  },
  "email": "admin@restaurant.com",
  "password": "$2b$10$YourHashedPasswordHere",
  "name": "Admin Owner",
  "role": "owner",
  "createdAt": {
    "$date": "2026-03-04T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-03-04T00:00:00.000Z"
  }
}
```

> **Note:** Use a password hash from an online bcrypt generator or run the script first

---

## Method 3: MongoDB Shell Commands

### Step 1: Connect to MongoDB Shell

```bash
mongosh "mongodb://localhost:27017"
```

### Step 2: Select Database

```javascript
use restaurant_saas
```

### Step 3: Insert Owner

```javascript
// First, hash the password using Node.js or an online tool
// Password: Admin@12345
// Hash: $2b$10$pOqvVHuPDLt2bhN...etc (example, generate real one)

db.users.insertOne({
  email: "admin@restaurant.com",
  password: "$2b$10$pOqvVHuPDLt2bhNwkeufL.h6gNtxBV2sxW4LVQ/rN.5gXvCQiGLRW", // Admin@12345
  name: "Admin Owner",
  role: "owner",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### Step 4: Verify

```javascript
db.users.findOne({ email: "admin@restaurant.com" });
```

---

## Method 4: Update Existing User to Owner

If you already have an account, run this:

```javascript
// MongoDB Shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "owner" } },
);
```

---

## 🔐 Login Credentials

After setup, use these to login:

```
Email:    admin@restaurant.com
Password: Admin@12345
```

### Login Steps:

1. Go to `/login`
2. Enter email: `admin@restaurant.com`
3. Enter password: `Admin@12345`
4. Click "Sign In"
5. You'll be redirected to `/dashboard`
6. Click "Admin Dashboard" to access admin panel

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Owner account created in MongoDB
- [ ] Can login at `/login` with credentials
- [ ] Dashboard loads after login
- [ ] Can access `/dashboard/admin`
- [ ] Can view Admin Dashboard menu

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**

- Change these credentials after first login
- Never commit real passwords to git
- Use strong passwords in production
- Store passwords securely

---

## Troubleshooting

### ❌ "Wrong email or password" error

- Check if account exists in MongoDB
- Verify password hash is correct
- Try Method 1 (automated script)

### ❌ Cannot access admin panel

- Verify role is set to `"owner"` in MongoDB
- Try logging out and back in
- Check middleware.js is configured correctly

### ❌ Script fails to run

```bash
# Make sure node_modules is installed
npm install

# Make sure bcrypt is installed
npm install bcrypt

# Then try again
node scripts/setup-owner.js
```

---

## Next Steps

After successful login:

1. **Update Profile** - Change your name and email
2. **Create Test Accounts** - Add more users from `/dashboard/admin/users`
3. **Configure Settings** - Set platform settings at `/dashboard/admin/settings`
4. **Add Restaurants** - Invite restaurant partners to join

---

## MongoDB Connection Issues?

If script can't connect, check:

1. **MongoDB is running**

   ```bash
   # macOS
   brew services start mongodb-community

   # Windows (if installed as service)
   net start MongoDB

   # Docker
   docker ps | grep mongo
   ```

2. **Connection string is correct**

   ```bash
   # Check .env file
   cat .env | grep MONGODB_URI
   ```

3. **Firewall allows connection**
   - Default MongoDB port: `27017`
   - Check if port is blocked

---

## Need Help?

If setup fails:

1. Check MongoDB logs
2. Verify database exists
3. Ensure bcrypt is installed
4. Run with verbose output: `node scripts/setup-owner.js --verbose`
