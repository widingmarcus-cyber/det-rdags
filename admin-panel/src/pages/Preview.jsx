import { useState, useContext, useRef, useEffect } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Preview() {
  const { auth } = useContext(AuthContext)
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hej! Jag är din AI-assistent. Hur kan jag hjälpa dig idag?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
          question: userMessage
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: data.answer,
            sources: data.sources
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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Förhandsgranska</h1>
        <p className="text-text-secondary mt-1">Testa hur din chatbot fungerar</p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Widget Preview */}
        <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-accent-hover text-text-inverse px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Bobot</h3>
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
                      : 'bg-bg-tertiary text-text-primary border border-border-subtle rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
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

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-border-subtle bg-bg-secondary">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv din fråga här..."
                className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-border rounded-full text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(217,119,87,0.15)] transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-accent hover:bg-accent-hover text-text-inverse rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
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
          Detta är en förhandsvisning av widgeten
        </p>
      </div>
    </div>
  )
}

export default Preview
