import { getPlanById } from "./plans";

/**
 * Check if a restaurant has reached a specific limit for their plan
 * @param {Object} restaurant - The restaurant document
 * @param {string} limitKey - The limit key (e.g., 'maxFoodItems', 'maxTables')
 * @param {number} currentValue - The current value
 * @returns {Object} - { allowed: boolean, remaining: number, limit: number }
 */
export function checkPlanLimit(restaurant, limitKey, currentValue = 0) {
  const plan = getPlanById(restaurant?.planId || "starter");

  if (!plan || !plan.limits[limitKey]) {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  const limit = plan.limits[limitKey];
  const remaining = limit - currentValue;

  return {
    allowed: currentValue < limit,
    remaining: Math.max(0, remaining),
    limit,
    current: currentValue,
    percentage: Math.round((currentValue / limit) * 100),
  };
}

/**
 * Get all plan limits for a restaurant
 * @param {Object} restaurant - The restaurant document
 * @returns {Object} - The plan limits
 */
export function getPlanLimits(restaurant) {
  const plan = getPlanById(restaurant?.planId || "starter");
  return plan?.limits || {};
}

/**
 * Get the current plan for a restaurant
 * @param {Object} restaurant - The restaurant document
 * @returns {Object} - The plan object
 */
export function getRestaurantPlan(restaurant) {
  return getPlanById(restaurant?.planId || "starter");
}

/**
 * Check if a restaurant has access to a specific feature
 * @param {Object} restaurant - The restaurant document
 * @param {string} featureKey - The feature key (e.g., 'stripeConnect', 'customDomain')
 * @returns {boolean}
 */
export function hasFeature(restaurant, featureKey) {
  const plan = getPlanById(restaurant?.planId || "starter");
  return (
    plan?.features[featureKey] !== false || plan?.features[featureKey] !== 0
  );
}

/**
 * Format limit value for display
 * @param {number} value - The value to format
 * @returns {string}
 */
export function formatLimit(value) {
  if (value === 999999) return "Unlimited";
  if (value >= 1000000) return "Unlimited";
  return value?.toLocaleString() || "0";
}
