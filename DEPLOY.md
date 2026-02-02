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
   - `PYTHON_API_URL`: `http://IP_VPS:8000` (atau URL Cloudflare Tunnel)
   - `MONGODB_URI`: Connection string MongoDB Atlas.
4. Update `vercel.json` jika perlu penyesuaian proxy.

## Catatan Keamanan
- Pastikan VPS firewall hanya membuka port 8000 untuk IP tertentu jika memungkinkan.
- Gunakan Cloudflare Tunnel untuk HTTPS gratis ke VPS.
