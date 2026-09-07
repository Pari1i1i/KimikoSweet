"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut 
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

interface AuthContextType {
  user: User | { email: string; uid: string } | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isMockAuth: false,
});

const MOCK_AUTH_STORAGE_KEY = "kimiko_mock_admin_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { email: string; uid: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockAuth, setIsMockAuth] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock auth fallback for development / offline preview
      setIsMockAuth(true);
      const savedMock = localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
      if (savedMock) {
        try {
          setUser(JSON.parse(savedMock));
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (isFirebaseConfigured) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Demo login verification
      if (pass.length < 5) {
        throw new Error("Password minimal 6 karakter");
      }
      const mockUser = {
        email: email || "admin@kimikosweets.com",
        uid: "mock-admin-" + Date.now(),
      };
      localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isMockAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
