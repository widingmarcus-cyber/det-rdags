# Bobot

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
                        │   SQLite DB     │
                        │  (Multi-tenant) │
                        └─────────────────┘
```

## Funktioner

- **Multi-tenant arkitektur** - Varje företag har isolerad data
- **AI-drivna svar** - Ollama med Llama 3.1
- **Flerspråksstöd** - Svenska, engelska, arabiska (med RTL)
- **GDPR-kompatibel** - Automatisk dataradering, samtyckehantering
- **Realtidsanalys** - Statistik och konversationshistorik
- **Widget-hantering** - Flera widgets per företag med individuella inställningar
- **Säkerhet** - Rate limiting, brute force-skydd, 2FA för superadmin

## Komponenter

### 1. Backend (`/backend`)
- FastAPI REST API med 70+ endpoints
- Multi-tenant databas med SQLAlchemy ORM
- Ollama-integration för AI-svar
- JWT-autentisering med bcrypt
- GDPR-automatisk rensning

### 2. Admin-panel (`/admin-panel`)
- React 18 + Vite + Tailwind CSS
- Inloggning per företag
- CRUD för frågor/svar med filuppladdning
- Widget-hantering och förhandsgranskning
- Detaljerad statistik och analys
- Superadmin-dashboard

### 3. Chattwidget (`/chat-widget`)
- Fristående React-komponent (IIFE)
- Inbäddningsbar på valfri hemsida
- Mörkt läge och RTL-stöd
- Sessionshantering med localStorage

## Snabbstart

### Alternativ 1: Docker (rekommenderat)

```bash
# Starta alla tjänster
docker-compose up -d

# Ladda ner AI-modellen (kör efter första uppstarten)
docker exec -it bobot-ollama-1 ollama pull llama3.1

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
source venv/bin/activate  # Linux/Mac
# eller: venv\Scripts\activate  # Windows
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

## Inloggning

| Kontotyp | ID/Användarnamn | Lösenord |
|----------|-----------------|----------|
| Demo-företag | `demo` | `demo123` |
| Super Admin | `admin` | `admin123` |

## API-endpoints

### Publika (Widget)

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| POST | `/chat/{company_id}` | Skicka fråga, få AI-svar |
| POST | `/chat/{company_id}/feedback` | Lämna feedback på svar |
| GET | `/widget/{company_id}/config` | Hämta widget-konfiguration |
| POST | `/chat/widget/{widget_key}` | Chatta via widget-nyckel |

### Autentisering

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| POST | `/auth/login` | Företagsinloggning |
| POST | `/auth/admin/login` | Superadmin-inloggning |
| POST | `/auth/admin/verify-2fa` | 2FA-verifiering |

### Företag (kräver JWT)

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| GET/PUT | `/settings` | Företagsinställningar |
| GET/POST | `/knowledge` | Kunskapsbas CRUD |
| PUT/DELETE | `/knowledge/{item_id}` | Redigera/ta bort fråga |
| POST | `/knowledge/upload` | Ladda upp Excel/Word/CSV |
| POST | `/knowledge/import-url` | Importera från URL |
| GET | `/conversations` | Lista konversationer |
| GET/DELETE | `/conversations/{id}` | Visa/ta bort konversation |
| GET | `/stats` | Grundläggande statistik |
| GET | `/analytics` | Detaljerad analys |
| GET/POST | `/widgets` | Widget-hantering |
| GET/PUT/DELETE | `/widgets/{id}` | Specifik widget |
| GET | `/export/conversations` | Exportera som CSV |
| GET | `/export/knowledge` | Exportera kunskapsbas |

### GDPR (offentliga med samtycke)

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| POST | `/gdpr/{company_id}/consent` | Ge/återkalla samtycke |
| GET | `/gdpr/{company_id}/my-data` | Ladda ner mina data |
| DELETE | `/gdpr/{company_id}/my-data` | Begär radering |

### Super Admin

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| GET/POST | `/admin/companies` | Lista/skapa företag |
| DELETE | `/admin/companies/{id}` | Ta bort företag |
| PUT | `/admin/companies/{id}/toggle` | Aktivera/inaktivera |
| GET | `/admin/system-health` | Systemstatus |
| POST | `/admin/gdpr-cleanup` | Manuell GDPR-rensning |
| GET | `/admin/revenue-dashboard` | Intäktsanalys |
| GET/POST | `/admin/pricing-tiers` | Prissättning |

### Exempel: Skicka fråga

```bash
curl -X POST http://localhost:8000/chat/demo \
  -H "Content-Type: application/json" \
  -d '{"question": "Hur säger jag upp min lägenhet?"}'
```

