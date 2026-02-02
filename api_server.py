from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

app = FastAPI(title="PLN Bill Checker API", version="4.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CustomerRequest(BaseModel):
    customer_number: str


# Import scraper
try:
    from sepulsa_scraper import check_pln_bill
    SCRAPER_AVAILABLE = True
except ImportError as e:
    SCRAPER_AVAILABLE = False
    print(f"[Warning] Scraper import error: {e}")


@app.get("/")
def root():
    return {
        "status": "ok", 
        "message": "PLN Bill Checker API v4.0 (Sepulsa Direct API)",
        "scraper_available": SCRAPER_AVAILABLE
    }


@app.get("/health")
def health():
    return {"status": "ok", "scraper_available": SCRAPER_AVAILABLE}


@app.post("/api/pln/postpaid")
def check_pln_postpaid(request: CustomerRequest):
    """
    Check PLN postpaid bill using Sepulsa API
    """
    if not SCRAPER_AVAILABLE:
        return {
            "status": False,
            "message": "Scraper not available. Check server logs.",
        }
    
    try:
        result = check_pln_bill(request.customer_number)
        
        if result.get("status"):
            data = result.get("data", {})
            return {
                "status": "SUCCESS",
                "source": "sepulsa",
                "data": {
                    "nomor_id_pelanggan": data.get("customer_number", request.customer_number),
                    "nama_pelanggan": data.get("customer_name", "N/A"),
                    "tarif_daya": data.get("tariff_power", "N/A"),
                    "stand_meter": data.get("stand_meter", "N/A"),
                    "periode_tagihan": data.get("period", "N/A"),
                    "jumlah_tagihan_excl_fee": data.get("bill_amount", 0),
                    "biaya_admin": data.get("admin_fee", 3250),
                    "total_pembayaran_incl_fee": data.get("total_payment", 0),
                }
            }
        else:
            return {
                "status": False,
                "message": result.get("message", "ID Pelanggan tidak ditemukan"),
            }
    
    except Exception as e:
        print(f"[API Error] {e}")
        return {
            "status": False,
            "message": f"Error: {str(e)}"
        }


@app.post("/api/cek-tagihan-pln")
def cek_tagihan_pln(request: CustomerRequest):
    """Alias endpoint for compatibility"""
    return check_pln_postpaid(request)


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("PLN Bill Checker API v4.0 (Sepulsa Direct API)")
    print("=" * 50)
    print(f"Scraper Available: {SCRAPER_AVAILABLE}")
    print("\nEndpoints:")
    print("  POST /api/pln/postpaid")
    print("  POST /api/cek-tagihan-pln")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
