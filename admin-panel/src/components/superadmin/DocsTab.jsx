/**
 * SuperAdmin Documentation Tab Component
 * Displays system architecture, guides, and security information
 */

const DocsTab = ({ onShowAnnouncementModal, announcement }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dokumentation</h1>
        <p className="text-text-secondary mt-1">Hur Bobot fungerar - allt du behöver veta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Architecture Overview */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Systemarkitektur
          </h2>
          <div className="bg-bg-secondary rounded-xl p-6">
            <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre font-mono">
{`┌─────────────────────────────────────────────────────────────────────┐
│                     KUNDENS HEMSIDA                                  │
│  ┌──────────────┐                                                   │
│  │ Chattwidget  │ ◀── Inbäddningsbar React-komponent               │
│  └──────┬───────┘                                                   │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin-panel    │────▶│  FastAPI Backend│────▶│     Ollama      │
│  (React)        │     │   (Python)      │     │ (Qwen 2.5 14B)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   SQLite DB     │
                        │  (Multi-tenant) │
                        └─────────────────┘`}
            </pre>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="card">
          <h2 className="text-lg font-bold text-text-primary mb-4">Snabbreferens</h2>
          <div className="space-y-4">
            <div className="p-3 bg-bg-secondary rounded-lg">
              <p className="font-medium text-text-primary text-sm">Portar</p>
              <div className="mt-2 space-y-1 text-xs text-text-secondary">
                <p>Backend API: <code className="px-1 py-0.5 bg-bg-tertiary rounded">8000</code></p>
                <p>Admin Panel: <code className="px-1 py-0.5 bg-bg-tertiary rounded">3000</code></p>
                <p>Widget Demo: <code className="px-1 py-0.5 bg-bg-tertiary rounded">3001</code></p>
                <p>Ollama: <code className="px-1 py-0.5 bg-bg-tertiary rounded">11434</code></p>
              </div>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg">
              <p className="font-medium text-text-primary text-sm">Inloggningsuppgifter</p>
              <div className="mt-2 space-y-1 text-xs text-text-secondary">
                <p>Användarnamn och lösenord konfigureras via miljövariabler (ADMIN_USERNAME, ADMIN_PASSWORD) i produktion.</p>
                <p className="text-text-tertiary mt-1">Se .env.prod för aktuella inställningar.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Runbooks */}
        <div className="lg:col-span-3 card">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Guider & Felsökning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RunbookCard
              title="Ny kund - Onboarding"
              steps={[
                'Skapa företag (Företag → Lägg till)',
                'Konfigurera widgeten (utseende, meddelanden)',
                'Lägg till kunskapsbas (minst 10-20 frågor)',
                'Ge kunden inbäddningskoden',
                'Testa med live preview'
              ]}
            />
            <RunbookCard
              title="AI svarar inte"
              steps={[
                'Kontrollera Ollama-status (System → Systemhälsa)',
                'Verifiera att modellen är laddad',
                <span key="logs">Kontrollera Docker-loggar: <code className="text-xs">docker logs bobot-ollama-1</code></span>,
                <span key="restart">Starta om Ollama: <code className="text-xs">docker restart bobot-ollama-1</code></span>
              ]}
            />
            <RunbookCard
              title="GDPR-hantering"
              steps={[
                'Ställ in retention (Inställningar → GDPR)',
                'Automatisk rensning körs varje timme',
                'Manuell rensning: Översikt → GDPR-rensning',
                'Statistik behålls anonymiserat'
              ]}
            />
            <RunbookCard
              title="Hög obesvarad-andel"
              steps={[
                'Granska "Obesvarade frågor" i Analytics',
                'Lägg till vanliga frågor i kunskapsbasen',
                'Förbättra befintliga svar med nyckelord',
                'Aktivera notifieringar för obesvarade'
              ]}
            />
            <RunbookCard
              title="Widget visas inte"
              steps={[
                'Kontrollera att företaget är aktivt',
                'Verifiera company_id i embed-koden',
                'Kolla CORS-inställningar (backend)',
                'Kontrollera webbläsarkonsolen för fel'
              ]}
            />
            <RunbookCard
              title="Databashantering"
              steps={[
                <span key="backup">Backup: <code className="text-xs">cp bobot.db bobot.backup.db</code></span>,
                'Storlek visas i System → Systemhälsa',
                <span key="reset">Reset: <code className="text-xs">rm bobot.db && restart</code></span>,
                'Migration: Använd Alembic (produktion)'
              ]}
            />
          </div>
        </div>

        {/* Security & Production */}
        <div className="lg:col-span-3 card border-green-200 bg-green-50/30">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Säkerhet & Produktion
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-success-soft text-success rounded-full">Produktionsklar</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SecurityCard
              title="Autentisering"
              items={[
                'bcrypt lösenordshashning',
                '2FA för Super Admin',
                'Brute force-skydd',
                'JWT med 24h livstid'
              ]}
            />
            <SecurityCard
              title="Rate Limiting"
              items={[
                'Chat: 15 req/min',
                'Admin API: 30 req/min',
                'Login: 5 försök/15 min',
                'Auto-lockout 15 min'
              ]}
            />
            <SecurityCard
              title="Security Headers"
              items={[
                'HSTS (produktion)',
                'CSP konfigurerad',
                'X-Frame-Options',
                'XSS-Protection'
              ]}
            />
            <SecurityCard
              title="Produktionskrav"
              items={[
                'Sätt ENVIRONMENT=production',
                'Generera SECRET_KEY',
                'Konfigurera CORS_ORIGINS',
                'Aktivera HTTPS'
              ]}
            />
          </div>
        </div>

        {/* Create Announcement */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Skicka meddelande till alla kunder
            </h2>
            <button
              onClick={onShowAnnouncementModal}
              className="btn btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nytt meddelande
            </button>
          </div>
          <p className="text-sm text-text-secondary">
            Skapa ett meddelande som visas för alla företagsadministratörer i deras dashboard.
            Användbart för systemunderhåll, nya funktioner eller viktiga uppdateringar.
          </p>
          {announcement && (
            <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <p className="text-sm text-text-tertiary mb-1">Aktivt meddelande:</p>
              <p className="font-medium text-text-primary">{announcement.title}</p>
              <p className="text-sm text-text-secondary">{announcement.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
const RunbookCard = ({ title, steps }) => (
  <div className="p-4 bg-bg-secondary rounded-xl">
    <h3 className="font-medium text-text-primary mb-2">{title}</h3>
    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  </div>
)

const SecurityCard = ({ title, items }) => (
  <div className="p-4 bg-bg-secondary rounded-xl border border-success/30">
    <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
      <span className="text-success">✓</span> {title}
    </h3>
    <ul className="text-sm text-text-secondary space-y-1">
      {items.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>
  </div>
)

export default DocsTab
