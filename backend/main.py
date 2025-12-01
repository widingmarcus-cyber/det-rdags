"""
Bobot Backend API
En GDPR-säker AI-chatbot för fastighetsbolag
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import httpx
import os
from dotenv import load_dotenv

from database import create_tables, get_db, Company, KnowledgeItem, ChatLog, SuperAdmin
from auth import (
    hash_password, verify_password, create_token,
    get_current_company, get_super_admin
)

load_dotenv()

app = FastAPI(
    title="Bobot API",
    description="AI-chatbot backend för fastighetsbolag",
    version="2.0.0"
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


class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []


class KnowledgeItemCreate(BaseModel):
    question: str
    answer: str


class KnowledgeItemResponse(BaseModel):
    id: int
    question: str
    answer: str


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


class SuperAdminLogin(BaseModel):
    username: str
    password: str


class StatsResponse(BaseModel):
    total_questions: int
    knowledge_items: int
    questions_today: int
    questions_this_week: int


# =============================================================================
# Startup
# =============================================================================

@app.on_event("startup")
async def startup():
    """Skapa tabeller och demo-data vid start"""
    create_tables()

    db = next(get_db())

    # Skapa super admin om den inte finns
    admin = db.query(SuperAdmin).filter(SuperAdmin.username == "admin").first()
    if not admin:
        admin = SuperAdmin(
            username="admin",
            password_hash=hash_password("admin123")  # Byt i produktion!
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

        # Lägg till demo-kunskapsbas
        demo_items = [
            ("Hur säger jag upp min lägenhet?",
             "För att säga upp din lägenhet behöver du skicka en skriftlig uppsägning till oss. Uppsägningstiden är vanligtvis 3 månader."),
            ("Vad ingår i hyran?",
             "I hyran ingår vanligtvis värme, vatten, sophämtning och tillgång till gemensamma utrymmen som tvättstuga."),
            ("Hur anmäler jag ett fel i lägenheten?",
             "Felanmälan görs via vår hemsida under 'Felanmälan' eller genom att ringa kundtjänst på 08-123 456 78."),
            ("När är tvättstugan öppen?",
             "Tvättstugan är öppen dygnet runt. Du bokar tvättid via bokningstavlan eller vår app."),
            ("Får jag ha husdjur?",
             "Ja, husdjur är tillåtna så länge de inte stör grannar eller orsakar skada."),
        ]

        for q, a in demo_items:
            item = KnowledgeItem(company_id="demo", question=q, answer=a)
            db.add(item)

        db.commit()
        print("Demo-företag skapat: demo / demo123")

    db.close()


# =============================================================================
# Hjälpfunktioner
# =============================================================================

def find_relevant_context(question: str, company_id: str, db: Session, top_k: int = 3) -> List[KnowledgeItem]:
    """Hitta relevanta frågor/svar från kunskapsbasen"""
    items = db.query(KnowledgeItem).filter(KnowledgeItem.company_id == company_id).all()

    question_lower = question.lower()
    question_words = set(question_lower.split())

    scored_items = []
    for item in items:
        item_words = set(item.question.lower().split())
        common_words = question_words & item_words
        score = len(common_words)
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


def build_prompt(question: str, context: List[KnowledgeItem]) -> str:
    """Bygg prompt med kontext"""
    context_text = ""
    if context:
        context_text = "Relevant information:\n\n"
        for item in context:
            context_text += f"F: {item.question}\nS: {item.answer}\n\n"

    return f"""Du är en hjälpsam kundtjänstassistent för ett fastighetsbolag.
Svara på svenska, trevligt och professionellt.
Om du inte vet svaret, säg det ärligt.

{context_text}
Kundens fråga: {question}

Svar:"""


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
async def chat(company_id: str, request: ChatRequest, db: Session = Depends(get_db)):
    """Chatta med AI - öppen endpoint för widget"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company or not company.is_active:
        raise HTTPException(status_code=404, detail="Företag finns inte")

    # Hitta kontext
    context = find_relevant_context(request.question, company_id, db)

    # Bygg prompt och fråga AI
    prompt = build_prompt(request.question, context)
    answer = await query_ollama(prompt)

    # Logga frågan
    log = ChatLog(company_id=company_id, question=request.question, answer=answer)
    db.add(log)
    db.commit()

    sources = [item.question for item in context]
    return ChatResponse(answer=answer, sources=sources)


# =============================================================================
# Company Endpoints (Autentiserade)
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

    return [KnowledgeItemResponse(id=i.id, question=i.question, answer=i.answer) for i in items]


@app.post("/knowledge", response_model=KnowledgeItemResponse)
async def add_knowledge(
    item: KnowledgeItemCreate,
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Lägg till fråga/svar"""
    new_item = KnowledgeItem(
        company_id=current["company_id"],
        question=item.question,
        answer=item.answer
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return KnowledgeItemResponse(id=new_item.id, question=new_item.question, answer=new_item.answer)


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
    db.commit()

    return KnowledgeItemResponse(id=db_item.id, question=db_item.question, answer=db_item.answer)


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

    db.delete(db_item)
    db.commit()

    return {"message": "Borttagen"}


@app.get("/stats", response_model=StatsResponse)
async def get_stats(
    current: dict = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Hämta statistik för inloggat företag"""
    company_id = current["company_id"]

    total = db.query(ChatLog).filter(ChatLog.company_id == company_id).count()
    knowledge = db.query(KnowledgeItem).filter(KnowledgeItem.company_id == company_id).count()

    today = datetime.utcnow().date()
    today_count = db.query(ChatLog).filter(
        ChatLog.company_id == company_id,
        func.date(ChatLog.created_at) == today
    ).count()

    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    week_count = db.query(ChatLog).filter(
        ChatLog.company_id == company_id,
        ChatLog.created_at >= week_ago
    ).count()

    return StatsResponse(
        total_questions=total,
        knowledge_items=knowledge,
        questions_today=today_count,
        questions_this_week=week_count
    )


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

        result.append(CompanyResponse(
            id=c.id,
            name=c.name,
            is_active=c.is_active,
            created_at=c.created_at,
            knowledge_count=knowledge_count,
            chat_count=chat_count
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

    db.delete(company)
    db.commit()

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

    return {"message": f"Företag {'aktiverat' if company.is_active else 'inaktiverat'}"}


# =============================================================================
# Kör servern
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
