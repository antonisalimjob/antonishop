export type UserRole = "admin" | "customer";
export type PaymentMethod = "BCA" | "DANA";
export type OrderStatus =
  | "pending_payment"
  | "verifying"
  | "processing"
  | "completed"
  | "cancelled";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductMetadata = {
  featured?: boolean;
  accent?: string;
  kind?: "physical" | "digital_account" | "service";
  game?: string;
  specs?: string[];
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  metadata: ProductMetadata;
};

export type ProductWithCategory = Product & { categories: Category | null };

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  status: OrderStatus;
  customer_note: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products?: Pick<Product, "title" | "slug"> | null;
};

export type ChatMessage = {
  id: string;
  sender_id: string;
  thread_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
};
