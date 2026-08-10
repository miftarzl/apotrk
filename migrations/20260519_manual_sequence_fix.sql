-- Manual sequence fix for categories and medicines
-- 1) Create sequences if not exists
CREATE SEQUENCE IF NOT EXISTS public.categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.medicines_id_seq;

-- 2) Attach sequence to id columns as DEFAULT nextval
ALTER TABLE public.categories
  ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq');

ALTER TABLE public.medicines
  ALTER COLUMN id SET DEFAULT nextval('public.medicines_id_seq');

-- 3) Synchronize sequences to current max(id)
SELECT setval('public.categories_id_seq', COALESCE((SELECT MAX(id) FROM public.categories), 1));
SELECT setval('public.medicines_id_seq', COALESCE((SELECT MAX(id) FROM public.medicines), 1));

-- 4) Test inserts (run manually to verify)
-- INSERT INTO public.categories (nama_kategori) VALUES ('Test Kategori');
-- INSERT INTO public.medicines (nama_obat, kategori, gejala, deskripsi, harga, foto_url) VALUES ('Test Obat', 1, 'demam', 'deskripsi test', 10000, '');

-- Notes:
-- If your database previously used an identity column, this approach uses manual sequences and setting DEFAULT nextval.
-- Backup your database before running.
