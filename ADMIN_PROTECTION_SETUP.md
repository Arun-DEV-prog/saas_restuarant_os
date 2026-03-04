# Admin Route Protection System

Complete admin/owner protected routes system for your SaaS product.

## 📁 Files Created

### 1. **middleware.js** (Root)

- Protects all `/api/admin/*` and `/dashboard/admin/*` routes
- Checks JWT token for valid user role
- Redirects unauthorized users to login or unauthorized page
- Provides detailed error responses for API routes

### 2. **src/lib/auth.js** (Updated)

- Added role tracking in authentication
- Includes `role` and `restaurantId` in JWT token and session
- User roles: `"owner"`, `"admin"`, `"restaurant_owner"`, `"user"`

### 3. **src/lib/authHelpers.js** (New)

Helper functions for protecting routes and checking permissions:

- `getCurrentUser()` - Get current authenticated user
- `isProjectOwner(userId)` - Check if user is project owner
- `isProjectAdmin(userId)` - Check if user is owner or admin
- `isRestaurantOwner(userId, restaurantId)` - Check restaurant ownership
- `requireAuth(session)` - Middleware for auth check
- `requireOwner(session)` - Middleware for owner check
- `requireAdmin(session)` - Middleware for admin check
- `requireRestaurantOwner(session, restaurantId)` - Check restaurant access

### 4. **src/components/ProtectedAdminRoute.jsx** (New)

React client component to protect pages requiring admin access:

```jsx
<ProtectedAdminRoute requiredRole="admin">
  <YourComponent />
</ProtectedAdminRoute>
```

### 5. **src/app/unauthorized/page.jsx** (New)

User-friendly error page shown when accessing restricted routes

### 6. **src/app/(dashboard)/dashboard/admin/page.jsx** (New)

Admin dashboard homepage with links to admin sections

### 7. **src/app/api/admin/system/stats/route.js** (New)

Example protected API route

---

## 🚀 Usage Examples

### Protecting a Page Component

```jsx
// app/(dashboard)/dashboard/admin/restaurants/page.jsx
"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function AdminRestaurantsPage() {
  return (
    <ProtectedAdminRoute requiredRole="admin">
      <div>
        <h1>Manage Restaurants</h1>
        {/* Your admin content */}
      </div>
    </ProtectedAdminRoute>
  );
}
```

### Protecting an API Route

```javascript
// app/api/admin/restaurants/list/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/lib/authHelpers";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    const authCheck = await requireAdmin(session);

    if (!authCheck.authorized) {
      return Response.json(
        { error: authCheck.error },
        { status: authCheck.status },
      );
    }

    const db = await getDb();
    const restaurants = await db.collection("restaurants").find({}).toArray();

    return Response.json({ success: true, restaurants });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 },
    );
  }
}
```

### Checking Permissions in Server Components

```javascript
// app/(dashboard)/dashboard/admin/layout.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isProjectAdmin } from "@/lib/authHelpers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = await isProjectAdmin(session.user.id);
  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return <div>{children}</div>;
}
```

---

## 👥 User Roles

### Owner (Project Owner)

- Full access to all admin routes
- Can manage all restaurants and users
- Can configure system settings
- Access to billing and revenue reports
- Role value: `"owner"`

### Admin

- Administrative access (can be assigned by owner)
- Can manage restaurants and users
- Access to analytics and settings
- Role value: `"admin"`

### Restaurant Owner

- Access to their own restaurant dashboard
- Manage menu, orders, tables
- View restaurant-specific analytics
- Role value: `"restaurant_owner"`

### User

- Standard user access
- Can view own data only
- Role value: `"user"`

---

## 🔐 Database Schema Update

Add `role` field to users collection:

```javascript
// In your user registration or user model
{
  _id: ObjectId,
  email: String,
  name: String,
  password: String,
  role: String,  // "owner", "admin", "restaurant_owner", "user"
  restaurantId: ObjectId,  // For restaurant owners
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📋 Protected Routes

### Admin Routes (Owner/Admin only)

```
GET/POST  /api/admin/system/stats
GET/POST  /api/admin/restaurants/*
GET/POST  /api/admin/users/*
GET/POST  /api/admin/settings/*
GET/POST  /api/admin/activity/*

/dashboard/admin
/dashboard/admin/analytics
/dashboard/admin/restaurants
/dashboard/admin/users
/dashboard/admin/settings
/dashboard/admin/activity
/dashboard/admin/revenue
```

---

## 🔗 How It Works

```
User Request
    ↓
middleware.js (Check Route)
    ↓
    ├─ Admin Route?
    │  ├─ Get Token
    │  ├─ Check Role
    │  └─ Pass/Fail
    │
    └─ Regular Route?
       └─ Pass Through

Authorized? YES
    ↓
Next.js Handler
    ↓
Page Component or API Handler

Authorized? NO
    ├─ API Route → 403 JSON
    └─ Page → Redirect to /unauthorized
```

---

## 🧪 Testing

### Test 1: Owner Access

1. Login with owner account
2. Navigate to `/dashboard/admin`
3. Should display admin dashboard ✓

### Test 2: Non-Owner Access

1. Login with regular user
2. Try `/dashboard/admin`
3. Should redirect to `/unauthorized` ✓

### Test 3: Unauthenticated Access

1. Clear cookies/logout
2. Try `/api/admin/system/stats`
3. Should return 401 Unauthorized ✓

---

## 🔄 Next Steps

1. **Update User Registration** - Assign appropriate roles to new users
2. **Admin Panel Pages** - Create admin components for restaurants, users, settings
3. **Role Management** - Build UI for changing user roles
4. **Audit Logging** - Track admin actions
5. **Billing Integration** - Tie features to subscription levels

---

## 🛠️ Installation Checklist

- [x] Middleware created
- [x] Auth helpers created
- [x] ProtectedAdminRoute component created
- [x] Unauthorized page created
- [x] Admin dashboard page created
- [x] Example API route created
- [ ] Update database schema with role field
- [ ] Assign roles to existing users
- [ ] Create admin management pages
- [ ] Test all protected routes
