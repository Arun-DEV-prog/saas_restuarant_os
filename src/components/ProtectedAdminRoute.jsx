"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Component to protect routes requiring project owner/admin access
 * Usage: Wrap pages that require protection
 *
 * Example:
 * <ProtectedAdminRoute>
 *   <YourAdminComponent />
 * </ProtectedAdminRoute>
 */
export default function ProtectedAdminRoute({
  children,
  requiredRole = "admin",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      // Not logged in - redirect to login
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role || "user";

      // Check if user has required role
      let hasAccess = false;

      if (requiredRole === "owner") {
        hasAccess = userRole === "owner";
      } else if (requiredRole === "admin") {
        hasAccess = userRole === "owner" || userRole === "admin";
      }

      if (!hasAccess) {
        console.warn(
          `Access denied: User with role '${userRole}' attempted to access ${pathname}`,
        );
        router.push("/unauthorized");
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [session, status, router, pathname, requiredRole]);

  // Show loading state
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authorized - don't render
  if (!isAuthorized) {
    return null;
  }

  // Authorized - render children
  return children;
}
