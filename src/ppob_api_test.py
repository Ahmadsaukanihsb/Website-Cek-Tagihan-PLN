"""
PLN Bill Checker - PPOB API Test
Testing API with PLN Postpaid inquiry
"""

import json
import requests
import hashlib
from typing import Dict, Any
from datetime import datetime


class PPOBApiTester:
    """
    Test PPOB API for PLN Postpaid inquiry
    
    Based on response format:
    {
      "status": "success",
      "inquiryId": "inq_xxx",
      "destinationNo": "530000000001",
      "productCode": "PP_PLN",
      "suggestionFee": 2750,
      "result": {
        "totalAdmin": 2500,
        "totalBill": 300000,
        "headerBill": {...},
        "detailBill": [...]
      }
    }
    """
    
    def __init__(self, api_url: str, api_key: str = "", secret_key: str = ""):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.secret_key = secret_key
    
    def _generate_signature(self, ref_id: str) -> str:
        """Generate MD5 signature for Digiflazz-style API"""
        if self.api_key and self.secret_key:
            # Digiflazz format: md5(username + api_key + ref_id)
            sign_string = f"{self.api_key}{self.secret_key}{ref_id}"
            return hashlib.md5(sign_string.encode()).hexdigest()
        return ""
    
    def check_bill(self, customer_number: str) -> Dict[str, Any]:
        """
        Check PLN bill via PPOB API
        """
        print(f"[PPOB API] Checking bill for: {customer_number}")
        
        ref_id = f"ref_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Prepare request payload
        payload = {
            "productCode": "PP_PLN",
            "destinationNo": customer_number,
            "refId": ref_id,
        }
        
        # Add signature if keys provided
        if self.api_key and self.secret_key:
            payload["username"] = self.api_key
            payload["sign"] = self._generate_signature(ref_id)
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        try:
            print(f"[PPOB API] Sending request to: {self.api_url}")
            response = requests.post(
                f"{self.api_url}/inquiry",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            print(f"[PPOB API] Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_response(data, customer_number)
            else:
                return {
                    "status": False,
                    "message": f"API returned status {response.status_code}",
                    "raw": response.text[:500]
                }
                
        except requests.exceptions.Timeout:
            return {"status": False, "message": "Request timeout"}
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Request error: {str(e)}"}
        except json.JSONDecodeError:
            return {"status": False, "message": "Invalid JSON response"}
        except Exception as e:
            return {"status": False, "message": str(e)}
    
    def _parse_response(self, data: Dict, customer_number: str) -> Dict[str, Any]:
        """Parse PPOB API response"""
        try:
            if data.get("status") != "success":
                return {
                    "status": False,
                    "message": data.get("message", "Unknown error"),
                    "raw": data
                }
            
            result = data.get("result", {})
            header = result.get("headerBill", {})
            details = result.get("detailBill", [])
            
            # Parse period format (e.g., "102016" -> "OKT 2016")
            period_raw = header.get("period", "")
            period = self._format_period(period_raw)
            
            return {
                "status": True,
                "source": "ppob_api",
                "inquiry_id": data.get("inquiryId", ""),
                "data": {
                    "customer_number": data.get("destinationNo", customer_number),
                    "customer_name": header.get("name", "Unknown"),
                    "tariff_power": f"{header.get('segment', 'R1')}/{header.get('power', '0')} VA",
                    "period": period,
                    "bill_count": header.get("billQty", 1),
                    "bill_amount": result.get("totalBill", 0),
                    "admin_fee": result.get("totalAdmin", 0),
                    "total_payment": result.get("totalBill", 0) + result.get("totalAdmin", 0),
                    "detail_bills": details,
                }
            }
            
        except Exception as e:
            return {"status": False, "message": f"Parse error: {str(e)}"}
    
    def _format_period(self, period_raw: str) -> str:
        """Format period from MMYYYY to readable format"""
        if not period_raw or len(period_raw) < 6:
            return period_raw
        
        months = {
            "01": "JAN", "02": "FEB", "03": "MAR", "04": "APR",
            "05": "MAY", "06": "JUN", "07": "JUL", "08": "AUG",
            "09": "SEP", "10": "OKT", "11": "NOV", "12": "DES"
        }
        
        try:
            month = period_raw[:2]
            year = period_raw[2:]
            return f"{months.get(month, month)} {year}"
        except:
            return period_raw


def simulate_ppob_response(customer_number: str) -> Dict[str, Any]:
    """
    Simulate PPOB API response for testing
    Based on test numbers in documentation
    """
    print(f"[Simulator] Simulating response for: {customer_number}")
    
    # Test number patterns
    if customer_number.startswith("5300"):
        # 1 Month bill - Success
        return {
            "status": True,
            "source": "ppob_simulated",
            "inquiry_id": f"inq_{customer_number}",
            "data": {
                "customer_number": customer_number,
                "customer_name": "JOHN DOE",
                "tariff_power": "R1/1300 VA",
                "period": "FEB 2026 (1 Bulan)",
                "bill_count": 1,
                "bill_amount": 300000,
                "admin_fee": 2500,
                "total_payment": 302500,
                "detail_bills": [
                    {"period": "022026", "amount": 300000, "penalty": 0}
                ]
            }
        }
    elif customer_number.startswith("5310"):
        # 4 Months bills - Success
        return {
            "status": True,
            "source": "ppob_simulated",
            "inquiry_id": f"inq_{customer_number}",
            "data": {
                "customer_number": customer_number,
                "customer_name": "JANE DOE",
                "tariff_power": "R1/2200 VA",
                "period": "NOV 2025 - FEB 2026 (4 Bulan)",
                "bill_count": 4,
                "bill_amount": 1200000,
                "admin_fee": 10000,
                "total_payment": 1210000,
                "detail_bills": [
                    {"period": "112025", "amount": 300000, "penalty": 5000},
                    {"period": "122025", "amount": 300000, "penalty": 5000},
                    {"period": "012026", "amount": 300000, "penalty": 0},
                    {"period": "022026", "amount": 300000, "penalty": 0}
                ]
            }
        }
    elif customer_number.startswith("5320"):
        # Bill already paid
        return {
            "status": False,
            "message": "Tagihan sudah dibayar"
        }
    elif customer_number.startswith("5331"):
        # Destination not found
        return {
            "status": False,
            "message": "ID Pelanggan tidak ditemukan"
        }
    elif customer_number.startswith("5335"):
        # No billing available
        return {
            "status": False,
            "message": "Tidak ada tagihan tersedia"
        }
    else:
        # Default: simulate with actual customer number
        return {
            "status": True,
            "source": "ppob_simulated",
            "inquiry_id": f"inq_sim_{customer_number}",
            "data": {
                "customer_number": customer_number,
                "customer_name": "PELANGGAN TEST",
                "tariff_power": "R1/900 VA",
                "period": "FEB 2026 (1 Bulan)",
                "bill_count": 1,
                "bill_amount": 150000,
                "admin_fee": 2500,
                "total_payment": 152500,
                "detail_bills": [
                    {"period": "022026", "amount": 150000, "penalty": 0}
                ]
            }
        }


if __name__ == "__main__":
    import sys
    
    customer_id = sys.argv[1] if len(sys.argv) > 1 else "530000000001"
    
    print("=" * 60)
    print("PPOB API Tester - PLN Postpaid")
    print("=" * 60)
    
    # Test with simulator first
    print("\n[Test 1] Simulated Response")
    print("-" * 40)
    result = simulate_ppob_response(customer_id)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # Test different scenarios
    test_numbers = [
        ("530000001234", "1 Month bill"),
        ("531000001234", "4 Months bills"),
        ("532000001234", "Bill already paid"),
        ("533100001234", "Not found"),
        ("533500001234", "No billing"),
    ]
    
    print("\n" + "=" * 60)
    print("Test Scenarios:")
    print("=" * 60)
    
    for num, desc in test_numbers:
        print(f"\n[{desc}] Testing: {num}")
        result = simulate_ppob_response(num)
        if result.get("status"):
            data = result.get("data", {})
            print(f"  -> {data.get('customer_name')}: Rp{data.get('total_payment', 0):,}")
        else:
            print(f"  -> Error: {result.get('message')}")
    
    print("\n" + "=" * 60)
    print("Untuk menggunakan API asli, isi api_url, api_key, secret_key")
    print("=" * 60)
