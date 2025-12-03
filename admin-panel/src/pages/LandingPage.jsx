import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Full-size Bobot mascot with eyes that follow cursor
function BobotMascot({ className = "", size = 160, mousePos = { x: 0.5, y: 0.5 } }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 8
  const pupilOffsetY = (mousePos.y - 0.5) * 6

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Bobot mascot">
      {/* Feet/treads */}
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

      {/* Eye sockets */}
      <ellipse cx="48" cy="34" rx="12" ry="11" fill="#1C1917" />
      <ellipse cx="72" cy="34" rx="12" ry="11" fill="#1C1917" />

      {/* Inner eye area */}
      <ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
      <ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />

      {/* Pupils - follow cursor with blink */}
      <ellipse cx={48 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" fill="#D97757">
        <animate attributeName="ry" values="5;0.5;5;5;5" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </ellipse>
      <ellipse cx={72 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" fill="#D97757">
        <animate attributeName="ry" values="5;0.5;5;5;5" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </ellipse>

      {/* Eye highlights */}
      <circle cx={50 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2.5" fill="#FEF2EE">
        <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </circle>
      <circle cx={74 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2.5" fill="#FEF2EE">
        <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </circle>

      {/* Nose piece */}
      <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />

      {/* Arms with gentle wave */}
      <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C">
        <animateTransform attributeName="transform" type="rotate" values="0 24 65;-8 24 65;0 24 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C">
        <animateTransform attributeName="transform" type="rotate" values="0 96 65;8 96 65;0 96 65" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Hands */}
      <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E">
        <animateTransform attributeName="transform" type="rotate" values="0 14 65;-8 14 65;0 14 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E">
        <animateTransform attributeName="transform" type="rotate" values="0 106 65;8 106 65;0 106 65" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Antenna */}
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="5" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// Easter egg: Just eyes peeking from ceiling on login hover
function PeekingEyes({ mousePos = { x: 0.5, y: 0.5 }, isVisible = false }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 4
  const pupilOffsetY = Math.max(0, (mousePos.y - 0.5) * 3)

  return (
    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <svg width="60" height="35" viewBox="0 0 60 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ceiling edge */}
        <rect x="0" y="0" width="60" height="8" fill="#78716C" />

        {/* Head peeking */}
        <rect x="5" y="6" width="50" height="20" rx="3" fill="#D97757" />

        {/* Eye sockets */}
        <ellipse cx="20" cy="18" rx="8" ry="7" fill="#1C1917" />
        <ellipse cx="40" cy="18" rx="8" ry="7" fill="#1C1917" />

        {/* Inner eyes */}
        <ellipse cx="20" cy="18" rx="6" ry="5" fill="#292524" />
        <ellipse cx="40" cy="18" rx="6" ry="5" fill="#292524" />

        {/* Pupils with blink */}
        <ellipse cx={20 + pupilOffsetX} cy={18 + pupilOffsetY} rx="3" fill="#D97757">
          <animate attributeName="ry" values="3;0.3;3;3;3" dur="2s" repeatCount="indefinite" keyTimes="0;0.1;0.2;0.9;1" />
        </ellipse>
        <ellipse cx={40 + pupilOffsetX} cy={18 + pupilOffsetY} rx="3" fill="#D97757">
          <animate attributeName="ry" values="3;0.3;3;3;3" dur="2s" repeatCount="indefinite" keyTimes="0;0.1;0.2;0.9;1" />
        </ellipse>

        {/* Eye highlights */}
        <circle cx={21 + pupilOffsetX * 0.5} cy={16 + pupilOffsetY * 0.5} r="1.5" fill="#FEF2EE">
          <animate attributeName="opacity" values="1;0;1;1;1" dur="2s" repeatCount="indefinite" keyTimes="0;0.1;0.2;0.9;1" />
        </circle>
        <circle cx={41 + pupilOffsetX * 0.5} cy={16 + pupilOffsetY * 0.5} r="1.5" fill="#FEF2EE">
          <animate attributeName="opacity" values="1;0;1;1;1" dur="2s" repeatCount="indefinite" keyTimes="0;0.1;0.2;0.9;1" />
        </circle>
      </svg>
    </div>
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

// Sparkle component for Disney magic
function Sparkle({ delay = 0, size = 4, className = "" }) {
  return (
    <div className={`absolute ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <svg width={size * 4} height={size * 4} viewBox="0 0 24 24" fill="none" className="animate-sparkle">
        <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#D97757" fillOpacity="0.6" />
      </svg>
    </div>
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

// Chat widget - no overlap
function ChatWidget({ messages, label, className = "" }) {
  return (
    <div className={`w-64 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden ${className}`}>
      <div className="bg-[#D97757] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <BobotMini className="scale-50" />
          </div>
          <div>
            <span className="text-white text-xs font-medium block">Bobot</span>
          </div>
        </div>
        {label && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">{label}</span>}
      </div>
      <div className="p-2.5 space-y-2 bg-stone-50 dark:bg-stone-900">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
              msg.from === 'user'
                ? 'bg-[#D97757] text-white'
                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [loginHover, setLoginHover] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const containerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

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

  const convo1 = [
    { from: 'user', text: 'Får jag ha hund?' },
    { from: 'bot', text: 'Ja, husdjur är tillåtna så länge de inte stör.' },
  ]

  const convo2 = [
    { from: 'user', text: 'När töms soporna?' },
    { from: 'bot', text: 'Tisdag och fredag varje vecka.' },
  ]

  const convo3 = [
    { from: 'user', text: 'Vad är policyn för semester?' },
    { from: 'bot', text: 'Minst 25 dagar/år. Ansök via HR-portalen.' },
  ]

  const sellingPoints = [
    'Avlastar kundtjänst',
    'Alltid tillgänglig',
    'Intern kunskapsbank',
    'GDPR-säker',
    'Träna nyanställda',
    'Spar tid',
  ]

  return (
    <div ref={containerRef} className="h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex flex-col overflow-hidden relative">

      {/* Disney sparkles */}
      <Sparkle delay={0} size={3} className="top-20 left-[10%]" />
      <Sparkle delay={500} size={4} className="top-32 right-[15%]" />
      <Sparkle delay={1000} size={2} className="top-48 left-[25%]" />
      <Sparkle delay={1500} size={3} className="bottom-32 right-[20%]" />
      <Sparkle delay={800} size={3} className="top-40 right-[40%]" />

      {/* Navigation */}
      <nav className="px-6 py-3 shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <div
              className="relative"
              onMouseEnter={() => setLoginHover(true)}
              onMouseLeave={() => setLoginHover(false)}
            >
              {/* Easter egg: Eyes peeking from ceiling */}
              <PeekingEyes mousePos={mousePos} isVisible={loginHover} />
              <button onClick={() => navigate('/login')} className="bg-[#D97757] hover:bg-[#c4613d] text-white text-sm px-5 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg">
                Logga in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 px-6 flex items-center relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Headline + CTA */}
            <div className={`relative transition-all duration-1000 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

              {/* Full-size mascot - positioned to the left of content */}
              <div className="absolute -left-8 lg:-left-44 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#D97757]/20 rounded-full blur-3xl scale-150" />
                  <BobotMascot size={160} mousePos={mousePos} className="relative z-10 animate-float" />
                </div>
              </div>

              <div className="lg:pl-4">
                <h1 className="text-3xl lg:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-4">
                  Din nya medarbetare, som alltid är där
                </h1>
                <p className="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
                  Bobot svarar på frågor från kunder och anställda. Direkt, dygnet runt.
                </p>

                {/* All selling points in one compact section */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
                  {sellingPoints.map(point => (
                    <span key={point} className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {point}
                    </span>
                  ))}
                </div>

                {/* CTA Section - simplified */}
                <div className="p-6 bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 rounded-2xl border border-[#D97757]/20">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Vill du veta mer?
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                    Boka en gratis demo och se hur Bobot kan hjälpa er organisation.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#c4613d] text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-xl shadow-lg shadow-[#D97757]/25"
                  >
                    Kom igång
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Demo widgets - NO OVERLAP, stacked vertically with gaps */}
            <div className={`flex flex-col gap-4 transition-all duration-1000 delay-300 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <ChatWidget
                messages={convo1}
                label="Kund"
                className="self-start hover:scale-105 transition-transform"
              />
              <ChatWidget
                messages={convo2}
                label="Kund"
                className="self-end hover:scale-105 transition-transform"
              />
              <ChatWidget
                messages={convo3}
                label="Anställd"
                className="self-start hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer with email */}
      <footer className="px-6 py-4 shrink-0 relative z-10 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-stone-400">&copy; {new Date().getFullYear()} Bobot &middot; GDPR-kompatibel</span>
          <a
            href="mailto:hej@bobot.nu"
            className="flex items-center gap-2 text-[#D97757] hover:text-[#c4613d] font-medium transition-colors group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">hej@bobot.nu</span>
          </a>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
