#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class DrepanHopeAPITester:
    def __init__(self, base_url="https://hope-foundation-6.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_credentials = {
            "email": "admin@drepanhope.org",
            "password": "raQHZLukIQ88MNeV"
        }

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "details": details})

    def make_request(self, method, endpoint, data=None, auth_required=False):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            return None

    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = self.make_request('GET', '')
        success = response and response.status_code == 200
        details = f"Status: {response.status_code if response else 'No response'}"
        self.log_test("API Root Endpoint", success, details)
        return success

    def test_campaigns_endpoint(self):
        """Test campaigns endpoint"""
        response = self.make_request('GET', 'campaigns')
        success = response and response.status_code == 200
        if success:
            try:
                campaigns = response.json()
                success = isinstance(campaigns, list) and len(campaigns) > 0
                details = f"Found {len(campaigns)} campaigns" if success else "No campaigns found"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Campaigns Endpoint", success, details)
        return success, campaigns if success else []

    def test_campaign_by_slug(self, campaigns):
        """Test individual campaign endpoint"""
        if not campaigns:
            self.log_test("Campaign by Slug", False, "No campaigns to test")
            return False
        
        slug = campaigns[0].get('slug')
        response = self.make_request('GET', f'campaigns/{slug}')
        success = response and response.status_code == 200
        details = f"Status: {response.status_code if response else 'No response'}"
        self.log_test("Campaign by Slug", success, details)
        return success

    def test_transparency_summary(self):
        """Test transparency summary endpoint"""
        response = self.make_request('GET', 'transparency/summary')
        success = response and response.status_code == 200
        if success:
            try:
                data = response.json()
                required_keys = ['total_raised', 'total_spent']
                success = all(key in data for key in required_keys)
                details = f"Keys: {list(data.keys())}" if success else "Missing required keys"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Transparency Summary", success, details)
        return success

    def test_reports_endpoint(self):
        """Test reports endpoint"""
        response = self.make_request('GET', 'reports')
        success = response and response.status_code == 200
        if success:
            try:
                reports = response.json()
                success = isinstance(reports, list)
                details = f"Found {len(reports)} reports"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Reports Endpoint", success, details)
        return success

    def test_updates_endpoint(self):
        """Test updates endpoint"""
        response = self.make_request('GET', 'updates')
        success = response and response.status_code == 200
        if success:
            try:
                updates = response.json()
                success = isinstance(updates, list)
                details = f"Found {len(updates)} updates"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Updates Endpoint", success, details)
        return success

    def test_contact_submission(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        }
        
        response = self.make_request('POST', 'contact', contact_data)
        success = response and response.status_code == 200
        details = f"Status: {response.status_code if response else 'No response'}"
        self.log_test("Contact Form Submission", success, details)
        return success

    def test_donation_creation(self, campaigns):
        """Test donation creation"""
        if not campaigns:
            self.log_test("Donation Creation", False, "No campaigns available")
            return False, None
        
        donation_data = {
            "donor_first_name": "Test",
            "donor_last_name": "Donor",
            "email": "testdonor@example.com",
            "country": "USA",
            "amount": 50,
            "campaign_id": campaigns[0]['id'],
            "donation_type": "one_time",
            "message": "Test donation"
        }
        
        response = self.make_request('POST', 'donations', donation_data)
        success = response and response.status_code == 200
        donation_id = None
        if success:
            try:
                donation = response.json()
                donation_id = donation.get('id')
                success = donation_id is not None
                details = f"Created donation ID: {donation_id}"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Donation Creation", success, details)
        return success, donation_id

    def test_admin_login(self):
        """Test admin login"""
        response = self.make_request('POST', 'auth/login', self.admin_credentials)
        success = response and response.status_code == 200
        if success:
            try:
                data = response.json()
                self.token = data.get('token')
                success = self.token is not None
                details = "Login successful, token received"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Admin Login", success, details)
        return success

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        response = self.make_request('GET', 'admin/stats', auth_required=True)
        success = response and response.status_code == 200
        if success:
            try:
                stats = response.json()
                required_keys = ['donations', 'amounts']
                success = all(key in stats for key in required_keys)
                details = f"Stats keys: {list(stats.keys())}"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Admin Stats", success, details)
        return success

    def test_admin_donations(self):
        """Test admin donations endpoint"""
        response = self.make_request('GET', 'admin/donations', auth_required=True)
        success = response and response.status_code == 200
        if success:
            try:
                donations = response.json()
                success = isinstance(donations, list)
                details = f"Found {len(donations)} donations"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Admin Donations List", success, details)
        return success, donations if success else []

    def test_donation_status_update(self, donations):
        """Test updating donation status"""
        if not donations:
            self.log_test("Donation Status Update", False, "No donations to test")
            return False
        
        donation_id = donations[0]['id']
        response = self.make_request('PUT', f'admin/donations/{donation_id}/status?status=paid', auth_required=True)
        success = response and response.status_code == 200
        details = f"Status: {response.status_code if response else 'No response'}"
        self.log_test("Donation Status Update", success, details)
        return success

    def test_public_settings(self):
        """Test public settings endpoint"""
        response = self.make_request('GET', 'settings/public')
        success = response and response.status_code == 200
        if success:
            try:
                settings = response.json()
                required_keys = ['contact_email']
                success = all(key in settings for key in required_keys)
                details = f"Settings keys: {list(settings.keys())}"
            except:
                success = False
                details = "Invalid JSON response"
        else:
            details = f"Status: {response.status_code if response else 'No response'}"
        
        self.log_test("Public Settings", success, details)
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting DrepanHope API Tests...")
        print(f"Testing against: {self.base_url}")
        print("-" * 50)
        
        # Test public endpoints
        self.test_root_endpoint()
        campaigns_success, campaigns = self.test_campaigns_endpoint()
        if campaigns_success:
            self.test_campaign_by_slug(campaigns)
        
        self.test_transparency_summary()
        self.test_reports_endpoint()
        self.test_updates_endpoint()
        self.test_contact_submission()
        self.test_public_settings()
        
        # Test donation creation
        donation_success, donation_id = self.test_donation_creation(campaigns)
        
        # Test admin endpoints
        admin_login_success = self.test_admin_login()
        if admin_login_success:
            self.test_admin_stats()
            donations_success, admin_donations = self.test_admin_donations()
            if donations_success and admin_donations:
                self.test_donation_status_update(admin_donations)
        
        # Print results
        print("-" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = DrepanHopeAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())