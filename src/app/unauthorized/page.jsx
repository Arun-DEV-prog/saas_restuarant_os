import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You don't have permission to access this resource. Only project owners
          and admins can view this page.
        </p>

        {/* Details */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Required Permission:</strong> Admin or Owner role
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>

        {/* Button */}
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          <Home size={18} />
          Back to Dashboard
        </Link>

        {/* Additional Help */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Need help? Contact support@yourapp.com
        </p>
      </div>
    </div>
  );
}
