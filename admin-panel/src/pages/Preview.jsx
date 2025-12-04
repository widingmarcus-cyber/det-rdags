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
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [announcement, setAnnouncement] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  // Widget states
  const [widgets, setWidgets] = useState([])
  const [selectedWidget, setSelectedWidget] = useState(null)

  function generateSessionId() {
    return 'preview-' + Math.random().toString(36).substring(2, 15)
  }

  // Announce messages to screen readers
  const announce = (message) => {
    setAnnouncement(message)
    setTimeout(() => setAnnouncement(''), 1000)
  }

  useEffect(() => {
    fetchWidgets()
    fetchSettings()
  }, [])

  // Reload when widget changes
  useEffect(() => {
    if (selectedWidget) {
      loadWidgetSettings(selectedWidget)
    } else {
      fetchSettings()
    }
  }, [selectedWidget])

  const fetchWidgets = async () => {
    try {
      const response = await authFetch(`${API_BASE}/widgets`)
      if (response.ok) {
        const data = await response.json()
        setWidgets(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta widgets:', error)
    }
  }

  const loadWidgetSettings = async (widget) => {
    setLoadingSettings(true)
    setMessages([])
    setSessionId(generateSessionId())
    setFeedbackGiven({})

    // Use widget's own settings
    setSettings({
      welcome_message: widget.welcome_message,
      fallback_message: widget.fallback_message,
      subtitle: widget.subtitle,
      primary_color: widget.primary_color,
      widget_font_family: widget.widget_font_family,
      widget_font_size: widget.widget_font_size,
      widget_border_radius: widget.widget_border_radius,
      widget_position: widget.widget_position,
      suggested_questions: widget.suggested_questions,
    })
    setMessages([
      {
        type: 'bot',
        text: widget.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?',
        timestamp: new Date()
      }
    ])
    setLoadingSettings(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Announce new messages
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.type === 'bot') {
        announce(`Bobot svarar: ${lastMsg.text.substring(0, 100)}${lastMsg.text.length > 100 ? '...' : ''}`)
      }
    }
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
            text: data.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?',
            timestamp: new Date()
          }
        ])
      }
    } catch (error) {
      console.error('Kunde inte hämta inställningar:', error)
      setMessages([
        {
          type: 'bot',
          text: 'Hej! Hur kan jag hjälpa dig idag?',
          timestamp: new Date()
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
    setMessages((prev) => [...prev, { type: 'user', text: userMessage, timestamp: new Date() }])
    setLoading(true)
    announce('Skickar meddelande...')

    try {
      // Use widget-specific endpoint if a widget is selected
      const chatUrl = selectedWidget
        ? `${API_BASE}/chat/widget/${selectedWidget.widget_key}`
        : `${API_BASE}/chat/${auth.companyId}`

      const response = await fetch(chatUrl, {
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
            hadAnswer: data.had_answer,
            timestamp: new Date()
          }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: 'Tyvärr kunde jag inte svara just nu. Försök igen senare.',
            error: true,
            timestamp: new Date()
          }
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: 'Kunde inte ansluta till servern. Kontrollera att backend körs.',
          error: true,
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
      // Return focus to input
      inputRef.current?.focus()
    }
  }

  const handleReset = () => {
    setSessionId(generateSessionId()) // New session
    setFeedbackGiven({})
    setMessages([
      {
        type: 'bot',
        text: settings?.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?',
        timestamp: new Date()
      }
    ])
    announce('Konversationen har återställts')
    inputRef.current?.focus()
  }

  // Dynamic settings
  const primaryColor = settings?.primary_color || '#D97757'
  const companyName = settings?.company_name || 'Bobot'
  const subtitle = settings?.subtitle || 'Alltid redo att hjälpa'
  const fontFamily = settings?.widget_font_family || 'Inter'
  const fontSize = settings?.widget_font_size || 14
  const borderRadius = settings?.widget_border_radius || 16
  const position = settings?.widget_position || 'bottom-right'

  // Darken/lighten color for gradients
  const adjustColor = (hex, amount) => {
    if (!hex) return '#C4613D'
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
  }

  // Font family CSS
  const getFontFamily = () => {
    if (fontFamily === 'System') {
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
    return `"${fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif`
  }

  // Anthropic-inspired color themes
  const lightTheme = {
    bg: '#FAFAF9',
    bgElevated: '#FFFFFF',
    bgSubtle: '#F5F5F4',
    bgBot: '#FFFFFF',
    bgBotBorder: '#F0EFEE',
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    textOnAccent: '#FFFFFF',
    border: '#E7E5E4',
    borderSubtle: '#F5F5F4',
  }

  const darkTheme = {
    bg: '#1C1917',
    bgElevated: '#292524',
    bgSubtle: '#292524',
    bgBot: '#262320',
    bgBotBorder: '#3D3835',
    text: '#FAFAF9',
    textSecondary: '#A8A29E',
    textMuted: '#78716C',
    textOnAccent: '#FFFFFF',
    border: '#3D3835',
    borderSubtle: '#292524',
  }

  const theme = darkMode ? darkTheme : lightTheme

  const handleFeedback = (msgIndex, helpful) => {
    setFeedbackGiven(prev => ({ ...prev, [msgIndex]: helpful }))
    announce(helpful ? 'Tack för positiv feedback' : 'Tack för feedback')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <p className="text-text-secondary">Laddar förhandsvisning...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" onKeyDown={handleKeyDown}>
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Förhandsgranska</h1>
          <p className="text-text-secondary mt-1">Testa hur din chatbot fungerar med dina inställningar</p>
        </div>
        <div className="flex gap-2 items-center">
          {widgets.length > 0 && (
            <select
              value={selectedWidget?.id || ''}
              onChange={(e) => {
                const widgetId = e.target.value
                setSelectedWidget(widgetId ? widgets.find(w => w.id === parseInt(widgetId)) : null)
              }}
              className="input w-48"
              aria-label="Välj widget att förhandsgranska"
            >
              <option value="">Standardinställningar</option>
              {widgets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.widget_type === 'external' ? 'Extern' : w.widget_type === 'internal' ? 'Intern' : 'Anpassad'})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-secondary"
            aria-label={darkMode ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            aria-label="Börja om konversationen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Börja om
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Settings info */}
        <div
          className="bg-bg-secondary border border-border-subtle rounded-lg p-3 mb-4 text-sm"
          role="region"
          aria-label="Aktiva inställningar"
        >
          <div className="flex items-center gap-4 text-text-secondary flex-wrap">
            {selectedWidget && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span className="font-medium">{selectedWidget.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
                role="img"
                aria-label={`Primärfärg: ${primaryColor}`}
              />
              <span>Färg</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              </svg>
              <span>{fontFamily}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{position === 'bottom-right' ? 'Höger' : 'Vänster'}</span>
            </div>
            {settings?.require_consent && (
              <div className="flex items-center gap-2 text-accent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>GDPR</span>
              </div>
            )}
          </div>
        </div>

        {/* GDPR Note */}
        {settings?.require_consent && (
          <div
            className="bg-accent-soft border border-accent/20 rounded-lg p-3 mb-4 text-sm"
            role="note"
            aria-label="GDPR-information"
          >
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent mt-0.5 flex-shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-text-secondary">
                <span className="font-medium text-text-primary">OBS:</span> Den riktiga widgeten visar samtyckes-dialog och GDPR-meny.
              </p>
            </div>
          </div>
        )}

        {/* Widget Preview - Anthropic Style */}
        <div
          className="shadow-2xl overflow-hidden transition-all"
          style={{
            borderRadius: `${borderRadius}px`,
            fontFamily: getFontFamily(),
            backgroundColor: theme.bgElevated,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          role="region"
          aria-label="Chattwidget förhandsvisning"
        >
          {/* Header - Anthropic style gradient */}
          <div
            className="px-5 py-4"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -25)} 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white" style={{ fontSize: `${fontSize}px` }}>
                    {companyName}
                  </h2>
                  <p className="text-white/80" style={{ fontSize: `${fontSize - 2}px` }}>
                    {subtitle}
                  </p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                aria-label="Stäng"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages - Anthropic style */}
          <div
            className="h-96 overflow-y-auto overflow-x-hidden p-4 space-y-4"
            style={{ backgroundColor: theme.bg }}
            role="log"
            aria-label="Chattmeddelanden"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'slideUp 0.3s ease-out' }}
                role="article"
                aria-label={msg.type === 'user' ? 'Ditt meddelande' : 'Bobot svarar'}
              >
                <div className="max-w-[85%]">
                  <div
                    className="px-4 py-3 transition-all"
                    style={{
                      // User messages: accent gradient with white text
                      // Bot messages: subtle background with border
                      background: msg.type === 'user'
                        ? `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%)`
                        : msg.error
                          ? 'rgba(239, 68, 68, 0.1)'
                          : msg.hadAnswer === false
                            ? 'rgba(245, 158, 11, 0.1)'
                            : theme.bgBot,
                      color: msg.type === 'user'
                        ? theme.textOnAccent
                        : msg.error
                          ? '#DC2626'
                          : theme.text,
                      borderRadius: `${Math.min(borderRadius, 16)}px`,
                      borderBottomLeftRadius: msg.type === 'bot' ? '4px' : `${Math.min(borderRadius, 16)}px`,
                      borderBottomRightRadius: msg.type === 'user' ? '4px' : `${Math.min(borderRadius, 16)}px`,
                      border: msg.type === 'bot' && !msg.error && msg.hadAnswer !== false
                        ? `1px solid ${theme.bgBotBorder}`
                        : msg.error
                          ? '1px solid rgba(239, 68, 68, 0.2)'
                          : msg.hadAnswer === false
                            ? '1px solid rgba(245, 158, 11, 0.2)'
                            : 'none',
                      boxShadow: msg.type === 'user'
                        ? '0 2px 8px rgba(0,0,0,0.08)'
                        : msg.type === 'bot'
                          ? '0 1px 2px rgba(0,0,0,0.05)'
                          : 'none'
                    }}
                  >
                    <p
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {msg.text}
                    </p>
                    {msg.hadAnswer === false && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <p className="flex items-center gap-1" style={{ fontSize: `${fontSize - 2}px`, color: '#D97706' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Kunde inte hitta exakt svar
                        </p>
                      </div>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
                        <p style={{ fontSize: `${fontSize - 2}px`, color: theme.textMuted }}>
                          Baserat på: {msg.sources.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Timestamp */}
                  <p
                    className="mt-1 px-1"
                    style={{
                      fontSize: `${fontSize - 3}px`,
                      color: theme.textMuted,
                      textAlign: msg.type === 'user' ? 'right' : 'left'
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                  {/* Feedback buttons for bot messages */}
                  {msg.type === 'bot' && index > 0 && !feedbackGiven[index] && (
                    <div
                      className="flex items-center gap-2 mt-2 px-1"
                      role="group"
                      aria-label="Ge feedback på svaret"
                    >
                      <span style={{ fontSize: `${fontSize - 2}px`, color: theme.textMuted }}>Hjälpsamt?</span>
                      <button
                        onClick={() => handleFeedback(index, true)}
                        className="px-2 py-1 rounded-full border transition-all hover:scale-105"
                        style={{
                          fontSize: `${fontSize - 2}px`,
                          borderColor: theme.border,
                          color: theme.textSecondary
                        }}
                        aria-label="Ja, svaret var hjälpsamt"
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => handleFeedback(index, false)}
                        className="px-2 py-1 rounded-full border transition-all hover:scale-105"
                        style={{
                          fontSize: `${fontSize - 2}px`,
                          borderColor: theme.border,
                          color: theme.textSecondary
                        }}
                        aria-label="Nej, svaret var inte hjälpsamt"
                      >
                        Nej
                      </button>
                    </div>
                  )}
                  {feedbackGiven[index] !== undefined && (
                    <div
                      className="mt-2 px-1"
                      style={{ fontSize: `${fontSize - 2}px`, color: '#16A34A' }}
                      role="status"
                    >
                      Tack!
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start" role="status" aria-label="Bobot skriver...">
                <div
                  className="px-4 py-3"
                  style={{
                    backgroundColor: theme.bgBot,
                    border: `1px solid ${theme.border}`,
                    borderRadius: `${Math.min(borderRadius, 16)}px`,
                    borderBottomLeftRadius: '4px'
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: theme.textMuted, animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: theme.textMuted, animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: theme.textMuted, animationDelay: '300ms' }}
                    />
                  </div>
                  <span className="sr-only">Bobot skriver ett svar...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Anthropic style */}
          <form
            onSubmit={handleSend}
            className="p-3"
            style={{
              backgroundColor: theme.bgElevated,
              borderTop: `1px solid ${theme.border}`
            }}
            role="form"
            aria-label="Skicka meddelande"
          >
            <div className="flex gap-2 items-center">
              <label htmlFor="chat-input" className="sr-only">Skriv din fråga</label>
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv ett meddelande..."
                className="flex-1 px-4 py-2.5 outline-none transition-all"
                style={{
                  backgroundColor: theme.bgSubtle,
                  color: theme.text,
                  borderRadius: `${Math.min(borderRadius, 20)}px`,
                  border: `1px solid ${theme.border}`,
                  fontSize: `${fontSize}px`
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = primaryColor
                  e.target.style.boxShadow = `0 0 0 3px ${primaryColor}26`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.border
                  e.target.style.boxShadow = 'none'
                }}
                disabled={loading}
                aria-describedby="input-hint"
                autoComplete="off"
              />
              <span id="input-hint" className="sr-only">
                Tryck Enter för att skicka meddelandet
              </span>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
                aria-label={loading ? 'Skickar...' : 'Skicka meddelande'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>

          {/* Powered by footer */}
          <div
            className="px-4 py-2 text-center"
            style={{
              backgroundColor: theme.bgSubtle,
              borderTop: `1px solid ${theme.border}`
            }}
          >
            <p style={{ fontSize: `${fontSize - 3}px`, color: theme.textMuted }}>
              Powered by Bobot
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-text-tertiary mt-4">
          Widgeten visas i {position === 'bottom-right' ? 'nedre högra' : 'nedre vänstra'} hörnet
        </p>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// Helper function to darken/lighten a hex color
function adjustColor(hex, amount) {
  if (!hex) return '#C4613D'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export default Preview
