# KiMiko Sweets - Choux Pastry Ordering System

Website pemesanan kue sus (choux pastry) untuk **KiMiko Sweets** di SMAN 105 Jakarta. Dibangun dengan desain **Neobrutalism Pastel**, ilustrasi custom SVG, dan sistem realtime berbasis Firebase Firestore + Local Storage.

## Tech Stack

- **Framework** : Next.js 14 (App Router, Static Export)
- **Bahasa** : TypeScript
- **Styling** : Tailwind CSS (Neobrutalism Pastel theme)
- **Database** : Firebase Firestore (realtime listener) + LocalStorage (offline-first)
- **Auth** : Firebase Authentication (Email/Password)
- **Hosting** : Firebase Hosting (Paket Spark, gratis)
- **Lainnya** : canvas-confetti, lucide-react icons

## Fitur Utama

### Sisi Pembeli (Halaman Utama `/`)
- Katalog 13 varian kue sus (Classic @6K, Special @7K) dengan ilustrasi SVG
- Keranjang belanja dengan quantity management
- Form checkout lengkap: nama, kelas, nomor WhatsApp, tanggal pengambilan (khusus Senin & Kamis), metode bayar (QRIS/Cash), catatan, opsi pesan sebagai anonim
- Validasi otomatis tanggal pengambilan (hanya hari Senin & Kamis)
- Cek status pesanan realtime berdasarkan nama / ID pesanan
- Dinding ulasan (review wall) dari pembeli

### Sisi Admin (Halaman `/admin`)
- Login admin via Firebase Auth (dengan fallback offline)
- **Tab Pesanan Pembeli** : Datagrid lengkap dengan filter status, filter tanggal pengambilan dinamis, pencarian, aksi konfirmasi/selesai, link WhatsApp pembeli
- **Tab Total Produksi per Varian** : Rekapitulasi produksi per varian yang difilter berdasarkan tanggal pengambilan, progress ceklis swipe/klik, auto-sort berdasarkan sisa buat
- **Tab Manajemen Pendapatan** : Sesi penjualan (saldo awal + omset live), kalkulasi keuntungan otomatis (Rp1.000/pcs). Mulai sesi baru akan **mereset semua pesanan dan progres produksi**

### Fitur Teknis
- **Offline-first** : Data tersimpan di LocalStorage, sync ke Firestore saat online
- **Cross-tab sync** : Perubahan data realtime antar tab browser via BroadcastChannel API
- **Anonim order** : Catatan pesanan disamarkan ("-") di sisi publik, tetap terbaca oleh admin
- **Sanitasi payload** : Field `undefined` otomatis dibersihkan sebelum dikirim ke Firestore
- **Resilient listeners** : Fallback ke data lokal jika koneksi Firestore gagal

## Struktur Folder

```
src/
  app/
    page.tsx              # Halaman utama pembeli
    admin/page.tsx        # Dashboard admin penjual
    layout.tsx            # Root layout
    globals.css           # Tailwind + custom styles
  components/
    Navbar.tsx            # Navigasi utama
    ProductCard.tsx       # Kartu produk
    CartCheckoutModal.tsx # Modal keranjang & checkout
    OrderStatusTracker.tsx# Cek status pesanan (publik)
    OrdersDatagrid.tsx    # Tabel pesanan (admin)
    ProductionDatagrid.tsx# Rekapitulasi produksi (admin)
    IncomeDashboard.tsx   # Manajemen pendapatan (admin)
    ReviewsWall.tsx       # Dinding ulasan
    AdminLoginModal.tsx   # Modal login admin
    MascotChoux.tsx       # Maskot SVG
    PastryIllustration.tsx# Ilustrasi varian kue
    Footer.tsx            # Footer
  lib/
    firebase.ts           # Konfigurasi Firebase (di-gitignore)
    firebase.example.ts   # Template firebase.ts (commit-safe)
    dataService.ts        # Service layer: CRUD + realtime sync
    AuthContext.tsx        # Context auth admin
    CartContext.tsx        # Context keranjang belanja
  types/
    index.ts              # TypeScript interfaces
  data/
    products.ts           # Data 13 varian kue sus
```

## Setup & Instalasi

### 1. Clone repository

```bash
git clone https://github.com/<username>/KimikoSweet.git
cd KimikoSweet
npm install
```

### 2. Setup Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan **Authentication** (Email/Password) dan buat akun admin
3. Aktifkan **Cloud Firestore** (lokasi: `asia-southeast1`)
4. Daftarkan Web App dan salin konfigurasi

### 3. Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Setup file Firebase config

```bash
cp src/lib/firebase.example.ts src/lib/firebase.ts
```

File `firebase.ts` sudah membaca dari environment variables, tidak perlu diubah manual.

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 6. Build & Deploy ke Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

## Firestore Security Rules

File `firestore.rules` sudah disediakan di root project. Rules mengizinkan:
- **Orders** : Siapa saja bisa baca, buat, update. Hapus hanya user terautentikasi.
- **Reviews** : Siapa saja bisa baca & buat. Edit/hapus hanya user terautentikasi.
- **Income Sessions** : Baca & tulis terbuka.

## File yang Di-gitignore

| File | Alasan |
|---|---|
| `.env.local` | Berisi kredensial Firebase |
| `src/lib/firebase.ts` | Berisi konfigurasi Firebase yang dibaca dari env |
| `.next/` | Build artifacts |
| `node_modules/` | Dependencies |

Gunakan `.env.example` dan `src/lib/firebase.example.ts` sebagai referensi setup.

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production (static export) |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |

## Lisensi

Project ini dibuat untuk keperluan usaha kue sus **KiMiko Sweets** di SMAN 105 Jakarta.
