"""
Bobot Backend API
En GDPR-säker AI-chatbot för fastighetsbolag
"""

from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
import httpx
import os
import json
import asyncio
import uuid
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from database import (
    create_tables, get_db, Company, KnowledgeItem, ChatLog, SuperAdmin,
    CompanySettings, Conversation, Message, DailyStatistics, GDPRAuditLog,
    AdminAuditLog, GlobalSettings, CompanyActivityLog
)
from auth import (
    hash_password, verify_password, create_token,
    get_current_company, get_super_admin
)

load_dotenv()


# =============================================================================
# Lifespan & Scheduled Tasks
# =============================================================================

async def cleanup_old_conversations():
    """Rensa gamla konversationer baserat på retention-inställningar (GDPR)"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Hämta alla företag med deras retention-inställningar
        companies = db.query(Company).all()

        for company in companies:
            settings = db.query(CompanySettings).filter(
                CompanySettings.company_id == company.id
            ).first()

            retention_days = settings.data_retention_days if settings else 30
            cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

            # Hitta gamla konversationer
            old_conversations = db.query(Conversation).filter(
                and_(
                    Conversation.company_id == company.id,
                    Conversation.started_at < cutoff_date
                )
            ).all()

            for conv in old_conversations:
                # Spara statistik innan radering
                await save_conversation_stats(db, conv)

                # Radera konversation och meddelanden (cascade)
                db.delete(conv)

            if old_conversations:
                db.commit()
                print(f"[GDPR Cleanup] Raderade {len(old_conversations)} gamla konversationer för {company.id}")

    except Exception as e:
        print(f"[GDPR Cleanup Error] {e}")
        db.rollback()
    finally:
        db.close()


async def cleanup_old_activity_logs():
    """Clean up activity logs older than 12 months"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=365)

        # Clean company activity logs (12 months)
        deleted_company = db.query(CompanyActivityLog).filter(
            CompanyActivityLog.timestamp < cutoff_date
        ).delete()

        # Clean admin audit logs (12 months)
        deleted_admin = db.query(AdminAuditLog).filter(
            AdminAuditLog.timestamp < cutoff_date
        ).delete()

        if deleted_company or deleted_admin:
            db.commit()
            print(f"[Activity Log Cleanup] Raderade {deleted_company} företagsloggar, {deleted_admin} adminloggar")

    except Exception as e:
        print(f"[Activity Log Cleanup Error] {e}")
        db.rollback()
    finally:
        db.close()


async def scheduled_cleanup_task():
    """Kör cleanup varje timme"""
    while True:
        await asyncio.sleep(3600)  # Vänta 1 timme
        await cleanup_old_conversations()
        await cleanup_old_activity_logs()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup och shutdown events"""
    # Startup
    create_tables()
    init_demo_data()

    # Starta bakgrundsuppgift för cleanup
    cleanup_task = asyncio.create_task(scheduled_cleanup_task())
    print("[Startup] GDPR cleanup-task startad (körs varje timme)")

    yield

    # Shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Bobot API",
    description="AI-chatbot backend för fastighetsbolag",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama-konfiguration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")


# =============================================================================
# Pydantic Models
# =============================================================================

class LoginRequest(BaseModel):
    company_id: str
    password: str


class LoginResponse(BaseModel):
    token: str
    company_id: str
    name: str


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    language: Optional[str] = None  # Language code from widget (sv, en, ar)


class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    session_id: str
    conversation_id: str  # Short readable ID for user reference (e.g., "BOB-A1B2")
    had_answer: bool = True
    confidence: int = 100  # Confidence score 0-100


# Simple in-memory cache for responses
response_cache = {}
CACHE_TTL = 300  # 5 minutes


def get_cached_response(company_id: str, question: str):
    """Get cached response if available and not expired"""
    cache_key = f"{company_id}:{question.lower().strip()}"
    if cache_key in response_cache:
        cached, timestamp = response_cache[cache_key]
        if datetime.utcnow().timestamp() - timestamp < CACHE_TTL:
            return cached
        else:
            del response_cache[cache_key]
    return None


def set_cached_response(company_id: str, question: str, response: dict):
    """Cache a response"""
    cache_key = f"{company_id}:{question.lower().strip()}"
    response_cache[cache_key] = (response, datetime.utcnow().timestamp())
    # Clean old entries if cache gets too large
    if len(response_cache) > 1000:
        oldest_keys = sorted(response_cache.keys(), key=lambda k: response_cache[k][1])[:100]
        for k in oldest_keys:
            del response_cache[k]


class KnowledgeItemCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = ""


class KnowledgeItemResponse(BaseModel):
    id: int
    question: str
    answer: str
    category: str


class CompanyCreate(BaseModel):
    id: str
    name: str
    password: str


class CompanyResponse(BaseModel):
    id: str
    name: str
    is_active: bool
    created_at: datetime
    knowledge_count: int = 0
    chat_count: int = 0
    max_conversations_month: int = 0
    current_month_conversations: int = 0
    max_knowledge_items: int = 0


class SuperAdminLogin(BaseModel):
    username: str
    password: str


class StatsResponse(BaseModel):
    total_questions: int
    knowledge_items: int
    questions_today: int
    questions_this_week: int
    questions_this_month: int


class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    welcome_message: Optional[str] = None
    fallback_message: Optional[str] = None
    subtitle: Optional[str] = None
    primary_color: Optional[str] = None
    language: Optional[str] = None
    data_retention_days: Optional[int] = None
    notify_unanswered: Optional[bool] = None
    notification_email: Optional[str] = None
    custom_categories: Optional[str] = None  # JSON string
    # PuB/GDPR Compliance
    privacy_policy_url: Optional[str] = None
    require_consent: Optional[bool] = None
    consent_text: Optional[str] = None
    data_controller_name: Optional[str] = None
    data_controller_email: Optional[str] = None


class SettingsResponse(BaseModel):
    company_name: str
    contact_email: str
    contact_phone: str
    welcome_message: str
    fallback_message: str
    subtitle: str
    primary_color: str
    language: str
    data_retention_days: int
    notify_unanswered: bool
    notification_email: str
    custom_categories: str
    # PuB/GDPR Compliance
    privacy_policy_url: str
    require_consent: bool
    consent_text: str
    data_controller_name: str
    data_controller_email: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    sources: Optional[List[str]] = None
    had_answer: bool = True


class ConversationResponse(BaseModel):
    id: int
    session_id: str
    reference_id: str  # Short readable ID (e.g., "BOB-A1B2")
    started_at: datetime
    message_count: int
    was_helpful: Optional[bool] = None
    category: Optional[str] = None  # Auto-detected category
    language: Optional[str] = None  # Detected language
    messages: Optional[List[MessageResponse]] = None


class ConversationListResponse(BaseModel):
    id: int
    session_id: str
    reference_id: str  # Short readable ID
    started_at: datetime
    message_count: int
    was_helpful: Optional[bool] = None
    category: Optional[str] = None
    language: Optional[str] = None
    first_message: Optional[str] = None


class AnalyticsResponse(BaseModel):
    # Totals
    total_conversations: int
    total_messages: int
    total_answered: int
    total_unanswered: int

    # Today
    conversations_today: int
    messages_today: int

    # This week
    conversations_week: int
    messages_week: int

    # Performance
    avg_response_time_ms: float
    answer_rate: float  # Procent av frågor som kunde besvaras

    # Daily breakdown (senaste 30 dagarna)
    daily_stats: List[dict]

    # Category breakdown
    category_stats: dict

    # Language distribution
    language_stats: dict

    # Feedback breakdown
    feedback_stats: dict

    # Hourly distribution (0-23)
    hourly_stats: dict

    # Top unanswered questions
    top_unanswered: List[str]


# =============================================================================
# Init Functions
# =============================================================================

def init_demo_data():
    """Skapa demo-data vid start"""
    from database import SessionLocal
    db = SessionLocal()

    try:
        # Skapa super admin om den inte finns
        admin = db.query(SuperAdmin).filter(SuperAdmin.username == "admin").first()
        if not admin:
            admin = SuperAdmin(
                username="admin",
                password_hash=hash_password("admin123")
            )
            db.add(admin)
            db.commit()
            print("Super admin skapad: admin / admin123")

        # Skapa demo-företag om det inte finns
        demo = db.query(Company).filter(Company.id == "demo").first()
        if not demo:
            demo = Company(
                id="demo",
                name="Demo Fastigheter AB",
                password_hash=hash_password("demo123")
            )
            db.add(demo)
            db.commit()

            # Skapa standardinställningar för demo
            demo_settings = CompanySettings(
                company_id="demo",
                company_name="Demo Fastigheter AB",
                contact_email="info@demo.se",
                contact_phone="08-123 456 78"
            )
            db.add(demo_settings)

            # Lägg till demo-kunskapsbas med kategorier
            demo_items = [
                ("Hur säger jag upp min lägenhet?",
                 "För att säga upp din lägenhet behöver du skicka en skriftlig uppsägning till oss. Uppsägningstiden är vanligtvis 3 månader.",
                 "kontrakt"),
                ("Vad ingår i hyran?",
                 "I hyran ingår vanligtvis värme, vatten, sophämtning och tillgång till gemensamma utrymmen som tvättstuga.",
                 "hyra"),
                ("Hur anmäler jag ett fel i lägenheten?",
                 "Felanmälan görs via vår hemsida under 'Felanmälan' eller genom att ringa kundtjänst på 08-123 456 78.",
                 "felanmalan"),
                ("När är tvättstugan öppen?",
                 "Tvättstugan är öppen dygnet runt. Du bokar tvättid via bokningstavlan eller vår app.",
                 "tvattstuga"),
                ("Får jag ha husdjur?",
                 "Ja, husdjur är tillåtna så länge de inte stör grannar eller orsakar skada.",
                 "allmant"),
                ("Hur betalar jag hyran?",
                 "Hyran betalas via autogiro eller bankgiro. Du hittar betalningsinformation på din faktura.",
                 "hyra"),
                ("Var kan jag parkera?",
                 "Parkering finns tillgänglig i vårt garage. Kontakta kundtjänst för att hyra en parkeringsplats.",
                 "parkering"),
            ]

            for q, a, cat in demo_items:
                item = KnowledgeItem(company_id="demo", question=q, answer=a, category=cat)
                db.add(item)

            db.commit()
            print("Demo-företag skapat: demo / demo123")
    finally:
        db.close()


# =============================================================================
# Helper Functions
# =============================================================================

def normalize_text(text: str) -> str:
    """Remove punctuation and normalize text for matching"""
    import re
    # Remove punctuation, keep letters and numbers
    text = re.sub(r'[^\w\s]', '', text.lower())
    return text


def find_relevant_context(question: str, company_id: str, db: Session, top_k: int = 3) -> List[KnowledgeItem]:
    """Hitta relevanta frågor/svar från kunskapsbasen - fuzzy matching"""
    items = db.query(KnowledgeItem).filter(KnowledgeItem.company_id == company_id).all()

    question_normalized = normalize_text(question)
    question_words = set(question_normalized.split())

    # Common stopwords to ignore
    stopwords = {'jag', 'vill', 'kan', 'hur', 'vad', 'är', 'har', 'en', 'ett', 'att', 'och',
                 'för', 'med', 'om', 'på', 'av', 'i', 'det', 'den', 'de', 'du', 'vi', 'ni',
                 'göra', 'gör', 'ska', 'skulle', 'a', 'the', 'is', 'are', 'to', 'how', 'what'}

    # Get meaningful words (not stopwords)
    meaningful_words = question_words - stopwords

    scored_items = []
    for item in items:
        item_question_normalized = normalize_text(item.question)
        item_answer_normalized = normalize_text(item.answer)
        item_words = set(item_question_normalized.split()) | set(item_answer_normalized.split())

        score = 0

        # Exact word matches (high score)
        common_words = meaningful_words & item_words
        score += len(common_words) * 3

        # Partial/substring matches (medium score) - important for compound words
        for q_word in meaningful_words:
            if len(q_word) >= 4:  # Only check words with 4+ chars
                for i_word in item_words:
                    if len(i_word) >= 4:
                        # Check if one contains the other (handles "felanmälan" matching "felanmalan")
                        if q_word in i_word or i_word in q_word:
                            score += 2
                        # Check root similarity (first 4 chars match)
                        elif q_word[:4] == i_word[:4]:
                            score += 1

        # Category match bonus
        if item.category:
            if item.category.lower() in question_normalized:
                score += 2

        if score > 0:
            scored_items.append((score, item))

    scored_items.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in scored_items[:top_k]]


async def query_ollama(prompt: str) -> str:
    """Skicka fråga till Ollama"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
            return response.json().get("response", "Kunde inte generera svar.")
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Kan inte ansluta till Ollama")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


