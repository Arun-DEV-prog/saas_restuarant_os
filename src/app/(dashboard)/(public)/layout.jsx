import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navber";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-slate-950">
      {/* Sidebar (desktop) */}
      <Navbar />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4 md:p-6">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
