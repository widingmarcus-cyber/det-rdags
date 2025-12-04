import React, { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

// Translations
const translations = {
  sv: {
    welcomeMessage: 'Hej! Hur kan jag hjälpa dig idag?',
    fallbackMessage: 'Tyvärr kunde jag inte hitta ett svar. Vänligen kontakta oss direkt.',
    placeholder: 'Skriv ett meddelande...',
    subtitle: 'Alltid redo att hjälpa',
    contactUs: 'Kontakta oss',
    helpful: 'Var detta hjälpsamt?',
    yes: 'Ja',
    no: 'Nej',
    thanksFeedback: 'Tack för din feedback!',
    errorMessage: 'Ett fel uppstod. Vänligen försök igen.',
    serviceUnavailable: 'Chatten är tillfälligt otillgänglig.',
    newConversation: 'Ny konversation',
    lightMode: 'Ljust läge',
    darkMode: 'Mörkt läge',
    consentRequired: 'Samtycke krävs',
    privacyPolicy: 'Integritetspolicy',
    viewMyData: 'Visa min data',
    deleteMyData: 'Radera min data',
    revokeConsent: 'Dra tillbaka samtycke',
    consentGiven: 'Du har gett samtycke',
    consentRevoked: 'Samtycke har återkallats',
    dataDeleted: 'Din data har raderats',
    confirmDelete: 'Är du säker? Detta kan inte ångras.',
    confirmRevoke: 'Vill du dra tillbaka ditt samtycke? Du kan behöva ge samtycke igen för att fortsätta chatta.',
    gdprRights: 'Dina rättigheter',
    dataController: 'Personuppgiftsansvarig',
    gdprContact: 'För GDPR-frågor, kontakta:',
    close: 'Stäng',
    cancel: 'Avbryt',
    confirm: 'Bekräfta',
    noDataFound: 'Ingen data hittades för denna session.',
    yourData: 'Din data',
    openChat: 'Öppna chatt',
    closeChat: 'Stäng chatt',
    sendMessage: 'Skicka',
    typing: 'skriver...',
    today: 'Idag',
    sources: 'Källor',
    showSources: 'Visa källor',
    hideSources: 'Dölj källor',
  },
  en: {
    welcomeMessage: 'Hi! How can I help you today?',
    fallbackMessage: "I couldn't find an answer. Please contact us directly.",
    placeholder: 'Type a message...',
    subtitle: 'Always ready to help',
    contactUs: 'Contact us',
    helpful: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    thanksFeedback: 'Thanks for your feedback!',
    errorMessage: 'An error occurred. Please try again.',
    serviceUnavailable: 'Chat is temporarily unavailable.',
    newConversation: 'New conversation',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    consentRequired: 'Consent required',
    privacyPolicy: 'Privacy policy',
    viewMyData: 'View my data',
    deleteMyData: 'Delete my data',
    revokeConsent: 'Revoke consent',
    consentGiven: 'You have given consent',
    consentRevoked: 'Consent has been revoked',
    dataDeleted: 'Your data has been deleted',
    confirmDelete: 'Are you sure? This cannot be undone.',
    confirmRevoke: 'Do you want to revoke your consent? You may need to give consent again to continue chatting.',
    gdprRights: 'Your rights',
    dataController: 'Data controller',
    gdprContact: 'For GDPR inquiries, contact:',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noDataFound: 'No data found for this session.',
    yourData: 'Your data',
    openChat: 'Open chat',
    closeChat: 'Close chat',
    sendMessage: 'Send',
    typing: 'typing...',
    today: 'Today',
    sources: 'Sources',
    showSources: 'Show sources',
    hideSources: 'Hide sources',
  },
  ar: {
    welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    fallbackMessage: 'لم أتمكن من العثور على إجابة. يرجى الاتصال بنا مباشرة.',
    placeholder: 'اكتب رسالة...',
    subtitle: 'دائماً جاهزون للمساعدة',
    contactUs: 'اتصل بنا',
    helpful: 'هل كان هذا مفيداً؟',
    yes: 'نعم',
    no: 'لا',
    thanksFeedback: 'شكراً على ملاحظاتك!',
    errorMessage: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    serviceUnavailable: 'الدردشة غير متاحة مؤقتاً.',
    newConversation: 'محادثة جديدة',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    consentRequired: 'الموافقة مطلوبة',
    privacyPolicy: 'سياسة الخصوصية',
    viewMyData: 'عرض بياناتي',
    deleteMyData: 'حذف بياناتي',
    revokeConsent: 'سحب الموافقة',
    consentGiven: 'لقد وافقت',
    consentRevoked: 'تم سحب الموافقة',
    dataDeleted: 'تم حذف بياناتك',
    confirmDelete: 'هل أنت متأكد؟ لا يمكن التراجع عن هذا.',
    confirmRevoke: 'هل تريد سحب موافقتك؟ قد تحتاج إلى الموافقة مرة أخرى للاستمرار في الدردشة.',
    gdprRights: 'حقوقك',
    dataController: 'مسؤول البيانات',
    gdprContact: 'لاستفسارات GDPR، تواصل مع:',
    close: 'إغلاق',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    noDataFound: 'لم يتم العثور على بيانات لهذه الجلسة.',
    yourData: 'بياناتك',
    openChat: 'افتح الدردشة',
    closeChat: 'أغلق الدردشة',
    sendMessage: 'إرسال',
    typing: 'يكتب...',
    today: 'اليوم',
    sources: 'المصادر',
    showSources: 'عرض المصادر',
    hideSources: 'إخفاء المصادر',
  }
}

// Detect browser language
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || 'sv'
  const langCode = browserLang.split('-')[0].toLowerCase()
  return translations[langCode] ? langCode : 'sv'
}

