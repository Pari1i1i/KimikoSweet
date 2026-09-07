import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
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
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        return onSnapshot(
          q,
          (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Order);
            });
            callback(list);
          },
          (err) => {
            console.warn("Firestore error fallback to local:", err);
            // Fallback to local
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

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", customId);
        await setDoc(docRef, { ...orderData, id: customId });
        return customId;
      } catch (err) {
        console.warn("Firebase createOrder error, saving to local fallback:", err);
      }
    }

    // Fallback Local
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const newOrder: Order = { ...orderData, id: customId };
    const updated = [newOrder, ...current];
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));
    return customId;
  },

  // UPDATE ORDER STATUS
  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", orderId);
        await updateDoc(docRef, { status });
        return;
      } catch (err) {
        console.warn("Firebase updateOrderStatus fallback to local:", err);
      }
    }

    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const updated = current.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));
  },

  // SUBSCRIBE REVIEWS
  subscribeReviews(callback: (reviews: Review[]) => void): Unsubscribe {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        return onSnapshot(
          q,
          (snapshot) => {
            const list: Review[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Review);
            });
            callback(list.length > 0 ? list : INITIAL_REVIEWS);
          },
          (err) => {
            console.warn("Firestore reviews error fallback to local:", err);
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

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "reviews", revId);
        await setDoc(docRef, { ...reviewData, id: revId });
        return revId;
      } catch (err) {
        console.warn("Firebase addReview fallback to local:", err);
      }
    }

    const current = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
    const newRev: Review = { ...reviewData, id: revId };
    const updated = [newRev, ...current];
    setLocalData(LOCAL_STORAGE_REVIEWS_KEY, updated);
    listeners.reviews.forEach((l) => l(updated));
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
            console.warn("Firestore session error fallback to local:", err);
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

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "incomeSessions", "current_active_session");
        await setDoc(docRef, session);
        return;
      } catch (err) {
        console.warn("Firebase startNewSession fallback to local:", err);
      }
    }

    setLocalData(LOCAL_STORAGE_SESSION_KEY, session);
    listeners.sessions.forEach((l) => l(session));
  },
};

