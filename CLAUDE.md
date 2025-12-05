# CLAUDE.md - Bobot AI Chatbot Platform

## Project Overview

**Bobot** is a GDPR-compliant AI chatbot platform where businesses build their own knowledge base of Q&A pairs. The AI uses this knowledge to answer customer questions via an embeddable chat widget.

- **Production:** https://bobot.nu
- **Demo:** https://demo.bobot.nu

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CUSTOMER WEBSITE                              │
│  ┌──────────────┐                                                   │
│  │ Chat Widget  │ ◀── Embeddable React component (IIFE)            │
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
│  Admin Panel    │     │   SQLite DB     │
│  (React + Vite) │     │  (Multi-tenant) │
└─────────────────┘     └─────────────────┘
```

## Directory Structure

```
bobot/
├── backend/                          # Python FastAPI backend (~8400 lines)
│   ├── main.py                       # FastAPI app, ~100 endpoints
│   ├── database.py                   # SQLAlchemy models (~25 tables)
│   ├── auth.py                       # JWT, bcrypt, TOTP helpers
│   ├── email_service.py              # Email notifications
│   ├── migrate.py                    # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── templates/                    # Knowledge base templates
│   │   ├── fastighetsbolag_sv.json   # Property management (73 Q&As)
│   │   └── arbetsplats_intern_sv.json
│   └── tests/
│       ├── test_auth.py
│       └── test_api.py
│
├── admin-panel/                      # React admin dashboard
│   ├── public/
│   │   └── favicon.svg               # Bobot mascot icon
│   ├── src/
│   │   ├── App.jsx                   # Main app, routing, auth context
│   │   ├── main.jsx                  # Entry point
│   │   ├── index.css                 # Tailwind CSS
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation sidebar
│   │   │   ├── ProposalPDF.jsx       # PDF generation
│   │   │   └── superadmin/           # SuperAdmin tab components
│   │   │       ├── index.js          # Exports all tabs
│   │   │       ├── OverviewTab.jsx   # Dashboard command center
│   │   │       ├── CompaniesTab.jsx  # Company management
│   │   │       ├── AnalyticsTab.jsx  # Platform analytics
│   │   │       ├── BillingTab.jsx    # Subscriptions & invoices
│   │   │       ├── PricingTab.jsx    # Pricing tiers & roadmap
│   │   │       ├── SystemTab.jsx     # System health & maintenance
│   │   │       ├── AuditTab.jsx      # Audit logs
│   │   │       ├── GDPRTab.jsx       # GDPR compliance
│   │   │       ├── PreferencesTab.jsx# Admin settings
│   │   │       ├── DocsTab.jsx       # Documentation
│   │   │       └── SuperAdminSidebar.jsx
│   │   └── pages/
│   │       ├── Login.jsx             # Company login
│   │       ├── AdminLogin.jsx        # Super admin login (2FA)
│   │       ├── Dashboard.jsx         # Company dashboard
│   │       ├── WidgetPage.jsx        # Widget & knowledge editor
│   │       ├── Conversations.jsx     # Chat history
│   │       ├── Analytics.jsx         # Company analytics
│   │       ├── Settings.jsx          # Company settings
│   │       ├── SuperAdmin.jsx        # Platform management (~3200 lines)
│   │       ├── LandingPage.jsx       # Public landing page
│   │       ├── PrivacyPolicy.jsx     # Privacy policy
│   │       └── Documentation.jsx     # API docs
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── chat-widget/                      # Embeddable chat widget (~1500 lines)
│   ├── src/
│   │   └── widget.jsx                # Complete widget component
│   ├── package.json
│   ├── vite.config.js                # Builds as IIFE
│   └── Dockerfile
│
├── deploy/                           # Production deployment
│   ├── docker-compose.prod.yml
│   ├── nginx.conf                    # SSL + reverse proxy
│   └── .env.prod                     # ⚠️ ROTATE CREDENTIALS
│
├── docker-compose.yml                # Development stack
├── CLAUDE.md                         # This file
└── README.md                         # Project documentation
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | SQLite (PostgreSQL supported) |
| **AI Model** | Ollama with Qwen 2.5 14B |
| **Auth** | JWT (PyJWT) + bcrypt + TOTP (pyotp) |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Widget** | React 18 built as IIFE for embedding |
| **Infrastructure** | Docker, Nginx, Let's Encrypt SSL |

## Quick Start

```bash
# Development
docker-compose up -d
docker exec -it bobot-ollama-1 ollama pull qwen2.5:14b

# Access
# Admin Panel: http://localhost:3000
# Backend API: http://localhost:8000
# Widget Demo: http://localhost:3001
```

### Default Credentials (Development Only)

| Account | ID/Username | Password |
|---------|-------------|----------|
| Demo Company | `demo` | `demo123` |
| Super Admin | `admin` | `admin123` |

## Key Features

### For Customers (Companies)
- Build knowledge base with Q&A pairs
- Import from Excel, Word, CSV, TXT, or URL
- Multiple widgets per company (internal/external)
- Real-time analytics and conversation tracking
- GDPR-compliant data handling
- Customizable widget appearance

