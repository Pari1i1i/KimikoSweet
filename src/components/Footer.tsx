"use client";

import React from "react";
import Link from "next/link";
import { MascotChoux } from "./MascotChoux";
import { Sparkles, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t-neo border-brand-dark bg-brand-cream/60 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Info */}
        <div className="flex items-center gap-3 text-center md:text-left justify-center md:justify-start">
          <div className="w-12 h-12 rounded-neo-sm bg-brand-butter border-2 border-brand-dark flex items-center justify-center shadow-neo-sm shrink-0">
            <MascotChoux pose="chef" size={38} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-brand-dark">
              KiMiko Sweets 🥟
            </h3>
            <p className="text-xs text-brand-dark/80 font-medium">
              Kue Sus SMAN 105 Jakarta — Homemade fresh setiap hari dengan bahan premium.
            </p>
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-brand-dark">
          <div className="px-3 py-1.5 rounded-neo-sm bg-brand-pink border-2 border-brand-dark shadow-neo-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>13 Varian Rasa Lengkap</span>
          </div>
          <div className="px-3 py-1.5 rounded-neo-sm bg-brand-butter border-2 border-brand-dark shadow-neo-sm flex items-center gap-1.5">
            <span>Mulai Rp6.000 / pcs</span>
          </div>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-neo-sm bg-white border-2 border-brand-dark shadow-neo-sm hover:bg-brand-butter neo-btn-sm flex items-center gap-1.5 text-brand-dark cursor-pointer"
          >
            <span>👨‍🍳 Dapur Penjual (Admin)</span>
          </Link>
        </div>

        {/* Mandatory Copyright Pari1i1i */}
        <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right">
          <a
            href="https://github.com/Pari1i1i"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-brand-dark rounded-neo-sm shadow-neo-sm hover:bg-brand-butter neo-btn-sm text-xs font-bold transition-all text-brand-dark"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-dark group-hover:scale-110 transition-transform"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
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

