"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { ShoppingBag, Search, ChefHat } from "lucide-react";
import { MascotChoux } from "./MascotChoux";

interface NavbarProps {
  activeTab?: "menu" | "status" | "reviews";
  setActiveTab?: (tab: "menu" | "status" | "reviews") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = "menu", setActiveTab }) => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur border-b-neo border-brand-dark px-3 sm:px-4 py-2.5 sm:py-3 w-full">
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
          className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-neo-sm bg-brand-pink border-2 border-brand-dark flex items-center justify-center shadow-neo-sm group-hover:rotate-6 transition-transform shrink-0">
            <MascotChoux pose="happy" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-heading text-base xs:text-lg sm:text-2xl font-bold tracking-tight text-brand-dark">
                KiMiko<span className="text-brand-accent">Sweets</span>
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest bg-brand-butter text-brand-dark px-2 py-0.5 rounded-full border border-brand-dark shadow-[1px_1px_0px_#1A1A1A]">
                Choux Pastry
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-brand-dark/70 hidden sm:block -mt-1">
              Renyah Di Luar • Lumer Di Dalam
            </p>
          </div>
        </Link>

        {/* Navigation Tabs (Menu, Cek Status, Keranjang, Admin Login) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab("menu")}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-neo-sm text-xs sm:text-sm font-bold border-2 border-brand-dark transition-all ${
              activeTab === "menu"
                ? "bg-brand-accent text-white shadow-neo-sm"
                : "bg-white hover:bg-brand-pink/40"
            }`}
          >
            Menu
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab("status")}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-neo-sm text-xs sm:text-sm font-bold border-2 border-brand-dark flex items-center gap-1 transition-all ${
              activeTab === "status"
                ? "bg-brand-butter text-brand-dark shadow-neo-sm"
                : "bg-white hover:bg-brand-butter/40"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Cek Status</span>
            <span className="xs:hidden">Status</span>
          </button>

          {/* Cart Button with badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative px-2.5 sm:px-4 py-1.5 rounded-neo-sm bg-brand-pink text-brand-dark font-bold text-xs sm:text-sm border-2 border-brand-dark neo-btn-sm flex items-center gap-1 cursor-pointer"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="bg-brand-accent text-white text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.2 rounded-full border border-brand-dark shadow-[1px_1px_0px_#1A1A1A] animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Tombol Login Admin / Dapur Penjual */}
          <Link
            href="/admin"
            className="w-8 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-neo-sm bg-brand-butter border-2 border-brand-dark hover:bg-brand-butter/80 neo-btn-sm flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95 transition-transform shadow-neo-sm shrink-0"
            title="Dapur Penjual (Admin Login)"
            aria-label="Dapur Penjual"
          >
            <ChefHat className="w-4 h-4 text-brand-dark shrink-0" />
            <span className="text-xs font-extrabold text-brand-dark hidden sm:inline">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

