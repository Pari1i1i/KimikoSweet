import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  onSnapshot, 
  Unsubscribe 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Order, IncomeSession, Review, Product, StoreSettings, HariPengambilan } from "@/types";
import { PRODUCTS_DATA, INITIAL_REVIEWS } from "@/data/products";

const LOCAL_STORAGE_ORDERS_KEY = "kimiko_orders_store";
const LOCAL_STORAGE_REVIEWS_KEY = "kimiko_reviews_store";
const LOCAL_STORAGE_SESSION_KEY = "kimiko_session_store";
const LOCAL_STORAGE_SETTINGS_KEY = "kimiko_store_settings";
const LOCAL_PRODUCTION_DONE_PCS_KEY = "kimiko_production_done_pcs_map";

export function getDefaultUpcomingPickupDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const d = new Date(now);
  // Scan up to 21 days ahead
  for (let i = 0; i < 21 && dates.length < 4; i++) {
    const day = d.getDay();
    if (day === 1 || day === 4) { // 1 = Senin, 4 = Kamis
      const iso = d.toISOString().split("T")[0];
      if (!dates.includes(iso)) {
        dates.push(iso);
      }
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  isOpen: true,
  closedReason: "Dapur KiMiko Sweets sedang tutup sementara / kuota pesanan penuh.",
  activePickupDates: getDefaultUpcomingPickupDates(),
};

type Listener<T> = (data: T) => void;
const listeners = {
  orders: new Set<Listener<Order[]>>(),
  reviews: new Set<Listener<Review[]>>(),
  sessions: new Set<Listener<IncomeSession | null>>(),
  settings: new Set<Listener<StoreSettings>>(),
  productionReset: new Set<() => void>(),
};

// BroadcastChannel for cross-tab realtime sync (works offline & across tabs)
let channel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    channel = new BroadcastChannel("kimiko_realtime_channel");
    channel.onmessage = (event) => {
      if (!event.data || !event.data.type) return;
      if (event.data.type === "ORDERS_UPDATED") {
        const fresh = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
        listeners.orders.forEach((l) => l(fresh));
      } else if (event.data.type === "REVIEWS_UPDATED") {
        const fresh = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
        listeners.reviews.forEach((l) => l(fresh));
      } else if (event.data.type === "SESSION_UPDATED") {
        const fresh = getLocalData<IncomeSession | null>(LOCAL_STORAGE_SESSION_KEY, null);
        listeners.sessions.forEach((l) => l(fresh));
      } else if (event.data.type === "SETTINGS_UPDATED") {
        const fresh = getLocalData<StoreSettings>(LOCAL_STORAGE_SETTINGS_KEY, DEFAULT_STORE_SETTINGS);
        listeners.settings.forEach((l) => l(fresh));
      } else if (event.data.type === "PRODUCTION_RESET") {
        listeners.productionReset.forEach((l) => l());
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel not supported or failed:", e);
  }
}

function broadcastEvent(type: "ORDERS_UPDATED" | "REVIEWS_UPDATED" | "SESSION_UPDATED" | "SETTINGS_UPDATED" | "PRODUCTION_RESET") {
  try {
    if (channel) {
      channel.postMessage({ type });
    }
  } catch (e) {
    console.warn("Error posting BroadcastChannel message:", e);
  }
}

function cleanPayload<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanPayload(item)) as unknown as T;
  }
  const record = obj as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  Object.keys(record).forEach((key) => {
    const val = record[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "object") {
        cleaned[key] = cleanPayload(val);
      } else {
        cleaned[key] = val;
      }
    }
  });
  return cleaned as T;
}

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

  // GET ORDERS DIRECTLY (SNAPSHOT)
  getOrders(): Order[] {
    return getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
  },

  // SUBSCRIBE ORDERS
  subscribeOrders(callback: (orders: Order[]) => void): Unsubscribe {
    // 1. Emit data local yang ada sekarang
    const initialLocal = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    callback(initialLocal);

    // 2. Daftarkan callback ke in-memory listener
    listeners.orders.add(callback);

    let firestoreUnsub: Unsubscribe = () => {};

    // 3. Dengarkan Cloud Firestore jika config tersedia
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "orders");
        firestoreUnsub = onSnapshot(
          colRef,
          (snapshot) => {
            const firestoreList: Order[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              firestoreList.push({ id: docSnap.id, ...data } as Order);
            });
            
            // Gabungkan data Firestore dengan local data (jika ada yang baru dibuat di local dan belum sync ke Firestore)
            const currentLocal = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
            const map = new Map<string, Order>();
            
            // Prioritas Firestore data
            firestoreList.forEach((ord) => map.set(ord.id, ord));
            
            // Tambahkan data local yang belum ada di Firestore
            currentLocal.forEach((ord) => {
              if (!map.has(ord.id)) {
                map.set(ord.id, ord);
              }
            });

            const merged = Array.from(map.values()).sort(
              (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
            );

            setLocalData(LOCAL_STORAGE_ORDERS_KEY, merged);
            callback(merged);
          },
          (err) => {
            console.warn("Firestore order listener error (fallback to local):", err);
            // Fallback: pastikan data local tetap di-emit
            const currentLocal = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
            callback(currentLocal);
          }
        );
      } catch (e) {
        console.warn("Firebase subscribeOrders setup failed (fallback to local):", e);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_ORDERS_KEY) {
        const fresh = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
        callback(fresh);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      try {
        firestoreUnsub();
      } catch {
        // ignore
      }
      listeners.orders.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  // CREATE ORDER
  async createOrder(orderData: Omit<Order, "id">): Promise<string> {
    const customId = "KMK-" + Math.floor(100000 + Math.random() * 900000);
    const newOrderPayload: Order = {
      ...orderData,
      id: customId,
      notes: orderData.notes || "",
    };

    // 1. Simpan langsung ke LocalStorage & Broadcast ke SEMUA Subscriber aktif di browser & tab lain
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const updated = [newOrderPayload, ...current.filter((o) => o.id !== customId)];
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));
    broadcastEvent("ORDERS_UPDATED");

    // 2. Kirim ke Cloud Firestore tanpa memblokir kesuksesan UI jika firestore error
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", customId);
        const payloadToSave = cleanPayload(newOrderPayload);
        await setDoc(docRef, payloadToSave);
      } catch (err) {
        console.warn("Firestore setDoc failed (order is saved in local storage):", err);
      }
    }

    return customId;
  },

  // UPDATE ORDER STATUS
  async updateOrderStatus(orderId: string, status: Order["status"], rejectedReason?: string): Promise<void> {
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const updated = current.map((ord) => 
      ord.id === orderId 
        ? { ...ord, status, rejectedReason: rejectedReason !== undefined ? rejectedReason : ord.rejectedReason } 
        : ord
    );
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));
    broadcastEvent("ORDERS_UPDATED");

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", orderId);
        const updatePayload: Record<string, unknown> = { status };
        if (rejectedReason) {
          updatePayload.rejectedReason = rejectedReason;
        }
        await updateDoc(docRef, updatePayload);
      } catch (err) {
        console.warn("Firestore updateOrderStatus failed (updated in local storage):", err);
      }
    }
  },

  // REJECT ORDER (KHUSUS STATUS PENDING)
  async rejectOrder(orderId: string, rejectedReason?: string): Promise<void> {
    return this.updateOrderStatus(orderId, "rejected", rejectedReason || "Pesanan ditolak oleh penjual");
  },

  // DELETE ORDER (HAPUS PERMANEN ORDER OLEH ADMIN)
  async deleteOrder(orderId: string): Promise<void> {
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    const updated = current.filter((ord) => ord.id !== orderId);
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));
    broadcastEvent("ORDERS_UPDATED");

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", orderId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn("Firestore deleteOrder failed (deleted in local storage):", err);
      }
    }
  },

  // SUBSCRIBE REVIEWS
  subscribeReviews(callback: (reviews: Review[]) => void): Unsubscribe {
    const localRev = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
    callback(localRev);
    listeners.reviews.add(callback);

    let firestoreUnsub: Unsubscribe = () => {};

    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "reviews");
        firestoreUnsub = onSnapshot(
          colRef,
          (snapshot) => {
            const list: Review[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Review);
            });
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            const finalList = list.length > 0 ? list : INITIAL_REVIEWS;
            setLocalData(LOCAL_STORAGE_REVIEWS_KEY, finalList);
            callback(finalList);
          },
          (err) => {
            console.warn("Firestore reviews error (fallback to local):", err);
          }
        );
      } catch (e) {
        console.warn("Firebase subscribeReviews failed (fallback to local):", e);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_REVIEWS_KEY) {
        const fresh = getLocalData<Review[]>(LOCAL_STORAGE_REVIEWS_KEY, INITIAL_REVIEWS);
        callback(fresh);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      try {
        firestoreUnsub();
      } catch {
        // ignore
      }
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
    broadcastEvent("REVIEWS_UPDATED");

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "reviews", revId);
        const payloadToSave = cleanPayload(newRevPayload);
        await setDoc(docRef, payloadToSave);
      } catch (err) {
        console.warn("Firestore addReview error (saved in local storage):", err);
      }
    }

    return revId;
  },

  // SUBSCRIBE ACTIVE INCOME SESSION
  subscribeActiveSession(callback: (session: IncomeSession | null) => void): Unsubscribe {
    const localSess = getLocalData<IncomeSession | null>(LOCAL_STORAGE_SESSION_KEY, null);
    callback(localSess);
    listeners.sessions.add(callback);

    let firestoreUnsub: Unsubscribe = () => {};

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "incomeSessions", "current_active_session");
        firestoreUnsub = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as IncomeSession;
              setLocalData(LOCAL_STORAGE_SESSION_KEY, data);
              callback(data);
            } else {
              callback(null);
            }
          },
          (err) => {
            console.warn("Firestore session error (fallback to local):", err);
          }
        );
      } catch (e) {
        console.warn("Firebase subscribeActiveSession failed (fallback to local):", e);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_SESSION_KEY) {
        const fresh = getLocalData<IncomeSession | null>(LOCAL_STORAGE_SESSION_KEY, null);
        callback(fresh);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      try {
        firestoreUnsub();
      } catch {
        // ignore
      }
      listeners.sessions.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  // SUBSCRIBE PRODUCTION RESET EVENT
  subscribeProductionReset(callback: () => void): Unsubscribe {
    listeners.productionReset.add(callback);
    return () => {
      listeners.productionReset.delete(callback);
    };
  },

  // SUBSCRIBE STORE SETTINGS (Buka/Tutup Toko & Tanggal yang Diizinkan)
  subscribeStoreSettings(callback: (settings: StoreSettings) => void): Unsubscribe {
    const localSett = getLocalData<StoreSettings>(LOCAL_STORAGE_SETTINGS_KEY, DEFAULT_STORE_SETTINGS);
    callback(localSett);
    listeners.settings.add(callback);

    let firestoreUnsub: Unsubscribe = () => {};

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "storeSettings", "general_settings");
        firestoreUnsub = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as StoreSettings;
              const merged: StoreSettings = {
                isOpen: typeof data.isOpen === "boolean" ? data.isOpen : true,
                closedReason: data.closedReason || DEFAULT_STORE_SETTINGS.closedReason,
                activePickupDates: Array.isArray(data.activePickupDates) && data.activePickupDates.length > 0 
                  ? data.activePickupDates 
                  : DEFAULT_STORE_SETTINGS.activePickupDates,
                updatedAt: data.updatedAt || Date.now(),
              };
              setLocalData(LOCAL_STORAGE_SETTINGS_KEY, merged);
              callback(merged);
            } else {
              // Jika belum ada di firestore, gunakan local
              callback(localSett);
            }
          },
          (err) => {
            console.warn("Firestore storeSettings error (fallback to local):", err);
          }
        );
      } catch (e) {
        console.warn("Firebase subscribeStoreSettings failed (fallback to local):", e);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_SETTINGS_KEY) {
        const fresh = getLocalData<StoreSettings>(LOCAL_STORAGE_SETTINGS_KEY, DEFAULT_STORE_SETTINGS);
        callback(fresh);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      try {
        firestoreUnsub();
      } catch {
        // ignore
      }
      listeners.settings.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  // UPDATE STORE SETTINGS
  async updateStoreSettings(settingsUpdate: Partial<StoreSettings>): Promise<void> {
    const current = getLocalData<StoreSettings>(LOCAL_STORAGE_SETTINGS_KEY, DEFAULT_STORE_SETTINGS);
    const updated: StoreSettings = {
      ...current,
      ...settingsUpdate,
      updatedAt: Date.now(),
    };

    setLocalData(LOCAL_STORAGE_SETTINGS_KEY, updated);
    listeners.settings.forEach((l) => l(updated));
    broadcastEvent("SETTINGS_UPDATED");

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "storeSettings", "general_settings");
        const payloadToSave = cleanPayload(updated);
        await setDoc(docRef, payloadToSave);
      } catch (err) {
        console.warn("Firestore updateStoreSettings error (saved in local storage):", err);
      }
    }
  },

  // RESCHEDULE ORDER (ADMIN FORCE RESCHEDULE)
  async rescheduleOrder(orderId: string, newTanggal: string, rescheduleNotes?: string): Promise<void> {
    const current = getLocalData<Order[]>(LOCAL_STORAGE_ORDERS_KEY, []);
    
    // Hitung hari dari tanggal baru
    let dayName: HariPengambilan = "Senin";
    try {
      const dt = new Date(newTanggal + "T00:00:00");
      if (dt.getDay() === 4) dayName = "Kamis";
    } catch {
      // fallback
    }

    const updated = current.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          tanggalPengambilan: newTanggal,
          hariPengambilan: dayName,
          isRescheduled: true,
          rescheduleNotes: rescheduleNotes || ord.rescheduleNotes || "Jadwal diubah oleh penjual",
        };
      }
      return ord;
    });

    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated);
    listeners.orders.forEach((l) => l(updated));
    broadcastEvent("ORDERS_UPDATED");

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", orderId);
        await updateDoc(docRef, {
          tanggalPengambilan: newTanggal,
          hariPengambilan: dayName,
          isRescheduled: true,
          rescheduleNotes: rescheduleNotes || "Jadwal diubah oleh penjual",
        });
      } catch (err) {
        console.warn("Firestore rescheduleOrder failed (updated in local storage):", err);
      }
    }
  },

  // START NEW SESSION (RESETS ALL ORDERS, PRODUCTION COUNTERS, AND SESSION)
  async startNewSession(saldoAwal: number, namaSesi: string = "Sesi Hari Ini"): Promise<void> {
    const session: IncomeSession = {
      id: "current_active_session",
      saldoAwal,
      mulaiPada: Date.now(),
      aktif: true,
      namaSesi,
    };

    // 1. Reset Orders in Local Storage & Memory
    const emptyOrders: Order[] = [];
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, emptyOrders);
    listeners.orders.forEach((l) => l(emptyOrders));

    // 2. Reset Production Progress in Local Storage & Trigger listeners
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_PRODUCTION_DONE_PCS_KEY);
      } catch (e) {
        console.warn("Error removing production done pcs:", e);
      }
    }
    listeners.productionReset.forEach((l) => l());

    // 3. Set new active session in Local Storage & Memory
    setLocalData(LOCAL_STORAGE_SESSION_KEY, session);
    listeners.sessions.forEach((l) => l(session));

    // 4. Broadcast all reset events across browser tabs
    broadcastEvent("ORDERS_UPDATED");
    broadcastEvent("PRODUCTION_RESET");
    broadcastEvent("SESSION_UPDATED");

    // 5. Sync to Cloud Firestore if connected
    if (isFirebaseConfigured) {
      try {
        const sessionDocRef = doc(db, "incomeSessions", "current_active_session");
        const payloadToSave = cleanPayload(session);
        await setDoc(sessionDocRef, payloadToSave);

        // Hapus/bersihkan dokumen orders yang ada di Firestore
        const ordersColRef = collection(db, "orders");
        const snap = await getDocs(ordersColRef);
        const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.warn("Firestore startNewSession error (saved in local storage):", err);
      }
    }
  },
};
