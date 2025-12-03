import { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function WidgetPage({ widgetType }) {
  const { authFetch } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('settings')
  const [widget, setWidget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Settings form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_color: '#D97757',
    welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
    fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga.',
    subtitle: 'Alltid redo att hjälpa',
    language: 'sv'
  })

  // Knowledge state
  const [knowledgeItems, setKnowledgeItems] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [knowledgeForm, setKnowledgeForm] = useState({ question: '', answer: '', category: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [categories] = useState(['Hyra & Betalning', 'Felanmälan', 'Tvättstuga', 'Parkering', 'Kontrakt & Uppsägning', 'Allmänt'])

  // Preview state
  const [previewMessages, setPreviewMessages] = useState([])
  const [previewInput, setPreviewInput] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sessionId] = useState(() => 'preview-' + Math.random().toString(36).substring(2, 15))
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef(null)

  const isExternal = widgetType === 'external'
  const pageTitle = isExternal ? 'Extern Widget' : 'Intern Widget'
  const pageDescription = isExternal
    ? 'Widget för kunder på er hemsida'
    : 'Widget för anställda med intern kunskapsbank'

  // Fetch or create widget
  useEffect(() => {
    fetchWidget()
  }, [widgetType])

  const fetchWidget = async () => {
    setLoading(true)
    try {
      const response = await authFetch(`${API_BASE}/widgets`)
      if (response.ok) {
        const widgets = await response.json()
        const existingWidget = widgets.find(w => w.widget_type === widgetType)

        if (existingWidget) {
          setWidget(existingWidget)
          setFormData({
            name: existingWidget.name || '',
            description: existingWidget.description || '',
            primary_color: existingWidget.primary_color || '#D97757',
            welcome_message: existingWidget.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?',
            fallback_message: existingWidget.fallback_message || 'Tyvärr kunde jag inte hitta ett svar.',
            subtitle: existingWidget.subtitle || 'Alltid redo att hjälpa',
            language: existingWidget.language || 'sv'
          })
          fetchKnowledge(existingWidget.id)
          setPreviewMessages([{ type: 'bot', text: existingWidget.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?' }])
        } else {
          // Create widget if it doesn't exist
          await createWidget()
        }
      }
    } catch (e) {
      setError('Kunde inte hämta widget: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const createWidget = async () => {
    const defaultName = isExternal ? 'Kundwidget' : 'Intern widget'
    const defaultWelcome = isExternal
      ? 'Hej! Hur kan jag hjälpa dig idag?'
      : 'Hej! Hur kan jag hjälpa dig med interna frågor?'

    try {
      const response = await authFetch(`${API_BASE}/widgets`, {
        method: 'POST',
        body: JSON.stringify({
          name: defaultName,
          widget_type: widgetType,
          description: isExternal ? 'Widget för kundservice' : 'Widget för anställda',
          primary_color: '#D97757',
          welcome_message: defaultWelcome,
          fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga.',
          subtitle: 'Alltid redo att hjälpa',
          language: 'sv'
        })
      })

      if (response.ok) {
        const newWidget = await response.json()
        setWidget(newWidget)
        setFormData({
          name: newWidget.name,
          description: newWidget.description || '',
          primary_color: newWidget.primary_color,
          welcome_message: newWidget.welcome_message,
          fallback_message: newWidget.fallback_message,
          subtitle: newWidget.subtitle,
          language: newWidget.language
        })
        setPreviewMessages([{ type: 'bot', text: newWidget.welcome_message }])
      }
    } catch (e) {
      setError('Kunde inte skapa widget: ' + e.message)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!widget) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await authFetch(`${API_BASE}/widgets/${widget.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updated = await response.json()
        setWidget(updated)
        setSuccess('Inställningar sparade!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte spara inställningar')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Knowledge functions
  const fetchKnowledge = async (widgetId) => {
    setKnowledgeLoading(true)
    try {
      const response = await authFetch(`${API_BASE}/knowledge`)
      if (response.ok) {
        const items = await response.json()
        // Filter to only show items for this widget or shared items
        const filtered = items.filter(item => item.widget_id === widgetId || !item.widget_id)
        setKnowledgeItems(filtered)
      }
    } catch (e) {
      console.error('Kunde inte hämta kunskapsbank:', e)
    } finally {
      setKnowledgeLoading(false)
    }
  }

  const handleSaveKnowledge = async (e) => {
    e.preventDefault()
    if (!widget) return

    try {
      const payload = {
        ...knowledgeForm,
        widget_id: widget.id
      }

      if (editingItem) {
        await authFetch(`${API_BASE}/knowledge/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } else {
        await authFetch(`${API_BASE}/knowledge`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }

      setShowKnowledgeModal(false)
      setEditingItem(null)
      setKnowledgeForm({ question: '', answer: '', category: '' })
      fetchKnowledge(widget.id)
    } catch (e) {
      console.error('Kunde inte spara:', e)
    }
  }

  const handleDeleteKnowledge = async (item) => {
    if (!confirm('Är du säker på att du vill ta bort denna post?')) return

    try {
      await authFetch(`${API_BASE}/knowledge/${item.id}`, { method: 'DELETE' })
      fetchKnowledge(widget.id)
    } catch (e) {
      console.error('Kunde inte ta bort:', e)
    }
  }

  const filteredKnowledge = knowledgeItems.filter(item =>
    !searchQuery ||
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Preview functions
  const handlePreviewSend = async (e) => {
    e.preventDefault()
    if (!previewInput.trim() || previewLoading || !widget) return

    const userMessage = previewInput.trim()
    setPreviewInput('')
    setPreviewMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setPreviewLoading(true)

    try {
      const response = await fetch(`${API_BASE}/chat/widget/${widget.widget_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, session_id: sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewMessages(prev => [...prev, { type: 'bot', text: data.answer, hadAnswer: data.had_answer }])
      } else {
        setPreviewMessages(prev => [...prev, { type: 'bot', text: 'Kunde inte få svar just nu.', error: true }])
      }
    } catch (e) {
      setPreviewMessages(prev => [...prev, { type: 'bot', text: 'Anslutningsfel.', error: true }])
    } finally {
      setPreviewLoading(false)
    }
  }

  const resetPreview = () => {
    setPreviewMessages([{ type: 'bot', text: formData.welcome_message || 'Hej! Hur kan jag hjälpa dig?' }])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [previewMessages])

  const tabs = [
    { id: 'settings', label: 'Inställningar', icon: 'settings' },
    { id: 'knowledge', label: 'Kunskapsbank', icon: 'book', count: knowledgeItems.length },
    { id: 'preview', label: 'Förhandsgranska', icon: 'eye' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isExternal ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isExternal ? '#3B82F6' : '#22C55E'} strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{pageTitle}</h1>
            <p className="text-text-secondary">{pageDescription}</p>
          </div>
        </div>

        {widget?.widget_key && (
          <div className="flex items-center gap-2 mt-3">
            <code className="text-xs bg-bg-tertiary px-3 py-1.5 rounded font-mono">{widget.widget_key}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(widget.widget_key)
                setSuccess('Widget-nyckel kopierad!')
                setTimeout(() => setSuccess(''), 2000)
              }}
              className="btn btn-ghost text-xs"
            >
              Kopiera nyckel
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-error-soft border border-error text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border-subtle mb-6">
        <nav className="flex gap-1" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.icon === 'settings' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              )}
              {tab.icon === 'book' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              )}
              {tab.icon === 'eye' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-bg-tertiary text-text-tertiary text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && (
        <div className="card p-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Namn</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="T.ex. Kundchatt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Språk</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="input w-full"
                >
                  <option value="sv">Svenska</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Beskrivning</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full"
                rows="2"
                placeholder="Valfri beskrivning..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Primärfärg</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-border-subtle"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="input flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Underrubrik</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="input w-full"
                  placeholder="Alltid redo att hjälpa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Välkomstmeddelande</label>
              <textarea
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                className="input w-full"
                rows="2"
                placeholder="Hej! Hur kan jag hjälpa dig idag?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Fallback-meddelande</label>
              <textarea
                value={formData.fallback_message}
                onChange={(e) => setFormData({ ...formData, fallback_message: e.target.value })}
                className="input w-full"
                rows="2"
                placeholder="Tyvärr kunde jag inte hitta ett svar..."
              />
              <p className="text-xs text-text-tertiary mt-1">Visas när AI:n inte hittar ett svar i kunskapsbanken</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Sparar...' : 'Spara inställningar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div>
          {/* Knowledge header */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök frågor och svar..."
                className="input pl-10 w-full"
              />
            </div>
            <button
              onClick={() => {
                setEditingItem(null)
                setKnowledgeForm({ question: '', answer: '', category: '' })
                setShowKnowledgeModal(true)
              }}
              className="btn btn-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Lägg till
            </button>
          </div>

          {/* Knowledge list */}
          {knowledgeLoading ? (
            <div className="text-center py-12 text-text-secondary">Laddar...</div>
          ) : filteredKnowledge.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary">Ingen kunskapsbank ännu</h3>
              <p className="text-text-secondary mt-2">Lägg till frågor och svar för att träna din {isExternal ? 'kundwidget' : 'interna widget'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKnowledge.map(item => (
                <div key={item.id} className="card group hover:border-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {item.widget_id ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isExternal ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>
                            Endast denna widget
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Delad
                          </span>
                        )}
                        {item.category && (
                          <span className="badge badge-accent">{item.category}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-text-primary">{item.question}</h3>
                      <p className="text-text-secondary mt-2 text-sm line-clamp-2">{item.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setKnowledgeForm({ question: item.question, answer: item.answer, category: item.category || '' })
                          setShowKnowledgeModal(true)
                        }}
                        className="p-2 text-text-tertiary hover:text-accent hover:bg-accent-soft rounded-md"
                        title="Redigera"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteKnowledge(item)}
                        className="p-2 text-text-tertiary hover:text-error hover:bg-error-soft rounded-md"
                        title="Ta bort"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-secondary text-sm"
              >
                {darkMode ? 'Ljust läge' : 'Mörkt läge'}
              </button>
              <button onClick={resetPreview} className="btn btn-secondary text-sm">
                Börja om
              </button>
            </div>
          </div>

          {/* Widget preview */}
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: darkMode ? '#1C1917' : '#FFFFFF' }}
          >
            {/* Header */}
            <div
              className="px-5 py-4"
              style={{ background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -25)} 100%)` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">{formData.name || 'Bobot'}</h2>
                  <p className="text-white/80 text-sm">{formData.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="h-80 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: darkMode ? '#1C1917' : '#FAFAF9' }}
            >
              {previewMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-4 py-2.5 rounded-2xl"
                    style={{
                      background: msg.type === 'user'
                        ? `linear-gradient(135deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -15)} 100%)`
                        : darkMode ? '#292524' : '#FFFFFF',
                      color: msg.type === 'user' ? 'white' : (darkMode ? '#FAFAF9' : '#1C1917'),
                      border: msg.type === 'bot' ? `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}` : 'none',
                      borderBottomLeftRadius: msg.type === 'bot' ? '4px' : '16px',
                      borderBottomRightRadius: msg.type === 'user' ? '4px' : '16px'
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.hadAnswer === false && (
                      <p className="text-xs mt-1 text-amber-500">Kunde inte hitta exakt svar</p>
                    )}
                  </div>
                </div>
              ))}
              {previewLoading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      backgroundColor: darkMode ? '#292524' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`
                    }}
                  >
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: darkMode ? '#78716C' : '#A8A29E', animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: darkMode ? '#78716C' : '#A8A29E', animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: darkMode ? '#78716C' : '#A8A29E', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handlePreviewSend}
              className="p-3"
              style={{
                backgroundColor: darkMode ? '#292524' : '#FFFFFF',
                borderTop: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  placeholder="Skriv ett meddelande..."
                  className="flex-1 px-4 py-2.5 rounded-full outline-none text-sm"
                  style={{
                    backgroundColor: darkMode ? '#1C1917' : '#F5F5F4',
                    color: darkMode ? '#FAFAF9' : '#1C1917',
                    border: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`
                  }}
                  disabled={previewLoading}
                />
                <button
                  type="submit"
                  disabled={previewLoading || !previewInput.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-text-tertiary mt-4">
            Testa din widget med riktiga frågor från kunskapsbanken
          </p>
        </div>
      )}

      {/* Knowledge Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-tertiary rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingItem ? 'Redigera fråga' : 'Lägg till fråga'}
              </h2>
            </div>
            <form onSubmit={handleSaveKnowledge} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Kategori</label>
                <select
                  value={knowledgeForm.category}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Välj kategori (valfritt)</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Fråga</label>
                <input
                  type="text"
                  value={knowledgeForm.question}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, question: e.target.value })}
                  className="input w-full"
                  placeholder="T.ex. Hur säger jag upp min lägenhet?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Svar</label>
                <textarea
                  value={knowledgeForm.answer}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answer: e.target.value })}
                  className="input w-full"
                  rows="4"
                  placeholder="Skriv svaret här..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowKnowledgeModal(false)}
                  className="btn btn-ghost"
                >
                  Avbryt
                </button>
                <button type="submit" className="btn btn-primary">
                  Spara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to darken/lighten color
function adjustColor(hex, amount) {
  if (!hex) return '#C4613D'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export default WidgetPage
