#!/usr/bin/env python3
"""
Test suite for DrepanHope Foundation Admin Authentication Flow
Tests: dev/reset-owner, auth/login, auth/change-password, admin/donations
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hope-foundation-6.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@drepanhope.org"
TEMP_PASSWORD = "Temp@12345!"
NEW_PASSWORD = "TestSecure@2025!"


class TestDevResetOwner:
    """Tests for POST /api/dev/reset-owner endpoint"""
    
    def test_reset_owner_success(self):
        """Reset owner password should return temp password"""
        response = requests.post(f"{API_URL}/dev/reset-owner")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["email"] == ADMIN_EMAIL
        assert data["temporary_password"] == TEMP_PASSWORD
        assert data["must_change_password"] == True


class TestAuthLogin:
    """Tests for POST /api/auth/login endpoint"""
    
    @pytest.fixture(autouse=True)
    def reset_owner_before_test(self):
        """Reset owner password before each test"""
        requests.post(f"{API_URL}/dev/reset-owner")
    
    def test_login_with_correct_password(self):
        """Login with correct password should return token and user"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": TEMP_PASSWORD
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 0
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "owner"
        assert data["user"]["force_password_change"] == True
    
    def test_login_with_wrong_password(self):
        """Login with wrong password should return 401 with 'Wrong password'"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword123"
        })
        assert response.status_code == 401
        
        data = response.json()
        assert data["detail"] == "Wrong password"
    
    def test_login_user_not_found(self):
        """Login with non-existent user should return 401 with 'User not found'"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        assert response.status_code == 401
        
        data = response.json()
        assert data["detail"] == "User not found"


class TestAuthChangePassword:
    """Tests for POST /api/auth/change-password endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token after resetting owner"""
        requests.post(f"{API_URL}/dev/reset-owner")
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": TEMP_PASSWORD
        })
        return response.json()["token"]
    
    def test_change_password_success(self, auth_token):
        """Change password should update password and set force_password_change=false"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{API_URL}/auth/change-password", json={
            "current_password": TEMP_PASSWORD,
            "new_password": NEW_PASSWORD
        }, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["message"] == "Password changed successfully"
        
        # Verify login with new password works and force_password_change is false
        login_response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": NEW_PASSWORD
        })
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert login_data["user"]["force_password_change"] == False
    
    def test_change_password_wrong_current(self, auth_token):
        """Change password with wrong current password should fail"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{API_URL}/auth/change-password", json={
            "current_password": "wrongcurrent",
            "new_password": NEW_PASSWORD
        }, headers=headers)
        
        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Current password is incorrect"


class TestAdminDonations:
    """Tests for GET /api/admin/donations endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token with changed password"""
        requests.post(f"{API_URL}/dev/reset-owner")
        login_response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": TEMP_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Change password
        headers = {"Authorization": f"Bearer {token}"}
        requests.post(f"{API_URL}/auth/change-password", json={
            "current_password": TEMP_PASSWORD,
            "new_password": NEW_PASSWORD
        }, headers=headers)
        
        # Login with new password
        new_login = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": NEW_PASSWORD
        })
        return new_login.json()["token"]
    
    def test_get_donations_success(self, auth_token):
        """Get donations should return list of donations"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_URL}/admin/donations", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_donations_with_status_filter(self, auth_token):
        """Get donations with status filter should work"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_URL}/admin/donations?status=pending", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned donations should have pending status
        for donation in data:
            assert donation["status"] == "pending"
    
    def test_get_donations_unauthorized(self):
        """Get donations without auth should return 403"""
        response = requests.get(f"{API_URL}/admin/donations")
        assert response.status_code == 403


class TestAuthMe:
    """Tests for GET /api/auth/me endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        requests.post(f"{API_URL}/dev/reset-owner")
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": TEMP_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_me_success(self, auth_token):
        """Get current user should return user info"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "owner"
        assert "force_password_change" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
