// lib/authHelpers.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Check if user is authenticated
 * @returns {Promise<object|null>} User session or null
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is a project owner
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function isProjectOwner(userId) {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      role: "owner",
    });
    return !!user;
  } catch (error) {
    console.error("Error checking project owner:", error);
    return false;
  }
}

/**
 * Check if user is project admin (owner or admin role)
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function isProjectAdmin(userId) {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      role: { $in: ["owner", "admin"] },
    });
    return !!user;
  } catch (error) {
    console.error("Error checking project admin:", error);
    return false;
  }
}

/**
 * Check if user is a restaurant owner
 * @param {string} userId - User ID to check
 * @param {string} restaurantId - Restaurant ID to verify ownership
 * @returns {Promise<boolean>}
 */
export async function isRestaurantOwner(userId, restaurantId) {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      restaurantId: new ObjectId(restaurantId),
      role: "restaurant_owner",
    });
    return !!user;
  } catch (error) {
    console.error("Error checking restaurant owner:", error);
    return false;
  }
}

/**
 * Protect API route - requires authentication
 * @param {object} session - Session object
 * @returns {Promise<{authorized: boolean, error?: string}>}
 */
export async function requireAuth(session) {
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Unauthorized - Please login",
      status: 401,
    };
  }
  return { authorized: true };
}

/**
 * Protect API route - requires project owner role
 * @param {object} session - Session object
 * @returns {Promise<{authorized: boolean, error?: string}>}
 */
export async function requireOwner(session) {
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Unauthorized - Please login",
      status: 401,
    };
  }

  const isOwner = await isProjectOwner(session.user.id);
  if (!isOwner) {
    return {
      authorized: false,
      error: "Forbidden - Project owner role required",
      status: 403,
    };
  }

  return { authorized: true };
}

/**
 * Protect API route - requires admin role (owner or admin)
 * @param {object} session - Session object
 * @returns {Promise<{authorized: boolean, error?: string}>}
 */
export async function requireAdmin(session) {
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Unauthorized - Please login",
      status: 401,
    };
  }

  const isAdmin = await isProjectAdmin(session.user.id);
  if (!isAdmin) {
    return {
      authorized: false,
      error: "Forbidden - Admin role required",
      status: 403,
    };
  }

  return { authorized: true };
}

/**
 * Protect API route - requires restaurant owner for specific restaurant
 * @param {object} session - Session object
 * @param {string} restaurantId - Restaurant ID to verify
 * @returns {Promise<{authorized: boolean, error?: string}>}
 */
export async function requireRestaurantOwner(session, restaurantId) {
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Unauthorized - Please login",
      status: 401,
    };
  }

  // Project owner has access to all restaurants
  const isProjectOwner = await isProjectOwner(session.user.id);
  if (isProjectOwner) {
    return { authorized: true };
  }

  // Check if user is owner of this specific restaurant
  const isOwner = await isRestaurantOwner(session.user.id, restaurantId);
  if (!isOwner) {
    return {
      authorized: false,
      error: "Forbidden - Restaurant owner permission required",
      status: 403,
    };
  }

  return { authorized: true };
}

/**
 * Get user role from session
 * @param {object} session - Session object
 * @returns {string} User role or 'user'
 */
export function getUserRole(session) {
  return session?.user?.role || "user";
}

/**
 * Check if user is project owner from session
 * @param {object} session - Session object
 * @returns {boolean}
 */
export function isOwnerFromSession(session) {
  return getUserRole(session) === "owner";
}

/**
 * Check if user is admin from session
 * @param {object} session - Session object
 * @returns {boolean}
 */
export function isAdminFromSession(session) {
  const role = getUserRole(session);
  return role === "admin" || role === "owner";
}
