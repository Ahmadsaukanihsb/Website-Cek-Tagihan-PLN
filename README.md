# Website Cek Tagihan PLN (Frontend + Backend)

Aplikasi web modern untuk cek tagihan PLN. Repository ini berisi **Frontend React** dan **Backend Node.js**.

## 🏗️ Struktur Project

- `src/` - Frontend (React + Vite)
- `server/` - Backend API (Express.js) - untuk manajemen user & database
- `dist/` - Build output

**Catatan**: Scraper Service (Python) dipisahkan di repository/folder berbeda untuk keamanan dan deployment yang lebih fleksibel.

## 🚀 Setup Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Buat `.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://...
PYTHON_API_URL=http://localhost:8000
```
*PYTHON_API_URL adalah alamat dimana Scraper Service berjalan.*

### 3. Jalankan Development Server
```bash
npm run dev
```
Akses: `http://localhost:5173`

## ☁️ Deployment (Vercel)
Project ini siap dideploy ke Vercel.

1. **Environment Variables**: Tambahkan `PYTHON_API_URL` (IP VPS Scraper) dan `MONGODB_URI`.
2. **Vercel Config**: `vercel.json` sudah dikonfigurasi untuk proxy ke API Scraper.

Lihat `DEPLOY.md` untuk detail lengkap.
