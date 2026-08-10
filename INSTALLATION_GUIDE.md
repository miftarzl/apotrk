# 🎬 STEP-BY-STEP INSTALLATION GUIDE

## 💾 COMMANDS YANG HARUS DIJALANKAN (Copy-Paste)

### PREPARATION

**Buka PowerShell atau Command Prompt sebagai Administrator**

```powershell
# Navigate ke project root
cd "c:\Users\ASUS\Downloads\Sistem Rekomendasi Obat"
```

### STEP 1: CLEAN INSTALL (Remove old packages)

```powershell
# Remove old node_modules and lock files
rmdir /s /q frontend\node_modules
rmdir /s /q backend\node_modules
del frontend\package-lock.json
del backend\package-lock.json
```

**Expected Output:**
```
✅ Directories removed successfully
```

---

### STEP 2: INSTALL FRONTEND DEPENDENCIES

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

**Expected Output:**
```
added XXX packages, and audited XXX packages in Xm Ys
✅ found 0 vulnerabilities
```

**Verify ReactJS 19:**
```powershell
npm list react react-dom
```

**Expected Output:**
```
sistem-rekomendasi-obat-frontend@1.0.0
├── react@19.0.0
├── react-dom@19.0.0
```

**Verify sastrawijs:**
```powershell
npm list sastrawijs
```

**Expected Output:**
```
sistem-rekomendasi-obat-frontend@1.0.0
└── sastrawijs@1.2.0
```

---

### STEP 3: INSTALL BACKEND DEPENDENCIES

```powershell
# Navigate to backend
cd ../backend

# Install dependencies
npm install
```

**Expected Output:**
```
added XXX packages, and audited XXX packages in Xm Ys
✅ found 0 vulnerabilities
```

**Verify sastrawijs:**
```powershell
npm list sastrawijs
```

**Expected Output:**
```
sistem-rekomendasi-obat-backend@1.0.0
└── sastrawijs@1.2.0
```

---

### STEP 4: BUILD VERIFICATION (Frontend)

```powershell
# Navigate to frontend
cd ../frontend

# Build the project
npm run build
```

**Expected Output:**
```
> next build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (0/X)
✓ Collecting build traces
...
Route (app)                                Size    First Load JS
...
✓ Ready for production
```

**⚠️ If Error:**
```powershell
# Clear Next.js cache
rmdir /s /q .next

# Rebuild
npm run build
```

---

### STEP 5: RUN FRONTEND DEV SERVER

**TERMINAL 1:**
```powershell
# Still in frontend directory
npm run dev
```

**Expected Output:**
```
> next dev
  ▲ Next.js 15.0.0
  - Local: http://localhost:3000
  - Environments: .env.local

✅ ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Don't close this terminal!**

---

### STEP 6: RUN BACKEND DEV SERVER

**TERMINAL 2 (NEW TERMINAL):**
```powershell
# Navigate to backend
cd "c:\Users\ASUS\Downloads\Sistem Rekomendasi Obat\backend"

