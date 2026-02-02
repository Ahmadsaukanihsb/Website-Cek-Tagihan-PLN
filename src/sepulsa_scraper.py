"""
PLN Bill Checker - Sepulsa via Playwright
Reliable scraper with proper waits
"""

import json
import asyncio
from typing import Dict, Any

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


class SepulsaScraper:
    URL = "https://www.sepulsa.com/transaction/pln?type=postpaid"

    async def check_bill(self, customer_number: str) -> Dict[str, Any]:
        if not PLAYWRIGHT_AVAILABLE:
            return {"status": False, "message": "Playwright not installed"}
        
        print(f"[Sepulsa] Checking: {customer_number}")
        
        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    viewport={'width': 1280, 'height': 720},
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                )
                
                page = await context.new_page()
                
                # Capture cart data
                cart_data = None
                data_event = asyncio.Event()
                
                async def on_response(response):
                    nonlocal cart_data
                    if 'api.sepulsa.com/api/v1/carts' in response.url:
                        try:
                            data = await response.json()
                            if data.get('data', {}).get('lines'):
                                cart_data = data
                                data_event.set()
                        except:
                            pass
                
                page.on('response', on_response)
                
                # Navigate with networkidle for reliability
                print("[Sepulsa] Loading...")
                await page.goto(self.URL, wait_until="networkidle", timeout=20000)
                
                # Fill input
                print("[Sepulsa] Filling...")
                input_loc = page.locator('input[type="text"], input[type="tel"]').first
                await input_loc.wait_for(state="visible", timeout=5000)
                await input_loc.fill(customer_number)
                
                await page.wait_for_timeout(500)
                
                # Submit
                print("[Sepulsa] Submitting...")
                await input_loc.press('Enter')
                
                # Wait for API response
                print("[Sepulsa] Waiting for response...")
                try:
                    await asyncio.wait_for(data_event.wait(), timeout=12.0)
                except asyncio.TimeoutError:
                    # Fallback: try clicking button
                    try:
                        btn = page.locator('button:visible').filter(has_text="Lanjutkan")
                        if await btn.count() > 0:
                            await btn.first.click(timeout=2000)
                            await asyncio.wait_for(data_event.wait(), timeout=5.0)
                    except:
                        pass
                
                await browser.close()
                
                if cart_data:
                    result = self._parse_response(cart_data, customer_number)
                    if result.get("status"):
                        print(f"[Sepulsa] OK: {result['data']['customer_name']} - Rp{result['data']['total_payment']:,}")
                    return result
                
                return {"status": False, "message": "Data tidak ditemukan"}
                
            except Exception as e:
                print(f"[Sepulsa] Error: {e}")
                return {"status": False, "message": str(e)}

    def _parse_response(self, response: Dict, customer_number: str) -> Dict[str, Any]:
        try:
            cart_data = response.get("data", {})
            lines = cart_data.get("lines", [])
            
            if not lines:
                return {"status": False, "message": "No data"}
            
            attributes = lines[0].get("attributes", [])
            inquiry_details = {}
            
            for attr in attributes:
                if attr.get("option", {}).get("code") == "inquiry_details":
                    try:
                        inquiry_details = json.loads(attr.get("value", "{}"))
                    except:
                        pass
                    break
            
            total_excl = int(cart_data.get("total_excl_fee", 0))
            total_incl = int(cart_data.get("total_incl_fee", 0))
            
            return {
                "status": True,
                "source": "sepulsa",
                "data": {
                    "customer_number": customer_number,
                    "customer_name": inquiry_details.get("Nama Pelanggan", "Unknown"),
                    "tariff_power": inquiry_details.get("Tarif / Daya", "Unknown"),
                    "stand_meter": inquiry_details.get("Stand Meter", "Unknown"),
                    "period": inquiry_details.get("Periode", "Unknown"),
                    "bill_amount": total_excl,
                    "admin_fee": total_incl - total_excl,
                    "total_payment": total_incl,
                }
            }
        except Exception as e:
            return {"status": False, "message": str(e)}


def check_pln_bill(customer_number: str) -> Dict[str, Any]:
    if not PLAYWRIGHT_AVAILABLE:
        return {"status": False, "message": "Playwright not installed"}
    scraper = SepulsaScraper()
    return asyncio.run(scraper.check_bill(customer_number))


if __name__ == "__main__":
    import sys
    import time
    
    customer_id = sys.argv[1] if len(sys.argv) > 1 else "535210210872"
    
    print(f"Testing: {customer_id}")
    print("=" * 50)
    
    start = time.time()
    result = check_pln_bill(customer_id)
    elapsed = time.time() - start
    
    print("=" * 50)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nTime: {elapsed:.2f}s")
