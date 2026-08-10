# Panduan Penggunaan Docker - Website Apotek

Dokumentasi ini menjelaskan cara menjalankan dan mengelola aplikasi **Website Apotek** menggunakan Docker & Docker Compose.

---

## 🌟 Single Port Architecture (Port 8102 & 80)

Frontend dan Backend disatukan di bawah **1 Port Utama (8102 / 80)** menggunakan Nginx Reverse Proxy internal:

| Layanan | Endpoint / Subpath | URL Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Website Frontend** | `/*` | [http://localhost:8102](http://localhost:8102) | Tampilan Next.js UI |
| **Backend Express API** | `/api/*` | [http://localhost:8102/api/...](http://localhost:8102/api/health) | API Endpoints |
| **API Health Check** | `/health` | [http://localhost:8102/health](http://localhost:8102/health) | Status Kesehatan API |

---

## Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstall & berjalan.

---

## 🚀 Perintah Utama

### 1. Menjalankan Container (Build & Run Background)
```bash
docker compose up -d --build
```

### 2. Memeriksa Status Container
```bash
docker compose ps
```

### 3. Melihat Log Real-time
- **Semua Service:**
  ```bash
  docker compose logs -f
  ```
- **Nginx Proxy:**
  ```bash
  docker compose logs -f proxy
  ```
- **Frontend Only:**
  ```bash
  docker compose logs -f frontend
  ```
- **Backend Only:**
  ```bash
  docker compose logs -f backend
  ```

### 4. Menghentikan Container
```bash
docker compose down
```

### 5. Menghentikan & Menghapus Volumes / Cache
```bash
docker compose down -v
```

---

## Environment Variables
Jika ingin mengubah kredensial (misalnya Supabase URL / Keys), Anda dapat membuat file `.env` di root folder dengan variabel berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8102
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role
JWT_SECRET=your-secret-key
```

Kemudian jalankan kembali `docker compose up -d --build`.
