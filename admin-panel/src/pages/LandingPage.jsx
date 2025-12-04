import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Page view tracking hook
function usePageTracking() {
  useEffect(() => {
    const startTime = Date.now()
    const SESSION_KEY = 'bobot_session_id'

    // Get or create session ID
    let sessionId = sessionStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
      sessionStorage.setItem(SESSION_KEY, sessionId)
    }

    // Get UTM parameters
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    const utmContent = params.get('utm_content')
    const utmTerm = params.get('utm_term')

    // Track page view
    fetch(`${API_URL}/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_url: window.location.href,
        page_name: 'Bobot Landing Page',
        session_id: sessionId,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm
      })
    }).catch(() => {})

    // Track engagement on page unload
    const trackEngagement = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000)
      const isBounce = timeOnPage < 10

      navigator.sendBeacon(`${API_URL}/track/engagement`, JSON.stringify({
        session_id: sessionId,
        page_url: window.location.href,
        time_on_page_seconds: timeOnPage,
        is_bounce: isBounce
      }))
    }

    window.addEventListener('beforeunload', trackEngagement)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackEngagement()
      }
    })

    return () => {
      window.removeEventListener('beforeunload', trackEngagement)
    }
  }, [])
}

// Full-size Bobot mascot with eyes that follow cursor
function BobotMascot({ className = "", size = 160, mousePos = { x: 0.5, y: 0.5 }, isWaving = false }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 8
  const pupilOffsetY = (mousePos.y - 0.5) * 6

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
      <ellipse cx={48 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" fill="#D97757">
        <animate attributeName="ry" values="5;0.5;5;5;5" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </ellipse>
      <ellipse cx={72 + pupilOffsetX} cy={35 + pupilOffsetY} rx="5" fill="#D97757">
        <animate attributeName="ry" values="5;0.5;5;5;5" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </ellipse>
      <circle cx={50 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2.5" fill="#FEF2EE">
        <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </circle>
      <circle cx={74 + pupilOffsetX * 0.5} cy={32 + pupilOffsetY * 0.5} r="2.5" fill="#FEF2EE">
        <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
      </circle>
      <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />
      <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C">
        <animateTransform attributeName="transform" type="rotate" values="0 24 65;-8 24 65;0 24 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C">
        {isWaving ? (
          <animateTransform attributeName="transform" type="rotate" values="0 87 65;-50 87 65;0 87 65" dur="1.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        ) : (
          <animateTransform attributeName="transform" type="rotate" values="0 96 65;8 96 65;0 96 65" dur="3s" repeatCount="indefinite" />
        )}
      </rect>
      <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E">
        <animateTransform attributeName="transform" type="rotate" values="0 14 65;-8 14 65;0 14 65" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E">
        {isWaving ? (
          <animateTransform attributeName="transform" type="rotate" values="0 87 65;-50 87 65;0 87 65" dur="1.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        ) : (
          <animateTransform attributeName="transform" type="rotate" values="0 106 65;8 106 65;0 106 65" dur="3s" repeatCount="indefinite" />
        )}
      </rect>
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="5" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// Easter egg: Upside down mascot hanging from ceiling
function HangingMascot({ mousePos = { x: 0.5, y: 0.5 }, isVisible = false }) {
  const [hasFinishedBlinking, setHasFinishedBlinking] = useState(false)
  const [blinkKey, setBlinkKey] = useState(0)

  useEffect(() => {
    if (isVisible) {
      setHasFinishedBlinking(false)
      setBlinkKey(prev => prev + 1)
      const timer = setTimeout(() => setHasFinishedBlinking(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const pupilOffsetX = hasFinishedBlinking ? (mousePos.x - 0.5) * 6 : 0
  const pupilOffsetY = hasFinishedBlinking ? -(mousePos.y - 0.5) * 5 : 0

  return (
    <div className={`transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <svg key={blinkKey} width="112" height="140" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="0" width="40" height="28" rx="0" fill="#D97757" />
        <rect x="12" y="2" width="36" height="24" rx="2" fill="#C4613D" />
        <rect x="15" y="4" width="12" height="10" rx="1" fill="#1C1917" />
        <rect x="33" y="4" width="12" height="10" rx="1" fill="#1C1917" />
        <rect x="23" y="26" width="14" height="8" rx="2" fill="#78716C" />
        <rect x="8" y="32" width="44" height="22" rx="3" fill="#D97757" />
        <ellipse cx="20" cy="44" rx="9" ry="8" fill="#1C1917" />
        <ellipse cx="40" cy="44" rx="9" ry="8" fill="#1C1917" />
        <ellipse cx="20" cy="44" rx="7" ry="6" fill="#292524" />
        <ellipse cx="40" cy="44" rx="7" ry="6" fill="#292524" />
        <ellipse cx={20 + pupilOffsetX} cy={44 + pupilOffsetY} rx="4" fill="#D97757">
          {!hasFinishedBlinking && <animate attributeName="ry" values="4;0.2;4;0.2;4;0.2;4" dur="1.5s" fill="freeze" />}
          {hasFinishedBlinking && <set attributeName="ry" to="4" />}
        </ellipse>
        <ellipse cx={40 + pupilOffsetX} cy={44 + pupilOffsetY} rx="4" fill="#D97757">
          {!hasFinishedBlinking && <animate attributeName="ry" values="4;0.2;4;0.2;4;0.2;4" dur="1.5s" fill="freeze" />}
          {hasFinishedBlinking && <set attributeName="ry" to="4" />}
        </ellipse>
        <circle cx={21 + pupilOffsetX * 0.5} cy={42 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE">
          {!hasFinishedBlinking && <animate attributeName="opacity" values="1;0;1;0;1;0;1" dur="1.5s" fill="freeze" />}
        </circle>
        <circle cx={41 + pupilOffsetX * 0.5} cy={42 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE">
          {!hasFinishedBlinking && <animate attributeName="opacity" values="1;0;1;0;1;0;1" dur="1.5s" fill="freeze" />}
        </circle>
        <rect x="26" y="40" width="8" height="6" rx="1" fill="#78716C" />
        <rect x="28" y="54" width="4" height="10" rx="2" fill="#78716C" />
        <circle cx="30" cy="68" r="5" fill="#4A9D7C">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

// Mascot peeking from bottom left (appears on pricing section)
function PeekingMascot({ mousePos = { x: 0.5, y: 0.5 }, isVisible = false }) {
  const pupilOffsetX = (mousePos.x - 0.5) * 6
  const pupilOffsetY = (mousePos.y - 0.5) * 5

  return (
    <div className={`fixed bottom-0 left-6 z-50 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <svg width="100" height="140" viewBox="-8 -18 76 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antenna */}
        <rect x="28" y="-10" width="4" height="12" rx="2" fill="#78716C" />
        <circle cx="30" cy="-12" r="5" fill="#4A9D7C">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Head */}
        <rect x="8" y="0" width="44" height="24" rx="3" fill="#D97757" />
        {/* Eyes */}
        <ellipse cx="20" cy="12" rx="9" ry="8" fill="#1C1917" />
        <ellipse cx="40" cy="12" rx="9" ry="8" fill="#1C1917" />
        <ellipse cx="20" cy="12" rx="7" ry="6" fill="#292524" />
        <ellipse cx="40" cy="12" rx="7" ry="6" fill="#292524" />
        <ellipse cx={20 + pupilOffsetX} cy={12 + pupilOffsetY} rx="4" ry="4" fill="#D97757">
          <animate attributeName="ry" values="4;0.3;4;4;4" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
        </ellipse>
        <ellipse cx={40 + pupilOffsetX} cy={12 + pupilOffsetY} rx="4" ry="4" fill="#D97757">
          <animate attributeName="ry" values="4;0.3;4;4;4" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
        </ellipse>
        <circle cx={21 + pupilOffsetX * 0.5} cy={10 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE">
          <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
        </circle>
        <circle cx={41 + pupilOffsetX * 0.5} cy={10 + pupilOffsetY * 0.5} r="2" fill="#FEF2EE">
          <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
        </circle>
        {/* Nose */}
        <rect x="26" y="8" width="8" height="6" rx="1" fill="#78716C" />
        {/* Neck */}
        <rect x="23" y="22" width="14" height="8" rx="2" fill="#78716C" />
        {/* Body */}
        <rect x="10" y="28" width="40" height="28" rx="3" fill="#D97757" />
        <rect x="12" y="30" width="36" height="24" rx="2" fill="#C4613D" />
        {/* Body lights */}
        <rect x="15" y="34" width="12" height="10" rx="1" fill="#1C1917" />
        <rect x="33" y="34" width="12" height="10" rx="1" fill="#1C1917" />
        {/* Left arm (static) */}
        <rect x="-2" y="32" width="14" height="5" rx="2" fill="#78716C" />
        <rect x="-6" y="28" width="6" height="12" rx="2" fill="#57534E" />
        {/* Right arm (waving) */}
        <rect x="48" y="32" width="14" height="5" rx="2" fill="#78716C">
          <animateTransform attributeName="transform" type="rotate" values="0 50 34;-45 50 34;0 50 34" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        </rect>
        <rect x="60" y="28" width="6" height="12" rx="2" fill="#57534E">
          <animateTransform attributeName="transform" type="rotate" values="0 50 34;-45 50 34;0 50 34" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        </rect>
        {/* Feet - matching main mascot style */}
        <rect x="10" y="56" width="18" height="8" rx="4" fill="#78716C" />
        <rect x="32" y="56" width="18" height="8" rx="4" fill="#78716C" />
        <rect x="12" y="57" width="14" height="5" rx="3" fill="#57534E" />
        <rect x="34" y="57" width="14" height="5" rx="3" fill="#57534E" />
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
          <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

// Demo widget floating button for landing page
function DemoWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hej! Jag är Bobot - er AI-medarbetare. Hur kan jag hjälpa dig idag?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [expandedSources, setExpandedSources] = useState({})

  // Smart demo responses based on keywords - accurate information only
  const getSmartResponse = (userMsg) => {
    const msg = userMsg.toLowerCase()

    // Greeting
    if (msg.includes('hej') || msg.includes('hejsan') || msg.includes('tjena') || msg.includes('hallå') || msg.includes('god dag')) {
      return 'Hej! Kul att du vill veta mer om Bobot. Ställ gärna frågor om funktioner, GDPR, språkstöd eller hur det fungerar!'
    }

    // Pricing - redirect to contact
    if (msg.includes('pris') || msg.includes('kost') || msg.includes('betala') || msg.includes('avgift') || msg.includes('paket') || msg.includes('starter') || msg.includes('professional') || msg.includes('business') || msg.includes('enterprise')) {
      return 'Vi erbjuder olika paket anpassade efter era behov. Kontakta oss på hej@bobot.nu för en offert baserad på era specifika krav!'
    }

    // GDPR & Security
    if (msg.includes('gdpr') || msg.includes('säker') || msg.includes('data') || msg.includes('integritet') || msg.includes('personuppgift')) {
      return 'Bobot är 100% GDPR-kompatibel. All data lagras lokalt, IP-adresser anonymiseras automatiskt, och konversationer raderas efter din valda tidsperiod (7-30 dagar). Användare kan se och radera sin data direkt i widgeten.'
    }

    // Languages
    if (msg.includes('språk') || msg.includes('engelska') || msg.includes('arabiska') || msg.includes('english') || msg.includes('arabic')) {
      return 'Bobot stöder svenska, engelska och arabiska - inklusive höger-till-vänster-stöd (RTL) för arabiska! Språket detekteras automatiskt baserat på vad användaren skriver.'
    }

    // Integration & Installation
    if (msg.includes('integrer') || msg.includes('install') || msg.includes('wordpress') || msg.includes('hemsida') || msg.includes('wix') || msg.includes('squarespace')) {
      return 'Super enkelt! Det är bara två rader JavaScript-kod att klistra in. Fungerar med WordPress, Wix, Squarespace och alla andra plattformar. De flesta är igång på under 10 minuter!'
    }

    // Demo
    if (msg.includes('demo') || msg.includes('test') || msg.includes('prova')) {
      return 'Du pratar med demon just nu! För en fullständig demo med er egen kunskapsbas, kontakta oss på hej@bobot.nu.'
    }

    // AI & Technology
    if (msg.includes('ai') || msg.includes('llm') || msg.includes('ollama') || msg.includes('chatgpt') || msg.includes('artificiell') || msg.includes('intelligens') || msg.includes('modell')) {
      return 'Bobot drivs av Llama 3.1 via Ollama - en kraftfull open source AI-modell. All AI-behandling sker lokalt, så ingen data skickas till tredje part som OpenAI eller Google.'
    }

    // ChatGPT comparison
    if (msg.includes('chatgpt') || msg.includes('openai') || msg.includes('gpt')) {
      return 'Till skillnad från ChatGPT: Bobot använder lokal AI (Llama 3.1) så ingen data skickas till OpenAI. Din kunskapsbas är helt privat. Bobot svarar ENDAST baserat på dina godkända svar - ingen hallucination.'
    }

    // Features
    if (msg.includes('funktion') || msg.includes('kan bobot') || msg.includes('vad kan') || msg.includes('möjlighet') || msg.includes('feature')) {
      return 'Bobot erbjuder: AI-chatbot med egen kunskapsbas, flerspråksstöd (SV/EN/AR), GDPR-compliance, statistik och analys, konversationshistorik, anpassningsbart utseende, snabbknappar, och enkel integration!'
    }

    // Multiple widgets
    if (msg.includes('flera') && (msg.includes('widget') || msg.includes('bot') || msg.includes('chatt'))) {
      return 'Ja! Du kan ha flera widgets - t.ex. en för kunder på hemsidan och en för internt medarbetarstöd. Varje widget har egen kunskapsbas, utseende och ton.'
    }

    // Internal widget / Medarbetarstöd
    if (msg.includes('intern') || msg.includes('medarbetar') || msg.includes('anställd') || msg.includes('personal')) {
      return 'Bobot har stöd för intern användning! Du kan skapa en separat widget för medarbetarstöd med egen kunskapsbas för HR-frågor, policyer, rutiner - med anpassad ton.'
    }

    // Sources feature demo
    if (msg.includes('källa') || msg.includes('källor') || msg.includes('source') || msg.includes('referens')) {
      return {
        text: 'Bobot visar nu vilka kunskapsbasartiklar som användes för att ge svaret! Användare kan klicka på "Källor" för att se ursprungsinformationen.',
        sources: [
          { question: 'Visar Bobot varifrån svaren kommer?', answer: 'Ja! Varje AI-svar inkluderar klickbara källor som visar exakt vilka kunskapsbasartiklar som användes för att generera svaret.', category: 'Funktioner' },
          { question: 'Kan användare se originalinnehållet?', answer: 'Ja, användare kan expandera källorna för att se den fullständiga frågan och svaret från kunskapsbasen.', category: 'Funktioner' }
        ]
      }
    }

    // Knowledge base
    if (msg.includes('kunskaps') || msg.includes('faq') || msg.includes('frågor och svar') || msg.includes('träna') || msg.includes('lära')) {
      return 'Du bygger din kunskapsbas genom att lägga till frågor och svar manuellt, eller importera från Excel, Word, CSV eller direkt från en webbsida. AI:n svarar baserat på ditt innehåll.'
    }

    // Import & Upload
    if (msg.includes('import') || msg.includes('ladda upp') || msg.includes('upload') || msg.includes('excel') || msg.includes('csv') || msg.includes('word')) {
      return 'Du kan importera kunskapsbas från Excel, Word, CSV, TXT-filer eller extrahera Q&A direkt från en webbsida. Perfekt för att snabbt komma igång med befintligt FAQ-material!'
    }

    // Templates / Mallar
    if (msg.includes('mall') || msg.includes('template') || msg.includes('färdig')) {
      return 'Vi har färdiga kunskapsbasmallar för vanliga fastighetsämnen som tvättstuga, felanmälan, hyresavi, uppsägning m.m. Du kan applicera en mall och anpassa den efter era behov.'
    }

    // Statistics & Analytics
    if (msg.includes('statistik') || msg.includes('analys') || msg.includes('rapport') || msg.includes('mät')) {
      return 'Bobot ger dig detaljerad statistik: antal konversationer, vanligaste frågorna, obesvarade frågor, nöjdhetsbetyg (tumme upp/ner), och tidsanalys. Allt kan exporteras till CSV!'
    }

    // Export functionality
    if (msg.includes('export') || msg.includes('ladda ner') || msg.includes('backup')) {
      return 'Du kan exportera kunskapsbas (CSV/JSON) och konversationshistorik (CSV) med ett klick i adminpanelen. Perfekt för backup eller analys i Excel.'
    }

    // Customization & Branding
    if (msg.includes('anpassa') || msg.includes('design') || msg.includes('färg') || msg.includes('utseende') || msg.includes('brand') || msg.includes('logotyp')) {
      return 'Widgeten är anpassningsbar! Du kan välja primärfärg, typsnitt, teckenstorlek, rundade hörn, position (höger/vänster) och välkomstmeddelande. Allt med live-förhandsgranskning.'
    }

    // Dark mode
    if (msg.includes('mörkt') || msg.includes('dark mode') || msg.includes('mörk')) {
      return 'Ja! Widgeten har inbyggt stöd för mörkt läge. Användaren kan växla via menyn i chatten.'
    }

    // Property Management / Fastighetsbolag
    if (msg.includes('fastighet') || msg.includes('hyresgäst') || msg.includes('hyra') || msg.includes('lägenhet') || msg.includes('bostads')) {
      return 'Bobot är byggt för fastighetsbolag! Perfekt för att svara på hyresgästers frågor om tvättstugor, felanmälan, hyresavi, kontaktuppgifter och mer - dygnet runt, på flera språk.'
    }

    // Support & Contact
    if (msg.includes('support') || msg.includes('kontakt') || msg.includes('mail') || msg.includes('telefon')) {
      return 'Kontakta oss på hej@bobot.nu så hjälper vi dig gärna!'
    }

    // Time to start
    if (msg.includes('hur lång tid') || msg.includes('komma igång') || msg.includes('setup')) {
      return 'De flesta är igång på under 10 minuter! Bygg din kunskapsbas, kopiera två rader JavaScript-kod till din hemsida, och du är redo.'
    }

    // Mobile & Responsive
    if (msg.includes('mobil') || msg.includes('telefon') || msg.includes('responsiv') || msg.includes('tablet')) {
      return 'Bobot-widgeten är fullt responsiv och fungerar perfekt på mobiler, surfplattor och datorer. På mobilen öppnas chatten i fullskärmsläge.'
    }

    // Two-factor authentication
    if (msg.includes('2fa') || msg.includes('tvåfaktor') || msg.includes('authenticator')) {
      return 'Ja, vi stöder tvåfaktorsautentisering (2FA) via Google Authenticator eller liknande TOTP-appar för admin-inloggning.'
    }

    // What is Bobot
    if (msg.includes('vad är bobot') || msg.includes('vad gör bobot') || msg.includes('berätta om')) {
      return 'Bobot är en GDPR-säker AI-chatbot för fastighetsbolag. Du bygger en kunskapsbas med frågor och svar, och widgeten hjälper dina hyresgäster 24/7 på svenska, engelska och arabiska!'
    }

    // Comparison / Jämförelse
    if (msg.includes('jämför') || msg.includes('skillnad') || msg.includes('konkurrent') || msg.includes('alternativ')) {
      return 'Bobot skiljer sig genom: Lokal AI utan tredjepartstjänster, specialbyggt för fastighetsbolag, GDPR-kompatibelt med data i Sverige, och enkel uppstart på under 10 minuter.'
    }

    // Feedback system
    if (msg.includes('feedback') || msg.includes('betyg') || msg.includes('tumme') || msg.includes('nöjd')) {
      return 'Varje AI-svar har tumme upp/tumme ner-knappar. Du kan se statistik över nöjdhet i adminpanelen och enkelt identifiera svar som behöver förbättras.'
    }

    // Categories / Organization
    if (msg.includes('kategori') || msg.includes('sortera') || msg.includes('organiser')) {
      return 'Din kunskapsbas kan organiseras i kategorier (t.ex. Tvättstuga, Felanmälan, Ekonomi). Du kan filtrera vilka kategorier varje widget ska använda.'
    }

    // Suggested questions / Quick replies
    if (msg.includes('snabbknappar') || msg.includes('förslag') || msg.includes('snabb') && msg.includes('fråg')) {
      return 'Du kan konfigurera snabbknappar som visas i widgeten - vanliga frågor som användare kan klicka på direkt.'
    }

    // Position / Placement
    if (msg.includes('position') || msg.includes('placera') || msg.includes('höger') || msg.includes('vänster')) {
      return 'Widgeten kan placeras i nedre högra eller vänstra hörnet av hemsidan. Du väljer position i inställningarna.'
    }

    // Conversation history
    if (msg.includes('historik') || msg.includes('spara') && msg.includes('konversation')) {
      return 'Konversationer sparas så användaren kan fortsätta där de slutade. Du väljer hur länge data sparas (7-30 dagar enligt GDPR). All historik är tillgänglig i adminpanelen.'
    }

    // Multi-tenant
    if (msg.includes('flera företag') || msg.includes('multi-tenant')) {
      return 'Bobot stöder multi-tenant - varje företag får egen inloggning, kunskapsbas och widgets. Kontakta oss för mer information!'
    }

    // Admin panel
    if (msg.includes('admin') || msg.includes('administr')) {
      return 'Adminpanelen ger dig full kontroll: hantera kunskapsbas, se konversationer, analysera statistik, anpassa widgets, exportera data och mer. Inget tekniskt kunnande krävs!'
    }

    // Swedish / Local
    if (msg.includes('svensk') || msg.includes('lokal') || msg.includes('sverige')) {
      return 'Bobot är byggt för den svenska marknaden med fokus på GDPR-compliance och svenska fastighetsbolag.'
    }

    // Accessibility
    if (msg.includes('tillgänglighet') || msg.includes('wcag') || msg.includes('skärmläsare')) {
      return 'Widgeten är byggd med tillgänglighet i åtanke: tangentbordsnavigering, ARIA-labels för skärmläsare, och god kontrast.'
    }

    // Availability
    if (msg.includes('offline') || msg.includes('nere') || msg.includes('tillgäng')) {
      return 'Bobot är tillgänglig 24/7. Om AI-tjänsten tillfälligt är nere visar widgeten ett felmeddelande och uppmanar användaren att kontakta er direkt.'
    }

    // Question words - generic help
    if (msg.includes('hur') && msg.includes('fungerar')) {
      return 'Bobot fungerar i tre steg:\n\n1. Du bygger en kunskapsbas med frågor och svar\n2. Du kopierar widget-koden till din hemsida\n3. AI:n svarar automatiskt på besökarnas frågor 24/7!\n\nVill du veta mer om något specifikt steg?'
    }

    // Why Bobot
    if (msg.includes('varför') && (msg.includes('bobot') || msg.includes('välja') || msg.includes('använda'))) {
      return 'Varför Bobot?\n\n✓ Spara 80% av supporttiden\n✓ Tillgänglig 24/7 på 3 språk\n✓ 100% GDPR-säker, svensk data\n✓ Igång på 10 minuter\n✓ Inga dolda kostnader\n✓ Specialbyggt för fastighetsbolag'
    }

    // Thanks
    if (msg.includes('tack') || msg.includes('thanks') || msg.includes('bra') || msg.includes('perfekt')) {
      return 'Tack själv! Har du fler frågor så är det bara att fråga. 😊'
    }

    // Hello in other languages
    if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
      return 'Hello! Bobot supports English too. Feel free to ask about features, GDPR compliance, or how to get started!'
    }

    if (msg.includes('مرحبا') || msg.includes('السلام')) {
      return 'مرحباً! يدعم Bobot اللغة العربية أيضاً. يمكنك السؤال عن الميزات والخصوصية.'
    }

    // Default responses
    const defaults = [
      'Bra fråga! I en riktig Bobot-installation skulle jag söka igenom er kunskapsbas och ge ett precist svar baserat på era egna dokument.',
      'Det kan jag tyvärr inte svara på i demon. Men med den riktiga Bobot kan ni träna mig på precis det ni behöver!',
      'Intressant fråga! Kontakta oss på hej@bobot.nu så berättar vi mer om hur Bobot kan hjälpa er.',
      'Fråga gärna om funktioner, GDPR, språkstöd eller hur snabbt ni kan komma igång!',
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { type: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getSmartResponse(userMsg)
      // Handle both string responses and object responses (with sources)
      const botMessage = typeof response === 'string'
        ? { type: 'bot', text: response }
        : { type: 'bot', text: response.text, sources: response.sources, id: Date.now() }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 800 + Math.random() * 700)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D97757] to-[#C4613D] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                <rect x="14" y="8" width="20" height="11" rx="2" fill="#FFFFFF" />
                <ellipse cx="19" cy="13.5" rx="4" ry="3.5" fill="#1C1917" />
                <ellipse cx="29" cy="13.5" rx="4" ry="3.5" fill="#1C1917" />
                <ellipse cx="19" cy="14" rx="2" ry="2" fill="#D97757" />
                <ellipse cx="29" cy="14" rx="2" ry="2" fill="#D97757" />
                <rect x="12" y="22" width="24" height="14" rx="2" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Bobot Demo</div>
              <div className="text-xs text-white/80">din medarbetare</div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5] dark:bg-stone-900">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-[#D97757] to-[#C4613D] text-white rounded-br-sm'
                    : 'bg-[#FEF3EC] dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-[#E8D5CC] dark:border-stone-600 rounded-bl-sm'
                }`}>
                  {msg.text}

                  {/* Sources section for demo */}
                  {msg.type === 'bot' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedSources(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[#D97757]/10 text-[#D97757] border border-[#D97757]/30 rounded-md font-medium hover:bg-[#D97757]/20 transition-colors"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`transition-transform ${expandedSources[msg.id] ? 'rotate-90' : ''}`}
                        >
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                        Källor ({msg.sources.length})
                      </button>

                      {expandedSources[msg.id] && (
                        <div className="mt-2 space-y-2">
                          {msg.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-600"
                            >
                              <div className="text-xs font-medium text-[#D97757] mb-1">
                                {source.question}
                              </div>
                              <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                {source.answer}
                              </div>
                              {source.category && (
                                <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 rounded">
                                  {source.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#FEF3EC] dark:bg-stone-700 px-4 py-3 rounded-2xl rounded-bl-sm border border-[#E8D5CC] dark:border-stone-600">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#D97757] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#D97757] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#D97757] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Skriv ett meddelande..."
                className="flex-1 px-4 py-2 bg-stone-100 dark:bg-stone-700 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#D97757] text-stone-700 dark:text-stone-200 placeholder-stone-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-[#D97757] to-[#C4613D] rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:scale-105 transition-transform"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700">
              <p className="text-center text-xs text-stone-400">
                Personuppgiftsansvarig: <span className="font-medium text-stone-500 dark:text-stone-400">Marcus Widing</span>
                {' · '}
                <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:underline">hej@bobot.nu</a>
              </p>
              <p className="text-center text-xs text-stone-400 mt-1">
                Detta är en demo - <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:underline">kontakta oss</a> för att komma igång!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button with Mascot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isOpen ? '' : 'demo-widget-glow'}`}
        style={{
          background: 'linear-gradient(135deg, #D97757 0%, #C4613D 100%)',
        }}
        aria-label={isOpen ? 'Stäng demo' : 'Testa Bobot'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            {/* Feet */}
            <rect x="10" y="38" width="12" height="5" rx="2.5" fill="#78716C" />
            <rect x="26" y="38" width="12" height="5" rx="2.5" fill="#78716C" />
            <rect x="11.5" y="39" width="9" height="3" rx="1.5" fill="#57534E" />
            <rect x="27.5" y="39" width="9" height="3" rx="1.5" fill="#57534E" />
            {/* Body */}
            <rect x="12" y="22" width="24" height="17" rx="2" fill="#FFFFFF" />
            <rect x="13.5" y="23.5" width="21" height="14" rx="1" fill="#F5F5F4" />
            {/* Chest screens */}
            <rect x="15" y="30" width="8" height="6" rx="1" fill="#1C1917" />
            <rect x="25" y="30" width="8" height="6" rx="1" fill="#1C1917" />
            {/* Neck */}
            <rect x="20" y="18" width="8" height="5" rx="1" fill="#78716C" />
            {/* Head */}
            <rect x="14" y="8" width="20" height="11" rx="2" fill="#FFFFFF" />
            {/* Eyes */}
            <ellipse cx="19" cy="13.5" rx="4.5" ry="4" fill="#1C1917" />
            <ellipse cx="29" cy="13.5" rx="4.5" ry="4" fill="#1C1917" />
            <ellipse cx="19" cy="13.5" rx="3.5" ry="3" fill="#292524" />
            <ellipse cx="29" cy="13.5" rx="3.5" ry="3" fill="#292524" />
            {/* Pupils */}
            <ellipse cx="19" cy="14" rx="2" ry="2" fill="#D97757">
              <animate attributeName="ry" values="2;0.2;2;2;2" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
            </ellipse>
            <ellipse cx="29" cy="14" rx="2" ry="2" fill="#D97757">
              <animate attributeName="ry" values="2;0.2;2;2;2" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
            </ellipse>
            {/* Eye shine */}
            <circle cx="20" cy="13" r="1" fill="#FFFFFF">
              <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
            </circle>
            <circle cx="30" cy="13" r="1" fill="#FFFFFF">
              <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
            </circle>
            {/* Nose */}
            <rect x="22.5" y="12" width="3" height="3" rx="1" fill="#78716C" />
            {/* Arms */}
            <rect x="5" y="25" width="7" height="2.5" rx="1.2" fill="#78716C" />
            <rect x="36" y="25" width="7" height="2.5" rx="1.2" fill="#78716C" />
            {/* Hands */}
            <rect x="3" y="23" width="3.5" height="6" rx="1" fill="#57534E" />
            <rect x="41.5" y="23" width="3.5" height="6" rx="1" fill="#57534E" />
            {/* Antenna */}
            <rect x="22.5" y="4" width="3" height="5" rx="1" fill="#78716C" />
            <circle cx="24" cy="3" r="2.5" fill="#4A9D7C">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}
      </button>

      {/* Tooltip when closed */}
      {!isOpen && (
        <div className="absolute bottom-16 right-0 bg-stone-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
          Testa mig!
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-stone-900 rotate-45" />
        </div>
      )}
    </div>
  )
}

function TypedText({ text, delay = 0, speed = 30, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => { setHasStarted(true); setIsTyping(true) }, delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => setDisplayedText(text.slice(0, displayedText.length + 1)), speed)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
      onComplete?.()
    }
  }, [displayedText, text, speed, hasStarted, onComplete])

  // Always render full text for layout, show typed portion visibly
  return (
    <span className="relative">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">{displayedText}{isTyping && <span className="animate-pulse">|</span>}</span>
    </span>
  )
}

function ChatWidget({ messages, label, className = "", startDelay = 0 }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typingDone, setTypingDone] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => setVisibleCount(1), startDelay)
    return () => clearTimeout(timer)
  }, [startDelay])

  const handleMessageComplete = (index) => {
    setTypingDone(prev => [...prev, index])
    setTimeout(() => setVisibleCount(prev => Math.min(prev + 1, messages.length)), 400)
  }

  return (
    <div className={`w-full max-w-[280px] bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden ${className}`}>
      <div className="bg-[#D97757] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <BobotMini className="scale-50" />
          </div>
          <div>
            <span className="text-white font-semibold block text-sm">Bobot</span>
            <span className="text-white/80 text-xs">Online</span>
          </div>
        </div>
        {label && <span className="bg-white/25 text-white font-medium text-xs px-2 py-0.5 rounded-full">{label}</span>}
      </div>
      <div className="p-3 space-y-1.5 bg-stone-100 dark:bg-stone-900">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-sm leading-snug ${msg.from === 'user' ? 'bg-[#D97757] text-white rounded-br-sm' : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm rounded-bl-sm'}`}>
              <TypedText text={msg.text} delay={0} speed={msg.from === 'bot' ? 20 : 25} onComplete={!typingDone.includes(i) ? () => handleMessageComplete(i) : undefined} />
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="flex items-center gap-2 text-stone-400">
          <span className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full px-3 py-1.5 text-xs">Skriv ett meddelande...</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function ScrollIndicator({ onClick }) {
  return (
    <button onClick={onClick} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-[#D97757] transition-colors animate-bounce cursor-pointer z-20">
      <span className="text-sm font-medium">Scrolla ner</span>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  )
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function PricingCard({ tier }) {
  const isEnterprise = tier.max_conversations === 0
  return (
    <div className="rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-lg">
      <h3 className="text-xl font-semibold mb-2 text-stone-900 dark:text-stone-100">{tier.name}</h3>
      <div className="mb-4">
        {isEnterprise ? (
          <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">Offert</span>
        ) : (
          <><span className="text-3xl font-bold text-stone-900 dark:text-stone-100">{formatPrice(tier.monthly_fee)}</span><span className="text-stone-500 dark:text-stone-400"> kr/mån</span></>
        )}
      </div>
      {tier.startup_fee > 0 && <p className="text-sm mb-4 text-stone-500 dark:text-stone-400">+ {formatPrice(tier.startup_fee)} kr uppstartsavgift</p>}
      <ul className="space-y-3 text-sm mb-6 text-stone-600 dark:text-stone-400">
        {tier.features?.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Animated code snippet component
function CodeAnimation({ isVisible }) {
  const [typedCode, setTypedCode] = useState('')
  const fullCode = `<script src="https://bobot.nu/widget.js"></script>
<script>Bobot.init({ companyId: 'ditt-id' })</script>`

  useEffect(() => {
    if (!isVisible) {
      setTypedCode('')
      return
    }
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullCode.length) {
        setTypedCode(fullCode.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 25)
    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-stone-900 rounded-xl p-4 font-mono text-sm overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-700">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-stone-500 text-xs ml-2">index.html</span>
        </div>
        <pre className="text-green-400 whitespace-pre-wrap break-all">
          {typedCode}<span className="animate-pulse">|</span>
        </pre>
      </div>
      {typedCode.length === fullCode.length && (
        <div className="mt-4 flex items-center gap-2 text-green-500 animate-fade-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Klart! Widgeten är nu aktiv på din sida.</span>
        </div>
      )}
    </div>
  )
}

// FAQ Accordion component
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-stone-200 dark:border-stone-700">
      <button onClick={onClick} className="w-full py-5 flex items-center justify-between text-left group">
        <span className="font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#D97757] transition-colors">{question}</span>
        <svg className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

// Scroll animation hook
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

function LandingPage() {
  const navigate = useNavigate()

  // Track page views for analytics
  usePageTracking()

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [loginHover, setLoginHover] = useState(false)
  const [ctaHover, setCtaHover] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [pricingTiers, setPricingTiers] = useState(null)
  const [openFAQ, setOpenFAQ] = useState(null)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
  const containerRef = useRef(null)
  const sectionsRef = useRef([])
  const isScrollingRef = useRef(false)

  // Scroll animation refs
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation(0.2)
  const [codeRef, codeVisible] = useScrollAnimation(0.3)
  const [faqRef, faqVisible] = useScrollAnimation(0.2)

  const totalSections = 4

  // Fallback pricing tiers if API fails
  const fallbackPricingTiers = {
    starter: { name: "Starter", monthly_fee: 1500, startup_fee: 0, max_conversations: 250, features: ["Grundläggande AI-chatt", "50 kunskapsartiklar", "250 konversationer/månad", "E-postsupport", "Gratis uppstart"] },
    professional: { name: "Professional", monthly_fee: 3000, startup_fee: 8000, max_conversations: 2000, features: ["Allt i Starter", "250 kunskapsartiklar", "2000 konversationer/månad", "Prioriterad support", "Anpassad widget"] },
    business: { name: "Business", monthly_fee: 6000, startup_fee: 16000, max_conversations: 5000, features: ["Allt i Professional", "500 kunskapsartiklar", "5000 konversationer/månad", "Dedikerad support", "API-åtkomst"] },
    enterprise: { name: "Enterprise", monthly_fee: 10000, startup_fee: 32000, max_conversations: 0, features: ["Allt i Business", "Obegränsade konversationer", "SLA-garanti", "White-label", "Skräddarsydd utveckling"] }
  }

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch(`${API_URL}/public/pricing-tiers`)
        if (response.ok) {
          const data = await response.json()
          if (data && Object.keys(data).length > 0) {
            setPricingTiers(data)
          } else {
            setPricingTiers(fallbackPricingTiers)
          }
        } else {
          setPricingTiers(fallbackPricingTiers)
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error)
        setPricingTiers(fallbackPricingTiers)
      }
    }
    fetchPricing()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePos({ x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)) })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return
      const newSection = Math.round(window.scrollY / window.innerHeight)
      if (newSection !== currentSection && newSection >= 0 && newSection < totalSections) setCurrentSection(newSection)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentSection])

  const navigateToSection = (index) => {
    isScrollingRef.current = true
    setCurrentSection(index)
    window.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' })
    setTimeout(() => { isScrollingRef.current = false }, 800)
  }

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const customerConvo = [
    { from: 'user', text: 'Hej! Får man ha hund i lägenheten?' },
    { from: 'bot', text: 'Hej! Ja, husdjur är välkomna hos oss 🐕 De får bara inte störa grannarna.' },
    { from: 'user', text: 'Vad kul! Hur gör jag för att anmäla?' },
    { from: 'bot', text: 'Enkelt! Gå till Mina Sidor och fyll i formuläret under Husdjur. Lycka till!' },
  ]

  const employeeConvo = [
    { from: 'user', text: 'Hej, hur många semesterdagar har jag kvar?' },
    { from: 'bot', text: 'Hej! Du har 25 dagar totalt i år. Vill du ansöka så gör du det via HR-portalen minst 4 veckor innan 😊' },
  ]

  const sellingPoints = ['Avlastar medarbetare', 'Alltid tillgänglig', 'Intern kunskapsbank', 'GDPR-säker', 'Träna nyanställda', 'Enkel att integrera', 'Flera språk']

  const howItWorksSteps = [
    {
      number: 1, title: 'Bygg din kunskapsbank',
      description: 'Ladda upp befintliga dokument som Word, Excel, PDF eller CSV. Du kan också skriva frågor och svar manuellt, eller importera direkt från en webbsida.',
      icon: <svg className="w-12 h-12 text-[#D97757]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
      features: ['Word, Excel, PDF, CSV', 'Manuell inmatning', 'URL-import']
    },
    {
      number: 2, title: 'Integrera på din sida',
      description: 'Kopiera två rader JavaScript-kod och klistra in på din hemsida. Anpassa widgeten med dina färger och typsnitt. Fungerar med alla webbplattformar.',
      icon: <svg className="w-12 h-12 text-[#D97757]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
      features: ['Två rader kod', 'Anpassningsbara färger', 'Alla plattformar']
    },
    {
      number: 3, title: 'Bobot svarar åt dig',
      description: 'Dina kunder och anställda får svar direkt, dygnet runt. Följ upp via dashboarden med statistik och se vilka frågor som behöver förbättras.',
      icon: <svg className="w-12 h-12 text-[#D97757]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
      features: ['24/7 tillgänglighet', 'Flera språk', 'Realtidsstatistik']
    }
  ]

  const faqs = [
    { q: 'Hur lång tid tar det att komma igång?', a: 'De flesta kunder är igång på under 10 minuter. Ladda upp din kunskapsbank, kopiera koden till din hemsida, och du är redo!' },
    { q: 'Hur fungerar GDPR-efterlevnaden?', a: 'All data lagras på servrar i Sverige. Konversationer anonymiseras automatiskt och raderas enligt dina inställningar (7-30 dagar). Vi samlar aldrig in personuppgifter utan samtycke.' },
    { q: 'Kan jag ha flera chatbotar?', a: 'Ja! Du kan skapa separata widgets - t.ex. en för kundtjänst på din hemsida och en för internt medarbetarstöd. Varje widget kan ha egen kunskapsbas, utseende och ton.' },
    { q: 'Hur importerar jag befintlig FAQ?', a: 'Du kan importera direkt från Excel, Word, CSV eller TXT-filer. Du kan även extrahera Q&A automatiskt från en befintlig webbsida genom att ange URL:en.' },
    { q: 'Vilken AI-teknik används?', a: 'Bobot drivs av Llama 3.1 via Ollama - en kraftfull open source AI-modell. All AI-behandling sker lokalt på svenska servrar, så ingen data skickas till tredje part.' },
    { q: 'Vad händer om Bobot inte kan svara?', a: 'Bobot visar ett anpassningsbart reservmeddelande och loggar frågan i analytics. Du kan sedan lägga till svaret i kunskapsbanken för framtida frågor.' },
    { q: 'Kan jag anpassa utseendet?', a: 'Absolut! Du kan välja primärfärg, bakgrundsfärg, typsnitt, teckenstorlek, rundade hörn och position. Allt anpassas i adminpanelen med live-förhandsgranskning.' },
    { q: 'Finns det statistik och rapporter?', a: 'Ja, du får detaljerad statistik över antal konversationer, vanligaste frågorna, obesvarade frågor, nöjdhetsbetyg och svarstider. Allt kan exporteras till CSV.' },
  ]

  const orderedTiers = pricingTiers ? Object.entries(pricingTiers).map(([key, tier]) => ({ key, ...tier })).sort((a, b) => (a.monthly_fee || 0) - (b.monthly_fee || 0)) : []

  return (
    <div ref={containerRef} className="bg-gradient-to-br from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 relative">

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-3 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToSection(0)}>
            <BobotMini />
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Bobot</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <div onMouseEnter={() => setLoginHover(true)} onMouseLeave={() => setLoginHover(false)}>
              <button onClick={() => navigate('/login')} className="bg-[#D97757] hover:bg-[#c4613d] text-white text-sm px-5 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg">
                Logga in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hanging mascot positioned near login button */}
      <div className="fixed top-0 right-[calc(50%-770px)] z-50"><HangingMascot mousePos={mousePos} isVisible={loginHover} /></div>
      <PeekingMascot mousePos={mousePos} isVisible={currentSection === 2} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <Sparkle delay={0} size={3} className="top-20 left-[10%]" />
        <Sparkle delay={500} size={4} className="top-32 right-[15%]" />
        <Sparkle delay={1000} size={2} className="top-48 left-[25%]" />
        <Sparkle delay={1500} size={3} className="bottom-32 right-[20%]" />
        <Sparkle delay={800} size={3} className="top-40 right-[40%]" />
      </div>

      {/* SECTION 1: Hero with dual widgets */}
      <section ref={el => sectionsRef.current[0] = el} className="min-h-screen flex flex-col justify-center px-4 sm:px-6 pt-20 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className={`relative transition-all duration-1000 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="absolute -left-8 lg:-left-44 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#D97757]/20 rounded-full blur-3xl scale-150" />
                  <BobotMascot size={160} mousePos={mousePos} isWaving={ctaHover} className="relative z-10 animate-float" />
                </div>
              </div>
              <div className="flex justify-center mb-6 lg:hidden">
                <BobotMascot size={120} mousePos={mousePos} isWaving={ctaHover} className="animate-float" />
              </div>
              <div className="lg:pl-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-4 sm:mb-6 text-center lg:text-left">
                  Din nya medarbetare, som alltid är där
                </h1>
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-6 sm:mb-8 leading-relaxed text-center lg:text-left">
                  Bobot svarar på frågor från kunder och anställda. Direkt, dygnet runt.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400 mb-8 sm:mb-10">
                  {sellingPoints.map(point => (
                    <span key={point} className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {point}
                    </span>
                  ))}
                </div>
                <div className="p-6 sm:p-8 bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 rounded-2xl border border-[#D97757]/20">
                  <h3 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2 text-center lg:text-left">Vill du veta mer?</h3>
                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mb-4 text-center lg:text-left">Boka en gratis demo och se hur Bobot kan hjälpa er organisation.</p>
                  <div className="flex justify-center lg:justify-start">
                    <a href="mailto:hej@bobot.nu" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#c4613d] text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-xl shadow-lg shadow-[#D97757]/25" onMouseEnter={() => setCtaHover(true)} onMouseLeave={() => setCtaHover(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Kontakta oss
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual chat widgets */}
            <div className={`flex flex-col lg:flex-row items-start gap-6 pt-4 transition-all duration-1000 delay-300 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <ChatWidget messages={customerConvo} label="Kundtjänst" startDelay={800} className="hover:scale-[1.02] transition-transform" />
              <ChatWidget messages={employeeConvo} label="Medarbetarstöd" startDelay={2500} className="hover:scale-[1.02] transition-transform lg:-mt-16" />
            </div>
          </div>
        </div>
        <ScrollIndicator onClick={() => navigateToSection(1)} />
      </section>

      {/* SECTION 2: Så fungerar det + Code animation */}
      <section ref={el => sectionsRef.current[1] = el} className="min-h-screen flex flex-col justify-center px-4 sm:px-6 py-20 bg-white/50 dark:bg-stone-800/50 relative">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 dark:text-stone-100 mb-4">Så fungerar det</h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">Kom igång på under 10 minuter. Ingen teknisk kunskap krävs.</p>
          </div>

          <div ref={howItWorksRef} className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {howItWorksSteps.map((step, idx) => (
              <div key={step.number} className={`bg-white dark:bg-stone-800 rounded-2xl p-6 lg:p-8 shadow-lg border border-stone-200 dark:border-stone-700 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#D97757]/10 dark:bg-[#D97757]/20 rounded-2xl flex items-center justify-center flex-shrink-0">{step.icon}</div>
                  <div className="w-10 h-10 bg-[#D97757] text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">{step.number}</div>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">{step.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">{step.description}</p>
                <div className="flex flex-wrap gap-2">
                  {step.features.map((feature, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full">
                      <svg className="w-3 h-3 text-[#D97757]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Code animation with platform compatibility */}
          <div ref={codeRef} className="max-w-xl mx-auto">
            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mb-4">Så enkelt är det att integrera:</p>
            <CodeAnimation isVisible={codeVisible} />
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['WordPress', 'Wix', 'Squarespace', 'Shopify', 'Webflow'].map(p => (
                <span key={p} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Pricing */}
      <section ref={el => sectionsRef.current[2] = el} className="min-h-screen flex flex-col justify-center px-4 sm:px-6 py-20 relative">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 dark:text-stone-100 mb-4">Enkel och transparent prissättning</h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">Välj det paket som passar din organisation. Inga dolda avgifter.</p>
          </div>
          {pricingTiers ? (
            <div className={`grid gap-6 lg:gap-8 ${orderedTiers.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : orderedTiers.length === 3 ? 'sm:grid-cols-3' : orderedTiers.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-1 max-w-md mx-auto'}`}>
              {orderedTiers.map((tier) => <PricingCard key={tier.key} tier={tier} />)}
            </div>
          ) : (
            <div className="flex justify-center"><div className="animate-pulse text-stone-400">Laddar priser...</div></div>
          )}
        </div>
      </section>

      {/* SECTION 4: FAQ + Footer */}
      <section ref={el => sectionsRef.current[3] = el} className="min-h-screen flex flex-col px-4 sm:px-6 py-20 relative">
        <div className="max-w-3xl mx-auto w-full flex-1">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 mb-4">Vanliga frågor</h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">Har du fler frågor? Kontakta oss gärna!</p>
          </div>

          <div ref={faqRef} className={`bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 px-6 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} isOpen={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)} />
            ))}
          </div>

          <div className="mt-12 mb-8 text-center">
            <p className="text-stone-600 dark:text-stone-400 mb-4">Hittar du inte svaret på din fråga?</p>
            <a href="mailto:hej@bobot.nu" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#c4613d] text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Kontakta oss
            </a>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-auto pt-12 border-t border-stone-200 dark:border-stone-700">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BobotMini />
                  <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">Bobot</span>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400">AI-driven kundservice och intern kunskapsassistent. GDPR-säker och enkel att integrera.</p>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Produkt</h4>
                <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                  <li><button onClick={() => navigateToSection(1)} className="hover:text-[#D97757] transition-colors">Så fungerar det</button></li>
                  <li><button onClick={() => navigateToSection(2)} className="hover:text-[#D97757] transition-colors">Priser</button></li>
                  <li><button onClick={() => navigateToSection(3)} className="hover:text-[#D97757] transition-colors">Vanliga frågor</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Kontakt</h4>
                <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                  <li><a href="mailto:hej@bobot.nu" className="hover:text-[#D97757] transition-colors">hej@bobot.nu</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-stone-400">&copy; {new Date().getFullYear()} Bobot. Alla rättigheter förbehållna.</span>
              <div className="flex items-center gap-6 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  GDPR-kompatibel
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  Data lagras i Sverige
                </span>
              </div>
            </div>
          </div>
        </footer>
      </section>

      {/* Demo Widget Floating Button */}
      <DemoWidget />

      <style>{`
        html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }
        section { scroll-snap-align: start; scroll-snap-stop: always; }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes sparkle { 0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(180deg); opacity: 1; } }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 15px rgba(217, 119, 87, 0.4), 0 4px 24px rgba(0, 0, 0, 0.15); } 50% { box-shadow: 0 0 25px rgba(217, 119, 87, 0.6), 0 4px 24px rgba(0, 0, 0, 0.15); } }
        .demo-widget-glow { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default LandingPage