### For Platform Admins
- Multi-tenant management
- Company billing and subscriptions
- Platform-wide analytics
- System health monitoring
- GDPR compliance tools
- 2FA authentication

### Widget Features
- Dark mode support
- RTL language support (Arabic)
- GDPR consent management
- Source citations
- Suggested questions
- Customizable styling

## API Endpoints

### Public (No Auth)
```
POST /chat/{company_id}          # Send question
POST /chat/widget/{widget_key}   # Chat via widget key
GET  /widget/{company_id}/config # Widget configuration
GET  /health                     # Health check
```

### Company Auth Required
```
GET/PUT  /settings               # Company settings
GET/POST /knowledge              # Knowledge base CRUD
POST     /knowledge/upload       # File upload
POST     /knowledge/import-url   # URL import
GET/POST /widgets                # Widget management
GET      /templates              # List templates
POST     /templates/{id}/apply   # Apply template
GET      /conversations          # Chat history
GET      /analytics              # Detailed analytics
```

### Super Admin Auth Required
```
GET/POST /admin/companies        # Company management
PUT      /admin/companies/{id}/toggle
GET      /admin/system-health    # System status
GET      /admin/audit-log        # Audit trail
POST     /admin/gdpr-cleanup     # Manual cleanup
GET      /admin/analytics/*      # Platform analytics
```

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| Company | Tenant accounts |
| CompanySettings | Per-tenant config |
| Widget | Widget instances |
| KnowledgeItem | Q&A pairs |
| Category | Knowledge categories |
| Conversation | Chat sessions |
| Message | Individual messages |
| SuperAdmin | Platform admins (2FA) |
| AdminAuditLog | Admin action tracking |
| GDPRAuditLog | Data processing audit |
| DailyStatistics | Aggregated analytics |

## Security

### Implemented
- bcrypt password hashing (cost factor 12)
- JWT tokens (24-hour expiry)
- TOTP 2FA for super admins
- Rate limiting (15 req/min chat, 30 req/min API)
- Brute force protection (5 attempts → 15-min lockout)
- HTTPS with HSTS
- SQL injection protection (ORM)
- XSS protection (React auto-escaping)

### Known Issues (See Security Audit)
- ⚠️ Production credentials in repo - **ROTATE IMMEDIATELY**
- ⚠️ GDPR endpoints lack proper authorization
- ⚠️ Rate limiting is in-memory only
- ⚠️ Auth tokens in localStorage (should use HttpOnly cookies)

## GDPR Compliance

- Configurable retention (7-30 days)
- Automatic hourly cleanup
- IP anonymization
- Consent management
- Data export/deletion endpoints
- Audit logging

## Widget Embedding

```html
<script src="https://bobot.nu/widget.js"></script>
<script>
  Bobot.init({
    widgetKey: "your-widget-key",
    apiUrl: "https://bobot.nu/api"
  });
</script>
```

## Environment Variables

```bash
# Required
ENVIRONMENT=production
SECRET_KEY=<generate-secure-key>
CORS_ORIGINS=https://bobot.nu,https://www.bobot.nu

# AI Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b

# Optional
DATABASE_URL=sqlite:///./bobot.db
SENTRY_DSN=<your-sentry-dsn>
```

## Design System

| Element | Value |
|---------|-------|
| Primary Color | `#D97757` (terracotta) |
| Background | `#FAFAFA`, `#F5F5F4` |
| Text | `#1C1917` |
| Font | Inter (Google Fonts) |

## Development Commands

```bash
# Logs
docker-compose logs -f backend

# Rebuild
docker-compose build backend
docker-compose up -d backend

# Reset database
rm backend/bobot.db && docker-compose restart backend

# Test API
curl -X POST http://localhost:8000/chat/demo \
  -H "Content-Type: application/json" \
  -d '{"question": "Test question"}'
```

## Code Patterns

### Adding Endpoints
```python
@app.post("/endpoint")
async def endpoint(
    request: RequestModel,
    current: dict = Depends(get_current_company),  # Company auth
    db: Session = Depends(get_db)
):
    pass

# For admin endpoints
@app.get("/admin/endpoint")
async def admin_endpoint(
    admin: SuperAdmin = Depends(get_super_admin),  # Admin auth
    db: Session = Depends(get_db)
):
    pass
```

### AI Response Flow
1. Rate limit check
2. Load widget config
3. Search knowledge base (`find_relevant_context`)
4. Build prompt with context
5. Query Ollama
6. Log conversation + update stats

## Production Deployment

See `deploy/` directory:
- `docker-compose.prod.yml` - Production services
- `nginx.conf` - SSL + reverse proxy config
- SSL via Let's Encrypt (Certbot)

```bash
# Deploy
docker-compose -f deploy/docker-compose.prod.yml up -d

# SSL setup
sudo certbot --nginx -d bobot.nu -d www.bobot.nu -d demo.bobot.nu
```

## Known Limitations

1. SQLite by default (PostgreSQL supported)
2. File uploads: 10MB max, in-memory processing
3. Rate limiting: in-memory, lost on restart
4. No database migrations (auto-create tables)
