"""
Bobot Authentication - JWT tokens och lösenordshantering
Security hardened with bcrypt and secure configuration
"""

from datetime import datetime, timedelta
from typing import Optional
import secrets
import jwt
import bcrypt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import sys

# =============================================================================
# Security Configuration
# =============================================================================

def get_secret_key() -> str:
    """Get SECRET_KEY from environment - REQUIRED in production"""
    key = os.getenv("SECRET_KEY")

    # Check for default insecure key
    if key == "bobot-super-secret-key-change-in-production":
        if os.getenv("ENVIRONMENT", "development") == "production":
            print("ERROR: Default SECRET_KEY detected in production!", file=sys.stderr)
            print("Please set a unique SECRET_KEY environment variable.", file=sys.stderr)
            sys.exit(1)
        else:
            print("WARNING: Using default SECRET_KEY - NOT for production use!", file=sys.stderr)

    if not key:
        if os.getenv("ENVIRONMENT", "development") == "production":
            print("ERROR: SECRET_KEY not set in production!", file=sys.stderr)
            print("Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\"", file=sys.stderr)
            sys.exit(1)
        else:
            # Development fallback - still warn
            print("WARNING: No SECRET_KEY set, using insecure default.", file=sys.stderr)
            key = "dev-only-insecure-key-do-not-use-in-production"

    return key


SECRET_KEY = get_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


# =============================================================================
# Password Hashing (bcrypt)
# =============================================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt with automatic salt generation"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)  # Cost factor 12 (~250ms on modern hardware)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a bcrypt hash.
    Also supports legacy SHA256 hashes for migration."""
    try:
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except (ValueError, TypeError):
        # Not a valid bcrypt hash - try legacy SHA256 verification
        return verify_legacy_password(password, hashed)


def verify_legacy_password(password: str, hashed: str) -> bool:
    """Verify password against legacy SHA256 hash (for migration)"""
    import hashlib
    salt = "bobot_salt_"
    legacy_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return legacy_hash == hashed


def is_bcrypt_hash(hashed: str) -> bool:
    """Check if a hash is bcrypt format (starts with $2b$, $2a$, or $2y$)"""
    return hashed.startswith(('$2b$', '$2a$', '$2y$'))


def needs_rehash(hashed: str) -> bool:
    """Check if a hash needs to be upgraded to bcrypt"""
    return not is_bcrypt_hash(hashed)


# =============================================================================
# JWT Token
# =============================================================================

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_2fa_pending_token(data: dict) -> str:
    """Create a short-lived token for 2FA verification (5 minutes)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=5)
    to_encode.update({
        "exp": expire,
        "pending_2fa": True  # Mark as pending 2FA verification
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token har gått ut")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Ogiltig token")


# =============================================================================
# Dependencies
# =============================================================================

def get_current_company(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current company from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "company":
        raise HTTPException(status_code=403, detail="Inte behörig")

    return {
        "company_id": payload.get("sub"),
        "name": payload.get("name")
    }


def get_super_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify user is super admin"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "super_admin":
        raise HTTPException(status_code=403, detail="Kräver super admin-behörighet")

    # Check for pending 2FA
    if payload.get("pending_2fa"):
        raise HTTPException(status_code=403, detail="2FA-verifiering krävs")

    return {
        "username": payload.get("sub")
    }


def get_2fa_pending_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get admin from 2FA pending token (for 2FA verification step)"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "super_admin":
        raise HTTPException(status_code=403, detail="Ogiltig token")

    if not payload.get("pending_2fa"):
        raise HTTPException(status_code=400, detail="Token är redan verifierad")

    return {
        "username": payload.get("sub")
    }


def generate_api_key() -> str:
    """Generate a random API key"""
    return secrets.token_urlsafe(32)


def generate_secret_key() -> str:
    """Generate a secure secret key for production use"""
    return secrets.token_urlsafe(64)
