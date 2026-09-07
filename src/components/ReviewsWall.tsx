"use client";

import React, { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import { Review } from "@/types";
import { MascotChoux } from "./MascotChoux";
import { MessageSquarePlus, Star, Send, Sparkles, User, Heart } from "lucide-react";

export const ReviewsWall: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nama, setNama] = useState("");
  const [komentar, setKomentar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = dataService.subscribeReviews((list) => {
      setReviews(list);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!komentar.trim()) return;

    setIsSubmitting(true);
    try {
      await dataService.addReview({
        namaPembeli: nama.trim() || "Sobat Manis (Anonim)",
        komentar: komentar.trim(),
        rating: 5,
        createdAt: Date.now(),
      });
      setKomentar("");
      setNama("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} mnt lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Header Form Card */}
      <div className="neo-card-lg p-5 sm:p-6 bg-brand-pink border-neo-thick border-brand-dark shadow-neo">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-14 h-14 rounded-neo bg-brand-butter border-2 border-brand-dark flex items-center justify-center shrink-0 shadow-neo-sm">
              <MascotChoux pose="happy" size={46} />
            </div>
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-brand-dark">
                Dinding Ulasan Sobat Manis ✨
              </h3>
              <p className="text-xs sm:text-sm text-brand-dark/80 font-medium">
                Kirim pesan manis, ulasan rasa favorit, atau saran untuk KiMiko Sweets!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white border-2 border-brand-dark px-3 py-1 rounded-full shadow-neo-sm text-xs font-bold">
            <Sparkles className="w-4 h-4 text-brand-accent animate-spin" />
            <span>Update Live Realtime</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3 bg-white p-4 rounded-neo border-2 border-brand-dark shadow-neo-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1">
                Nama Kamu (Boleh Anonim)
              </label>
              <input
                type="text"
                placeholder="Misal: Alya / Anonim"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 rounded-neo-sm neo-input text-xs font-semibold text-brand-dark bg-brand-bg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1">
                Ulasan / Pesan Manis <span className="text-brand-accent">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ceritakan rasanya, varian favoritmu, dsb..."
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-neo-sm neo-input text-xs font-semibold text-brand-dark bg-brand-bg"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !komentar.trim()}
                  className="px-4 py-2 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs neo-btn-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-neo border-2 border-brand-dark shadow-neo">
          <MascotChoux pose="thinking" size={100} className="mx-auto" />
          <h4 className="font-heading text-base font-bold text-brand-dark mt-2">
            Belum Ada Ulasan
          </h4>
          <p className="text-xs text-brand-dark/70 max-w-sm mx-auto mt-1 font-medium">
            Jadilah yang pertama memberikan ulasan manis untuk KiMiko Sweets di atas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-neo bg-white border-2 border-brand-dark shadow-neo-sm flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-brand-dark/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-butter border border-brand-dark flex items-center justify-center font-heading font-bold text-xs">
                      {rev.namaPembeli.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-brand-dark truncate max-w-[130px]">
                        {rev.namaPembeli}
                      </h4>
                      <p className="text-[10px] text-brand-dark/50 font-medium">
                        {timeAgo(rev.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-brand-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-brand-butter text-brand-dark" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-brand-dark/90 font-medium mt-2.5 leading-relaxed">
                  &ldquo;{rev.komentar}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-brand-dark/50 pt-1">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-brand-accent fill-brand-accent" />
                  Pecinta Kue Sus
                </span>
                <span className="bg-brand-pink/50 px-2 py-0.5 rounded-full border border-brand-dark/20 text-brand-dark">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
