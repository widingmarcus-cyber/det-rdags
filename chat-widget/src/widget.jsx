import React, { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

// Translations
const translations = {
  sv: {
    welcomeMessage: 'Hej! Hur kan jag hjälpa dig idag?',
    fallbackMessage: 'Tyvärr kunde jag inte hitta ett svar. Vänligen kontakta oss direkt.',
    placeholder: 'Skriv din fråga här...',
    subtitle: 'Alltid redo att hjälpa',
    contactUs: 'Kontakta oss direkt',
    helpful: 'Var detta hjälpsamt?',
    yes: 'Ja',
    no: 'Nej',
    thanksFeedback: 'Tack för din feedback!',
    errorMessage: 'Ett fel uppstod. Vänligen försök igen.',
    serviceUnavailable: 'Chatten är tillfälligt otillgänglig. Vänligen försök igen om en stund eller kontakta oss direkt.',
    emailConversation: 'Skicka till support',
    newConversation: 'Ny konversation',
    clearHistory: 'Rensa historik',
    lightMode: 'Ljust läge',
    darkMode: 'Mörkt läge',
    // PuB/GDPR
    consentRequired: 'Samtycke krävs',
    privacyPolicy: 'Integritetspolicy',
    viewMyData: 'Visa min data',
    deleteMyData: 'Radera min data',
    gdprMenu: 'Mina rättigheter',
    consentGiven: 'Du har gett samtycke',
    dataDeleted: 'Din data har raderats',
    confirmDelete: 'Är du säker? Detta kan inte ångras.',
    // Accessibility
    openChat: 'Öppna chatt',
    closeChat: 'Stäng chatt',
    sendMessage: 'Skicka meddelande',
    menu: 'Meny',
    botMessage: 'Botmeddelande',
    userMessage: 'Ditt meddelande',
    typing: 'Skriver...',
  },
  en: {
    welcomeMessage: 'Hi! How can I help you today?',
    fallbackMessage: "I couldn't find an answer. Please contact us directly.",
    placeholder: 'Type your question here...',
    subtitle: 'Always ready to help',
    contactUs: 'Contact us directly',
    helpful: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    thanksFeedback: 'Thanks for your feedback!',
    errorMessage: 'An error occurred. Please try again.',
    serviceUnavailable: 'Chat is temporarily unavailable. Please try again later or contact us directly.',
    emailConversation: 'Email to support',
    newConversation: 'New conversation',
    clearHistory: 'Clear history',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    // PuB/GDPR
    consentRequired: 'Consent required',
    privacyPolicy: 'Privacy policy',
    viewMyData: 'View my data',
    deleteMyData: 'Delete my data',
    gdprMenu: 'My rights',
    consentGiven: 'You have given consent',
    dataDeleted: 'Your data has been deleted',
    confirmDelete: 'Are you sure? This cannot be undone.',
    // Accessibility
    openChat: 'Open chat',
    closeChat: 'Close chat',
    sendMessage: 'Send message',
    menu: 'Menu',
    botMessage: 'Bot message',
    userMessage: 'Your message',
    typing: 'Typing...',
  },
  ar: {
    welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    fallbackMessage: 'لم أتمكن من العثور على إجابة. يرجى الاتصال بنا مباشرة.',
    placeholder: 'اكتب سؤالك هنا...',
    subtitle: 'دائماً جاهزون للمساعدة',
    contactUs: 'اتصل بنا مباشرة',
    helpful: 'هل كان هذا مفيداً؟',
    yes: 'نعم',
    no: 'لا',
    thanksFeedback: 'شكراً على ملاحظاتك!',
    errorMessage: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    serviceUnavailable: 'الدردشة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً أو الاتصال بنا مباشرة.',
    emailConversation: 'أرسل إلى الدعم',
    newConversation: 'محادثة جديدة',
    clearHistory: 'مسح المحفوظات',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    // PuB/GDPR
    consentRequired: 'الموافقة مطلوبة',
    privacyPolicy: 'سياسة الخصوصية',
    viewMyData: 'عرض بياناتي',
    deleteMyData: 'حذف بياناتي',
    gdprMenu: 'حقوقي',
    consentGiven: 'لقد وافقت',
    dataDeleted: 'تم حذف بياناتك',
    confirmDelete: 'هل أنت متأكد؟ لا يمكن التراجع عن هذا.',
    // Accessibility
    openChat: 'افتح الدردشة',
    closeChat: 'أغلق الدردشة',
    sendMessage: 'إرسال رسالة',
    menu: 'القائمة',
    botMessage: 'رسالة الروبوت',
    userMessage: 'رسالتك',
    typing: 'يكتب...',
  }
}

// Detect browser language
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || 'sv'
  const langCode = browserLang.split('-')[0].toLowerCase()

  // Return supported language or default to Swedish
  if (translations[langCode]) {
    return langCode
  }
  return 'sv'
}

