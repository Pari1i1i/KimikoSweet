"use client";

import React, { useState } from "react";
import { dataService } from "@/lib/dataService";
import { Order, OrderStatus, HariPengambilan } from "@/types";
import { MascotChoux } from "./MascotChoux";
import { 
  CheckCheck, 
  Search, 
  QrCode, 
  Banknote, 
  MessageSquare, 
  Calendar, 
  X,
  Trash2,
  XCircle,
  AlertOctagon
} from "lucide-react";

interface OrdersDatagridProps {
  orders: Order[];
}

export const OrdersDatagrid: React.FC<OrdersDatagridProps> = ({ orders }) => {
  const [filterTanggal, setFilterTanggal] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // State untuk Reschedule Modal
  const [rescheduleOrderModal, setRescheduleOrderModal] = useState<Order | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState("");
  const [rescheduleNoteInput, setRescheduleNoteInput] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // State untuk Tolak Modal
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("Mohon maaf, pesanan tidak dapat diproses (stok habis / kuota penuh).");
  const [isRejecting, setIsRejecting] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await dataService.updateOrderStatus(orderId, nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Hapus permanen pesanan ${order.id} atas nama "${order.namaPembeli}"? Data akan dihapus dari sistem dan tidak dapat dikembalikan.`)) {
      setUpdatingId(order.id);
      try {
        await dataService.deleteOrder(order.id);
      } catch (e) {
        console.error("Delete order error:", e);
        alert("Gagal menghapus pesanan.");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleOpenReject = (ord: Order) => {
    setRejectOrderModal(ord);
    setRejectReasonInput("Mohon maaf, pesanan tidak dapat diproses (stok habis / kuota penuh).");
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectOrderModal) return;
    setIsRejecting(true);
    try {
      await dataService.rejectOrder(rejectOrderModal.id, rejectReasonInput.trim());
      setRejectOrderModal(null);
      setRejectReasonInput("");
    } catch (err) {
      console.error("Reject order error:", err);
      alert("Gagal menolak pesanan.");
    } finally {
      setIsRejecting(false);
    }
  };

  const formatTanggalPengambilan = (tanggalStr?: string, fallbackHari?: string) => {
    if (!tanggalStr) return fallbackHari || "Senin";
    try {
      const dt = new Date(tanggalStr + "T00:00:00");
      const dayName = dt.getDay() === 4 ? "Kamis" : "Senin";
      const formatted = dt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      return `${dayName}, ${formatted}`;
    } catch {
      return tanggalStr;
    }
  };

  const getDayName = (dateStr: string): HariPengambilan | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const day = dt.getDay();
    if (day === 1) return "Senin";
    if (day === 4) return "Kamis";
    return null;
  };

  const handleOpenReschedule = (ord: Order) => {
    setRescheduleOrderModal(ord);
    setNewRescheduleDate(ord.tanggalPengambilan || "");
    setRescheduleNoteInput(ord.rescheduleNotes || "");
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleOrderModal || !newRescheduleDate) return;

    const day = getDayName(newRescheduleDate);
    if (!day) {
      alert("⚠️ Tanggal pengambilan baru harus jatuh pada hari SENIN atau KAMIS!");
      return;
    }

    setIsRescheduling(true);
    try {
      await dataService.rescheduleOrder(
        rescheduleOrderModal.id,
        newRescheduleDate,
        rescheduleNoteInput.trim() || "Jadwal pengambilan diperbarui oleh admin"
      );
      setRescheduleOrderModal(null);
      setNewRescheduleDate("");
      setRescheduleNoteInput("");
    } catch (err) {
      console.error("Reschedule error:", err);
      alert("Gagal mereschedule pesanan. Silakan coba lagi.");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Dapatkan daftar tanggal unik yang ada di pesanan (diurutkan)
  const availableDates = Array.from(
    new Set(
      orders
        .map((o) => o.tanggalPengambilan)
        .filter((t): t is string => Boolean(t))
    )
  ).sort();

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = filterStatus === "all" || ord.status === filterStatus;
    const matchTanggal =
      filterTanggal === "all" || ord.tanggalPengambilan === filterTanggal;
    const query = search.toLowerCase().trim();
    const matchSearch =
      !query ||
      ord.namaPembeli.toLowerCase().includes(query) ||
      ord.kelas.toLowerCase().includes(query) ||
      (ord.noTelepon && ord.noTelepon.includes(query)) ||
      (ord.tanggalPengambilan && ord.tanggalPengambilan.includes(query)) ||
      (ord.hariPengambilan && ord.hariPengambilan.toLowerCase().includes(query)) ||
      ord.id.toLowerCase().includes(query);
    return matchStatus && matchTanggal && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-neo border-2 border-brand-dark shadow-neo-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {/* Filter Status */}
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "all"
                ? "bg-brand-dark text-white shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-pink/50"
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "pending"
                ? "bg-brand-butter text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-butter/50"
            }`}
          >
            Pending ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "confirmed"
                ? "bg-brand-pink text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-pink/50"
            }`}
          >
            Confirmed ({orders.filter((o) => o.status === "confirmed").length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "completed"
                ? "bg-green-300 text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-green-100"
            }`}
          >
            Selesai ({orders.filter((o) => o.status === "completed").length})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "rejected"
                ? "bg-red-300 text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-red-100"
            }`}
          >
            Ditolak ({orders.filter((o) => o.status === "rejected").length})
          </button>

          {/* Filter Jadwal Tanggal Pengambilan */}
          <span className="text-brand-dark/30 font-bold px-1 hidden sm:inline">|</span>
          <button
            onClick={() => setFilterTanggal("all")}
            className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterTanggal === "all"
                ? "bg-brand-cream border-brand-dark font-extrabold shadow-neo-sm"
                : "bg-white border-brand-dark/40 hover:bg-brand-cream/50"
            }`}
          >
            Semua Tanggal
          </button>

          {availableDates.map((tgl) => (
            <button
              key={tgl}
              onClick={() => setFilterTanggal(tgl)}
              className={`px-2.5 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all flex items-center gap-1 ${
                filterTanggal === tgl
                  ? "bg-brand-butter text-brand-dark font-extrabold shadow-neo-sm"
                  : "bg-white text-brand-dark hover:bg-brand-butter/40"
              }`}
            >
              <span>📅</span>
              <span>{formatTanggalPengambilan(tgl)}</span>
              <span className="text-[10px] bg-brand-dark text-white px-1.5 rounded-full">
                {orders.filter((o) => o.tanggalPengambilan === tgl).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama / kelas / no telp / tgl..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 rounded-neo-sm neo-input text-xs font-semibold bg-brand-bg"
          />
          <Search className="w-3.5 h-3.5 text-brand-dark/60 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table Datagrid Desktop / Card Mobile */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-neo border-2 border-brand-dark shadow-neo">
          <MascotChoux pose="thinking" size={90} className="mx-auto" />
          <h4 className="font-heading text-sm font-bold text-brand-dark mt-2">
            Tidak Ada Pesanan di Kategori Ini
          </h4>
        </div>
      ) : (
        <div className="bg-white rounded-neo border-neo-thick border-brand-dark shadow-neo overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-butter border-b-2 border-brand-dark font-heading text-xs font-bold text-brand-dark uppercase tracking-wider">
                  <th className="p-3 border-r-2 border-brand-dark">ID & Waktu</th>
                  <th className="p-3 border-r-2 border-brand-dark">Jadwal Ambil</th>
                  <th className="p-3 border-r-2 border-brand-dark">Pembeli & Kontak</th>
                  <th className="p-3 border-r-2 border-brand-dark min-w-[200px]">Rincian Item</th>
                  <th className="p-3 border-r-2 border-brand-dark">Bayar</th>
                  <th className="p-3 border-r-2 border-brand-dark">Total</th>
                  <th className="p-3 border-r-2 border-brand-dark">Status</th>
                  <th className="p-3 text-center">Aksi Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brand-dark/10 text-xs font-medium">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className={`hover:bg-brand-cream/30 transition-colors ${
                      ord.status === "pending"
                        ? "bg-brand-butter/10"
                        : ord.status === "confirmed"
                        ? "bg-brand-pink/10"
                        : ""
                    }`}
                  >
                    {/* ID & Time */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <span className="font-mono font-bold text-brand-accent block">
                        {ord.id}
                      </span>
                      <span className="text-[10px] text-brand-dark/60 font-medium">
                        {new Date(ord.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Jadwal Pengambilan */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <div className="space-y-1.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-neo-sm text-xs font-extrabold border border-brand-dark shadow-[1px_1px_0px_#1A1A1A] ${
                            ord.hariPengambilan === "Kamis" || (ord.tanggalPengambilan && new Date(ord.tanggalPengambilan + "T00:00:00").getDay() === 4)
                              ? "bg-brand-butter text-brand-dark"
                              : "bg-brand-pink text-brand-dark"
                          }`}
                        >
                          📅 {formatTanggalPengambilan(ord.tanggalPengambilan, ord.hariPengambilan)}
                        </span>

                        {ord.isRescheduled && (
                          <span className="block text-[9px] bg-purple-200 border border-purple-800 text-purple-950 px-1.5 py-0.2 rounded font-extrabold w-fit">
                            ⚡ Rescheduled
                          </span>
                        )}

                        <button
                          onClick={() => handleOpenReschedule(ord)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-brand-dark text-[10px] font-bold text-brand-dark hover:bg-brand-butter neo-btn-sm transition-all"
                          title="Paksa Ganti / Reschedule Tanggal Pengambilan"
                        >
                          <Calendar className="w-3 h-3 text-brand-accent" />
                          <span>Ubah Tgl</span>
                        </button>
                      </div>
                    </td>

                    {/* Customer & Contact */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-bold text-brand-dark block text-sm">
                          {ord.namaPembeli}
                        </span>
                        {ord.isAnonim && (
                          <span className="neo-badge text-[9px] bg-brand-dark text-white px-1.5 py-0.2 rounded font-extrabold">
                            Anonim
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="inline-block px-2 py-0.2 rounded-md bg-brand-pink/50 text-[10px] font-bold border border-brand-dark/30">
                          {ord.kelas}
                        </span>

                        {ord.noTelepon && (
                          <a
                            href={`https://wa.me/${ord.noTelepon.replace(/\D/g, "").replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 border border-green-600 text-green-800 text-[10px] font-bold hover:bg-green-200 transition-colors"
                            title="Chat WhatsApp Pembeli"
                          >
                            <MessageSquare className="w-3 h-3 text-green-700" />
                            <span>{ord.noTelepon}</span>
                          </a>
                        )}
                      </div>

                      {ord.notes && (
                        <p className="text-[10px] text-brand-dark/80 font-medium italic mt-1 bg-brand-bg p-1.5 rounded border border-brand-dark/20">
                          Catatan: {ord.notes}
                        </p>
                      )}
                    </td>

                    {/* Items */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <div className="space-y-1">
                        {ord.items.map((it, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[11px] font-semibold bg-white p-1 rounded border border-brand-dark/20"
                          >
                            <span>{it.namaVarian}</span>
                            <span className="font-mono font-bold text-brand-dark">
                              x{it.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ord.metodeBayar === "qris"
                            ? "bg-brand-pink border-brand-dark text-brand-dark"
                            : "bg-green-200 border-brand-dark text-green-900"
                        }`}
                      >
                        {ord.metodeBayar === "qris" ? (
                          <>
                            <QrCode className="w-3 h-3" /> QRIS
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3 h-3" /> Cash
                          </>
                        )}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <span className="font-heading font-bold text-brand-dark">
                        {formatRupiah(ord.totalHarga)}
                      </span>
                      <span className="text-[10px] text-brand-dark/60 block">
                        ({ord.totalPcs} pcs)
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      {ord.status === "pending" && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-butter text-[10px] font-extrabold border border-brand-dark block text-center">
                          Pending
                        </span>
                      )}
                      {ord.status === "confirmed" && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-pink text-[10px] font-extrabold border border-brand-dark block text-center">
                          Confirmed
                        </span>
                      )}
                      {ord.status === "completed" && (
                        <span className="px-2 py-0.5 rounded-full bg-green-300 text-[10px] font-extrabold border border-brand-dark block text-center">
                          Selesai
                        </span>
                      )}
                      {ord.status === "rejected" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-950 text-[10px] font-extrabold border border-brand-dark block text-center">
                          Ditolak
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* 1. Tombol Khusus Status Pending: Konfirmasi & Tolak */}
                        {ord.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(ord.id, "confirmed")}
                              disabled={updatingId === ord.id}
                              className="px-2.5 py-1 rounded-neo-sm bg-brand-butter text-brand-dark font-heading font-bold text-xs neo-btn-sm hover:bg-brand-butter/80"
                              title="Konfirmasi Pesanan"
                            >
                              ✓ Konfirmasi
                            </button>
                            <button
                              onClick={() => handleOpenReject(ord)}
                              disabled={updatingId === ord.id}
                              className="px-2.5 py-1 rounded-neo-sm bg-red-200 text-red-950 font-heading font-bold text-xs neo-btn-sm hover:bg-red-300 border border-brand-dark"
                              title="Tolak Pesanan Ini"
                            >
                              ✕ Tolak
                            </button>
                          </>
                        )}

                        {/* 2. Tombol Khusus Status Confirmed: Selesaikan (TIDAK BISA DITOLAK LAGI) */}
                        {ord.status === "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "completed")}
                            disabled={updatingId === ord.id}
                            className="px-2.5 py-1 rounded-neo-sm bg-green-400 text-brand-dark font-heading font-bold text-xs neo-btn-sm hover:bg-green-500"
                            title="Selesaikan Pesanan"
                          >
                            ✓ Selesai
                          </button>
                        )}

                        {/* 3. Status Completed */}
                        {ord.status === "completed" && (
                          <span className="text-[11px] font-bold text-green-700 flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Beres
                          </span>
                        )}

                        {/* 6. Tombol Kembali ke Confirmed (untuk status Completed) */}
                        {ord.status === "completed" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "confirmed")}
                            disabled={updatingId === ord.id}
                            className="px-2.5 py-1 rounded-neo-sm bg-brand-butter text-brand-dark font-heading font-bold text-xs neo-btn-sm hover:bg-brand-butter/80"
                            title="Kembali ke Konfirmasi"
                          >
                            ↺ Kembali
                          </button>
                        )}

                        {/* 4. Status Rejected */}
                        {ord.status === "rejected" && (
                          <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Ditolak
                          </span>
                        )}

                        {/* 5. Tombol HAPUS PERMANEN (SELALU BISA DIGUNAKAN DI SEMUA STATUS) */}
                        <button
                          onClick={() => handleDeleteOrder(ord)}
                          disabled={updatingId === ord.id}
                          className="p-1 rounded-neo-sm bg-white border border-red-500 text-red-600 hover:bg-red-50 neo-btn-sm transition-all"
                          title="Hapus Permanen Pesanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL RESCHEDULE TANGGAL OLEH ADMIN */}
      {rescheduleOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-bg w-full max-w-md rounded-neo-lg border-neo-thick border-brand-dark shadow-neo-xl overflow-hidden animate-scale-up">
            <div className="p-4 bg-brand-pink border-b-neo border-brand-dark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-butter border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
                  <Calendar className="w-4 h-4 text-brand-dark" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-brand-dark">
                    Reschedule Jadwal Pesanan
                  </h3>
                  <p className="text-[10px] font-semibold text-brand-dark/70">
                    ID: {rescheduleOrderModal.id} • {rescheduleOrderModal.namaPembeli}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleOrderModal(null)}
                className="w-7 h-7 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center hover:bg-brand-butter neo-btn-sm"
              >
                <X className="w-4 h-4 text-brand-dark" />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="p-5 space-y-4 bg-white">
              <div className="p-3 bg-brand-cream rounded-neo-sm border-2 border-brand-dark text-xs space-y-1">
                <p className="font-semibold text-brand-dark">
                  <strong>Pembeli:</strong> {rescheduleOrderModal.namaPembeli} ({rescheduleOrderModal.kelas})
                </p>
                <p className="text-brand-dark/80">
                  <strong>Jadwal Awal:</strong> {formatTanggalPengambilan(rescheduleOrderModal.tanggalPengambilan, rescheduleOrderModal.hariPengambilan)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Pilih Tanggal Pengambilan Baru (Senin / Kamis) <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input text-xs font-bold bg-brand-bg text-brand-dark cursor-pointer"
                />
                {newRescheduleDate && (
                  <p className="text-[11px] font-bold mt-1">
                    {getDayName(newRescheduleDate) ? (
                      <span className="text-green-700">✓ Jadwal baru: Hari {getDayName(newRescheduleDate)}, {formatTanggalPengambilan(newRescheduleDate)}</span>
                    ) : (
                      <span className="text-red-600">⚠️ Tanggal harus jatuh pada hari Senin atau Kamis!</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Alasan / Catatan Reschedule (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={rescheduleNoteInput}
                  onChange={(e) => setRescheduleNoteInput(e.target.value)}
                  placeholder="Misal: Dapur tutup mendadak di hari Senin / Bahan ready hari Kamis"
                  className="w-full px-3 py-2 rounded-neo-sm neo-input text-xs font-medium bg-brand-bg text-brand-dark resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleOrderModal(null)}
                  className="w-1/3 py-2.5 rounded-neo-sm bg-brand-bg border-2 border-brand-dark text-xs font-bold neo-btn-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling || !newRescheduleDate || !getDayName(newRescheduleDate)}
                  className="w-2/3 py-2.5 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs neo-btn disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isRescheduling ? "Menyimpan..." : "Simpan Jadwal Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK PESANAN OLEH ADMIN */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-bg w-full max-w-md rounded-neo-lg border-neo-thick border-brand-dark shadow-neo-xl overflow-hidden animate-scale-up">
            <div className="p-4 bg-red-300 border-b-neo border-brand-dark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-brand-dark">
                    Tolak Pesanan Pembeli
                  </h3>
                  <p className="text-[10px] font-semibold text-brand-dark/70">
                    ID: {rejectOrderModal.id} • {rejectOrderModal.namaPembeli}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectOrderModal(null)}
                className="w-7 h-7 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center hover:bg-brand-pink neo-btn-sm"
              >
                <X className="w-4 h-4 text-brand-dark" />
              </button>
            </div>

            <form onSubmit={handleSubmitReject} className="p-5 space-y-4 bg-white">
              <div className="p-3 bg-red-50 rounded-neo-sm border-2 border-red-400 text-xs text-red-950 space-y-1">
                <p className="font-bold">
                  Yakin ingin menolak pesanan dari {rejectOrderModal.namaPembeli} ({rejectOrderModal.kelas})?
                </p>
                <p className="text-[11px] text-red-800">
                  Total {rejectOrderModal.totalPcs} pcs ({formatRupiah(rejectOrderModal.totalHarga)}). Status di tracker pembeli akan berubah menjadi Ditolak.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Alasan Penolakan (Ditampilkan ke Pembeli)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Misal: Mohon maaf, kuota varian Matcha hari ini sudah habis."
                  className="w-full px-3 py-2 rounded-neo-sm neo-input text-xs font-medium bg-brand-bg text-brand-dark resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectOrderModal(null)}
                  className="w-1/3 py-2.5 rounded-neo-sm bg-brand-bg border-2 border-brand-dark text-xs font-bold neo-btn-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRejecting || !rejectReasonInput.trim()}
                  className="w-2/3 py-2.5 rounded-neo-sm bg-red-500 text-white font-heading font-bold text-xs neo-btn disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isRejecting ? "Memproses..." : "✕ Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
