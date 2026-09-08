/**
 * FILE INI ADALAH CONTOH/TEMPLATE DARI firebase.ts
 *
 * CARA PAKAI:
 * 1. Salin (copy) file ini menjadi `firebase.ts` di folder yang sama:
 *      cp firebase.example.ts firebase.ts
 * 2. Isi environment variables di file `.env.local` di root project
 *    (lihat `.env.example` untuk format lengkapnya).
 * 3. JANGAN commit file `firebase.ts` yang sudah berisi kredensial asli.
 *    File tersebut sudah di-.gitignore.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Cek apakah konfigurasi Firebase valid
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.startsWith("AIza") &&
  !firebaseConfig.apiKey.includes("Dummy")
);

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
