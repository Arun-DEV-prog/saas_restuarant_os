import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define protected routes
const ADMIN_ROUTES = ["/api/admin", "/dashboard/admin"];
const OWNER_ONLY_ROUTES = ["/api/admin", "/dashboard/admin"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if route requires admin/owner protection
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.warn(`❌ Unauthorized access attempt to ${pathname} - no token`);

      // For API routes, return 401
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Unauthorized - Please login" },
          { status: 401 },
        );
      }

      // For pages, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user has owner/admin role
    const userRole = token.role || token.userRole;
    const isOwner = userRole === "owner";
    const isAdmin = userRole === "admin";
    const isAuthorized = isOwner || isAdmin;

    console.log(
      `[Middleware Auth] Path: ${pathname}, Role: ${userRole}, Authorized: ${isAuthorized}`,
    );

    if (!isAuthorized) {
      console.warn(
        `❌ Access denied to ${pathname} for user with role: ${userRole}`,
      );

      // For API routes, return 403
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          {
            error: "Forbidden - Insufficient permissions",
            requiredRole: "owner or admin",
            userRole: userRole || "unknown",
            message: `User role '${userRole}' is not authorized for admin routes. Required: 'admin' or 'owner'`,
          },
          { status: 403 },
        );
      }

      // For pages, redirect to unauthorized
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Log successful admin access
    console.log(
      `✅ Admin access granted to ${pathname} for user role: ${userRole}`,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect API admin routes
    "/api/admin/:path*",
    // Protect dashboard admin routes
    "/dashboard/admin/:path*",
  ],
};