def detect_language(text: str) -> str:
    """Detect language of text based on common words and characters"""
    text_lower = text.lower()

    # Arabic detection - check for Arabic Unicode range
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
    if arabic_chars > len(text) * 0.3:
        return "ar"

    # Swedish-specific words
    swedish_words = ['jag', 'hur', 'vad', 'kan', 'har', 'är', 'och', 'att', 'det', 'en', 'ett',
                     'för', 'med', 'om', 'på', 'av', 'till', 'från', 'var', 'när', 'vill',
                     'hej', 'tack', 'hyra', 'lägenhet', 'felanmälan', 'bostaden', 'kontakt']

    # English-specific words
    english_words = ['the', 'is', 'are', 'what', 'how', 'can', 'you', 'i', 'my', 'have',
                     'do', 'does', 'would', 'could', 'should', 'will', 'want', 'need',
                     'hello', 'hi', 'thanks', 'please', 'help', 'rent', 'apartment', 'contact']

    words = text_lower.split()
    swedish_count = sum(1 for w in words if w in swedish_words)
    english_count = sum(1 for w in words if w in english_words)

    if english_count > swedish_count:
        return "en"
    return "sv"  # Default to Swedish


def get_language_instruction(lang: str) -> str:
    """Get language instruction for the AI prompt"""
    instructions = {
        "sv": "Du MÅSTE svara på SVENSKA. Svara alltid på svenska oavsett vad.",
        "en": "You MUST reply in ENGLISH. Always respond in English no matter what.",
        "ar": "يجب أن تجيب باللغة العربية. You MUST reply in ARABIC. Always respond in Arabic."
    }
    return instructions.get(lang, instructions["sv"])


def generate_reference_id() -> str:
    """Generate a short, readable conversation reference ID (e.g., BOB-A1B2)"""
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=4))
    return f"BOB-{suffix}"


def detect_category(text: str) -> str:
    """Auto-detect category based on message content using keywords"""
    text_lower = text.lower()

    # Category keywords mapping (Swedish and English)
    categories = {
        "hyra": ["hyra", "hyran", "betala", "faktura", "avgift", "rent", "payment", "fee", "invoice"],
        "felanmalan": ["fel", "trasig", "reparera", "laga", "fungerar inte", "broken", "repair", "fix", "damage", "felanmälan", "felanmalan"],
        "kontrakt": ["kontrakt", "uppsägning", "säga upp", "avtal", "flytta", "contract", "lease", "terminate", "move"],
        "tvattstuga": ["tvätt", "tvättstuga", "tvättid", "boka", "laundry", "washing", "book", "tvatt", "tvattstuga"],
        "parkering": ["parkering", "parkera", "garage", "bil", "parking", "car", "vehicle"],
        "kontakt": ["kontakt", "telefon", "email", "ring", "contact", "phone", "call", "reach"],
        "allmant": []  # Default category
    }

    # Count matches for each category
    scores = {}
    for category, keywords in categories.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score

    # Return category with highest score, or "allmant" if none match
    if scores:
        return max(scores, key=scores.get)
    return "allmant"


def build_prompt(question: str, context: List[KnowledgeItem], settings: CompanySettings = None, language: str = None, category: str = None) -> str:
    """Bygg prompt med kontext - använder specificerat eller detekterat språk"""
    # Use provided language or detect from question
    lang = language if language in ["sv", "en", "ar"] else detect_language(question)

    # Language names for the prompt
    lang_names = {"sv": "Swedish", "en": "English", "ar": "Arabic"}
    target_lang = lang_names.get(lang, "Swedish")

    company_name = settings.company_name if settings else "the company"

    # Build company facts section (bilingual labels for better matching)
    company_facts = []
    if settings:
        if settings.contact_email:
            company_facts.append(f"Email/E-post: {settings.contact_email}")
        if settings.contact_phone:
            company_facts.append(f"Phone/Telefon: {settings.contact_phone}")
        if settings.data_controller_name:
            gdpr_contact = f"GDPR-ansvarig (personuppgiftsansvarig/dataskyddsansvarig): {settings.data_controller_name}"
            if settings.data_controller_email:
                gdpr_contact += f" - email: {settings.data_controller_email}"
            company_facts.append(gdpr_contact)
        if settings.privacy_policy_url:
            company_facts.append(f"Integritetspolicy/Privacy policy: {settings.privacy_policy_url}")

    company_info = ""
    if company_facts:
        company_info = "Company information:\n" + "\n".join(f"- {fact}" for fact in company_facts)

    # Build knowledge base context
    knowledge = ""
    if context:
        knowledge = "Knowledge base (use this to answer):\n"
        for item in context:
            knowledge += f"Q: {item.question}\nA: {item.answer}\n\n"

    return f"""You are a customer service assistant for {company_name}.

=== FACTS (only use these) ===
{company_info}
{knowledge}
=== END FACTS ===

RULES:
1. Use ONLY facts from above. Never invent or guess.
2. Questions about GDPR/privacy/personuppgifter → use GDPR-ansvarig info.
3. Reply in {target_lang}. Be concise and helpful (1-2 sentences).
4. Always include email/phone when giving contact info.
5. If you truly don't have the info, say so briefly.

Customer: {question}"""


def anonymize_ip(ip: str) -> str:
    """Anonymisera IP-adress genom att ersätta sista oktetten"""
    if not ip:
        return None
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}.xxx"
    return "xxx.xxx.xxx.xxx"


def anonymize_user_agent(user_agent: str) -> str:
    """Extrahera endast webbläsare från user agent"""
    if not user_agent:
        return None

    # Enkel parsing för vanliga webbläsare
    browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"]
    for browser in browsers:
        if browser in user_agent:
            return browser
    return "Other"


async def save_conversation_stats(db: Session, conversation: Conversation):
    """Spara anonymiserad statistik innan konversation raderas"""
    conv_date = conversation.started_at.date()

    # Hämta eller skapa daglig statistik
    daily_stat = db.query(DailyStatistics).filter(
        and_(
            DailyStatistics.company_id == conversation.company_id,
            DailyStatistics.date == conv_date
        )
    ).first()

    if not daily_stat:
        daily_stat = DailyStatistics(
            company_id=conversation.company_id,
            date=conv_date
        )
        db.add(daily_stat)

    # Uppdatera statistik (handle None values from old conversations)
    daily_stat.total_conversations += 1
    daily_stat.total_messages += (conversation.message_count or 0)

    # Räkna besvarade/obesvarade
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id,
        Message.role == "bot"
    ).all()

    for msg in messages:
        if msg.had_answer:
            daily_stat.questions_answered += 1
        else:
            daily_stat.questions_unanswered += 1

    # Feedback
    if conversation.was_helpful is True:
        daily_stat.helpful_count += 1
    elif conversation.was_helpful is False:
        daily_stat.not_helpful_count += 1

    # Update category counts
    category = conversation.category or "allmant"
    try:
        cat_counts = json.loads(daily_stat.category_counts or "{}")
    except:
        cat_counts = {}
    cat_counts[category] = cat_counts.get(category, 0) + 1
    daily_stat.category_counts = json.dumps(cat_counts)

    # Update language counts
    language = conversation.language or "sv"
    try:
        lang_counts = json.loads(daily_stat.language_counts or "{}")
    except:
        lang_counts = {}
    lang_counts[language] = lang_counts.get(language, 0) + 1
    daily_stat.language_counts = json.dumps(lang_counts)

    # Update hourly counts
    hour = str(conversation.started_at.hour)
    try:
        hour_counts = json.loads(daily_stat.hourly_counts or "{}")
    except:
        hour_counts = {}
    hour_counts[hour] = hour_counts.get(hour, 0) + 1
    daily_stat.hourly_counts = json.dumps(hour_counts)

    # Beräkna genomsnittlig svarstid
    response_times = [m.response_time_ms for m in messages if m.response_time_ms]
    if response_times:
        current_avg = daily_stat.avg_response_time_ms or 0
        current_count = (daily_stat.questions_answered or 0) + (daily_stat.questions_unanswered or 0) - len(messages)
        if current_count + len(response_times) > 0:
            new_avg = (current_avg * max(0, current_count) + sum(response_times)) / (max(0, current_count) + len(response_times))
            daily_stat.avg_response_time_ms = new_avg