// Design tokens - Light mode
const lightColors = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#F5F5F4',
  bgTertiary: '#FFFFFF',
  bgChatUser: '#F0EBE3',
  bgChatBot: '#FFFFFF',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#A8A29E',
  textInverse: '#FAFAFA',
  accent: '#D97757',
  accentHover: '#C4613D',
  accentSoft: '#FEF2EE',
  accentGlow: 'rgba(217, 119, 87, 0.15)',
  borderSubtle: '#E7E5E4',
  border: '#D6D3D1',
  success: '#22C55E',
  successSoft: '#DCFCE7',
  shadowLg: '0 12px 32px rgba(28, 25, 23, 0.08)',
}

// Design tokens - Dark mode
const darkColors = {
  bgPrimary: '#1C1917',
  bgSecondary: '#292524',
  bgTertiary: '#1C1917',
  bgChatUser: '#44403C',
  bgChatBot: '#292524',
  textPrimary: '#FAFAF9',
  textSecondary: '#D6D3D1',
  textTertiary: '#A8A29E',
  textInverse: '#1C1917',
  accent: '#D97757',
  accentHover: '#E8886A',
  accentSoft: 'rgba(217, 119, 87, 0.15)',
  accentGlow: 'rgba(217, 119, 87, 0.25)',
  borderSubtle: '#44403C',
  border: '#57534E',
  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.15)',
  shadowLg: '0 12px 32px rgba(0, 0, 0, 0.3)',
}

// Default to light mode (can be overridden)
const defaultColors = lightColors

// Generate session ID
function generateSessionId() {
  return 'widget-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11)
}

// LocalStorage helpers for conversation persistence
const STORAGE_KEY_PREFIX = 'bobot_chat_'

function getStorageKey(companyId) {
  return `${STORAGE_KEY_PREFIX}${companyId}`
}

function loadConversationFromStorage(companyId) {
  try {
    const data = localStorage.getItem(getStorageKey(companyId))
    if (data) {
      const parsed = JSON.parse(data)
      // Check if conversation is less than 24 hours old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed
      }
    }
  } catch (e) {
    console.log('Could not load chat history')
  }
  return null
}

