import Link from "next/link";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-zinc-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            M
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-800 dark:text-zinc-100">
            MallInsight
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
          >
            Home
          </Link>

          <Link
            href="/menu"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
          >
            Menu
          </Link>

          <Link
            href="/product"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
          >
            Product
          </Link>

          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
          >
            Pricing
          </Link>
        </div>

        {/* Auth Buttons + Dark Mode */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Button
            variant="ghost"
            className="rounded-full text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Link href="/login">Login</Link>
          </Button>

          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
