# Deployment Guide

Project ini terdiri dari 2 bagian terpisah:
1. **Frontend App** (Folder ini) -> Deploy ke Vercel
2. **Scraper Service** (Folder `../scraper_service`) -> Deploy ke VPS

## 1. Backend Scraper (VPS)

Upload isi folder `scraper_service` ke VPS Anda.

Jalankan di VPS:
```bash
# Masuk ke folder scraper
cd scraper_service

# Build Docker Image
docker build -t pln-scraper .

# Run Container (background)
# Port 8000 exposed
docker run -d -p 8000:8000 --name scraper --restart always pln-scraper
```

Test API di VPS:
```bash
curl http://localhost:8000
```

## 2. Frontend (Vercel)

1. Push folder `app` ini ke GitHub (Repository 1).
2. Import project ke Vercel.
3. Di Settings > Environment Variables:
   - `PYTHON_API_URL`: URL ke VPS Scraper. See section 3 for options.
   - `MONGODB_URI`: Connection string MongoDB Atlas.

## 3. Konfigurasi Domain Scraper (PENTING)

frontend Vercel berjalan di HTTPS, jadi Scraper sebaiknya juga HTTPS.

**Opsi A: Menggunakan Domain (Disarankan)**
1. Beli domain/subdomain (contoh: `api.websiteku.com`).
2. Masukkan **A Record** di DNS Manager domain Anda, arahkan ke **IP Public VPS**.
3. Di VPS, install **Nginx** dan **Certbot** untuk SSL gratis.
   - Proxy `api.websiteku.com` ke `localhost:8000`.
4. Di Vercel ENV, set `PYTHON_API_URL` = `https://api.websiteku.com`.

**Opsi B: Cloudflare Tunnel (Mudah & Gratis)**
1. Install `cloudflared` di VPS.
2. Jalankan: `cloudflared tunnel --url http://localhost:8000`
3. Copy URL HTTPS yang muncul (contoh: `https://cool-api.trycloudflare.com`).
4. Di Vercel ENV, set `PYTHON_API_URL` = URL tersebut.
