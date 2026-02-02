import json
import requests
import random


class ScraperAPI:
    """
    Alternative PLN API using multiple provider endpoints
    """
    
    # Provider endpoints to try
    PROVIDERS = [
        {
            "name": "Sepulsa",
            "base_url": "https://horven-api.sumpahpalapa.com/api",
            "pln_postpaid": "/pln/postpaid/inquiry",
        },
        {
            "name": "Alterra",
            "base_url": "https://api.alterra.id",
            "pln_postpaid": "/product/pln-postpaid/inquiry",
        }
    ]
    
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    ]

    def __init__(self):
        self.session = requests.Session()

    def _get_headers(self):
        """Generate random headers"""
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "application/json",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Content-Type": "application/json",
            "Origin": "https://www.sepulsa.com",
            "Referer": "https://www.sepulsa.com/",
        }

    def check_pln_postpaid(self, customer_number):
        """
        Check PLN postpaid bill from multiple providers
        Returns the first successful result
        """
        errors = []
        
        for provider in self.PROVIDERS:
            try:
                print(f"[Scraper] Trying {provider['name']}...")
                
                url = f"{provider['base_url']}{provider['pln_postpaid']}"
                
                response = self.session.post(
                    url=url,
                    headers=self._get_headers(),
                    json={"customer_number": customer_number},
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == True or data.get("success") == True:
                        print(f"[Scraper] Success from {provider['name']}")
                        return {
                            "status": True,
                            "provider": provider["name"],
                            "data": data.get("data", data)
                        }
                
                errors.append(f"{provider['name']}: {response.status_code}")
                
            except requests.exceptions.RequestException as e:
                errors.append(f"{provider['name']}: {str(e)}")
                continue
            except json.JSONDecodeError:
                errors.append(f"{provider['name']}: Invalid JSON response")
                continue
        
        print(f"[Scraper] All providers failed: {errors}")
        return {
            "status": False,
            "message": "All providers failed",
            "errors": errors
        }

    def _get_access_token(self, url):
        """Legacy method - not used with new API approach"""
        return None