def get_or_create_settings(db: Session, company_id: str) -> CompanySettings:
    """Hämta eller skapa inställningar för ett företag"""
    settings = db.query(CompanySettings).filter(
        CompanySettings.company_id == company_id
    ).first()

    if not settings:
        company = db.query(Company).filter(Company.id == company_id).first()
        settings = CompanySettings(
            company_id=company_id,
            company_name=company.name if company else ""
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def log_admin_action(db: Session, admin_username: str, action_type: str,
                     target_company_id: str = None, description: str = None,
                     details: dict = None, ip_address: str = None):
    """Log an admin action to the audit log"""
    log_entry = AdminAuditLog(
        admin_username=admin_username,
        action_type=action_type,
        target_company_id=target_company_id,
        description=description,
        details=json.dumps(details) if details else None,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()


def log_company_activity(db: Session, company_id: str, action_type: str,
                         description: str = None, details: dict = None):
    """Log a company admin action to the activity log"""
    log_entry = CompanyActivityLog(
        company_id=company_id,
        action_type=action_type,
        description=description,
        details=json.dumps(details) if details else None
    )
    db.add(log_entry)
    db.commit()


def check_knowledge_limit(db: Session, company_id: str) -> tuple:
    """Check if company has reached knowledge limit, returns (allowed, message)"""
    settings = db.query(CompanySettings).filter(
        CompanySettings.company_id == company_id
    ).first()

    if not settings or settings.max_knowledge_items == 0:
        return True, None  # No limit

    current_count = db.query(KnowledgeItem).filter(
        KnowledgeItem.company_id == company_id
    ).count()

    if current_count >= settings.max_knowledge_items:
        return False, f"Du har nått maxgränsen på {settings.max_knowledge_items} kunskapsposter."

    return True, None


def get_global_setting(db: Session, key: str, default: str = None) -> str:
    """Get a global setting value"""
    setting = db.query(GlobalSettings).filter(GlobalSettings.key == key).first()
    return setting.value if setting else default


def set_global_setting(db: Session, key: str, value: str, admin_username: str = None):
    """Set a global setting value"""
    setting = db.query(GlobalSettings).filter(GlobalSettings.key == key).first()
    if setting:
        setting.value = value
        setting.updated_by = admin_username
    else:
        setting = GlobalSettings(key=key, value=value, updated_by=admin_username)
        db.add(setting)
    db.commit()


def is_maintenance_mode(db: Session) -> tuple:
    """Check if maintenance mode is enabled, returns (enabled, message)"""
    enabled = get_global_setting(db, "maintenance_mode", "false") == "true"
    message = get_global_setting(db, "maintenance_message", "Systemet är tillfälligt stängt för underhåll.")
    return enabled, message


def check_usage_limit(db: Session, company_id: str) -> tuple:
    """Check if company has reached usage limit, returns (allowed, message)"""
    settings = db.query(CompanySettings).filter(
        CompanySettings.company_id == company_id
    ).first()

    if not settings or settings.max_conversations_month == 0:
        return True, None  # No limit

    # Reset counter if new month
    from datetime import date
    today = date.today()
    if settings.usage_reset_date is None or settings.usage_reset_date.month != today.month:
        settings.usage_reset_date = today
        settings.current_month_conversations = 0
        settings.limit_warning_sent = False
        db.commit()

    if settings.current_month_conversations >= settings.max_conversations_month:
        return False, f"Månadsgränsen på {settings.max_conversations_month} konversationer har uppnåtts."

    return True, None


# =============================================================================
# Public Endpoints
# =============================================================================

@app.get("/")
async def root():
    return {"message": "Välkommen till Bobot API", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# =============================================================================
# Auth Endpoints
# =============================================================================

@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Logga in som företag"""
    company = db.query(Company).filter(Company.id == request.company_id).first()

    if not company or not verify_password(request.password, company.password_hash):
        raise HTTPException(status_code=401, detail="Fel företags-ID eller lösenord")

    if not company.is_active:
        raise HTTPException(status_code=403, detail="Kontot är inaktiverat")

    token = create_token({
        "sub": company.id,
        "name": company.name,
        "type": "company"
    })

    return LoginResponse(token=token, company_id=company.id, name=company.name)


@app.post("/auth/admin/login")
async def admin_login(request: SuperAdminLogin, db: Session = Depends(get_db)):
    """Logga in som super admin"""
    admin = db.query(SuperAdmin).filter(SuperAdmin.username == request.username).first()

    if not admin or not verify_password(request.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Fel användarnamn eller lösenord")

    token = create_token({
        "sub": admin.username,
        "type": "super_admin"
    })

    return {"token": token, "username": admin.username}


# =============================================================================
# Chat Endpoints (Public - används av widget)
# =============================================================================

@app.post("/chat/{company_id}", response_model=ChatResponse)
async def chat(
    company_id: str,
    request: ChatRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Chatta med AI - öppen endpoint för widget"""
    # Check maintenance mode
    maintenance_enabled, maintenance_msg = is_maintenance_mode(db)
    if maintenance_enabled:
        raise HTTPException(
            status_code=503,
            detail=maintenance_msg or "Systemet är under underhåll. Försök igen senare."
        )

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company or not company.is_active:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    # Check usage limits
    allowed, limit_msg = check_usage_limit(db, company_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=limit_msg)

    # Check cache first
    cached = get_cached_response(company_id, request.question)
    if cached:
        # Return cached response with new session handling
        session_id = request.session_id or str(uuid.uuid4())
        return ChatResponse(
            answer=cached["answer"],
            sources=cached.get("sources", []),
            session_id=session_id,
            conversation_id=cached.get("conversation_id", "BOB-CACHE"),
            had_answer=cached.get("had_answer", True),
            confidence=cached.get("confidence", 100)
        )

    # Hämta inställningar
    settings = get_or_create_settings(db, company_id)

    # Hantera session
    session_id = request.session_id or str(uuid.uuid4())

    # Determine language (from request or detect from question)
    language = request.language if request.language in ["sv", "en", "ar"] else detect_language(request.question)

    # Auto-detect category from question
    category = detect_category(request.question)

    # Hitta eller skapa konversation
    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.company_id == company_id
    ).first()

    if not conversation:
        # Anonymisera användardata
        client_ip = req.client.host if req.client else None
        user_agent = req.headers.get("user-agent", "")

        # Generate a short reference ID
        reference_id = generate_reference_id()

        conversation = Conversation(
            company_id=company_id,
            session_id=session_id,
            reference_id=reference_id,
            user_ip_anonymous=anonymize_ip(client_ip),
            user_agent_anonymous=anonymize_user_agent(user_agent),
            language=language,
            category=category
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        # Increment monthly usage counter
        if settings.max_conversations_month > 0:
            settings.current_month_conversations = (settings.current_month_conversations or 0) + 1
            db.commit()
    else:
        # Update category if new one is more specific
        if category != "allmant" and conversation.category == "allmant":
            conversation.category = category

    # Spara användarens meddelande
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.question
    )
    db.add(user_message)

    # Hitta kontext
    context = find_relevant_context(request.question, company_id, db)
    # Consider it "had_answer" if we found context OR if we detected a specific category
    had_answer = len(context) > 0 or category != "allmant"

    # Mät svarstid
    start_time = datetime.utcnow()

    # Bygg prompt och fråga AI med rätt språk och kategori
    prompt = build_prompt(request.question, context, settings, language, category)
    answer = await query_ollama(prompt)

    response_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

    # Only use fallback if no context AND no specific category detected (truly generic question)
    # The AI should try to help based on category even without exact knowledge base matches
    if not context and category == "allmant" and len(request.question.split()) <= 2:
        # Only fallback for very short, uncategorized messages where AI can't help
        fallback_messages = {
            "sv": settings.fallback_message or "Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.",
            "en": "I couldn't find an answer to your question. Please contact us directly.",
            "ar": "لم أتمكن من العثور على إجابة لسؤالك. يرجى الاتصال بنا مباشرة."
        }
        # Only use fallback if AI gave a very short/unhelpful response
        if len(answer.strip()) < 50:
            answer = fallback_messages.get(language, settings.fallback_message)

    # Spara bot-svaret
    sources = [item.question for item in context]
    bot_message = Message(
        conversation_id=conversation.id,
        role="bot",
        content=answer,
        sources=json.dumps(sources) if sources else None,
        had_answer=had_answer,
        response_time_ms=response_time
    )
    db.add(bot_message)

    # Uppdatera konversation
    conversation.message_count += 2
    conversation.ended_at = datetime.utcnow()

    # Legacy: Spara även till ChatLog för bakåtkompatibilitet
    log = ChatLog(company_id=company_id, question=request.question, answer=answer)
    db.add(log)

    db.commit()

    # Calculate confidence score based on context quality
    # 100% = exact match in knowledge base
    # 80% = partial match / category match
    # 50% = AI-generated without knowledge base
    # 30% = fallback message
    if len(context) >= 2:
        confidence = 100
    elif len(context) == 1:
        confidence = 90
    elif had_answer and category != "allmant":
        confidence = 75
    elif had_answer:
        confidence = 60
    else:
        confidence = 40

    # Cache the response
    cache_data = {
        "answer": answer,
        "sources": sources,
        "conversation_id": conversation.reference_id,
        "had_answer": had_answer,
        "confidence": confidence
    }
    set_cached_response(company_id, request.question, cache_data)

    return ChatResponse(
        answer=answer,
        sources=sources,
        session_id=session_id,
        conversation_id=conversation.reference_id,
        had_answer=had_answer,
        confidence=confidence
    )


@app.post("/chat/{company_id}/feedback")
async def chat_feedback(
    company_id: str,
    session_id: str,
    helpful: bool,
    db: Session = Depends(get_db)
):
    """Ge feedback på en konversation"""
    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.company_id == company_id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Konversation finns inte")

    conversation.was_helpful = helpful
    db.commit()

    return {"message": "Tack för din feedback!"}


@app.get("/widget/{company_id}/config")
async def get_widget_config(
    company_id: str,
    db: Session = Depends(get_db)
):
    """Hämta widget-konfiguration (publik endpoint för widget)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company or not company.is_active:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    settings = get_or_create_settings(db, company_id)

    return {
        "company_name": settings.company_name or company.name,
        "welcome_message": settings.welcome_message or "",
        "fallback_message": settings.fallback_message or "",
        "subtitle": settings.subtitle or "Alltid redo att hjälpa",
        "primary_color": settings.primary_color or "#D97757",
        "contact_email": settings.contact_email or "",
        "contact_phone": settings.contact_phone or "",
        # PuB/GDPR Compliance
        "privacy_policy_url": settings.privacy_policy_url or "",
        "require_consent": settings.require_consent if settings.require_consent is not None else True,
        "consent_text": settings.consent_text or "Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn.",
        "data_controller_name": settings.data_controller_name or "",
    }


# =============================================================================
# Settings Endpoints (Autentiserade)
# =============================================================================

@app.get("/settings", response_model=SettingsResponse)
async def get_settings(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Hämta inställningar för inloggat företag"""
    settings = get_or_create_settings(db, current["company_id"])

    return SettingsResponse(
        company_name=settings.company_name or "",
        contact_email=settings.contact_email or "",
        contact_phone=settings.contact_phone or "",
        welcome_message=settings.welcome_message or "",
        fallback_message=settings.fallback_message or "",
        subtitle=settings.subtitle or "Alltid redo att hjälpa",
        primary_color=settings.primary_color or "#D97757",
        language=settings.language or "sv",
        data_retention_days=settings.data_retention_days or 30,
        notify_unanswered=settings.notify_unanswered or False,
        notification_email=settings.notification_email or "",
        custom_categories=settings.custom_categories or "",
        privacy_policy_url=settings.privacy_policy_url or "",
        require_consent=settings.require_consent if settings.require_consent is not None else True,
        consent_text=settings.consent_text or "Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn.",
        data_controller_name=settings.data_controller_name or "",
        data_controller_email=settings.data_controller_email or ""
    )


@app.put("/settings", response_model=SettingsResponse)
async def update_settings(
    update: SettingsUpdate,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Uppdatera inställningar för inloggat företag"""
    settings = get_or_create_settings(db, current["company_id"])

    # Track changes for activity log
    changes = []
    field_labels = {
        "company_name": "Företagsnamn",
        "contact_email": "Kontakt-e-post",
        "contact_phone": "Kontakttelefon",
        "welcome_message": "Välkomstmeddelande",
        "fallback_message": "Reservmeddelande",
        "primary_color": "Primärfärg",
        "language": "Språk",
        "data_retention_days": "Datalagring",
        "notify_unanswered": "Notifikationer",
        "notification_email": "Notifikations-e-post",
        "subtitle": "Underrubrik",
        "custom_categories": "Kategorier",
        "privacy_policy_url": "Integritetspolicy-URL",
        "require_consent": "Kräv samtycke",
        "consent_text": "Samtyckestext",
        "data_controller_name": "Personuppgiftsansvarig",
        "data_controller_email": "PuB-kontakt"
    }

    # Uppdatera endast fält som skickats och spåra ändringar
    if update.company_name is not None and settings.company_name != update.company_name:
        changes.append(field_labels["company_name"])
        settings.company_name = update.company_name
    if update.contact_email is not None and settings.contact_email != update.contact_email:
        changes.append(field_labels["contact_email"])
        settings.contact_email = update.contact_email
    if update.contact_phone is not None and settings.contact_phone != update.contact_phone:
        changes.append(field_labels["contact_phone"])
        settings.contact_phone = update.contact_phone
    if update.welcome_message is not None and settings.welcome_message != update.welcome_message:
        changes.append(field_labels["welcome_message"])
        settings.welcome_message = update.welcome_message
    if update.fallback_message is not None and settings.fallback_message != update.fallback_message:
        changes.append(field_labels["fallback_message"])
        settings.fallback_message = update.fallback_message
    if update.primary_color is not None and settings.primary_color != update.primary_color:
        changes.append(field_labels["primary_color"])
        settings.primary_color = update.primary_color
    if update.language is not None and update.language in ["sv", "en", "ar"] and settings.language != update.language:
        changes.append(field_labels["language"])
        settings.language = update.language
    if update.data_retention_days is not None:
        new_val = max(7, min(30, update.data_retention_days))
        if settings.data_retention_days != new_val:
            changes.append(field_labels["data_retention_days"])
            settings.data_retention_days = new_val
    if update.notify_unanswered is not None and settings.notify_unanswered != update.notify_unanswered:
        changes.append(field_labels["notify_unanswered"])
        settings.notify_unanswered = update.notify_unanswered
    if update.notification_email is not None and settings.notification_email != update.notification_email:
        changes.append(field_labels["notification_email"])
        settings.notification_email = update.notification_email
    if update.subtitle is not None and settings.subtitle != update.subtitle:
        changes.append(field_labels["subtitle"])
        settings.subtitle = update.subtitle
    if update.custom_categories is not None and settings.custom_categories != update.custom_categories:
        changes.append(field_labels["custom_categories"])
        settings.custom_categories = update.custom_categories
    # PuB/GDPR Compliance fields
    if update.privacy_policy_url is not None and settings.privacy_policy_url != update.privacy_policy_url:
        changes.append(field_labels["privacy_policy_url"])
        settings.privacy_policy_url = update.privacy_policy_url
    if update.require_consent is not None and settings.require_consent != update.require_consent:
        changes.append(field_labels["require_consent"])
        settings.require_consent = update.require_consent
    if update.consent_text is not None and settings.consent_text != update.consent_text:
        changes.append(field_labels["consent_text"])
        settings.consent_text = update.consent_text
    if update.data_controller_name is not None and settings.data_controller_name != update.data_controller_name:
        changes.append(field_labels["data_controller_name"])
        settings.data_controller_name = update.data_controller_name
    if update.data_controller_email is not None and settings.data_controller_email != update.data_controller_email:
        changes.append(field_labels["data_controller_email"])
        settings.data_controller_email = update.data_controller_email

    db.commit()
    db.refresh(settings)

    # Log activity with specific changes
    if changes:
        if len(changes) == 1:
            description = f"Ändrade {changes[0]}"
        elif len(changes) <= 3:
            description = f"Ändrade {', '.join(changes)}"
        else:
            description = f"Ändrade {', '.join(changes[:2])} och {len(changes) - 2} till"
        log_company_activity(
            db, current["company_id"], "settings_update",
            description, {"fields": changes}
        )

    return SettingsResponse(
        company_name=settings.company_name or "",
        contact_email=settings.contact_email or "",
        contact_phone=settings.contact_phone or "",
        welcome_message=settings.welcome_message or "",
        fallback_message=settings.fallback_message or "",
        subtitle=settings.subtitle or "Alltid redo att hjälpa",
        primary_color=settings.primary_color or "#D97757",
        language=settings.language or "sv",
        data_retention_days=settings.data_retention_days or 30,
        notify_unanswered=settings.notify_unanswered or False,
        notification_email=settings.notification_email or "",
        custom_categories=settings.custom_categories or "",
        privacy_policy_url=settings.privacy_policy_url or "",
        require_consent=settings.require_consent if settings.require_consent is not None else True,
        consent_text=settings.consent_text or "Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn.",
        data_controller_name=settings.data_controller_name or "",
        data_controller_email=settings.data_controller_email or ""
    )


# =============================================================================
# Activity Log Endpoint (Företag)
# =============================================================================

class ActivityLogEntry(BaseModel):
    id: int
    action_type: str
    description: Optional[str]
    timestamp: datetime


@app.get("/activity-log")
async def get_company_activity_log(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """Hämta aktivitetslogg för företaget"""
    logs = db.query(CompanyActivityLog).filter(
        CompanyActivityLog.company_id == current["company_id"]
    ).order_by(CompanyActivityLog.timestamp.desc()).offset(offset).limit(limit).all()

    total = db.query(CompanyActivityLog).filter(
        CompanyActivityLog.company_id == current["company_id"]
    ).count()

    return {
        "logs": [
            ActivityLogEntry(
                id=log.id,
                action_type=log.action_type,
                description=log.description,
                timestamp=log.timestamp
            ) for log in logs
        ],
        "total": total
    }


# =============================================================================
# Conversations Endpoints (Autentiserade)
# =============================================================================

@app.get("/conversations", response_model=List[ConversationListResponse])
async def get_conversations(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    language: Optional[str] = None
):
    """Hämta konversationer för inloggat företag"""
    query = db.query(Conversation).filter(
        Conversation.company_id == current["company_id"]
    )

    # Filter by category if provided
    if category:
        query = query.filter(Conversation.category == category)

    # Filter by language if provided
    if language:
        query = query.filter(Conversation.language == language)

    conversations = query.order_by(Conversation.started_at.desc()).offset(offset).limit(limit).all()

    result = []
    for conv in conversations:
        # Hämta första meddelandet
        first_msg = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.role == "user"
        ).order_by(Message.created_at.asc()).first()

        result.append(ConversationListResponse(
            id=conv.id,
            session_id=conv.session_id,
            reference_id=conv.reference_id or f"BOB-{conv.id:04d}",
            started_at=conv.started_at,
            message_count=conv.message_count,
            was_helpful=conv.was_helpful,
            category=conv.category,
            language=conv.language,
            first_message=first_msg.content[:100] if first_msg else None
        ))

    return result


@app.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Hämta en specifik konversation med meddelanden"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.company_id == current["company_id"]
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Konversation finns inte")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()

    message_responses = []
    for msg in messages:
        sources = json.loads(msg.sources) if msg.sources else None
        message_responses.append(MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at,
            sources=sources,
            had_answer=msg.had_answer if msg.had_answer is not None else True
        ))

    return ConversationResponse(
        id=conversation.id,
        session_id=conversation.session_id,
        reference_id=conversation.reference_id or f"BOB-{conversation.id:04d}",
        started_at=conversation.started_at,
        message_count=conversation.message_count,
        was_helpful=conversation.was_helpful,
        category=conversation.category,
        language=conversation.language,
        messages=message_responses
    )


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Radera en konversation (GDPR) - statistik sparas"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.company_id == current["company_id"]
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Konversation finns inte")

    reference_id = conversation.reference_id
    # Spara statistik innan radering
    await save_conversation_stats(db, conversation)

    # Radera (meddelanden tas bort via cascade)
    db.delete(conversation)
    db.commit()

    # Log activity
    log_company_activity(
        db, current["company_id"], "conversation_delete",
        f"Raderade konversation: {reference_id}"
    )

    return {"message": "Konversation raderad. Anonymiserad statistik sparad."}


@app.delete("/conversations")
async def delete_all_conversations(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Radera alla konversationer (GDPR) - statistik sparas"""
    conversations = db.query(Conversation).filter(
        Conversation.company_id == current["company_id"]
    ).all()

    count = len(conversations)

    for conv in conversations:
        await save_conversation_stats(db, conv)
        db.delete(conv)

    db.commit()

    return {"message": f"{count} konversationer raderade. Anonymiserad statistik sparad."}


# =============================================================================
# Knowledge Endpoints (Autentiserade)
# =============================================================================

@app.get("/knowledge", response_model=List[KnowledgeItemResponse])
async def get_knowledge(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Hämta kunskapsbas för inloggat företag"""
    items = db.query(KnowledgeItem).filter(
        KnowledgeItem.company_id == current["company_id"]
    ).all()

    return [KnowledgeItemResponse(
        id=i.id,
        question=i.question,
        answer=i.answer,
        category=i.category or ""
    ) for i in items]


@app.post("/knowledge", response_model=KnowledgeItemResponse)
async def add_knowledge(
    item: KnowledgeItemCreate,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Lägg till fråga/svar"""
    # Check knowledge limit
    allowed, msg = check_knowledge_limit(db, current["company_id"])
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    new_item = KnowledgeItem(
        company_id=current["company_id"],
        question=item.question,
        answer=item.answer,
        category=item.category or ""
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Log activity
    log_company_activity(
        db, current["company_id"], "knowledge_create",
        f"Lade till kunskapspost: {item.question[:50]}..."
    )

    return KnowledgeItemResponse(
        id=new_item.id,
        question=new_item.question,
        answer=new_item.answer,
        category=new_item.category or ""
    )


@app.put("/knowledge/{item_id}", response_model=KnowledgeItemResponse)
async def update_knowledge(
    item_id: int,
    item: KnowledgeItemCreate,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Uppdatera fråga/svar"""
    db_item = db.query(KnowledgeItem).filter(
        KnowledgeItem.id == item_id,
        KnowledgeItem.company_id == current["company_id"]
    ).first()

    if not db_item:
        raise HTTPException(status_code=404, detail="Finns inte")

    db_item.question = item.question
    db_item.answer = item.answer
    db_item.category = item.category or ""
    db.commit()

    # Log activity
    log_company_activity(
        db, current["company_id"], "knowledge_update",
        f"Uppdaterade kunskapspost: {item.question[:50]}..."
    )

    return KnowledgeItemResponse(
        id=db_item.id,
        question=db_item.question,
        answer=db_item.answer,
        category=db_item.category or ""
    )


@app.delete("/knowledge/{item_id}")
async def delete_knowledge(
    item_id: int,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Ta bort fråga/svar"""
    db_item = db.query(KnowledgeItem).filter(
        KnowledgeItem.id == item_id,
        KnowledgeItem.company_id == current["company_id"]
    ).first()

    if not db_item:
        raise HTTPException(status_code=404, detail="Finns inte")

    question_preview = db_item.question[:50]
    db.delete(db_item)
    db.commit()

    # Log activity
    log_company_activity(
        db, current["company_id"], "knowledge_delete",
        f"Raderade kunskapspost: {question_preview}..."
    )

    return {"message": "Borttagen"}


class SimilarQuestionRequest(BaseModel):
    question: str


class SimilarQuestionResponse(BaseModel):
    id: int
    question: str
    answer: str
    similarity: float


def calculate_similarity(str1: str, str2: str) -> float:
    """Calculate simple word-based similarity between two strings"""
    # Normalize strings
    s1 = str1.lower().strip()
    s2 = str2.lower().strip()

    # Exact match
    if s1 == s2:
        return 1.0

    # Word-based Jaccard similarity
    words1 = set(s1.split())
    words2 = set(s2.split())

    if not words1 or not words2:
        return 0.0

    intersection = words1 & words2
    union = words1 | words2

    return len(intersection) / len(union) if union else 0.0


@app.post("/knowledge/check-similar", response_model=List[SimilarQuestionResponse])
async def check_similar_questions(
    request: SimilarQuestionRequest,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Check for similar questions in the knowledge base"""
    items = db.query(KnowledgeItem).filter(
        KnowledgeItem.company_id == current["company_id"]
    ).all()

    similar = []
    for item in items:
        sim = calculate_similarity(request.question, item.question)
        if sim > 0.3:  # Threshold for similarity
            similar.append(SimilarQuestionResponse(
                id=item.id,
                question=item.question,
                answer=item.answer[:100] + "..." if len(item.answer) > 100 else item.answer,
                similarity=round(sim * 100, 1)
            ))

    # Sort by similarity descending
    similar.sort(key=lambda x: x.similarity, reverse=True)
    return similar[:5]  # Return top 5 similar


class UploadResponse(BaseModel):
    success: bool
    items_added: int
    message: str
    items: List[KnowledgeItemResponse] = []


class URLImportRequest(BaseModel):
    url: str


async def parse_excel_file(content: bytes) -> List[dict]:
    """Parse Excel file and extract Q&A pairs"""
    import io
    try:
        import openpyxl
    except ImportError:
        return []

    items = []
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(content))
        sheet = workbook.active

        # Try to find headers
        headers = []
        for col in range(1, sheet.max_column + 1):
            val = sheet.cell(row=1, column=col).value
            headers.append(str(val).lower() if val else "")

        # Map columns to Q&A
        q_col = None
        a_col = None
        cat_col = None

        for i, h in enumerate(headers):
            if any(x in h for x in ['fråga', 'question', 'q']):
                q_col = i + 1
            elif any(x in h for x in ['svar', 'answer', 'a']):
                a_col = i + 1
            elif any(x in h for x in ['kategori', 'category', 'cat']):
                cat_col = i + 1

        # If no headers found, assume first two columns
        if q_col is None:
            q_col = 1
        if a_col is None:
            a_col = 2

        # Read rows
        for row in range(2, sheet.max_row + 1):
            q = sheet.cell(row=row, column=q_col).value
            a = sheet.cell(row=row, column=a_col).value
            cat = sheet.cell(row=row, column=cat_col).value if cat_col else None

            if q and a:
                items.append({
                    "question": str(q).strip(),
                    "answer": str(a).strip(),
                    "category": str(cat).strip() if cat else None
                })
    except Exception as e:
        print(f"Excel parse error: {e}")

    return items


async def parse_word_file(content: bytes) -> str:
    """Parse Word file and extract text"""
    import io
    try:
        from docx import Document
    except ImportError:
        return ""

    try:
        doc = Document(io.BytesIO(content))
        text = []
        for para in doc.paragraphs:
            if para.text.strip():
                text.append(para.text.strip())
        return "\n\n".join(text)
    except Exception as e:
        print(f"Word parse error: {e}")
        return ""


async def parse_text_file(content: bytes) -> str:
    """Parse plain text file"""
    try:
        return content.decode('utf-8')
    except:
        try:
            return content.decode('latin-1')
        except:
            return ""


async def fetch_url_content(url: str) -> str:
    """Fetch and extract text content from a URL"""
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; BobotBot/1.0)'
            })
            response.raise_for_status()
            html = response.text

            # Simple HTML to text conversion
            import re
            # Remove script and style elements
            html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
            html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
            html = re.sub(r'<nav[^>]*>.*?</nav>', '', html, flags=re.DOTALL | re.IGNORECASE)
            html = re.sub(r'<footer[^>]*>.*?</footer>', '', html, flags=re.DOTALL | re.IGNORECASE)
            html = re.sub(r'<header[^>]*>.*?</header>', '', html, flags=re.DOTALL | re.IGNORECASE)

            # Convert common HTML elements
            html = re.sub(r'<br\s*/?>', '\n', html)
            html = re.sub(r'<p[^>]*>', '\n\n', html)
            html = re.sub(r'</p>', '', html)
            html = re.sub(r'<h[1-6][^>]*>', '\n\n## ', html)
            html = re.sub(r'</h[1-6]>', '\n', html)
            html = re.sub(r'<li[^>]*>', '\n- ', html)

            # Remove remaining HTML tags
            text = re.sub(r'<[^>]+>', '', html)

            # Decode HTML entities
            import html as html_module
            text = html_module.unescape(text)

            # Clean up whitespace
            text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
            text = text.strip()

            return text
    except Exception as e:
        print(f"URL fetch error: {e}")
        return ""


async def ai_extract_qa_pairs(text: str, company_name: str = "") -> List[dict]:
    """Use AI to extract Q&A pairs from unstructured text"""
    if not text or len(text) < 20:
        return []

    prompt = f"""Analyze this document and extract question-answer pairs that would be useful for a customer service chatbot for a property management company.

Document text:
{text[:4000]}

Extract relevant information as Q&A pairs. For each piece of information, create a natural question a tenant might ask, and provide the answer.

Also assign each Q&A to one of these categories: hyra, felanmalan, kontrakt, tvattstuga, parkering, kontakt, allmant

Return your response as a JSON array with objects containing "question", "answer", and "category" fields.
Only return the JSON array, nothing else.

Example format:
[
  {{"question": "När ska hyran betalas?", "answer": "Hyran ska betalas senast den sista dagen varje månad.", "category": "hyra"}},
  {{"question": "Hur gör jag en felanmälan?", "answer": "Du kan göra en felanmälan via...", "category": "felanmalan"}}
]"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
            result = response.json().get("response", "")

            # Try to parse JSON from response
            import re
            json_match = re.search(r'\[[\s\S]*\]', result)
            if json_match:
                items = json.loads(json_match.group())
                return [item for item in items if item.get("question") and item.get("answer")]
    except Exception as e:
        print(f"AI extraction error: {e}")

    return []


@app.post("/knowledge/upload", response_model=UploadResponse)
async def upload_knowledge_file(
    file: UploadFile = File(...),
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Upload Excel, Word, or text file to populate knowledge base"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Ingen fil vald")

    filename = file.filename.lower()
    content = await file.read()

    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Filen är för stor (max 10MB)")

    items_to_add = []

    # Parse based on file type
    if filename.endswith('.xlsx') or filename.endswith('.xls'):
        items_to_add = await parse_excel_file(content)
    elif filename.endswith('.docx'):
        text = await parse_word_file(content)
        if text:
            # Use AI to extract Q&A from unstructured text
            settings = get_or_create_settings(db, current["company_id"])
            items_to_add = await ai_extract_qa_pairs(text, settings.company_name)
    elif filename.endswith('.txt') or filename.endswith('.csv'):
        text = await parse_text_file(content)
        if text:
            # Check if it looks like CSV
            if ',' in text or ';' in text:
                # Simple CSV parsing
                lines = text.strip().split('\n')
                for line in lines[1:]:  # Skip header
                    parts = line.split(',') if ',' in line else line.split(';')
                    if len(parts) >= 2:
                        items_to_add.append({
                            "question": parts[0].strip().strip('"'),
                            "answer": parts[1].strip().strip('"'),
                            "category": parts[2].strip().strip('"') if len(parts) > 2 else None
                        })
            else:
                # Use AI to extract Q&A
                settings = get_or_create_settings(db, current["company_id"])
                items_to_add = await ai_extract_qa_pairs(text, settings.company_name)
    else:
        raise HTTPException(
            status_code=400,
            detail="Filformat stöds inte. Använd .xlsx, .docx, .txt eller .csv"
        )

    if not items_to_add:
        return UploadResponse(
            success=False,
            items_added=0,
            message="Kunde inte hitta några frågor/svar i filen. Kontrollera formatet."
        )

    # Auto-categorize items without category
    for item in items_to_add:
        if not item.get("category"):
            item["category"] = detect_category(item["question"] + " " + item["answer"])

    # Add to database
    added_items = []
    for item in items_to_add:
        new_item = KnowledgeItem(
            company_id=current["company_id"],
            question=item["question"],
            answer=item["answer"],
            category=item.get("category", "allmant")
        )
        db.add(new_item)
        db.flush()
        added_items.append(KnowledgeItemResponse(
            id=new_item.id,
            question=new_item.question,
            answer=new_item.answer,
            category=new_item.category or ""
        ))

    db.commit()

    return UploadResponse(
        success=True,
        items_added=len(added_items),
        message=f"{len(added_items)} frågor/svar har lagts till i kunskapsbasen",
        items=added_items
    )


@app.post("/knowledge/import-url", response_model=UploadResponse)
async def import_knowledge_from_url(
    request: URLImportRequest,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Import knowledge base items from a URL"""
    import re

    # Validate URL
    url = request.url.strip()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    if not re.match(r'https?://[^\s/$.?#].[^\s]*', url):
        raise HTTPException(status_code=400, detail="Ogiltig URL")

    # Fetch content
    text = await fetch_url_content(url)

    if not text or len(text) < 50:
        return UploadResponse(
            success=False,
            items_added=0,
            message="Kunde inte hämta innehåll från URL:en. Kontrollera att sidan är tillgänglig."
        )

    # Use AI to extract Q&A pairs
    settings = get_or_create_settings(db, current["company_id"])
    items_to_add = await ai_extract_qa_pairs(text, settings.company_name)

    if not items_to_add:
        return UploadResponse(
            success=False,
            items_added=0,
            message="Kunde inte hitta några frågor/svar på sidan. Försök med en annan sida."
        )

    # Auto-categorize items without category
    for item in items_to_add:
        if not item.get("category"):
            item["category"] = detect_category(item["question"] + " " + item["answer"])

    # Add to database
    added_items = []
    for item in items_to_add:
        new_item = KnowledgeItem(
            company_id=current["company_id"],
            question=item["question"],
            answer=item["answer"],
            category=item.get("category", "allmant")
        )
        db.add(new_item)
        db.flush()
        added_items.append(KnowledgeItemResponse(
            id=new_item.id,
            question=new_item.question,
            answer=new_item.answer,
            category=new_item.category or ""
        ))

    db.commit()

    return UploadResponse(
        success=True,
        items_added=len(added_items),
        message=f"{len(added_items)} frågor/svar har importerats från {url}",
        items=added_items
    )


class BulkDeleteRequest(BaseModel):
    item_ids: List[int]


@app.delete("/knowledge/bulk")
async def delete_knowledge_bulk(
    request: BulkDeleteRequest,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Delete multiple knowledge items at once"""
    deleted_count = 0

    for item_id in request.item_ids:
        db_item = db.query(KnowledgeItem).filter(
            KnowledgeItem.id == item_id,
            KnowledgeItem.company_id == current["company_id"]
        ).first()

        if db_item:
            db.delete(db_item)
            deleted_count += 1

    db.commit()

    return {"message": f"{deleted_count} poster har tagits bort", "deleted_count": deleted_count}


# =============================================================================
# Stats & Analytics Endpoints
# =============================================================================

@app.get("/stats", response_model=StatsResponse)
async def get_stats(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Hämta enkel statistik för inloggat företag"""
    company_id = current["company_id"]

    total = db.query(ChatLog).filter(ChatLog.company_id == company_id).count()
    knowledge = db.query(KnowledgeItem).filter(KnowledgeItem.company_id == company_id).count()

    today = datetime.utcnow().date()
    today_count = db.query(ChatLog).filter(
        ChatLog.company_id == company_id,
        func.date(ChatLog.created_at) == today
    ).count()

    week_ago = datetime.utcnow() - timedelta(days=7)
    week_count = db.query(ChatLog).filter(
        ChatLog.company_id == company_id,
        ChatLog.created_at >= week_ago
    ).count()

    month_ago = datetime.utcnow() - timedelta(days=30)
    month_count = db.query(ChatLog).filter(
        ChatLog.company_id == company_id,
        ChatLog.created_at >= month_ago
    ).count()

    return StatsResponse(
        total_questions=total,
        knowledge_items=knowledge,
        questions_today=today_count,
        questions_this_week=week_count,
        questions_this_month=month_count
    )


@app.get("/my-usage")
async def get_my_usage(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Get usage limits and current usage for the logged-in company"""
    company_id = current["company_id"]
    settings = db.query(CompanySettings).filter(
        CompanySettings.company_id == company_id
    ).first()

    knowledge_count = db.query(KnowledgeItem).filter(
        KnowledgeItem.company_id == company_id
    ).count()

    if not settings:
        return {
            "conversations": {
                "current": 0,
                "limit": 0,
                "percent": 0,
                "has_limit": False
            },
            "knowledge": {
                "current": knowledge_count,
                "limit": 0,
                "percent": 0,
                "has_limit": False
            }
        }

    # Conversation usage
    conv_limit = settings.max_conversations_month or 0
    conv_current = settings.current_month_conversations or 0
    conv_percent = (conv_current / conv_limit * 100) if conv_limit > 0 else 0

    # Knowledge usage
    knowledge_limit = settings.max_knowledge_items or 0
    knowledge_percent = (knowledge_count / knowledge_limit * 100) if knowledge_limit > 0 else 0

    return {
        "conversations": {
            "current": conv_current,
            "limit": conv_limit,
            "percent": min(100, round(conv_percent, 1)),
            "has_limit": conv_limit > 0
        },
        "knowledge": {
            "current": knowledge_count,
            "limit": knowledge_limit,
            "percent": min(100, round(knowledge_percent, 1)),
            "has_limit": knowledge_limit > 0
        }
    }


@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Hämta detaljerad GDPR-säker statistik (anonymiserad)"""
    company_id = current["company_id"]
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Totals från DailyStatistics (historisk data)
    stats = db.query(DailyStatistics).filter(
        DailyStatistics.company_id == company_id
    ).all()

    total_conversations = sum(s.total_conversations for s in stats)
    total_messages = sum(s.total_messages for s in stats)
    total_answered = sum(s.questions_answered for s in stats)
    total_unanswered = sum(s.questions_unanswered for s in stats)

    # Lägg till aktiva konversationer (ej ännu i statistik)
    active_convs = db.query(Conversation).filter(
        Conversation.company_id == company_id
    ).all()
    total_conversations += len(active_convs)
    total_messages += sum(c.message_count for c in active_convs)

    # Initialize new stats collectors
    language_stats = {}
    category_stats = {}
    hourly_stats = {str(h): 0 for h in range(24)}
    feedback_stats = {"helpful": 0, "not_helpful": 0, "no_feedback": 0}
    unanswered_questions = []

    # Räkna answered/unanswered för aktiva + collect new stats
    for conv in active_convs:
        # Language stats
        lang = conv.language or "sv"
        language_stats[lang] = language_stats.get(lang, 0) + 1

        # Category stats
        cat = conv.category or "allmant"
        category_stats[cat] = category_stats.get(cat, 0) + 1

        # Hourly stats
        hour = str(conv.started_at.hour)
        hourly_stats[hour] = hourly_stats.get(hour, 0) + 1

        # Feedback stats
        if conv.was_helpful is True:
            feedback_stats["helpful"] += 1
        elif conv.was_helpful is False:
            feedback_stats["not_helpful"] += 1
        else:
            feedback_stats["no_feedback"] += 1

        msgs = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.role == "bot"
        ).all()
        for msg in msgs:
            if msg.had_answer:
                total_answered += 1
            else:
                total_unanswered += 1
                # Collect unanswered question
                user_msg = db.query(Message).filter(
                    Message.conversation_id == conv.id,
                    Message.role == "user"
                ).order_by(Message.created_at.desc()).first()
                if user_msg and user_msg.content not in unanswered_questions:
                    unanswered_questions.append(user_msg.content[:100])

    # Today
    today_stats = db.query(DailyStatistics).filter(
        DailyStatistics.company_id == company_id,
        DailyStatistics.date == today
    ).first()

    conversations_today = today_stats.total_conversations if today_stats else 0
    messages_today = today_stats.total_messages if today_stats else 0

    # Lägg till dagens aktiva konversationer
    today_convs = [c for c in active_convs if c.started_at.date() == today]
    conversations_today += len(today_convs)
    messages_today += sum(c.message_count for c in today_convs)

    # This week
    week_stats = db.query(DailyStatistics).filter(
        DailyStatistics.company_id == company_id,
        DailyStatistics.date >= week_ago
    ).all()

    conversations_week = sum(s.total_conversations for s in week_stats)
    messages_week = sum(s.total_messages for s in week_stats)

    # Lägg till veckans aktiva
    week_convs = [c for c in active_convs if c.started_at.date() >= week_ago]
    conversations_week += len(week_convs)
    messages_week += sum(c.message_count for c in week_convs)

    # Performance
    all_response_times = []
    for conv in active_convs:
        msgs = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.response_time_ms.isnot(None)
        ).all()
        all_response_times.extend([m.response_time_ms for m in msgs])

    avg_response_time = sum(all_response_times) / len(all_response_times) if all_response_times else 0

    # Inkludera historisk data
    historical_avg = [s.avg_response_time_ms for s in stats if s.avg_response_time_ms]
    if historical_avg:
        avg_response_time = (avg_response_time + sum(historical_avg)) / (1 + len(historical_avg))

    answer_rate = (total_answered / (total_answered + total_unanswered) * 100) if (total_answered + total_unanswered) > 0 else 100

    # Daily breakdown (senaste 30 dagarna)
    daily_stats_list = []
    month_stats = db.query(DailyStatistics).filter(
        DailyStatistics.company_id == company_id,
        DailyStatistics.date >= month_ago
    ).order_by(DailyStatistics.date.asc()).all()

    for s in month_stats:
        daily_stats_list.append({
            "date": s.date.isoformat(),
            "conversations": s.total_conversations,
            "messages": s.total_messages,
            "answered": s.questions_answered,
            "unanswered": s.questions_unanswered
        })

    # Merge historical stats
    for s in stats:
        # Category counts from history
        if s.category_counts:
            try:
                cats = json.loads(s.category_counts)
                for cat, count in cats.items():
                    category_stats[cat] = category_stats.get(cat, 0) + count
            except:
                pass

        # Language counts from history
        if hasattr(s, 'language_counts') and s.language_counts:
            try:
                langs = json.loads(s.language_counts)
                for lang, count in langs.items():
                    language_stats[lang] = language_stats.get(lang, 0) + count
            except:
                pass

        # Hourly counts from history
        if hasattr(s, 'hourly_counts') and s.hourly_counts:
            try:
                hours = json.loads(s.hourly_counts)
                for hour, count in hours.items():
                    hourly_stats[hour] = hourly_stats.get(hour, 0) + count
            except:
                pass

        # Feedback from history
        feedback_stats["helpful"] += s.helpful_count or 0
        feedback_stats["not_helpful"] += s.not_helpful_count or 0

    return AnalyticsResponse(
        total_conversations=total_conversations,
        total_messages=total_messages,
        total_answered=total_answered,
        total_unanswered=total_unanswered,
        conversations_today=conversations_today,
        messages_today=messages_today,
        conversations_week=conversations_week,
        messages_week=messages_week,
        avg_response_time_ms=avg_response_time,
        answer_rate=answer_rate,
        daily_stats=daily_stats_list,
        category_stats=category_stats,
        language_stats=language_stats,
        feedback_stats=feedback_stats,
        hourly_stats=hourly_stats,
        top_unanswered=unanswered_questions[:10]  # Top 10 unanswered
    )


# =============================================================================
# Export Endpoints
# =============================================================================

@app.get("/export/conversations")
async def export_conversations(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db),
    format: str = "csv"
):
    """Export conversations as CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv

    company_id = current["company_id"]

    conversations = db.query(Conversation).filter(
        Conversation.company_id == company_id
    ).order_by(Conversation.started_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Reference ID", "Started At", "Messages", "Category", "Language",
        "Was Helpful", "First Message"
    ])

    for conv in conversations:
        first_msg = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.role == "user"
        ).order_by(Message.created_at.asc()).first()

        writer.writerow([
            conv.reference_id or f"BOB-{conv.id:04d}",
            conv.started_at.isoformat(),
            conv.message_count,
            conv.category or "allmant",
            conv.language or "sv",
            "Yes" if conv.was_helpful else ("No" if conv.was_helpful is False else "N/A"),
            first_msg.content[:100] if first_msg else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=conversations.csv"}
    )


@app.get("/export/statistics")
async def export_statistics(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Export daily statistics as CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv

    company_id = current["company_id"]

    stats = db.query(DailyStatistics).filter(
        DailyStatistics.company_id == company_id
    ).order_by(DailyStatistics.date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Date", "Conversations", "Messages", "Answered", "Unanswered",
        "Avg Response Time (ms)", "Helpful", "Not Helpful"
    ])

    for s in stats:
        writer.writerow([
            s.date.isoformat(),
            s.total_conversations,
            s.total_messages,
            s.questions_answered,
            s.questions_unanswered,
            round(s.avg_response_time_ms or 0, 2),
            s.helpful_count or 0,
            s.not_helpful_count or 0
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=statistics.csv"}
    )


@app.get("/export/knowledge")
async def export_knowledge(
    format: str = "csv",
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Export knowledge base as CSV or JSON"""
    from fastapi.responses import StreamingResponse
    import io
    import csv

    company_id = current["company_id"]

    items = db.query(KnowledgeItem).filter(
        KnowledgeItem.company_id == company_id
    ).all()

    if format.lower() == "json":
        # Export as JSON
        data = [{
            "question": item.question,
            "answer": item.answer,
            "category": item.category or "",
            "created_at": item.created_at.isoformat()
        } for item in items]

        output = json.dumps(data, ensure_ascii=False, indent=2)
        return StreamingResponse(
            iter([output]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=knowledge_base.json"}
        )
    else:
        # Export as CSV (default)
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow(["Question", "Answer", "Category", "Created At"])

        for item in items:
            writer.writerow([
                item.question,
                item.answer,
                item.category or "",
                item.created_at.isoformat()
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=knowledge_base.csv"}
        )


# =============================================================================
# GDPR/PuB Data Rights Endpoints (Public - for widget users)
# =============================================================================

class GDPRConsentRequest(BaseModel):
    session_id: str
    consent_given: bool


class GDPRDataRequest(BaseModel):
    session_id: str


@app.post("/gdpr/{company_id}/consent")
async def record_consent(
    company_id: str,
    request: GDPRConsentRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Record user consent for data processing (PuB compliance)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company or not company.is_active:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    # Find or create conversation
    conversation = db.query(Conversation).filter(
        Conversation.session_id == request.session_id,
        Conversation.company_id == company_id
    ).first()

    if conversation:
        conversation.consent_given = request.consent_given
        conversation.consent_timestamp = datetime.utcnow() if request.consent_given else None
    else:
        # Create new conversation with consent
        client_ip = req.client.host if req.client else None
        conversation = Conversation(
            company_id=company_id,
            session_id=request.session_id,
            reference_id=generate_reference_id(),
            user_ip_anonymous=anonymize_ip(client_ip),
            consent_given=request.consent_given,
            consent_timestamp=datetime.utcnow() if request.consent_given else None
        )
        db.add(conversation)

    # Log the consent action
    audit_log = GDPRAuditLog(
        company_id=company_id,
        action_type="consent_given" if request.consent_given else "consent_withdrawn",
        session_id=request.session_id,
        description=f"User {'gave' if request.consent_given else 'withdrew'} consent for data processing",
        requester_ip_anonymous=anonymize_ip(req.client.host if req.client else None),
        success=True
    )
    db.add(audit_log)
    db.commit()

    return {"message": "Samtycke registrerat", "consent_given": request.consent_given}


@app.get("/gdpr/{company_id}/my-data")
async def get_my_data(
    company_id: str,
    session_id: str,
    req: Request,
    db: Session = Depends(get_db)
):
    """Get all data associated with a session (Right to Access - GDPR Art. 15)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    # Find conversation
    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.company_id == company_id
    ).first()

    if not conversation:
        return {
            "message": "Ingen data hittades för denna session",
            "data": None
        }

    # Get all messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()

    # Log the data access
    audit_log = GDPRAuditLog(
        company_id=company_id,
        action_type="data_access",
        session_id=session_id,
        description="User requested access to their data (GDPR Art. 15)",
        requester_ip_anonymous=anonymize_ip(req.client.host if req.client else None),
        success=True
    )
    db.add(audit_log)
    db.commit()

    return {
        "message": "Din data har hämtats",
        "data": {
            "conversation_id": conversation.reference_id,
            "started_at": conversation.started_at.isoformat(),
            "ended_at": conversation.ended_at.isoformat() if conversation.ended_at else None,
            "consent_given": conversation.consent_given,
            "consent_timestamp": conversation.consent_timestamp.isoformat() if conversation.consent_timestamp else None,
            "message_count": conversation.message_count,
            "anonymized_ip": conversation.user_ip_anonymous,
            "anonymized_browser": conversation.user_agent_anonymous,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat()
                }
                for msg in messages
            ]
        },
        "data_controller": {
            "company": company.name,
            "retention_days": db.query(CompanySettings).filter(
                CompanySettings.company_id == company_id
            ).first().data_retention_days if db.query(CompanySettings).filter(
                CompanySettings.company_id == company_id
            ).first() else 30
        }
    }


@app.delete("/gdpr/{company_id}/my-data")
async def delete_my_data(
    company_id: str,
    session_id: str,
    req: Request,
    db: Session = Depends(get_db)
):
    """Delete all data associated with a session (Right to Erasure - GDPR Art. 17)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    # Find conversation
    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.company_id == company_id
    ).first()

    if not conversation:
        return {"message": "Ingen data att radera för denna session"}

    # Save anonymized stats before deletion (for aggregate statistics)
    await save_conversation_stats(db, conversation)

    # Log the deletion request
    audit_log = GDPRAuditLog(
        company_id=company_id,
        action_type="data_deletion",
        session_id=session_id,
        description="User requested deletion of their data (GDPR Art. 17)",
        requester_ip_anonymous=anonymize_ip(req.client.host if req.client else None),
        success=True
    )
    db.add(audit_log)

    # Delete the conversation (messages cascade)
    db.delete(conversation)
    db.commit()

    return {
        "message": "Din data har raderats. Anonymiserad statistik kan fortfarande finnas kvar.",
        "deleted": True
    }


@app.get("/gdpr/{company_id}/audit-log")
async def get_audit_log(
    company_id: str,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db),
    limit: int = 100
):
    """Get GDPR audit log for company (Admin only)"""
    if current["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="Ej behörig")

    logs = db.query(GDPRAuditLog).filter(
        GDPRAuditLog.company_id == company_id
    ).order_by(GDPRAuditLog.request_timestamp.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "action_type": log.action_type,
            "session_id": log.session_id,
            "description": log.description,
            "timestamp": log.request_timestamp.isoformat(),
            "success": log.success,
            "error_message": log.error_message
        }
        for log in logs
    ]


# =============================================================================
# Super Admin Endpoints
# =============================================================================

@app.get("/admin/companies", response_model=List[CompanyResponse])
async def list_companies(
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Lista alla företag"""
    companies = db.query(Company).all()

    result = []
    for c in companies:
        knowledge_count = db.query(KnowledgeItem).filter(KnowledgeItem.company_id == c.id).count()
        chat_count = db.query(ChatLog).filter(ChatLog.company_id == c.id).count()
        settings = db.query(CompanySettings).filter(CompanySettings.company_id == c.id).first()

        result.append(CompanyResponse(
            id=c.id,
            name=c.name,
            is_active=c.is_active,
            created_at=c.created_at,
            knowledge_count=knowledge_count,
            chat_count=chat_count,
            max_conversations_month=settings.max_conversations_month if settings else 0,
            current_month_conversations=settings.current_month_conversations if settings else 0,
            max_knowledge_items=settings.max_knowledge_items if settings else 0
        ))

    return result


@app.post("/admin/companies", response_model=CompanyResponse)
async def create_company(
    company: CompanyCreate,
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Skapa nytt företag"""
    existing = db.query(Company).filter(Company.id == company.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Företags-ID finns redan")

    new_company = Company(
        id=company.id,
        name=company.name,
        password_hash=hash_password(company.password)
    )
    db.add(new_company)
    db.commit()

    # Skapa standardinställningar
    settings = CompanySettings(
        company_id=company.id,
        company_name=company.name
    )
    db.add(settings)
    db.commit()

    # Log admin action
    log_admin_action(
        db, admin["username"], "create_company",
        target_company_id=company.id,
        description=f"Skapade nytt företag: {company.name}"
    )

    return CompanyResponse(
        id=new_company.id,
        name=new_company.name,
        is_active=new_company.is_active,
        created_at=new_company.created_at,
        knowledge_count=0,
        chat_count=0
    )


@app.delete("/admin/companies/{company_id}")
async def delete_company(
    company_id: str,
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Ta bort företag"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    company_name = company.name
    db.delete(company)
    db.commit()

    # Log admin action
    log_admin_action(
        db, admin["username"], "delete_company",
        target_company_id=company_id,
        description=f"Raderade företag: {company_name}"
    )

    return {"message": f"Företag {company_id} borttaget"}


@app.put("/admin/companies/{company_id}/toggle")
async def toggle_company(
    company_id: str,
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Aktivera/inaktivera företag"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    company.is_active = not company.is_active
    db.commit()

    # Log admin action
    status = "aktiverat" if company.is_active else "inaktiverat"
    log_admin_action(
        db, admin["username"], "toggle_company",
        target_company_id=company_id,
        description=f"Företag {status}: {company.name}"
    )

    return {"message": f"Företag {status}"}


# =============================================================================
# System Health Endpoint (för admin dashboard)
# =============================================================================

@app.get("/admin/system-health")
async def system_health(
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Hämta systemhälsa för admin dashboard"""
    import os
    import httpx

    # Check Ollama status
    ollama_status = "offline"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                ollama_status = "online"
    except:
        ollama_status = "offline"

    # Get database size
    db_path = "./bobot.db"
    db_size = "N/A"
    if os.path.exists(db_path):
        size_bytes = os.path.getsize(db_path)
        if size_bytes < 1024:
            db_size = f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            db_size = f"{size_bytes / 1024:.1f} KB"
        else:
            db_size = f"{size_bytes / (1024 * 1024):.1f} MB"

    # Get total counts
    total_companies = db.query(Company).count()
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()
    total_knowledge = db.query(KnowledgeItem).count()

    return {
        "ollama_status": ollama_status,
        "database_size": db_size,
        "total_companies": total_companies,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_knowledge": total_knowledge
    }


# =============================================================================
# Manual GDPR Cleanup Endpoint (för testing/admin)
# =============================================================================

@app.post("/admin/gdpr-cleanup")
async def manual_gdpr_cleanup(
    admin: dict = Depends(get_super_admin),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """Kör GDPR-cleanup manuellt (för testing)"""
    await cleanup_old_conversations()

    # Log admin action
    log_admin_action(
        db, admin["username"], "gdpr_cleanup",
        description="Manual GDPR cleanup triggered",
        ip_address=req.client.host if req else None
    )

    return {"message": "GDPR cleanup genomförd"}


# =============================================================================
# Audit Log Endpoints
# =============================================================================

@app.get("/admin/audit-log")
async def get_admin_audit_log(
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """Get admin audit log"""
    logs = db.query(AdminAuditLog).order_by(
        AdminAuditLog.timestamp.desc()
    ).offset(offset).limit(limit).all()

    total = db.query(AdminAuditLog).count()

    return {
        "logs": [
            {
                "id": log.id,
                "admin_username": log.admin_username,
                "action_type": log.action_type,
                "target_company_id": log.target_company_id,
                "description": log.description,
                "details": json.loads(log.details) if log.details else None,
                "ip_address": log.ip_address,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


# =============================================================================
# Company Impersonation
# =============================================================================

@app.post("/admin/impersonate/{company_id}")
async def impersonate_company(
    company_id: str,
    admin: dict = Depends(get_super_admin),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """Generate a temporary token to login as a company (for support)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    # Create token for company
    token = create_token({"company_id": company_id, "impersonated_by": admin["username"]})

    # Log admin action
    log_admin_action(
        db, admin["username"], "impersonate",
        target_company_id=company_id,
        description=f"Impersonated company {company.name}",
        ip_address=req.client.host if req else None
    )

    return {
        "token": token,
        "company_id": company_id,
        "company_name": company.name,
        "message": f"Du är nu inloggad som {company.name}. Token gäller i 24 timmar."
    }


# =============================================================================
# Export Company Data
# =============================================================================

@app.get("/admin/export/{company_id}")
async def export_company_data(
    company_id: str,
    admin: dict = Depends(get_super_admin),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """Export all data for a company (for support/GDPR requests)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    settings = db.query(CompanySettings).filter(
        CompanySettings.company_id == company_id
    ).first()

    knowledge = db.query(KnowledgeItem).filter(
        KnowledgeItem.company_id == company_id
    ).all()

    conversations = db.query(Conversation).filter(
        Conversation.company_id == company_id
    ).all()

    # Log admin action
    log_admin_action(
        db, admin["username"], "export_data",
        target_company_id=company_id,
        description=f"Exported all data for {company.name}",
        ip_address=req.client.host if req else None
    )

    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "created_at": company.created_at.isoformat(),
            "is_active": company.is_active
        },
        "settings": {
            "company_name": settings.company_name if settings else "",
            "contact_email": settings.contact_email if settings else "",
            "contact_phone": settings.contact_phone if settings else "",
            "welcome_message": settings.welcome_message if settings else "",
            "primary_color": settings.primary_color if settings else "",
            "data_retention_days": settings.data_retention_days if settings else 30,
            "max_conversations_month": settings.max_conversations_month if settings else 0,
            "current_month_conversations": settings.current_month_conversations if settings else 0
        } if settings else None,
        "knowledge_items": [
            {
                "id": k.id,
                "question": k.question,
                "answer": k.answer,
                "category": k.category,
                "created_at": k.created_at.isoformat()
            }
            for k in knowledge
        ],
        "conversations_count": len(conversations),
        "total_messages": sum(c.message_count or 0 for c in conversations)
    }


# =============================================================================
# Usage Limits Management
# =============================================================================

class UsageLimitUpdate(BaseModel):
    max_conversations_month: int = 0  # 0 = unlimited
    max_knowledge_items: int = 0  # 0 = unlimited


@app.put("/admin/companies/{company_id}/usage-limit")
async def update_usage_limit(
    company_id: str,
    update: UsageLimitUpdate,
    admin: dict = Depends(get_super_admin),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """Update usage limit for a company"""
    settings = get_or_create_settings(db, company_id)

    old_conv_limit = settings.max_conversations_month
    old_knowledge_limit = settings.max_knowledge_items or 0
    settings.max_conversations_month = max(0, update.max_conversations_month)
    settings.max_knowledge_items = max(0, update.max_knowledge_items)
    db.commit()

    # Log admin action
    log_admin_action(
        db, admin["username"], "update_usage_limit",
        target_company_id=company_id,
        description=f"Updated limits: conv {old_conv_limit}→{settings.max_conversations_month}, knowledge {old_knowledge_limit}→{settings.max_knowledge_items}",
        details={
            "old_conv_limit": old_conv_limit,
            "new_conv_limit": settings.max_conversations_month,
            "old_knowledge_limit": old_knowledge_limit,
            "new_knowledge_limit": settings.max_knowledge_items
        },
        ip_address=req.client.host if req else None
    )

    return {
        "message": "Användningsgränser uppdaterade",
        "max_conversations_month": settings.max_conversations_month,
        "current_month_conversations": settings.current_month_conversations,
        "max_knowledge_items": settings.max_knowledge_items
    }


@app.get("/admin/companies/{company_id}/usage")
async def get_company_usage(
    company_id: str,
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Get usage statistics for a company"""
    settings = db.query(CompanySettings).filter(
        CompanySettings.company_id == company_id
    ).first()

    if not settings:
        return {
            "max_conversations_month": 0,
            "current_month_conversations": 0,
            "usage_percent": 0
        }

    usage_percent = 0
    if settings.max_conversations_month > 0:
        usage_percent = (settings.current_month_conversations / settings.max_conversations_month) * 100

    return {
        "max_conversations_month": settings.max_conversations_month,
        "current_month_conversations": settings.current_month_conversations,
        "usage_percent": round(usage_percent, 1),
        "usage_reset_date": settings.usage_reset_date.isoformat() if settings.usage_reset_date else None
    }


@app.get("/admin/company-activity/{company_id}")
async def get_company_activity(
    company_id: str,
    limit: int = 20,
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Get activity logs for a specific company"""
    logs = db.query(CompanyActivityLog).filter(
        CompanyActivityLog.company_id == company_id
    ).order_by(CompanyActivityLog.timestamp.desc()).limit(limit).all()

    return {
        "logs": [
            {
                "id": log.id,
                "action_type": log.action_type,
                "description": log.description,
                "details": log.details,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            }
            for log in logs
        ]
    }


# =============================================================================
# Maintenance Mode
# =============================================================================

class MaintenanceModeUpdate(BaseModel):
    enabled: bool
    message: Optional[str] = None


@app.put("/admin/maintenance-mode")
async def update_maintenance_mode(
    update: MaintenanceModeUpdate,
    admin: dict = Depends(get_super_admin),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """Enable/disable maintenance mode"""
    set_global_setting(db, "maintenance_mode", "true" if update.enabled else "false", admin["username"])

    if update.message:
        set_global_setting(db, "maintenance_message", update.message, admin["username"])

    # Log admin action
    log_admin_action(
        db, admin["username"], "maintenance_mode",
        description=f"{'Enabled' if update.enabled else 'Disabled'} maintenance mode",
        details={"enabled": update.enabled, "message": update.message},
        ip_address=req.client.host if req else None
    )

    return {
        "message": f"Underhållsläge {'aktiverat' if update.enabled else 'inaktiverat'}",
        "enabled": update.enabled
    }


@app.get("/admin/maintenance-mode")
async def get_maintenance_mode(
    admin: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Get current maintenance mode status"""
    enabled, message = is_maintenance_mode(db)
    return {
        "enabled": enabled,
        "message": message
    }


# =============================================================================
# Kör servern
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
