# Website Apotek Sehati Jaya Farma (Rule-Based Chatbot)

Proyek fullstack: Next.js (frontend) + Express (backend) + Supabase (DB & Auth).

Tujuan: merekomendasikan obat berdasarkan gejala, riwayat penyakit, alergi obat

Ringkasan cepat:
- Backend: `backend/` (Express + recommender engine menggunakan `natural`, `sastrawi`, `cosine-similarity`)
- Frontend: `frontend/` (Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui)
- Database: Supabase PostgreSQL — lihat `supabase_schema.sql` untuk schema & seed data

Lihat bagian "Cara Menjalankan" di bawah.

---

## Cara Menjalankan (lokal)

1. Setup environment variables: salin `.env.example` ke `.env` di root dan di folder `backend/` dan `frontend/`.
2. Jalankan Supabase (atau gunakan instance Supabase yang disediakan).

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Lalu buka `http://localhost:3000`.

## Environment variables penting
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` (server)
- `ADMIN_API_KEY` (server — gunakan nilai kuat, kirim via header `x-admin-key` untuk operasi admin)
- `NEXT_PUBLIC_API_URL` (frontend pointing to backend)

## API Endpoints (ringkasan)
- `GET /health` — health check
- `GET /medicines` — list obat (public)
- `POST /recommend` — body: `{ keluhan, gejala, disease_history, top }` — returns ranked recommendations
- `POST /admin/medicines` (admin only) — insert medicine (header `x-admin-key`)
- `PUT /admin/medicines/:id`, `DELETE /admin/medicines/:id` (admin only)

Note: After serverless conversion the API lives under Next.js App Router paths: `/api/medicines`, `/api/recommend`, `/api/admin/medicines`, `/api/import`.

## Deployment (Vercel)
1. Push repo ke GitHub.
2. Hubungkan project frontend ke Vercel, set environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.
3. Jalankan backend di server (Vercel serverless or separate host) dan pastikan `SUPABASE_SERVICE_ROLE` serta `ADMIN_API_KEY` tersimpan aman.

## Test rekomendasi cepat
Contoh curl:

```bash
curl -X POST ${NEXT_PUBLIC_API_URL:-http://localhost:4000}/recommend \
	-H "Content-Type: application/json" \
	-d '{"keluhan":"sakit perut","gejala":"mual, nyeri ulu hati","disease_history":"gastritis"}'
```

## Menjalankan unit test recommender
Di folder `backend/` ada `test_recommender.js` yang menggunakan sample data. Jalankan:

```bash
cd backend
node test_recommender.js
```

Contoh output yang diharapkan:

```
Recommendations: [ { name: 'Promag', sim: 78.23 }, { name: 'Omeprazole', sim: 65.12 }, ... ]
Test passed
```

Catatan keamanan:
- Contoh ini menggunakan `NEXT_PUBLIC_ADMIN_KEY` untuk demo admin requests dari frontend — jangan gunakan ini di produksi. Simpan `SUPABASE_SERVICE_ROLE` dan `ADMIN_API_KEY` aman di server.

## CI / CD

- GitHub Actions workflow tersedia di `.github/workflows/main.yml`. Workflow menginstall dependencies, menjalankan `backend/test_recommender.js`, build frontend, menjalankan `vitest` dan Playwright E2E.

## Serverless (Vercel) notes
- API routes are in `frontend/app/api/*` and use Next.js App Router route handlers. Deploy frontend to Vercel and ensure `SUPABASE_SERVICE_ROLE` and `ADMIN_API_KEY` are set in Vercel Secrets for server-side functions.

## CSV Import
- Admin UI: `/admin/import` — upload CSV, preview, then import. The server endpoint `/api/import` expects `{ csv: string }` in POST body and `x-admin-key` header for authorization.




## Testing rekomendasi
- POST ke `http://localhost:4000/recommend` dengan body JSON { keluhan, gejala, disease_history, user_id? }

---

Dokumentasi file dan penjelasan ada di README masing-masing folder.
