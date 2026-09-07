"use client";

import React, { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import { Order, IncomeSession } from "@/types";
import { MascotChoux } from "./MascotChoux";
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  PlusCircle
} from "lucide-react";

interface IncomeDashboardProps {
  orders: Order[];
}

export const IncomeDashboard: React.FC<IncomeDashboardProps> = ({ orders }) => {
  const [session, setSession] = useState<IncomeSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputSaldoAwal, setInputSaldoAwal] = useState("");
  const [namaSesi, setNamaSesi] = useState("");

  useEffect(() => {
    const unsub = dataService.subscribeActiveSession((sess) => {
      setSession(sess);
    });
    return () => unsub();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter order yang terkonfirmasi / selesai dalam sesi ini
  const sessionStartTime = session?.mulaiPada || 0;
  const activeSessionOrders = orders.filter(
    (ord) =>
      ord.createdAt >= sessionStartTime &&
      (ord.status === "confirmed" || ord.status === "completed")
  );

  // 1. Total pendapatan yang seharusnya didapat hari ini (akumulasi harga semua order terkonfirmasi)
  const totalPendapatanTerkonfirmasi = activeSessionOrders.reduce(
    (acc, ord) => acc + ord.totalHarga,
    0
  );

  // 2. Saldo saat ini (Saldo awal + pendapatan otomatis)
  const saldoAwal = session?.saldoAwal || 0;
  const saldoSaatIni = saldoAwal + totalPendapatanTerkonfirmasi;

  // 3. Total Keuntungan (Rp1.000 per pcs kue sus yang terjual & terkonfirmasi)
  const totalPcsTerjual = activeSessionOrders.reduce(
    (acc, ord) => acc + ord.totalPcs,
    0
  );
  const totalKeuntungan = totalPcsTerjual * 1000;

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputSaldoAwal.replace(/\D/g, ""), 10) || 0;
    await dataService.startNewSession(parsed, namaSesi.trim() || "Sesi Penjualan Baru");
    setIsModalOpen(false);
    setInputSaldoAwal("");
    setNamaSesi("");
  };

  return (
    <div className="space-y-4">
      {/* Session Header Card */}
      <div className="p-4 sm:p-5 rounded-neo-lg bg-brand-pink border-neo-thick border-brand-dark shadow-neo flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-neo-sm bg-brand-butter border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-neo-sm">
            <MascotChoux pose="happy" size={40} />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h4 className="font-heading font-extrabold text-lg text-brand-dark">
                {session ? session.namaSesi || "Sesi Aktif" : "Belum Ada Sesi Aktif"}
              </h4>
            </div>
            <p className="text-xs text-brand-dark/80 font-medium">
              {session
                ? `Dimulai: ${new Date(session.mulaiPada).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} • Saldo Awal: ${formatRupiah(session.saldoAwal)}`
                : "Mulai sesi baru dan masukkan saldo awal untuk kalkulasi otomatis live."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs sm:text-sm neo-btn flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{session ? "Mulai Sesi Baru" : "Buka Sesi Penjualan"}</span>
        </button>
      </div>

      {/* 3 Metric Cards Neobrutalism */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Pendapatan Live */}
        <div className="neo-card p-4 sm:p-5 bg-white flex flex-col justify-between border-2 border-brand-dark hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-dark/70 uppercase tracking-wider">
              Pendapatan Masuk
            </span>
            <div className="w-8 h-8 rounded-neo-sm bg-brand-pink border border-brand-dark flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-accent" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-xl sm:text-2xl text-brand-dark">
              {formatRupiah(totalPendapatanTerkonfirmasi)}
            </p>
            <p className="text-[11px] font-semibold text-brand-dark/60 mt-1 flex items-center gap-1">
              <span>Dari {activeSessionOrders.length} order terkonfirmasi</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Saldo Saat Ini */}
        <div className="neo-card p-4 sm:p-5 bg-brand-butter/30 flex flex-col justify-between border-2 border-brand-dark hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Saldo Fisik Saat Ini
            </span>
            <div className="w-8 h-8 rounded-neo-sm bg-brand-butter border border-brand-dark flex items-center justify-center">
              <Wallet className="w-4 h-4 text-brand-dark" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-xl sm:text-2xl text-brand-accent">
              {formatRupiah(saldoSaatIni)}
            </p>
            <p className="text-[11px] font-bold text-brand-dark/70 mt-1">
              Saldo Awal ({formatRupiah(saldoAwal)}) + Omset Live
            </p>
          </div>
        </div>

        {/* Metric 3: Total Keuntungan (Rp1.000 / pcs) */}
        <div className="neo-card p-4 sm:p-5 bg-green-50 flex flex-col justify-between border-2 border-brand-dark hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-900 uppercase tracking-wider">
              Estimasi Keuntungan Bersih
            </span>
            <div className="w-8 h-8 rounded-neo-sm bg-green-200 border border-brand-dark flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-900" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-xl sm:text-2xl text-green-700">
              {formatRupiah(totalKeuntungan)}
            </p>
            <p className="text-[11px] font-semibold text-green-800 mt-1">
              Rp1.000 x {totalPcsTerjual} pcs kue sus terjual
            </p>
          </div>
        </div>
      </div>

      {/* MODAL INPUT SALDO AWAL SESI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
          <div className="bg-brand-bg w-full max-w-md rounded-neo border-neo-thick border-brand-dark shadow-neo-xl overflow-hidden animate-scale-up">
            <div className="p-4 bg-brand-butter border-b-neo border-brand-dark flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-brand-dark flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Mulai Sesi Penjualan Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center hover:bg-brand-pink font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartSession} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Nama / Keterangan Sesi
                </label>
                <input
                  type="text"
                  placeholder="Misal: Penjualan Istirahat Pertama"
                  value={namaSesi}
                  onChange={(e) => setNamaSesi(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input text-xs font-medium text-brand-dark bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Saldo Awal di Tangan (Rp) <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  placeholder="Misal: 50000"
                  value={inputSaldoAwal}
                  onChange={(e) => setInputSaldoAwal(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input text-sm font-bold text-brand-dark bg-white"
                />
                <p className="text-[11px] text-brand-dark/70 font-medium mt-1">
                  Setelah sesi dibuka, pendapatan dari setiap pesanan yang terkonfirmasi akan otomatis ditambahkan ke saldo ini!
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2 rounded-neo-sm bg-white border-2 border-brand-dark text-xs font-bold neo-btn-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs sm:text-sm neo-btn"
                >
                  Buka Sesi Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
