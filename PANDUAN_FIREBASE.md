# Panduan Setup & Deploy "KiMiko Sweets" ke Firebase (Paket Spark - 100% Gratis)

Halo! Website pemesanan kue sus **KiMiko Sweets** sudah selesai dibangun secara utuh dengan standar desain **Neobrutalism Pastel**, ilustrasi custom SVG Choux, realtime listener Firestore, dan static export Next.js yang siap di-deploy ke Firebase Hosting klasik gratis.

---

## 🛠️ Langkah 1: Buat Project di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/) dan login dengan akun Google kamu.
2. Klik **"Add project"** / **"Tambahkan project"**.
3. Beri nama project: `kimiko-sweets` (atau nama unik lainnya).
4. Matikan opsi *Google Analytics* (opsional, agar setup lebih cepat) lalu klik **"Create Project"**.

---

## 🔐 Langkah 2: Aktifkan Firebase Authentication

1. Di menu sidebar kiri Firebase Console, klik **Build** -> **Authentication**.
2. Klik **"Get Started"**.
3. Di tab **Sign-in method**, pilih **Email/Password** dan aktifkan toggle **Enable** (Email link tidak perlu diaktifkan), lalu klik **Save**.
4. Pindah ke tab **Users** -> Klik **"Add user"**.
5. Masukkan email dan password untuk akun penjual (misalnya `admin@kimikosweets.com` dan password pilihanmu). Akun ini yang dipakai login di halaman `/admin`.

---

## 🗄️ Langkah 3: Aktifkan Cloud Firestore

1. Di menu sidebar kiri, klik **Build** -> **Firestore Database**.
2. Klik **"Create database"**.
3. Pilih lokasi database terdekat (misal: `asia-southeast1` untuk Singapura / Indonesia).
4. Pilih **"Start in test mode"** atau gunakan aturan rules yang sudah disediakan di file `firestore.rules`.
5. Klik **Create** / **Enable**.

---

## 🌐 Langkah 4: Daftarkan Web App & Ambil Kunci Config

1. Di Firebase Console, klik icon **Settings (Gerigi)** di samping *Project Overview* -> Pilih **Project settings**.
2. Scroll ke bawah ke bagian **Your apps**, klik icon web `</>`.
3. Masukkan App nickname: `KiMiko Sweets Web`.
4. Jangan centang *Firebase Hosting* dulu, klik **Register app**.
5. Copy nilai konfigurasi `firebaseConfig` yang muncul.
6. Buat/sesuaikan file `.env.local` di folder project ini:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kimiko-sweets-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kimiko-sweets-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kimiko-sweets-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789...:web:...
```

Sesuaikan juga nama ID project di file `.firebaserc`:
```json
{
  "projects": {
    "default": "ID_PROJECT_FIREBASE_KAMU"
  }
}
```

---

## 🚀 Langkah 5: Build & Deploy ke Firebase Hosting (Gratis Spark)

1. Install Firebase CLI jika belum punya:
   ```bash
   npm install -g firebase-tools
   ```

2. Login ke akun Google kamu di terminal:
   ```bash
   firebase login
   ```

3. Build static export website KiMiko Sweets:
   ```bash
   npm run build
   ```
   *(Hasil build akan otomatis diekspor ke folder `out/`)*

4. Deploy ke Firebase Hosting & deploy Firestore security rules:
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

5. Selesai! Terminal akan memberikan link URL publik gratis dari Firebase Hosting (contoh: `https://kimiko-sweets-xxx.web.app`).

---

## 💖 Hak Cipta & Identitas
- **Project Name**: KiMiko Sweets (Choux Pastry)
- **Design System**: Neobrutalism Pastel (`#FFF9FB`, `#FFD3E6`, `#FF5C9A`, `#FFE066`, `#1A1A1A`)
- **Author / GitHub**: [Pari1i1i](https://github.com/Pari1i1i) (Tercantum rapi di footer semua halaman).
