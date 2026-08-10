Backend server (Express) for Sistem Rekomendasi Obat

Run:

1. Install dependencies
```
cd backend
npm install
```

2. Create `.env` in project root or backend folder with:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
```

3. Start server
```
npm run dev
```

APIs:
- POST /api/admin/login
- POST /api/admin/logout
- GET /api/admin/me
- GET/POST/PUT/DELETE /api/medicines (protected)
- GET/POST/PUT/DELETE /api/categories (protected)
- GET /api/history (protected)
