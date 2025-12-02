import { useState } from 'react'

function Documentation() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Översikt' },
    { id: 'gdpr', label: 'GDPR & Dataskydd' },
    { id: 'data-handling', label: 'Datahantering' },
    { id: 'security', label: 'Säkerhet' },
    { id: 'accessibility', label: 'Tillgänglighet' },
    { id: 'api', label: 'API-dokumentation' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dokumentation</h1>
        <p className="text-text-secondary mt-1">Teknisk information om dataskydd, säkerhet och compliance</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar navigation */}
        <nav className="w-48 flex-shrink-0" aria-label="Dokumentationsnavigation">
          <ul className="space-y-1 sticky top-8">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-accent-soft text-accent font-medium'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                  aria-current={activeSection === section.id ? 'true' : undefined}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-3xl" role="article">
          {activeSection === 'overview' && (
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-xl font-semibold text-text-primary mb-4">Översikt</h2>

              <div className="prose prose-sm max-w-none space-y-6">
                <div className="card">
                  <h3 className="font-medium text-text-primary mb-2">Vad är Bobot?</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Bobot är en GDPR-kompatibel AI-chatbot-plattform speciellt utvecklad för fastighetsbolag.
                    Plattformen gör det möjligt för hyresvärdar att bygga sin egen kunskapsbas med frågor och svar,
                    som AI:n sedan använder för att besvara hyresgästernas frågor via en inbäddningsbar chattwidget.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-2">Arkitektur</h3>
                  <div className="bg-bg-secondary rounded-lg p-4 font-mono text-xs text-text-secondary overflow-x-auto">
                    <pre>{`
┌─────────────────────────────────────────────────────────┐
│              FASTIGHETSBOLAGETS HEMSIDA                 │
│  ┌──────────────┐                                       │
│  │ Chattwidget  │ ◀── Inbäddningsbar React-komponent   │
│  └──────┬───────┘                                       │
└─────────┼───────────────────────────────────────────────┘
          │ HTTPS (krypterad)
          ▼
┌─────────────────┐     ┌─────────────────┐
│  FastAPI        │────▶│     Ollama      │
│  Backend        │     │  (Llama 3.1)    │
│  (Python)       │     │  Lokal AI       │
└────────┬────────┘     └─────────────────┘
         │
┌────────▼────────┐
│   SQLite DB     │
│  (Krypterad)    │
└─────────────────┘
                    `}</pre>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-2">Nyckelfunktioner</h3>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span><strong>Flerspråkigt:</strong> Stöd för svenska, engelska och arabiska (inkl. RTL)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span><strong>GDPR-kompatibel:</strong> Automatisk datarensning, samtycke, användarrättigheter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span><strong>Tillgänglig:</strong> WCAG 2.2 AA-kompatibel widget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span><strong>Lokal AI:</strong> Data lämnar aldrig din infrastruktur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span><strong>Multi-tenant:</strong> Fullständig dataisolering mellan företag</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'gdpr' && (
            <section aria-labelledby="gdpr-heading">
              <h2 id="gdpr-heading" className="text-xl font-semibold text-text-primary mb-4">GDPR & Dataskydd</h2>

              <div className="space-y-6">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-success font-medium mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    GDPR & PuB-kompatibel
                  </div>
                  <p className="text-sm text-text-secondary">
                    Bobot är byggt från grunden med dataskydd i åtanke och uppfyller kraven i GDPR och
                    svensk personuppgiftsbehandling (PuB).
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Rättslig grund för behandling</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left py-2 text-text-tertiary font-medium">Datatyp</th>
                        <th className="text-left py-2 text-text-tertiary font-medium">Rättslig grund</th>
                        <th className="text-left py-2 text-text-tertiary font-medium">Lagringstid</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Chattmeddelanden</td>
                        <td className="py-2">Berättigat intresse / Samtycke</td>
                        <td className="py-2">7-30 dagar (konfigurerbart)</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Anonymiserad IP</td>
                        <td className="py-2">Berättigat intresse</td>
                        <td className="py-2">7-30 dagar</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Statistik (aggregerad)</td>
                        <td className="py-2">Berättigat intresse</td>
                        <td className="py-2">Permanent (anonymiserad)</td>
                      </tr>
                      <tr>
                        <td className="py-2">Samtycke-loggar</td>
                        <td className="py-2">Rättslig förpliktelse</td>
                        <td className="py-2">12 månader</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Registrerades rättigheter</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Bobot implementerar följande GDPR-rättigheter automatiskt via chattwidgeten:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-medium">15</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Rätt till tillgång (Art. 15)</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Användare kan se all data kopplad till sin session via "Visa min data" i chattmenyn.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-medium">17</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Rätt till radering (Art. 17)</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Användare kan radera all sin data via "Radera min data" i chattmenyn. Statistik anonymiseras.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-medium">7</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Rätt att återkalla samtycke (Art. 7)</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Om samtycke krävs kan användaren när som helst återkalla det. Radering av data sker automatiskt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Automatisk datarensning</h3>
                  <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 text-text-primary font-medium mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Schemalagd rensning: Varje timme
                    </div>
                    <ul className="space-y-1 text-text-secondary ml-6">
                      <li>• Konversationer äldre än retention-perioden raderas automatiskt</li>
                      <li>• Statistik aggregeras och anonymiseras innan radering</li>
                      <li>• Aktivitetsloggar rensas efter 12 månader</li>
                      <li>• Audit-loggar för GDPR-händelser bevaras separat</li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Audit-loggning</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    Alla GDPR-relaterade händelser loggas för compliance:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-bg-secondary rounded p-2">
                      <span className="font-mono text-accent">consent_given</span>
                      <p className="text-text-tertiary mt-1">Samtycke lämnat</p>
                    </div>
                    <div className="bg-bg-secondary rounded p-2">
                      <span className="font-mono text-accent">consent_withdrawn</span>
                      <p className="text-text-tertiary mt-1">Samtycke återkallat</p>
                    </div>
                    <div className="bg-bg-secondary rounded p-2">
                      <span className="font-mono text-accent">data_access</span>
                      <p className="text-text-tertiary mt-1">Data begärd</p>
                    </div>
                    <div className="bg-bg-secondary rounded p-2">
                      <span className="font-mono text-accent">data_deletion</span>
                      <p className="text-text-tertiary mt-1">Data raderad</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'data-handling' && (
            <section aria-labelledby="data-heading">
              <h2 id="data-heading" className="text-xl font-semibold text-text-primary mb-4">Datahantering</h2>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Insamlade uppgifter</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left py-2 text-text-tertiary font-medium">Uppgift</th>
                        <th className="text-left py-2 text-text-tertiary font-medium">Källa</th>
                        <th className="text-left py-2 text-text-tertiary font-medium">Behandling</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Chattmeddelanden</td>
                        <td className="py-2">Användarinmatning</td>
                        <td className="py-2">Lagras, raderas efter retention</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">IP-adress</td>
                        <td className="py-2">HTTP-förfrågan</td>
                        <td className="py-2">
                          <span className="text-success">Anonymiseras omedelbart</span>
                          <br />
                          <span className="text-xs">192.168.1.100 → 192.168.1.xxx</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">User-Agent</td>
                        <td className="py-2">HTTP-header</td>
                        <td className="py-2">
                          <span className="text-success">Reduceras till webbläsare</span>
                          <br />
                          <span className="text-xs">Mozilla/5.0... → Chrome</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Session-ID</td>
                        <td className="py-2">Genererad</td>
                        <td className="py-2">Slumpmässig, ej personkopplad</td>
                      </tr>
                      <tr>
                        <td className="py-2">Språkpreferens</td>
                        <td className="py-2">Webbläsare / Analys</td>
                        <td className="py-2">Lagras för statistik</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Anonymiseringsfunktioner</h3>
                  <div className="space-y-4 text-sm">
                    <div className="bg-bg-secondary rounded-lg p-4 font-mono text-xs">
                      <p className="text-text-tertiary mb-2"># IP-anonymisering</p>
                      <p className="text-text-primary">def anonymize_ip(ip: str) → str:</p>
                      <p className="text-text-secondary ml-4"># Ersätter sista oktetten med 'xxx'</p>
                      <p className="text-text-secondary ml-4"># "192.168.1.100" → "192.168.1.xxx"</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4 font-mono text-xs">
                      <p className="text-text-tertiary mb-2"># User-Agent anonymisering</p>
                      <p className="text-text-primary">def anonymize_user_agent(ua: str) → str:</p>
                      <p className="text-text-secondary ml-4"># Extraherar endast webbläsarnamn</p>
                      <p className="text-text-secondary ml-4"># "Mozilla/5.0 (Windows..." → "Chrome"</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Dataflöde</h3>
                  <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                    <ol className="space-y-3 text-text-secondary">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                        <span><strong>Insamling:</strong> Användare skickar meddelande via widget</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                        <span><strong>Anonymisering:</strong> IP och User-Agent anonymiseras innan lagring</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                        <span><strong>AI-behandling:</strong> Lokal Ollama-modell processar frågan (data lämnar aldrig servern)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                        <span><strong>Lagring:</strong> Konversation sparas i SQLite med company_id-isolering</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">5</span>
                        <span><strong>Statistik:</strong> Aggregerad data extraheras till DailyStatistics</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">6</span>
                        <span><strong>Rensning:</strong> Rådata raderas efter retention-perioden</span>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Databasmodeller</h3>
                  <div className="space-y-3 text-sm">
                    <div className="border border-border-subtle rounded-lg p-3">
                      <p className="font-medium text-accent">Conversation</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        session_id, company_id, user_ip_anonymous, user_agent_anonymous, consent_given, consent_timestamp
                      </p>
                    </div>
                    <div className="border border-border-subtle rounded-lg p-3">
                      <p className="font-medium text-accent">Message</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        conversation_id, role (user/assistant), content, timestamp
                      </p>
                    </div>
                    <div className="border border-border-subtle rounded-lg p-3">
                      <p className="font-medium text-accent">DailyStatistics</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        company_id, date, total_conversations, total_messages, category_counts (JSON), language_counts (JSON)
                      </p>
                    </div>
                    <div className="border border-border-subtle rounded-lg p-3">
                      <p className="font-medium text-accent">GDPRAuditLog</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        company_id, action_type, session_id, requester_ip_anonymous, timestamp, details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section aria-labelledby="security-heading">
              <h2 id="security-heading" className="text-xl font-semibold text-text-primary mb-4">Säkerhet</h2>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Säkerhetsåtgärder</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">HTTPS-kryptering</p>
                        <p className="text-xs text-text-secondary mt-1">All kommunikation sker över TLS 1.3</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">JWT-autentisering</p>
                        <p className="text-xs text-text-secondary mt-1">Tidsbegränsade tokens (24h) för API-åtkomst</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Lösenordshashning</p>
                        <p className="text-xs text-text-secondary mt-1">Lösenord lagras aldrig i klartext</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Multi-tenant isolering</p>
                        <p className="text-xs text-text-secondary mt-1">Strikt company_id-filtrering på alla databasfrågor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Lokal AI-behandling</p>
                        <p className="text-xs text-text-secondary mt-1">Data skickas aldrig till externa API:er</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Säkerhetsbegränsningar</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left py-2 text-text-tertiary font-medium">Begränsning</th>
                        <th className="text-left py-2 text-text-tertiary font-medium">Värde</th>
                        <th className="text-left py-2 text-text-tertiary font-medium">Syfte</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Max meddelanden/konversation</td>
                        <td className="py-2">100</td>
                        <td className="py-2">Förhindra överbelastning</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Max konversationer/månad</td>
                        <td className="py-2">Konfigurerbart</td>
                        <td className="py-2">Kostnadskontroll</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Rate limiting (widget)</td>
                        <td className="py-2">10 req/min/IP</td>
                        <td className="py-2">DDoS-skydd</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Max frågelängd</td>
                        <td className="py-2">2000 tecken</td>
                        <td className="py-2">Förhindra missbruk</td>
                      </tr>
                      <tr>
                        <td className="py-2">Filuppladdning</td>
                        <td className="py-2">10 MB</td>
                        <td className="py-2">Lagringskontroll</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Inputvalidering</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    All användarinput valideras för att förhindra attacker:
                  </p>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    <li>• XSS-skydd: HTML-escaping av all output</li>
                    <li>• SQL-injektion: Prepared statements via SQLAlchemy ORM</li>
                    <li>• CSRF: SameSite cookies och origin-validering</li>
                    <li>• Innehållsvalidering: Pydantic-modeller för alla endpoints</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'accessibility' && (
            <section aria-labelledby="a11y-heading">
              <h2 id="a11y-heading" className="text-xl font-semibold text-text-primary mb-4">Tillgänglighet</h2>

              <div className="space-y-6">
                <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-accent font-medium mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l2 2" />
                    </svg>
                    WCAG 2.2 Nivå AA
                  </div>
                  <p className="text-sm text-text-secondary">
                    Chattwidgeten uppfyller tillgänglighetskraven enligt WCAG 2.2 nivå AA och
                    DOS-lagen (Lagen om tillgänglighet till digital offentlig service).
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Implementerade funktioner</h3>
                  <div className="space-y-3">
                    <div className="border-b border-border-subtle pb-3">
                      <p className="font-medium text-text-primary text-sm">ARIA-attribut</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Fullständig ARIA-märkning: role, aria-label, aria-live, aria-expanded, aria-modal
                      </p>
                    </div>
                    <div className="border-b border-border-subtle pb-3">
                      <p className="font-medium text-text-primary text-sm">Tangentbordsnavigering</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Fullständigt användbar utan mus. Tab-ordning, Escape för att stänga, Enter för att skicka.
                      </p>
                    </div>
                    <div className="border-b border-border-subtle pb-3">
                      <p className="font-medium text-text-primary text-sm">Skärmläsarstöd</p>
                      <p className="text-xs text-text-secondary mt-1">
                        aria-live-regioner annonserar nya meddelanden. Skärmläsartext för alla ikoner och knappar.
                      </p>
                    </div>
                    <div className="border-b border-border-subtle pb-3">
                      <p className="font-medium text-text-primary text-sm">Färgkontrast</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Alla text/bakgrund-kombinationer uppfyller 4.5:1 kontrast (AA-nivå).
                      </p>
                    </div>
                    <div className="border-b border-border-subtle pb-3">
                      <p className="font-medium text-text-primary text-sm">Anpassad rörelse</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Respekterar prefers-reduced-motion för användare som är känsliga för animationer.
                      </p>
                    </div>
                    <div className="border-b border-border-subtle pb-3">
                      <p className="font-medium text-text-primary text-sm">Fokushantering</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Synliga fokusramar (3px), fokus-trap i dialoger, fokus återställs efter åtgärder.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">Touch-mål</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Alla interaktiva element har minst 24x24px touch-target (WCAG 2.5.5).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Språkstöd</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-bg-secondary rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🇸🇪</p>
                      <p className="text-sm font-medium text-text-primary">Svenska</p>
                      <p className="text-xs text-text-tertiary">Standard</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🇬🇧</p>
                      <p className="text-sm font-medium text-text-primary">English</p>
                      <p className="text-xs text-text-tertiary">Full support</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🇸🇦</p>
                      <p className="text-sm font-medium text-text-primary">العربية</p>
                      <p className="text-xs text-text-tertiary">RTL-stöd</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'api' && (
            <section aria-labelledby="api-heading">
              <h2 id="api-heading" className="text-xl font-semibold text-text-primary mb-4">API-dokumentation</h2>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Publika endpoints (Widget)</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs">POST</span>
                        <span className="text-text-primary">/chat/{'{company_id}'}</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Skicka fråga och få AI-svar</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
                        <span className="text-text-primary">/widget/{'{company_id}'}/config</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Hämta widget-konfiguration</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs">POST</span>
                        <span className="text-text-primary">/gdpr/{'{company_id}'}/consent</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Registrera samtycke</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
                        <span className="text-text-primary">/gdpr/{'{company_id}'}/my-data</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Hämta användarens data (Art. 15)</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-error/20 text-error rounded text-xs">DELETE</span>
                        <span className="text-text-primary">/gdpr/{'{company_id}'}/my-data</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Radera användarens data (Art. 17)</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Autentiserade endpoints (Admin)</h3>
                  <p className="text-xs text-text-tertiary mb-3">Kräver JWT-token i Authorization header</p>
                  <div className="space-y-3 text-sm">
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
                        <span className="text-text-primary">/knowledge</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Lista kunskapsbas</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
                        <span className="text-text-primary">/conversations</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Lista konversationer</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
                        <span className="text-text-primary">/analytics</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Hämta statistik och analyser</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
                        <span className="text-text-primary">/templates</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Lista tillgängliga kunskapsmallar</p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3 font-mono">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs">POST</span>
                        <span className="text-text-primary">/templates/{'{template_id}'}/apply</span>
                      </div>
                      <p className="text-text-tertiary text-xs">Applicera kunskapsmall</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Autentisering</h3>
                  <div className="bg-bg-secondary rounded-lg p-4 font-mono text-xs">
                    <p className="text-text-tertiary mb-2"># Login</p>
                    <p className="text-text-primary">POST /auth/login</p>
                    <p className="text-text-secondary">{'{'}"company_id": "demo", "password": "demo123"{'}'}</p>
                    <p className="text-text-tertiary mt-3 mb-2"># Response</p>
                    <p className="text-text-secondary">{'{'}"token": "eyJhbG...", "company_id": "demo"{'}'}</p>
                    <p className="text-text-tertiary mt-3 mb-2"># Användning</p>
                    <p className="text-text-secondary">Authorization: Bearer eyJhbG...</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default Documentation
