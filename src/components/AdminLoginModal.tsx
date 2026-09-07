"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { MascotChoux } from "./MascotChoux";
import { X, LogIn, AlertCircle } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      setIsLoading(false);
      onClose();
      router.push("/admin");
    } catch (err: unknown) {
      setIsLoading(false);
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes("auth/invalid-credential") || err.message.includes("auth/wrong-password") || err.message.includes("auth/user-not-found")) {
          setErrorMsg("Email atau Password salah. Pastikan akun sudah dibuat di Firebase Console -> Authentication -> Users.");
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg("Gagal login. Periksa koneksi atau akun Firebase kamu.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-dark/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-bg w-full max-w-md rounded-neo-lg border-neo-thick border-brand-dark shadow-neo-xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-brand-butter border-b-neo border-brand-dark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
              <MascotChoux pose="chef" size={30} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-dark leading-tight">
                Login Dapur Penjual
              </h3>
              <p className="text-[10px] sm:text-[11px] font-semibold text-brand-dark/70">
                Khusus Admin & Penjual KiMiko Sweets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-neo-sm bg-white border-2 border-brand-dark flex items-center justify-center hover:bg-brand-pink neo-btn-sm"
            aria-label="Tutup Modal"
          >
            <X className="w-4 h-4 text-brand-dark" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 bg-white">
          {errorMsg && (
            <div className="p-3 rounded-neo-sm bg-red-100 border-2 border-red-500 text-red-900 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
              Email Penjual / Admin <span className="text-brand-accent">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@kimikosweets.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-neo-sm neo-input text-xs sm:text-sm font-semibold text-brand-dark bg-brand-bg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
              Password <span className="text-brand-accent">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-neo-sm neo-input text-xs sm:text-sm font-semibold text-brand-dark bg-brand-bg"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-neo-sm bg-brand-bg border-2 border-brand-dark text-xs font-bold neo-btn-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-2.5 rounded-neo-sm bg-brand-accent text-white font-heading font-bold text-xs sm:text-sm neo-btn flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
