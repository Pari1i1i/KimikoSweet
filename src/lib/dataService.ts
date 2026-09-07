import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  Unsubscribe 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Order, IncomeSession, Review, Product } from "@/types";
import { PRODUCTS_DATA, INITIAL_REVIEWS } from "@/data/products";

// Fallback Local Storage / In-Memory Event Listener untuk pengalaman instan tanpa konfigurasi API Firestore
const LOCAL_STORAGE_ORDERS_KEY = "kimiko_orders_store";
const LOCAL_STORAGE_REVIEWS_KEY = "kimiko_reviews_store";
const LOCAL_STORAGE_SESSION_KEY = "kimiko_session_store";

// Helper event emitter sederhana untuk sync tab / client yang sama jika Firebase belum diatur
type Listener<T> = (data: T) => void;
const listeners = {
  orders: new Set<Listener<Order[]>>(),
  reviews: new Set<Listener<Review[]>>(),
  sessions: new Set<Listener<IncomeSession | null>>(),
};

function getLocalData<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

export const dataService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    return PRODUCTS_DATA;
  },

  // SUBSCRIBE ORDERS
  subscribeOrders(callback: (orders: Order[]) => void): Unsubscribe {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "orders");
        return onSnapshot(
          colRef,
          (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({ id: docSnap.id, ...data } as Order);
            });
            // Urutkan createdAt terbaru di atas
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(list);
          },
          (err) => {
            console.error("Firestore order listener error:", err);
            const local = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
            callback(local);
          }
        );
      } catch (e) {
        console.error("Firebase subscribeOrders failed:", e);
      }
    }

    // Local Realtime Memory/Storage Listener
    const emit = () => {
      const orders = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
      callback(orders);
    };

    listeners.orders.add(callback);
    emit();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_ORDERS_KEY) {
        emit();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      listeners.orders.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  // CREATE ORDER
  async createOrder(orderData: Omit<Order, "id">): Promise<string> {
    const customId = "KMK-" + Math.floor(100000 + Math.random() * 900000);
    const newOrderPayload: Order = { ...orderData, id: customId };

    // Simpan ke local cache selalu agar instan tampil
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const updated = [newOrderPayload, ...current];
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", customId);
        await setDoc(docRef, newOrderPayload);
      } catch (err) {
        console.error("Firestore createOrder error:", err);
      }
    }

    return customId;
  },

  // UPDATE ORDER STATUS
  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const updated = current.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", orderId);
        await updateDoc(docRef, { status });
      } catch (err) {
        console.error("Firestore updateOrderStatus error:", err);
      }
    }
  },

  // SUBSCRIBE REVIEWS
  subscribeReviews(callback: (reviews: Review[]) => void): Unsubscribe {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "reviews");
        return onSnapshot(
          colRef,
          (snapshot) => {
            const list: Review[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Review);
            });
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(list.length > 0 ? list : INITIAL_REVIEWS);
          },
          (err) => {
            console.error("Firestore reviews error:", err);
            const local = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
            callback(local);
          }
        );
      } catch (e) {
        console.error("Firebase subscribeReviews failed:", e);
      }
    }

    const emit = () => {
      const reviews = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
      callback(reviews);
    };

    listeners.reviews.add(callback);
    emit();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_REVIEWS_KEY) {
        emit();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      listeners.reviews.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  // ADD REVIEW
  async addReview(reviewData: Omit<Review, "id">): Promise<string> {
    const revId = "rev-" + Date.now();
    const newRevPayload: Review = { ...reviewData, id: revId };

    const current = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
    const updated = [newRevPayload, ...current];
    setLocalData(LOCAL_STORAGE_REVIEWS_KEY, updated);
    listeners.reviews.forEach((l) => l(updated));

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "reviews", revId);
        await setDoc(docRef, newRevPayload);
      } catch (err) {
        console.error("Firestore addReview error:", err);
      }
    }

    return revId;
  },

  // SUBSCRIBE ACTIVE INCOME SESSION
  subscribeActiveSession(callback: (session: IncomeSession | null) => void): Unsubscribe {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "incomeSessions", "current_active_session");
        return onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              callback(docSnap.data() as IncomeSession);
            } else {
              callback(null);
            }
          },
          (err) => {
            console.error("Firestore session error:", err);
            const local = getLocalData<IncomeSession | null>(LOCAL_STORAGE_SESSION_KEY, null);
            callback(local);
          }
        );
      } catch (e) {
        console.error("Firebase subscribeActiveSession failed:", e);
      }
    }

    const emit = () => {
      const session = getLocalData<IncomeSession | null>(LOCAL_STORAGE_SESSION_KEY, null);
      callback(session);
    };

    listeners.sessions.add(callback);
    emit();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_SESSION_KEY) {
        emit();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      listeners.sessions.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  // START NEW SESSION
  async startNewSession(saldoAwal: number, namaSesi: string = "Sesi Hari Ini"): Promise<void> {
    const session: IncomeSession = {
      id: "current_active_session",
      saldoAwal,
      mulaiPada: Date.now(),
      aktif: true,
      namaSesi,
    };

    setLocalData(LOCAL_STORAGE_SESSION_KEY, session);
    listeners.sessions.forEach((l) => l(session));

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "incomeSessions", "current_active_session");
        await setDoc(docRef, session);
      } catch (err) {
        console.error("Firestore startNewSession error:", err);
      }
    }
  },
};

