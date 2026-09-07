"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/lib/CartContext";
import { PastryIllustration } from "./PastryIllustration";
import { Plus, Minus, Check, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleIncrement = () => setQty((prev) => prev + 1);
  const handleDecrement = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addItem(product, qty);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQty(1);
    }, 1200);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      className="neo-card flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-neo-lg group"
      style={{ backgroundColor: product.bgWarna || "#FFFFFF" }}
    >
      {/* Top Banner / Category Badge */}
      <div className="p-3 pb-0 flex items-center justify-between gap-1.5">
        <span className="neo-badge text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-butter text-brand-dark truncate max-w-[120px]">
          {product.badge || (product.kategori === "special" ? "Special" : "Classic")}
        </span>
        <div className="neo-badge px-2 py-0.5 rounded-full bg-white text-[11px] sm:text-xs font-extrabold text-brand-dark shrink-0">
          {formatRupiah(product.harga)}
        </div>
      </div>

      {/* Center Illustration */}
      <div className="p-2 sm:p-3 flex flex-col items-center justify-center relative my-1">
        <div className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2">
          <PastryIllustration variantId={product.id} size={120} />
        </div>
      </div>

      {/* Details & Action Controls */}
      <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-sm border-t-2 border-brand-dark flex flex-col gap-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base sm:text-lg font-bold text-brand-dark leading-snug">
              {product.nama}
            </h3>
            <span className="text-[10px] sm:text-[11px] font-bold text-brand-dark/60 uppercase">
              / pcs
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-brand-dark/80 line-clamp-2 mt-0.5 font-medium min-h-[28px] sm:min-h-[32px]">
            {product.deskripsi}
          </p>
        </div>

        {/* Counter & Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
          {/* Quantity selector */}
          <div className="flex items-center border-2 border-brand-dark rounded-neo-sm bg-brand-bg shadow-neo-sm">
            <button
              onClick={handleDecrement}
              disabled={qty <= 1}
              className="p-1 sm:p-1.5 hover:bg-brand-pink/50 disabled:opacity-30 transition-colors"
              aria-label="Kurang satu"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-dark" />
            </button>
            <span className="w-6 sm:w-7 text-center font-heading font-bold text-xs sm:text-sm text-brand-dark">
              {qty}
            </span>
            <button
              onClick={handleIncrement}
              className="p-1 sm:p-1.5 hover:bg-brand-pink/50 transition-colors"
              aria-label="Tambah satu"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-dark" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-neo-sm font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all neo-btn-sm ${
              isAdded
                ? "bg-brand-butter text-brand-dark"
                : "bg-brand-accent text-white hover:bg-brand-accent/90"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span>Masuk!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>+ Pesan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
