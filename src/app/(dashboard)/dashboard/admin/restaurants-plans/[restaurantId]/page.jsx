import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RestaurantPlanDetailsPage({
  params: paramsPromise,
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || session?.user?.userRole;

  if (!session || !["admin", "owner"].includes(userRole)) {
    redirect("/login");
  }

  const { restaurantId } = await paramsPromise;

  const restaurants = await getCollection("restaurants");
  const restaurant = await restaurants.findOne({
    _id: new ObjectId(restaurantId),
  });

  if (!restaurant) {
    redirect("/dashboard/admin/restaurants-plans");
  }

  const planId = restaurant.planId || "starter";
  const planMap = {
    starter: { name: "Starter Plan", price: 29 },
    professional: { name: "Professional Plan", price: 79 },
    enterprise: { name: "Enterprise Plan", price: 199 },
  };

  const plan = planMap[planId];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin/restaurants-plans"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Restaurant Plans
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {restaurant.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {restaurant.email}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Restaurant Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Restaurant Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Name
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Phone
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.phone || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  City
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.city || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Created Date
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.createdAt ? new Date(
                    restaurant.createdAt
                  ).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Plan Information
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Plan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {plan.name}
                </p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
                  ${plan.price}/month
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Plan Status
                </label>
                <p className="text-gray-900 dark:text-white mt-1 capitalize">
                  {restaurant.planStatus || "active"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Since
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.planActiveSince
                    ? new Date(restaurant.planActiveSince).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Renewal Date
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {restaurant.planRenewalDate
                    ? new Date(restaurant.planRenewalDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <button className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                Change Plan
              </button>
            </div>
          </div>
        </div>

        {/* Plan Limits */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Plan Limits & Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {planId === "starter" && (
              <>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Menus: 1
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Food Items: 50
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Tables: 5
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Team Users: 1
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    API Calls/Day: 10,000
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Storage: 1 GB
                  </p>
                </div>
              </>
            )}

            {planId === "professional" && (
              <>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Menus: 5
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Food Items: 200
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Tables: 20
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Team Users: 5
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    API Calls/Day: 50,000
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Storage: 10 GB
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Stripe Connect
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Analytics
                  </p>
                </div>
              </>
            )}

            {planId === "enterprise" && (
              <>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Menus: Unlimited
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Food Items: Unlimited
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Tables: Unlimited
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Team Users: Unlimited
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    API Calls/Day: Unlimited
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Storage: 100 GB
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Stripe Connect
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Custom Domain
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Advanced Analytics
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
