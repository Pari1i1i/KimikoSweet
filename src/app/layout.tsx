import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KiMiko Sweets — Kue Sus Premium Neobrutalism Lucu",
  description:
    "Pesan kue sus aneka rasa favoritmu di KiMiko Sweets! Renyah di luar, lumer lezat di dalam. Pesan praktis & cek status pesananmu secara realtime.",
  authors: [{ name: "Pari1i1i", url: "https://github.com/Pari1i1i" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fredoka.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-brand-bg text-brand-dark font-body antialiased min-h-screen flex flex-col selection:bg-brand-butter selection:text-brand-dark">
        {children}
      </body>
    </html>
  );
}
