"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { ShoppingBag, Search, Sparkles, ChefHat } from "lucide-react";
import { MascotChoux } from "./MascotChoux";

interface NavbarProps {
  activeTab?: "menu" | "status" | "reviews" | "admin";
  setActiveTab?: (tab: "menu" | "status" | "reviews" | "admin") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = "menu", setActiveTab }) => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur border-b-neo border-brand-dark px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <Link
          href="/"
          onClick={(e) => {
            if (setActiveTab) {
              e.preventDefault();
              setActiveTab("menu");
            }
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-neo-sm bg-brand-pink border-2 border-brand-dark flex items-center justify-center shadow-neo-sm group-hover:rotate-6 transition-transform">
            <MascotChoux pose="happy" size={32} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-brand-dark">
                KiMiko<span className="text-brand-accent">Sweets</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-brand-butter text-brand-dark px-2 py-0.5 rounded-full border border-brand-dark shadow-[1px_1px_0px_#1A1A1A]">
                Choux Pastry
              </span>
            </div>
            <p className="text-[11px] font-semibold text-brand-dark/70 hidden sm:block -mt-1">
              Renyah Di Luar • Lumer Di Dalam
            </p>
          </div>
        </Link>

        {/* Navigation Tabs (Mobile & Desktop) */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab && setActiveTab("menu")}
            className={`px-3 py-1.5 rounded-neo-sm text-xs sm:text-sm font-bold border-2 border-brand-dark transition-all ${
              activeTab === "menu"
                ? "bg-brand-accent text-white shadow-neo-sm"
                : "bg-white hover:bg-brand-pink/40"
            }`}
          >
            Menu
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("status")}
            className={`px-3 py-1.5 rounded-neo-sm text-xs sm:text-sm font-bold border-2 border-brand-dark flex items-center gap-1 transition-all ${
              activeTab === "status"
                ? "bg-brand-butter text-brand-dark shadow-neo-sm"
                : "bg-white hover:bg-brand-butter/40"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cek Status</span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("reviews")}
            className={`px-3 py-1.5 rounded-neo-sm text-xs sm:text-sm font-bold border-2 border-brand-dark hidden xs:flex items-center gap-1 transition-all ${
              activeTab === "reviews"
                ? "bg-brand-pink text-brand-dark shadow-neo-sm"
                : "bg-white hover:bg-brand-pink/40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ulasan</span>
          </button>

          {/* Cart Button with badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 sm:px-4 py-1.5 rounded-neo-sm bg-brand-pink text-brand-dark font-bold text-xs sm:text-sm border-2 border-brand-dark neo-btn-sm flex items-center gap-1.5"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="bg-brand-accent text-white text-[11px] font-extrabold px-1.5 py-0.2 rounded-full border border-brand-dark shadow-[1px_1px_0px_#1A1A1A] animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Admin link */}
          <Link
            href="/admin"
            className="p-1.5 rounded-neo-sm bg-brand-cream border-2 border-brand-dark hover:bg-brand-butter neo-btn-sm"
            title="Dashboard Penjual"
          >
            <ChefHat className="w-4 h-4 text-brand-dark" />
          </Link>
        </nav>
      </div>
    </header>
  );
};
