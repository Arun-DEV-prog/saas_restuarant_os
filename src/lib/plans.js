// Pricing plans for restaurants
export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter Plan",
    price: 29,
    billing: "month",
    description: "Perfect for new restaurants",
    features: {
      menus: 1,
      items: 50,
      tables: 5,
      apiCalls: 10000,
      storageGb: 1,
      users: 1,
      orders: 100,
      stripeConnect: false,
      customDomain: false,
      analytics: false,
    },
    limits: {
      maxMenus: 1,
      maxFoodItems: 50,
      maxTables: 5,
      maxApiCallsPerDay: 10000,
      maxStorageGb: 1,
      maxUsers: 1,
      maxOrdersPerMonth: 100,
    },
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: 79,
    billing: "month",
    description: "For growing restaurants",
    features: {
      menus: 5,
      items: 200,
      tables: 20,
      apiCalls: 50000,
      storageGb: 10,
      users: 5,
      orders: 1000,
      stripeConnect: true,
      customDomain: false,
      analytics: true,
    },
    limits: {
      maxMenus: 5,
      maxFoodItems: 200,
      maxTables: 20,
      maxApiCallsPerDay: 50000,
      maxStorageGb: 10,
      maxUsers: 5,
      maxOrdersPerMonth: 1000,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 199,
    billing: "month",
    description: "For large restaurant chains",
    features: {
      menus: "Unlimited",
      items: "Unlimited",
      tables: "Unlimited",
      apiCalls: "Unlimited",
      storageGb: 100,
      users: "Unlimited",
      orders: "Unlimited",
      stripeConnect: true,
      customDomain: true,
      analytics: true,
    },
    limits: {
      maxMenus: 999999,
      maxFoodItems: 999999,
      maxTables: 999999,
      maxApiCallsPerDay: 999999,
      maxStorageGb: 100,
      maxUsers: 999999,
      maxOrdersPerMonth: 999999,
    },
  },
];

export function getPlanById(planId) {
  return PRICING_PLANS.find((p) => p.id === planId);
}

export function getDefaultPlan() {
  return PRICING_PLANS[0]; // Starter plan by default
}
