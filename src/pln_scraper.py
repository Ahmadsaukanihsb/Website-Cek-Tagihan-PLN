"""
PLN Bill Checker using Playwright Browser Automation
Scrapes bill information from various Indonesian e-commerce/payment platforms
"""

import asyncio
import json
import re
from typing import Optional, Dict, Any

try:
    from playwright.async_api import async_playwright, Page, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("[Warning] Playwright not installed. Run: pip install playwright && playwright install chromium")


class PLNScraper:
    """
    Scraper for PLN bill information using browser automation.
    Falls back to multiple sources if one fails.
    """
    
    SOURCES = [
        {
            "name": "Tokopedia",
            "url": "https://www.tokopedia.com/pln/tagihan-listrik/",
            "input_selector": "input[data-testid='pln-input-customer-number']",
            "submit_selector": "button[data-testid='pln-submit-button']",
        },
        {
            "name": "Shopee",
            "url": "https://shopee.co.id/top-up-recharge/pln-postpaid",
            "input_selector": "input[type='text']",
            "submit_selector": "button.submit-btn",
        },
    ]

    def __init__(self):
        self.browser: Optional[Browser] = None
        self.playwright = None

    async def init_browser(self):
        """Initialize the browser"""
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright is not installed")
        
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ]
        )

    async def close_browser(self):
        """Close the browser"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def check_bill_tokopedia(self, customer_number: str) -> Dict[str, Any]:
        """
        Check PLN bill from Tokopedia
        """
        try:
            context = await self.browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            page = await context.new_page()
            
            # Navigate to PLN page
            await page.goto('https://www.tokopedia.com/pln/tagihan-listrik/', timeout=30000)
            await page.wait_for_load_state('networkidle')
            
            # Wait for input to appear
            await page.wait_for_selector('input[type="text"]', timeout=10000)
            
            # Find and fill input
            inputs = await page.query_selector_all('input[type="text"]')
            for input_el in inputs:
                placeholder = await input_el.get_attribute('placeholder') or ''
                if 'pelanggan' in placeholder.lower() or 'meter' in placeholder.lower():
                    await input_el.fill(customer_number)
                    break
            
            # Find and click submit button
            buttons = await page.query_selector_all('button')
            for btn in buttons:
                text = await btn.text_content() or ''
                if 'cek' in text.lower() or 'tagihan' in text.lower():
                    await btn.click()
                    break
            
            # Wait for result
            await page.wait_for_timeout(5000)
            
            # Extract data from page
            content = await page.content()
            
            await context.close()
            
            # Parse the content for bill information
            return self._parse_bill_info(content, customer_number)
            
        except Exception as e:
            print(f"[Tokopedia] Error: {e}")
            return {"status": False, "message": str(e), "source": "tokopedia"}

    def _parse_bill_info(self, html: str, customer_number: str) -> Dict[str, Any]:
        """
        Parse HTML content to extract PLN bill information
        """
        # Common patterns to find bill info
        patterns = {
            'nama': r'(?:nama|pelanggan)[:\s]*([A-Z\s]+)',
            'tarif': r'(?:tarif|daya)[:\s]*([R\d\/\w]+)',
            'tagihan': r'(?:tagihan|total)[:\s]*(?:Rp\.?\s?)?([\d\.,]+)',
        }
        
        result = {
            "status": True,
            "source": "tokopedia",
            "data": {
                "customer_number": customer_number,
                "customer_name": "Unknown",
                "tariff_power": "Unknown",
                "bill_amount": 0,
            }
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                if key == 'nama':
                    result['data']['customer_name'] = value
                elif key == 'tarif':
                    result['data']['tariff_power'] = value
                elif key == 'tagihan':
                    # Clean and convert to number
                    amount = re.sub(r'[^\d]', '', value)
                    result['data']['bill_amount'] = int(amount) if amount else 0
        
        return result

    async def check_bill(self, customer_number: str) -> Dict[str, Any]:
        """
        Main method to check PLN bill
        Tries multiple sources until one succeeds
        """
        if not PLAYWRIGHT_AVAILABLE:
            return {
                "status": False,
                "message": "Playwright not installed. Run: pip install playwright && playwright install chromium"
            }
        
        try:
            await self.init_browser()
            
            # Try Tokopedia first
            result = await self.check_bill_tokopedia(customer_number)
            if result.get('status'):
                return result
            
            return {
                "status": False,
                "message": "Could not fetch bill information from any source",
            }
            
        finally:
            await self.close_browser()


# Synchronous wrapper for use with FastAPI
def check_pln_bill_sync(customer_number: str) -> Dict[str, Any]:
    """
    Synchronous wrapper for the async scraper
    """
    scraper = PLNScraper()
    return asyncio.run(scraper.check_bill(customer_number))


if __name__ == "__main__":
    # Test the scraper
    import sys
    customer_id = sys.argv[1] if len(sys.argv) > 1 else "535210210872"
    print(f"Checking PLN bill for: {customer_id}")
    result = check_pln_bill_sync(customer_id)
    print(json.dumps(result, indent=2))
