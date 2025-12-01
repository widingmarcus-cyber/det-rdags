"""
Bobot Authentication - JWT tokens och lösenordshantering
"""

from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets
import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# Konfiguration
SECRET_KEY = os.getenv("SECRET_KEY", "bobot-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


# =============================================================================
# Lösenordshantering
# =============================================================================

def hash_password(password: str) -> str:
    """Hasha ett lösenord"""
    salt = "bobot_salt_"  # I produktion: använd bcrypt med slumpmässig salt
    return hashlib.sha256((salt + password).encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verifiera ett lösenord mot hash"""
    return hash_password(password) == hashed


# =============================================================================
# JWT Token
# =============================================================================

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Skapa en JWT-token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Dekoda och verifiera en JWT-token"""
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
    """Hämta aktuellt företag från JWT-token"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "company":
        raise HTTPException(status_code=403, detail="Inte behörig")

    return {
        "company_id": payload.get("sub"),
        "name": payload.get("name")
    }


def get_super_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verifiera att användaren är super admin"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "super_admin":
        raise HTTPException(status_code=403, detail="Kräver super admin-behörighet")

    return {
        "username": payload.get("sub")
    }


def generate_api_key() -> str:
    """Generera en slumpmässig API-nyckel"""
    return secrets.token_urlsafe(32)