function saveConversationToStorage(companyId, data) {
  try {
    localStorage.setItem(getStorageKey(companyId), JSON.stringify({
      ...data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.log('Could not save chat history')
  }
}

function clearConversationStorage(companyId) {
  try {
    localStorage.removeItem(getStorageKey(companyId))
  } catch (e) {
    console.log('Could not clear chat history')
  }
}

// Darken/lighten hex color
function adjustColor(hex, amount) {
  if (!hex) return '#C4613D'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

// CSS animations and WCAG 2.2 AA accessibility styles
const injectStyles = () => {
  if (document.getElementById('bobot-styles')) return
  const styleSheet = document.createElement('style')
  styleSheet.id = 'bobot-styles'
  styleSheet.textContent = `
    @keyframes bobot-slideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes bobot-messageIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes bobot-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes bobot-pulse {
      0%, 100% { box-shadow: 0 12px 32px rgba(28, 25, 23, 0.08), 0 0 0 0 rgba(217, 119, 87, 0.4); }
      50% { box-shadow: 0 12px 32px rgba(28, 25, 23, 0.08), 0 0 0 12px rgba(217, 119, 87, 0); }
    }
    .bobot-typing-dot { animation: bobot-bounce 1.4s infinite; }
    .bobot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .bobot-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    .bobot-pulse { animation: bobot-pulse 2s infinite; }
    @media (max-width: 480px) {
      .bobot-widget-window {
        width: calc(100vw - 32px) !important;
        height: 85vh !important;
        bottom: 68px !important;
        right: -8px !important;
      }
    }
    [dir="rtl"] .bobot-input { text-align: right; }

    /* WCAG 2.2 AA Focus Indicators - visible outline for keyboard navigation */
    .bobot-focusable:focus {
      outline: 3px solid #D97757 !important;
      outline-offset: 2px !important;
    }
    .bobot-focusable:focus:not(:focus-visible) {
      outline: none !important;
    }
    .bobot-focusable:focus-visible {
      outline: 3px solid #D97757 !important;
      outline-offset: 2px !important;
    }

    /* Skip link for keyboard users */
    .bobot-skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #D97757;
      color: white;
      padding: 8px 16px;
      z-index: 100;
      border-radius: 0 0 8px 0;
      transition: top 0.3s;
    }
    .bobot-skip-link:focus {
      top: 0;
    }

    /* Screen reader only text */
    .bobot-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Minimum touch target size 24x24 (WCAG 2.2 AA) */
    .bobot-touch-target {
      min-width: 24px;
      min-height: 24px;
    }

    /* Reduce motion for users who prefer it */
    @media (prefers-reduced-motion: reduce) {
      .bobot-widget-window,
      .bobot-typing-dot,
      .bobot-pulse {
        animation: none !important;
        transition: none !important;
      }
    }
  `
  document.head.appendChild(styleSheet)
}

// Detect system dark mode preference
function detectDarkMode() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function ChatWidget({ config }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [buttonHover, setButtonHover] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [sendHover, setSendHover] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [sessionId, setSessionId] = useState(() => generateSessionId())
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [companyConfig, setCompanyConfig] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(() => detectDarkMode())
  // PuB/GDPR Compliance
  const [consentGiven, setConsentGiven] = useState(false)
  const [showGdprMenu, setShowGdprMenu] = useState(false)
  const [gdprStatus, setGdprStatus] = useState(null) // 'loading', 'success', 'error'
  // Accessibility - live region announcements
  const [announcement, setAnnouncement] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatWindowRef = useRef(null)

  // Get colors based on dark mode
  const colors = darkMode ? darkColors : lightColors

  // Auto-detect language from browser
  const lang = detectLanguage()
  const t = translations[lang] || translations.sv
  const isRTL = lang === 'ar'

  // Fetch company config from backend and restore conversation
  useEffect(() => {
    injectStyles()
    fetchCompanyConfig()
  }, [])

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1 && companyConfig) {
      saveConversationToStorage(config.companyId, {
        messages,
        sessionId,
        conversationId,
        feedbackGiven
      })
    }
  }, [messages, sessionId, conversationId, feedbackGiven])

  const fetchCompanyConfig = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/widget/${config.companyId}/config`)
      if (response.ok) {
        const data = await response.json()
        setCompanyConfig(data)

        // Try to restore previous conversation
        const saved = loadConversationFromStorage(config.companyId)
        if (saved && saved.messages && saved.messages.length > 1) {
          setMessages(saved.messages)
          if (saved.sessionId) setSessionId(saved.sessionId)
          if (saved.conversationId) setConversationId(saved.conversationId)
          if (saved.feedbackGiven) setFeedbackGiven(saved.feedbackGiven)
        } else {
          // Set welcome message
          const welcomeMsg = data.welcome_message || t.welcomeMessage
          setMessages([{ id: 0, type: 'bot', text: welcomeMsg }])
        }
      } else {
        // Fallback to default welcome
        setMessages([{ id: 0, type: 'bot', text: t.welcomeMessage }])
      }
    } catch (error) {
      console.log('Could not fetch company config')
      setMessages([{ id: 0, type: 'bot', text: t.welcomeMessage }])
    }
  }

  const startNewConversation = () => {
    clearConversationStorage(config.companyId)
    setMessages([{ id: 0, type: 'bot', text: companyConfig?.welcome_message || t.welcomeMessage }])
    setSessionId(generateSessionId())
    setConversationId(null)
    setFeedbackGiven({})
    setShowContact(false)
    setShowMenu(false)
  }

  const emailConversation = () => {
    const email = companyConfig?.contact_email
    if (!email) return

    // Build conversation summary
    const conversationText = messages
      .filter(m => m.id !== 0) // Skip welcome message
      .map(m => `${m.type === 'user' ? 'Kund' : 'Bot'}: ${m.text}`)
      .join('\n\n')

    const refId = conversationId || 'Ej tilldelat'
    const subject = encodeURIComponent(`Chattkonversation ${refId}`)
    const body = encodeURIComponent(`Hej,\n\nJag behöver hjälp med min chattkonversation.\n\nReferens-ID: ${refId}\n\n--- Konversation ---\n\n${conversationText}\n\n--- Slut ---\n\nVänligen kontakta mig för vidare hjälp.\n`)

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    setShowMenu(false)
  }

  // PuB/GDPR Consent handling
  const recordConsent = async (consent) => {
    try {
      await fetch(`${config.apiUrl}/gdpr/${config.companyId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, consent_given: consent })
      })
      setConsentGiven(consent)
      if (consent) {
        // Save to localStorage
        localStorage.setItem(`bobot_consent_${config.companyId}`, 'true')
        setAnnouncement(t.consentGiven)
      }
    } catch (e) {
      console.log('Could not record consent')
    }
  }

  // Check if consent is required
  const needsConsent = () => {
    if (!companyConfig?.require_consent) return false
    if (consentGiven) return false
    // Check localStorage for previous consent
    const stored = localStorage.getItem(`bobot_consent_${config.companyId}`)
    if (stored === 'true') {
      setConsentGiven(true)
      return false
    }
    return true
  }

  // GDPR - View my data
  const viewMyData = async () => {
    setGdprStatus('loading')
    try {
      const response = await fetch(
        `${config.apiUrl}/gdpr/${config.companyId}/my-data?session_id=${sessionId}`
      )
      if (response.ok) {
        const data = await response.json()
        // Open in new window or show modal
        const dataWindow = window.open('', '_blank')
        if (dataWindow) {
          dataWindow.document.write(`
            <html>
              <head><title>${t.viewMyData}</title>
              <style>body{font-family:system-ui;padding:20px;max-width:800px;margin:0 auto;}</style></head>
              <body>
                <h1>${t.viewMyData}</h1>
                <pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow:auto;">
${JSON.stringify(data.data, null, 2)}
                </pre>
              </body>
            </html>
          `)
        }
        setGdprStatus('success')
        setAnnouncement(t.viewMyData + ' - OK')
      }
    } catch (e) {
      setGdprStatus('error')
    }
    setShowGdprMenu(false)
  }

  // GDPR - Delete my data
  const deleteMyData = async () => {
    if (!window.confirm(t.confirmDelete)) return
    setGdprStatus('loading')
    try {
      const response = await fetch(
        `${config.apiUrl}/gdpr/${config.companyId}/my-data?session_id=${sessionId}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        setGdprStatus('success')
        setAnnouncement(t.dataDeleted)
        // Clear local data
        clearConversationStorage(config.companyId)
        startNewConversation()
      }
    } catch (e) {
      setGdprStatus('error')
    }
    setShowGdprMenu(false)
  }

  // Keyboard navigation - Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showMenu) {
          setShowMenu(false)
        } else if (showGdprMenu) {
          setShowGdprMenu(false)
        } else if (isOpen) {
          setIsOpen(false)
          setAnnouncement(t.closeChat)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showMenu, showGdprMenu])

  // Focus management - focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !needsConsent()) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, consentGiven])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    const userMsgId = Date.now()
    setInput('')
    setMessages(prev => [...prev, { id: userMsgId, type: 'user', text: userMessage }])
    setLoading(true)
    setShowContact(false)

    try {
      const response = await fetch(`${config.apiUrl}/chat/${config.companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          session_id: sessionId,
          language: lang  // Send detected language to backend
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMsgId = Date.now()

        // Store conversation ID from response
        if (data.conversation_id) {
          setConversationId(data.conversation_id)
        }

        setMessages(prev => [...prev, {
          id: botMsgId,
          type: 'bot',
          text: data.answer,
          hadAnswer: data.had_answer,
          confidence: data.confidence || 100
        }])

        // Show contact button if bot couldn't answer
        if (!data.had_answer) {
          setShowContact(true)
        }
      } else {
        const fallback = companyConfig?.fallback_message || t.fallbackMessage
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          text: fallback
        }])
        setShowContact(true)
      }
    } catch (error) {
      // Better error message for service unavailable (Ollama down, etc.)
      const errorMsg = error.message?.includes('503') || error.message?.includes('fetch')
        ? t.serviceUnavailable
        : t.errorMessage

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: errorMsg,
        isError: true
      }])
      setShowContact(true)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (messageId, helpful) => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: helpful }))
    try {
      await fetch(`${config.apiUrl}/chat/${config.companyId}/feedback?session_id=${sessionId}&helpful=${helpful}`, {
        method: 'POST'
      })
    } catch (e) {
      console.log('Could not send feedback')
    }
  }

  const handleContact = () => {
    const email = companyConfig?.contact_email
    const phone = companyConfig?.contact_phone
    if (email) {
      window.location.href = `mailto:${email}`
    } else if (phone) {
      window.location.href = `tel:${phone}`
    }
  }

  // Dynamic colors from company config
  const primaryColor = companyConfig?.primary_color || defaultColors.accent
  const companyName = companyConfig?.company_name || config.title || 'Bobot'
  const companySubtitle = companyConfig?.subtitle || t.subtitle
  const hasContact = companyConfig?.contact_email || companyConfig?.contact_phone

  // Styles - using dynamic colors based on dark mode
  const styles = {
    container: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      fontFamily: "'Inter', system-ui, sans-serif",
      direction: isRTL ? 'rtl' : 'ltr',
    },
    button: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: colors.shadowLg,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: buttonHover ? 'scale(1.05)' : 'scale(1)',
    },
    chatWindow: {
      position: 'absolute',
      bottom: '70px',
      right: isRTL ? 'auto' : '0',
      left: isRTL ? '0' : 'auto',
      width: '400px',
      height: '600px',
      backgroundColor: colors.bgTertiary,
      borderRadius: '16px',
      boxShadow: colors.shadowLg,
      border: `1px solid ${colors.borderSubtle}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'bobot-slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    header: {
      background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
      color: colors.textInverse,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    headerIcon: {
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontWeight: '600',
      fontSize: '16px',
      margin: 0,
    },
    headerSubtitle: {
      fontSize: '13px',
      opacity: 0.85,
      margin: '2px 0 0 0',
    },
    closeButton: {
      width: '32px',
      height: '32px',
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      borderRadius: '8px',
      color: colors.textInverse,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: isRTL ? '0' : 'auto',
      marginRight: isRTL ? 'auto' : '0',
    },
    messages: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      backgroundColor: colors.bgSecondary,
    },
    message: {
      marginBottom: '12px',
      display: 'flex',
      animation: 'bobot-messageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    messageBubble: {
      maxWidth: '85%',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    messageBubbleUser: {
      backgroundColor: colors.bgChatUser,
      color: colors.textPrimary,
      borderBottomRightRadius: isRTL ? '12px' : '4px',
      borderBottomLeftRadius: isRTL ? '4px' : '12px',
    },
    messageBubbleBot: {
      backgroundColor: colors.bgChatBot,
      color: colors.textPrimary,
      border: `1px solid ${colors.borderSubtle}`,
      borderBottomLeftRadius: isRTL ? '12px' : '4px',
      borderBottomRightRadius: isRTL ? '4px' : '12px',
    },
    feedbackButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: `1px solid ${colors.borderSubtle}`,
    },
    feedbackBtn: {
      padding: '4px 12px',
      fontSize: '12px',
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: colors.textSecondary,
      transition: 'all 0.15s ease',
    },
    inputArea: {
      padding: '12px',
      borderTop: `1px solid ${colors.borderSubtle}`,
      backgroundColor: colors.bgSecondary,
    },
    inputForm: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: `1px solid ${inputFocused ? primaryColor : colors.borderSubtle}`,
      borderRadius: '24px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: colors.bgTertiary,
      color: colors.textPrimary,
      transition: 'all 0.2s ease',
      boxShadow: inputFocused ? `0 0 0 3px ${colors.accentGlow}` : 'none',
      textAlign: isRTL ? 'right' : 'left',
    },
    sendButton: {
      width: '40px',
      height: '40px',
      backgroundColor: primaryColor,
      color: colors.textInverse,
      border: 'none',
      borderRadius: '50%',
      cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: loading || !input.trim() ? 0.5 : 1,
      transition: 'all 0.2s ease',
      transform: sendHover && !loading && input.trim() ? 'scale(1.05)' : 'scale(1)',
    },
    contactButton: {
      width: '100%',
      padding: '10px 16px',
      marginTop: '8px',
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      color: colors.textSecondary,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
  }

  return (
    <div style={styles.container} role="region" aria-label="Chat widget">
      {/* ARIA Live Region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="bobot-sr-only"
      >
        {announcement}
      </div>

      {isOpen && (
        <div
          id="bobot-chat-window"
          style={styles.chatWindow}
          className="bobot-widget-window"
          ref={chatWindowRef}
          role="dialog"
          aria-label={companyName + ' chat'}
          aria-modal="true"
        >
          {/* Skip link for keyboard users */}
          <a
            href="#bobot-input"
            className="bobot-skip-link bobot-focusable"
            onClick={(e) => { e.preventDefault(); inputRef.current?.focus(); }}
          >
            Hoppa till inmatning
          </a>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={styles.headerTitle}>{companyName}</p>
              <p style={styles.headerSubtitle}>
                {conversationId ? `${companySubtitle} • ${conversationId}` : companySubtitle}
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                style={styles.closeButton}
                onClick={() => setShowMenu(!showMenu)}
                aria-label={t.menu}
                aria-expanded={showMenu}
                aria-haspopup="menu"
                className="bobot-focusable bobot-touch-target"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: isRTL ? 'auto' : '0',
                    left: isRTL ? '0' : 'auto',
                    backgroundColor: colors.bgTertiary,
                    borderRadius: '8px',
                    boxShadow: colors.shadowLg,
                    border: `1px solid ${colors.borderSubtle}`,
                    minWidth: '180px',
                    zIndex: 10,
                    overflow: 'hidden'
                  }}
                  role="menu"
                  aria-label={t.menu}
                >
                  <button
                    onClick={startNewConversation}
                    role="menuitem"
                    className="bobot-focusable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: colors.textPrimary,
                      fontSize: '13px',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.bgSecondary}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {t.newConversation}
                  </button>
                  {companyConfig?.contact_email && messages.length > 1 && (
                    <button
                      onClick={emailConversation}
                      role="menuitem"
                      className="bobot-focusable"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: colors.textPrimary,
                        fontSize: '13px',
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = colors.bgSecondary}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {t.emailConversation}
                    </button>
                  )}
                  <button
                    onClick={() => { setDarkMode(!darkMode); setShowMenu(false) }}
                    role="menuitem"
                    className="bobot-focusable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: colors.textPrimary,
                      fontSize: '13px',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.bgSecondary}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {darkMode ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    )}
                    {darkMode ? t.lightMode : t.darkMode}
                  </button>
                  {/* GDPR Menu Separator */}
                  <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: '4px 0' }} role="separator" />
                  {/* Privacy Policy Link */}
                  {companyConfig?.privacy_policy_url && (
                    <a
                      href={companyConfig.privacy_policy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      className="bobot-focusable"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: colors.textPrimary,
                        fontSize: '13px',
                        textAlign: isRTL ? 'right' : 'left',
                        textDecoration: 'none'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = colors.bgSecondary}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      {t.privacyPolicy}
                    </a>
                  )}
                  {/* View My Data */}
                  <button
                    onClick={viewMyData}
                    role="menuitem"
                    className="bobot-focusable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: colors.textPrimary,
                      fontSize: '13px',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.bgSecondary}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {t.viewMyData}
                  </button>
                  {/* Delete My Data */}
                  <button
                    onClick={deleteMyData}
                    role="menuitem"
                    className="bobot-focusable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#C75D5D',
                      fontSize: '13px',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.bgSecondary}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    {t.deleteMyData}
                  </button>
                </div>
              )}
            </div>
            <button
              style={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label={t.closeChat}
              className="bobot-focusable bobot-touch-target"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Consent Dialog (PuB Compliance) */}
          {needsConsent() && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              borderRadius: '16px'
            }}>
              <div
                style={{
                  backgroundColor: colors.bgTertiary,
                  borderRadius: '12px',
                  padding: '24px',
                  margin: '16px',
                  maxWidth: '320px',
                  boxShadow: colors.shadowLg
                }}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="consent-title"
                aria-describedby="consent-desc"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: colors.accentSoft,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3 id="consent-title" style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.textPrimary }}>
                    {t.consentRequired}
                  </h3>
                </div>
                <p id="consent-desc" style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px', lineHeight: '1.5' }}>
                  {companyConfig?.consent_text || t.consentRequired}
                </p>
                {companyConfig?.privacy_policy_url && (
                  <a
                    href={companyConfig.privacy_policy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bobot-focusable"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: primaryColor,
                      marginBottom: '16px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {t.privacyPolicy}
                  </a>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => recordConsent(true)}
                    className="bobot-focusable"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: primaryColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bobot-focusable"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: colors.textSecondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {t.no}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={styles.messages} role="log" aria-label="Chat messages" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div style={{
                  ...styles.message,
                  justifyContent: msg.type === 'user'
                    ? (isRTL ? 'flex-start' : 'flex-end')
                    : (isRTL ? 'flex-end' : 'flex-start')
                }}>
                  <div style={{
                    ...styles.messageBubble,
                    ...(msg.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot)
                  }}>
                    {msg.text}

                    {/* Confidence score for bot messages */}
                    {msg.type === 'bot' && msg.confidence && msg.confidence < 100 && msg.id !== 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '6px',
                        fontSize: '11px',
                        color: msg.confidence >= 70 ? colors.success : colors.textTertiary
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {msg.confidence}% säkerhet
                      </div>
                    )}

                    {/* Feedback buttons for bot messages */}
                    {msg.type === 'bot' && msg.id !== 0 && !feedbackGiven[msg.id] && (
                      <div style={styles.feedbackButtons}>
                        <span style={{ fontSize: '12px', color: colors.textTertiary }}>{t.helpful}</span>
                        <button style={styles.feedbackBtn} onClick={() => handleFeedback(msg.id, true)}>
                          👍 {t.yes}
                        </button>
                        <button style={styles.feedbackBtn} onClick={() => handleFeedback(msg.id, false)}>
                          👎 {t.no}
                        </button>
                      </div>
                    )}
                    {feedbackGiven[msg.id] !== undefined && (
                      <div style={{ fontSize: '12px', color: colors.success, marginTop: '8px' }}>
                        ✓ {t.thanksFeedback}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.message, justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.messageBubble, ...styles.messageBubbleBot }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                      {companyName} skriver
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div className="bobot-typing-dot" style={{ width: 6, height: 6, backgroundColor: colors.textTertiary, borderRadius: '50%' }}></div>
                      <div className="bobot-typing-dot" style={{ width: 6, height: 6, backgroundColor: colors.textTertiary, borderRadius: '50%' }}></div>
                      <div className="bobot-typing-dot" style={{ width: 6, height: 6, backgroundColor: colors.textTertiary, borderRadius: '50%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showContact && hasContact && (
              <button style={styles.contactButton} onClick={handleContact}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {t.contactUs}
              </button>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <form style={styles.inputForm} onSubmit={handleSend} role="form" aria-label="Send message">
              <label htmlFor="bobot-input" className="bobot-sr-only">{t.placeholder}</label>
              <input
                id="bobot-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={t.placeholder}
                style={styles.input}
                disabled={loading || needsConsent()}
                className="bobot-input bobot-focusable"
                aria-describedby="bobot-input-hint"
                autoComplete="off"
              />
              <span id="bobot-input-hint" className="bobot-sr-only">
                {loading ? t.typing : t.sendMessage}
              </span>
              <button
                type="submit"
                style={styles.sendButton}
                disabled={loading || !input.trim() || needsConsent()}
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => setSendHover(false)}
                aria-label={t.sendMessage}
                className="bobot-focusable bobot-touch-target"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            {/* Powered by */}
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '10px',
              color: colors.textTertiary,
              opacity: 0.7
            }}>
              Powered by{' '}
              <a
                href="https://bobot.nu"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.textTertiary,
                  textDecoration: 'none',
                  borderBottom: `1px dotted ${colors.textTertiary}`
                }}
              >
                bobot.nu
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        style={styles.button}
        className={`bobot-focusable bobot-touch-target ${!isOpen ? 'bobot-pulse' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen)
          setAnnouncement(isOpen ? t.closeChat : t.openChat)
        }}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        aria-label={isOpen ? t.closeChat : t.openChat}
        aria-expanded={isOpen}
        aria-controls="bobot-chat-window"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>
    </div>
  )
}

// Global init function
window.Bobot = {
  init: function(config) {
    const container = document.createElement('div')
    container.id = 'bobot-widget'
    document.body.appendChild(container)

    const defaultConfig = {
      apiUrl: 'http://localhost:8000',
      companyId: 'demo',
      title: 'Bobot', // Fallback if company name not set
      ...config
    }

    const root = createRoot(container)
    root.render(<ChatWidget config={defaultConfig} />)
  }
}

export default ChatWidget
