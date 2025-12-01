import React, { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

// Inline styles för att undvika CSS-konflikter
const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  button: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  buttonHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
  chatWindow: {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    width: '380px',
    height: '500px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#2563eb',
    color: '#fff',
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
    fontSize: '20px',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: '16px',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '12px',
    opacity: 0.8,
    margin: '2px 0 0 0',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '4px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f9fafb',
  },
  message: {
    marginBottom: '12px',
    display: 'flex',
  },
  messageUser: {
    justifyContent: 'flex-end',
  },
  messageBot: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  messageBubbleUser: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  messageBubbleBot: {
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderBottomLeftRadius: '4px',
  },
  inputArea: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#fff',
  },
  inputForm: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  typing: {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#9ca3af',
    borderRadius: '50%',
    animation: 'bounce 1s infinite',
  },
}

// CSS för animationer
const injectStyles = () => {
  if (document.getElementById('bobot-styles')) return

  const styleSheet = document.createElement('style')
  styleSheet.id = 'bobot-styles'
  styleSheet.textContent = `
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    .fai-typing-dot:nth-child(2) { animation-delay: 0.1s; }
    .fai-typing-dot:nth-child(3) { animation-delay: 0.2s; }
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

    try {
      const response = await fetch(`${config.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          tenant_id: config.tenantId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { type: 'bot', text: data.answer }])
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Tyvärr kunde jag inte svara just nu. Försök igen senare.'
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Ett fel uppstod. Vänligen försök igen.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={styles.headerIcon}>🏠</div>
            <div style={styles.headerText}>
              <p style={styles.headerTitle}>{config.title || 'Bobot'}</p>
              <p style={styles.headerSubtitle}>Alltid redo att hjälpa</p>
            </div>
            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

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
                    <div className="fai-typing-dot" style={styles.typingDot}></div>
                    <div className="fai-typing-dot" style={styles.typingDot}></div>
                    <div className="fai-typing-dot" style={styles.typingDot}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <form style={styles.inputForm} onSubmit={handleSend}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv din fråga här..."
                style={styles.input}
                disabled={loading}
              />
              <button
                type="submit"
                style={{
                  ...styles.sendButton,
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
                disabled={loading || !input.trim()}
              >
                Skicka
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        style={{
          ...styles.button,
          ...(buttonHover ? styles.buttonHover : {})
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>
    </div>
  )
}

// Global init-funktion
window.Bobot = {
  init: function(config) {
    const container = document.createElement('div')
    container.id = 'bobot-widget'
    document.body.appendChild(container)

    const defaultConfig = {
      apiUrl: 'http://localhost:8000',
      tenantId: 'demo',
      title: 'Bobot',
      welcomeMessage: 'Hej! Hur kan jag hjälpa dig idag?',
      ...config
    }

    const root = createRoot(container)
    root.render(<ChatWidget config={defaultConfig} />)
  }
}

export default ChatWidget
