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
│   │   │   └── Navbar.jsx      # Navigation sidebar
│   │   └── pages/
│   │       ├── Login.jsx       # Company login
│   │       ├── AdminLogin.jsx  # Super admin login
│   │       ├── Dashboard.jsx   # Stats overview
│   │       ├── Knowledge.jsx   # Knowledge base CRUD
│   │       ├── Conversations.jsx # View chat history
│   │       ├── Analytics.jsx   # Detailed analytics
│   │       ├── Settings.jsx    # Company settings
│   │       ├── Preview.jsx     # Widget preview
│   │       └── SuperAdmin.jsx  # Multi-tenant management
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
| GET | `/widget/{company_id}/config` | Get widget configuration |

### Authenticated (Company)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Company login |
| GET/PUT | `/settings` | Company settings |
| GET/POST/PUT/DELETE | `/knowledge` | Knowledge base CRUD |
| POST | `/knowledge/upload` | Upload Excel/Word/CSV |
| POST | `/knowledge/import-url` | Import from URL |
| GET | `/conversations` | List conversations |
| GET/DELETE | `/conversations/{id}` | View/delete conversation |
| GET | `/stats` | Basic statistics |
| GET | `/analytics` | Detailed analytics |
| GET | `/export/conversations` | Export as CSV |
| GET | `/export/knowledge` | Export as CSV/JSON |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/admin/login` | Admin login |
| GET/POST | `/admin/companies` | List/create companies |
| DELETE | `/admin/companies/{id}` | Delete company |
| PUT | `/admin/companies/{id}/toggle` | Enable/disable company |
| POST | `/admin/gdpr-cleanup` | Manual GDPR cleanup |

## Database Models

### Core Tables
- **Company** - Tenant/customer accounts
- **CompanySettings** - Per-tenant configuration
- **KnowledgeItem** - Q&A pairs in knowledge base
- **Conversation** - Chat sessions with anonymized user data
- **Message** - Individual messages within conversations
- **DailyStatistics** - Aggregated analytics (GDPR-safe)
- **ChatLog** - Legacy logging (for backwards compatibility)
- **SuperAdmin** - Platform administrators

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

### Security Considerations
- Passwords hashed with SHA256 (upgrade to bcrypt for production)
- JWT tokens with 24-hour expiry
- IP addresses anonymized (last octet masked)
- User agents stripped to browser name only
- Automatic conversation cleanup based on retention settings

### GDPR Compliance
- Configurable data retention (7-365 days)
- Automatic cleanup task runs hourly
- Statistics are anonymized before conversation deletion
- Manual cleanup endpoint available for admins
- No personal data in logs

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

### Database Migrations
Currently using auto-create via `Base.metadata.create_all()`. For production, consider adding Alembic for proper migrations.

## Environment Variables

```bash
# Backend (.env)
OLLAMA_BASE_URL=http://localhost:11434  # or http://ollama:11434 in Docker
OLLAMA_MODEL=llama3.1
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./bobot.db
```

## Known Limitations

1. **Password hashing:** Uses SHA256, should upgrade to bcrypt for production
2. **Database:** SQLite (consider PostgreSQL for production)
3. **CORS:** Wide open (restrict in production)
4. **Rate limiting:** Not implemented (add for production)
5. **File uploads:** 10MB limit, stored in memory during processing

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
