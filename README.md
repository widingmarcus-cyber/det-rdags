# Bobot

En GDPR-säker AI-chatbot för fastighetsbolag där kunder själva bygger sin kunskapsbas.

**Live:** [bobot.nu](https://bobot.nu)

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
│  (React + Vite) │     │   (Python)      │     │ (Qwen 2.5 14B)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   SQLite DB     │
                        │  (Multi-tenant) │
                        └─────────────────┘
```

## Funktioner

- **Multi-tenant arkitektur** - Varje företag har isolerad data
- **AI-drivna svar** - Ollama med Qwen 2.5 14B
- **Flerspråksstöd** - Svenska, engelska, arabiska (med RTL)
- **GDPR-kompatibel** - Automatisk dataradering, samtyckehantering
- **Realtidsanalys** - Statistik och konversationshistorik
- **Widget-hantering** - Flera widgets per företag med individuella inställningar
- **Säkerhet** - Rate limiting, brute force-skydd, 2FA för superadmin

## Komponenter

### 1. Backend (`/backend`)
- FastAPI REST API med ~80 endpoints
- Multi-tenant databas med SQLAlchemy ORM (SQLite/PostgreSQL)
- Ollama-integration för AI-svar
- JWT-autentisering med bcrypt + 2FA (TOTP)
- GDPR-automatisk rensning varje timme

### 2. Admin-panel (`/admin-panel`)
- React 18 + Vite + Tailwind CSS
- Inloggning per företag
- CRUD för frågor/svar med filuppladdning (Excel, Word, CSV, PDF)
- Widget-hantering och förhandsgranskning
- Detaljerad statistik och analys
- Superadmin-dashboard med företagshantering

### 3. Chattwidget (`/chat-widget`)
- Fristående React-komponent (IIFE)
- Inbäddningsbar på valfri hemsida
- Mörkt läge och RTL-stöd
- GDPR-samtycke och datarättigheter

## Snabbstart

### Alternativ 1: Docker (rekommenderat)

```bash
# Starta alla tjänster
docker-compose up -d

# Ladda ner AI-modellen (kör efter första uppstarten)
docker exec -it bobot-ollama-1 ollama pull qwen2.5:14b

# Tjänster:
# - Backend API: http://localhost:8000
# - Admin-panel: http://localhost:3000
# - Widget demo: http://localhost:3001
```

### Alternativ 2: Manuell installation

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
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
| POST | `/chat/widget/{widget_key}` | Chatta via widget-nyckel |
| POST | `/chat/{company_id}/feedback` | Lämna feedback på svar |
| GET | `/widget/{company_id}/config` | Hämta widget-konfiguration |
| GET | `/widget/key/{widget_key}/config` | Hämta config via widget-nyckel |

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
| POST | `/knowledge/upload` | Ladda upp Excel/Word/CSV/PDF |
| POST | `/knowledge/import-url` | Importera från URL |
| GET | `/conversations` | Lista konversationer |
| GET | `/stats` | Grundläggande statistik |
| GET | `/analytics` | Detaljerad analys |
| GET/POST | `/widgets` | Widget-hantering |
| GET | `/templates` | Kunskapsmallar |
| GET | `/export/conversations` | Exportera som CSV |

### GDPR (offentliga med session)

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
| PUT | `/admin/companies/{id}/pricing` | Sätt prissättning |
| GET | `/admin/system-health` | Systemstatus |
| POST | `/admin/gdpr-cleanup` | Manuell GDPR-rensning |
| GET | `/admin/revenue-dashboard` | Intäktsanalys |
| GET/POST | `/admin/pricing-tiers/db` | Prissättning |

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
<script src="https://bobot.nu/widget.js"></script>
<script>
  Bobot.init({
    widgetKey: "ditt-widget-key",
    apiUrl: "https://bobot.nu/api"
  });
</script>
```

### WordPress-integration

Lägg till i `functions.php` eller via plugin:

```php
function add_bobot_chatbot() {
    ?>
    <script src="https://bobot.nu/widget.js"></script>
    <script>
        Bobot.init({
            widgetKey: 'ditt-widget-key',
            apiUrl: 'https://bobot.nu/api'
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
4. Gå till widgetsidan för att hantera frågor/svar
5. Förhandsgranska chatboten i admin-panelen
6. Eller besök widget-demon: http://localhost:3001

## Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2
- **AI:** Ollama, Qwen 2.5 14B
- **Databas:** SQLite (PostgreSQL stöds)
- **Admin-panel:** React 18, Vite, Tailwind CSS, React Router v6
- **Widget:** React 18 (byggt som IIFE för inbäddning)
- **Säkerhet:** bcrypt, JWT, TOTP (2FA), rate limiting
- **Containerisering:** Docker, docker-compose

## Projektstruktur

```
bobot/
├── backend/
│   ├── main.py              # FastAPI-app (~80 endpoints)
│   ├── database.py          # SQLAlchemy-modeller (~25 tabeller)
│   ├── auth.py              # JWT-autentisering + 2FA
│   ├── email_service.py     # E-postnotifieringar
│   ├── requirements.txt     # Python-beroenden
│   ├── Dockerfile
│   └── templates/           # Kunskapsmallar (JSON)
├── admin-panel/
│   ├── src/
│   │   ├── App.jsx          # Huvudapp med routing
│   │   ├── components/
│   │   │   └── Navbar.jsx   # Navigeringssidofält
│   │   └── pages/
│   │       ├── Login.jsx         # Företagsinloggning
│   │       ├── AdminLogin.jsx    # Superadmin (2FA)
│   │       ├── Dashboard.jsx     # Statistiköversikt
│   │       ├── WidgetPage.jsx    # Widget + kunskapsbas
│   │       ├── Conversations.jsx # Chatthistorik
│   │       ├── Analytics.jsx     # Detaljerad analys
│   │       ├── Settings.jsx      # Företagsinställningar
│   │       ├── SuperAdmin.jsx    # Multi-tenant-hantering
│   │       └── LandingPage.jsx   # Publik landningssida
│   └── Dockerfile
├── chat-widget/
│   ├── src/
│   │   └── widget.jsx       # Komplett widget-komponent
│   └── Dockerfile
├── deploy/
│   ├── docker-compose.prod.yml
│   ├── nginx.conf           # Nginx reverse proxy
│   └── .env.prod            # Produktionsmiljö
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
CORS_ORIGINS=https://bobot.nu,https://www.bobot.nu

# Valfritt
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
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
