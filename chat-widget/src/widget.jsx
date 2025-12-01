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

// Design tokens
const defaultColors = {
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

// Generate session ID
function generateSessionId() {
  return 'widget-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11)
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

// CSS animations
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
  `
  document.head.appendChild(styleSheet)
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
  const [sessionId] = useState(() => generateSessionId())
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [companyConfig, setCompanyConfig] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  // Auto-detect language from browser
  const lang = detectLanguage()
  const t = translations[lang] || translations.sv
  const isRTL = lang === 'ar'

  // Fetch company config from backend
  useEffect(() => {
    injectStyles()
    fetchCompanyConfig()
  }, [])

  const fetchCompanyConfig = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/widget/${config.companyId}/config`)
      if (response.ok) {
        const data = await response.json()
        setCompanyConfig(data)
        // Set welcome message
        const welcomeMsg = data.welcome_message || t.welcomeMessage
        setMessages([{ id: 0, type: 'bot', text: welcomeMsg }])
      } else {
        // Fallback to default welcome
        setMessages([{ id: 0, type: 'bot', text: t.welcomeMessage }])
      }
    } catch (error) {
      console.log('Could not fetch company config')
      setMessages([{ id: 0, type: 'bot', text: t.welcomeMessage }])
    }
  }

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
          hadAnswer: data.had_answer
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
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: t.errorMessage
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
  const hasContact = companyConfig?.contact_email || companyConfig?.contact_phone

  // Styles
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
      boxShadow: defaultColors.shadowLg,
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
      backgroundColor: defaultColors.bgTertiary,
      borderRadius: '16px',
      boxShadow: defaultColors.shadowLg,
      border: `1px solid ${defaultColors.borderSubtle}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'bobot-slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    header: {
      background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
      color: defaultColors.textInverse,
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
      color: defaultColors.textInverse,
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
      backgroundColor: defaultColors.bgSecondary,
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
      backgroundColor: defaultColors.bgChatUser,
      color: defaultColors.textPrimary,
      borderBottomRightRadius: isRTL ? '12px' : '4px',
      borderBottomLeftRadius: isRTL ? '4px' : '12px',
    },
    messageBubbleBot: {
      backgroundColor: defaultColors.bgChatBot,
      color: defaultColors.textPrimary,
      border: `1px solid ${defaultColors.borderSubtle}`,
      borderBottomLeftRadius: isRTL ? '12px' : '4px',
      borderBottomRightRadius: isRTL ? '4px' : '12px',
    },
    feedbackButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: `1px solid ${defaultColors.borderSubtle}`,
    },
    feedbackBtn: {
      padding: '4px 12px',
      fontSize: '12px',
      border: `1px solid ${defaultColors.border}`,
      borderRadius: '16px',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: defaultColors.textSecondary,
      transition: 'all 0.15s ease',
    },
    inputArea: {
      padding: '12px',
      borderTop: `1px solid ${defaultColors.borderSubtle}`,
      backgroundColor: defaultColors.bgSecondary,
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
      border: `1px solid ${inputFocused ? primaryColor : defaultColors.borderSubtle}`,
      borderRadius: '24px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: defaultColors.bgTertiary,
      color: defaultColors.textPrimary,
      transition: 'all 0.2s ease',
      boxShadow: inputFocused ? `0 0 0 3px ${defaultColors.accentGlow}` : 'none',
      textAlign: isRTL ? 'right' : 'left',
    },
    sendButton: {
      width: '40px',
      height: '40px',
      backgroundColor: primaryColor,
      color: defaultColors.textInverse,
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
      border: `1px solid ${defaultColors.border}`,
      borderRadius: '8px',
      color: defaultColors.textSecondary,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
  }

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow} className="bobot-widget-window">
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
                {conversationId ? `${t.subtitle} • ${conversationId}` : t.subtitle}
              </p>
            </div>
            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
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

                    {/* Feedback buttons for bot messages */}
                    {msg.type === 'bot' && msg.id !== 0 && !feedbackGiven[msg.id] && (
                      <div style={styles.feedbackButtons}>
                        <span style={{ fontSize: '12px', color: defaultColors.textTertiary }}>{t.helpful}</span>
                        <button style={styles.feedbackBtn} onClick={() => handleFeedback(msg.id, true)}>
                          👍 {t.yes}
                        </button>
                        <button style={styles.feedbackBtn} onClick={() => handleFeedback(msg.id, false)}>
                          👎 {t.no}
                        </button>
                      </div>
                    )}
                    {feedbackGiven[msg.id] !== undefined && (
                      <div style={{ fontSize: '12px', color: defaultColors.success, marginTop: '8px' }}>
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
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div className="bobot-typing-dot" style={{ width: 8, height: 8, backgroundColor: defaultColors.textTertiary, borderRadius: '50%' }}></div>
                    <div className="bobot-typing-dot" style={{ width: 8, height: 8, backgroundColor: defaultColors.textTertiary, borderRadius: '50%' }}></div>
                    <div className="bobot-typing-dot" style={{ width: 8, height: 8, backgroundColor: defaultColors.textTertiary, borderRadius: '50%' }}></div>
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
            <form style={styles.inputForm} onSubmit={handleSend}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={t.placeholder}
                style={styles.input}
                disabled={loading}
                className="bobot-input"
              />
              <button
                type="submit"
                style={styles.sendButton}
                disabled={loading || !input.trim()}
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => setSendHover(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        style={styles.button}
        className={!isOpen ? 'bobot-pulse' : ''}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
