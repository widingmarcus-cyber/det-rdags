import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// WALL-E inspired Bobot mascot with floating animation
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

// Sparkle component for Disney magic effect
function Sparkle({ className = "", delay = 0 }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="#D97757">
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="0.5;1;0.5" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
      </path>
    </svg>
  )
}

// Realistic chat widget preview
function ChatWidgetPreview({ messages, className = "" }) {
  return (
    <div className={`w-72 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden ${className}`}>
      {/* Widget header */}
      <div className="bg-[#D97757] px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <BobotMini className="scale-75" />
        </div>
        <div>
          <div className="text-white font-medium text-sm">Bobot</div>
          <div className="text-white/70 text-xs">Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-3 space-y-3 bg-stone-50 dark:bg-stone-900 min-h-[180px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.from === 'user'
                  ? 'bg-[#D97757] text-white rounded-br-md'
                  : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-bl-md shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-3 py-2 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full px-3 py-2 text-xs text-stone-400">
            Skriv ett meddelande...
          </div>
          <div className="w-8 h-8 bg-[#D97757] rounded-full flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
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

  const conversation1 = [
    { from: 'bot', text: 'Hej! Hur kan jag hjälpa dig?' },
    { from: 'user', text: 'Får jag ha husdjur i lägenheten?' },
    { from: 'bot', text: 'Ja, små husdjur som katt eller hund är tillåtna, så länge de inte stör grannarna.' },
  ]

  const conversation2 = [
    { from: 'bot', text: 'Hej! Hur kan jag hjälpa dig?' },
    { from: 'user', text: 'Hur bokar jag tvättstuga?' },
    { from: 'bot', text: 'Du bokar via appen eller på tavlan i tvättstugan. Max 2 pass per vecka.' },
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      {/* Hero section with Disney-style mascot intro */}
      <div className="relative flex flex-col items-center pt-8 pb-4">
        {/* Sparkles around mascot */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkle className="absolute top-12 left-1/4" delay={0} />
          <Sparkle className="absolute top-8 right-1/3" delay={0.5} />
          <Sparkle className="absolute top-20 right-1/4" delay={1} />
          <Sparkle className="absolute top-16 left-1/3" delay={1.5} />
        </div>

        {/* Floating mascot with glow */}
        <div className="relative animate-bounce-slow">
          <div className="absolute inset-0 bg-[#D97757]/20 rounded-full blur-3xl scale-150" />
          <BobotMascot size={140} mousePos={mousePos} className="relative z-10" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight text-center mt-6 mb-3">
          Din nya medarbetare,<br />som alltid är där
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-400 text-center max-w-2xl px-4">
          Bobot svarar på frågor – från hyresgäster eller ditt eget team. Direkt, dygnet runt.
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Two widget previews side by side */}
          <div className="flex justify-center gap-8 flex-wrap mb-12">
            <ChatWidgetPreview messages={conversation1} />
            <ChatWidgetPreview messages={conversation2} />
          </div>

          {/* Selling points */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Avlastar kundtjänst
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Alltid tillgänglig
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Intern kunskapsbank
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Statistik och insikter
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              GDPR-säker
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Lokal AI
            </span>
          </div>

          {/* Email CTA */}
          <p className="text-center text-stone-600 dark:text-stone-400">
            Vill du veta mer? Mejla{' '}
            <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:text-[#c4613d] font-medium transition-colors">
              hej@bobot.nu
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-stone-200 dark:border-stone-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-stone-500">
          <span>&copy; {new Date().getFullYear()} Bobot</span>
          <span>GDPR-kompatibel</span>
          <a href="mailto:hej@bobot.nu" className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
            hej@bobot.nu
          </a>
        </div>
      </footer>

      {/* Custom animation styles */}
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
