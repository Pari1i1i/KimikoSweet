"use client";

import React, { useState } from "react";
import { PRODUCTS_DATA } from "@/data/products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartCheckoutModal } from "@/components/CartCheckoutModal";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import { ReviewsWall } from "@/components/ReviewsWall";
import { MascotChoux } from "@/components/MascotChoux";
import { CartProvider, useCart } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";
import { 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Search, 
  Star
} from "lucide-react";

function HomePageContent() {
  const [activeTab, setActiveTab] = useState<"menu" | "status" | "reviews">("menu");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "classic" | "special">("all");
  const { totalItems, setIsCartOpen } = useCart();

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.kategori === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-butter selection:text-brand-dark">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-20 sm:pb-24 w-full flex-1 space-y-10">
        {/* TAMPILAN TAB 1: MENU UTAMA & HERO */}
        {activeTab === "menu" && (
          <>
            {/* Hero Section Neobrutalism */}
            <section className="relative overflow-hidden rounded-neo-lg bg-brand-pink border-neo-thick border-brand-dark p-4 sm:p-8 shadow-neo-lg w-full">
              {/* Decorative Floating Badges */}
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-1 bg-brand-butter border-2 border-brand-dark px-3 py-1 rounded-full shadow-neo-sm rotate-6">
                <Star className="w-3.5 h-3.5 fill-brand-dark text-brand-dark" />
                <span className="text-xs font-bold text-brand-dark">100% Homemade</span>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-12 gap-5 sm:gap-6 items-center">
                {/* Left Text */}
                <div className="w-full md:col-span-7 space-y-3.5 sm:space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-brand-cream border-2 border-brand-dark text-[11px] sm:text-sm font-extrabold text-brand-dark shadow-neo-sm max-w-full">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-accent animate-pulse shrink-0" />
                    <span className="truncate">Kue sus termantep di SMAN 105 Jakarta! 🔥</span>
                  </div>

                  <h1 className="font-heading text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
                    Cita Rasa Mewah, <br className="hidden sm:inline" />
                    Sensasi <span className="bg-brand-butter px-2 py-0.5 rounded-neo-sm border-2 border-brand-dark inline-block rotate-1 shadow-neo-sm text-brand-dark">Lumer</span> di Setiap Gigitan!
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-brand-dark/90 font-medium max-w-xl">
                    Nikmati 13 pilihan rasa kue sus premium. Dibuat fresh setiap hari dengan bahan pilihan dan isian custard melimpah yang manisnya pas.
                  </p>

                  <div className="pt-1 sm:pt-2 flex flex-col xs:flex-row items-stretch xs:items-center justify-center md:justify-start gap-2.5 w-full xs:w-auto">
                    <a
                      href="#menu-catalog"
                      className="w-full xs:w-auto px-5 py-2.5 sm:py-3 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs sm:text-sm md:text-base neo-btn flex items-center justify-center gap-2 text-center"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Lihat Menu Lengkap</span>
                    </a>

                    <button
                      onClick={() => setActiveTab("status")}
                      className="w-full xs:w-auto px-4 py-2.5 sm:py-3 rounded-neo-sm bg-white text-brand-dark font-heading font-bold text-xs sm:text-sm md:text-base neo-btn-sm flex items-center justify-center gap-2 border-2 border-brand-dark text-center"
                    >
                      <Search className="w-4 h-4" />
                      <span>Cek Pesanan Kamu</span>
                    </button>
                  </div>
                </div>

                {/* Right Mascot Hero Card */}
                <div className="w-full md:col-span-5 flex justify-center">
                  <div className="relative p-4 sm:p-6 rounded-neo-lg bg-brand-cream border-neo-thick border-brand-dark shadow-neo flex flex-col items-center text-center w-full max-w-[260px] sm:max-w-xs">
                    <div className="animate-bounce duration-1000">
                      <MascotChoux pose="welcome" size={120} />
                    </div>

                    <div className="mt-2 bg-white px-3 py-1.5 sm:py-2 rounded-neo-sm border-2 border-brand-dark shadow-neo-sm w-full">
                      <p className="font-heading font-bold text-xs sm:text-sm text-brand-dark">
                        &ldquo;Mau rasa apa hari ini, Kak?&rdquo;
                      </p>
                      <span className="text-[10px] sm:text-[11px] text-brand-accent font-extrabold uppercase tracking-wide">
                        — Oxiovir the Mascot
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Menu Header & Category Filters */}
            <section id="menu-catalog" className="space-y-4 pt-2 w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-3 sm:gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark">
                    Pilihan Varian Kue Sus (13 Rasa) 🥟
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-dark/80 font-medium">
                    Pilih varian kesukaanmu, tentukan jumlahnya, dan masukkan ke keranjang belanja.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white p-1 sm:p-1.5 rounded-neo border-2 border-brand-dark shadow-neo-sm w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-neo-sm text-[11px] sm:text-xs font-bold transition-all text-center ${
                      selectedCategory === "all"
                        ? "bg-brand-dark text-white shadow-neo-sm"
                        : "hover:bg-brand-pink/50 text-brand-dark"
                    }`}
                  >
                    Semua (13)
                  </button>
                  <button
                    onClick={() => setSelectedCategory("classic")}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-neo-sm text-[11px] sm:text-xs font-bold transition-all text-center ${
                      selectedCategory === "classic"
                        ? "bg-brand-pink text-brand-dark shadow-neo-sm font-extrabold"
                        : "hover:bg-brand-pink/50 text-brand-dark"
                    }`}
                  >
                    Classic @6K
                  </button>
                  <button
                    onClick={() => setSelectedCategory("special")}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-neo-sm text-[11px] sm:text-xs font-bold transition-all text-center ${
                      selectedCategory === "special"
                        ? "bg-brand-butter text-brand-dark shadow-neo-sm font-extrabold"
                        : "hover:bg-brand-butter/50 text-brand-dark"
                    }`}
                  >
                    Special @7K
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 w-full">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </section>

            {/* Bagian Dinding Ulasan juga ditampilkan di bawah katalog menu utama */}
            <section className="pt-6 border-t-2 border-brand-dark/15">
              <ReviewsWall />
            </section>
          </>
        )}

        {/* TAMPILAN TAB 2: CEK STATUS PESANAN */}
        {activeTab === "status" && (
          <section className="space-y-4">
            <OrderStatusTracker />
          </section>
        )}

        {/* TAMPILAN TAB 3: ULASAN PEMBELI */}
        {activeTab === "reviews" && (
          <section className="space-y-4">
            <ReviewsWall />
          </section>
        )}
      </main>

      {/* Floating Bottom Cart Bar (for Mobile / Easy Checkout) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-30 max-w-md mx-auto w-full px-4 pointer-events-none animate-bounce-subtle">
          <div className="p-3 bg-brand-butter rounded-neo border-neo-thick border-brand-dark shadow-neo-lg flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center font-heading font-extrabold text-xs border border-brand-dark">
                {totalItems}
              </div>
              <p className="text-xs font-bold text-brand-dark">
                Item siap dipesan!
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs sm:text-sm neo-btn flex items-center gap-1.5"
            >
              <span>Buka Keranjang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart & Checkout Modal */}
      <CartCheckoutModal onOrderSuccessNav={() => setActiveTab("status")} />

      {/* Footer with Mandatory Copyright Pari1i1i */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <CartProvider>
        <HomePageContent />
      </CartProvider>
    </AuthProvider>
  );
}
