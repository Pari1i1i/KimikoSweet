"use client";

import React, { useState, useEffect, useRef } from "react";
import { Order } from "@/types";
import { PastryIllustration } from "./PastryIllustration";
import { PRODUCTS_DATA } from "@/data/products";
import { dataService } from "@/lib/dataService";
import { 
  Check, 
  RotateCcw, 
  Layers, 
  CheckCircle2 
} from "lucide-react";

interface ProductionDatagridProps {
  orders: Order[];
}

interface ProductionSummary {
  variantId: string;
  variantNama: string;
  hargaSatuan: number;
  totalPendingQty: number;
  totalConfirmedQty: number;
  totalCompletedQty: number;
  totalAllQty: number;
}

const LOCAL_PRODUCTION_DONE_PCS_KEY = "kimiko_production_done_pcs_map";

export const ProductionDatagrid: React.FC<ProductionDatagridProps> = ({ orders }) => {
  // Map variantNama -> jumlah pcs yang sudah dibuat secara bertahap
  const [completedPcsMap, setCompletedPcsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PRODUCTION_DONE_PCS_KEY);
      if (saved) {
        setCompletedPcsMap(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    // Dengarkan event reset produksi (misalnya saat admin mulai sesi baru)
    const unsub = dataService.subscribeProductionReset(() => {
      setCompletedPcsMap({});
    });

    return () => unsub();
  }, []);

  const savePcsMap = (updated: Record<string, number>) => {
    setCompletedPcsMap(updated);
    localStorage.setItem(LOCAL_PRODUCTION_DONE_PCS_KEY, JSON.stringify(updated));
  };

  // 1. Klik Tombol Kanan: Kurangi 1 pcs yang harus dibuat
  const handleIncrementDoneOne = (variantNama: string, totalGrossQty: number) => {
    const currentDone = completedPcsMap[variantNama] || 0;
    if (currentDone < totalGrossQty) {
      const updated = { ...completedPcsMap, [variantNama]: currentDone + 1 };
      savePcsMap(updated);
    } else {
      // Jika sudah 0 / selesai semua, klik lagi untuk reset kembali ke 0 selesai
      const updated = { ...completedPcsMap, [variantNama]: 0 };
      savePcsMap(updated);
    }
  };

  // 2. Gesture Swipe / Drag: Langsung selesaikan SEMUA qty menjadi 0 sisa
  const handleSwipeCompleteAll = (variantNama: string, totalGrossQty: number) => {
    const currentDone = completedPcsMap[variantNama] || 0;
    if (currentDone >= totalGrossQty) {
      // Jika sudah selesai semua, swipe balik untuk reset ke 0 selesai
      const updated = { ...completedPcsMap, [variantNama]: 0 };
      savePcsMap(updated);
    } else {
      // Selesaikan langsung semua
      const updated = { ...completedPcsMap, [variantNama]: totalGrossQty };
      savePcsMap(updated);
    }
  };

  const resetAllProduction = () => {
    if (confirm("Reset semua status progres produksi untuk sesi baru?")) {
      setCompletedPcsMap({});
      localStorage.removeItem(LOCAL_PRODUCTION_DONE_PCS_KEY);
    }
  };

  // Kalkulasi total pcs yang harus dibuat dari semua pesanan aktif (pending & confirmed)
  const productionSummary: ProductionSummary[] = PRODUCTS_DATA.map((prod) => {
    let totalPendingQty = 0;
    let totalConfirmedQty = 0;
    let totalCompletedQty = 0;

    orders.forEach((order) => {
      const matchedItem = order.items.find(
        (it) => it.namaVarian.toLowerCase() === prod.nama.toLowerCase()
      );
      if (matchedItem) {
        if (order.status === "pending") totalPendingQty += matchedItem.qty;
        else if (order.status === "confirmed") totalConfirmedQty += matchedItem.qty;
        else if (order.status === "completed") totalCompletedQty += matchedItem.qty;
      }
    });

    return {
      variantId: prod.id,
      variantNama: prod.nama,
      hargaSatuan: prod.harga,
      totalPendingQty,
      totalConfirmedQty,
      totalCompletedQty,
      totalAllQty: totalPendingQty + totalConfirmedQty + totalCompletedQty,
    };
  });

  // Urutkan varian yang paling banyak harus dibuat
  const sortedSummary = [...productionSummary].sort((a, b) => {
    const grossA = a.totalPendingQty + a.totalConfirmedQty;
    const remainingA = Math.max(0, grossA - (completedPcsMap[a.variantNama] || 0));

    const grossB = b.totalPendingQty + b.totalConfirmedQty;
    const remainingB = Math.max(0, grossB - (completedPcsMap[b.variantNama] || 0));

    return remainingB - remainingA;
  });

  const grandTotalRemaining = sortedSummary.reduce((acc, curr) => {
    const gross = curr.totalPendingQty + curr.totalConfirmedQty;
    const done = completedPcsMap[curr.variantNama] || 0;
    return acc + Math.max(0, gross - done);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="p-4 rounded-neo bg-brand-cream border-2 border-brand-dark flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neo-sm">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-neo-sm bg-brand-butter border-2 border-brand-dark flex items-center justify-center font-bold text-sm shrink-0">
            <Layers className="w-5 h-5 text-brand-dark" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-base text-brand-dark">
              Total Produksi per Varian
            </h4>
            <p className="text-xs text-brand-dark/70 font-medium">
              Klik tombol ✓ untuk selesaikan 1 pcs, atau Swipe/Geser baris untuk selesaikan langsung semuanya!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-neo-sm bg-brand-butter border-2 border-brand-dark text-xs font-bold text-brand-dark shadow-neo-sm">
            Sisa Buat: <span className="text-brand-accent font-extrabold">{grandTotalRemaining} pcs</span>
          </div>
          <button
            onClick={resetAllProduction}
            className="p-1.5 rounded-neo-sm bg-white border-2 border-brand-dark hover:bg-brand-pink neo-btn-sm text-xs font-bold flex items-center gap-1"
            title="Reset Ceklis Produksi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Semua</span>
          </button>
        </div>
      </div>

      {/* Swipeable Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-8 w-full">
        {sortedSummary.map((item) => {
          const grossQty = item.totalPendingQty + item.totalConfirmedQty;
          const donePcs = completedPcsMap[item.variantNama] || 0;
          const remainingQty = Math.max(0, grossQty - donePcs);
          const isDone = grossQty > 0 && remainingQty === 0;

          return (
            <SwipeProductionRow
              key={item.variantId}
              item={item}
              grossQty={grossQty}
              donePcs={donePcs}
              remainingQty={remainingQty}
              isDone={isDone}
              onDoneOne={() => handleIncrementDoneOne(item.variantNama, grossQty)}
              onSwipeAll={() => handleSwipeCompleteAll(item.variantNama, grossQty)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Sub-component untuk Swipe gesture di mobile & drag di desktop
interface SwipeRowProps {
  item: ProductionSummary;
  grossQty: number;
  donePcs: number;
  remainingQty: number;
  isDone: boolean;
  onDoneOne: () => void;
  onSwipeAll: () => void;
}

const SwipeProductionRow: React.FC<SwipeRowProps> = ({
  item,
  grossQty,
  donePcs,
  remainingQty,
  isDone,
  onDoneOne,
  onSwipeAll,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    if (diff > 0 && diff < 120) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 60) {
      onSwipeAll();
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  // Mouse Drag Desktop Support
  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    if (diff > 0 && diff < 120) {
      setDragOffset(diff);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (dragOffset > 60) {
        onSwipeAll();
      }
      setDragOffset(0);
      setIsDragging(false);
    }
  };

  return (
    <div
      className={`relative rounded-neo-sm border-2 border-brand-dark overflow-hidden transition-colors select-none ${
        isDone ? "bg-green-100 opacity-80" : "bg-white"
      }`}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Action Swipe Reveal (Selesaikan Semua Langsung) */}
      <div className="absolute inset-0 bg-brand-butter flex items-center px-4 justify-start font-heading font-bold text-xs text-brand-dark gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-700 animate-pulse" />
        <span>Lepaskan untuk Selesaikan Semua ({grossQty} pcs)!</span>
      </div>

      {/* Foreground Content Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
        className={`relative z-10 p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3 cursor-grab active:cursor-grabbing w-full ${
          isDone ? "bg-green-50 text-green-950" : "bg-white text-brand-dark"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-neo-sm bg-brand-cream border-2 border-brand-dark flex items-center justify-center shrink-0">
            <PastryIllustration variantId={item.variantId} size={32} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h5
                className={`font-heading font-bold text-xs sm:text-sm truncate ${
                  isDone ? "line-through text-brand-dark/50" : "text-brand-dark"
                }`}
              >
                {item.variantNama}
              </h5>
              {isDone && (
                <span className="neo-badge text-[9px] sm:text-[10px] bg-green-300 text-green-900 px-1 py-0.2 rounded shrink-0">
                  Semua Kelar
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-brand-dark/70 mt-0.5">
              <span>Total: {grossQty}</span>
              <span>•</span>
              <span className="text-green-700 font-bold">Kelar: {donePcs}</span>
            </div>
          </div>
        </div>

        {/* Right Qty Badge & Done 1 Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`px-2 sm:px-3 py-1 rounded-neo-sm border-2 border-brand-dark text-center shadow-neo-sm ${
              remainingQty > 0
                ? "bg-brand-butter text-brand-dark font-extrabold"
                : "bg-brand-bg text-brand-dark/40 font-semibold"
            }`}
          >
            <span className="text-[9px] sm:text-[10px] block -mb-0.5 sm:-mb-1 font-bold uppercase">Sisa</span>
            <span className="font-heading text-xs sm:text-base font-extrabold">{remainingQty} pcs</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDoneOne();
            }}
            className={`px-2 sm:px-2.5 h-7 sm:h-8 rounded-neo-sm border-2 border-brand-dark flex items-center justify-center gap-1 neo-btn-sm transition-all shrink-0 font-heading font-extrabold text-[10px] sm:text-xs ${
              isDone ? "bg-green-400 text-brand-dark" : "bg-white hover:bg-brand-butter"
            }`}
            title="Klik untuk selesaikan 1 pcs"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>-1</span>
          </button>
        </div>
      </div>
    </div>
  );
};

