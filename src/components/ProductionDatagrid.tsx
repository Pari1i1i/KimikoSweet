"use client";

import React, { useState, useEffect, useRef } from "react";
import { Order } from "@/types";
import { PastryIllustration } from "./PastryIllustration";
import { PRODUCTS_DATA } from "@/data/products";
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

const LOCAL_PRODUCTION_COMPLETED_KEY = "kimiko_production_completed_map";

export const ProductionDatagrid: React.FC<ProductionDatagridProps> = ({ orders }) => {
  // Map variantId -> boolean (apakah varian sudah selesai dibuat di sesi ini)
  const [completedVariants, setCompletedVariants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PRODUCTION_COMPLETED_KEY);
      if (saved) {
        setCompletedVariants(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleComplete = (variantNama: string) => {
    setCompletedVariants((prev) => {
      const updated = { ...prev, [variantNama]: !prev[variantNama] };
      localStorage.setItem(LOCAL_PRODUCTION_COMPLETED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetAllProduction = () => {
    if (confirm("Reset status selesai semua produksi untuk sesi baru?")) {
      setCompletedVariants({});
      localStorage.removeItem(LOCAL_PRODUCTION_COMPLETED_KEY);
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
    const activeA = a.totalPendingQty + a.totalConfirmedQty;
    const activeB = b.totalPendingQty + b.totalConfirmedQty;
    return activeB - activeA;
  });

  const grandTotalActiveProduction = sortedSummary.reduce(
    (acc, curr) => acc + curr.totalPendingQty + curr.totalConfirmedQty,
    0
  );

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
              Datagrid Total Produksi per Varian (Rekap Otomatis)
            </h4>
            <p className="text-xs text-brand-dark/70 font-medium">
              Akumulasi jumlah kue sus yang harus dibuat oleh dapur. Swipe/geser baris untuk tandai selesai!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-neo-sm bg-brand-butter border-2 border-brand-dark text-xs font-bold text-brand-dark shadow-neo-sm">
            Total Dapur: <span className="text-brand-accent font-extrabold">{grandTotalActiveProduction} pcs</span>
          </div>
          <button
            onClick={resetAllProduction}
            className="p-1.5 rounded-neo-sm bg-white border-2 border-brand-dark hover:bg-brand-pink neo-btn-sm text-xs font-bold flex items-center gap-1"
            title="Reset Ceklis Produksi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Ceklis</span>
          </button>
        </div>
      </div>

      {/* Swipeable Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedSummary.map((item) => {
          const isDone = Boolean(completedVariants[item.variantNama]);
          const activeQty = item.totalPendingQty + item.totalConfirmedQty;

          return (
            <SwipeProductionRow
              key={item.variantId}
              item={item}
              isDone={isDone}
              activeQty={activeQty}
              onToggle={() => toggleComplete(item.variantNama)}
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
  isDone: boolean;
  activeQty: number;
  onToggle: () => void;
}

const SwipeProductionRow: React.FC<SwipeRowProps> = ({
  item,
  isDone,
  activeQty,
  onToggle,
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
      onToggle();
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
        onToggle();
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
      {/* Background Action Swipe Reveal */}
      <div className="absolute inset-0 bg-brand-butter flex items-center px-4 justify-start font-heading font-bold text-xs text-brand-dark gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-700 animate-pulse" />
        <span>Lepaskan untuk Tandai {isDone ? "Belum" : "Selesai"}!</span>
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
        className={`relative z-10 p-3.5 flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing ${
          isDone ? "bg-green-50 text-green-950" : "bg-white text-brand-dark"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-neo-sm bg-brand-cream border-2 border-brand-dark flex items-center justify-center shrink-0">
            <PastryIllustration variantId={item.variantId} size={36} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h5
                className={`font-heading font-bold text-sm ${
                  isDone ? "line-through text-brand-dark/50" : "text-brand-dark"
                }`}
              >
                {item.variantNama}
              </h5>
              {isDone && (
                <span className="neo-badge text-[10px] bg-green-300 text-green-900 px-1.5 py-0.2 rounded">
                  Sudah Dibuat
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-dark/70 mt-0.5">
              <span>Pending: {item.totalPendingQty}</span>
              <span>•</span>
              <span>Confirmed: {item.totalConfirmedQty}</span>
              <span>•</span>
              <span>Selesai: {item.totalCompletedQty}</span>
            </div>
          </div>
        </div>

        {/* Right Qty Badge & Toggle Button */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-neo-sm border-2 border-brand-dark text-center shadow-neo-sm ${
              activeQty > 0
                ? "bg-brand-butter text-brand-dark font-extrabold"
                : "bg-brand-bg text-brand-dark/40 font-semibold"
            }`}
          >
            <span className="text-[10px] block -mb-1 font-bold uppercase">Harus Buat</span>
            <span className="font-heading text-base font-extrabold">{activeQty} pcs</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`w-8 h-8 rounded-neo-sm border-2 border-brand-dark flex items-center justify-center neo-btn-sm transition-all ${
              isDone ? "bg-green-400 text-brand-dark" : "bg-white hover:bg-brand-butter"
            }`}
            title="Klik atau Swipe untuk selesai"
          >
            <Check className={`w-4 h-4 stroke-[3] ${isDone ? "scale-110" : "text-brand-dark/40"}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
