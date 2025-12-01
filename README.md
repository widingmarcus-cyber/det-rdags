# FastighetsAI

En GDPR-säker AI-chatbot för fastighetsbolag där kunder själva bygger sin kunskapsbas.

## Arkitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FASTIGHETSBOLAGETS HEMSIDA                      │
│  ┌──────────────┐                                                   │
│  │ Chattwidget  │ ◀── Inbäddningsbar React-komponent               │
│  └──────┬───────┘                                                   │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin-panel    │────▶│  FastAPI Backend│────▶│     Ollama      │
│  (React)        │     │   (Python)      │     │  (Llama 3.1)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   Kunskapsbas   │
                        │  (Multi-tenant) │
                        └─────────────────┘
```

## Komponenter

### 1. Backend (`/backend`)
- FastAPI REST API
- Multi-tenant kunskapsbas (varje kund har egen data)
- Ollama-integration för AI-svar
- Statistik per tenant

### 2. Admin-panel (`/admin-panel`)
- React + Vite + Tailwind CSS
- Inloggning per tenant
- CRUD för frågor/svar
- Förhandsgranska chatbot
- Se statistik

### 3. Chattwidget (`/chat-widget`)
- Fristående React-komponent
- Inbäddningsbar på valfri hemsida
- Snygg design med animationer
- Kommunicerar med backend via API

## Snabbstart

### Alternativ 1: Docker (rekommenderat)

```bash
# Starta alla tjänster
docker-compose up -d

# Ladda ner AI-modellen (kör efter första uppstarten)
docker exec -it det-rdags-ollama-1 ollama pull llama3.1

# Tjänster:
# - Backend API: http://localhost:8000
# - Admin-panel: http://localhost:3000
# - Widget demo: http://localhost:3001
```

### Alternativ 2: Manuell installation

#### Backend
```bash
# Installera Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1

# Starta backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### Admin-panel
```bash
cd admin-panel
npm install
npm run dev
```

#### Widget
```bash
cd chat-widget
npm install
npm run dev
```

## API-endpoints

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| GET | `/` | Välkomstsida |
| GET | `/health` | Hälsokontroll |
| POST | `/chat` | Skicka fråga till AI |
| GET | `/knowledge/{tenant_id}` | Hämta kunskapsbas |
| POST | `/knowledge/{tenant_id}` | Lägg till fråga/svar |
| DELETE | `/knowledge/{tenant_id}/{index}` | Ta bort fråga/svar |
| GET | `/stats/{tenant_id}` | Hämta statistik |

### Exempel: Skicka fråga

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Hur säger jag upp min lägenhet?", "tenant_id": "demo"}'
```

## Bädda in widget på hemsida

```html
<script src="http://localhost:3001/widget.js"></script>
<script>
  FastighetsAI.init({
    tenantId: "demo",
    apiUrl: "http://localhost:8000",
    title: "Fastighetsbolaget AB",
    welcomeMessage: "Hej! Hur kan jag hjälpa dig?"
  });
</script>
```

## Demo

1. Starta tjänsterna (se Snabbstart ovan)
2. Öppna admin-panelen: http://localhost:3000
3. Logga in med tenant-ID: `demo`
4. Gå till "Förhandsgranska" för att testa chatboten
5. Eller besök widget-demon: http://localhost:3001

## Tech Stack

- **Backend:** Python 3.11, FastAPI, Pydantic, httpx
- **AI:** Ollama, Llama 3.1
- **Admin-panel:** React 18, Vite, Tailwind CSS, React Router
- **Widget:** React 18, Vite (byggt som IIFE för inbäddning)
- **Containerisering:** Docker, docker-compose

## Projektstruktur

```
fastighetsai/
├── backend/
│   ├── main.py           # FastAPI-app
│   ├── requirements.txt  # Python-beroenden
│   ├── Dockerfile
│   └── .env.example
├── admin-panel/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/        # Dashboard, Knowledge, Preview
│   │   └── components/   # Navbar
│   ├── package.json
│   └── Dockerfile
├── chat-widget/
│   ├── src/
│   │   └── widget.jsx    # Chattwidget-komponent
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Licens

Proprietär - Alla rättigheter förbehålls
