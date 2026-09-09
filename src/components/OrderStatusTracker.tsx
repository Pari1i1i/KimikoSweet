"use client";

import React, { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import { Order } from "@/types";
import { MascotChoux } from "./MascotChoux";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  QrCode, 
  Banknote,
  RefreshCw
} from "lucide-react";

export const OrderStatusTracker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dataService.subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
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

  const formatTanggalIndo = (tanggalStr?: string, fallbackHari?: string) => {
    if (!tanggalStr) return `📅 ${fallbackHari || "Senin"}`;
    try {
      const dt = new Date(tanggalStr + "T00:00:00");
      const dayName = dt.getDay() === 4 ? "Kamis" : "Senin";
      const formatted = dt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return `📅 ${dayName}, ${formatted}`;
    } catch {
      return `📅 ${tanggalStr}`;
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      ord.id.toLowerCase().includes(query) ||
      ord.namaPembeli.toLowerCase().includes(query) ||
      ord.kelas.toLowerCase().includes(query) ||
      (ord.tanggalPengambilan && ord.tanggalPengambilan.includes(query)) ||
      (ord.hariPengambilan && ord.hariPengambilan.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-butter border-2 border-brand-dark text-xs font-extrabold text-brand-dark shadow-neo-sm">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Menunggu Konfirmasi
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink border-2 border-brand-dark text-xs font-extrabold text-brand-dark shadow-neo-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-bounce" />
            Sedang Dibuat (Confirmed)
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-300 border-2 border-brand-dark text-xs font-extrabold text-brand-dark shadow-neo-sm">
            <CheckCircle className="w-3.5 h-3.5 text-green-800" />
            Selesai / Siap Diambil
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Info */}
      <div className="p-4 sm:p-5 rounded-neo-lg bg-brand-cream border-neo-thick border-brand-dark shadow-neo flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-neo-sm bg-brand-butter border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-neo-sm">
            <MascotChoux pose="thinking" size={38} />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-brand-dark">
              Cek Status Pesanan
            </h3>
            <p className="text-xs sm:text-sm text-brand-dark/80 font-medium">
              Data terhubung langsung ke dapur KiMiko Sweets
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari berdasarkan Nama Pembeli / Kelas / ID Pesanan (misal: KMK-123456)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-11 rounded-neo-sm neo-input bg-white text-sm font-semibold text-brand-dark"
        />
        <Search className="w-5 h-5 text-brand-dark/60 absolute left-3.5 top-3.5" />
      </div>

      {/* Order Cards List */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-neo border-2 border-brand-dark">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-accent mb-2" />
          <p className="text-xs font-bold text-brand-dark">Memuat data pesanan...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-neo border-2 border-brand-dark shadow-neo">
          <MascotChoux pose="empty" size={100} className="mx-auto" />
          <h4 className="font-heading text-base font-bold text-brand-dark mt-2">
            Belum Ada Pesanan Ditemukan
          </h4>
          <p className="text-xs text-brand-dark/70 max-w-sm mx-auto mt-1 font-medium">
            {searchQuery
              ? `Tidak ada pesanan yang cocok dengan pencarian "${searchQuery}". Pastikan penulisan nama atau ID pesanan benar.`
              : "Belum ada pesanan aktif saat ini. Yuk pesan kue sus favoritmu sekarang!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="neo-card p-4 sm:p-5 flex flex-col justify-between gap-3 bg-white"
            >
              {/* Header Card */}
              <div className="flex items-start justify-between gap-2 border-b-2 border-brand-dark/10 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="font-heading font-extrabold text-base text-brand-dark">
                      {ord.isAnonim ? (
                        <span className="flex items-center gap-1.5">
                          <span>Sobat Manis</span>
                          <span className="neo-badge text-[9px] bg-brand-dark text-white px-1.5 py-0.2 rounded font-extrabold">
                            Anonim
                          </span>
                        </span>
                      ) : (
                        ord.namaPembeli
                      )}
                    </h4>
                    <span className="neo-badge text-[10px] px-2 py-0.5 rounded-md bg-brand-cream text-brand-dark">
                      {ord.isAnonim ? "-" : ord.kelas}
                    </span>
                    <span className="neo-badge text-[10px] px-2 py-0.5 rounded-md bg-brand-butter text-brand-dark font-extrabold">
                      {formatTanggalIndo(ord.tanggalPengambilan, ord.hariPengambilan)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-brand-accent font-mono mt-0.5">
                    ID: {ord.id}
                  </p>
                </div>
                <div className="shrink-0">{getStatusBadge(ord.status)}</div>
              </div>

              {/* Alert jika Pesanan telah Di-reschedule oleh Penjual */}
              {ord.isRescheduled && (
                <div className="p-2.5 rounded-neo-sm bg-purple-100 border-2 border-purple-800 text-purple-950 text-xs font-semibold flex items-start gap-2 shadow-neo-sm">
                  <span className="text-base leading-none mt-0.5">⚡</span>
                  <div>
                    <span className="font-heading font-bold text-purple-900 block">
                      Jadwal Pengambilan Diperbarui Penjual:
                    </span>
                    <p className="text-[11px] text-purple-900/90 mt-0.5">
                      Diubah menjadi <strong>{formatTanggalIndo(ord.tanggalPengambilan, ord.hariPengambilan)}</strong>.
                      {ord.rescheduleNotes && ` (${ord.rescheduleNotes})`}
                    </p>
                  </div>
                </div>
              )}

              {/* Items Ordered List */}
              <div className="space-y-1.5 py-1">
                <p className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
                  Menu Dipesan:
                </p>
                {ord.isAnonim ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-dark/70 bg-brand-pink/20 px-2.5 py-1.5 rounded-neo-sm border border-brand-dark/30">
                    <span>🥟 {ord.totalPcs || ord.items?.reduce((a, b) => a + b.qty, 0) || 0} pcs kue sus (Detail varian disamarkan)</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {ord.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-neo-sm bg-brand-pink/40 border border-brand-dark text-xs font-bold text-brand-dark flex items-center gap-1"
                      >
                        <span>{it.namaVarian}</span>
                        <span className="bg-brand-dark text-white text-[10px] px-1.5 rounded-full">
                          x{it.qty}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {ord.isAnonim ? (
                <div className="text-xs bg-brand-bg/60 p-2 rounded-neo-sm border border-brand-dark/20 font-medium text-brand-dark/60 flex items-center gap-1.5">
                  <span className="font-bold text-[10px] uppercase bg-brand-cream px-1.5 py-0.5 rounded border border-brand-dark/30">
                    Catatan:
                  </span>
                  <span>-</span>
                </div>
              ) : ord.notes ? (
                <div className="text-xs bg-brand-bg p-2 rounded-neo-sm border border-brand-dark/30 font-medium italic text-brand-dark/80">
                  &ldquo;{ord.notes}&rdquo;
                </div>
              ) : null}

              {/* Footer Details */}
              <div className="border-t-2 border-brand-dark/10 pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-brand-dark/80">
                  {ord.isAnonim ? (
                    <span className="text-brand-dark/60 font-semibold text-[11px]">-</span>
                  ) : ord.metodeBayar === "qris" ? (
                    <>
                      <QrCode className="w-3.5 h-3.5 text-brand-accent" />
                      <span>QRIS Offline</span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-3.5 h-3.5 text-green-600" />
                      <span>Cash Tunai</span>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-brand-dark/60 uppercase font-bold block">
                    Total Bayar
                  </span>
                  <span className="font-heading font-extrabold text-sm text-brand-accent">
                    {formatRupiah(ord.totalHarga)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