### Exempel: Logga in

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"company_id": "demo", "password": "demo123"}'
```

## Bädda in widget på hemsida

```html
<script src="https://din-bobot-domän.se/widget.js"></script>
<script>
  Bobot.init({
    companyId: "ditt-företags-id",
    apiUrl: "https://din-bobot-domän.se"
  });
</script>
```

### WordPress-integration

Lägg till i `functions.php` eller via plugin:

```php
function add_bobot_chatbot() {
    ?>
    <script src="https://din-bobot-domän.se/widget.js"></script>
    <script>
        Bobot.init({
            companyId: 'ditt-företags-id',
            apiUrl: 'https://din-bobot-domän.se'
        });
    </script>
    <?php
}
add_action('wp_footer', 'add_bobot_chatbot');
```

## Demo

1. Starta tjänsterna (se Snabbstart ovan)
2. Öppna admin-panelen: http://localhost:3000
3. Logga in med företags-ID: `demo`, lösenord: `demo123`
4. Gå till "Kunskapsbas" för att lägga till frågor/svar
5. Gå till "Förhandsgranska" för att testa chatboten
6. Eller besök widget-demon: http://localhost:3001

## Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic v2
- **AI:** Ollama, Llama 3.1
- **Databas:** SQLite (PostgreSQL stöds)
- **Admin-panel:** React 18, Vite, Tailwind CSS, React Router v6
- **Widget:** React 18 (byggt som IIFE för inbäddning)
- **Säkerhet:** bcrypt, JWT, rate limiting, 2FA (TOTP)
- **Containerisering:** Docker, docker-compose

## Projektstruktur

```
bobot/
├── backend/
│   ├── main.py              # FastAPI-app (70+ endpoints)
│   ├── database.py          # SQLAlchemy-modeller
│   ├── auth.py              # JWT-autentisering
│   ├── requirements.txt     # Python-beroenden
│   ├── Dockerfile
│   └── .env.example
├── admin-panel/
│   ├── src/
│   │   ├── App.jsx          # Huvudapp med routing
│   │   ├── components/
│   │   │   ├── Navbar.jsx   # Navigeringssidofält
│   │   │   └── ProposalPDF.jsx
│   │   └── pages/
│   │       ├── Login.jsx         # Företagsinloggning
│   │       ├── AdminLogin.jsx    # Superadmin-inloggning
│   │       ├── Dashboard.jsx     # Statistiköversikt
│   │       ├── Knowledge.jsx     # Kunskapsbas CRUD
│   │       ├── Conversations.jsx # Chatthistorik
│   │       ├── Analytics.jsx     # Detaljerad analys
│   │       ├── Settings.jsx      # Företagsinställningar
│   │       ├── Preview.jsx       # Widget-förhandsgranskning
│   │       ├── Widgets.jsx       # Widget-hantering
│   │       ├── WidgetPage.jsx    # Individuell widget-redigerare
│   │       ├── SuperAdmin.jsx    # Multi-tenant-hantering
│   │       ├── LandingPage.jsx   # Publik landningssida
│   │       └── Documentation.jsx # API-dokumentation
│   ├── package.json
│   └── Dockerfile
├── chat-widget/
│   ├── src/
│   │   └── widget.jsx       # Komplett widget-komponent
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── CLAUDE.md                # Utvecklingsdokumentation
├── bobot_specifikation.md   # Produktspecifikation
└── README.md
```

## Miljövariabler

```bash
# Produktion (krävs)
ENVIRONMENT=production
SECRET_KEY=<generera-med-secrets-modulen>
CORS_ORIGINS=https://app.bobot.se,https://admin.bobot.se

# Valfritt
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
DATABASE_URL=sqlite:///./bobot.db
SENTRY_DSN=<din-sentry-dsn>
ADMIN_PASSWORD=<starkt-lösenord>
```

## Säkerhet

- **Lösenord:** bcrypt med cost factor 12
- **Sessions:** JWT med 24h livstid
- **Rate limiting:** 15/min för chat, 30/min för admin
- **Brute force:** Lås efter 5 misslyckade försök (15 min)
- **2FA:** TOTP för Super Admin (Google Authenticator)
- **HTTPS:** Obligatoriskt i produktion (HSTS)
- **CORS:** Miljöbaserad, strikt i produktion

## GDPR-kompatibilitet

- Konfigurerbar datalagring (7-30 dagar)
- Automatisk rensning varje timme
- IP-anonymisering (sista oktetten maskeras)
- Samtyckehantering i widget
- Endpoint för att ladda ner/radera användardata
- Audit-logg för datåtkomst

## Licens

Proprietär - Alla rättigheter förbehålls
