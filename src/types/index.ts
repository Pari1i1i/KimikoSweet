export type PaymentMethod = "qris" | "cash";
export type OrderStatus = "pending" | "confirmed" | "completed";

export interface OrderItem {
  namaVarian: string;
  qty: number;
  hargaSatuan: number;
}

export interface Product {
  id: string;
  nama: string;
  harga: number;
  badge?: string;
  kategori: "classic" | "special";
  deskripsi: string;
  bgWarna: string;
  polaWarna: string;
}

export interface Order {
  id: string;
  namaPembeli: string;
  kelas: string;
  items: OrderItem[];
  totalHarga: number;
  totalPcs: number;
  metodeBayar: PaymentMethod;
  notes?: string;
  status: OrderStatus;
  createdAt: number; // timestamp ms
}

export interface IncomeSession {
  id: string;
  saldoAwal: number;
  mulaiPada: number;
  aktif: boolean;
  namaSesi?: string;
}

export interface Review {
  id: string;
  namaPembeli: string;
  komentar: string;
  rating?: number;
  createdAt: number;
}
