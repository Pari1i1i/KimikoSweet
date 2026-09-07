"use client";

import React from "react";
import Link from "next/link";
import { MascotChoux } from "./MascotChoux";
import { Heart, Github, Sparkles, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t-neo border-brand-dark bg-brand-cream/60 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Info */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-neo-sm bg-brand-butter border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
            <MascotChoux pose="chef" size={38} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-brand-dark">
              KiMiko Sweets 🥟
            </h3>
            <p className="text-xs text-brand-dark/80 font-medium">
              Kue Sus Artisan — Homemade fresh setiap hari dengan bahan premium.
            </p>
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-brand-dark">
          <div className="px-3 py-1.5 rounded-neo-sm bg-brand-pink border-2 border-brand-dark shadow-neo-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>13 Varian Rasa Lengkap</span>
          </div>
          <div className="px-3 py-1.5 rounded-neo-sm bg-brand-butter border-2 border-brand-dark shadow-neo-sm flex items-center gap-1.5">
            <span>Mulai Rp6.000 / pcs</span>
          </div>
        </div>

        {/* Mandatory Copyright Pari1i1i */}
        <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right">
          <a
            href="https://github.com/Pari1i1i"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-brand-dark rounded-neo-sm shadow-neo-sm hover:bg-brand-butter neo-btn-sm text-xs font-bold transition-all text-brand-dark"
          >
            <Github className="w-4 h-4 text-brand-dark group-hover:scale-110 transition-transform" />
            <span>Created by <strong className="text-brand-accent">Pari1i1i</strong></span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <p className="text-[11px] font-semibold text-brand-dark/70">
            © {new Date().getFullYear()} KiMiko Sweets • All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
