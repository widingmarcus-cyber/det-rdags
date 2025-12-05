# CLAUDE.md - Bobot AI Chatbot Platform

## Project Overview

**Bobot** is a GDPR-compliant AI chatbot platform where businesses build their own knowledge base of Q&A pairs. The AI uses this knowledge to answer customer questions via an embeddable chat widget.

**Production Domain:** bobot.nu

### Key Features
- Multi-tenant architecture with tenant isolation
- AI-powered responses using Ollama (Qwen 2.5 14B)
- Multi-language support (Swedish, English, Arabic with RTL)
- GDPR-compliant with automatic data retention cleanup
- Real-time analytics and conversation tracking
- Embeddable chat widget for customer websites
- Multiple widgets per company (internal/external) with individual settings
- Knowledge base templates for quick setup
- 2FA authentication for super admins
- Rate limiting and brute force protection

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER WEBSITE                                │
│  ┌──────────────┐                                                   │
│  │ Chat Widget  │ ◀── Embeddable React component (IIFE)            │
│  └──────┬───────┘                                                   │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin Panel    │────▶│  FastAPI Backend│────▶│     Ollama      │
│  (React + Vite) │     │   (Python)      │     │ (Qwen 2.5 14B)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   SQLite DB     │
                        │  (Multi-tenant) │
                        └─────────────────┘
```

## Directory Structure

```
bobot/
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI app (~80 endpoints, ~7000 lines)
│   ├── database.py             # SQLAlchemy models (~25 tables)
│   ├── auth.py                 # JWT auth, bcrypt, 2FA helpers
│   ├── email_service.py        # Email notification service
│   ├── migrate.py              # Database migration helpers
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile
│   ├── templates/              # Knowledge base templates (JSON)
│   │   └── arbetsplats_intern_sv.json
│   └── tests/
│       ├── test_auth.py
│       └── test_api.py
│
├── admin-panel/                # React admin dashboard
│   ├── src/
│   │   ├── App.jsx             # Main app with routing & auth
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # Tailwind CSS entry
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation sidebar
│   │   │   └── ProposalPDF.jsx # PDF generation
│   │   └── pages/
│   │       ├── Login.jsx       # Company login
│   │       ├── AdminLogin.jsx  # Super admin login (2FA)
│   │       ├── Dashboard.jsx   # Stats overview
│   │       ├── WidgetPage.jsx  # Widget + knowledge base editor
│   │       ├── Conversations.jsx # Chat history viewer
│   │       ├── Analytics.jsx   # Detailed analytics
│   │       ├── Settings.jsx    # Company settings
│   │       ├── SuperAdmin.jsx  # Multi-tenant management
│   │       ├── LandingPage.jsx # Public landing page (bobot.nu)
│   │       └── Documentation.jsx # API documentation
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── chat-widget/                # Embeddable chat widget
│   ├── src/
│   │   └── widget.jsx          # Complete widget (~1500 lines)
│   ├── package.json
│   ├── vite.config.js          # Builds as IIFE for embedding
│   └── Dockerfile
│
├── deploy/                     # Production deployment
│   ├── docker-compose.prod.yml
│   ├── nginx.conf              # Nginx reverse proxy
│   └── .env.prod               # Production environment
│
├── docker-compose.yml          # Development stack
├── bobot_specifikation.md      # Product specification (Swedish)
├── CLAUDE.md                   # This file
└── README.md                   # Project documentation
```

## Tech Stack

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI with lifespan events
- **Database:** SQLite (PostgreSQL supported via DATABASE_URL)
- **ORM:** SQLAlchemy 2.0
- **AI:** Ollama with Qwen 2.5 14B
- **Auth:** JWT (PyJWT) + bcrypt + TOTP (pyotp)
- **Validation:** Pydantic v2
- **File parsing:** openpyxl, python-docx, pypdf, beautifulsoup4
- **Email:** aiosmtplib
- **Error tracking:** Sentry (optional)

### Frontend (Admin Panel)
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** React Context + localStorage

### Chat Widget
- **Framework:** React 18 (built as IIFE)
- **Styling:** Inline styles with design tokens
- **Features:** Dark mode, RTL support, GDPR consent, sources display

### Infrastructure
- **Containerization:** Docker, docker-compose
- **Reverse Proxy:** Nginx (production)
- **Ports:**
  - Backend API: 8000
  - Admin Panel: 3000
  - Widget Demo: 3001
  - Ollama: 11434

## Development Workflows

### Quick Start with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Download AI model (first time only)
docker exec -it bobot-ollama-1 ollama pull qwen2.5:14b

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py

# Admin Panel (new terminal)
cd admin-panel
npm install
npm run dev

# Widget (new terminal)
cd chat-widget
npm install
npm run dev
```

