-- AntoniHost Shop — jalankan di Supabase SQL Editor (urutan: schema ini saja, sudah termasuk RLS + seed).
-- Project: antonihost.my.id/shop

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('BCA', 'DANA');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'pending_payment',
    'verifying',
    'processing',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text not null default '',
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  total_amount integer not null check (total_amount >= 0),
  payment_method public.payment_method not null,
  payment_proof_url text,
  status public.order_status not null default 'pending_payment',
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity > 0),
  price_at_purchase integer not null check (price_at_purchase >= 0)
);

-- sender_id = siapa yang menulis
-- thread_id = percakapan milik pembeli (auth.users id) — diperlukan agar admin bisa membalas per user
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  thread_id uuid not null references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists chat_messages_thread_idx on public.chat_messages (thread_id, created_at);

-- ---------------------------------------------------------------------------
-- Profile trigger (Google OAuth → profiles)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'customer'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Place order (atomic stock + insert)
-- ---------------------------------------------------------------------------
create or replace function public.place_order(
  p_payment_method public.payment_method,
  p_items jsonb,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order uuid;
  v_total integer := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart empty';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    if not found then
      raise exception 'Product not found';
    end if;
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    if v_product.stock < v_qty then
      raise exception 'Stok % tidak cukup', v_product.title;
    end if;
    v_total := v_total + (v_product.price * v_qty);
  end loop;

  insert into public.orders (user_id, total_amount, payment_method, customer_note, status)
  values (v_user, v_total, p_payment_method, p_note, 'pending_payment')
  returning id into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    update public.products set stock = stock - v_qty where id = v_product.id;
    insert into public.order_items (order_id, product_id, quantity, price_at_purchase)
    values (v_order, v_product.id, v_qty, v_product.price);
  end loop;

  return v_order;
end;
$$;

grant execute on function public.place_order(public.payment_method, jsonb, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "catalog_public_read" on public.categories;
create policy "catalog_public_read" on public.categories for select using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_own_select" on public.orders;
create policy "orders_own_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_own_insert" on public.orders;
create policy "orders_own_insert" on public.orders
  for insert with check (user_id = auth.uid());

drop policy if exists "orders_own_update" on public.orders;
create policy "orders_own_update" on public.orders
  for update using (user_id = auth.uid() and status in ('pending_payment'))
  with check (user_id = auth.uid());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists "chat_select" on public.chat_messages;
create policy "chat_select" on public.chat_messages
  for select using (thread_id = auth.uid() or sender_id = auth.uid() or public.is_admin());

drop policy if exists "chat_insert_customer" on public.chat_messages;
create policy "chat_insert_customer" on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and thread_id = auth.uid()
    and is_admin = false
  );

drop policy if exists "chat_insert_admin" on public.chat_messages;
create policy "chat_insert_admin" on public.chat_messages
  for insert with check (public.is_admin() and is_admin = true and sender_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: payment-proofs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "proof_upload_own" on storage.objects;
create policy "proof_upload_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "proof_read_own" on storage.objects;
create policy "proof_read_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Seed katalog
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Barang Komputer & Aksesori', 'komputer-aksesoris'),
  ('Other Items', 'other-items'),
  ('Akun Game', 'akun-game'),
  ('Jasa IT Support & Maintenance', 'jasa-it-support')
on conflict (slug) do nothing;

insert into public.products (title, slug, category_id, description, price, stock, metadata)
select * from (values
  ('ASUS VivoBook 14 i5 16GB/512GB', 'asus-vivobook-14', 'komputer-aksesoris',
   'Laptop produktif untuk kerja dan kuliah. Intel Core i5, RAM 16GB, SSD 512GB.', 8499000, 8,
   '{"featured":true,"accent":"slate","kind":"physical","specs":["Intel Core i5","RAM 16GB","SSD 512GB"]}'::jsonb),
  ('Lenovo IdeaPad Slim 3 Ryzen 5', 'lenovo-ideapad-slim-3', 'komputer-aksesoris',
   'Laptop ringkas Ryzen 5, tipis, baterai tahan lama.', 7299000, 5,
   '{"featured":true,"accent":"indigo","kind":"physical","specs":["AMD Ryzen 5","RAM 8GB","SSD 512GB"]}'::jsonb),
  ('Keychron K2 Mechanical Keyboard', 'keychron-k2-mechanical', 'komputer-aksesoris',
   'Keyboard mekanikal 75%, Bluetooth + USB-C, hot-swappable.', 1250000, 20,
   '{"featured":true,"accent":"teal","kind":"physical","specs":["75% layout","Bluetooth + USB-C"]}'::jsonb),
  ('Logitech MX Master 3S', 'logitech-mx-master-3s', 'komputer-aksesoris',
   'Mouse premium 8K DPI, MagSpeed scroll, multi-device.', 1450000, 15,
   '{"featured":false,"accent":"sky","kind":"physical"}'::jsonb),
  ('Samsung 990 EVO NVMe 1TB', 'samsung-990-evo-1tb', 'komputer-aksesoris',
   'SSD NVMe Gen4 untuk upgrade laptop/PC.', 1150000, 25,
   '{"featured":false,"accent":"blue","kind":"physical"}'::jsonb),
  ('Kingston Fury Beast DDR4 16GB', 'kingston-fury-16gb', 'komputer-aksesoris',
   'RAM 3200MHz untuk gaming dan rendering.', 650000, 30,
   '{"featured":false,"accent":"rose","kind":"physical"}'::jsonb),
  ('HyperX Cloud II Headset', 'hyperx-cloud-ii', 'komputer-aksesoris',
   'Headset 7.1 virtual, memory foam, mic detachable.', 1150000, 12,
   '{"featured":false,"accent":"red","kind":"physical"}'::jsonb),
  ('Logitech C920 HD Pro Webcam', 'logitech-c920-webcam', 'komputer-aksesoris',
   'Webcam 1080p untuk meeting dan remote support.', 1350000, 10,
   '{"featured":false,"accent":"cyan","kind":"physical"}'::jsonb),
  ('TP-Link Archer AX1800 Wi-Fi 6', 'tplink-ax1800', 'komputer-aksesoris',
   'Router Wi-Fi 6 dual-band untuk rumah/kantor kecil.', 650000, 18,
   '{"featured":false,"accent":"emerald","kind":"physical"}'::jsonb),
  ('Tas Laptop 15.6" Waterproof', 'tas-laptop-156', 'other-items',
   'Backpack padded, port USB, tahan percikan air.', 189000, 40,
   '{"featured":false,"accent":"amber","kind":"physical"}'::jsonb),
  ('USB-C Hub 7-in-1', 'usbc-hub-7in1', 'other-items',
   'HDMI 4K, USB 3.0, SD/TF, PD 100W.', 249000, 35,
   '{"featured":true,"accent":"violet","kind":"physical"}'::jsonb),
  ('Cooling Pad Laptop 6 Fan', 'cooling-pad-laptop', 'other-items',
   'Enam kipas senyap, tinggi adjustable.', 159000, 22,
   '{"featured":false,"accent":"fuchsia","kind":"physical"}'::jsonb),
  ('Mousepad XL RGB Stitch Edge', 'mousepad-xl-rgb', 'other-items',
   '900×400mm, tepi jahit, lampu RGB.', 129000, 50,
   '{"featured":false,"accent":"pink","kind":"physical"}'::jsonb),
  ('Kabel USB-C 100W 2 Meter', 'kabel-usbc-100w', 'other-items',
   'Charge + data USB-C to C, nylon braided.', 89000, 60,
   '{"featured":false,"accent":"lime","kind":"physical"}'::jsonb),
  ('MLBB Mythic Glory — 70+ Skin', 'mlbb-mythic-glory', 'akun-game',
   'Akun Mobile Legends rank Mythic Glory, 70+ skin. Serah terima via chat setelah pembayaran. Data demo.', 2500000, 2,
   '{"featured":true,"accent":"yellow","kind":"digital_account","game":"MLBB","specs":["Rank Mythic Glory","70+ skin"]}'::jsonb),
  ('MLBB Epic — 40 Skin', 'mlbb-epic-40-skin', 'akun-game',
   'Akun MLBB rank Epic, 40 skin, hero hampir lengkap.', 850000, 4,
   '{"featured":true,"accent":"orange","kind":"digital_account","game":"MLBB"}'::jsonb),
  ('Honor of Kings Diamond Ranked', 'hok-diamond-ranked', 'akun-game',
   'Akun HOK rank Diamond, skin starter + limited. Tutorial bind via chat.', 1200000, 3,
   '{"featured":true,"accent":"red","kind":"digital_account","game":"HOK"}'::jsonb),
  ('HOK Starter Skin Pack', 'hok-starter-pack', 'akun-game',
   'Akun Honor of Kings pemula, beberapa skin dan hero meta.', 450000, 6,
   '{"featured":false,"accent":"amber","kind":"digital_account","game":"HOK"}'::jsonb),
  ('Instalasi Windows + Driver', 'install-windows-driver', 'jasa-it-support',
   'Install ulang Windows 10/11, driver lengkap, software dasar. On-site atau remote.', 150000, 99,
   '{"featured":true,"accent":"teal","kind":"service"}'::jsonb),
  ('Maintenance PC (Cleaning + Thermal)', 'maintenance-pc', 'jasa-it-support',
   'Pembersihan debu, ganti thermal paste, health check storage/RAM.', 200000, 99,
   '{"featured":false,"accent":"cyan","kind":"service"}'::jsonb),
  ('Setup Jaringan Rumah / Kantor', 'setup-jaringan', 'jasa-it-support',
   'Konfigurasi router/mesh, sharing printer, dokumentasi SSID.', 350000, 99,
   '{"featured":true,"accent":"blue","kind":"service"}'::jsonb),
  ('Remote IT Support 1 Jam', 'remote-it-1jam', 'jasa-it-support',
   'Sesi remote 60 menit: software, Windows, printer, instalasi aplikasi.', 100000, 99,
   '{"featured":false,"accent":"indigo","kind":"service"}'::jsonb),
  ('Paket Maintenance Bulanan', 'maintenance-bulanan', 'jasa-it-support',
   'Retainer IT: prioritas chat, remote wajar, 1x kunjungan (jika jangkauan).', 500000, 20,
   '{"featured":true,"accent":"emerald","kind":"service"}'::jsonb)
) as v(title, slug, cat_slug, description, price, stock, metadata)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;
