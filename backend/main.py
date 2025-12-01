"""
FastighetsAI Backend API
En GDPR-säker AI-chatbot för fastighetsbolag
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="FastighetsAI API",
    description="AI-chatbot backend för fastighetsbolag",
    version="1.0.0"
)

# CORS för att tillåta widget-anrop
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # I produktion: begränsa till specifika domäner
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama-konfiguration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")


# =============================================================================
# In-memory kunskapsbas (multi-tenant)
# =============================================================================

# Struktur: {tenant_id: [{"question": str, "answer": str}, ...]}
knowledge_base: dict[str, list[dict]] = {
    "demo": [
        {
            "question": "Hur säger jag upp min lägenhet?",
            "answer": "För att säga upp din lägenhet behöver du skicka en skriftlig uppsägning till oss. Uppsägningstiden är vanligtvis 3 månader. Du kan skicka uppsägningen via e-post till uppsagning@fastighetsbolag.se eller via post."
        },
        {
            "question": "Vad ingår i hyran?",
            "answer": "I hyran ingår vanligtvis värme, vatten, sophämtning och tillgång till gemensamma utrymmen som tvättstuga. El och internet betalar hyresgästen själv om inget annat avtalats."
        },
        {
            "question": "Hur anmäler jag ett fel i lägenheten?",
            "answer": "Felanmälan görs enklast via vår hemsida under 'Felanmälan' eller genom att ringa vår kundtjänst på 08-123 456 78. Beskriv felet så detaljerat som möjligt och ange dina kontaktuppgifter."
        },
        {
            "question": "När är tvättstugan öppen?",
            "answer": "Tvättstugan är öppen dygnet runt. Du bokar tvättid via bokningstavlan i tvättstugan eller via vår app. Varje bokning är 3 timmar lång."
        },
        {
            "question": "Får jag ha husdjur i lägenheten?",
            "answer": "Ja, husdjur är tillåtna i våra lägenheter så länge de inte stör grannar eller orsakar skada. Kontrollera ditt hyresavtal för eventuella specifika villkor."
        },
    ]
}


# =============================================================================
# Pydantic-modeller
# =============================================================================

class ChatRequest(BaseModel):
    question: str
    tenant_id: str = "demo"


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []


class KnowledgeItem(BaseModel):
    question: str
    answer: str


# =============================================================================
# Hjälpfunktioner
# =============================================================================

def find_relevant_context(question: str, tenant_id: str, top_k: int = 3) -> list[dict]:
    """
    Hitta relevanta frågor/svar från kunskapsbasen.
    Enkel sökning baserad på ordmatchning (kan bytas till vektorsökning senare).
    """
    if tenant_id not in knowledge_base:
        return []

    kb = knowledge_base[tenant_id]
    question_lower = question.lower()
    question_words = set(question_lower.split())

    # Poängsätt varje kunskapsobjekt baserat på ordmatchning
    scored_items = []
    for item in kb:
        item_words = set(item["question"].lower().split())
        # Räkna gemensamma ord
        common_words = question_words & item_words
        score = len(common_words)
        if score > 0:
            scored_items.append((score, item))

    # Sortera efter poäng och returnera top_k
    scored_items.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in scored_items[:top_k]]


async def query_ollama(prompt: str) -> str:
    """
    Skicka en fråga till Ollama och returnera svaret.
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "Kunde inte generera svar.")
        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail="Kan inte ansluta till Ollama. Kontrollera att Ollama körs lokalt."
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Timeout vid anslutning till Ollama."
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Fel vid kommunikation med Ollama: {str(e)}"
            )


def build_prompt(question: str, context: list[dict]) -> str:
    """
    Bygg prompt med kontext för Ollama.
    """
    context_text = ""
    if context:
        context_text = "Här är relevant information från vår kunskapsbas:\n\n"
        for item in context:
            context_text += f"Fråga: {item['question']}\nSvar: {item['answer']}\n\n"

    prompt = f"""Du är en hjälpsam kundtjänstassistent för ett fastighetsbolag.
Svara på svenska och var trevlig och professionell.
Om du inte vet svaret, säg det ärligt.

{context_text}
Kundens fråga: {question}

Svar:"""

    return prompt


# =============================================================================
# API-endpoints
# =============================================================================

@app.get("/")
async def root():
    """Hälsningssida"""
    return {
        "message": "Välkommen till FastighetsAI API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Hälsokontroll"""
    return {"status": "healthy"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Huvudendpoint för chatbot.
    Tar emot en fråga och returnerar AI-genererat svar.
    """
    # Hitta relevant kontext
    context = find_relevant_context(request.question, request.tenant_id)

    # Bygg prompt med kontext
    prompt = build_prompt(request.question, context)

    # Fråga Ollama
    answer = await query_ollama(prompt)

    # Samla källor (frågor som användes som kontext)
    sources = [item["question"] for item in context]

    return ChatResponse(answer=answer, sources=sources)


# =============================================================================
# Kunskapsbas-endpoints (för admin-panel)
# =============================================================================

@app.get("/knowledge/{tenant_id}")
async def get_knowledge(tenant_id: str):
    """Hämta alla frågor/svar för en tenant"""
    if tenant_id not in knowledge_base:
        knowledge_base[tenant_id] = []
    return {"tenant_id": tenant_id, "items": knowledge_base[tenant_id]}


@app.post("/knowledge/{tenant_id}")
async def add_knowledge(tenant_id: str, item: KnowledgeItem):
    """Lägg till en fråga/svar för en tenant"""
    if tenant_id not in knowledge_base:
        knowledge_base[tenant_id] = []

    knowledge_base[tenant_id].append({
        "question": item.question,
        "answer": item.answer
    })

    return {"message": "Tillagd", "item": item}


@app.delete("/knowledge/{tenant_id}/{index}")
async def delete_knowledge(tenant_id: str, index: int):
    """Ta bort en fråga/svar för en tenant"""
    if tenant_id not in knowledge_base:
        raise HTTPException(status_code=404, detail="Tenant finns inte")

    if index < 0 or index >= len(knowledge_base[tenant_id]):
        raise HTTPException(status_code=404, detail="Index finns inte")

    removed = knowledge_base[tenant_id].pop(index)
    return {"message": "Borttagen", "item": removed}


# =============================================================================
# Kör servern
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