### Default Credentials

| Account Type | ID/Username | Password |
|-------------|-------------|----------|
| Demo Company | `demo` | `demo123` |
| Super Admin | `admin` | `admin123` |

## Database Models

### Core Tables
- **Company** - Tenant accounts with pricing tier, billing info, discounts
- **CompanySettings** - Per-tenant configuration (colors, messages, GDPR, usage limits)
- **Widget** - Individual widget instances per company (internal/external types)
- **KnowledgeItem** - Q&A pairs, can be widget-specific or shared
- **Category** - User-defined categories for knowledge items
- **Conversation** - Chat sessions with GDPR consent tracking
- **Message** - Individual messages with sources and response time
- **DailyStatistics** - Aggregated analytics (GDPR-safe, retained after deletion)

### Admin & Audit Tables
- **SuperAdmin** - Platform administrators with 2FA (TOTP)
- **AdminAuditLog** - Admin action tracking
- **GDPRAuditLog** - Data processing audit trail
- **CompanyActivityLog** - Per-company activity (12-month retention)

### Billing Tables
- **Subscription** - Company subscription info
- **Invoice** - Invoice history
- **PricingTier** - Pricing tier definitions (editable by admin)

### Additional Tables
- **CompanyNote** - Internal admin notes
- **CompanyDocument** - Uploaded contracts/agreements
- **WidgetPerformance** - Hourly performance stats
- **RoadmapItem** - Feature roadmap
- **GlobalSettings** - System-wide settings
- **PageView** - Landing page analytics
- **DailyPageStats** - Aggregated page statistics
- **EmailNotificationQueue** - Pending notifications
- **ChatLog** - Legacy logging (backwards compatibility)

## Key API Endpoints

### Public (Widget)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/{company_id}` | Send question, get AI response |
| POST | `/chat/widget/{widget_key}` | Chat via widget key |
| POST | `/chat/{company_id}/feedback` | Submit feedback |
| GET | `/widget/{company_id}/config` | Get widget configuration |
| GET | `/widget/key/{widget_key}/config` | Get config by widget key |
| GET | `/health` | Health check |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Company login |
| POST | `/auth/admin/login` | Super admin login |
| POST | `/auth/admin/verify-2fa` | 2FA verification |

### Company (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/settings` | Company settings |
| GET/POST | `/knowledge` | Knowledge base CRUD |
| PUT/DELETE | `/knowledge/{id}` | Update/delete item |
| POST | `/knowledge/upload` | Upload Excel/Word/CSV/TXT |
| POST | `/knowledge/import-url` | Import from URL |
| POST | `/knowledge/check-similar` | Check for duplicates |
| POST | `/knowledge/bulk-delete` | Bulk delete items |
| GET/POST | `/categories` | Category management |
| GET | `/conversations` | List conversations |
| GET/DELETE | `/conversations/{id}` | View/delete conversation |
| DELETE | `/conversations` | Bulk delete |
| GET | `/stats` | Basic statistics |
| GET | `/analytics` | Detailed analytics |
| GET | `/my-usage` | Current usage metrics |
| GET/POST | `/widgets` | Widget management |
| GET/PUT/DELETE | `/widgets/{id}` | Widget CRUD |
| GET | `/templates` | List knowledge templates |
| POST | `/templates/{id}/apply` | Apply template |
| GET | `/export/conversations` | Export as CSV |
| GET | `/export/knowledge` | Export knowledge base |
| GET | `/activity-log` | View activity log |

