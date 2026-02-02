# Website Cek Tagihan PLN & PPOB

Aplikasi web modern untuk cek tagihan PLN, PDAM, dan BPJS secara real-time. Dibangun dengan React (Vite), Node.js (Express), dan Python (Playwright Scraper).

![Screenshot](screenshot.png)

## 🚀 Fitur

- **Modern Dashboard**: UI Admin yang responsif dan clean dengan tema modern.
- **Cek Tagihan PLN**: Integrasi langsung dengan scraper Sepulsa.
- **Manajemen Pelanggan**: Simpan data pelanggan dan riwayat tagihan (MongoDB Atlas).
- **Multi-Service**: Dukungan untuk PLN, PDAM, dan BPJS (Planned).
- **Print Struk**: Cetak struk pembayaran format thermal.
- **Admin Fee**: Pengaturan biaya admin yang fleksibel.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Shadcn UI
- **Backend (API)**: Express.js, MongoDB Atlas (Mongoose)
- **Scraper Service**: Python, FastAPI, Playwright, Uvicorn
- **Deployment**: Vercel (Frontend) + VPS/Docker (Scraper)

## 📦 Instalasi & Setup Lokal

### Prasyarat
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas / Local

### 1. Clone Repository
```bash
git clone https://github.com/Ahmadsaukanihsb/Website-Cek-Tagihan-PLN.git
cd Website-Cek-Tagihan-PLN/app
```

### 2. Setup Environment Variables
Buat file `.env` di folder `app`:
```env
# Server
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database

# Python Scraper (Local)
PYTHON_API_URL=http://localhost:8000
```

### 3. Install Dependencies

**Frontend & Node Backend:**
```bash
npm install
```

**Python Scraper:**
```bash
pip install -r requirements.txt
playwright install chromium
```

### 4. Jalankan Development Server

Gunakan command berikut untuk menjalankan Frontend, Node Server, dan Python API secara bersamaan:

```bash
npm run dev
```
Akses di: `http://localhost:5173`

## ☁️ Deployment

### Frontend (Vercel)
Project ini siap dideploy ke Vercel. Pastikan `vercel.json` sudah dikonfigurasi dengan URL Scraper API yang benar.

### Backend Scraper (VPS)
Scraper perlu environment khusus (Playwright). Gunakan Docker untuk deploy ke VPS:

```bash
# Di VPS
docker build -t pln-scraper .
docker run -d -p 8000:8000 pln-scraper
```

Lihat [DEPLOY.md](DEPLOY.md) untuk panduan lengkap.

## 📝 Lisensi
MIT License
