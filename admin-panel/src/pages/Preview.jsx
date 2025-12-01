import { useState, useContext, useRef, useEffect } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Preview() {
  const { auth, authFetch } = useContext(AuthContext)
  const [settings, setSettings] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [sessionId, setSessionId] = useState(() => generateSessionId())
  const messagesEndRef = useRef(null)

  function generateSessionId() {
    return 'preview-' + Math.random().toString(36).substring(2, 15)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSettings = async () => {
    try {
      const response = await authFetch(`${API_BASE}/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        // Set welcome message from settings
        setMessages([
          {
            type: 'bot',
            text: data.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?'
          }
        ])
      }
    } catch (error) {
      console.error('Kunde inte hämta inställningar:', error)
      setMessages([
        {
          type: 'bot',
          text: 'Hej! Hur kan jag hjälpa dig idag?'
        }
      ])
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }])
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/chat/${auth.companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          session_id: sessionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: data.answer,
            sources: data.sources,
            hadAnswer: data.had_answer
          }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: 'Tyvärr kunde jag inte svara just nu. Försök igen senare.',
            error: true
          }
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: 'Kunde inte ansluta till servern. Kontrollera att backend körs.',
          error: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSessionId(generateSessionId()) // New session
    setMessages([
      {
        type: 'bot',
        text: settings?.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?'
      }
    ])
  }

  // Dynamic colors from settings
  const primaryColor = settings?.primary_color || '#D97757'
  const companyName = settings?.company_name || 'Bobot'

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Laddar förhandsvisning...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Förhandsgranska</h1>
          <p className="text-text-secondary mt-1">Testa hur din chatbot fungerar med dina inställningar</p>
        </div>
        <button onClick={handleReset} className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Börja om
        </button>
      </div>

      <div className="max-w-md mx-auto">
        {/* Settings info */}
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-3 mb-4 text-sm">
          <div className="flex items-center gap-4 text-text-secondary">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              />
              <span>Färg</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{companyName}</span>
            </div>
          </div>
        </div>

        {/* Widget Preview */}
        <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle overflow-hidden">
          {/* Header - using dynamic color */}
          <div
            className="text-white px-5 py-4"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{companyName}</h3>
                <p className="text-sm text-white/80">Alltid redo att hjälpa</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-bg-secondary">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-bg-chat-user text-text-primary rounded-br-sm'
                      : msg.error
                      ? 'bg-error-soft text-error border border-error/20'
                      : msg.hadAnswer === false
                      ? 'bg-warning/10 text-text-primary border border-warning/20 rounded-bl-sm'
                      : 'bg-bg-tertiary text-text-primary border border-border-subtle rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  {msg.hadAnswer === false && (
                    <div className="mt-2 pt-2 border-t border-warning/20">
                      <p className="text-xs text-warning flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Kunde inte hitta exakt svar i kunskapsbasen
                      </p>
                    </div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border-subtle">
                      <p className="text-xs text-text-tertiary">
                        Baserat på: {msg.sources.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-bg-tertiary border border-border-subtle rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - using dynamic color */}
          <form onSubmit={handleSend} className="p-3 border-t border-border-subtle bg-bg-secondary">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv din fråga här..."
                className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-border rounded-full text-sm focus:outline-none transition-all"
                style={{
                  '--tw-ring-color': primaryColor,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = primaryColor
                  e.target.style.boxShadow = `0 0 0 3px ${primaryColor}26`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = ''
                  e.target.style.boxShadow = ''
                }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-text-tertiary mt-4">
          Widgeten använder dina sparade inställningar
        </p>
      </div>
    </div>
  )
}

// Helper function to darken/lighten a hex color
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export default Preview