### GDPR Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/gdpr/{company_id}/consent` | Give/revoke consent |
| GET | `/gdpr/{company_id}/my-data` | Download user data |
| DELETE | `/gdpr/{company_id}/my-data` | Request data deletion |
| GET | `/gdpr/{company_id}/audit-log` | GDPR audit trail |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/admin/companies` | List/create companies |
| DELETE | `/admin/companies/{id}` | Delete company |
| PUT | `/admin/companies/{id}/toggle` | Enable/disable |
| PUT | `/admin/companies/{id}/pricing` | Set pricing tier |
| PUT | `/admin/companies/{id}/discount` | Set discount |
| PUT | `/admin/companies/{id}/usage-limit` | Set usage limits |
| GET | `/admin/companies/{id}/widgets` | List widgets |
| GET | `/admin/system-health` | System health overview |
| POST | `/admin/gdpr-cleanup` | Manual GDPR cleanup |
| GET | `/admin/audit-log` | Admin audit log |
| POST | `/admin/impersonate/{id}` | Impersonate company |
| GET | `/admin/export/{id}` | Export company data |
| GET/POST | `/admin/pricing-tiers/db` | Pricing management |
| GET | `/admin/revenue-dashboard` | Revenue analytics |
| GET/POST | `/admin/subscriptions` | Subscription management |
| GET/POST | `/admin/invoices` | Invoice management |
| GET/POST | `/admin/roadmap` | Roadmap items |
| GET/POST | `/admin/companies/{id}/notes` | Company notes |
| GET/POST | `/admin/companies/{id}/documents` | Company documents |
| GET | `/admin/activity-stream` | Real-time activity |
| GET | `/admin/ai-insights` | AI-powered insights |
| GET/POST/DELETE | `/admin/announcements` | Broadcast messages |
| PUT/GET | `/admin/maintenance-mode` | Toggle maintenance |
| GET | `/admin/analytics/overview` | Platform analytics |

## Security

### Password Hashing
- bcrypt with cost factor 12 (~250ms)
- Legacy SHA256 migration support

### JWT Tokens
- 24-hour expiry
- Environment-based secret key (required in production)
- Separate pending token for 2FA flow (5-minute expiry)

### Rate Limiting
- Chat: 15 requests/minute per session+IP
- Admin API: 30 requests/minute per admin

### Brute Force Protection
- 5 failed attempts triggers 15-minute lockout
- Tracked by username/IP

### 2FA
- TOTP support for Super Admin accounts
- Google Authenticator compatible

### Security Headers (Production)
- HSTS, CSP, X-Frame-Options, X-XSS-Protection
- Request ID tracing

## GDPR Compliance

- Configurable data retention (7-30 days)
- Automatic cleanup task runs hourly
- Statistics anonymized before deletion
- IP anonymization (last octet masked)
- Activity log cleanup after 12 months
- Consent management in widget
- Data export and deletion endpoints

## Widget Embedding

### Standard HTML
```html
<script src="https://bobot.nu/widget.js"></script>
<script>
  Bobot.init({
    widgetKey: "your-widget-key",  // or companyId: "your-company-id"
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
            widgetKey: 'your-widget-key',
            apiUrl: 'https://bobot.nu/api'
        });
    </script>
    <?php
}
add_action('wp_footer', 'add_bobot_chatbot');
```

## Environment Variables

```bash
# Required in Production
ENVIRONMENT=production
SECRET_KEY=<generate-with-secrets-module>
CORS_ORIGINS=https://bobot.nu,https://www.bobot.nu,https://demo.bobot.nu

# Optional
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
DATABASE_URL=sqlite:///./bobot.db
SENTRY_DSN=<your-sentry-dsn>
ADMIN_PASSWORD=<strong-password>
DEMO_PASSWORD=demo123
ENABLE_DEMO_DATA=true
```

## Design System

### Colors
- **Primary Accent:** `#D97757` (terracotta)
- **Backgrounds:** Warm grays (#FAFAFA, #F5F5F4)
- **Text:** Warm blacks (#1C1917)
- **Dark mode:** Inverted with warm undertones

### Typography
- Font: Inter (Google Fonts, with system fallback)
- Base size: 14-16px

## Useful Commands

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f ollama

# Rebuild service
docker-compose build backend
docker-compose up -d backend

# Reset database
rm backend/bobot.db
docker-compose restart backend

# Test API
curl -X POST http://localhost:8000/chat/demo \
  -H "Content-Type: application/json" \
  -d '{"question": "Hur säger jag upp min lägenhet?"}'

# Get auth token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"company_id": "demo", "password": "demo123"}'
```

## Key Code Patterns

### Adding New Endpoints
1. Define Pydantic model for request/response in `main.py`
2. Add endpoint function with appropriate decorator
3. Use `Depends(get_current_company)` for company auth
4. Use `Depends(get_super_admin)` for admin-only endpoints

### Widget Configuration
- Per-widget settings: primary_color, secondary_color, background_color
- Typography: font_family, font_size, border_radius
- Messages: welcome_message, fallback_message, subtitle
- Behavior: start_expanded, require_consent, suggested_questions, tone

### AI Response Flow
1. User sends question via `/chat/{company_id}` or `/chat/widget/{widget_key}`
2. Rate limiting checked
3. Widget configuration loaded for tone/language
4. `find_relevant_context()` searches knowledge base
5. `build_prompt()` constructs AI prompt with context
6. Ollama generates response
7. Response cached, conversation logged, statistics updated

## Known Limitations

1. **Database:** SQLite by default (PostgreSQL supported)
2. **File uploads:** 10MB limit, in-memory processing
3. **Migrations:** Uses auto-create; Alembic recommended for production
