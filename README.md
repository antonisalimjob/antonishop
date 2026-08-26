# AntoniHost Shop

E-commerce Next.js App Router di **https://antonihost.my.id/shop**. Backend: **Supabase** (PostgreSQL, Auth Google, Realtime, Storage). Keranjang & sesi: **Zustand**.

## 1. Install & env

```bash
npm install
copy .env.local.example .env.local
```

Isi `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Produksi: `NEXT_PUBLIC_SITE_URL=https://antonihost.my.id`

```bash
npm run dev
```

Toko hidup di [http://localhost:3000/shop](http://localhost:3000/shop) (`basePath: '/shop'`). Root `/` diarahkan ke `/shop`.

## 2. Setup Supabase

### SQL

Di **SQL Editor**, jalankan seluruh isi [`supabase/schema.sql`](supabase/schema.sql):

- Tabel: `profiles`, `categories`, `products`, `orders`, `order_items`, `chat_messages`
- Trigger profil saat user Google baru
- Fungsi `place_order` (stok atomik)
- RLS
- Bucket Storage `payment-proofs`
- Realtime pada `chat_messages` dan `orders`
- Seed 4 kategori + 23 produk

### Jadikan admin

Setelah login Google sekali, di SQL:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@gmail.com');
```

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client (Web).
2. Authorized redirect URI **Google**: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → **Authentication → Providers → Google** → tempel Client ID & Secret.
4. **Authentication → URL Configuration**:
   - Site URL: `https://antonihost.my.id/shop` (lokal: `http://localhost:3000/shop`)
   - Redirect URLs:
     - `http://localhost:3000/shop/auth/callback`
     - `https://antonihost.my.id/shop/auth/callback`

Login app memanggil `supabase.auth.signInWithOAuth({ provider: 'google' })` saja.

### Storage

Bucket `payment-proofs` dibuat di SQL (private). Path: `{user_id}/{order_id}.jpg`.

### Realtime

Pastikan tabel `chat_messages` dan `orders` ada di publication `supabase_realtime` (sudah di schema.sql). Dashboard → Database → Replication jika perlu dicentang manual.

## 3. Route (semua di bawah `/shop`)

| Path | Akses |
|---|---|
| `/` `/katalog` `/kategori/[slug]` `/produk/[slug]` | Publik |
| `/login` | Google OAuth |
| `/checkout` | Auth (middleware) |
| `/account` `/account/orders` | Auth — profil & riwayat |
| `/admin` | Role `admin` |

## 4. Komponen utama

- `src/components/navbar.tsx`
- `src/components/product-card.tsx`
- `src/components/cart-drawer.tsx`
- `src/components/payment-form.tsx` — BCA/DANA + salin rekening + upload bukti
- `src/components/live-chat.tsx` — Supabase Realtime

## 5. Deploy ke antonihost.my.id/shop

Reverse proxy (Nginx/Caddy) meneruskan `https://antonihost.my.id/shop` ke proses Next (`next start`). `basePath: '/shop'` sudah di `next.config.ts`.

Set env produksi `NEXT_PUBLIC_SITE_URL=https://antonihost.my.id`.
