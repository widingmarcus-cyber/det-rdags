import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Full-size Bobot mascot with eyes that follow cursor
function BobotMascot({ className = "", size = 160, mousePos = { x: 0.5, y: 0.5 }, isWaving = false }) {
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

      {/* Left arm - idle animation only */}
      <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C">
        <animateTransform attributeName="transform" type="rotate" values="0 24 65;-8 24 65;0 24 65" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Right arm - waves when isWaving (goes above shoulder) */}
      <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C">
        {isWaving ? (
          <animateTransform attributeName="transform" type="rotate" values="0 87 65;-50 87 65;0 87 65" dur="1.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        ) : (
          <animateTransform attributeName="transform" type="rotate" values="0 96 65;8 96 65;0 96 65" dur="3s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Left hand - idle animation only */}
      <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E">
        <animateTransform attributeName="transform" type="rotate" values="0 14 65;-8 14 65;0 14 65" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Right hand - waves with arm when isWaving (same pivot point as arm) */}
      <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E">
        {isWaving ? (
          <animateTransform attributeName="transform" type="rotate" values="0 87 65;-50 87 65;0 87 65" dur="1.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        ) : (
          <animateTransform attributeName="transform" type="rotate" values="0 106 65;8 106 65;0 106 65" dur="3s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Antenna */}
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="5" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// Easter egg: Upside down mascot hanging from ceiling (torso connects to top)
function HangingMascot({ mousePos = { x: 0.5, y: 0.5 }, isVisible = false }) {
  const [hasFinishedBlinking, setHasFinishedBlinking] = useState(false)
  const [blinkKey, setBlinkKey] = useState(0)

  // Reset blinking state when visibility changes
  useEffect(() => {
    if (isVisible) {
      setHasFinishedBlinking(false)
      setBlinkKey(prev => prev + 1)
      const timer = setTimeout(() => {
        setHasFinishedBlinking(true)
      }, 1500) // 3 blinks at 0.5s each
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // Invert Y for upside down tracking
  const pupilOffsetX = hasFinishedBlinking ? (mousePos.x - 0.5) * 6 : 0
  const pupilOffsetY = hasFinishedBlinking ? -(mousePos.y - 0.5) * 5 : 0

  return (
    <div className={`transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <svg key={blinkKey} width="112" height="140" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body/Torso - connects directly to top (y=0) */}
        <rect x="10" y="0" width="40" height="28" rx="0" fill="#D97757" />
        <rect x="12" y="2" width="36" height="24" rx="2" fill="#C4613D" />

        {/* Body details */}
        <rect x="15" y="4" width="12" height="10" rx="1" fill="#1C1917" />
        <rect x="33" y="4" width="12" height="10" rx="1" fill="#1C1917" />

        {/* Neck */}
        <rect x="23" y="26" width="14" height="8" rx="2" fill="#78716C" />

        {/* Head (upside down - eyes at bottom) */}
        <rect x="8" y="32" width="44" height="22" rx="3" fill="#D97757" />

        {/* Eye sockets */}
        <ellipse cx="20" cy="44" rx="9" ry="8" fill="#1C1917" />
        <ellipse cx="40" cy="44" rx="9" ry="8" fill="#1C1917" />

        {/* Inner eye area */}
        <ellipse cx="20" cy="44" rx="7" ry="6" fill="#292524" />
        <ellipse cx="40" cy="44" rx="7" ry="6" fill="#292524" />

        {/* Pupils - blink 3 times first, then track cursor */}
        <ellipse cx={20 + pupilOffsetX} cy={44 + pupilOffsetY} rx="4" fill="#D97757">
          {!hasFinishedBlinking && (
            <animate attributeName="ry" values="4;0.2;4;0.2;4;0.2;4" dur="1.5s" fill="freeze" />
          )}
          {hasFinishedBlinking && <set attributeName="ry" to="4" />}
        </ellipse>
        <ellipse cx={40 + pupilOffsetX} cy={44 + pupilOffsetY} rx="4" fill="#D97757">
          {!hasFinishedBlinking && (
            <animate attributeName="ry" values="4;0.2;4;0.2;4;0.2;4" dur="1.5s" fill="freeze" />
          )}
          {hasFinishedBlinking && <set attributeName="ry" to="4" />}
        </ellipse>

        {/* Eye highlights */}
        <circle cx={21 + pupilOffsetX * 0.5} cy={42 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE">
          {!hasFinishedBlinking && (
            <animate attributeName="opacity" values="1;0;1;0;1;0;1" dur="1.5s" fill="freeze" />
          )}
        </circle>
        <circle cx={41 + pupilOffsetX * 0.5} cy={42 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE">
          {!hasFinishedBlinking && (
            <animate attributeName="opacity" values="1;0;1;0;1;0;1" dur="1.5s" fill="freeze" />
          )}
        </circle>

        {/* Nose piece */}
        <rect x="26" y="40" width="8" height="6" rx="1" fill="#78716C" />

        {/* Antenna pointing DOWN (at bottom since upside down) */}
        <rect x="28" y="54" width="4" height="10" rx="2" fill="#78716C" />
        <circle cx="30" cy="68" r="5" fill="#4A9D7C">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
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

// Sparkle component - visible in both light and dark mode
function Sparkle({ delay = 0, size = 4, className = "" }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <svg width={size * 4} height={size * 4} viewBox="0 0 24 24" fill="none" className="animate-sparkle">
        <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" className="fill-[#D97757]/60" />
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

// Typing text component
function TypedText({ text, delay = 0, speed = 30, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true)
      setIsTyping(true)
    }, delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
      onComplete?.()
    }
  }, [displayedText, text, speed, hasStarted, onComplete])

  if (!hasStarted) return null

  return (
    <span>
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  )
}

// Full-sized chat widget with typing animation
function ChatWidget({ messages, label, className = "", startDelay = 0 }) {
  const [visibleMessages, setVisibleMessages] = useState([])
  const [currentTyping, setCurrentTyping] = useState(0)

  useEffect(() => {
    if (currentTyping < messages.length) {
      setVisibleMessages(prev => [...prev, currentTyping])
    }
  }, [currentTyping, messages.length])

  const handleMessageComplete = () => {
    setTimeout(() => {
      setCurrentTyping(prev => prev + 1)
    }, 300)
  }

  return (
    <div className={`w-full max-w-96 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden ${className}`}>
      <div className="bg-[#D97757] px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
            <BobotMini className="scale-75 sm:scale-90" />
          </div>
          <div>
            <span className="text-white font-medium block text-sm sm:text-base">Bobot</span>
            <span className="text-white/70 text-xs sm:text-sm">Online</span>
          </div>
        </div>
        {label && <span className="bg-white/20 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">{label}</span>}
      </div>
      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 bg-stone-50 dark:bg-stone-900 min-h-[100px] sm:min-h-[120px]">
        {messages.map((msg, i) => (
          visibleMessages.includes(i) && (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base ${
                msg.from === 'user'
                  ? 'bg-[#D97757] text-white'
                  : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
              }`}>
                <TypedText
                  text={msg.text}
                  delay={i === 0 ? startDelay : 0}
                  speed={msg.from === 'bot' ? 20 : 40}
                  onComplete={i === currentTyping ? handleMessageComplete : undefined}
                />
              </div>
            </div>
          )
        ))}
      </div>
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="flex items-center gap-2 sm:gap-3 text-stone-400">
          <span className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base">Skriv ett meddelande...</span>
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// How it works step component
function HowItWorksStep({ number, title, description, icon }) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-16 h-16 bg-[#D97757]/10 dark:bg-[#D97757]/20 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="w-8 h-8 bg-[#D97757] text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{description}</p>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [loginHover, setLoginHover] = useState(false)
  const [ctaHover, setCtaHover] = useState(false)
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
    { from: 'user', text: 'Får jag ha hund i lägenheten?' },
    { from: 'bot', text: 'Ja, husdjur är tillåtna i våra fastigheter så länge de inte stör grannar eller skadar lägenheten.' },
  ]

  const convo2 = [
    { from: 'user', text: 'Vad är policyn för semester?' },
    { from: 'bot', text: 'Du har rätt till minst 25 semesterdagar per år. Ansök via HR-portalen senast 4 veckor innan.' },
  ]

  const sellingPoints = [
    'Avlastar medarbetare',
    'Alltid tillgänglig',
    'Intern kunskapsbank',
    'GDPR-säker',
    'Träna nyanställda',
    'Enkel att integrera',
    'Flerspråkigt stöd',
    'Självlärande AI',
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex flex-col relative overflow-x-hidden">

      {/* Sparkles - visible in both light and dark mode */}
      <Sparkle delay={0} size={3} className="top-20 left-[10%]" />
      <Sparkle delay={500} size={4} className="top-32 right-[15%]" />
      <Sparkle delay={1000} size={2} className="top-48 left-[25%]" />
      <Sparkle delay={1500} size={3} className="bottom-32 right-[20%]" />
      <Sparkle delay={800} size={3} className="top-40 right-[40%]" />
      <Sparkle delay={1200} size={2} className="bottom-48 left-[15%]" />
      <Sparkle delay={300} size={3} className="top-60 left-[45%]" />

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
              className="flex items-center gap-3"
              onMouseEnter={() => setLoginHover(true)}
              onMouseLeave={() => setLoginHover(false)}
            >
              <button onClick={() => navigate('/login')} className="bg-[#D97757] hover:bg-[#c4613d] text-white text-sm px-5 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg">
                Logga in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Easter egg: Upside down mascot hanging from ceiling - fixed at top right */}
      <div className="fixed top-0 right-6 z-50">
        <HangingMascot mousePos={mousePos} isVisible={loginHover} />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-8 lg:py-0 lg:flex lg:items-center relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left: Headline + CTA */}
            <div className={`relative transition-all duration-1000 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

              {/* Full-size mascot - positioned to the left of content */}
              <div className="absolute -left-8 lg:-left-44 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#D97757]/20 rounded-full blur-3xl scale-150" />
                  <BobotMascot size={160} mousePos={mousePos} isWaving={ctaHover} className="relative z-10 animate-float" />
                </div>
              </div>

              {/* Mobile mascot */}
              <div className="flex justify-center mb-6 lg:hidden">
                <BobotMascot size={120} mousePos={mousePos} isWaving={ctaHover} className="animate-float" />
              </div>

              <div className="lg:pl-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-3 sm:mb-4 text-center lg:text-left">
                  Din nya medarbetare, som alltid är där
                </h1>
                <p className="text-stone-600 dark:text-stone-400 mb-4 sm:mb-6 leading-relaxed text-center lg:text-left text-sm sm:text-base">
                  Bobot svarar på frågor från kunder och anställda. Direkt, dygnet runt.
                </p>

                {/* All selling points in one compact section */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6 sm:mb-8">
                  {sellingPoints.map(point => (
                    <span key={point} className="flex items-center gap-1 sm:gap-1.5">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {point}
                    </span>
                  ))}
                </div>

                {/* CTA Section */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 rounded-2xl border border-[#D97757]/20">
                  <h3 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2 text-center lg:text-left">
                    Vill du veta mer?
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-3 sm:mb-4 text-center lg:text-left">
                    Boka en gratis demo och se hur Bobot kan hjälpa er organisation.
                  </p>
                  <div className="flex justify-center lg:justify-start">
                    <a
                      href="mailto:hej@bobot.nu"
                      className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#c4613d] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-xl shadow-lg shadow-[#D97757]/25 text-sm sm:text-base"
                      onMouseEnter={() => setCtaHover(true)}
                      onMouseLeave={() => setCtaHover(false)}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Kontakta oss
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 2 full-size demo widgets */}
            <div className={`flex flex-col gap-4 sm:gap-6 pt-4 transition-all duration-1000 delay-300 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <ChatWidget
                messages={convo1}
                label="Kund"
                startDelay={800}
                className="self-center lg:self-start hover:scale-[1.02] transition-transform"
              />
              <ChatWidget
                messages={convo2}
                label="Anställd"
                startDelay={4000}
                className="self-center lg:self-end hover:scale-[1.02] transition-transform"
              />
            </div>
          </div>
        </div>
      </main>

      {/* How it works section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white/50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 text-center mb-8 sm:mb-12">
            Så fungerar det
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <HowItWorksStep
              number={1}
              title="Bygg din kunskapsbank"
              description="Lägg till frågor och svar som Bobot ska kunna besvara. Importera enkelt från Excel eller skriv direkt."
              icon={
                <svg className="w-8 h-8 text-[#D97757]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />
            <HowItWorksStep
              number={2}
              title="Integrera på din sida"
              description="Kopiera en enkel kodrad och klistra in på din hemsida. Klart på under 5 minuter."
              icon={
                <svg className="w-8 h-8 text-[#D97757]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              }
            />
            <HowItWorksStep
              number={3}
              title="Bobot svarar åt dig"
              description="Dina kunder och anställda får svar direkt, dygnet runt. Du följer upp via dashboarden."
              icon={
                <svg className="w-8 h-8 text-[#D97757]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

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
