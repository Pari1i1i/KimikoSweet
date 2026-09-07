"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import { dataService } from "@/lib/dataService";
import { Order } from "@/types";
import { OrdersDatagrid } from "@/components/OrdersDatagrid";
import { ProductionDatagrid } from "@/components/ProductionDatagrid";
import { IncomeDashboard } from "@/components/IncomeDashboard";
import { MascotChoux } from "@/components/MascotChoux";
import { Footer } from "@/components/Footer";
import { 
  Lock, 
  Layers, 
  Wallet, 
  ShoppingBag, 
  LogOut, 
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

function AdminPageContent() {
  const { user, loading: authLoading, login, logout, isMockAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Active Tab
  const [activeAdminTab, setActiveAdminTab] = useState<"orders" | "production" | "income">("orders");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsub = dataService.subscribeOrders((data) => {
      setOrders(data);
    });
    return () => unsub();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Email atau password salah.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  // Jika Belum Login: Tampilkan Login Box Neobrutalism
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <div className="p-4 max-w-6xl mx-auto w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo-sm bg-white border-2 border-brand-dark text-xs font-bold neo-btn-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Pembeli</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-neo-lg border-neo-thick border-brand-dark shadow-neo-xl overflow-hidden animate-scale-up">
            <div className="p-6 bg-brand-butter border-b-neo border-brand-dark text-center relative">
              <div className="w-16 h-16 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center mx-auto shadow-neo-sm">
                <MascotChoux pose="chef" size={48} />
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-brand-dark mt-3">
                Dapur Penjual KiMiko
              </h2>
              <p className="text-xs text-brand-dark/80 font-medium mt-1">
                Silakan masuk untuk mengelola pesanan, rekap produksi & keuangan live.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-neo-sm bg-red-100 border-2 border-red-500 text-red-900 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {isMockAuth && (
                <div className="p-2.5 rounded-neo-sm bg-brand-cream border border-brand-dark/40 text-[11px] text-brand-dark font-medium">
                  💡 <strong>Mode Demo / Offline:</strong> Masukkan email & password apa saja (min 6 karakter) untuk masuk ke dashboard.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Email Akun Penjual
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@kimikosweets.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-neo-sm neo-input text-xs font-semibold text-brand-dark bg-brand-bg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-neo-sm neo-input text-xs font-semibold text-brand-dark bg-brand-bg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-sm neo-btn flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  "Memproses..."
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Jika Sudah Login: Tampilkan Dashboard Lengkap Penjual
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-40 bg-brand-butter border-b-neo border-brand-dark px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-neo-sm bg-white border-2 border-brand-dark neo-btn-sm"
              title="Ke Toko Pembeli"
            >
              <ArrowLeft className="w-4 h-4 text-brand-dark" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center">
                <MascotChoux pose="chef" size={30} />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-lg sm:text-xl text-brand-dark leading-tight">
                  Dashboard Penjual KiMiko
                </h1>
                <p className="text-[11px] font-semibold text-brand-dark/70 hidden sm:block">
                  Live Management • {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-neo-sm bg-white border-2 border-brand-dark text-xs font-bold neo-btn-sm flex items-center gap-1.5 text-brand-dark"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="border-b-2 border-brand-dark bg-white px-4">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveAdminTab("orders")}
            className={`px-4 py-2 rounded-neo-sm font-heading font-bold text-xs sm:text-sm border-2 border-brand-dark flex items-center gap-2 transition-all shrink-0 ${
              activeAdminTab === "orders"
                ? "bg-brand-accent text-white shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-pink/40"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Pesanan Pembeli ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("production")}
            className={`px-4 py-2 rounded-neo-sm font-heading font-bold text-xs sm:text-sm border-2 border-brand-dark flex items-center gap-2 transition-all shrink-0 ${
              activeAdminTab === "production"
                ? "bg-brand-butter text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-butter/40"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Total Produksi per Varian</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("income")}
            className={`px-4 py-2 rounded-neo-sm font-heading font-bold text-xs sm:text-sm border-2 border-brand-dark flex items-center gap-2 transition-all shrink-0 ${
              activeAdminTab === "income"
                ? "bg-brand-pink text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-pink/40"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>3. Manajemen Pendapatan & Sesi</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-1">
        {activeAdminTab === "orders" && <OrdersDatagrid orders={orders} />}
        {activeAdminTab === "production" && <ProductionDatagrid orders={orders} />}
        {activeAdminTab === "income" && <IncomeDashboard orders={orders} />}
      </main>

      <Footer />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminPageContent />
      </CartProvider>
    </AuthProvider>
  );
}
