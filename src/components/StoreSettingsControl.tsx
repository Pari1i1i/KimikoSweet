"use client";

import React, { useState, useEffect } from "react";
import { dataService, getDefaultUpcomingPickupDates } from "@/lib/dataService";
import { StoreSettings, HariPengambilan } from "@/types";
import { 
  Store, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Clock
} from "lucide-react";

export const StoreSettingsControl: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    isOpen: true,
    closedReason: "Dapur KiMiko Sweets sedang tutup sementara / kuota pesanan penuh.",
    activePickupDates: getDefaultUpcomingPickupDates(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [closedReasonInput, setClosedReasonInput] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    const unsub = dataService.subscribeStoreSettings((data) => {
      setSettings(data);
      setClosedReasonInput(data.closedReason || "Dapur KiMiko Sweets sedang tutup sementara / kuota pesanan penuh.");
    });
    return () => unsub();
  }, []);

  const formatTanggalIndo = (tanggalStr: string) => {
    try {
      const dt = new Date(tanggalStr + "T00:00:00");
      const dayName = dt.getDay() === 4 ? "Kamis" : dt.getDay() === 1 ? "Senin" : "Lainnya";
      const formatted = dt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
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

  const handleToggleStore = async (newStatus: boolean) => {
    setIsSaving(true);
    try {
      await dataService.updateStoreSettings({
        isOpen: newStatus,
        closedReason: closedReasonInput.trim(),
      });
      triggerSaveMsg(newStatus ? "Toko berhasil DIBUKA! Pembeli sekarang bisa memesan." : "Toko berhasil DITUTUP! Pembeli tidak bisa checkout.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClosedReason = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dataService.updateStoreSettings({
        closedReason: closedReasonInput.trim(),
      });
      triggerSaveMsg("Keterangan toko tutup berhasil disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomDate = async () => {
    if (!customDate) {
      alert("Pilih tanggal terlebih dahulu.");
      return;
    }
    const day = getDayName(customDate);
    if (!day) {
      alert("⚠️ Tanggal harus jatuh pada hari SENIN atau KAMIS!");
      return;
    }
    if (settings.activePickupDates.includes(customDate)) {
      alert("Tanggal ini sudah ada di daftar jadwal buka!");
      return;
    }

    const updatedDates = [...settings.activePickupDates, customDate].sort();
    setIsSaving(true);
    try {
      await dataService.updateStoreSettings({
        activePickupDates: updatedDates,
      });
      setCustomDate("");
      triggerSaveMsg(`Jadwal tanggal ${formatTanggalIndo(customDate)} berhasil ditambahkan!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuickDate = async (isoDate: string) => {
    if (settings.activePickupDates.includes(isoDate)) {
      alert("Tanggal ini sudah ada di daftar jadwal buka!");
      return;
    }
    const updatedDates = [...settings.activePickupDates, isoDate].sort();
    setIsSaving(true);
    try {
      await dataService.updateStoreSettings({
        activePickupDates: updatedDates,
      });
      triggerSaveMsg(`Jadwal tanggal ${formatTanggalIndo(isoDate)} berhasil dibuka!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDate = async (dateToRemove: string) => {
    if (!confirm(`Hapus tanggal ${formatTanggalIndo(dateToRemove)} dari jadwal pemesanan? Pembeli tidak akan bisa memilih tanggal ini lagi.`)) {
      return;
    }
    const updatedDates = settings.activePickupDates.filter((d) => d !== dateToRemove);
    setIsSaving(true);
    try {
      await dataService.updateStoreSettings({
        activePickupDates: updatedDates,
      });
      triggerSaveMsg(`Tanggal ${formatTanggalIndo(dateToRemove)} dihapus dari jadwal buka.`);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSaveMsg = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // Hitung rekomendasi tanggal Senin & Kamis terdekat
  const suggestedDates = getDefaultUpcomingPickupDates();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-green-200 border-2 border-brand-dark rounded-neo text-green-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-neo-sm animate-bounce-subtle">
          <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. KONTROL STATUS TOKO (BUKA / TUTUP) */}
      <div className="p-5 sm:p-6 rounded-neo-lg bg-white border-neo-thick border-brand-dark shadow-neo space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-brand-dark/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-neo-sm border-2 border-brand-dark flex items-center justify-center font-bold shadow-neo-sm ${
              settings.isOpen ? "bg-green-300" : "bg-red-300"
            }`}>
              <Store className="w-6 h-6 text-brand-dark" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-brand-dark">
                  Status Toko / Pemesanan
                </h3>
                <span className={`neo-badge text-xs px-2.5 py-0.5 rounded-full font-extrabold ${
                  settings.isOpen ? "bg-green-300 text-green-950" : "bg-red-400 text-white"
                }`}>
                  {settings.isOpen ? "🟢 SEDANG BUKA" : "🔴 SEDANG TUTUP"}
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 font-medium mt-0.5">
                Kendalikan langsung apakah pembeli boleh checkout atau sistem ditutup sementara.
              </p>
            </div>
          </div>

          {/* Toggle Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleToggleStore(true)}
              disabled={settings.isOpen || isSaving}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-neo-sm font-heading font-bold text-xs sm:text-sm border-2 border-brand-dark transition-all ${
                settings.isOpen
                  ? "bg-green-400 text-brand-dark opacity-90 cursor-default shadow-neo-sm"
                  : "bg-white text-brand-dark hover:bg-green-200 cursor-pointer"
              }`}
            >
              ✓ Buka Toko
            </button>
            <button
              onClick={() => handleToggleStore(false)}
              disabled={!settings.isOpen || isSaving}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-neo-sm font-heading font-bold text-xs sm:text-sm border-2 border-brand-dark transition-all ${
                !settings.isOpen
                  ? "bg-red-400 text-white opacity-90 cursor-default shadow-neo-sm"
                  : "bg-white text-brand-dark hover:bg-red-100 cursor-pointer"
              }`}
            >
              ✕ Tutup Toko
            </button>
          </div>
        </div>

        {/* Input Keterangan Jika Toko Tutup */}
        <form onSubmit={handleSaveClosedReason} className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
            Pesan / Alasan Saat Toko Tutup (Ditampilkan ke Pembeli)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={closedReasonInput}
              onChange={(e) => setClosedReasonInput(e.target.value)}
              placeholder="Contoh: Dapur sedang istirahat / kuota PO minggu ini sudah penuh..."
              className="flex-1 px-3 py-2 rounded-neo-sm neo-input text-xs font-semibold bg-brand-bg text-brand-dark"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs neo-btn shrink-0"
            >
              Simpan Pesan
            </button>
          </div>
        </form>
      </div>

      {/* 2. KELOLA TANGGAL PENGAMBILAN YANG DIHENDAKI (KEHENDAK PENJUAL) */}
      <div className="p-5 sm:p-6 rounded-neo-lg bg-white border-neo-thick border-brand-dark shadow-neo space-y-5">
        <div className="flex items-start justify-between gap-3 border-b-2 border-brand-dark/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-neo-sm bg-brand-butter border-2 border-brand-dark flex items-center justify-center font-bold shadow-neo-sm shrink-0">
              <Calendar className="w-6 h-6 text-brand-dark" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-brand-dark">
                Jadwal Buka Tanggal Pengambilan (Khusus Senin & Kamis)
              </h3>
              <p className="text-xs text-brand-dark/70 font-medium mt-0.5">
                Pembeli <strong>hanya bisa memilih tanggal</strong> yang ada di daftar aktif di bawah ini saat checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Add Suggested Dates */}
        <div>
          <p className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>Rekomendasi Jadwal Terdekat:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedDates.map((sugDate) => {
              const isAdded = settings.activePickupDates.includes(sugDate);
              return (
                <button
                  key={sugDate}
                  onClick={() => !isAdded && handleAddQuickDate(sugDate)}
                  disabled={isAdded || isSaving}
                  className={`px-3 py-1.5 rounded-neo-sm text-xs font-bold border-2 border-brand-dark flex items-center gap-1.5 transition-all ${
                    isAdded
                      ? "bg-green-100 text-green-900 border-green-700 opacity-80 cursor-default"
                      : "bg-brand-butter text-brand-dark hover:bg-brand-butter/70 neo-btn-sm"
                  }`}
                >
                  {isAdded ? <CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{formatTanggalIndo(sugDate)}</span>
                  {isAdded && <span className="text-[10px] font-extrabold">(Sudah Aktif)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Input */}
        <div className="p-4 rounded-neo bg-brand-bg border-2 border-brand-dark space-y-2">
          <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
            Tambah Tanggal Buka Lainnya (Harus Senin atau Kamis)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-2 rounded-neo-sm neo-input text-xs font-bold bg-white text-brand-dark flex-1 cursor-pointer"
            />
            <button
              onClick={handleAddCustomDate}
              disabled={isSaving || !customDate}
              className="px-4 py-2 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs neo-btn flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Buka Tanggal Ini</span>
            </button>
          </div>
          {customDate && (
            <p className="text-[11px] font-semibold text-brand-dark/70">
              {getDayName(customDate) ? (
                <span className="text-green-700 font-bold">✓ Tanggal valid: Hari {getDayName(customDate)}</span>
              ) : (
                <span className="text-red-600 font-bold">⚠️ Tanggal yang dipilih bukan hari Senin atau Kamis!</span>
              )}
            </p>
          )}
        </div>

        {/* Daftar Tanggal Buka Aktif Saat Ini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-sm text-brand-dark uppercase tracking-wider">
              Daftar Tanggal yang Tersedia untuk Pembeli ({settings.activePickupDates.length})
            </h4>
            {settings.activePickupDates.length === 0 && (
              <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Belum ada tanggal aktif! Pembeli tidak akan bisa checkout.
              </span>
            )}
          </div>

          {settings.activePickupDates.length === 0 ? (
            <div className="p-6 text-center bg-brand-pink/20 rounded-neo border-2 border-dashed border-brand-dark">
              <Clock className="w-8 h-8 mx-auto text-brand-dark/40 mb-1" />
              <p className="text-xs font-bold text-brand-dark">
                Tidak ada tanggal buka yang aktif.
              </p>
              <p className="text-[11px] text-brand-dark/70 mt-0.5">
                Silakan klik salah satu tombol rekomendasi di atas atau tambahkan tanggal manual agar pembeli bisa memilih jadwal pengambilan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {settings.activePickupDates.map((dateStr) => (
                <div
                  key={dateStr}
                  className="p-3.5 rounded-neo-sm bg-white border-2 border-brand-dark shadow-neo-sm flex items-center justify-between gap-3 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-neo-sm bg-brand-pink border border-brand-dark flex items-center justify-center shrink-0 font-bold text-xs">
                      📅
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-sm text-brand-dark truncate">
                        {formatTanggalIndo(dateStr)}
                      </p>
                      <span className="text-[10px] text-brand-dark/60 font-mono font-bold block">
                        ISO: {dateStr}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDate(dateStr)}
                    className="p-1.5 rounded-neo-sm text-red-600 hover:bg-red-50 border border-transparent hover:border-brand-dark transition-colors shrink-0"
                    title="Hapus Tanggal Buka"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
