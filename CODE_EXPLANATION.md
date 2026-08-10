# Penjelasan Kode — Sistem Rekomendasi Obat

Ringkasan:
- Backend: `backend/src` — Express server (`index.js`), `recommender.js` mengimplementasikan preprocessing, TF-IDF, dan cosine similarity.
- Frontend: `frontend/app` — Next.js App Router pages, `components` berisi UI kecil seperti `Navbar`.
- Database: `supabase_schema.sql` berisi tabel dan data seed untuk `medicines`, `categories`, dan `recommendation_history`.

Keterangan modul penting:
- `backend/src/recommender.js`: 
  - `preprocess(text)`: lowercasing, punctuation removal, tokenizing, Indonesian stemming dengan `sastrawi`.
  - Membangun `TfIdf` dari `natural` lalu membuat vektor untuk tiap dokumen dan query.
  - Menghitung cosine similarity menggunakan `cosine-similarity`.
  - Mengembalikan list obat terurut dengan `similarity` (persentase).

- `backend/src/index.js`:
  - Endpoint `POST /recommend` menerima `keluhan`, `gejala`, `disease_history`, mengambil data obat dari Supabase, memanggil `recommender.recommend`, lalu menyimpan log ke `recommendation_history`.
  - Admin routes di-mount di `/admin` dan dilindungi dengan `middleware/adminAuth.js` yang memeriksa `ADMIN_API_KEY`.

- `frontend/app/rekomendasi/page.tsx`:
  - UI form untuk memasukkan `keluhan`, `gejala`, `riwayat`; memanggil backend `/recommend` dan menampilkan hasil.

Cara menjalankan tes recommender lokal:

```bash
cd backend
node src/run_recommender.js
```

File penting lainnya:
- `supabase_schema.sql` — jalankan di SQL editor Supabase untuk membuat schema dan seed data.
- `.env.example` — salin ke `.env` dan isi variabel.
