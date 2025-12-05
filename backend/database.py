"""
Bobot Database - SQLite/PostgreSQL med SQLAlchemy
GDPR-compliant med anonymiserad statistik
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Date, Index, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.pool import QueuePool
from datetime import datetime
import os

# =============================================================================
# Database Configuration
# =============================================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bobot.db")

def get_engine_config():
    """Get database engine configuration based on database type"""
    if DATABASE_URL.startswith("sqlite"):
        # SQLite configuration
        return {
            "connect_args": {"check_same_thread": False},
        }
    elif DATABASE_URL.startswith("postgresql"):
        # PostgreSQL configuration with connection pooling
        return {
            "poolclass": QueuePool,
            "pool_size": int(os.getenv("DB_POOL_SIZE", "5")),
            "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),
            "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
            "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),  # 30 minutes
            "pool_pre_ping": True,  # Verify connections before using
        }
    else:
        # Generic database
        return {}


engine = create_engine(DATABASE_URL, **get_engine_config())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Log database type
db_type = "PostgreSQL" if DATABASE_URL.startswith("postgresql") else "SQLite"
if os.getenv("ENVIRONMENT", "development") != "production":
    print(f"[Database] Using {db_type}")


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

    # Pricing & Billing
    pricing_tier = Column(String, default="starter")  # starter, professional, business, enterprise
    startup_fee_paid = Column(Boolean, default=False)
    contract_start_date = Column(Date)  # When subscription started
    billing_email = Column(String, default="")  # Separate billing contact

    # Discounts
    discount_percent = Column(Float, default=0)  # Percentage discount (0-100)
    discount_end_date = Column(Date)  # When discount expires (null = permanent)
    discount_note = Column(String, default="")  # Reason for discount

    # Self-hosting
    is_self_hosted = Column(Boolean, default=False)  # Whether self-hosting is enabled
    self_host_license_key = Column(String, unique=True, nullable=True)  # Unique license key
    self_host_activated_at = Column(DateTime, nullable=True)  # When self-hosting was activated
    self_host_license_valid_until = Column(DateTime, nullable=True)  # License expiry for validation
    self_host_last_validated = Column(DateTime, nullable=True)  # Last successful validation

    # Relations
    knowledge_items = relationship("KnowledgeItem", back_populates="company", cascade="all, delete-orphan")
    chat_logs = relationship("ChatLog", back_populates="company", cascade="all, delete-orphan")
    settings = relationship("CompanySettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="company", cascade="all, delete-orphan")
    statistics = relationship("DailyStatistics", back_populates="company", cascade="all, delete-orphan")
    widgets = relationship("Widget", back_populates="company", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="company", cascade="all, delete-orphan")


class Widget(Base):
    """Individual widget instance for a company (internal/external use cases)"""
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    widget_key = Column(String, unique=True, nullable=False, index=True)  # Unique identifier for API calls

    # Widget identity
    name = Column(String, nullable=False)  # Internal name (e.g., "Kundchat", "Internchatt")
    widget_type = Column(String, default="external")  # external, internal, custom
    description = Column(Text, default="")  # Optional description

    # Per-widget contact info (displayed in fallback messages)
    display_name = Column(String, default="")  # Name shown in widget header
    contact_email = Column(String, default="")
    contact_phone = Column(String, default="")

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Widget-specific appearance
    primary_color = Column(String, default="#D97757")
    secondary_color = Column(String, default="#FEF3EC")  # AI message background
    background_color = Column(String, default="#FAF8F5")  # Widget background
    widget_font_family = Column(String, default="Inter")
    widget_font_size = Column(Integer, default=14)
    widget_border_radius = Column(Integer, default=16)
    widget_position = Column(String, default="bottom-right")  # bottom-right, bottom-left

    # Widget-specific messages
    welcome_message = Column(Text, default="Hej! Hur kan jag hjälpa dig idag?")
    fallback_message = Column(Text, default="Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.")
    subtitle = Column(String, default="Alltid redo att hjälpa")

    # Widget-specific settings
    language = Column(String, default="sv")  # sv, en, ar
    tone = Column(String, default="")  # professional, collegial, casual - empty means use widget_type default
    start_expanded = Column(Boolean, default=False)  # Start widget open instead of as floating button
    suggested_questions = Column(Text, default="")  # JSON array

    # GDPR/Consent for this widget
    require_consent = Column(Boolean, default=True)
    consent_text = Column(Text, default="Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn.")

    # Relations
    company = relationship("Company", back_populates="widgets")
    knowledge_items = relationship("KnowledgeItem", back_populates="widget")
    conversations = relationship("Conversation", back_populates="widget")

    # Composite index
    __table_args__ = (
        Index('ix_widget_company_type', 'company_id', 'widget_type'),
    )


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

    # Widget Typography & Style
    widget_font_family = Column(String, default="Inter")  # Main font family
    widget_font_size = Column(Integer, default=14)  # Base font size in pixels
    widget_border_radius = Column(Integer, default=16)  # Border radius in pixels
    widget_position = Column(String, default="bottom-right")  # bottom-right, bottom-left

    # Quick Reply Suggestions (JSON array: ["Hur betalar jag hyran?", "Felanmälan", ...])
    suggested_questions = Column(Text, default="")  # Up to 4 suggested questions

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

    # Extra settings for announcement read tracking and other flexible storage
    extra_settings = Column(JSON, default=dict)  # {"read_announcement_id": "..."}

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="settings")


class KnowledgeItem(Base):
    """Fråga/svar i kunskapsbasen"""
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    widget_id = Column(Integer, ForeignKey("widgets.id"), nullable=True, index=True)  # Null = available to all widgets
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, default="", index=True)  # Kategori för filtrering
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="knowledge_items")
    widget = relationship("Widget", back_populates="knowledge_items")

    # Composite index for common queries
    __table_args__ = (
        Index('ix_knowledge_company_category', 'company_id', 'category'),
        Index('ix_knowledge_widget', 'widget_id'),
    )


class Category(Base):
    """Kategorier för kunskapsbasen"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    company = relationship("Company", back_populates="categories")

    __table_args__ = (
        Index('ix_category_company_name', 'company_id', 'name', unique=True),
    )


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
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    widget_id = Column(Integer, ForeignKey("widgets.id"), nullable=True, index=True)  # Which widget was used
    session_id = Column(String, index=True)  # För att gruppera meddelanden från samma session
    reference_id = Column(String, index=True)  # Short readable ID (e.g., "BOB-A1B2")

    # Anonymiserad användardata (GDPR)
    user_ip_anonymous = Column(String)  # Endast första 3 oktetter, t.ex. "192.168.1.xxx"
    user_agent_anonymous = Column(String)  # Endast webbläsare/enhet, inga fingerprints

    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at = Column(DateTime)

    # Metadata
    message_count = Column(Integer, default=0)
    was_helpful = Column(Boolean)  # Feedback från användaren
    category = Column(String, default="allmant", index=True)  # Auto-detected category
    language = Column(String, default="sv", index=True)  # Detected/provided language

    # GDPR/PuB Consent tracking
    consent_given = Column(Boolean, default=False)  # User gave consent
    consent_timestamp = Column(DateTime)  # When consent was given

    # Relations
    company = relationship("Company", back_populates="conversations")
    widget = relationship("Widget", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_conversation_company_started', 'company_id', 'started_at'),
        Index('ix_conversation_company_category', 'company_id', 'category'),
        Index('ix_conversation_widget', 'widget_id'),
    )


