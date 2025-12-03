import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Big Bobot mascot with blinking eyes that follow cursor - drops from ceiling
function BigBobotMascot({ className = "", mousePos = { x: 0.5, y: 0.5 }, isVisible = true }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 8
  const pupilOffsetY = (mousePos.y - 0.5) * 6

  return (
    <div className={`transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} ${className}`}>
      <svg width="180" height="180" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bobot mascot">
        {/* Rope/string from ceiling */}
        <rect x="58" y="-40" width="4" height="52" fill="#78716C" />

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

        {/* Arms with wave animation */}
        <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C">
          <animateTransform attributeName="transform" type="rotate" values="0 24 65;-15 24 65;0 24 65;10 24 65;0 24 65" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C">
          <animateTransform attributeName="transform" type="rotate" values="0 96 65;15 96 65;0 96 65;-10 96 65;0 96 65" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Hands */}
        <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E">
          <animateTransform attributeName="transform" type="rotate" values="0 14 65;-15 14 65;0 14 65;10 14 65;0 14 65" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E">
          <animateTransform attributeName="transform" type="rotate" values="0 106 65;15 106 65;0 106 65;-10 106 65;0 106 65" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Antenna */}
        <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
        <circle cx="60" cy="10" r="5" fill="#4A9D7C">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="5;6;5" dur="1.5s" repeatCount="indefinite" />
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
    <div
      className={`absolute ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <svg width={size * 4} height={size * 4} viewBox="0 0 24 24" fill="none" className="animate-sparkle">
        <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#D97757" fillOpacity="0.6" />
      </svg>
    </div>
  )
}

// Floating particle
function FloatingParticle({ delay = 0, duration = 3, className = "" }) {
  return (
    <div
      className={`absolute w-2 h-2 bg-[#D97757]/30 rounded-full animate-float-up ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    />
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

// Full-sized chat widget
function ChatWidget({ messages, label, className = "" }) {
  return (
    <div className={`w-72 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden ${className}`}>
      <div className="bg-[#D97757] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <BobotMini className="scale-75" />
          </div>
          <div>
            <span className="text-white text-sm font-medium block">Bobot</span>
            <span className="text-white/70 text-xs">Online</span>
          </div>
        </div>
        {label && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{label}</span>}
      </div>
      <div className="p-3 space-y-2.5 bg-stone-50 dark:bg-stone-900 min-h-[100px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              msg.from === 'user'
                ? 'bg-[#D97757] text-white'
                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="flex items-center gap-2 text-stone-400 text-xs">
          <span className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full px-3 py-1.5">Skriv ett meddelande...</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [mascotVisible, setMascotVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const containerRef = useRef(null)

  // Disney-style entrance animation sequence
  useEffect(() => {
    const mascotTimer = setTimeout(() => setMascotVisible(true), 300)
    const contentTimer = setTimeout(() => setContentVisible(true), 800)
    return () => {
      clearTimeout(mascotTimer)
      clearTimeout(contentTimer)
    }
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
    'Gratis demo och uppsättning',
    'Anpassad träning på era dokument',
    'Snabb integration – igång på en dag',
    'Perfekt för att träna nyanställda',
    'Spar tid – fokusera på det som räknas',
  ]

  return (
    <div ref={containerRef} className="h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex flex-col overflow-hidden relative">

      {/* Disney sparkles */}
      <Sparkle delay={0} size={3} className="top-20 left-[10%]" />
      <Sparkle delay={500} size={4} className="top-32 right-[15%]" />
      <Sparkle delay={1000} size={2} className="top-48 left-[25%]" />
      <Sparkle delay={1500} size={3} className="bottom-32 right-[20%]" />
      <Sparkle delay={2000} size={2} className="bottom-48 left-[30%]" />
      <Sparkle delay={800} size={3} className="top-40 right-[40%]" />

      {/* Floating particles */}
      <FloatingParticle delay={0} duration={4} className="bottom-0 left-[15%]" />
      <FloatingParticle delay={1} duration={5} className="bottom-0 left-[35%]" />
      <FloatingParticle delay={2} duration={4.5} className="bottom-0 right-[25%]" />
      <FloatingParticle delay={0.5} duration={3.5} className="bottom-0 right-[45%]" />

      {/* Navigation */}
      <nav className="px-6 py-3 shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Email prominently in nav */}
            <a
              href="mailto:hej@bobot.nu"
              className="hidden sm:flex items-center gap-2 text-[#D97757] hover:text-[#c4613d] font-medium transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">hej@bobot.nu</span>
            </a>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button onClick={() => navigate('/login')} className="bg-[#D97757] hover:bg-[#c4613d] text-white text-sm px-5 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg">
              Logga in
            </button>
          </div>
        </div>
      </nav>

      {/* Main content - full height, no scroll */}
      <main className="flex-1 px-6 flex items-center relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-5 gap-8 items-center">

            {/* Left: Headline + CTA (2 cols) */}
            <div className={`lg:col-span-2 relative transition-all duration-1000 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="pt-4 lg:pt-0">
                <h1 className="text-3xl lg:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-4">
                  Din nya medarbetare, som alltid är där
                </h1>
                <p className="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
                  Bobot svarar på frågor från kunder och anställda. Direkt, dygnet runt.
                </p>

                {/* Selling points - compact */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400 mb-6">
                  {['Avlastar kundtjänst', 'Alltid tillgänglig', 'Intern kunskapsbank', 'GDPR-säker'].map(point => (
                    <span key={point} className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {point}
                    </span>
                  ))}
                </div>

                {/* CTA Section with more selling points */}
                <div className="mt-6 p-6 bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 rounded-2xl border border-[#D97757]/20 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    Vill du veta mer?
                  </h3>
                  <ul className="space-y-2 mb-4 text-sm text-stone-600 dark:text-stone-400">
                    {sellingPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#D97757] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:hej@bobot.nu"
                    className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#c4613d] text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-xl shadow-lg shadow-[#D97757]/25"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Kontakta oss
                  </a>
                  <p className="mt-3 text-sm text-[#D97757] font-medium">
                    hej@bobot.nu
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Creative widget layout with big mascot (3 cols) */}
            <div className="lg:col-span-3 relative h-96 lg:h-[28rem]">

              {/* Big mascot dropping from ceiling */}
              <div className="absolute -top-8 right-8 lg:right-16 z-30">
                <BigBobotMascot mousePos={mousePos} isVisible={mascotVisible} />
              </div>

              {/* Widget 1 - top left */}
              <ChatWidget
                messages={convo1}
                label="Kund"
                className={`absolute top-8 left-0 lg:left-4 z-10 hover:z-30 hover:scale-105 transition-all duration-500 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: '200ms' }}
              />

              {/* Widget 2 - middle, slightly right */}
              <ChatWidget
                messages={convo2}
                label="Kund"
                className={`absolute top-32 right-20 lg:right-24 z-20 hover:z-30 hover:scale-105 transition-all duration-500 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: '400ms' }}
              />

              {/* Widget 3 - bottom left, internal */}
              <ChatWidget
                messages={convo3}
                label="Anställd"
                className={`absolute bottom-0 left-8 lg:left-12 z-10 hover:z-30 hover:scale-105 transition-all duration-500 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: '600ms' }}
              />

              {/* More decorative magical elements */}
              <div className="absolute top-32 left-1/2 w-3 h-3 bg-[#D97757]/40 rounded-full animate-pulse" />
              <div className="absolute top-48 right-20 w-2 h-2 bg-[#D97757]/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-20 left-16 w-2 h-2 bg-[#D97757]/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-20 left-32 w-1.5 h-1.5 bg-[#4A9D7C]/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute bottom-32 right-32 w-1.5 h-1.5 bg-[#4A9D7C]/40 rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="px-6 py-3 shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-stone-400">
          <span>&copy; {new Date().getFullYear()} Bobot</span>
          <span>GDPR-kompatibel</span>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
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

        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 5s ease-out infinite;
        }

        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .group:hover .group-hover\\:animate-bounce {
          animation: gentle-bounce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
