# Bobot

En GDPR-säker AI-chatbot där företag bygger sin egen kunskapsbas för automatiserad kundservice.

**Live:** [bobot.nu](https://bobot.nu) | **Demo:** [demo.bobot.nu](https://demo.bobot.nu)

## Vad är Bobot?

Bobot är en SaaS-plattform där företag skapar sin egen AI-chatbot genom att bygga en kunskapsbas med frågor och svar. Chatboten bäddas in på företagets hemsida och besvarar kundfrågor automatiskt med AI-stöd.

### Funktioner

- **Kunskapsbas** - Lägg till Q&A manuellt eller importera från Excel, Word, CSV, PDF eller URL
- **AI-svar** - Ollama med Qwen 2.5 14B för intelligenta svar baserade på kunskapsbasen
- **Flera widgets** - Skapa olika chatbotar för interna och externa användare
- **Flerspråksstöd** - Svenska, engelska, arabiska (med RTL-stöd)
- **GDPR-kompatibel** - Automatisk dataradering, samtyckehantering, audit-logg
- **Realtidsanalys** - Statistik, konversationshistorik, vanliga frågor
- **Anpassningsbar design** - Färger, typsnitt, meddelanden

## Arkitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                       KUNDENS HEMSIDA                               │
│  ┌──────────────┐                                                   │
│  │ Chattwidget  │ ◀── Inbäddningsbar React-komponent               │
│  └──────┬───────┘                                                   │
└─────────┼───────────────────────────────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Nginx       │────▶│  FastAPI Backend│────▶│     Ollama      │
│  (SSL + Proxy)  │     │   (Python)      │     │ (Qwen 2.5 14B)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
┌─────────────────┐     ┌────────▼────────┐
│  Admin-panel    │     │   SQLite DB     │
│  (React + Vite) │     │  (Multi-tenant) │
└─────────────────┘     └─────────────────┘
```

## Snabbstart

### Med Docker (rekommenderat)

```bash
# Klona och starta
git clone <repo-url>
cd bobot
docker-compose up -d

# Ladda ner AI-modellen (första gången)
docker exec -it bobot-ollama-1 ollama pull qwen2.5:14b
```

**Tjänster:**
- Admin-panel: http://localhost:3000
- Backend API: http://localhost:8000
- Widget demo: http://localhost:3001

### Inloggningsuppgifter (utveckling)

| Kontotyp | ID | Lösenord |
|----------|-----|----------|
| Demo-företag | `demo` | `demo123` |
| Super Admin | `admin` | `admin123` |

## Bädda in widget

```html
<script src="https://bobot.nu/widget.js"></script>
<script>
  Bobot.init({
    widgetKey: "ditt-widget-key",
    apiUrl: "https://bobot.nu/api"
  });
</script>
```

### WordPress

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

## Tech Stack

| Komponent | Teknologi |
|-----------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0 |
| Databas | SQLite (PostgreSQL stöds) |
| AI | Ollama, Qwen 2.5 14B |
| Frontend | React 18, Vite, Tailwind CSS |
| Widget | React 18 (IIFE för inbäddning) |
| Säkerhet | bcrypt, JWT, TOTP 2FA |
| Infrastruktur | Docker, Nginx, Let's Encrypt |

## Projektstruktur

```
bobot/
├── backend/                    # FastAPI backend (~8400 rader)
│   ├── main.py                 # ~100 API-endpoints
│   ├── database.py             # SQLAlchemy-modeller (~25 tabeller)
│   ├── auth.py                 # JWT, bcrypt, TOTP
│   ├── templates/              # Kunskapsmallar (JSON)
│   └── Dockerfile
│
├── admin-panel/                # React admin-dashboard
│   ├── src/
│   │   ├── pages/              # Sidkomponenter
│   │   └── components/
│   │       └── superadmin/     # SuperAdmin-tabbar
│   └── Dockerfile
│
├── chat-widget/                # Inbäddningsbar widget (~1500 rader)
│   └── src/widget.jsx
│
├── deploy/                     # Produktionsdistribution
│   ├── docker-compose.prod.yml
│   ├── nginx.conf              # SSL + reverse proxy
│   └── .env.prod
│
├── docker-compose.yml          # Utvecklingsmiljö
├── CLAUDE.md                   # Teknisk dokumentation
└── README.md                   # Denna fil
```

## API-översikt

### Publika endpoints
```
POST /chat/{company_id}           # Skicka fråga
POST /chat/widget/{widget_key}    # Chatta via widget-nyckel
GET  /widget/{company_id}/config  # Widget-konfiguration
GET  /health                      # Hälsokontroll
```

### Företagsendpoints (kräver JWT)
```
GET/POST /knowledge               # Kunskapsbas CRUD
POST     /knowledge/upload        # Filuppladdning
GET/POST /widgets                 # Widget-hantering
GET      /templates               # Kunskapsmallar
GET      /analytics               # Statistik
```

### Superadmin-endpoints
```
GET/POST /admin/companies         # Företagshantering
GET      /admin/system-health     # Systemstatus
GET      /admin/analytics/*       # Plattformsanalys
```

## Miljövariabler

```bash
# Krävs i produktion
ENVIRONMENT=production
SECRET_KEY=<generera-säker-nyckel>
CORS_ORIGINS=https://bobot.nu,https://www.bobot.nu

# AI-konfiguration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
```

## Säkerhet

- **Lösenord:** bcrypt med cost factor 12
- **Sessions:** JWT med 24h livstid
- **2FA:** TOTP för Super Admin
- **Rate limiting:** 15 req/min chat, 30 req/min API
- **Brute force:** Lås efter 5 försök (15 min)
- **HTTPS:** Obligatoriskt i produktion med HSTS

## GDPR

- Konfigurerbar datalagring (7-30 dagar)
- Automatisk rensning varje timme
- IP-anonymisering
- Samtyckehantering i widget
- Data export/radering för användare
- Audit-logg

## Kommandon

```bash
# Loggar
docker-compose logs -f backend

# Bygg om
docker-compose build backend && docker-compose up -d backend

# Återställ databas
rm backend/bobot.db && docker-compose restart backend

# Testa API
curl -X POST http://localhost:8000/chat/demo \
  -H "Content-Type: application/json" \
  -d '{"question": "Testar chatboten"}'
```

## Produktion

```bash
# Deploy
cd deploy
docker-compose -f docker-compose.prod.yml up -d

# SSL med Certbot
sudo certbot --nginx -d bobot.nu -d www.bobot.nu -d demo.bobot.nu
```

## Dokumentation

Se [CLAUDE.md](CLAUDE.md) för detaljerad teknisk dokumentation, API-referens och utvecklingsguide.

## Licens

Proprietär - Alla rättigheter förbehålls
