# CSV Import Guide

Supported columns (header names):
- `nama_obat`, `kategori`, `indikasi`, `keluhan`, `riwayat_penyakit`, `deskripsi`, `bentuk_sediaan`, `harga`, `stok`, `gambar`

Workflow:
1. Admin -> `/admin/import` -> pilih file CSV
2. Preview parsed rows
3. Click Import -> the frontend reads the file and sends CSV text to `/api/import` with `x-admin-key` header
4. Server parses CSV, validates rows via `zod`, detects duplicates, inserts non-duplicates into `medicines`
5. Response includes inserted count, duplicates and errors

For large CSVs consider using chunked upload and background jobs.