// Anthropic-inspired color palette - Light mode
const lightTheme = {
  // Backgrounds
  bg: '#FAFAF9',
  bgElevated: '#FFFFFF',
  bgSubtle: '#F5F5F4',
  bgAccentSoft: 'rgba(217, 119, 87, 0.08)',
  // Bot message - subtle warm background
  bgBot: '#FFFFFF',
  bgBotBorder: '#F0EFEE',
  // Text
  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  textOnAccent: '#FFFFFF',
  // Borders
  border: '#E7E5E4',
  borderSubtle: '#F0EFEE',
  // Accent (used for user messages)
  accent: '#D97757',
  accentHover: '#C4613D',
  accentGlow: 'rgba(217, 119, 87, 0.12)',
  // Feedback
  success: '#22C55E',
  successSoft: '#DCFCE7',
  // Shadows
  shadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 12px 40px rgba(0, 0, 0, 0.08)',
}

// Anthropic-inspired color palette - Dark mode
const darkTheme = {
  bg: '#171412',
  bgElevated: '#1E1B18',
  bgSubtle: '#262320',
  bgAccentSoft: 'rgba(217, 119, 87, 0.12)',
  // Bot message - subtle elevated background
  bgBot: '#262320',
  bgBotBorder: '#3D3835',
  text: '#FAFAF9',
  textSecondary: '#D4D0CC',
  textMuted: '#8A8580',
  textOnAccent: '#FFFFFF',
  border: '#3D3835',
  borderSubtle: '#2E2A27',
  // Accent (used for user messages)
  accent: '#E8886A',
  accentHover: '#F09A7E',
  accentGlow: 'rgba(232, 136, 106, 0.2)',
  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.15)',
  shadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  shadowLg: '0 12px 40px rgba(0, 0, 0, 0.4)',
}

// Generate session ID
function generateSessionId() {
  return 'w-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// LocalStorage helpers
const STORAGE_KEY = 'bobot_'

function loadFromStorage(companyId) {
  try {
    const data = localStorage.getItem(STORAGE_KEY + companyId)
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed
      }
    }
  } catch (e) {}
  return null
}

function saveToStorage(companyId, data) {
  try {
    localStorage.setItem(STORAGE_KEY + companyId, JSON.stringify({ ...data, timestamp: Date.now() }))
  } catch (e) {}
}

function clearStorage(companyId) {
  try { localStorage.removeItem(STORAGE_KEY + companyId) } catch (e) {}
}

// Darken/lighten color
function adjustColor(hex, amount) {
  if (!hex) return '#C4613D'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

// Format time (24-hour format)
function formatTime(date) {
  return new Date(date).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Render text with clickable links
function renderTextWithLinks(text, linkColor) {
  if (!text) return null

  // Pattern to match URLs (http/https/www) and markdown-style links [text](url)
  const urlPattern = /(https?:\/\/[^\s\)]+|www\.[^\s\)]+)/g
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g

  // First, replace markdown links with placeholder
  let processedText = text.replace(markdownLinkPattern, '___MDLINK___$1___URL___$2___ENDLINK___')

  // Split by URLs
  const parts = processedText.split(urlPattern)

  return parts.map((part, i) => {
    // Check if this is a markdown link placeholder
    if (part.startsWith('___MDLINK___')) {
      const match = part.match(/___MDLINK___(.+)___URL___(.+)___ENDLINK___/)
      if (match) {
        const [, linkText, url] = match
        return (
          <a
            key={i}
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: linkColor, textDecoration: 'underline' }}
          >
            {linkText}
          </a>
        )
      }
    }

    // Check if this part is a URL
    if (part.match(/^(https?:\/\/|www\.)/)) {
      const href = part.startsWith('http') ? part : `https://${part}`
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: linkColor, textDecoration: 'underline' }}
        >
          {part}
        </a>
      )
    }

    return part
  })
}

