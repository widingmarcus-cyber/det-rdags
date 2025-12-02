import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Bobot Mascot - a cute, friendly little robot
function BobotMascot({ className = "", size = 120, animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-bounce-slow' : ''}`}
      aria-label="Bobot mascot"
    >
      {/* Body */}
      <rect x="30" y="45" width="60" height="55" rx="12" fill="#D97757" />
      <rect x="34" y="49" width="52" height="47" rx="9" fill="#F5F5F4" />

      {/* Screen/Face area */}
      <rect x="38" y="53" width="44" height="30" rx="6" fill="#1C1917" />

      {/* Eyes */}
      <circle cx="52" cy="68" r="6" fill="#D97757">
        <animate attributeName="r" values="6;5;6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="68" cy="68" r="6" fill="#D97757">
        <animate attributeName="r" values="6;5;6" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Eye shine */}
      <circle cx="54" cy="66" r="2" fill="#FEF2EE" />
      <circle cx="70" cy="66" r="2" fill="#FEF2EE" />

      {/* Smile */}
      <path d="M52 76 Q60 82 68 76" stroke="#4A9D7C" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Antenna */}
      <rect x="57" y="30" width="6" height="18" rx="3" fill="#D97757" />
      <circle cx="60" cy="26" r="8" fill="#D97757">
        <animate attributeName="fill" values="#D97757;#C4613D;#D97757" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="26" r="4" fill="#FEF2EE" />

      {/* Arms */}
      <rect x="18" y="58" width="14" height="8" rx="4" fill="#D97757" />
      <rect x="88" y="58" width="14" height="8" rx="4" fill="#D97757" />

      {/* Hands */}
      <circle cx="16" cy="62" r="6" fill="#D97757" />
      <circle cx="104" cy="62" r="6" fill="#D97757" />

      {/* Legs */}
      <rect x="40" y="98" width="12" height="14" rx="4" fill="#D97757" />
      <rect x="68" y="98" width="12" height="14" rx="4" fill="#D97757" />

      {/* Feet */}
      <rect x="36" y="108" width="20" height="8" rx="4" fill="#1C1917" />
      <rect x="64" y="108" width="20" height="8" rx="4" fill="#1C1917" />

      {/* Belly button / power indicator */}
      <circle cx="60" cy="90" r="4" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// Small inline mascot for use in text
