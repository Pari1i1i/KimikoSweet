"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

interface AuthContextType {
  user: User | { email: string; uid: string } | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const AUTH_LOCAL_KEY = "kimiko_admin_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { email: string; uid: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek dulu apakah ada sesi login tersimpan di localStorage agar saat refresh TIDAK LEMPAR / HILANG
    try {
      const savedUser = localStorage.getItem(AUTH_LOCAL_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    }

    // 2. Sinkronkan dengan Firebase Auth secara persistent
    if (isFirebaseConfigured) {
      setPersistence(auth, browserLocalPersistence).catch(() => {});
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userObj = {
            email: firebaseUser.email || "admin@kimikosweets.com",
            uid: firebaseUser.uid,
          };
          setUser(firebaseUser);
          localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(userObj));
        } else {
          // Jika memang tidak ada sesi di firebase
          const saved = localStorage.getItem(AUTH_LOCAL_KEY);
          if (!saved) {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (isFirebaseConfigured) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const userObj = {
          email: res.user.email || email,
          uid: res.user.uid,
        };
        setUser(res.user);
        localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(userObj));
      } catch (fbErr: unknown) {
        // Jika Firebase Auth gagal karena network/offline atau akun lokal khusus (admin / demo)
        const fbMessage = fbErr instanceof Error ? fbErr.message : "";
        const isNetworkOrConfig =
          fbMessage.includes("auth/network-request-failed") ||
          fbMessage.includes("auth/api-key-not-valid") ||
          fbMessage.includes("auth/internal-error");

        if (isNetworkOrConfig) {
          if (pass.length < 5) {
            throw new Error("Password minimal 6 karakter");
          }
          const mockUser = {
            email: email || "admin@kimikosweets.com",
            uid: "admin-" + Date.now(),
          };
          setUser(mockUser);
          localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(mockUser));
        } else {
          throw fbErr;
        }
      }
    } else {
      if (pass.length < 5) {
        throw new Error("Password minimal 6 karakter");
      }
      const mockUser = {
        email: email || "admin@kimikosweets.com",
        uid: "admin-" + Date.now(),
      };
      setUser(mockUser);
      localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(AUTH_LOCAL_KEY);
      if (isFirebaseConfigured) {
        await fbSignOut(auth);
      }
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
