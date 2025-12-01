import React, { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

// Design tokens from specification
const colors = {
  // Backgrounds
  bgPrimary: '#FAFAFA',
  bgSecondary: '#F5F5F4',
  bgTertiary: '#FFFFFF',
  bgChatUser: '#F0EBE3',
  bgChatBot: '#FFFFFF',
  // Text
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#A8A29E',
  textInverse: '#FAFAFA',
  // Accent (warm terracotta)
  accent: '#D97757',
  accentHover: '#C4613D',
  accentSoft: '#FEF2EE',
  accentGlow: 'rgba(217, 119, 87, 0.15)',
  // Borders
  borderSubtle: '#E7E5E4',
  border: '#D6D3D1',
  // Shadows
  shadowSm: '0 1px 2px rgba(28, 25, 23, 0.04)',
  shadowMd: '0 4px 12px rgba(28, 25, 23, 0.06)',
  shadowLg: '0 12px 32px rgba(28, 25, 23, 0.08)',
}

// Inline styles
const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  button: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `${colors.shadowLg}, 0 0 0 0 rgba(217, 119, 87, 0.4)`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  buttonHover: {
    transform: 'scale(1.05)',
    boxShadow: `${colors.shadowLg}, 0 0 0 8px rgba(217, 119, 87, 0.15)`,
  },
  chatWindow: {
    position: 'absolute',
    bottom: '70px',
    right: '0',
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
    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
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
    backdropFilter: 'blur(8px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: '16px',
    margin: 0,
    letterSpacing: '-0.01em',
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
    transition: 'background 0.15s ease',
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
  messageUser: {
    justifyContent: 'flex-end',
  },
  messageBot: {
    justifyContent: 'flex-start',
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
    borderBottomRightRadius: '4px',
  },
  messageBubbleBot: {
    backgroundColor: colors.bgChatBot,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderSubtle}`,
    borderBottomLeftRadius: '4px',
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
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: colors.bgTertiary,
    color: colors.textPrimary,
    transition: 'all 0.2s ease',
  },
  inputFocus: {
    borderColor: colors.accent,
    boxShadow: `0 0 0 3px ${colors.accentGlow}`,
  },
  sendButton: {
    width: '40px',
    height: '40px',
    backgroundColor: colors.accent,
    color: colors.textInverse,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  sendButtonHover: {
    backgroundColor: colors.accentHover,
    transform: 'scale(1.05)',
  },
  typing: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: colors.textTertiary,
    borderRadius: '50%',
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
    transition: 'all 0.15s ease',
  },
}

// CSS animations
const injectStyles = () => {
  if (document.getElementById('bobot-styles')) return

  const styleSheet = document.createElement('style')
  styleSheet.id = 'bobot-styles'
  styleSheet.textContent = `
    @keyframes bobot-slideUp {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes bobot-messageIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bobot-bounce {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }

    @keyframes bobot-pulse {
      0%, 100% {
        box-shadow: 0 12px 32px rgba(28, 25, 23, 0.08), 0 0 0 0 rgba(217, 119, 87, 0.4);
      }
      50% {
        box-shadow: 0 12px 32px rgba(28, 25, 23, 0.08), 0 0 0 12px rgba(217, 119, 87, 0);
      }
    }

    .bobot-typing-dot {
      animation: bobot-bounce 1.4s infinite;
    }
    .bobot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .bobot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    .bobot-pulse {
      animation: bobot-pulse 2s infinite;
    }

    @media (max-width: 480px) {
      .bobot-widget-window {
        width: calc(100vw - 32px) !important;
        height: 85vh !important;
        bottom: 68px !important;
        right: -8px !important;
      }
    }
  `
  document.head.appendChild(styleSheet)
}

function ChatWidget({ config }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'bot', text: config.welcomeMessage || 'Hej! Hur kan jag hjälpa dig?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [buttonHover, setButtonHover] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [sendHover, setSendHover] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    injectStyles()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setLoading(true)
    setShowContact(false)

    try {
      const response = await fetch(`${config.apiUrl}/chat/${config.companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { type: 'bot', text: data.answer }])
        // Show contact button if answer indicates uncertainty
        if (data.answer.includes('osäker') || data.answer.includes('kontakta')) {
          setShowContact(true)
        }
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: config.fallbackMessage || 'Tyvärr kunde jag inte svara just nu. Vänligen kontakta oss direkt.'
        }])
        setShowContact(true)
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Ett fel uppstod. Vänligen försök igen eller kontakta oss.'
      }])
      setShowContact(true)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (config.contactEmail) {
      window.location.href = `mailto:${config.contactEmail}`
    } else if (config.contactPhone) {
      window.location.href = `tel:${config.contactPhone}`
    }
  }

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow} className="bobot-widget-window">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={styles.headerText}>
              <p style={styles.headerTitle}>{config.title || 'Bobot'}</p>
              <p style={styles.headerSubtitle}>Alltid redo att hjälpa</p>
            </div>
            <button
              style={styles.closeButton}
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  ...(msg.type === 'user' ? styles.messageUser : styles.messageBot)
                }}
              >
                <div style={{
                  ...styles.messageBubble,
                  ...(msg.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot)
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.message, ...styles.messageBot }}>
                <div style={{ ...styles.messageBubble, ...styles.messageBubbleBot }}>
                  <div style={styles.typing}>
                    <div className="bobot-typing-dot" style={styles.typingDot}></div>
                    <div className="bobot-typing-dot" style={styles.typingDot}></div>
                    <div className="bobot-typing-dot" style={styles.typingDot}></div>
                  </div>
                </div>
              </div>
            )}
            {showContact && (config.contactEmail || config.contactPhone) && (
              <button
                style={styles.contactButton}
                onClick={handleContact}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.accentSoft
                  e.target.style.borderColor = colors.accent
                  e.target.style.color = colors.accent
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = colors.border
                  e.target.style.color = colors.textSecondary
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Kontakta oss direkt
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
                placeholder="Skriv din fråga här..."
                style={{
                  ...styles.input,
                  ...(inputFocused ? styles.inputFocus : {})
                }}
                disabled={loading}
              />
              <button
                type="submit"
                style={{
                  ...styles.sendButton,
                  ...(sendHover && !loading && input.trim() ? styles.sendButtonHover : {}),
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
                disabled={loading || !input.trim()}
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => setSendHover(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        style={{
          ...styles.button,
          ...(buttonHover ? styles.buttonHover : {})
        }}
        className={!isOpen ? 'bobot-pulse' : ''}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        aria-label={isOpen ? 'Stäng chatt' : 'Öppna chatt'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      title: 'Bobot',
      welcomeMessage: 'Hej! Hur kan jag hjälpa dig idag?',
      fallbackMessage: 'Tyvärr kunde jag inte hitta ett svar. Vänligen kontakta oss direkt.',
      contactEmail: '',
      contactPhone: '',
      ...config
    }

    const root = createRoot(container)
    root.render(<ChatWidget config={defaultConfig} />)
  }
}

export default ChatWidget