// CSS animations and styles
const injectStyles = (fontFamily, borderRadius) => {
  const id = 'bobot-widget-styles'
  let styleEl = document.getElementById(id)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = id
    document.head.appendChild(styleEl)
  }

  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    @keyframes bobot-fade-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes bobot-msg-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes bobot-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-3px); opacity: 1; }
    }
    @keyframes bobot-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 87, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(217, 119, 87, 0); }
    }

    .bobot-widget * {
      box-sizing: border-box;
      font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .bobot-widget-window {
      animation: bobot-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bobot-msg { animation: bobot-msg-in 0.2s ease-out; }
    .bobot-dot { animation: bobot-dot 1.4s infinite; }
    .bobot-dot:nth-child(2) { animation-delay: 0.15s; }
    .bobot-dot:nth-child(3) { animation-delay: 0.3s; }
    .bobot-glow { animation: bobot-glow 2s infinite; }

    .bobot-widget button:focus-visible,
    .bobot-widget input:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .bobot-widget ::-webkit-scrollbar {
      width: 6px;
    }
    .bobot-widget ::-webkit-scrollbar-track {
      background: transparent;
    }
    .bobot-widget ::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 3px;
    }
    .bobot-widget ::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.25);
    }

    @media (max-width: 480px) {
      .bobot-widget-window {
        width: calc(100vw - 24px) !important;
        height: 80vh !important;
        max-height: 600px !important;
        bottom: 72px !important;
        right: 12px !important;
        left: 12px !important;
        border-radius: ${borderRadius}px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .bobot-widget *, .bobot-widget-window, .bobot-msg, .bobot-dot {
        animation: none !important;
        transition: none !important;
      }
    }

    [dir="rtl"] .bobot-widget input { text-align: right; }
  `
}

function ChatWidget({ config }) {
  const [isOpen, setIsOpen] = useState(config.startExpanded || false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => generateSessionId())
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [widgetConfig, setWidgetConfig] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )
  const [consentGiven, setConsentGiven] = useState(false)
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false)
  const [showGdprModal, setShowGdprModal] = useState(null) // 'view', 'delete', 'revoke', or null
  const [gdprData, setGdprData] = useState(null)
  const [gdprLoading, setGdprLoading] = useState(false)
  const [gdprMessage, setGdprMessage] = useState(null)
  const [expandedSources, setExpandedSources] = useState({}) // Track which messages have expanded sources

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const theme = darkMode ? darkTheme : lightTheme
  const lang = detectLanguage()
  const t = translations[lang]
  const isRTL = lang === 'ar'

  // Get config values with defaults
  const primaryColor = widgetConfig?.primary_color || theme.accent
  const fontFamily = widgetConfig?.font_family || 'Inter'
  const fontSize = widgetConfig?.font_size || 14
  const borderRadius = widgetConfig?.border_radius || 16
  const position = widgetConfig?.position || 'bottom-right'
  const companyName = widgetConfig?.widget_name || widgetConfig?.company_name || 'Assistent'
  const subtitle = widgetConfig?.subtitle || t.subtitle
  const suggestedQuestions = widgetConfig?.suggested_questions || []

  // Inject styles with config values
  useEffect(() => {
    injectStyles(fontFamily, borderRadius)
  }, [fontFamily, borderRadius])

  // Fetch config and restore conversation
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Use widget-specific config if widgetKey is provided, otherwise use company config
        const configUrl = config.widgetKey
          ? `${config.apiUrl}/widget/key/${config.widgetKey}/config`
          : `${config.apiUrl}/widget/${config.companyId}/config`
        const res = await fetch(configUrl)
        if (res.ok) {
          const data = await res.json()
          setWidgetConfig(data)

          // Check stored consent
          if (localStorage.getItem(`bobot_consent_${config.companyId}`) === 'true') {
            setConsentGiven(true)
          }

          // Restore conversation
          const saved = loadFromStorage(config.companyId)
          if (saved?.messages?.length > 1) {
            setMessages(saved.messages)
            if (saved.sessionId) setSessionId(saved.sessionId)
            if (saved.conversationId) setConversationId(saved.conversationId)
            if (saved.feedbackGiven) setFeedbackGiven(saved.feedbackGiven)
          } else {
            setMessages([{ id: 0, type: 'bot', text: data.welcome_message || t.welcomeMessage, time: Date.now() }])
          }
        } else {
          setMessages([{ id: 0, type: 'bot', text: t.welcomeMessage, time: Date.now() }])
        }
      } catch (e) {
        setMessages([{ id: 0, type: 'bot', text: t.welcomeMessage, time: Date.now() }])
      }
    }
    fetchConfig()
  }, [])

  // Save conversation
  useEffect(() => {
    if (messages.length > 1 && widgetConfig) {
      saveToStorage(config.companyId, { messages, sessionId, conversationId, feedbackGiven })
    }
  }, [messages, sessionId, conversationId, feedbackGiven])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !needsConsent()) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, consentGiven])

  // Escape to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (showMenu) setShowMenu(false)
        else if (isOpen) setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, showMenu])

  const needsConsent = () => {
    if (!widgetConfig?.require_consent) return false
    return !consentGiven
  }

  const giveConsent = async () => {
    try {
      await fetch(`${config.apiUrl}/gdpr/${config.companyId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, consent_given: true })
      })
    } catch (e) {}
    localStorage.setItem(`bobot_consent_${config.companyId}`, 'true')
    setConsentGiven(true)
  }

  // GDPR Rights: View my data
  const handleViewData = async () => {
    setGdprLoading(true)
    setGdprData(null)
    setGdprMessage(null)
    try {
      const res = await fetch(`${config.apiUrl}/gdpr/${config.companyId}/my-data?session_id=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setGdprData(data)
      } else {
        setGdprMessage(t.noDataFound)
      }
    } catch (e) {
      setGdprMessage(t.errorMessage)
    }
    setGdprLoading(false)
  }

  // GDPR Rights: Delete my data
  const handleDeleteData = async () => {
    setGdprLoading(true)
    setGdprMessage(null)
    try {
      const res = await fetch(`${config.apiUrl}/gdpr/${config.companyId}/my-data?session_id=${sessionId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setGdprMessage(t.dataDeleted)
        // Clear local data
        clearStorage(config.companyId)
        setMessages([{ id: 0, type: 'bot', text: widgetConfig?.welcome_message || t.welcomeMessage, time: Date.now() }])
        setSessionId(generateSessionId())
        setConversationId(null)
        setFeedbackGiven({})
        setHasUserSentMessage(false)
        setTimeout(() => {
          setShowGdprModal(null)
          setGdprMessage(null)
        }, 2000)
      } else {
        setGdprMessage(t.errorMessage)
      }
    } catch (e) {
      setGdprMessage(t.errorMessage)
    }
    setGdprLoading(false)
  }

  // GDPR Rights: Revoke consent
  const handleRevokeConsent = async () => {
    setGdprLoading(true)
    setGdprMessage(null)
    try {
      await fetch(`${config.apiUrl}/gdpr/${config.companyId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, consent_given: false })
      })
      localStorage.removeItem(`bobot_consent_${config.companyId}`)
      setConsentGiven(false)
      setGdprMessage(t.consentRevoked)
      setTimeout(() => {
        setShowGdprModal(null)
        setGdprMessage(null)
      }, 2000)
    } catch (e) {
      setGdprMessage(t.errorMessage)
    }
    setGdprLoading(false)
  }

  const startNewConversation = () => {
    clearStorage(config.companyId)
    setMessages([{ id: 0, type: 'bot', text: widgetConfig?.welcome_message || t.welcomeMessage, time: Date.now() }])
    setSessionId(generateSessionId())
    setConversationId(null)
    setFeedbackGiven({})
    setHasUserSentMessage(false)
    setShowMenu(false)
  }

  const handleSend = async (e, suggestedText = null) => {
    if (e) e.preventDefault()
    const text = (suggestedText || input).trim()
    if (!text || loading) return

    const userMsgId = Date.now()
    setInput('')
    setHasUserSentMessage(true)
    setMessages(prev => [...prev, { id: userMsgId, type: 'user', text, time: userMsgId }])
    setLoading(true)

    try {
      const res = await fetch(`${config.apiUrl}/chat/${config.companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          session_id: sessionId,
          language: lang,
          widget_key: config.widgetKey || null  // Pass widget key for personalized responses
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.conversation_id) setConversationId(data.conversation_id)

        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          text: data.answer,
          hadAnswer: data.had_answer,
          confidence: data.confidence || 100,
          sources: data.sources_detail || [], // Store detailed sources for display
          time: Date.now()
        }])
      } else {
        throw new Error('Request failed')
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: widgetConfig?.fallback_message || t.fallbackMessage,
        time: Date.now()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (msgId, helpful) => {
    setFeedbackGiven(prev => ({ ...prev, [msgId]: helpful }))
    try {
      await fetch(`${config.apiUrl}/chat/${config.companyId}/feedback?session_id=${sessionId}&helpful=${helpful}`, {
        method: 'POST'
      })
    } catch (e) {}
  }

  const isLeft = position === 'bottom-left'

  return (
    <div
      className="bobot-widget"
      style={{
        position: 'fixed',
        bottom: 20,
        [isLeft ? 'left' : 'right']: 20,
        zIndex: 99999,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {isOpen && (
        <div
          className="bobot-widget-window"
          style={{
            position: 'absolute',
            bottom: 64,
            [isLeft ? 'left' : 'right']: 0,
            width: 380,
            height: 560,
            borderRadius: borderRadius,
            boxShadow: theme.shadowLg,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%)`,
            color: theme.textOnAccent,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderTopLeftRadius: borderRadius - 1,
            borderTopRightRadius: borderRadius - 1,
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: fontSize + 2, letterSpacing: '-0.01em' }}>{companyName}</div>
              <div style={{ fontSize: fontSize - 2, opacity: 0.85, marginTop: 2 }}>{subtitle}</div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? t.lightMode : t.darkMode}
              style={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 8,
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 8,
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 8,
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: 60,
                right: 16,
                background: theme.bgElevated,
                borderRadius: 12,
                boxShadow: theme.shadowLg,
                border: `1px solid ${theme.border}`,
                minWidth: 180,
                overflow: 'hidden',
                zIndex: 10,
              }}>
                <button onClick={startNewConversation} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 14px', border: 'none', background: 'transparent',
                  cursor: 'pointer', color: theme.text, fontSize: fontSize - 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {t.newConversation}
                </button>
                {widgetConfig?.privacy_policy_url && (
                  <>
                    <div style={{ height: 1, background: theme.border }}/>
                    <a href={widgetConfig.privacy_policy_url} target="_blank" rel="noopener" style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '12px 14px', textDecoration: 'none', color: theme.text, fontSize: fontSize - 1,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {t.privacyPolicy}
                    </a>
                  </>
                )}
                {/* GDPR Rights Section */}
                <div style={{ height: 1, background: theme.border }}/>
                <div style={{ padding: '8px 14px', color: theme.textMuted, fontSize: fontSize - 2, fontWeight: 500 }}>
                  {t.gdprRights}
                </div>
                <button onClick={() => { setShowGdprModal('view'); setShowMenu(false); handleViewData(); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 14px', border: 'none', background: 'transparent',
                  cursor: 'pointer', color: theme.text, fontSize: fontSize - 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {t.viewMyData}
                </button>
                <button onClick={() => { setShowGdprModal('delete'); setShowMenu(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 14px', border: 'none', background: 'transparent',
                  cursor: 'pointer', color: theme.text, fontSize: fontSize - 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  {t.deleteMyData}
                </button>
                {consentGiven && (
                  <button onClick={() => { setShowGdprModal('revoke'); setShowMenu(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '12px 14px', border: 'none', background: 'transparent',
                    cursor: 'pointer', color: theme.text, fontSize: fontSize - 1,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {t.revokeConsent}
                  </button>
                )}
                {/* Data Controller Info */}
                {(widgetConfig?.data_controller_name || widgetConfig?.data_controller_email) && (
                  <>
                    <div style={{ height: 1, background: theme.border }}/>
                    <div style={{ padding: '12px 14px', fontSize: fontSize - 2 }}>
                      <div style={{ color: theme.textMuted, marginBottom: 4 }}>{t.gdprContact}</div>
                      {widgetConfig?.data_controller_name && (
                        <div style={{ color: theme.text, fontWeight: 500 }}>{widgetConfig.data_controller_name}</div>
                      )}
                      {widgetConfig?.data_controller_email && (
                        <a href={`mailto:${widgetConfig.data_controller_email}`} style={{ color: primaryColor, textDecoration: 'none' }}>
                          {widgetConfig.data_controller_email}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Consent Dialog */}
          {needsConsent() && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 20, borderRadius: borderRadius,
            }}>
              <div style={{
                background: theme.bgElevated, borderRadius: 16, padding: 24,
                margin: 20, maxWidth: 300, boxShadow: theme.shadowLg,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: theme.bgAccentSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 12px', fontSize: fontSize + 2, fontWeight: 600, textAlign: 'center', color: theme.text }}>
                  {t.consentRequired}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: fontSize - 1, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.5 }}>
                  {widgetConfig?.consent_text || t.consentRequired}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={giveConsent} style={{
                    flex: 1, padding: '12px 16px', background: primaryColor, color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: fontSize, fontWeight: 500, cursor: 'pointer',
                  }}>
                    {t.yes}
                  </button>
                  <button onClick={() => setIsOpen(false)} style={{
                    flex: 1, padding: '12px 16px', background: 'transparent', color: theme.textSecondary,
                    border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: fontSize, cursor: 'pointer',
                  }}>
                    {t.no}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GDPR Modal */}
          {showGdprModal && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 20, borderRadius: borderRadius,
            }}>
              <div style={{
                background: theme.bgElevated, borderRadius: 16, padding: 24,
                margin: 20, maxWidth: 340, width: '100%', boxShadow: theme.shadowLg,
                maxHeight: '80%', overflow: 'auto',
              }}>
                {/* View Data Modal */}
                {showGdprModal === 'view' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: fontSize + 2, fontWeight: 600, color: theme.text }}>
                        {t.yourData}
                      </h3>
                      <button onClick={() => { setShowGdprModal(null); setGdprData(null); }} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 4,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    {gdprLoading && (
                      <div style={{ textAlign: 'center', padding: 20, color: theme.textSecondary }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                          <span className="bobot-dot" style={{ width: 6, height: 6, background: primaryColor, borderRadius: '50%' }}/>
                          <span className="bobot-dot" style={{ width: 6, height: 6, background: primaryColor, borderRadius: '50%' }}/>
                          <span className="bobot-dot" style={{ width: 6, height: 6, background: primaryColor, borderRadius: '50%' }}/>
                        </div>
                      </div>
                    )}
                    {gdprMessage && (
                      <p style={{ color: theme.textSecondary, textAlign: 'center', fontSize: fontSize - 1 }}>{gdprMessage}</p>
                    )}
                    {gdprData && !gdprLoading && (
                      <div style={{ fontSize: fontSize - 1 }}>
                        {gdprData.data ? (
                          <>
                            <div style={{ marginBottom: 12 }}>
                              <span style={{ color: theme.textMuted }}>Konversation:</span>
                              <span style={{ color: theme.text, marginLeft: 8, fontFamily: 'monospace', fontSize: fontSize - 2 }}>{gdprData.data.conversation_id}</span>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                              <span style={{ color: theme.textMuted }}>{t.consentGiven}:</span>
                              <span style={{ color: theme.text, marginLeft: 8 }}>{gdprData.data.consent_given ? t.yes : t.no}</span>
                            </div>
                            {gdprData.data.started_at && (
                              <div style={{ marginBottom: 12 }}>
                                <span style={{ color: theme.textMuted }}>Startad:</span>
                                <span style={{ color: theme.text, marginLeft: 8 }}>{new Date(gdprData.data.started_at).toLocaleString('sv-SE')}</span>
                              </div>
                            )}
                            {gdprData.data.messages?.length > 0 && (
                              <div>
                                <div style={{ color: theme.textMuted, marginBottom: 8 }}>Meddelanden ({gdprData.data.messages.length}):</div>
                                <div style={{ maxHeight: 200, overflowY: 'auto', background: theme.bg, borderRadius: 8, padding: 8 }}>
                                  {gdprData.data.messages.map((msg, i) => (
                                    <div key={i} style={{ marginBottom: 8, padding: 8, background: theme.bgElevated, borderRadius: 6, fontSize: fontSize - 2 }}>
                                      <div style={{ color: msg.role === 'user' ? primaryColor : theme.textSecondary, fontWeight: 500 }}>
                                        {msg.role === 'user' ? 'Du' : 'Bot'}
                                      </div>
                                      <div style={{ color: theme.text, marginTop: 4 }}>{msg.content}</div>
                                      {msg.timestamp && (
                                        <div style={{ color: theme.textMuted, fontSize: fontSize - 3, marginTop: 4 }}>
                                          {new Date(msg.timestamp).toLocaleString('sv-SE')}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {gdprData.data_controller && (
                              <div style={{ marginTop: 16, padding: 12, background: theme.bgSubtle, borderRadius: 8, fontSize: fontSize - 2 }}>
                                <div style={{ color: theme.textMuted, marginBottom: 4 }}>Personuppgiftsansvarig:</div>
                                <div style={{ color: theme.text }}>{gdprData.data_controller.company}</div>
                                <div style={{ color: theme.textMuted, marginTop: 4 }}>
                                  Data raderas efter {gdprData.data_controller.retention_days} dagar
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ textAlign: 'center', color: theme.textSecondary, padding: 16 }}>
                            {gdprData.message || t.noDataFound}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Delete Data Modal */}
                {showGdprModal === 'delete' && (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontSize: fontSize + 2, fontWeight: 600, textAlign: 'center', color: theme.text }}>
                      {t.deleteMyData}
                    </h3>
                    {gdprMessage ? (
                      <p style={{ color: '#22c55e', textAlign: 'center', fontSize: fontSize - 1 }}>{gdprMessage}</p>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 20px', fontSize: fontSize - 1, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.5 }}>
                          {t.confirmDelete}
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={handleDeleteData} disabled={gdprLoading} style={{
                            flex: 1, padding: '12px 16px', background: '#ef4444', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: fontSize, fontWeight: 500, cursor: 'pointer',
                            opacity: gdprLoading ? 0.7 : 1,
                          }}>
                            {gdprLoading ? '...' : t.confirm}
                          </button>
                          <button onClick={() => setShowGdprModal(null)} style={{
                            flex: 1, padding: '12px 16px', background: 'transparent', color: theme.textSecondary,
                            border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: fontSize, cursor: 'pointer',
                          }}>
                            {t.cancel}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Revoke Consent Modal */}
                {showGdprModal === 'revoke' && (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontSize: fontSize + 2, fontWeight: 600, textAlign: 'center', color: theme.text }}>
                      {t.revokeConsent}
                    </h3>
                    {gdprMessage ? (
                      <p style={{ color: '#22c55e', textAlign: 'center', fontSize: fontSize - 1 }}>{gdprMessage}</p>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 20px', fontSize: fontSize - 1, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.5 }}>
                          {t.confirmRevoke}
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={handleRevokeConsent} disabled={gdprLoading} style={{
                            flex: 1, padding: '12px 16px', background: '#f59e0b', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: fontSize, fontWeight: 500, cursor: 'pointer',
                            opacity: gdprLoading ? 0.7 : 1,
                          }}>
                            {gdprLoading ? '...' : t.confirm}
                          </button>
                          <button onClick={() => setShowGdprModal(null)} style={{
                            flex: 1, padding: '12px 16px', background: 'transparent', color: theme.textSecondary,
                            border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: fontSize, cursor: 'pointer',
                          }}>
                            {t.cancel}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 16, background: theme.bg,
            width: '100%', boxSizing: 'border-box', minWidth: 0,
          }}>
            {messages.map((msg, i) => (
              <div key={msg.id} className="bobot-msg" style={{
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
                alignItems: msg.type === 'user' ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
              }}>
                <div style={{
                  maxWidth: '85%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  padding: '12px 16px',
                  borderRadius: borderRadius - 4,
                  fontSize: fontSize,
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                  // User messages: accent gradient with white text
                  // Bot messages: subtle background with border
                  background: msg.type === 'user'
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%)`
                    : theme.bgBot,
                  color: msg.type === 'user' ? theme.textOnAccent : theme.text,
                  border: msg.type === 'bot' ? `1px solid ${theme.bgBotBorder}` : 'none',
                  boxShadow: msg.type === 'user' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  borderBottomRightRadius: msg.type === 'user' && !isRTL ? 4 : borderRadius - 4,
                  borderBottomLeftRadius: msg.type === 'user' && isRTL ? 4 : (msg.type === 'bot' && !isRTL ? 4 : borderRadius - 4),
                }}>
                  {msg.type === 'bot' ? renderTextWithLinks(msg.text, primaryColor) : msg.text}

                  {/* Sources section for bot messages */}
                  {msg.type === 'bot' && msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        onClick={() => setExpandedSources(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 10px',
                          fontSize: fontSize - 2,
                          background: theme.bgAccentSoft,
                          color: primaryColor,
                          border: `1px solid ${primaryColor}30`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.15s',
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            transform: expandedSources[msg.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.15s'
                          }}
                        >
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                        {t.sources} ({msg.sources.length})
                      </button>

                      {expandedSources[msg.id] && (
                        <div style={{
                          marginTop: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}>
                          {msg.sources.map((source, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: 10,
                                background: theme.bg,
                                borderRadius: 8,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              <div style={{
                                fontSize: fontSize - 2,
                                fontWeight: 500,
                                color: primaryColor,
                                marginBottom: 6,
                              }}>
                                {source.question}
                              </div>
                              <div style={{
                                fontSize: fontSize - 2,
                                color: theme.textSecondary,
                                lineHeight: 1.5,
                              }}>
                                {source.answer}
                              </div>
                              {source.category && (
                                <div style={{
                                  marginTop: 6,
                                  fontSize: fontSize - 3,
                                  color: theme.textMuted,
                                  display: 'inline-block',
                                  padding: '2px 6px',
                                  background: theme.bgSubtle,
                                  borderRadius: 4,
                                }}>
                                  {source.category}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback for bot messages */}
                  {msg.type === 'bot' && msg.id !== 0 && !feedbackGiven[msg.id] && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
                      paddingTop: 10, borderTop: `1px solid ${theme.border}`,
                    }}>
                      <span style={{ fontSize: fontSize - 2, color: theme.textMuted }}>{t.helpful}</span>
                      <button onClick={() => handleFeedback(msg.id, true)} style={{
                        padding: '4px 10px', fontSize: fontSize - 2, border: `1px solid ${theme.border}`,
                        borderRadius: 14, background: 'transparent', cursor: 'pointer', color: theme.textSecondary,
                      }}>👍</button>
                      <button onClick={() => handleFeedback(msg.id, false)} style={{
                        padding: '4px 10px', fontSize: fontSize - 2, border: `1px solid ${theme.border}`,
                        borderRadius: 14, background: 'transparent', cursor: 'pointer', color: theme.textSecondary,
                      }}>👎</button>
                    </div>
                  )}
                  {feedbackGiven[msg.id] !== undefined && (
                    <div style={{ fontSize: fontSize - 2, color: theme.success, marginTop: 8 }}>
                      ✓ {t.thanksFeedback}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                {msg.time && i > 0 && (
                  <div style={{
                    fontSize: fontSize - 4, color: theme.textMuted, marginTop: 4,
                    paddingLeft: 4, paddingRight: 4,
                  }}>
                    {formatTime(msg.time)}
                  </div>
                )}
              </div>
            ))}

            {/* Suggested Questions */}
            {!hasUserSentMessage && suggestedQuestions.length > 0 && !loading && (
              <div className="bobot-msg" style={{
                marginBottom: 16,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: isRTL ? 'flex-end' : 'flex-start',
              }}>
                {suggestedQuestions.slice(0, 4).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(null, question)}
                    style={{
                      padding: '8px 14px',
                      fontSize: fontSize - 1,
                      background: theme.bgAccentSoft,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}30`,
                      borderRadius: borderRadius - 6,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = `${primaryColor}20`
                      e.target.style.borderColor = primaryColor
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = theme.bgAccentSoft
                      e.target.style.borderColor = `${primaryColor}30`
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div className="bobot-msg" style={{ marginBottom: 16 }}>
                <div style={{
                  padding: '14px 18px', borderRadius: borderRadius - 4,
                  background: theme.bgBot, border: `1px solid ${theme.borderSubtle}`,
                  borderBottomLeftRadius: isRTL ? borderRadius - 4 : 4,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: fontSize - 1, color: theme.textSecondary }}>{companyName}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div className="bobot-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: theme.textMuted }}/>
                    <div className="bobot-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: theme.textMuted }}/>
                    <div className="bobot-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: theme.textMuted }}/>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: 12,
            borderTop: `1px solid ${theme.border}`,
            background: theme.bgSubtle,
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                disabled={loading || needsConsent()}
                style={{
                  flex: 1, padding: '12px 16px', border: `1px solid ${theme.border}`,
                  borderRadius: borderRadius, fontSize: fontSize, outline: 'none',
                  background: theme.bgElevated, color: theme.text,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = primaryColor
                  e.target.style.boxShadow = `0 0 0 3px ${theme.accentGlow}`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.border
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none',
                  background: loading || !input.trim() ? theme.textMuted : primaryColor,
                  color: '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (input.trim()) e.target.style.transform = 'scale(1.05)' }}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </form>

            {/* Powered by */}
            <div style={{
              textAlign: 'center', marginTop: 10, fontSize: fontSize - 4, color: theme.textMuted,
            }}>
              Powered by <a href="https://bobot.nu" target="_blank" rel="noopener" style={{
                color: theme.textMuted, textDecoration: 'none', borderBottom: `1px dotted ${theme.textMuted}`,
              }}>Bobot</a>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? '' : 'bobot-glow'}
        style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%)`,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: theme.shadow,
          transition: 'transform 0.2s',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        aria-label={isOpen ? t.closeChat : t.openChat}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          /* Mini Bobot Mascot - matching landing page style */
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
            {/* Eyes - dark screens */}
            <ellipse cx="19" cy="13.5" rx="4.5" ry="4" fill="#1C1917" />
            <ellipse cx="29" cy="13.5" rx="4.5" ry="4" fill="#1C1917" />
            <ellipse cx="19" cy="13.5" rx="3.5" ry="3" fill="#292524" />
            <ellipse cx="29" cy="13.5" rx="3.5" ry="3" fill="#292524" />
            {/* Pupils - use primary color */}
            <ellipse cx="19" cy="14" rx="2" ry="2" fill={primaryColor}>
              <animate attributeName="ry" values="2;0.2;2;2;2" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
            </ellipse>
            <ellipse cx="29" cy="14" rx="2" ry="2" fill={primaryColor}>
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
    </div>
  )
}

// Global init
window.Bobot = {
  init: function(config) {
    const container = document.createElement('div')
    container.id = 'bobot-widget-root'
    document.body.appendChild(container)

    createRoot(container).render(
      <ChatWidget config={{
        apiUrl: 'http://localhost:8000',
        companyId: 'demo',
        ...config
      }} />
    )
  }
}

export default ChatWidget
