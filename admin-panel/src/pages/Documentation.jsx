import { useState } from 'react'

function Documentation() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Översikt' },
    { id: 'installation', label: 'Installation' },
    { id: 'widgets', label: 'Widgets' },
    { id: 'tips', label: 'Bästa praxis' },
    { id: 'features', label: 'Funktioner' },
    { id: 'gdpr', label: 'Dataskydd' },
    { id: 'security', label: 'Säkerhet' },
    { id: 'selfhosting', label: 'Egen server' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dokumentation</h1>
        <p className="text-text-secondary mt-1">Lär dig hur Bobot fungerar och skyddar dina data</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar navigation - horizontal scroll on mobile, sidebar on desktop */}
        <nav className="w-full md:w-48 flex-shrink-0 overflow-hidden" aria-label="Dokumentationsnavigation">
          <ul className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:sticky md:top-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {sections.map(section => (
              <li key={section.id} className="flex-shrink-0">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-accent-soft text-accent font-medium'
                      : 'text-text-secondary bg-bg-secondary md:bg-transparent hover:bg-bg-tertiary hover:text-text-primary'
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
        <main className="flex-1 max-w-3xl min-w-0" role="article">
          {activeSection === 'overview' && (
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-xl font-semibold text-text-primary mb-4">Översikt</h2>

              <div className="prose prose-sm max-w-none space-y-6">
                <div className="card">
                  <h3 className="font-medium text-text-primary mb-2">Vad är Bobot?</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Bobot är en smart AI-chattbot för företag. Den hjälper dig att automatiskt
                    svara på dina kunders vanligaste frågor - dygnet runt, på flera språk.
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed mt-3">
                    Du bygger enkelt upp en kunskapsbas med frågor och svar, och AI:n använder
                    sedan denna information för att hjälpa dina kunder direkt via din hemsida.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Så fungerar det</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Bygg din kunskapsbas</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Lägg till frågor och svar som är relevanta för dina kunder.
                          Du kan använda färdiga mallar eller importera från Excel/Word.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Anpassa chatten</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Välj färger som matchar din profil, skriv ett välkomstmeddelande
                          och bestäm var chattbubblans ska visas på din hemsida.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Installera på din hemsida</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Kopiera en enkel kod-snutt och klistra in på din hemsida.
                          Chattbubblans dyker upp automatiskt för dina besökare.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Följ upp och förbättra</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Se vilka frågor som ställs, vilka som inte kunde besvaras,
                          och förbättra din kunskapsbas kontinuerligt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Fördelar</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Alltid tillgänglig</p>
                        <p className="text-xs text-text-tertiary">Svarar dygnet runt</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Flera språk</p>
                        <p className="text-xs text-text-tertiary">Svenska, engelska, arabiska</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">GDPR-säker</p>
                        <p className="text-xs text-text-tertiary">Data skyddas enligt lag</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Sparar tid</p>
                        <p className="text-xs text-text-tertiary">Färre samtal och mejl</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'installation' && (
            <section aria-labelledby="installation-heading">
              <h2 id="installation-heading" className="text-xl font-semibold text-text-primary mb-4">Installation</h2>

              <div className="space-y-6">
                <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Att lägga till Bobot på din hemsida tar bara några minuter. Du behöver kopiera
                    en kort kod och klistra in den på din hemsida.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Steg 1: Kopiera koden</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    Gå till <strong>"Widgets"</strong> i menyn till vänster. Där hittar du dina widgets och
                    deras unika widget-nycklar. Klicka på <strong>"Kopiera"</strong>-knappen för den widget du vill använda.
                  </p>
                  <div className="bg-bg-secondary rounded-lg p-4 text-sm text-text-tertiary">
                    Koden ser ut ungefär så här:
                    <pre className="mt-2 text-xs overflow-x-auto">
{`<script src="https://din-domän.se/widget.js"></script>
<script>
  Bobot.init({ widgetKey: 'din-widget-nyckel' });
</script>`}
                    </pre>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-text-secondary">
                      <strong>Flera widgets:</strong> Du kan ha olika widgets för olika användningsområden.
                      Till exempel en <em>extern widget</em> för kunder och en <em>intern widget</em> för anställda.
                      Varje widget har sin egen kunskapsbas och inställningar.
                    </p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Steg 2: Klistra in på din hemsida</h3>

                  <div className="space-y-4">
                    {/* WordPress */}
                    <div className="border border-border-subtle rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left"
                        onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('hidden')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#21759b]/10 rounded-lg flex items-center justify-center">
                            <span className="text-[#21759b] font-bold text-lg">W</span>
                          </div>
                          <span className="font-medium text-text-primary">WordPress</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className="p-4 border-t border-border-subtle">
                        <ol className="space-y-3 text-sm text-text-secondary">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">1</span>
                            <span>Logga in på din WordPress-admin (vanligtvis <em>din-sida.se/wp-admin</em>)</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">2</span>
                            <span>Gå till <strong>Utseende → Tema-redigerare</strong> (eller <strong>Theme Editor</strong>)</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">3</span>
                            <span>Välj filen <strong>footer.php</strong> i listan till höger</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">4</span>
                            <span>Hitta raden <code className="bg-bg-secondary px-1 rounded">&lt;/body&gt;</code> och klistra in koden <strong>precis ovanför</strong></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">5</span>
                            <span>Klicka <strong>Uppdatera fil</strong></span>
                          </li>
                        </ol>
                        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <p className="text-xs text-text-secondary">
                            <strong>Tips:</strong> Använder du ett page builder-plugin (Elementor, Divi, etc.)?
                            Lägg istället till en "HTML"-widget i din footer-mall.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Squarespace */}
                    <div className="border border-border-subtle rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left"
                        onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('hidden')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-lg">S</span>
                          </div>
                          <span className="font-medium text-text-primary">Squarespace</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className="p-4 border-t border-border-subtle hidden">
                        <ol className="space-y-3 text-sm text-text-secondary">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">1</span>
                            <span>Gå till <strong>Inställningar → Avancerat → Kodinmatning</strong></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">2</span>
                            <span>Klistra in koden i fältet <strong>"Footer"</strong></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">3</span>
                            <span>Klicka <strong>Spara</strong></span>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Wix */}
                    <div className="border border-border-subtle rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left"
                        onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('hidden')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0C6EFC]/10 rounded-lg flex items-center justify-center">
                            <span className="text-[#0C6EFC] font-bold text-lg">W</span>
                          </div>
                          <span className="font-medium text-text-primary">Wix</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className="p-4 border-t border-border-subtle hidden">
                        <ol className="space-y-3 text-sm text-text-secondary">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">1</span>
                            <span>Öppna Wix Editor och gå till <strong>Inställningar → Tracking & Analytics</strong></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">2</span>
                            <span>Klicka <strong>+ New Tool → Custom</strong></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">3</span>
                            <span>Klistra in koden och välj <strong>"Body - end"</strong></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">4</span>
                            <span>Klicka <strong>Apply</strong></span>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Annan hemsida */}
                    <div className="border border-border-subtle rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left"
                        onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('hidden')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-text-tertiary/10 rounded-lg flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                          </div>
                          <span className="font-medium text-text-primary">Annan hemsida</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className="p-4 border-t border-border-subtle hidden">
                        <p className="text-sm text-text-secondary mb-3">
                          Klistra in koden i din HTML-fil, precis före <code className="bg-bg-secondary px-1 rounded">&lt;/body&gt;</code>-taggen.
                        </p>
                        <div className="bg-bg-secondary rounded-lg p-3 text-xs font-mono overflow-x-auto">
{`<!DOCTYPE html>
<html>
<head>...</head>
<body>
  ... din sidas innehåll ...

  <!-- Bobot chattbot -->
  <script src="..."></script>
  <script>Bobot.init({...});</script>
</body>
</html>`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Steg 3: Klart!</h3>
                  <p className="text-sm text-text-secondary">
                    Besök din hemsida - du borde nu se en chattbubbla i nedre högra hörnet.
                    Testa att klicka på den och ställa en fråga!
                  </p>
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-xs text-text-secondary">
                      <strong>Fungerar det inte?</strong> Prova att rensa webbläsarens cache (Ctrl+Shift+R)
                      eller vänta några minuter om din hemsida använder caching.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'widgets' && (
            <section aria-labelledby="widgets-heading">
              <h2 id="widgets-heading" className="text-xl font-semibold text-text-primary mb-4">Widgets</h2>

              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Widgets låter dig ha separata chattbotar för olika målgrupper - till exempel
                    en för kunder och en för anställda - med varsin kunskapsbas och inställningar.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Vad är widgets?</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    En widget är en instans av din chattbot med egna inställningar. Varje widget har:
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span><strong>Egen kunskapsbas</strong> - Lägg till frågor/svar som bara gäller för denna widget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span><strong>Egna färger och stil</strong> - Anpassa utseendet för varje målgrupp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span><strong>Egna meddelanden</strong> - Välkomsttext, fallback-meddelande, etc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span><strong>Unik widget-nyckel</strong> - För att identifiera widgeten vid installation</span>
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Widget-typer</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-border-subtle rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Extern</span>
                        <span className="font-medium text-text-primary">Kundtjänst</span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        För externa besökare och kunder. Installeras på din publika hemsida.
                        Kunskapsbasen innehåller information om produkter, tjänster, priser, etc.
                      </p>
                    </div>
                    <div className="border border-border-subtle rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Intern</span>
                        <span className="font-medium text-text-primary">Medarbetarstöd</span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        För anställda. Installeras på ert intranät eller interna system.
                        Kunskapsbasen innehåller policyer, rutiner, HR-information, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Använda en widget</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Varje företagskonto har två fördefinierade widgets: <strong>Extern Widget</strong> (för kunder)
                    och <strong>Intern Widget</strong> (för medarbetare). Dessa skapas automatiskt och är redo att användas.
                  </p>
                  <ol className="space-y-3 text-sm text-text-secondary">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">1</span>
                      <span>Klicka på <strong>"Extern Widget"</strong> eller <strong>"Intern Widget"</strong> i menyn</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">2</span>
                      <span>Anpassa inställningar: färger, meddelanden, ton och kontaktinfo</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">3</span>
                      <span>Bygg din kunskapsbas under fliken <strong>"Kunskapsbank"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">4</span>
                      <span>Kopiera installationskoden längst ner på sidan och lägg till på din hemsida</span>
                    </li>
                  </ol>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Lägga till kunskap till en widget</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    När du lägger till frågor/svar i kunskapsbasen kan du välja vilken widget de ska tillhöra:
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-accent">Delad</span>
                      <span>- Tillgänglig för alla widgets (standard)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Widget-specifik</span>
                      <span>- Endast tillgänglig för den valda widgeten</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-accent-soft border border-accent/20 rounded-lg">
                    <p className="text-xs text-text-secondary">
                      <strong>Tips:</strong> Gemensam information (t.ex. kontaktuppgifter) kan vara delad,
                      medan specifik information (t.ex. HR-policyer) bör vara kopplad till rätt widget.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'tips' && (
            <section aria-labelledby="tips-heading">
              <h2 id="tips-heading" className="text-xl font-semibold text-text-primary mb-4">Bästa praxis</h2>

              <div className="space-y-6">
                <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Följ dessa tips för att få ut mest av din chattbot och undvika vanliga misstag.
                  </p>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-primary">Testa internt först!</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    Innan du publicerar chattboten på din riktiga hemsida, rekommenderar vi starkt att du:
                  </p>
                  <ol className="space-y-2 text-sm text-text-secondary">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">1</span>
                      <span><strong>Testa på en intern/staging-sida</strong> - Installera widgeten på en testsida som bara ni har tillgång till</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">2</span>
                      <span><strong>Låt kollegor testa</strong> - Be medarbetare ställa frågor de tror kunder skulle ställa</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">3</span>
                      <span><strong>Granska svaren</strong> - Kolla att AI:n svarar korrekt och inte hittar på information</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">4</span>
                      <span><strong>Finjustera kunskapsbasen</strong> - Lägg till svar för frågor som inte kunde besvaras</span>
                    </li>
                  </ol>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Bygg en bra kunskapsbas</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Börja litet</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Lägg in de 20-30 vanligaste frågorna först. Det är bättre med få, korrekta svar
                          än många som kanske är fel.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Skriv naturligt</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Formulera frågorna som dina kunder faktiskt skulle ställa dem,
                          inte som interna termer.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Var specifik</p>
                        <p className="text-xs text-text-secondary mt-1">
                          "Leveranstiden är 3-5 arbetsdagar inom Sverige" är bättre än
                          "Vi skickar så snabbt vi kan".
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Håll informationen uppdaterad</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Sätt en påminnelse att granska kunskapsbasen varje kvartal, eller när
                          ni ändrar rutiner.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Följ upp och förbättra</h3>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Kolla "Obesvarade frågor" regelbundet</strong> - Under Analys ser du vilka
                        frågor som inte kunde besvaras. Lägg till svar för dessa!
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Läs igenom konversationer</strong> - Se hur AI:n svarar och om något
                        behöver justeras.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Be om feedback</strong> - Fråga kunder vad de tycker om chattboten.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Kommunicera med kunder</h3>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Var tydlig med att det är AI</strong> - Kunder uppskattar
                        ärlighet. Välkomstmeddelandet kan nämna att det är en AI-assistent.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Ha tydlig fallback</strong> - Se till att kontaktuppgifter visas
                        tydligt för frågor AI:n inte kan svara på.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Informera personalen</strong> - Se till att alla vet att ni har en
                        chattbot och hur den fungerar.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card bg-success/5 border-success/20">
                  <h3 className="font-medium text-text-primary mb-3">Checklista innan lansering</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-success" />
                      Kunskapsbasen innehåller minst 20 frågor/svar
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-success" />
                      Kollegor har testat och godkänt svaren
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-success" />
                      Kontaktuppgifter är ifyllda i inställningar
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-success" />
                      Välkomstmeddelande är anpassat
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-success" />
                      Widgetens färger matchar hemsidan
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-success" />
                      GDPR-inställningar är konfigurerade
                    </label>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'features' && (
            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-xl font-semibold text-text-primary mb-4">Funktioner</h2>

              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-primary">Kunskapsbas</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    Lägg till frågor och svar som AI:n ska kunna besvara. Du kan:
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Skriva frågor/svar manuellt
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Använda färdiga mallar för vanliga branscher
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Importera från Excel, Word eller PDF
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Importera direkt från en webbsida
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Organisera i kategorier
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-primary">Chattwidget</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    En snygg chattbubbla som visas på din hemsida. Anpassningsbar:
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Välj färger som matchar din grafiska profil
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Skriv eget välkomstmeddelande
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Placera till höger eller vänster
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Automatisk språkdetektering
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Mörkt läge för kvällsanvändning
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-primary">Statistik & Analys</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    Få insikter om vad dina kunder frågar om:
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Antal konversationer per dag/vecka/månad
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Vilka frågor som ställs mest
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Frågor som inte kunde besvaras
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Vilket språk användarna pratar
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Exportera data till Excel
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-primary">Inställningar</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    Anpassa hur länge data sparas och hur chatten ska bete sig:
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Välj hur länge konversationer sparas (7-30 dagar)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Bestäm om samtycke krävs innan chatt
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Sätt kontaktinformation som visas i chatten
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      Byt lösenord när som helst
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'gdpr' && (
            <section aria-labelledby="gdpr-heading">
              <h2 id="gdpr-heading" className="text-xl font-semibold text-text-primary mb-4">Dataskydd</h2>

              <div className="space-y-6">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-success font-medium mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    GDPR-kompatibel
                  </div>
                  <p className="text-sm text-text-secondary">
                    Bobot är byggt för att följa dataskyddsförordningen (GDPR). All data hanteras
                    säkert och raderas automatiskt enligt dina inställningar.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Vilken data samlas in?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Chattmeddelanden</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Det kunden skriver och AI:ns svar. Raderas automatiskt efter den
                          tid du valt (7-30 dagar).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Anonymiserad statistik</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Antal konversationer, vanligaste frågorna etc. Kan inte kopplas till
                          enskilda personer. Sparas för att ge dig insikter.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Vad samlas INTE in?</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Fullständiga IP-adresser (endast anonymiserade)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Namn, e-post eller personnummer
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Cookies som spårar användare
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Platsinformation
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Användarens rättigheter</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    Dina kunder kan direkt i chatten:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-medium text-sm">👁</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Se sin data</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Klicka på "Visa min data" för att se vad som sparats
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-error/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-error font-medium text-sm">🗑</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Radera sin data</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Klicka på "Radera min data" för att ta bort allt permanent
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Automatisk rensning</h3>
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <p className="text-sm text-text-secondary">
                      Konversationer raderas automatiskt efter den tid du ställt in (7-30 dagar).
                      Du behöver inte göra något manuellt - systemet sköter detta åt dig.
                    </p>
                    <p className="text-sm text-text-secondary mt-2">
                      Innan radering sparas anonymiserad statistik (antal konversationer,
                      vanligaste kategorier etc.) så att du fortfarande kan följa trender.
                    </p>
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
                  <h3 className="font-medium text-text-primary mb-3">Hur skyddas data?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Krypterad kommunikation</p>
                        <p className="text-xs text-text-secondary mt-1">
                          All data skickas krypterat mellan din hemsida och Bobot (HTTPS)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Lokal AI</p>
                        <p className="text-xs text-text-secondary mt-1">
                          AI:n körs lokalt - dina kunders frågor skickas aldrig till externa
                          tjänster som ChatGPT eller Google
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Separerad data</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Din data är helt separerad från andra företags data - ingen kan se
                          eller komma åt din information
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Säkra lösenord</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Ditt lösenord sparas aldrig i klartext - det krypteras med samma
                          teknik som banker använder
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Skydd mot missbruk</h3>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Hastighetsbegränsning:</strong> Förhindrar att någon skickar
                        hundratals meddelanden i sekunden
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Meddelandegräns:</strong> Max 100 meddelanden per konversation
                        för att undvika överbelastning
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong>Textbegränsning:</strong> Max 2000 tecken per fråga för att
                        förhindra extremt långa meddelanden
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'selfhosting' && (
            <section aria-labelledby="selfhosting-heading">
              <h2 id="selfhosting-heading" className="text-xl font-semibold text-text-primary mb-4">Egen server</h2>

              <div className="space-y-6">
                <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Vill ni ha full kontroll över er data? Bobot kan installeras på er egen server.
                    Detta kräver viss teknisk kompetens, men ger er total kontroll.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Varför egen server?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Full datakontroll</p>
                        <p className="text-xs text-text-secondary mt-1">
                          All data stannar på er egen server - ni bestämmer helt var data lagras
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Ingen tredjepartsberoendet</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Systemet fungerar oberoende av externa tjänster
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Anpassningsbar</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Möjlighet att anpassa och integrera med era befintliga system
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Systemkrav</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">Hårdvara</p>
                      <ul className="space-y-1 text-sm text-text-secondary">
                        <li className="flex items-center gap-2">
                          <span className="text-accent">•</span>
                          Minst 8 GB RAM (16 GB rekommenderas för AI-modellen)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent">•</span>
                          20 GB lagringsutrymme
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent">•</span>
                          Modern CPU (4+ kärnor rekommenderas)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">Programvara</p>
                      <ul className="space-y-1 text-sm text-text-secondary">
                        <li className="flex items-center gap-2">
                          <span className="text-accent">•</span>
                          Docker och Docker Compose
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent">•</span>
                          Linux, Windows Server eller macOS
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-4">Installation (för IT-administratörer)</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Bobot levereras som en Docker-uppsättning med fyra tjänster. Kontakta oss för att få
                    tillgång till installationsfilerna och licens.
                  </p>
                  <ol className="space-y-4 text-sm text-text-secondary">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">1</span>
                      <div>
                        <p className="font-medium text-text-primary">Förbered servern</p>
                        <p className="text-xs mt-1">Installera Docker och Docker Compose på servern. Kontrollera att portarna 3000, 3001, 8000 och 11434 är tillgängliga.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">2</span>
                      <div>
                        <p className="font-medium text-text-primary">Konfigurera miljövariabler</p>
                        <p className="text-xs mt-1">Skapa en .env-fil med följande inställningar:</p>
                        <div className="mt-2 bg-bg-secondary rounded-lg p-3 font-mono text-xs overflow-x-auto">
{`ENVIRONMENT=production
SECRET_KEY=generera-en-säker-nyckel-minst-64-tecken
CORS_ORIGINS=https://er-domän.se,https://admin.er-domän.se
ADMIN_PASSWORD=starkt-adminlösenord`}
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">3</span>
                      <div>
                        <p className="font-medium text-text-primary">Starta tjänsterna</p>
                        <div className="mt-2 bg-bg-secondary rounded-lg p-3 font-mono text-xs overflow-x-auto">
                          docker-compose up -d
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">4</span>
                      <div>
                        <p className="font-medium text-text-primary">Ladda ner AI-modellen (första gången)</p>
                        <div className="mt-2 bg-bg-secondary rounded-lg p-3 font-mono text-xs overflow-x-auto">
                          docker exec -it bobot-ollama-1 ollama pull qwen2.5:14b
                        </div>
                        <p className="text-xs mt-2">Detta tar några minuter beroende på er internetanslutning (modellen är ca 8 GB).</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-soft text-accent rounded-full flex items-center justify-center text-xs font-medium">5</span>
                      <div>
                        <p className="font-medium text-text-primary">Konfigurera reverse proxy och HTTPS</p>
                        <p className="text-xs mt-1">
                          Använd nginx, Caddy eller Traefik för att exponera tjänsterna med HTTPS.
                          HTTPS är obligatoriskt i produktion för säker kommunikation.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Tjänster och portar</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Bobot består av fyra Docker-tjänster som kommunicerar internt:
                  </p>
                  <div className="bg-bg-secondary rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-subtle">
                          <th className="text-left p-3 font-medium text-text-primary">Tjänst</th>
                          <th className="text-left p-3 font-medium text-text-primary">Port</th>
                          <th className="text-left p-3 font-medium text-text-primary">Beskrivning</th>
                        </tr>
                      </thead>
                      <tbody className="text-text-secondary">
                        <tr className="border-b border-border-subtle">
                          <td className="p-3">Admin-panel</td>
                          <td className="p-3 font-mono">3000</td>
                          <td className="p-3">Administrationsgränssnitt (React)</td>
                        </tr>
                        <tr className="border-b border-border-subtle">
                          <td className="p-3">Backend API</td>
                          <td className="p-3 font-mono">8000</td>
                          <td className="p-3">REST API (FastAPI/Python)</td>
                        </tr>
                        <tr className="border-b border-border-subtle">
                          <td className="p-3">Widget-server</td>
                          <td className="p-3 font-mono">3001</td>
                          <td className="p-3">Chattwidget-distribution</td>
                        </tr>
                        <tr>
                          <td className="p-3">Ollama</td>
                          <td className="p-3 font-mono">11434</td>
                          <td className="p-3">Lokal AI-motor (intern)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-text-tertiary mt-3">
                    Ollama-porten (11434) behöver normalt inte exponeras externt - den används endast internt av backend.
                  </p>
                </div>

                <div className="card bg-warning/5 border-warning/20">
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <h3 className="font-medium text-text-primary">Säkerhetsrekommendationer</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>
                        <strong>Säkerhetskopiering:</strong> Schemalägg daglig backup av databasen (bobot.db)
                        och konfigurera offsite-lagring
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>
                        <strong>HTTPS obligatoriskt:</strong> Använd alltid TLS/HTTPS i produktion -
                        Bobot aktiverar automatiskt säkerhetsheaders (HSTS, CSP) när HTTPS detekteras
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>
                        <strong>Brandväggsregler:</strong> Exponera endast port 3000 (admin), 8000 (API)
                        och 3001 (widget) externt. Håll Ollama intern.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>
                        <strong>Lösenordspolicy:</strong> Använd starka lösenord för admin och
                        generera SECRET_KEY med kryptografiskt säker slumpgenerator
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>
                        <strong>Övervakning:</strong> Övervaka tjänsternas hälsa via /health-endpointen
                        och logga åtkomst
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text-primary mb-3">Kontakta oss</h3>
                  <p className="text-sm text-text-secondary">
                    Vill ni köra Bobot på egen server? Kontakta oss för att diskutera licensiering,
                    få tillgång till installationspaket och eventuell hjälp med uppsättning.
                  </p>
                  <div className="mt-4 p-3 bg-accent-soft rounded-lg">
                    <p className="text-sm text-text-secondary">
                      <strong>E-post:</strong> hej@bobot.nu
                    </p>
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
