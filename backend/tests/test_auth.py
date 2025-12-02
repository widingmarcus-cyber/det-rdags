"""
Tests for authentication module
"""

import pytest
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth import (
    hash_password,
    verify_password,
    create_token,
    decode_token,
    is_bcrypt_hash,
    needs_rehash,
    verify_legacy_password,
    generate_api_key,
)


class TestPasswordHashing:
    """Tests for password hashing functions"""

    def test_hash_password_returns_bcrypt_hash(self):
        """hash_password should return a bcrypt hash"""
        password = "test_password_123"
        hashed = hash_password(password)

        # bcrypt hashes start with $2b$, $2a$, or $2y$
        assert hashed.startswith(("$2b$", "$2a$", "$2y$"))
        assert len(hashed) == 60  # bcrypt hashes are 60 chars

    def test_hash_password_different_each_time(self):
        """Each hash should be unique due to random salt"""
        password = "same_password"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2  # Different salts = different hashes

    def test_verify_password_correct(self):
        """verify_password should return True for correct password"""
        password = "my_secure_password"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """verify_password should return False for wrong password"""
        password = "correct_password"
        hashed = hash_password(password)

        assert verify_password("wrong_password", hashed) is False

    def test_verify_password_empty_string(self):
        """verify_password should handle empty strings"""
        hashed = hash_password("test")
        assert verify_password("", hashed) is False

    def test_is_bcrypt_hash_valid(self):
        """is_bcrypt_hash should identify bcrypt hashes"""
        bcrypt_hash = hash_password("test")
        assert is_bcrypt_hash(bcrypt_hash) is True

    def test_is_bcrypt_hash_invalid(self):
        """is_bcrypt_hash should reject non-bcrypt hashes"""
        sha256_hash = "a" * 64  # SHA256 is 64 hex chars
        assert is_bcrypt_hash(sha256_hash) is False

    def test_needs_rehash_legacy(self):
        """needs_rehash should return True for legacy hashes"""
        sha256_hash = "a" * 64
        assert needs_rehash(sha256_hash) is True

    def test_needs_rehash_bcrypt(self):
        """needs_rehash should return False for bcrypt hashes"""
        bcrypt_hash = hash_password("test")
        assert needs_rehash(bcrypt_hash) is False

    def test_verify_legacy_password(self):
        """verify_legacy_password should work with old SHA256 hashes"""
        # Generate a legacy hash manually
        import hashlib
        password = "legacy_password"
        salt = "bobot_salt_"
        legacy_hash = hashlib.sha256((salt + password).encode()).hexdigest()

        assert verify_legacy_password(password, legacy_hash) is True
        assert verify_legacy_password("wrong", legacy_hash) is False


class TestJWTTokens:
    """Tests for JWT token functions"""

    def test_create_token_returns_string(self):
        """create_token should return a JWT string"""
        data = {"sub": "test_user", "type": "company"}
        token = create_token(data)

        assert isinstance(token, str)
        assert len(token) > 0
        # JWT has 3 parts separated by dots
        assert token.count(".") == 2

    def test_decode_token_returns_data(self):
        """decode_token should return the original data"""
        data = {"sub": "test_user", "type": "company", "name": "Test"}
        token = create_token(data)
        decoded = decode_token(token)

        assert decoded["sub"] == data["sub"]
        assert decoded["type"] == data["type"]
        assert decoded["name"] == data["name"]
        assert "exp" in decoded  # Expiration should be added

    def test_decode_token_invalid(self):
        """decode_token should raise exception for invalid token"""
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            decode_token("invalid.token.here")

        assert exc_info.value.status_code == 401

    def test_decode_token_expired(self):
        """decode_token should raise exception for expired token"""
        from datetime import timedelta
        from fastapi import HTTPException

        # Create a token that's already expired
        data = {"sub": "test_user", "type": "company"}
        token = create_token(data, expires_delta=timedelta(seconds=-1))

        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)

        assert exc_info.value.status_code == 401


class TestAPIKey:
    """Tests for API key generation"""

    def test_generate_api_key_length(self):
        """API keys should be 43 characters (32 bytes base64)"""
        key = generate_api_key()
        assert len(key) == 43  # URL-safe base64 of 32 bytes

    def test_generate_api_key_unique(self):
        """Each API key should be unique"""
        keys = [generate_api_key() for _ in range(100)]
        assert len(set(keys)) == 100  # All unique


class TestSecurityIntegration:
    """Integration tests for security features"""

    def test_password_roundtrip(self):
        """Full password hash and verify cycle"""
        passwords = [
            "simple",
            "Complex123!@#",
            "unicode_テスト",
            "spaces in password",
            "a" * 100,  # Long password
        ]

        for password in passwords:
            hashed = hash_password(password)
            assert verify_password(password, hashed) is True
            assert verify_password(password + "x", hashed) is False

    def test_token_roundtrip(self):
        """Full token create and decode cycle"""
        test_cases = [
            {"sub": "company_1", "type": "company", "name": "Test AB"},
            {"sub": "admin", "type": "super_admin"},
            {"sub": "user_with_unicode_åäö", "type": "company", "name": "Företag"},
        ]

        for data in test_cases:
            token = create_token(data)
            decoded = decode_token(token)

            for key, value in data.items():
                assert decoded[key] == value
