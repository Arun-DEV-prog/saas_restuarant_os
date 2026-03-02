"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Left: Logo / Name */}
        <div className="flex flex-col md:items-start items-center">
          <h2 className="text-2xl font-bold text-white mb-2">YourCompany</h2>
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
        </div>

        {/* Middle: Navigation */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Products</span>
            <a href="#" className="text-slate-400 hover:text-white transition">Menu</a>
            <a href="#" className="text-slate-400 hover:text-white transition">Order</a>
            <a href="#" className="text-slate-400 hover:text-white transition">Pricing</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Company</span>
            <a href="#" className="text-slate-400 hover:text-white transition">About Us</a>
            <a href="#" className="text-slate-400 hover:text-white transition">Careers</a>
            <a href="#" className="text-slate-400 hover:text-white transition">Blog</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Support</span>
            <a href="#" className="text-slate-400 hover:text-white transition">Help Center</a>
            <a href="#" className="text-slate-400 hover:text-white transition">Contact</a>
            <a href="#" className="text-slate-400 hover:text-white transition">Privacy Policy</a>
          </div>
        </div>

        {/* Right: Social Icons */}
        <div className="flex gap-4 md:justify-end justify-center mt-4 md:mt-0">
          <a href="#" className="text-slate-400 hover:text-white transition">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
