export const BASE_PATH = "/shop";

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Absolute URL including /shop, e.g. https://antonihost.my.id/shop/auth/callback */
export function shopUrl(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${BASE_PATH}${p === "/" ? "" : p}`;
}

export const PAYMENT = {
  bca: {
    number: process.env.NEXT_PUBLIC_BCA_ACCOUNT_NUMBER ?? "8881234567",
    name: process.env.NEXT_PUBLIC_BCA_ACCOUNT_NAME ?? "AntoniHost Shop",
  },
  dana: {
    phone: process.env.NEXT_PUBLIC_DANA_PHONE ?? "081234567890",
    name: process.env.NEXT_PUBLIC_DANA_NAME ?? "AntoniHost Shop",
  },
};

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  verifying: "Menunggu Verifikasi",
  processing: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const STATUS_HELP: Record<string, string> = {
  pending_payment: "Transfer sesuai total, lalu unggah bukti pembayaran.",
  verifying: "Tim kami sedang memeriksa bukti transfer Anda.",
  processing: "Pesanan sedang disiapkan / dikerjakan.",
  completed: "Transaksi selesai. Terima kasih!",
  cancelled: "Pesanan dibatalkan.",
};

export const STATUS_FLOW = ["pending_payment", "verifying", "processing", "completed"] as const;

export const KIND_LABEL: Record<string, string> = {
  physical: "Barang fisik",
  digital_account: "Akun digital",
  service: "Jasa",
};

export const CATEGORY_NAV = [
  { href: "/katalog", label: "Katalog" },
  { href: "/kategori/komputer-aksesoris", label: "Komputer" },
  { href: "/kategori/akun-game", label: "Akun Game" },
  { href: "/kategori/jasa-it-support", label: "Jasa IT" },
];
