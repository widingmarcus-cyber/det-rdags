# CLAUDE.md - Bobot AI Chatbot Platform

## Project Overview

**Bobot** is a GDPR-compliant AI chatbot platform for property management companies (Swedish: fastighetsbolag). Customers can build their own knowledge base of Q&A pairs, which the AI uses to answer tenant questions via an embeddable chat widget.

### Key Features
- Multi-tenant architecture with tenant isolation
- AI-powered responses using Ollama (Llama 3.1)
- Multi-language support (Swedish, English, Arabic)
- GDPR-compliant with automatic data retention cleanup
- Real-time analytics and conversation tracking
- Embeddable chat widget for customer websites
- Multiple widgets per company with individual settings
- Knowledge base templates for quick setup
- Subscription and billing management
- 2FA authentication for super admins

## Architecture

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

## Directory Structure

```
bobot/
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI app, all endpoints
│   ├── database.py             # SQLAlchemy models and DB setup
│   ├── auth.py                 # JWT authentication helpers
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Backend Docker image
│   └── .env.example            # Environment variables template
│
├── admin-panel/                # React admin dashboard
│   ├── src/
│   │   ├── App.jsx             # Main app with routing & auth
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # Tailwind CSS entry
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation sidebar
│   │   │   └── ProposalPDF.jsx # PDF generation for proposals
│   │   └── pages/
│   │       ├── Login.jsx       # Company login
│   │       ├── AdminLogin.jsx  # Super admin login
│   │       ├── Dashboard.jsx   # Stats overview
│   │       ├── Knowledge.jsx   # Knowledge base CRUD
│   │       ├── Conversations.jsx # View chat history
│   │       ├── Analytics.jsx   # Detailed analytics
│   │       ├── Settings.jsx    # Company settings
│   │       ├── Preview.jsx     # Widget preview
│   │       ├── Widgets.jsx     # Widget management list
│   │       ├── WidgetPage.jsx  # Individual widget editor
│   │       ├── SuperAdmin.jsx  # Multi-tenant management
│   │       ├── LandingPage.jsx # Public landing page
│   │       └── Documentation.jsx # API documentation
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── chat-widget/                # Embeddable chat widget
│   ├── src/
│   │   └── widget.jsx          # Complete widget component
│   ├── package.json
│   ├── vite.config.js          # Builds as IIFE for embedding
│   └── Dockerfile
│
├── docker-compose.yml          # Full stack orchestration
├── start.bat                   # Windows startup script
├── stop.bat                    # Windows shutdown script
├── bobot_specifikation.md      # Product specification (Swedish)
└── README.md                   # Project documentation
```

## Tech Stack

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Database:** SQLite with SQLAlchemy ORM
- **AI:** Ollama with Llama 3.1 model
- **Auth:** JWT tokens (PyJWT)
- **Validation:** Pydantic v2

### Frontend (Admin Panel)
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** React Context + localStorage

### Chat Widget
- **Framework:** React 18 (built as IIFE)
- **Styling:** Inline styles with design tokens
- **Features:** Dark mode, RTL support, conversation persistence

### Infrastructure
- **Containerization:** Docker, docker-compose
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
docker exec -it bobot-ollama-1 ollama pull llama3.1

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
# or: venv\Scripts\activate  # Windows
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

## Key API Endpoints

### Public (Widget)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/{company_id}` | Send question, get AI response |
| POST | `/chat/{company_id}/feedback` | Submit feedback on response |
| POST | `/chat/widget/{widget_key}` | Chat via widget key |
| GET | `/widget/{company_id}/config` | Get widget configuration |
| GET | `/widget/key/{widget_key}/config` | Get config by widget key |
| GET | `/health` | Health check (DB, Ollama) |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Company login |
| POST | `/auth/admin/login` | Super admin login |
| POST | `/auth/admin/verify-2fa` | 2FA verification |