function BobotMini({ className = "" }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <rect x="30" y="45" width="60" height="55" rx="12" fill="#D97757" />
      <rect x="34" y="49" width="52" height="47" rx="9" fill="#F5F5F4" />
      <rect x="38" y="53" width="44" height="30" rx="6" fill="#1C1917" />
      <circle cx="52" cy="68" r="6" fill="#D97757" />
      <circle cx="68" cy="68" r="6" fill="#D97757" />
      <circle cx="54" cy="66" r="2" fill="#FEF2EE" />
      <circle cx="70" cy="66" r="2" fill="#FEF2EE" />
      <path d="M52 76 Q60 82 68 76" stroke="#4A9D7C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="57" y="30" width="6" height="18" rx="3" fill="#D97757" />
      <circle cx="60" cy="26" r="8" fill="#D97757" />
    </svg>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-text-primary tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:hej@bobot.nu" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Kontakt
            </a>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary text-sm px-4 py-2"
            >
              Logga in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <BobotMascot size={140} animated />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary tracking-tight leading-tight mb-6">
            AI-chattbot för
            <span className="block text-accent">fastighetsbolag</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Låt Bobot svara på hyresgästernas frågor - dygnet runt, på flera språk.
            Bygg enkelt upp en kunskapsbas och ge dina hyresgäster snabba, korrekta svar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:hej@bobot.nu?subject=Intresserad av Bobot"
              className="btn btn-primary text-base px-8 py-4"
            >
              Boka demo
            </a>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-secondary text-base px-8 py-4"
            >
              Logga in
            </button>
          </div>
        </div>
      </section>

      {/* Social proof / Trust bar */}
      <section className="py-12 border-y border-border-subtle bg-bg-secondary/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <p className="text-3xl font-semibold text-text-primary">GDPR</p>
              <p className="text-sm text-text-tertiary mt-1">Säker datahantering</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">24/7</p>
              <p className="text-sm text-text-tertiary mt-1">Alltid tillgänglig</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">3</p>
              <p className="text-sm text-text-tertiary mt-1">Språk</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">Lokal AI</p>
              <p className="text-sm text-text-tertiary mt-1">Ingen extern molntjänst</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-4">
              Samma frågor, om och om igen?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Hyresgäster ställer ofta samma frågor - om hyra, tvättstuga, felanmälan.
              Bobot svarar automatiskt så att du kan fokusera på det som kräver mänsklig kontakt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-14 h-14 bg-accent-soft rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Dygnet runt</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Bobot svarar direkt, även kvällar och helger när kontoret är stängt.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 bg-success-soft rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Sparar tid</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Färre telefonsamtal och mejl för vanliga frågor. Mer tid för er.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 bg-warning-soft rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">GDPR-säker</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                All data hanteras enligt dataskyddsförordningen och raderas automatiskt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-4">
              Enkelt att komma igång
            </h2>
            <p className="text-lg text-text-secondary">
              Tre steg - sedan är din chattbot live.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="text-6xl font-bold text-accent/20 mb-4">01</div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Bygg kunskapsbasen</h3>
              <p className="text-text-secondary leading-relaxed">
                Lägg till frågor och svar som är relevanta för dina hyresgäster.
                Använd färdiga mallar eller importera från Excel.
              </p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-accent/20 mb-4">02</div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Anpassa utseendet</h3>
              <p className="text-text-secondary leading-relaxed">
                Välj färger som matchar din grafiska profil och skriv ett
                välkomstmeddelande till besökarna.
              </p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-accent/20 mb-4">03</div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Installera på hemsidan</h3>
              <p className="text-text-secondary leading-relaxed">
                Kopiera en enkel kodsnutt och klistra in på din hemsida.
                Klart - chattbubblans dyker upp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-6">
                Allt du behöver för att automatisera kundtjänst
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Flerspråkig</h4>
                    <p className="text-sm text-text-secondary">Svenska, engelska och arabiska med RTL-stöd</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Detaljerad analys</h4>
                    <p className="text-sm text-text-secondary">Se vilka frågor som ställs och vilka som inte kunde besvaras</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Lokal AI</h4>
                    <p className="text-sm text-text-secondary">AI:n körs lokalt - ingen data skickas till externa molntjänster</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Enkel installation</h4>
                    <p className="text-sm text-text-secondary">Fungerar med WordPress, Squarespace, Wix och alla andra plattformar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Mock chat widget */}
              <div className="bg-bg-tertiary rounded-2xl shadow-lg border border-border-subtle p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle">
                  <BobotMini />
                  <div>
                    <p className="font-semibold text-text-primary text-sm">Bobot</p>
                    <p className="text-xs text-success">Online</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-sm text-text-primary">Hej! Hur kan jag hjälpa dig idag?</p>
                  </div>

                  <div className="bg-accent text-text-inverse rounded-lg rounded-tr-none p-3 max-w-[85%] ml-auto">
                    <p className="text-sm">När ska hyran betalas?</p>
                  </div>

                  <div className="bg-bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-sm text-text-primary">Hyran ska betalas senast den sista vardagen varje månad. Du kan betala via autogiro eller bankgiro.</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <div className="bg-bg-secondary rounded-lg px-4 py-3 text-sm text-text-tertiary">
                    Skriv din fråga...
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-success/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-bg-secondary/50">
        <div className="max-w-3xl mx-auto text-center">
          <BobotMascot size={100} className="mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-4">
            Redo att automatisera?
          </h2>
          <p className="text-lg text-text-secondary mb-10">
            Kontakta oss för en demo eller börja direkt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:hej@bobot.nu?subject=Intresserad av Bobot"
              className="btn btn-primary text-base px-8 py-4"
            >
              Kontakta oss
            </a>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-secondary text-base px-8 py-4"
            >
              Logga in
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BobotMini />
              <span className="text-lg font-semibold text-text-primary">Bobot</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-text-secondary">
              <a href="mailto:hej@bobot.nu" className="hover:text-text-primary transition-colors">
                hej@bobot.nu
              </a>
              <button
                onClick={() => navigate('/login')}
                className="hover:text-text-primary transition-colors"
              >
                Logga in
              </button>
            </div>

            <p className="text-sm text-text-tertiary">
              &copy; {new Date().getFullYear()} Bobot. GDPR-kompatibel.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom animation for mascot */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
