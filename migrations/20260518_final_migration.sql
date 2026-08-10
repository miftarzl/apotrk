-- Final migration for Sistem Rekomendasi Obat
-- Creates profiles, categories, medicines, recommendation_history with proper relations

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Profiles table for admin users
drop table if exists profiles cascade;
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
drop table if not exists categories cascade;
create table categories (
  id serial primary key,
  nama_kategori text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Medicines
drop table if not exists medicines cascade;
create table medicines (
  id serial primary key,
  nama_obat text not null,
  kategori_id integer references categories(id) on delete set null,
  gejala text,
  deskripsi text,
  harga numeric(12,2) default 0,
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recommendation history
drop table if not exists recommendation_history cascade;
create table recommendation_history (
  id serial primary key,
  gejala_input text,
  top_recommendation jsonb,
  similarity_score numeric,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_medicines_gejala on medicines using gin (to_tsvector('simple', coalesce(gejala, '')));
create index if not exists idx_medicines_nama on medicines using gin (to_tsvector('simple', coalesce(nama_obat, '')));

-- Trigger function to set updated_at
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_medicines
before update on medicines
for each row
execute procedure trigger_set_timestamp();

create trigger set_timestamp_categories
before update on categories
for each row
execute procedure trigger_set_timestamp();

create trigger set_timestamp_profiles
before update on profiles
for each row
execute procedure trigger_set_timestamp();

-- Sample data for categories
insert into categories (nama_kategori) values
('Antasida'), ('Analgesik'), ('Antibiotik'), ('Antihistamin'), ('Kortikosteroid')
on conflict do nothing;

-- Sample medicines
insert into medicines (nama_obat, kategori_id, gejala, deskripsi, harga, foto_url) values
('Promag', 1, 'nyeri ulu hati, mual, kembung', 'Promag digunakan untuk mengurangi asam lambung dan melapisi dinding lambung', 15000, ''),
('Paracetamol', 2, 'demam, sakit kepala, nyeri otot', 'Paracetamol analgesik umum untuk demam dan nyeri', 2000, ''),
('Amoxicillin', 3, 'demam, nyeri tenggorokan', 'Antibiotik beta-laktam spektrum luas', 25000, '' )
on conflict do nothing;