class Message(Base):
    """Ett meddelande i en konversation"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)

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
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
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

    # Composite index for analytics queries
    __table_args__ = (
        Index('ix_daily_stats_company_date', 'company_id', 'date'),
    )


class SuperAdmin(Base):
    """Super admin för att hantera alla företag"""
    __tablename__ = "super_admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Two-factor authentication
    totp_secret = Column(String)  # Base32 encoded TOTP secret
    totp_enabled = Column(Boolean, default=False)
    backup_codes = Column(Text)  # JSON array of hashed backup codes

    # Session management
    last_login = Column(DateTime)
    last_login_ip = Column(String)

    # Preferences
    dark_mode = Column(Boolean, default=False)  # Dark mode preference


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
    admin_username = Column(String, nullable=False, index=True)

    # Action details
    action_type = Column(String, nullable=False, index=True)  # "create_company", "delete_company", "toggle_company", "impersonate", "export_data", etc.
    target_company_id = Column(String, index=True)  # Which company was affected
    description = Column(Text)  # Human-readable description
    details = Column(Text)  # JSON with additional details

    # Metadata
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class CompanyActivityLog(Base):
    """Activity log for company admin actions - retained for 12 months"""
    __tablename__ = "company_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)

    # Action details
    action_type = Column(String, nullable=False, index=True)  # "knowledge_create", "knowledge_update", "knowledge_delete", "settings_update", "conversation_delete", "export_data"
    description = Column(Text)  # Human-readable description
    details = Column(Text)  # JSON with additional details (e.g., which item was affected)

    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Composite index for common queries
    __table_args__ = (
        Index('ix_company_activity_company_timestamp', 'company_id', 'timestamp'),
    )


class GlobalSettings(Base):
    """Global system settings"""
    __tablename__ = "global_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String)  # Admin username


class Announcement(Base):
    """Announcements from super admin to companies"""
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, warning, maintenance
    target_company_id = Column(String, ForeignKey("companies.id"), nullable=True)  # NULL = all companies
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String)  # Admin username
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration

    # Relationships
    target_company = relationship("Company", foreign_keys=[target_company_id])
    reads = relationship("AnnouncementRead", back_populates="announcement", cascade="all, delete-orphan")


class AnnouncementRead(Base):
    """Tracks which companies have read which announcements"""
    __tablename__ = "announcement_reads"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    read_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    announcement = relationship("Announcement", back_populates="reads")

    # Unique constraint to prevent duplicate reads
    __table_args__ = (
        Index('ix_announcement_read_unique', 'announcement_id', 'company_id', unique=True),
    )


class Subscription(Base):
    """Billing subscription for a company"""
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), unique=True, nullable=False)

    # Plan details
    plan_name = Column(String, default="free")  # free, starter, professional, enterprise
    plan_price = Column(Float, default=0)  # Monthly price in SEK
    billing_cycle = Column(String, default="monthly")  # monthly, yearly

    # Status
    status = Column(String, default="active")  # active, cancelled, past_due, trialing
    trial_ends_at = Column(DateTime)
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)

    # Features included (JSON: {"max_conversations": 1000, "max_knowledge": 500, ...})
    plan_features = Column(Text, default="{}")

    # Stripe/Payment IDs (for future integration)
    external_customer_id = Column(String)
    external_subscription_id = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Invoice(Base):
    """Invoice history for billing"""
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    invoice_number = Column(String, unique=True, nullable=False)

    # Invoice details
    amount = Column(Float, nullable=False)
    currency = Column(String, default="SEK")
    description = Column(Text)
    period_start = Column(Date)
    period_end = Column(Date)

    # Status
    status = Column(String, default="pending")  # pending, paid, overdue, cancelled
    due_date = Column(Date)
    paid_at = Column(DateTime)

    # Payment details
    payment_method = Column(String)  # card, invoice, bank_transfer
    external_invoice_id = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)


class CompanyNote(Base):
    """Internal admin notes about a company"""
    __tablename__ = "company_notes"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)

    content = Column(Text, nullable=False)
    created_by = Column(String, nullable=False)  # Admin username
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_pinned = Column(Boolean, default=False)


class CompanyDocument(Base):
    """Documents uploaded for a company (contracts, agreements, etc.)"""
    __tablename__ = "company_documents"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)

    # File info
    filename = Column(String, nullable=False)  # Original filename
    file_type = Column(String, nullable=False)  # MIME type
    file_size = Column(Integer, nullable=False)  # Size in bytes
    file_data = Column(Text, nullable=False)  # Base64 encoded file content

    # Metadata
    document_type = Column(String, default="other")  # agreement, contract, invoice, other
    description = Column(Text, default="")
    uploaded_by = Column(String, nullable=False)  # Admin username
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Composite index
    __table_args__ = (
        Index('ix_company_document_company_type', 'company_id', 'document_type'),
    )


class WidgetPerformance(Base):
    """Hourly performance stats for widget monitoring"""
    __tablename__ = "widget_performance"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    hour = Column(DateTime, nullable=False)  # Rounded to hour

    # Request counts
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    failed_requests = Column(Integer, default=0)
    rate_limited_requests = Column(Integer, default=0)

    # Response times (ms)
    avg_response_time = Column(Float, default=0)
    min_response_time = Column(Integer, default=0)
    max_response_time = Column(Integer, default=0)
    p95_response_time = Column(Integer, default=0)

    # Error breakdown (JSON: {"timeout": 5, "ollama_error": 2, ...})
    error_counts = Column(Text, default="{}")


class EmailNotificationQueue(Base):
    """Queue for email notifications"""
    __tablename__ = "email_notification_queue"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"))

    # Notification details
    notification_type = Column(String, nullable=False)  # usage_warning_80, usage_warning_90, usage_limit_reached
    recipient_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)

    # Status
    status = Column(String, default="pending")  # pending, sent, failed
    scheduled_for = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime)
    error_message = Column(Text)

    # Prevent duplicate notifications
    notification_key = Column(String, unique=True)  # e.g., "usage_80_company_id_2024_01"

    created_at = Column(DateTime, default=datetime.utcnow)


class PageView(Base):
    """Page view tracking for landing pages and external sites"""
    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True)

    # Page identification
    page_url = Column(String, nullable=False, index=True)  # URL of the page
    page_name = Column(String, default="")  # Friendly name (e.g., "Landing Page", "Pricing")

    # Visit metadata (anonymized for GDPR)
    visitor_id = Column(String, index=True)  # Hashed anonymous identifier
    ip_anonymous = Column(String)  # First 3 octets only
    user_agent = Column(String)  # Browser/device info
    referrer = Column(String)  # Where they came from

    # Device & location hints
    device_type = Column(String)  # desktop, mobile, tablet
    country_code = Column(String)  # Optional geo lookup (2-letter code)

    # Session tracking
    session_id = Column(String, index=True)  # To group page views in a session
    is_bounce = Column(Boolean, default=True)  # Did they leave immediately?
    time_on_page_seconds = Column(Integer)  # How long they stayed

    # UTM parameters for campaign tracking
    utm_source = Column(String)
    utm_medium = Column(String)
    utm_campaign = Column(String)
    utm_content = Column(String)
    utm_term = Column(String)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Composite indexes for analytics queries
    __table_args__ = (
        Index('ix_pageview_url_date', 'page_url', 'created_at'),
        Index('ix_pageview_session', 'session_id'),
    )


class DailyPageStats(Base):
    """Aggregated daily stats for page views - GDPR-safe retention"""
    __tablename__ = "daily_page_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    page_url = Column(String, nullable=False, index=True)
    page_name = Column(String, default="")

    # Visitor counts
    total_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)

    # Engagement
    avg_time_on_page = Column(Float, default=0)  # seconds
    bounce_rate = Column(Float, default=0)  # percentage

    # Device breakdown (JSON: {"desktop": 50, "mobile": 45, "tablet": 5})
    device_breakdown = Column(Text, default="{}")

    # Top referrers (JSON: {"google.com": 20, "direct": 15, ...})
    referrer_breakdown = Column(Text, default="{}")

    # UTM campaign breakdown (JSON: {"summer_sale": 10, ...})
    campaign_breakdown = Column(Text, default="{}")

    # Hourly distribution (JSON: {"9": 5, "10": 8, ...})
    hourly_breakdown = Column(Text, default="{}")

    # Composite index
    __table_args__ = (
        Index('ix_daily_page_stats_date_url', 'date', 'page_url'),
    )


class RoadmapItem(Base):
    """Roadmap items for upcoming features - editable by super admin"""
    __tablename__ = "roadmap_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    quarter = Column(String, nullable=False)  # e.g., "Q1 2026", "Q2 2026"
    status = Column(String, default="planned")  # planned, in_progress, completed, cancelled
    display_order = Column(Integer, default=0)  # For custom ordering
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PricingTier(Base):
    """Pricing tiers - editable by super admin"""
    __tablename__ = "pricing_tiers"

    id = Column(Integer, primary_key=True, index=True)
    tier_key = Column(String, unique=True, nullable=False)  # starter, professional, business, enterprise
    name = Column(String, nullable=False)  # Display name
    monthly_fee = Column(Float, default=0)  # Monthly fee in SEK
    startup_fee = Column(Float, default=0)  # One-time startup fee in SEK
    max_conversations = Column(Integer, default=0)  # 0 = unlimited
    max_knowledge_items = Column(Integer, default=0)  # 0 = unlimited
    features = Column(Text, default="[]")  # JSON array of feature descriptions
    is_active = Column(Boolean, default=True)  # Can be disabled
    display_order = Column(Integer, default=0)  # For custom ordering
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# =============================================================================
# Database Functions
# =============================================================================

def create_tables():
    """Skapa alla tabeller"""
    Base.metadata.create_all(bind=engine)


def run_migrations():
    """Run database migrations for new columns on existing tables"""
    from sqlalchemy import text, inspect

    with engine.connect() as conn:
        inspector = inspect(engine)

        # Check if widgets table exists
        if 'widgets' in inspector.get_table_names():
            existing_columns = [col['name'] for col in inspector.get_columns('widgets')]

            # Add tone column if missing
            if 'tone' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN tone VARCHAR DEFAULT ''"))
                print("[Migration] Added 'tone' column to widgets table")

            # Add secondary_color column if missing
            if 'secondary_color' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN secondary_color VARCHAR DEFAULT '#FEF3EC'"))
                print("[Migration] Added 'secondary_color' column to widgets table")

            # Add background_color column if missing
            if 'background_color' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN background_color VARCHAR DEFAULT '#FAF8F5'"))
                print("[Migration] Added 'background_color' column to widgets table")

            # Add start_expanded column if missing
            if 'start_expanded' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN start_expanded BOOLEAN DEFAULT 0"))
                print("[Migration] Added 'start_expanded' column to widgets table")

            # Add widget_font_family column if missing
            if 'widget_font_family' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN widget_font_family VARCHAR DEFAULT 'Inter'"))
                print("[Migration] Added 'widget_font_family' column to widgets table")

            # Add widget_font_size column if missing
            if 'widget_font_size' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN widget_font_size INTEGER DEFAULT 14"))
                print("[Migration] Added 'widget_font_size' column to widgets table")

            # Add widget_border_radius column if missing
            if 'widget_border_radius' not in existing_columns:
                conn.execute(text("ALTER TABLE widgets ADD COLUMN widget_border_radius INTEGER DEFAULT 16"))
                print("[Migration] Added 'widget_border_radius' column to widgets table")

            conn.commit()

        # Migrate super_admins table (2FA columns)
        if 'super_admins' in inspector.get_table_names():
            admin_columns = [col['name'] for col in inspector.get_columns('super_admins')]

            if 'totp_secret' not in admin_columns:
                conn.execute(text("ALTER TABLE super_admins ADD COLUMN totp_secret VARCHAR"))
                print("[Migration] Added 'totp_secret' column to super_admins table")

            if 'totp_enabled' not in admin_columns:
                conn.execute(text("ALTER TABLE super_admins ADD COLUMN totp_enabled BOOLEAN DEFAULT 0"))
                print("[Migration] Added 'totp_enabled' column to super_admins table")

            if 'backup_codes' not in admin_columns:
                conn.execute(text("ALTER TABLE super_admins ADD COLUMN backup_codes TEXT"))
                print("[Migration] Added 'backup_codes' column to super_admins table")

            if 'last_login' not in admin_columns:
                conn.execute(text("ALTER TABLE super_admins ADD COLUMN last_login DATETIME"))
                print("[Migration] Added 'last_login' column to super_admins table")

            if 'last_login_ip' not in admin_columns:
                conn.execute(text("ALTER TABLE super_admins ADD COLUMN last_login_ip VARCHAR"))
                print("[Migration] Added 'last_login_ip' column to super_admins table")

            if 'dark_mode' not in admin_columns:
                conn.execute(text("ALTER TABLE super_admins ADD COLUMN dark_mode BOOLEAN DEFAULT 0"))
                print("[Migration] Added 'dark_mode' column to super_admins table")

            conn.commit()

        # Migrate companies table (self-hosting columns)
        if 'companies' in inspector.get_table_names():
            company_columns = [col['name'] for col in inspector.get_columns('companies')]

            if 'is_self_hosted' not in company_columns:
                conn.execute(text("ALTER TABLE companies ADD COLUMN is_self_hosted BOOLEAN DEFAULT 0"))
                print("[Migration] Added 'is_self_hosted' column to companies table")

            if 'self_host_license_key' not in company_columns:
                conn.execute(text("ALTER TABLE companies ADD COLUMN self_host_license_key VARCHAR UNIQUE"))
                print("[Migration] Added 'self_host_license_key' column to companies table")

            if 'self_host_activated_at' not in company_columns:
                conn.execute(text("ALTER TABLE companies ADD COLUMN self_host_activated_at DATETIME"))
                print("[Migration] Added 'self_host_activated_at' column to companies table")

            if 'self_host_license_valid_until' not in company_columns:
                conn.execute(text("ALTER TABLE companies ADD COLUMN self_host_license_valid_until DATETIME"))
                print("[Migration] Added 'self_host_license_valid_until' column to companies table")

            if 'self_host_last_validated' not in company_columns:
                conn.execute(text("ALTER TABLE companies ADD COLUMN self_host_last_validated DATETIME"))
                print("[Migration] Added 'self_host_last_validated' column to companies table")

            conn.commit()

        # Fix orphaned knowledge items (widget_id is NULL) by assigning to external widget
        # This prevents knowledge from being "shared" across widgets unintentionally
        if 'knowledge_items' in inspector.get_table_names() and 'widgets' in inspector.get_table_names():
            # Find knowledge items with NULL widget_id
            orphaned = conn.execute(text(
                "SELECT DISTINCT company_id FROM knowledge_items WHERE widget_id IS NULL"
            )).fetchall()

            for row in orphaned:
                company_id = row[0]
                # Find the first external widget for this company
                external_widget = conn.execute(text(
                    "SELECT id FROM widgets WHERE company_id = :cid AND widget_type = 'external' LIMIT 1"
                ), {"cid": company_id}).fetchone()

                if external_widget:
                    widget_id = external_widget[0]
                    result = conn.execute(text(
                        "UPDATE knowledge_items SET widget_id = :wid WHERE company_id = :cid AND widget_id IS NULL"
                    ), {"wid": widget_id, "cid": company_id})
                    if result.rowcount > 0:
                        print(f"[Migration] Assigned {result.rowcount} orphaned knowledge items to external widget for company '{company_id}'")

            conn.commit()


def get_db():
    """Dependency för att få databas-session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