# Start backend
npm run dev
```

**Expected Output:**
```
[nodemon] watching extensions: js,json
[nodemon] starting `node src/index.js`
✅ Server running on port XXXX
```

**Both servers are now running!**

---

## 🧪 VERIFICATION TESTS

### Test 1: Frontend Load

**In Browser:**
```
Open: http://localhost:3000
Expected: 🏠 Homepage loads successfully
Expected: No console errors (F12 → Console tab)
```

### Test 2: Rekomendasi Page

**In Browser:**
```
Open: http://localhost:3000/rekomendasi
Expected: ✅ Page loads
Expected: Form dengan fields: keluhan, gejala, riwayat
Expected: No errors in console
```

### Test 3: Produk Page

**In Browser:**
```
Open: http://localhost:3000/produk
Expected: ✅ Medicine list loads
Expected: No errors in console
```

### Test 4: Admin Dashboard

**In Browser:**
```
Open: http://localhost:3000/admin
Expected: ✅ Admin page loads
Expected: Sidebar and navigation visible
```

### Test 5: API Recommendation

**In PowerShell (TERMINAL 3):**

```powershell
# Test API endpoint
$body = @{
    keluhan = "sakit perut mual"
    gejala = "mual, nyeri ulu hati"
    disease_history = "gastritis"
    top = 5
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/recommend" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected Output:**
```
StatusCode        : 200
StatusDescription : OK
Content           : {
                      "results": [
                        {
                          "medicine": {...},
                          "similarity": XX.XX
                        },
                        ...
                      ]
                    }
```

---

## ✅ SUCCESS CHECKLIST

Jika semua di bawah ✅, maka setup berhasil:

- [ ] npm install di frontend - SUCCESS
- [ ] npm install di backend - SUCCESS
- [ ] npm run build - SUCCESS
- [ ] npm run dev (frontend) - PORT 3000 OK
- [ ] npm run dev (backend) - PORT 5000+ OK
- [ ] http://localhost:3000 - LOADS
- [ ] /rekomendasi page - LOADS
- [ ] /produk page - LOADS
- [ ] /admin page - LOADS
- [ ] /api/recommend - RESPONDS
- [ ] No console errors - VERIFIED
- [ ] No build errors - VERIFIED

---

## ❌ TROUBLESHOOTING

### Error: "npm: command not found"
```powershell
# Check Node.js installation
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Get version 22+ LTS
```

### Error: "Port 3000 already in use"
```powershell
# Option 1: Kill process on port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Option 2: Use different port
npm run dev -- -p 3001
```

### Error: "Cannot find module 'sastrawijs'"
```powershell
# Reinstall specific package
npm install sastrawijs@^1.2.0

# Or clean install
rm package-lock.json
npm install
```

### Error: "Module not found" after npm install
```powershell
# Clear npm cache
npm cache clean --force

# Remove lock files
del package-lock.json

# Reinstall
npm install
```

### Error: React Hydration Mismatch
```powershell
# Clear Next.js cache
rmdir /s /q .next

# Restart dev server
npm run dev
```

### Error: "Failed to compile" in dev
```powershell
# Check TypeScript errors
npm run lint

# Check which files have errors - they'll show in console
# Fix the errors shown in the error message
```

---

## 📱 EXPECTED URLS

| URL | Component | Status |
|-----|-----------|--------|
| http://localhost:3000 | Homepage | ✅ |
| http://localhost:3000/rekomendasi | Recommendation Form | ✅ |
| http://localhost:3000/produk | Product List | ✅ |
| http://localhost:3000/admin | Admin Dashboard | ✅ |
| http://localhost:3000/admin/medicines | Medicine Management | ✅ |
| http://localhost:3000/admin/import | CSV Import | ✅ |
| http://localhost:3000/api/recommend | Recommendation API | ✅ |

---

## 🔔 IMPORTANT NOTES

1. **Two Terminals Needed:**
   - Terminal 1: Frontend (`npm run dev`)
   - Terminal 2: Backend (`npm run dev`)

2. **Don't Close Terminals:**
   - Closing terminal stops the server
   - Open new terminal for additional commands

3. **ENV Files:**
   - Make sure `.env` files exist in frontend and backend
   - Check SUPABASE_URL and other credentials

4. **Node.js Version:**
   - Should be 22.x or latest LTS
   - Check: `node --version`

5. **Ports:**
   - Frontend: 3000 (default Next.js)
   - Backend: 5000+ (check .env)

---

## 🎯 FINAL COMMANDS SUMMARY

```powershell
# 1. Clean
rmdir /s /q frontend\node_modules backend\node_modules

# 2. Install Frontend
cd frontend && npm install

# 3. Install Backend
cd ../backend && npm install

# 4. Build
cd ../frontend && npm run build

# 5. Run (2 terminals)
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd backend && npm run dev
```

---

## 📊 BUILD STATS

**Expected Time:**
- Clean install: 2-3 minutes
- npm run build: 30-60 seconds
- npm run dev startup: 10-20 seconds

**Expected Size:**
- node_modules frontend: ~500MB
- node_modules backend: ~100MB
- .next build: ~200MB

---

**Status: ✅ READY TO EXECUTE**

Follow steps above exactly and your project will be running in 5-10 minutes!
