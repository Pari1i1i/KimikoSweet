"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { dataService, getDefaultUpcomingPickupDates } from "@/lib/dataService";
import { PaymentMethod, StoreSettings } from "@/types";
import { MascotChoux } from "./MascotChoux";
import { PastryIllustration } from "./PastryIllustration";
import confetti from "canvas-confetti";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  QrCode, 
  Banknote, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ClipboardCopy, 
  Info, 
  Calendar, 
  AlertTriangle 
} from "lucide-react";

interface CartCheckoutModalProps {
  onOrderSuccessNav?: () => void;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({ onOrderSuccessNav }) => {
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [namaPembeli, setNamaPembeli] = useState("");
  const [kelas, setKelas] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    isOpen: true,
    closedReason: "Dapur KiMiko Sweets sedang tutup sementara / kuota pesanan penuh.",
    activePickupDates: getDefaultUpcomingPickupDates(),
  });
  const [tanggalPengambilan, setTanggalPengambilan] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnonim, setIsAnonim] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState<PaymentMethod>("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = dataService.subscribeStoreSettings((sett) => {
      setStoreSettings(sett);
      // Jika tanggal pengambilan belum dipilih atau tidak ada di activePickupDates, pilih tanggal pertama yang tersedia
      if (sett.activePickupDates && sett.activePickupDates.length > 0) {
        setTanggalPengambilan((curr) => {
          if (!curr || !sett.activePickupDates.includes(curr)) {
            return sett.activePickupDates[0];
          }
          return curr;
        });
      }
    });
    return () => unsub();
  }, []);

  if (!isCartOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === "success") {
      setStep("cart");
      setNamaPembeli("");
      setKelas("");
      setNoTelepon("");
      setNotes("");
      setIsAnonim(false);
    }
  };

  const formatTanggalIndo = (tanggalStr: string) => {
    try {
      const dt = new Date(tanggalStr + "T00:00:00");
      const dayName = dt.getDay() === 4 ? "Kamis" : "Senin";
      const formatted = dt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `${dayName}, ${formatted}`;
    } catch {
      return tanggalStr;
    }
  };

  const handleProceedCheckout = () => {
    if (items.length === 0) return;
    if (!storeSettings.isOpen) {
      alert(`⚠️ Maaf, pemesanan sedang ditutup: ${storeSettings.closedReason || "Dapur sedang istirahat"}`);
      return;
    }
    setStep("checkout");
  };

  const getDayName = (dateStr: string): "Senin" | "Kamis" | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const day = dt.getDay();
    if (day === 1) return "Senin";
    if (day === 4) return "Kamis";
    return null;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSettings.isOpen) {
      alert(`⚠️ Maaf, pemesanan sedang ditutup: ${storeSettings.closedReason || "Dapur sedang istirahat"}`);
      return;
    }

    if (!namaPembeli.trim() || !kelas.trim()) {
      alert("Mohon lengkapi Nama Pembeli dan Kelas kamu ya!");
      return;
    }

    if (!tanggalPengambilan) {
      alert("Mohon pilih tanggal pengambilan terlebih dahulu.");
      return;
    }

    const dayName = getDayName(tanggalPengambilan);
    if (!dayName) {
      alert("Pemesanan hanya tersedia untuk hari Senin atau Kamis! Silakan pilih tanggal yang jatuh pada hari Senin atau Kamis.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((it) => ({
        namaVarian: it.product.nama,
        qty: it.qty,
        hargaSatuan: it.product.harga,
      }));

      const newOrderId = await dataService.createOrder({
        namaPembeli: namaPembeli.trim(),
        kelas: kelas.trim(),
        noTelepon: noTelepon.trim() || undefined,
        hariPengambilan: dayName,
        tanggalPengambilan,
        items: orderItems,
        totalHarga: totalPrice,
        totalPcs: totalItems,
        metodeBayar,
        notes: notes.trim() || undefined,
        isAnonim,
        status: "pending",
        createdAt: Date.now(),
      });

      setLastOrderId(newOrderId);
      clearCart();
      setStep("success");

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF5C9A", "#FFE066", "#FFD3E6", "#1A1A1A"],
        });
      } catch {
        // ignore if not supported
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Terjadi kendala saat mengirim pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(lastOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-bg w-full max-w-lg rounded-neo-lg border-neo-thick border-brand-dark shadow-neo-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header Modal */}
        <div className="p-4 bg-brand-pink border-b-neo border-brand-dark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-butter border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
              <ShoppingBag className="w-4 h-4 text-brand-dark" />
            </div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-brand-dark">
              {step === "cart" && "Keranjang Belanja Kamu"}
              {step === "checkout" && "Konfirmasi Pesanan"}
              {step === "success" && "Pesanan Berhasil Dikirim! 🎉"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center hover:bg-brand-butter neo-btn-sm"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 text-brand-dark" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* STEP 1: CART LIST */}
          {step === "cart" && (
            <div className="space-y-4">
              {/* Alert jika toko sedang tutup */}
              {!storeSettings.isOpen && (
                <div className="p-3.5 rounded-neo-sm bg-red-100 border-2 border-red-500 text-red-950 flex items-start gap-2.5 shadow-neo-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-red-900">
                      Dapur Sedang Tutup Sementara 🔒
                    </h4>
                    <p className="text-xs text-red-800/90 mt-0.5">
                      {storeSettings.closedReason || "Saat ini kami belum menerima pesanan baru. Silakan cek kembali nanti ya!"}
                    </p>
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <MascotChoux pose="empty" size={120} />
                  <h3 className="font-heading text-lg font-bold text-brand-dark mt-3">
                    Keranjangmu Masih Kosong Nih!
                  </h3>
                  <p className="text-xs text-brand-dark/70 max-w-xs mt-1 font-medium">
                    Yuk pilih varian kue sus favoritmu sekarang, kulit renyah & isian lumer siap menanti!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-5 py-2.5 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-sm neo-btn flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Lihat Menu Lezat</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-neo-sm border-2 border-brand-dark bg-white shadow-neo-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-neo-sm bg-brand-cream border-2 border-brand-dark flex items-center justify-center overflow-hidden">
                            <PastryIllustration variantId={item.product.id} size={42} />
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-sm text-brand-dark">
                              {item.product.nama}
                            </h4>
                            <p className="text-xs font-semibold text-brand-dark/70">
                              {formatRupiah(item.product.harga)}
                            </p>
                          </div>
                        </div>

                        {/* Qty and Delete */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border-2 border-brand-dark rounded-neo-sm bg-brand-bg">
                            <button
                              onClick={() => updateQty(item.product.id, item.qty - 1)}
                              className="p-1 hover:bg-brand-pink/50 transition-colors"
                            >
                              <Minus className="w-3 h-3 text-brand-dark" />
                            </button>
                            <span className="w-6 text-center font-heading font-bold text-xs">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.product.id, item.qty + 1)}
                              className="p-1 hover:bg-brand-pink/50 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-brand-dark" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <p className="font-heading font-bold text-xs text-brand-accent">
                              {formatRupiah(item.product.harga * item.qty)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1.5 rounded-neo-sm text-red-500 hover:bg-red-50 border border-transparent hover:border-brand-dark transition-colors"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 rounded-neo-sm border-2 border-brand-dark bg-brand-butter/30 flex flex-col gap-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span>Total Pcs:</span>
                      <span className="font-bold">{totalItems} kue sus</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-brand-dark/20 pt-1.5 font-bold text-brand-dark">
                      <span>Total Pembayaran:</span>
                      <span className="text-brand-accent font-heading text-base font-extrabold">
                        {formatRupiah(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === "checkout" && (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Alert jika toko sedang tutup */}
              {!storeSettings.isOpen ? (
                <div className="p-3.5 rounded-neo-sm bg-red-100 border-2 border-red-500 text-red-950 flex items-start gap-2.5 shadow-neo-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-red-900">
                      Pemesanan Sedang Ditutup
                    </h4>
                    <p className="text-xs text-red-800/90 mt-0.5">
                      {storeSettings.closedReason || "Saat ini toko sedang tutup sementara."}
                    </p>
                  </div>
                </div>
              ) : (
                /* Alert Info Offline */
                <div className="p-3 rounded-neo-sm border-2 border-brand-dark bg-brand-cream text-xs font-medium text-brand-dark flex items-start gap-2">
                  <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <p>
                    <strong>Pemesanan Offline:</strong> Pembayaran dilakukan langsung di tempat (tunai atau scan QRIS fisik di kantin/outlet).
                  </p>
                </div>
              )}

              {/* Form Input: Nama */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Nama Lengkap / Panggilan <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Budi Santoso"
                  value={namaPembeli}
                  onChange={(e) => setNamaPembeli(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input bg-white text-sm font-medium text-brand-dark"
                />
              </div>

              {/* Form Input: Kelas */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Kelas / Ruangan / Unit <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: XI RPL 2 / Ruang Guru"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input bg-white text-sm font-medium text-brand-dark"
                />
              </div>

              {/* Form Input: Nomor Telepon / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Nomor WhatsApp / Telepon <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Misal: 081234567890"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input bg-white text-sm font-medium text-brand-dark"
                />
              </div>

              {/* Form Input: Tanggal Pengambilan (HANYA DARI JADWAL BUKA ADMIN) */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Pilih Tanggal Pengambilan <span className="text-brand-accent">*</span></span>
                  </span>
                  <span className="text-[10px] font-extrabold text-brand-accent bg-brand-pink/50 px-2 py-0.5 rounded-full border border-brand-dark/20">
                    Sesuai Jadwal Buka
                  </span>
                </label>

                {storeSettings.activePickupDates && storeSettings.activePickupDates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {storeSettings.activePickupDates.map((dateStr) => {
                      const isSelected = tanggalPengambilan === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setTanggalPengambilan(dateStr)}
                          className={`p-2.5 rounded-neo-sm border-2 border-brand-dark text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-brand-butter text-brand-dark shadow-neo-sm font-extrabold"
                              : "bg-white text-brand-dark hover:bg-brand-pink/30 font-semibold"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📅</span>
                            <span className="text-xs">{formatTanggalIndo(dateStr)}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] bg-brand-dark text-white px-2 py-0.5 rounded-full font-bold">
                              Dipilih
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border-2 border-red-500 rounded-neo-sm text-xs font-bold text-red-800">
                    ⚠️ Penjual belum membuka jadwal tanggal pengambilan. Silakan hubungi admin atau cek kembali nanti.
                  </div>
                )}
              </div>

              {/* Form Input: Notes */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Tolong dipisah plastiknya ya / Minta sendok kecil"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-neo-sm neo-input bg-white text-sm font-medium text-brand-dark resize-none"
                />
              </div>

              {/* Checkbox: Pesan sebagai Anonim */}
              <div className="p-3 rounded-neo-sm border-2 border-brand-dark bg-white shadow-neo-sm flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="anonimCheckbox"
                  checked={isAnonim}
                  onChange={(e) => setIsAnonim(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-brand-dark text-brand-accent focus:ring-0 cursor-pointer accent-brand-accent"
                />
                <label htmlFor="anonimCheckbox" className="text-xs text-brand-dark cursor-pointer select-none">
                  <span className="font-bold block">Pesan sebagai Anonim</span>
                  <span className="text-[11px] text-brand-dark/70 font-medium">
                    Jika dicentang, seluruh data pesanan kamu (nama, kelas, detail varian, catatan, dsb.) akan disamarkan di halaman publik dan hanya bisa dilihat secara lengkap oleh admin.
                  </span>
                </label>
              </div>

              {/* Pilihan Metode Bayar */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">
                  Metode Pembayaran (Offline) <span className="text-brand-accent">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-neo-sm border-2 border-brand-dark cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all ${
                      metodeBayar === "qris"
                        ? "bg-brand-pink shadow-neo-sm font-bold"
                        : "bg-white hover:bg-brand-cream/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodeBayar"
                      value="qris"
                      checked={metodeBayar === "qris"}
                      onChange={() => setMetodeBayar("qris")}
                      className="sr-only"
                    />
                    <QrCode className="w-5 h-5 text-brand-dark" />
                    <span className="text-xs">QRIS Fisik</span>
                    <span className="text-[10px] text-brand-dark/70">Scan di lokasi</span>
                  </label>

                  <label
                    className={`p-3 rounded-neo-sm border-2 border-brand-dark cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all ${
                      metodeBayar === "cash"
                        ? "bg-brand-butter shadow-neo-sm font-bold"
                        : "bg-white hover:bg-brand-cream/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodeBayar"
                      value="cash"
                      checked={metodeBayar === "cash"}
                      onChange={() => setMetodeBayar("cash")}
                      className="sr-only"
                    />
                    <Banknote className="w-5 h-5 text-brand-dark" />
                    <span className="text-xs">Uang Tunai</span>
                    <span className="text-[10px] text-brand-dark/70">Bayar langsung</span>
                  </label>
                </div>
              </div>

              {/* Total Box */}
              <div className="p-3 rounded-neo-sm bg-brand-butter/40 border-2 border-brand-dark flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-dark/80 font-semibold">Total Tagihan ({totalItems} pcs):</p>
                  <p className="font-heading font-extrabold text-base text-brand-dark">
                    {formatRupiah(totalPrice)}
                  </p>
                </div>
                <span className="neo-badge text-[10px] uppercase bg-white px-2 py-0.5 rounded-full">
                  Status: Pending
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="w-1/3 py-2.5 rounded-neo-sm bg-white border-2 border-brand-dark text-xs font-bold neo-btn-sm"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !storeSettings.isOpen || !tanggalPengambilan}
                  className="w-2/3 py-2.5 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-sm neo-btn disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Mengirim Pesanan..."
                  ) : !storeSettings.isOpen ? (
                    "Toko Sedang Tutup"
                  ) : (
                    <>
                      <span>Pesan Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS */}
          {step === "success" && (
            <div className="py-4 text-center space-y-4">
              <div className="flex justify-center">
                <MascotChoux pose="success" size={130} />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-butter border-2 border-brand-dark text-xs font-bold text-brand-dark mb-2 shadow-neo-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Pesanan Berhasil Dikirim!
                </span>
                <h3 className="font-heading text-xl font-bold text-brand-dark">
                  Terima Kasih, {namaPembeli}!
                </h3>
                <p className="text-xs text-brand-dark/80 font-medium max-w-sm mx-auto mt-1">
                  Pesananmu sudah masuk ke sistem kami dan sedang menunggu konfirmasi penjual.
                </p>
              </div>

              {/* Order ID Card */}
              <div className="p-3.5 rounded-neo-sm border-2 border-brand-dark bg-white shadow-neo-sm max-w-xs mx-auto text-left">
                <p className="text-[11px] font-bold text-brand-dark/70 uppercase tracking-wider">
                  Kode / ID Pesanan Kamu:
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-heading font-extrabold text-lg text-brand-accent tracking-wider">
                    {lastOrderId}
                  </span>
                  <button
                    onClick={copyOrderId}
                    className="p-1.5 rounded-neo-sm bg-brand-pink border border-brand-dark hover:bg-brand-butter neo-btn-sm text-xs font-bold flex items-center gap-1"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" />
                    <span>{copied ? "Disalin!" : "Salin"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-brand-dark/60 mt-1.5 font-medium">
                  Simpan kode ini atau gunakan nama kamu di tab <strong>Cek Status Pesanan</strong>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                {onOrderSuccessNav && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOrderSuccessNav();
                    }}
                    className="px-5 py-2.5 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs sm:text-sm neo-btn flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat Status Pesanan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-neo-sm bg-brand-butter border-2 border-brand-dark font-heading font-bold text-xs sm:text-sm neo-btn text-brand-dark"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Only on Cart Step) */}
        {step === "cart" && items.length > 0 && (
          <div className="p-4 bg-brand-cream border-t-neo border-brand-dark flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-brand-dark/70 uppercase">Total:</p>
              <p className="font-heading font-extrabold text-lg text-brand-accent leading-none">
                {formatRupiah(totalPrice)}
              </p>
            </div>
            <button
              onClick={handleProceedCheckout}
              disabled={!storeSettings.isOpen}
              className={`px-5 py-2.5 rounded-neo-sm font-heading font-bold text-sm neo-btn flex items-center gap-2 ${
                !storeSettings.isOpen
                  ? "bg-gray-400 text-white cursor-not-allowed opacity-75"
                  : "bg-brand-accent text-white"
              }`}
            >
              <span>{storeSettings.isOpen ? "Lanjut Checkout" : "Toko Sedang Tutup"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
