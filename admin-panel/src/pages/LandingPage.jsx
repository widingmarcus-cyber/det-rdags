import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// WALL-E inspired Bobot mascot - boxy body, big binocular eyes that follow cursor
function BobotMascot({ className = "", size = 120, mousePos = { x: 0.5, y: 0.5 } }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 6
  const pupilOffsetY = (mousePos.y - 0.5) * 4

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

      {/* Body */}
      <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
      <rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
      <rect x="36" y="75" width="20" height="16" rx="2" fill="#1C1917" />
      <rect x="64" y="75" width="20" height="16" rx="2" fill="#1C1917" />

      {/* Neck */}
      <rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />

      {/* Head */}
      <rect x="35" y="20" width="50" height="28" rx="4" fill="#D97757" />

      {/* Eyes */}
      <ellipse cx="48" cy="34" rx="12" ry="11" fill="#1C1917" />
      <ellipse cx="72" cy="34" rx="12" ry="11" fill="#1C1917" />
      <ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
      <ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />

      {/* Pupils - follow cursor */}
      <ellipse cx={48 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" ry="5" fill="#D97757" />
      <ellipse cx={72 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" ry="5" fill="#D97757" />
      <circle cx={50 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE" />
      <circle cx={74 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE" />

      {/* Eye bridge */}
      <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />

      {/* Arms with wave animation */}
      <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C">
        <animateTransform attributeName="transform" type="rotate" values="0 24 65;-5 24 65;0 24 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C">
        <animateTransform attributeName="transform" type="rotate" values="0 96 65;5 96 65;0 96 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E">
        <animateTransform attributeName="transform" type="rotate" values="0 14 65;-5 14 65;0 14 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E">
        <animateTransform attributeName="transform" type="rotate" values="0 106 65;5 106 65;0 106 65" dur="3s" repeatCount="indefinite" />
      </rect>

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
    <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={`inline-block ${className}`}>
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

// Dark/Light mode toggle
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
      aria-label={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const [activeConvo, setActiveConvo] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
        setMousePos({ x, y })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Auto-switch conversations
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConvo(prev => (prev + 1) % 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const conversations = [
    {
      messages: [
        { from: 'user', text: 'Får jag ha husdjur i lägenheten?' },
        { from: 'bot', text: 'Enligt våra regler är små husdjur som katt eller hund tillåtna, så länge de inte stör grannar. Kontakta fastighetskontoret för att registrera ditt husdjur.' },
        { from: 'user', text: 'Perfekt, tack!' },
      ]
    },
    {
      messages: [
        { from: 'user', text: 'När töms soporna?' },
        { from: 'bot', text: 'Hushållssopor hämtas varje tisdag och fredag. Återvinning och grovsopor kan lämnas i miljörummet när som helst.' },
        { from: 'user', text: 'Var ligger miljörummet?' },
        { from: 'bot', text: 'Miljörummet finns i källaren, ingång via gården. Kod: samma som till tvättstugan.' },
      ]
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-primary flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-text-primary tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button onClick={() => navigate('/login')} className="btn btn-primary text-sm px-5 py-2">
              Logga in
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center px-6 py-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left side - text */}
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-text-primary tracking-tight leading-tight mb-4">
                Automatisera hyresgästernas frågor
              </h1>

              <p className="text-lg text-text-secondary mb-5 leading-relaxed">
                Låt Bobot hantera rutinfrågor så ditt team kan fokusera på det som verkligen kräver mänsklig kontakt.
              </p>

              {/* Detailed selling points */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <div className="text-xl flex-shrink-0">⚡</div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Avlasta kundtjänst</div>
                    <div className="text-xs text-text-tertiary">Bobot hanterar upp till 80% av vanliga frågor automatiskt. Ditt team slipper svara på samma saker om och om igen.</div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <div className="text-xl flex-shrink-0">🕐</div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Alltid tillgänglig</div>
                    <div className="text-xs text-text-tertiary">Svarar omedelbart, dygnet runt – även helger och röda dagar. Hyresgäster får hjälp när de behöver det.</div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <div className="text-xl flex-shrink-0">📈</div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Förstå dina hyresgäster</div>
                    <div className="text-xs text-text-tertiary">Se exakt vad folk frågar om. Upptäck problem innan de eskalerar och förbättra din kommunikation.</div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <div className="text-xl flex-shrink-0">🔒</div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">GDPR-säker & lokal</div>
                    <div className="text-xs text-text-tertiary">All data stannar hos dig. Ingen extern molntjänst. Konversationer raderas automatiskt enligt dina inställningar.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => navigate('/login')} className="btn btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
                  Kom igång
                </button>
                <p className="text-sm text-text-tertiary">
                  Frågor? Mejla <a href="mailto:hej@bobot.nu" className="text-accent hover:underline">hej@bobot.nu</a>
                </p>
              </div>
            </div>

            {/* Right side - mascot and chat preview */}
            <div className="relative">
              <div className="flex justify-center mb-4">
                <BobotMascot size={140} mousePos={mousePos} />
              </div>

              {/* Chat preview with switching conversations */}
              <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle p-4 max-w-sm mx-auto">
                {/* Conversation tabs */}
                <div className="flex gap-2 mb-3">
                  {[0, 1].map(i => (
                    <button
                      key={i}
                      onClick={() => setActiveConvo(i)}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${activeConvo === i ? 'bg-accent' : 'bg-border-subtle'}`}
                    />
                  ))}
                </div>

                <div className="space-y-2.5 min-h-[160px]">
                  {conversations[activeConvo].messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-2.5 ${
                        msg.from === 'user'
                          ? 'bg-accent text-text-inverse rounded-tr-none max-w-[80%] ml-auto'
                          : 'bg-bg-secondary rounded-tl-none max-w-[90%]'
                      }`}
                    >
                      <p className={`text-sm ${msg.from === 'bot' ? 'text-text-primary' : ''}`}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex justify-center gap-6 mt-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-text-primary">24/7</div>
                  <div className="text-xs text-text-tertiary">Tillgänglig</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-text-primary">&lt;2s</div>
                  <div className="text-xs text-text-tertiary">Svarstid</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-text-primary">80%</div>
                  <div className="text-xs text-text-tertiary">Färre samtal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-text-tertiary">
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
