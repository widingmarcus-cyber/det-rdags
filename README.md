# FastighetsAI

En GDPR-säker AI-chatbot för fastighetsbolag där kunder själva bygger sin kunskapsbas.

## Arkitektur

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Chattwidget   │────▶│  FastAPI Backend│────▶│     Ollama      │
│   (React)       │     │   (Python)      │     │  (Llama 3.1)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   Kunskapsbas   │
                        │  (Multi-tenant) │
                        └─────────────────┘
```

## Komponenter

### 1. Backend (Python/FastAPI)
- API som tar emot användarfrågor
- Söker i kundens kunskapsbas
- Skickar kontext + fråga till Ollama
- Multi-tenant: varje kund har egen data

### 2. Admin-panel (kommer)
- Inloggning per kund
- CRUD för frågor/svar
- Förhandsgranska chatbot

### 3. Chattwidget (kommer)
- Inbäddningsbar på kundens hemsida
- Enkel, snygg design

## Snabbstart

### Förutsättningar
- Python 3.11+
- Ollama installerat och igång

### Installation

```bash
# Installera Ollama och ladda ner Llama 3.1
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1

# Gå till backend-katalogen
cd backend

# Skapa virtuell miljö
python -m venv venv
source venv/bin/activate  # På Windows: venv\Scripts\activate

# Installera beroenden
pip install -r requirements.txt

# Kopiera miljövariabler
cp .env.example .env

# Starta servern
python main.py
```

### API-endpoints

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| GET | `/` | Välkomstsida |
| GET | `/health` | Hälsokontroll |
| POST | `/chat` | Skicka fråga till AI |
| GET | `/knowledge/{tenant_id}` | Hämta kunskapsbas |
| POST | `/knowledge/{tenant_id}` | Lägg till fråga/svar |
| DELETE | `/knowledge/{tenant_id}/{index}` | Ta bort fråga/svar |

### Exempel: Skicka fråga

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Hur säger jag upp min lägenhet?", "tenant_id": "demo"}'
```

### API-dokumentation

När servern körs, besök:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Tech Stack

- **Backend:** Python, FastAPI, Pydantic
- **AI:** Ollama med Llama 3.1
- **Frontend:** React, Tailwind CSS (kommer)
- **Vektorlagring:** Chroma (kommer)

## Licens

Proprietär - Alla rättigheter förbehålls
