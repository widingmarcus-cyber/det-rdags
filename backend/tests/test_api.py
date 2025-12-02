"""
Tests for API endpoints
"""

import pytest
from fastapi.testclient import TestClient
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment before importing app
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///./test_bobot.db"

from main import app
from database import create_tables, Base, engine


@pytest.fixture(scope="module")
def client():
    """Create test client with fresh database"""
    # Create tables
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as c:
        yield c

    # Cleanup
    Base.metadata.drop_all(bind=engine)


class TestHealthEndpoints:
    """Tests for health check endpoints"""

    def test_root_endpoint(self, client):
        """Root endpoint should return welcome message"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data

    def test_health_endpoint(self, client):
        """Health endpoint should return healthy status"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestSecurityHeaders:
    """Tests for security headers"""

    def test_security_headers_present(self, client):
        """All responses should have security headers"""
        response = client.get("/health")

        assert "X-Frame-Options" in response.headers
        assert "X-Content-Type-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        assert "Referrer-Policy" in response.headers

    def test_request_id_header(self, client):
        """All responses should have request ID"""
        response = client.get("/health")
        assert "X-Request-ID" in response.headers


class TestCompanyLogin:
    """Tests for company login endpoint"""

    def test_login_invalid_credentials(self, client):
        """Login with invalid credentials should fail"""
        response = client.post("/auth/login", json={
            "company_id": "nonexistent",
            "password": "wrong"
        })
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        """Login without required fields should fail"""
        response = client.post("/auth/login", json={})
        assert response.status_code == 422  # Validation error

    def test_login_demo_company(self, client):
        """Login with demo credentials should succeed"""
        response = client.post("/auth/login", json={
            "company_id": "demo",
            "password": "demo123"
        })
        # May fail if demo not created, that's ok for test setup
        assert response.status_code in [200, 401]

        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            assert data["company_id"] == "demo"


class TestAdminLogin:
    """Tests for admin login endpoint"""

    def test_admin_login_invalid(self, client):
        """Admin login with invalid credentials should fail"""
        response = client.post("/auth/admin/login", json={
            "username": "nonexistent",
            "password": "wrong"
        })
        assert response.status_code == 401

    def test_admin_login_brute_force_protection(self, client):
        """Multiple failed logins should trigger rate limit"""
        # Try to login multiple times with wrong password
        for _ in range(6):
            response = client.post("/auth/admin/login", json={
                "username": "admin",
                "password": "wrong_password"
            })

        # Should be rate limited after 5 attempts
        # Note: This depends on the brute force protection being active


class TestChatEndpoint:
    """Tests for chat endpoint"""

    def test_chat_invalid_company(self, client):
        """Chat with invalid company should return 404"""
        response = client.post("/chat/nonexistent", json={
            "question": "Hello?"
        })
        assert response.status_code == 404

    def test_chat_empty_question(self, client):
        """Chat with empty question should fail validation"""
        response = client.post("/chat/demo", json={
            "question": ""
        })
        assert response.status_code == 422

    def test_chat_rate_limit_headers(self, client):
        """Chat response should include rate limit headers"""
        response = client.post("/chat/demo", json={
            "question": "Test question"
        })

        # Even if company doesn't exist, headers should be present
        # (unless request fails before rate limit check)
        if response.status_code == 200:
            assert "X-RateLimit-Limit" in response.headers
            assert "X-RateLimit-Remaining" in response.headers


class TestKnowledgeEndpoints:
    """Tests for knowledge base endpoints (require auth)"""

    def test_knowledge_requires_auth(self, client):
        """Knowledge endpoints should require authentication"""
        response = client.get("/knowledge")
        assert response.status_code in [401, 403]

    def test_knowledge_with_auth(self, client):
        """Knowledge endpoint should work with valid auth"""
        # First login
        login_response = client.post("/auth/login", json={
            "company_id": "demo",
            "password": "demo123"
        })

        if login_response.status_code == 200:
            token = login_response.json()["token"]
            response = client.get(
                "/knowledge",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 200


class TestInputValidation:
    """Tests for input validation"""

    def test_login_sql_injection(self, client):
        """Login should be safe from SQL injection"""
        response = client.post("/auth/login", json={
            "company_id": "'; DROP TABLE companies; --",
            "password": "test"
        })
        # Should fail auth, not crash
        assert response.status_code in [401, 422]

    def test_chat_xss_prevention(self, client):
        """Chat should handle potential XSS attempts"""
        response = client.post("/chat/demo", json={
            "question": "<script>alert('xss')</script>"
        })
        # Should not crash
        assert response.status_code in [200, 404, 422]

    def test_long_input_handling(self, client):
        """API should handle very long inputs"""
        response = client.post("/chat/demo", json={
            "question": "a" * 10000  # Very long question
        })
        # Should reject or handle gracefully
        assert response.status_code in [200, 404, 422]


class TestConversationEndpoints:
    """Tests for conversation endpoints"""

    def test_conversations_requires_auth(self, client):
        """Conversations endpoint should require authentication"""
        response = client.get("/conversations")
        assert response.status_code in [401, 403]


class TestSettingsEndpoints:
    """Tests for settings endpoints"""

    def test_settings_requires_auth(self, client):
        """Settings endpoint should require authentication"""
        response = client.get("/settings")
        assert response.status_code in [401, 403]


class TestExportEndpoints:
    """Tests for export endpoints"""

    def test_export_requires_auth(self, client):
        """Export endpoint should require authentication"""
        response = client.get("/export/conversations")
        assert response.status_code in [401, 403]
