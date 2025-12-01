"""
Bobot Database - SQLite med SQLAlchemy
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bobot.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# =============================================================================
# Database Models
# =============================================================================

class Company(Base):
    """Företag/kund som använder Bobot"""
    __tablename__ = "companies"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relations
    knowledge_items = relationship("KnowledgeItem", back_populates="company", cascade="all, delete-orphan")
    chat_logs = relationship("ChatLog", back_populates="company", cascade="all, delete-orphan")


class KnowledgeItem(Base):
    """Fråga/svar i kunskapsbasen"""
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="knowledge_items")


class ChatLog(Base):
    """Logg av chattfrågor för statistik"""
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="chat_logs")


class SuperAdmin(Base):
    """Super admin för att hantera alla företag"""
    __tablename__ = "super_admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# =============================================================================
# Database Functions
# =============================================================================

def create_tables():
    """Skapa alla tabeller"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency för att få databas-session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
