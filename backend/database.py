"""
Bobot Database - SQLite med SQLAlchemy
GDPR-compliant med anonymiserad statistik
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Date
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
    settings = relationship("CompanySettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="company", cascade="all, delete-orphan")
    statistics = relationship("DailyStatistics", back_populates="company", cascade="all, delete-orphan")


class CompanySettings(Base):
    """Inställningar för ett företag"""
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), unique=True, nullable=False)

    # Företagsinformation
    company_name = Column(String, default="")
    contact_email = Column(String, default="")
    contact_phone = Column(String, default="")

    # Chatbot-meddelanden
    welcome_message = Column(Text, default="Hej! Hur kan jag hjälpa dig idag?")
    fallback_message = Column(Text, default="Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.")
    subtitle = Column(String, default="Alltid redo att hjälpa")  # Widget subtitle/slogan

    # Utseende & Språk
    primary_color = Column(String, default="#D97757")
    language = Column(String, default="sv")  # sv, en, ar

    # Custom categories (JSON array: [{"value": "hyra", "label": "Hyra & Betalning"}, ...])
    custom_categories = Column(Text, default="")

    # GDPR - Datalagring
    data_retention_days = Column(Integer, default=30)  # Antal dagar att spara konversationer

    # Notifieringar
    notify_unanswered = Column(Boolean, default=False)  # Skicka notis vid obesvarade frågor
    notification_email = Column(String, default="")  # E-post för notifieringar

    # PuB/GDPR Compliance
    privacy_policy_url = Column(String, default="")  # Link to privacy policy
    require_consent = Column(Boolean, default=True)  # Require consent before chat
    consent_text = Column(Text, default="Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn.")
    data_controller_name = Column(String, default="")  # Name of data controller (PuB)
    data_controller_email = Column(String, default="")  # DPO/privacy contact email

    # Usage Limits
    max_conversations_month = Column(Integer, default=0)  # 0 = unlimited
    current_month_conversations = Column(Integer, default=0)
    max_knowledge_items = Column(Integer, default=0)  # 0 = unlimited
    usage_reset_date = Column(Date)  # When to reset monthly counter
    limit_warning_sent = Column(Boolean, default=False)  # Track if warning was sent

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="settings")


class KnowledgeItem(Base):
    """Fråga/svar i kunskapsbasen"""
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, default="")  # Kategori för filtrering
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="knowledge_items")


class ChatLog(Base):
    """Logg av chattfrågor för statistik (legacy, behålls för bakåtkompatibilitet)"""
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="chat_logs")


class Conversation(Base):
    """En konversation/chatt-session"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    session_id = Column(String, index=True)  # För att gruppera meddelanden från samma session
    reference_id = Column(String, index=True)  # Short readable ID (e.g., "BOB-A1B2")

    # Anonymiserad användardata (GDPR)
    user_ip_anonymous = Column(String)  # Endast första 3 oktetter, t.ex. "192.168.1.xxx"
    user_agent_anonymous = Column(String)  # Endast webbläsare/enhet, inga fingerprints

    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)

    # Metadata
    message_count = Column(Integer, default=0)
    was_helpful = Column(Boolean)  # Feedback från användaren
    category = Column(String, default="allmant")  # Auto-detected category
    language = Column(String, default="sv")  # Detected/provided language

    # GDPR/PuB Consent tracking
    consent_given = Column(Boolean, default=False)  # User gave consent
    consent_timestamp = Column(DateTime)  # When consent was given

    # Relations
    company = relationship("Company", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Ett meddelande i en konversation"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)

    role = Column(String, nullable=False)  # "user" eller "bot"
    content = Column(Text, nullable=False)

    # Metadata för bot-svar
    sources = Column(Text)  # JSON-lista med källor
    had_answer = Column(Boolean, default=True)  # Om boten kunde svara
    response_time_ms = Column(Integer)  # Svarstid i millisekunder

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    conversation = relationship("Conversation", back_populates="messages")


class DailyStatistics(Base):
    """Daglig anonymiserad statistik - behålls även efter konversationer raderas"""
    __tablename__ = "daily_statistics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)

    # Konversationsstatistik
    total_conversations = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)

    # Frågestatistik
    questions_answered = Column(Integer, default=0)
    questions_unanswered = Column(Integer, default=0)

    # Prestandastatistik
    avg_response_time_ms = Column(Float, default=0)

    # Kategoristatistik (JSON-format: {"hyra": 5, "felanmalan": 3})
    category_counts = Column(Text, default="{}")

    # Language statistics (JSON-format: {"sv": 10, "en": 5, "ar": 2})
    language_counts = Column(Text, default="{}")

    # Hourly distribution (JSON-format: {"9": 5, "10": 8, ...})
    hourly_counts = Column(Text, default="{}")

    # Feedback
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)

    # Relations
    company = relationship("Company", back_populates="statistics")

    class Meta:
        unique_together = ('company_id', 'date')


class SuperAdmin(Base):
    """Super admin för att hantera alla företag"""
    __tablename__ = "super_admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class GDPRAuditLog(Base):
    """Audit log for GDPR/PuB compliance - records data processing activities"""
    __tablename__ = "gdpr_audit_log"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)

    # Action details
    action_type = Column(String, nullable=False)  # "data_access", "data_deletion", "consent_given", "data_export"
    session_id = Column(String)  # Related session if applicable
    description = Column(Text)  # Human-readable description

    # Request metadata (anonymized)
    requester_ip_anonymous = Column(String)  # Anonymized IP
    request_timestamp = Column(DateTime, default=datetime.utcnow)

    # Outcome
    success = Column(Boolean, default=True)
    error_message = Column(Text)


class AdminAuditLog(Base):
    """Audit log for super admin actions"""
    __tablename__ = "admin_audit_log"

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String, nullable=False)

    # Action details
    action_type = Column(String, nullable=False)  # "create_company", "delete_company", "toggle_company", "impersonate", "export_data", etc.
    target_company_id = Column(String)  # Which company was affected
    description = Column(Text)  # Human-readable description
    details = Column(Text)  # JSON with additional details

    # Metadata
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)


class CompanyActivityLog(Base):
    """Activity log for company admin actions - retained for 12 months"""
    __tablename__ = "company_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)

    # Action details
    action_type = Column(String, nullable=False)  # "knowledge_create", "knowledge_update", "knowledge_delete", "settings_update", "conversation_delete", "export_data"
    description = Column(Text)  # Human-readable description
    details = Column(Text)  # JSON with additional details (e.g., which item was affected)

    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow)


class GlobalSettings(Base):
    """Global system settings"""
    __tablename__ = "global_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String)  # Admin username


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
