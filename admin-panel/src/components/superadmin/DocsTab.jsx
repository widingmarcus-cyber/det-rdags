/**
 * SuperAdmin Documentation Tab Component
 * Displays system architecture, guides, and security information
 */

const DocsTab = () => {
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

        {/* Self-Hosting Guide */}
        <div className="lg:col-span-3 card border-accent/20 bg-accent/5">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Självhosting (Self-Hosting)
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-accent-soft text-accent rounded-full">Professional+</span>
          </h2>
          <p className="text-text-secondary mb-4 text-sm">
            Med self-hosting kör du Bobot på din egen server. Du får full kontroll över data, säkerhet och prestanda.
            Perfekt för organisationer med höga säkerhetskrav eller som vill integrera djupare med befintlig infrastruktur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What You Get */}
            <div className="p-4 bg-bg-secondary rounded-xl">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-success">📦</span> Vad ingår?
              </h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span><strong>Komplett källkod</strong> - Backend, admin-panel och widget</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span><strong>Docker-konfiguration</strong> - Starta med ett kommando</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span><strong>Installationsguide</strong> - Steg-för-steg dokumentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span><strong>Licensnyckel</strong> - 12 månaders giltighetstid</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span><strong>E-postsupport</strong> - Hjälp vid installation och problem</span>
                </li>
              </ul>
            </div>

            {/* Requirements */}
            <div className="p-4 bg-bg-secondary rounded-xl">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-accent">⚙️</span> Systemkrav
              </h3>
              <div className="text-sm text-text-secondary space-y-3">
                <div>
                  <p className="font-medium text-text-primary mb-1">Server</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Linux (Ubuntu 20.04+ rekommenderas)</li>
                    <li>• 8 GB RAM minimum, 16 GB för bästa AI-prestanda</li>
                    <li>• 20 GB ledigt diskutrymme</li>
                    <li>• Docker och Docker Compose installerat</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-text-primary mb-1">Nätverk</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Publik IP eller domännamn</li>
                    <li>• Port 80/443 öppen för HTTPS</li>
                    <li>• SSL-certifikat (Let's Encrypt gratis)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step-by-Step Installation */}
            <div className="p-4 bg-bg-secondary rounded-xl md:col-span-2">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-accent">🚀</span> Installation i 5 steg
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                  <p className="text-xs font-medium text-text-primary">Ladda ner</p>
                  <p className="text-xs text-text-tertiary">Packa upp källkoden</p>
                </div>
                <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                  <p className="text-xs font-medium text-text-primary">Konfigurera</p>
                  <p className="text-xs text-text-tertiary">Kopiera .env.example</p>
                </div>
                <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                  <p className="text-xs font-medium text-text-primary">Starta Docker</p>
                  <p className="text-xs text-text-tertiary">docker-compose up -d</p>
                </div>
                <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                  <p className="text-xs font-medium text-text-primary">Ladda AI</p>
                  <p className="text-xs text-text-tertiary">ollama pull qwen2.5</p>
                </div>
                <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                  <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">✓</div>
                  <p className="text-xs font-medium text-text-primary">Klart!</p>
                  <p className="text-xs text-text-tertiary">Logga in på admin</p>
                </div>
              </div>
              <p className="text-xs text-text-tertiary mt-4 text-center">
                Detaljerad guide med kommando-för-kommando instruktioner medföljer vid köp.
              </p>
            </div>

            {/* Pricing */}
            <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl md:col-span-2 border border-accent/20">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span>💰</span> Priser för self-hosting
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                  <p className="text-sm font-medium text-text-primary">Professional</p>
                  <p className="text-2xl font-bold text-accent mt-1">+20 000 kr</p>
                  <p className="text-xs text-text-tertiary">engångsavgift</p>
                </div>
                <div className="text-center p-4 bg-bg-tertiary rounded-lg">
                  <p className="text-sm font-medium text-text-primary">Business</p>
                  <p className="text-2xl font-bold text-accent mt-1">+35 000 kr</p>
                  <p className="text-xs text-text-tertiary">engångsavgift</p>
                </div>
                <div className="text-center p-4 bg-bg-tertiary rounded-lg border-2 border-success">
                  <p className="text-sm font-medium text-text-primary">Enterprise</p>
                  <p className="text-2xl font-bold text-success mt-1">Ingår</p>
                  <p className="text-xs text-text-tertiary">utan extra kostnad</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-4 text-center">
                Kontakta oss på <a href="mailto:hej@bobot.nu" className="text-accent hover:underline">hej@bobot.nu</a> för mer information eller för att komma igång.
              </p>
            </div>
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
