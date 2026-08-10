# 🎯 QUICK START CHECKLIST

## ✅ PRE-INSTALLATION

- [ ] Sudah baca `DEPENDENCY_FIXES.md`
- [ ] Node.js versi 22+ terinstall: `node --version`
- [ ] npm versi 10+ terinstall: `npm --version`

## 🔧 INSTALLATION STEPS

### Step 1: Clean Install
```bash
cd "c:\Users\ASUS\Downloads\Sistem Rekomendasi Obat"
rm -r frontend/node_modules backend/node_modules
rm frontend/package-lock.json backend/package-lock.json
```
- [ ] Berhasil dihapus

### Step 2: Install Frontend
```bash
cd frontend
npm install
```
- [ ] ✅ NO errors
- [ ] ✅ NO warnings tentang sastrawi atau @shadcn/ui
- [ ] ✅ react@19.x.x terinstall
- [ ] ✅ sastrawijs@1.2.0 terinstall

### Step 3: Install Backend
```bash
cd ../backend
npm install
```
- [ ] ✅ NO errors
- [ ] ✅ sastrawijs@1.2.0 terinstall

### Step 4: Build Frontend
```bash
cd ../frontend
npm run build
```
- [ ] ✅ Compiled successfully
- [ ] ✅ NO build errors

### Step 5: Run Development

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
- [ ] ✅ Ready on http://localhost:3000
- [ ] ✅ NO compilation errors

**Terminal 2 - Backend (new terminal):**
```bash
cd backend
npm run dev
```
- [ ] ✅ Server running on port (check .env)
- [ ] ✅ NO errors

## 🧪 VERIFICATION

### Test 1: Frontend Page Load
- [ ] Open http://localhost:3000
- [ ] ✅ Homepage loads
- [ ] ✅ No console errors

### Test 2: Rekomendasi Page
- [ ] Go to http://localhost:3000/rekomendasi
- [ ] ✅ Page loads with form
- [ ] ✅ Form has: keluhan, gejala, riwayat fields

### Test 3: Produk Page
- [ ] Go to http://localhost:3000/produk
- [ ] ✅ Page loads with medicine list
- [ ] ✅ No errors in console

### Test 4: Admin Pages
- [ ] Go to http://localhost:3000/admin
- [ ] ✅ Admin page loads
- [ ] ✅ All admin pages accessible (medicines, import, etc)

### Test 5: API Recommendation
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"keluhan":"sakit perut","gejala":"mual","disease_history":"gastritis","top":5}'
```
- [ ] ✅ Mendapat response dengan recommendations
- [ ] ✅ NO errors

## 🎉 SUCCESS CRITERIA

Jika semua checklist di atas ✅, maka:

✅ All dependency errors fixed
✅ npm install berjalan sukses
✅ npm run build berhasil
✅ npm run dev running tanpa error
✅ Frontend & Backend working
✅ API recommendations working

---

## 📞 JIKA ADA MASALAH

### Error: "No matching version found for..."
- [ ] Jalankan: `npm cache clean --force`
- [ ] Hapus `package-lock.json`
- [ ] Jalankan: `npm install` ulang

### Error: "Cannot find module 'sastrawijs'"
- [ ] Pastikan sudah di directory yang benar
- [ ] Jalankan: `npm install sastrawijs@^1.2.0`
- [ ] Restart dev server

### Error: React Hydration
- [ ] Pastikan semua page dengan useState punya `"use client"`
- [ ] Clear `.next` folder: `rm -r .next`
- [ ] Restart: `npm run dev`

### Error: Port already in use
- [ ] Cek process yang menggunakan port: `lsof -i :3000` (Mac/Linux)
- [ ] Atau ubah port di next.config.js atau start dengan: `npm run dev -- -p 3001`

---

## 📝 NOTES

**Current Version:**
- Next.js: 15.0.0
- React: 19.0.0
- Node.js: 22+ recommended
- Indonesian Stemmer: sastrawijs@1.2.0

**Files Modified:**
- frontend/package.json
- backend/package.json
- frontend/app/api/recommend/route.js
- backend/src/recommender.js
- frontend/app/produk/page.tsx
- frontend/app/rekomendasi/page.tsx
- frontend/app/admin/page.tsx

**Status:** ✅ Ready for production

---

Estimated time: 5-10 minutes untuk complete setup
