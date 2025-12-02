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

// Blinking mascot for login button hover
function BlinkingMascot({ className = "" }) {
  return (
    <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body */}
      <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
      <rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
      {/* Head */}
      <rect x="35" y="20" width="50" height="28" rx="4" fill="#D97757" />
      {/* Eye sockets */}
      <ellipse cx="48" cy="34" rx="10" ry="9" fill="#1C1917" />
      <ellipse cx="72" cy="34" rx="10" ry="9" fill="#1C1917" />
      {/* Pupils with blink animation */}
      <ellipse cx="48" cy="35" rx="5" ry="5" fill="#D97757">
        <animate attributeName="ry" values="5;0.5;5" dur="3s" repeatCount="indefinite" keyTimes="0;0.1;0.2" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
      </ellipse>
      <ellipse cx="72" cy="35" rx="5" ry="5" fill="#D97757">
        <animate attributeName="ry" values="5;0.5;5" dur="3s" repeatCount="indefinite" keyTimes="0;0.1;0.2" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
      </ellipse>
      {/* Eye highlights */}
      <circle cx="50" cy="32" r="2" fill="#FEF2EE">
        <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" keyTimes="0;0.1;0.2" />
      </circle>
      <circle cx="74" cy="32" r="2" fill="#FEF2EE">
        <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" keyTimes="0;0.1;0.2" />
      </circle>
      {/* Antenna */}
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="4" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
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
  const [loginHover, setLoginHover] = useState(false)
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

  return (
    <div ref={containerRef} className="h-screen bg-stone-50 dark:bg-stone-900 flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BobotMini />
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <div
              className="relative"
              onMouseEnter={() => setLoginHover(true)}
              onMouseLeave={() => setLoginHover(false)}
            >
              {/* Mascot popup on hover */}
              <div className={`absolute -left-12 top-1/2 -translate-y-1/2 transition-all duration-300 ${loginHover ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                <BlinkingMascot className="drop-shadow-lg" />
              </div>
              <button onClick={() => navigate('/login')} className="bg-[#D97757] hover:bg-[#c4613d] text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
                Logga in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content - full height, no scroll */}
      <main className="flex-1 px-6 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-5 gap-8 items-center">

            {/* Left: Headline + mascot (2 cols) */}
            <div className="lg:col-span-2 relative">
              {/* Mascot floating in corner */}
              <div className="absolute -top-16 -left-4 lg:-left-8 animate-float">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#D97757]/20 rounded-full blur-2xl scale-125" />
                  <BobotMascot size={100} mousePos={mousePos} className="relative z-10" />
                </div>
              </div>

              <div className="pt-20 lg:pt-16">
                <h1 className="text-3xl lg:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-4">
                  Din nya medarbetare, som alltid är där
                </h1>
                <p className="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
                  Bobot svarar på frågor från hyresgäster och anställda. Direkt, dygnet runt.
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

                {/* CTA Section */}
                <div className="mt-8 p-6 bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 rounded-2xl border border-[#D97757]/20">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    Vill du veta mer?
                  </h3>
                  <ul className="space-y-2 mb-4 text-sm text-stone-600 dark:text-stone-400">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#D97757] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Gratis demo och uppsättning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#D97757] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Anpassad träning på era dokument</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#D97757] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Snabb integration – igång på en dag</span>
                    </li>
                  </ul>
                  <a
                    href="mailto:hej@bobot.nu"
                    className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#c4613d] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Kontakta oss
                  </a>
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                    hej@bobot.nu
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Creative widget layout (3 cols) */}
            <div className="lg:col-span-3 relative h-96 lg:h-[28rem]">
              {/* Widget 1 - top left */}
              <ChatWidget
                messages={convo1}
                label="Hyresgäst"
                className="absolute top-0 left-0 lg:left-4 z-10 hover:z-30 hover:scale-105 transition-transform"
              />

              {/* Widget 2 - middle right */}
              <ChatWidget
                messages={convo2}
                label="Hyresgäst"
                className="absolute top-24 right-0 lg:right-0 z-20 hover:z-30 hover:scale-105 transition-transform"
              />

              {/* Widget 3 - bottom center, internal */}
              <ChatWidget
                messages={convo3}
                label="Anställd"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-1/4 lg:translate-x-0 z-10 hover:z-30 hover:scale-105 transition-transform"
              />

              {/* Decorative elements */}
              <div className="absolute top-32 left-1/2 w-2 h-2 bg-[#D97757]/40 rounded-full animate-pulse" />
              <div className="absolute top-48 right-20 w-1.5 h-1.5 bg-[#D97757]/30 rounded-full animate-pulse delay-500" />
              <div className="absolute bottom-20 left-16 w-1 h-1 bg-[#D97757]/20 rounded-full animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="px-6 py-3 shrink-0">
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
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}

export default LandingPage
