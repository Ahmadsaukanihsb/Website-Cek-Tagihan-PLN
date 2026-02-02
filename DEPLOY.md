# Deployment Guide

## 1. Backend Scraper (VPS)

Upload file berikut ke VPS Anda:
- `Dockerfile`
- `requirements.txt`
- `api_server.py`
- `src/` folder

Jalankan di VPS:
```bash
# Build Docker Image
docker build -t pln-scraper .

# Run Container (background)
# Ganti 8000 dengan port yang Anda inginkan
docker run -d -p 8000:8000 --name scraper --restart always pln-scraper
```

Test API di VPS:
```bash
curl http://localhost:8000
```

## 2. Frontend (Vercel)

1. Pastikan project sudah di push ke GitHub/GitLab.
2. Import project ke Vercel.
3. Di Settings > Environment Variables (jika perlu).
4. **PENTING**: Update `vercel.json` dengan IP VPS Anda!

Buka `vercel.json` dan ganti `IP_VPS_ANDA` dengan IP public VPS:
```json
{
  "source": "/api/(.*)", 
  "destination": "http://123.456.78.90:8000/api/$1" 
}
```

## Catatan Penting HTTPS
Jika deploy ke Vercel (HTTPS), browser akan memblokir request ke VPS yang HTTP (Mixed Content).
Solusi:
1. Pasang SSL di VPS (pakai Nginx + Certbot/LetsEncrypt).
2. Atau gunakan **Cloudflare Tunnel** (gratis & mudah) untuk mengekspos localhost VPS ke HTTPS public URL.

**Rekomendasi Cloudflare Tunnel:**
1. Install `cloudflared` di VPS.
2. `cloudflared tunnel --url http://localhost:8000`
3. Copy URL `https://xxxx.trycloudflare.com` ke `vercel.json`.
