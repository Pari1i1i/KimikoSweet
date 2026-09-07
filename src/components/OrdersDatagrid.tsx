"use client";

import React, { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import { Order, OrderStatus } from "@/types";
import { MascotChoux } from "./MascotChoux";
import { 
  Check, 
  Clock, 
  CheckCheck, 
  Search, 
  QrCode, 
  Banknote, 
  Filter, 
  ArrowUpDown,
  FileSpreadsheet
} from "lucide-react";

interface OrdersDatagridProps {
  orders: Order[];
}

export const OrdersDatagrid: React.FC<OrdersDatagridProps> = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = filterStatus === "all" || ord.status === filterStatus;
    const query = search.toLowerCase().trim();
    const matchSearch =
      !query ||
      ord.namaPembeli.toLowerCase().includes(query) ||
      ord.kelas.toLowerCase().includes(query) ||
      ord.id.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-neo border-2 border-brand-dark shadow-neo-sm">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "all"
                ? "bg-brand-dark text-white shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-pink/50"
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "pending"
                ? "bg-brand-butter text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-butter/50"
            }`}
          >
            Pending ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-3 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "confirmed"
                ? "bg-brand-pink text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-brand-pink/50"
            }`}
          >
            Confirmed ({orders.filter((o) => o.status === "confirmed").length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-3 py-1 rounded-neo-sm text-xs font-bold border-2 border-brand-dark transition-all ${
              filterStatus === "completed"
                ? "bg-green-300 text-brand-dark shadow-neo-sm"
                : "bg-brand-bg hover:bg-green-100"
            }`}
          >
            Selesai ({orders.filter((o) => o.status === "completed").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama / kelas..."
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
        <div className="bg-white rounded-neo border-neo-thick border-brand-dark shadow-neo overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-butter border-b-2 border-brand-dark font-heading text-xs font-bold text-brand-dark uppercase tracking-wider">
                  <th className="p-3 border-r-2 border-brand-dark">ID & Waktu</th>
                  <th className="p-3 border-r-2 border-brand-dark">Pembeli & Kelas</th>
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

                    {/* Customer */}
                    <td className="p-3 border-r-2 border-brand-dark/10">
                      <span className="font-heading font-bold text-brand-dark block text-sm">
                        {ord.namaPembeli}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-brand-pink/50 text-[10px] font-bold border border-brand-dark/30">
                        {ord.kelas}
                      </span>
                      {ord.notes && (
                        <p className="text-[10px] text-brand-dark/70 italic mt-1 bg-brand-bg p-1 rounded border border-brand-dark/20">
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
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {ord.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "confirmed")}
                            disabled={updatingId === ord.id}
                            className="px-2.5 py-1 rounded-neo-sm bg-brand-butter text-brand-dark font-heading font-bold text-xs neo-btn-sm hover:bg-brand-butter/80"
                          >
                            ✓ Konfirmasi
                          </button>
                        )}
                        {ord.status === "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "completed")}
                            disabled={updatingId === ord.id}
                            className="px-2.5 py-1 rounded-neo-sm bg-green-400 text-brand-dark font-heading font-bold text-xs neo-btn-sm hover:bg-green-500"
                          >
                            ✓ Selesai
                          </button>
                        )}
                        {ord.status === "completed" && (
                          <span className="text-[11px] font-bold text-green-700 flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Beres
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
