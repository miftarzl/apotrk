-- Supabase SQL schema for Sistem Rekomendasi Obat
-- Supabase SQL schema matching requested fields (Bahasa Indonesia names)

-- Profiles (referencing Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id serial primary key,
  nama_kategori text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Medicines (nama_obat, kategori, gejala, deskripsi, harga, foto_url)
create table if not exists medicines (
  id serial primary key,
  nama_obat text not null,
  kategori integer references categories(id) on delete set null,
  gejala text,
  deskripsi text,
  harga numeric(12,2) default 0,
  foto_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recommendation history
create table if not exists recommendation_history (
  id serial primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_gejala text,
  top_recommendation jsonb,
  similarity_score numeric,
  created_at timestamptz default now()
);

-- Favorites
create table if not exists favorites (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  medicine_id integer references medicines(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, medicine_id)
);

-- Indexes to speed up text search (simple)
create index if not exists idx_medicines_gejala on medicines using gin (to_tsvector('simple', coalesce(gejala, '')));
create index if not exists idx_medicines_nama on medicines using gin (to_tsvector('simple', coalesce(nama_obat, '')));

-- Trigger to keep updated_at current
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp
before update on medicines
for each row
execute procedure trigger_set_timestamp();

create trigger set_timestamp_cat
before update on categories
for each row
execute procedure trigger_set_timestamp();

create trigger set_timestamp_profiles
before update on profiles
for each row
execute procedure trigger_set_timestamp();

-- RLS policies (examples) - enable RLS and adjust as needed
-- Note: Supabase may require enabling RLS per table and creating policies.
-- Example: allow authenticated users to insert recommendation_history
alter table if exists recommendation_history enable row level security;
create policy if not exists allow_insert_history on recommendation_history
  for insert using (auth.role() is not null);

-- Seed categories (nama_kategori)
insert into categories (nama_kategori) values
('Antasida'),
('Analgesik'),
('Antibiotik'),
('Antihistamin'),
('Kortikosteroid')
ON CONFLICT DO NOTHING;

-- Example seed medicines using bahasa fields
insert into medicines (nama_obat, kategori, gejala, deskripsi, harga, foto_url)
values
('Promag', 1, 'nyeri ulu hati, mual, kembung', 'Promag digunakan untuk mengurangi asam lambung dan melapisi dinding lambung', 15000, ''),
('Paracetamol', 2, 'demam, sakit kepala, nyeri otot', 'Paracetamol analgesik umum untuk demam dan nyeri', 2000, ''),
('Omeprazole', 1, 'heartburn, regurgitasi', 'Inhibitor pompa proton untuk menurunkan produksi asam lambung', 35000, ''),
('Amoxicillin', 3, 'demam, nyeri tenggorokan', 'Antibiotik beta-laktam spektrum luas', 25000, ''),
('Cetirizine', 4, 'gatal, bersin, hidung berair', 'Antihistamin generasi kedua', 5000, ''),
('Ibuprofen', 2, 'nyeri sendi, demam', 'NSAID untuk meredakan nyeri dan inflamasi', 7000, '')
ON CONFLICT DO NOTHING;