### Authenticated (Company)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/settings` | Company settings |
| GET/POST/PUT/DELETE | `/knowledge` | Knowledge base CRUD |
| POST | `/knowledge/upload` | Upload Excel/Word/CSV/TXT |
| POST | `/knowledge/import-url` | Import from URL |
| POST | `/knowledge/check-similar` | Check for similar Q&A |
| DELETE | `/knowledge/bulk` | Bulk delete items |
| GET | `/conversations` | List conversations |
| GET/DELETE | `/conversations/{id}` | View/delete conversation |
| GET | `/stats` | Basic statistics |
| GET | `/analytics` | Detailed analytics |
| GET | `/my-usage` | Current usage metrics |
| GET/POST | `/widgets` | List/create widgets |
| GET/PUT/DELETE | `/widgets/{id}` | Widget CRUD |
| GET | `/templates` | List knowledge templates |
| POST | `/templates/{id}/apply` | Apply template |
| GET | `/export/conversations` | Export as CSV |
| GET | `/export/knowledge` | Export as CSV/JSON |
| GET | `/activity-log` | View activity log |

### GDPR Endpoints (Public with session)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/gdpr/{company_id}/consent` | Give/revoke consent |
| GET | `/gdpr/{company_id}/my-data` | Download user data |
| DELETE | `/gdpr/{company_id}/my-data` | Request data deletion |
| GET | `/gdpr/{company_id}/audit-log` | View GDPR audit trail |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/admin/companies` | List/create companies |
| DELETE | `/admin/companies/{id}` | Delete company |
| PUT | `/admin/companies/{id}/toggle` | Enable/disable company |
| GET | `/admin/system-health` | System health overview |
| POST | `/admin/gdpr-cleanup` | Manual GDPR cleanup |
| GET | `/admin/audit-log` | Admin audit log |
| POST | `/admin/impersonate/{id}` | Impersonate company |
| GET/PUT | `/admin/companies/{id}/usage` | View/set usage limits |
| GET/POST | `/admin/pricing-tiers` | Pricing management |
| GET | `/admin/revenue-dashboard` | Revenue analytics |
| GET/POST | `/admin/subscriptions` | Subscription management |
| GET/POST | `/admin/invoices` | Invoice management |
| GET/POST | `/admin/roadmap` | Roadmap items |
| GET/POST | `/admin/companies/{id}/notes` | Company notes |
| GET/POST | `/admin/companies/{id}/documents` | Company documents |
| GET | `/admin/activity-stream` | Real-time activity |
| GET | `/admin/ai-insights` | AI-powered insights |
| GET/POST/DELETE | `/admin/announcements` | Broadcast messages |
| PUT | `/admin/maintenance-mode` | Toggle maintenance |

## Database Models

### Core Tables
- **Company** - Tenant/customer accounts
- **CompanySettings** - Per-tenant configuration (colors, messages, GDPR settings)
- **KnowledgeItem** - Q&A pairs in knowledge base (indexed by category)
- **Conversation** - Chat sessions with anonymized user data
- **Message** - Individual messages with metadata (language, sources)
- **Widget** - Individual widget instances per company (internal/external)
- **DailyStatistics** - Aggregated analytics (GDPR-safe, retained after deletion)
- **ChatLog** - Legacy logging (for backwards compatibility)

### Admin & Audit Tables
- **SuperAdmin** - Platform administrators with 2FA support
- **AdminAuditLog** - Admin action tracking
- **GDPRAuditLog** - Data processing audit trail
- **CompanyActivityLog** - Per-company activity (12-month retention)

### Billing & Subscription Tables
- **Subscription** - Company subscription info
- **Invoice** - Invoice history
- **PricingTier** - Pricing tier definitions

### Additional Tables
- **CompanyNote** - Internal admin notes per company
- **CompanyDocument** - Uploaded contracts/agreements
- **WidgetPerformance** - Hourly widget performance stats
- **RoadmapItem** - Feature roadmap (editable by admin)
- **GlobalSettings** - System-wide configuration
- **PageView** - Landing page analytics
- **DailyPageStats** - Aggregated page statistics
- **EmailNotificationQueue** - Pending email notifications

### Multi-tenancy
All data is isolated by `company_id`. Every query must filter by tenant.

## Key Conventions

### Code Style

**Python (Backend)**
- Follow PEP 8
- Use type hints where practical
- Pydantic models for request/response validation
- SQLAlchemy ORM for database operations
- Async endpoints for I/O operations

**JavaScript/React (Frontend)**
- Functional components with hooks
- CSS via Tailwind utility classes
- Store auth state in localStorage
- Use Context for shared state

### API Design
- RESTful endpoints
- JWT Bearer token authentication
- CORS enabled for all origins (development)
- JSON request/response bodies
- Swedish error messages for user-facing errors

### Security (Production-Ready)
- **Password hashing:** bcrypt with cost factor 12 (with legacy SHA256 migration support)
- **JWT tokens:** 24-hour expiry with secure secret key handling
- **Rate limiting:** Per-session/IP for chat (15/min), per-admin for API (30/min)
- **Brute force protection:** Login attempt tracking with 15-minute lockouts
- **Security headers:** HSTS, CSP, X-Frame-Options, XSS protection
- **CORS:** Environment-based, restricted in production
- **IP anonymization:** Last octet masked for GDPR
- **Request tracing:** Unique request IDs for debugging
- **2FA:** TOTP support for Super Admin accounts (Google Authenticator)
- **Error tracking:** Sentry integration (optional)

### GDPR Compliance
- Configurable data retention (7-30 days, GDPR max)
- Automatic cleanup task runs hourly
- Statistics are anonymized before conversation deletion
- Manual cleanup endpoint available for admins
- No personal data in logs
- Activity log cleanup after 12 months
- Consent management in widget
- Data controller information in settings

## Design System

The project follows a warm, modern design language:

### Colors
- **Primary Accent:** `#D97757` (terracotta)
- **Backgrounds:** Warm grays (#FAFAFA, #F5F5F4)
- **Text:** Warm blacks (#1C1917)
- **Dark mode:** Inverted with warm undertones

### Typography
- Font: Inter (system fallback)
- Base size: 16px

### Spacing
- 8px grid system
- Generous padding for readability

## Language Support

The platform supports three languages:
- **Swedish (sv)** - Default
- **English (en)**
- **Arabic (ar)** - With RTL support

Language detection is automatic based on:
1. User-provided language preference
2. Browser language
3. Text analysis of question content

## Testing Considerations

When testing:
1. Use the demo company (`demo`) for quick testing
2. Test both Docker and manual setups
3. Verify Ollama connectivity for AI responses
4. Test multi-tenant isolation
5. Verify GDPR cleanup functionality
6. Test RTL rendering for Arabic

## Common Tasks for AI Assistants

### Adding New Knowledge Base Items
- Via admin panel: Knowledge page
- Via API: POST `/knowledge`
- Via file upload: Supports Excel, Word, CSV, TXT
- Via URL import: Extracts Q&A from web pages

### Debugging AI Responses
1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Check model is loaded: `docker exec -it bobot-ollama-1 ollama list`
3. Review `find_relevant_context()` in main.py for matching logic
4. Check `build_prompt()` for prompt construction

### Modifying Widget Appearance
- Edit `chat-widget/src/widget.jsx`
- Colors defined in `lightColors` and `darkColors` objects
- Company-specific colors come from `CompanySettings.primary_color`

### Adding New API Endpoints
1. Define Pydantic model for request/response
2. Add endpoint function in `main.py`
3. Use `Depends(get_current_company)` for authenticated endpoints
4. Use `Depends(get_super_admin)` for admin-only endpoints

### Working with Widgets
- Each company can have multiple widgets (internal/external)
- Widgets have unique keys for embedding: `/chat/widget/{widget_key}`
- Widget settings include: appearance, messages, consent, Q&A filtering
- Widget performance is tracked hourly in `WidgetPerformance` table
- Edit widget settings in admin panel: Widgets → WidgetPage

### Using Knowledge Templates
- Templates are stored in `backend/templates/` directory
- List available templates: GET `/templates`
- Preview template content: GET `/templates/{id}/preview`
- Apply template to knowledge base: POST `/templates/{id}/apply`
- Templates can be filtered by category when applying

### Database Migrations
Currently using auto-create via `Base.metadata.create_all()`. For production, consider adding Alembic for proper migrations.

## WordPress Integration

The Bobot chat widget can be easily integrated into any WordPress site. It's a simple JavaScript embed that requires no plugins.

### Method 1: Theme Editor (functions.php)

Add to your theme's `functions.php`:

```php
function add_bobot_chatbot() {
    ?>
    <script src="https://your-bobot-domain.com/widget.js"></script>
    <script>
        Bobot.init({
            companyId: 'your-company-id',
            apiUrl: 'https://your-bobot-domain.com'
        });
    </script>
    <?php
}
add_action('wp_footer', 'add_bobot_chatbot');
```

### Method 2: Plugin (Insert Headers and Footers)

1. Install "Insert Headers and Footers" plugin (or similar)
2. Go to Settings → Insert Headers and Footers
3. Paste in the "Scripts in Footer" section:

```html
<script src="https://your-bobot-domain.com/widget.js"></script>
<script>
    Bobot.init({
        companyId: 'your-company-id',
        apiUrl: 'https://your-bobot-domain.com'
    });
</script>
```

### Method 3: Page Builder (Elementor, etc.)

1. Add an HTML widget to your footer template
2. Paste the same script code as above

### WordPress-Specific Notes

- **Caching plugins**: Clear cache after adding the widget
- **Security plugins**: May need to whitelist the widget domain
- **CORS**: Backend already configured to allow cross-origin requests
- **CDN**: The widget works behind CDNs like Cloudflare
- **Mobile**: Fully responsive, works on all devices

### Testing

After installation, visit your WordPress site and the chat bubble should appear in the bottom-right corner (or left, depending on your settings).

## Environment Variables

```bash
# =============================================================================
# REQUIRED FOR PRODUCTION
# =============================================================================
ENVIRONMENT=production                    # Set to 'production' for production mode
SECRET_KEY=<generate-with-secrets-module> # python -c "import secrets; print(secrets.token_urlsafe(64))"
CORS_ORIGINS=https://app.bobot.se,https://admin.bobot.se  # Comma-separated allowed origins

# =============================================================================
# OPTIONAL CONFIGURATION
# =============================================================================
# AI Model
OLLAMA_BASE_URL=http://localhost:11434    # or http://ollama:11434 in Docker
OLLAMA_MODEL=llama3.1

# Database (SQLite default, PostgreSQL supported)
DATABASE_URL=sqlite:///./bobot.db         # or postgresql://user:pass@host/db

# Error Tracking
SENTRY_DSN=<your-sentry-dsn>              # Optional Sentry integration

# Admin Credentials (auto-generated if not set)
ADMIN_PASSWORD=<strong-password>          # Super admin password
DEMO_PASSWORD=demo123                     # Demo company password

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@bobot.se
SMTP_PASSWORD=<smtp-password>
```

## Production Deployment Checklist

- [ ] Set `ENVIRONMENT=production`
- [ ] Generate and set secure `SECRET_KEY`
- [ ] Configure `CORS_ORIGINS` with your domains
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Configure Sentry for error tracking (optional)
- [ ] Enable HTTPS (required for HSTS)
- [ ] Configure PostgreSQL for high-traffic (optional)

## Known Limitations

1. **Database:** SQLite by default (PostgreSQL supported via DATABASE_URL)
2. **File uploads:** 10MB limit, stored in memory during processing
3. **Database migrations:** Uses auto-create; consider Alembic for schema changes
4. **Widget embedding:** CSP allows frame-ancestors from any origin for widget embedding

## Useful Commands

```bash
# View Docker logs
docker-compose logs -f backend
docker-compose logs -f ollama

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Reset database
rm backend/bobot.db
docker-compose restart backend

# Test API
curl -X POST http://localhost:8000/chat/demo \
  -H "Content-Type: application/json" \
  -d '{"question": "Hur säger jag upp min lägenhet?"}'

# Login and get token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"company_id": "demo", "password": "demo123"}'
```
