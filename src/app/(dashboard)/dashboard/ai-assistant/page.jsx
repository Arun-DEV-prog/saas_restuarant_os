import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AIDashboard from "./ai-dashboard-client";

export const metadata = {
  title: "AI Assistant | Restaurant Dashboard",
  description: "AI-powered restaurant automation and insights",
};

export default async function AIPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1020] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <AIDashboard />
      </div>
    </div>
  );
}
