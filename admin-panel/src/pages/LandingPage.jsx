import { useNavigate } from 'react-router-dom'

// WALL-E inspired Bobot mascot - boxy body, big binocular eyes
function BobotMascot({ className = "", size = 120 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bobot mascot"
    >
      {/* Tracks/wheels */}
      <rect x="25" y="95" width="30" height="12" rx="6" fill="#78716C" />
      <rect x="65" y="95" width="30" height="12" rx="6" fill="#78716C" />
      <rect x="28" y="97" width="24" height="8" rx="4" fill="#57534E" />
      <rect x="68" y="97" width="24" height="8" rx="4" fill="#57534E" />

      {/* Body - boxy compactor style */}
      <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
      <rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />

      {/* Body details - panels */}
      <rect x="36" y="75" width="20" height="16" rx="2" fill="#1C1917" />
      <rect x="64" y="75" width="20" height="16" rx="2" fill="#1C1917" />

      {/* Neck */}
      <rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />

      {/* Head - binocular eyes like WALL-E */}
      <rect x="35" y="20" width="50" height="28" rx="4" fill="#D97757" />

      {/* Eye housings (binocular style) */}
      <ellipse cx="48" cy="34" rx="12" ry="11" fill="#1C1917" />
      <ellipse cx="72" cy="34" rx="12" ry="11" fill="#1C1917" />

      {/* Eye lenses */}
      <ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
      <ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />

      {/* Pupils - the expressive part */}
      <ellipse cx="48" cy="35" rx="5" ry="5" fill="#D97757">
        <animate attributeName="cy" values="35;33;35" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="72" cy="35" rx="5" ry="5" fill="#D97757">
        <animate attributeName="cy" values="35;33;35" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Eye shine */}
      <circle cx="50" cy="32" r="2" fill="#FEF2EE" />
      <circle cx="74" cy="32" r="2" fill="#FEF2EE" />

      {/* Eye bridge */}
      <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />

      {/* Arms */}
      <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C" />
      <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C" />

      {/* Hands/grippers */}
      <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E" />
      <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E" />

      {/* Antenna */}
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="4" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// Mini version for navbar
function BobotMini({ className = "" }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
      <rect x="35" y="20" width="50" height="28" rx="4" fill="#D97757" />
      <ellipse cx="48" cy="34" rx="10" ry="9" fill="#1C1917" />
      <ellipse cx="72" cy="34" rx="10" ry="9" fill="#1C1917" />
      <ellipse cx="48" cy="35" rx="5" ry="5" fill="#D97757" />
      <ellipse cx="72" cy="35" rx="5" ry="5" fill="#D97757" />
      <circle cx="50" cy="32" r="2" fill="#FEF2EE" />
      <circle cx="74" cy="32" r="2" fill="#FEF2EE" />
    </svg>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-text-primary tracking-tight">Bobot</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary text-sm px-5 py-2"
          >
            Logga in
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - text */}
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-text-primary tracking-tight leading-tight mb-6">
                Automatisera hyresgästernas frågor
              </h1>

              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                Bobot är en AI-chattbot som svarar på vanliga frågor åt dig -
                dygnet runt. Bygg en kunskapsbas, installera på din hemsida, klart.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-text-secondary">Svarar direkt, även kvällar och helger</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-text-secondary">GDPR-säker - data raderas automatiskt</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-text-secondary">Lokal AI - ingen extern molntjänst</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary text-base px-8 py-4 w-full sm:w-auto"
                >
                  Kom igång
                </button>
                <p className="text-sm text-text-tertiary">
                  Intresserad? Mejla till <a href="mailto:hej@bobot.nu" className="text-accent hover:underline">hej@bobot.nu</a>
                </p>
              </div>
            </div>

            {/* Right side - mascot and chat preview */}
            <div className="relative">
              <div className="flex justify-center mb-6">
                <BobotMascot size={160} />
              </div>

              {/* Mini chat preview */}
              <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle p-4 max-w-xs mx-auto">
                <div className="space-y-2">
                  <div className="bg-bg-secondary rounded-lg rounded-tl-none p-2.5 max-w-[90%]">
                    <p className="text-sm text-text-primary">Hej! Hur kan jag hjälpa dig?</p>
                  </div>
                  <div className="bg-accent text-text-inverse rounded-lg rounded-tr-none p-2.5 max-w-[80%] ml-auto">
                    <p className="text-sm">När ska hyran betalas?</p>
                  </div>
                  <div className="bg-bg-secondary rounded-lg rounded-tl-none p-2.5 max-w-[90%]">
                    <p className="text-sm text-text-primary">Senast den sista vardagen varje månad.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-text-tertiary">
          <span>&copy; {new Date().getFullYear()} Bobot</span>
          <span>GDPR-kompatibel</span>
          <a href="mailto:hej@bobot.nu" className="hover:text-text-secondary transition-colors">
            hej@bobot.nu
          </a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
