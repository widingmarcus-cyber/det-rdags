import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// WALL-E inspired Bobot mascot
function BobotMascot({ className = "", size = 120, mousePos = { x: 0.5, y: 0.5 } }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 6
  const pupilOffsetY = (mousePos.y - 0.5) * 4

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Bobot mascot">
      <rect x="25" y="95" width="30" height="12" rx="6" fill="#78716C" />
      <rect x="65" y="95" width="30" height="12" rx="6" fill="#78716C" />
      <rect x="28" y="97" width="24" height="8" rx="4" fill="#57534E" />
      <rect x="68" y="97" width="24" height="8" rx="4" fill="#57534E" />
      <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
      <rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
      <rect x="36" y="75" width="20" height="16" rx="2" fill="#1C1917" />
      <rect x="64" y="75" width="20" height="16" rx="2" fill="#1C1917" />
      <rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />
      <rect x="35" y="20" width="50" height="28" rx="4" fill="#D97757" />
      <ellipse cx="48" cy="34" rx="12" ry="11" fill="#1C1917" />
      <ellipse cx="72" cy="34" rx="12" ry="11" fill="#1C1917" />
      <ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
      <ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />
      <ellipse cx={48 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" ry="5" fill="#D97757" />
      <ellipse cx={72 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" ry="5" fill="#D97757" />
      <circle cx={50 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE" />
      <circle cx={74 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE" />
      <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />
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
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="4" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

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

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" aria-label={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}>
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

// Mini chat bubble component
function MiniChat({ messages, className = "" }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl shadow-md border border-stone-200 dark:border-stone-700 p-3 ${className}`}>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-2.5 py-1.5 text-xs ${
              msg.from === 'user'
                ? 'bg-[#D97757] text-white rounded-tr-none max-w-[85%] ml-auto'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-tl-none max-w-[90%]'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
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
    [
      { from: 'user', text: 'Får jag ha husdjur?' },
      { from: 'bot', text: 'Ja, små husdjur är tillåtna så länge de inte stör grannar.' },
    ],
    [
      { from: 'user', text: 'När töms soporna?' },
      { from: 'bot', text: 'Tisdag och fredag. Grovsopor lämnas i miljörummet.' },
    ],
    [
      { from: 'user', text: 'Hur bokar jag tvättstuga?' },
      { from: 'bot', text: 'Via appen eller tavlan i tvättstugan. Max 2 pass/vecka.' },
    ],
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button onClick={() => navigate('/login')} className="bg-[#D97757] hover:bg-[#c4613d] text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
              Logga in
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center px-6 py-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left side - text */}
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-4">
                Din kundtjänst, <br />fast snabbare
              </h1>

              <p className="text-lg text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
                Bobot svarar på hyresgästernas vanligaste frågor – direkt, dygnet runt.
              </p>

              {/* Selling points - better light mode styling */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Avlasta kundtjänst</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Färre repetitiva frågor. Mer tid för det viktiga.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
                  <span className="text-lg">🕐</span>
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Alltid tillgänglig</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Svarar direkt – kvällar, helger, röda dagar.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
                  <span className="text-lg">📊</span>
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Se vad folk frågar om</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Upptäck mönster och förbättra kommunikationen.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
                  <span className="text-lg">🔒</span>
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">GDPR-säker & lokal</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">All data stannar hos dig. Ingen molntjänst.</div>
                  </div>
                </div>
              </div>

              {/* Email CTA - more prominent */}
              <div className="bg-[#D97757]/10 dark:bg-[#D97757]/20 border border-[#D97757]/30 rounded-xl p-4 text-center">
                <p className="text-stone-700 dark:text-stone-300 mb-1">Vill du veta mer?</p>
                <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:text-[#c4613d] font-semibold text-lg transition-colors">
                  hej@bobot.nu
                </a>
              </div>
            </div>

            {/* Right side - mascot and multiple chat previews */}
            <div className="relative">
              <div className="flex justify-center mb-6">
                <BobotMascot size={130} mousePos={mousePos} />
              </div>

              {/* Multiple mini conversations displayed at once */}
              <div className="space-y-3">
                {conversations.map((msgs, i) => (
                  <MiniChat key={i} messages={msgs} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-stone-200 dark:border-stone-700">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-stone-500">
          <span>&copy; {new Date().getFullYear()} Bobot</span>
          <span>GDPR-kompatibel</span>
          <a href="mailto:hej@bobot.nu" className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
            hej@bobot.nu
          </a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
