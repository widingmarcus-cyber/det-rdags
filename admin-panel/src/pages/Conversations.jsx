import { useState, useEffect, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuthContext } from '../App'

const API_BASE = '/api'

const WIDGET_TYPES = [
  { value: '', label: 'Alla widgetar' },
  { value: 'external', label: 'Kundtjänst' },
  { value: 'internal', label: 'Medarbetarstöd' }
]

const FEEDBACK_TYPES = [
  { value: '', label: 'All feedback' },
  { value: 'helpful', label: '👍 Hjälpsam' },
  { value: 'not_helpful', label: '👎 Ej hjälpsam' },
  { value: 'none', label: 'Ingen feedback' }
]

function Conversations() {
  const { authFetch } = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [widgetTypeFilter, setWidgetTypeFilter] = useState('')
  const [feedbackFilter, setFeedbackFilter] = useState(searchParams.get('feedback') || '')
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [categories, setCategories] = useState([{ value: '', label: 'Alla kategorier' }])

  useEffect(() => {
    fetchConversations()
    fetchCategories()
    // Read feedback filter from URL on mount
    const urlFeedback = searchParams.get('feedback')
    if (urlFeedback) {
      setFeedbackFilter(urlFeedback)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    // Update URL when feedback filter changes
    if (feedbackFilter) {
      setSearchParams({ feedback: feedbackFilter })
    } else {
      setSearchParams({})
    }
  }, [categoryFilter, widgetTypeFilter, feedbackFilter])

  const fetchCategories = async () => {
    try {
      const response = await authFetch(`${API_BASE}/categories`)
      if (response.ok) {
        const data = await response.json()
        const categoryOptions = [
          { value: '', label: 'Alla kategorier' },
          ...data.map(cat => ({ value: cat.name.toLowerCase(), label: cat.name }))
        ]
        setCategories(categoryOptions)
      }
    } catch (error) {
      console.error('Kunde inte hämta kategorier:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      let url = `${API_BASE}/conversations`
      const params = new URLSearchParams()
      if (categoryFilter) params.append('category', categoryFilter)
      if (widgetTypeFilter) params.append('widget_type', widgetTypeFilter)
      if (feedbackFilter) params.append('feedback', feedbackFilter)
      if (params.toString()) url += `?${params.toString()}`

      const response = await authFetch(url)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta konversationer:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationDetails = async (conversationId) => {
    setLoadingDetails(true)
    setError('')
    try {
      const response = await authFetch(`${API_BASE}/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedConversation(data)
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(errData.detail || `Kunde inte ladda konversation (fel ${response.status})`)
        setSelectedConversation(null)
      }
    } catch (error) {
      console.error('Kunde inte hämta konversationsdetaljer:', error)
      setError('Ett fel uppstod vid laddning av konversation. Försök igen.')
      setSelectedConversation(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSelectConversation = (conv) => {
    if (selectedConversation?.id === conv.id) return
    fetchConversationDetails(conv.id)
  }

  const handleDelete = async (conversationId) => {
    if (!window.confirm('Är du säker på att du vill radera denna konversation? Anonymiserad statistik bevaras.')) {
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      const response = await authFetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setConversations(conversations.filter(c => c.id !== conversationId))
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
        }
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || `Kunde inte radera konversationen (fel ${response.status})`)
      }
    } catch (error) {
      console.error('Kunde inte radera:', error)
      setError('Ett fel uppstod vid radering. Försök igen.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Är du HELT säker på att du vill radera ALLA konversationer? Anonymiserad statistik bevaras.')) {
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      const response = await authFetch(`${API_BASE}/conversations`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setConversations([])
        setSelectedConversation(null)
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || `Kunde inte radera konversationerna (fel ${response.status})`)
      }
    } catch (error) {
      console.error('Kunde inte radera:', error)
      setError('Ett fel uppstod vid radering. Försök igen.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return conv.first_message?.toLowerCase().includes(query)
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Konversationer</h1>
          <p className="text-text-secondary mt-1">Visa och hantera chatthistorik (GDPR-kompatibel)</p>
        </div>
        {conversations.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={deleteLoading}
            className="btn btn-ghost text-error hover:bg-error-soft disabled:opacity-50"
          >
            {deleteLoading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            )}
            {deleteLoading ? 'Raderar...' : 'Radera alla'}
          </button>
        )}
      </div>

      {/* GDPR Info */}
      <div className="bg-accent-soft border border-accent/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent flex-shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-text-primary">GDPR-skyddad data</p>
            <p className="text-text-secondary mt-1">
              IP-adresser anonymiseras automatiskt. Vid radering bevaras endast anonymiserad statistik.
              Konversationer raderas automatiskt enligt dina inställningar.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-error flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-error">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-error hover:text-error/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 flex flex-wrap gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[200px]">
          <div className="relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök i konversationer..."
              className="input pl-12"
            />
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-full sm:w-auto sm:min-w-[140px]"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={widgetTypeFilter}
          onChange={(e) => setWidgetTypeFilter(e.target.value)}
          className="input w-full sm:w-auto sm:min-w-[140px]"
        >
          {WIDGET_TYPES.map(wt => (
            <option key={wt.value} value={wt.value}>{wt.label}</option>
          ))}
        </select>
        <select
          value={feedbackFilter}
          onChange={(e) => setFeedbackFilter(e.target.value)}
          className={`input w-full sm:w-auto sm:min-w-[140px] ${
            feedbackFilter === 'helpful' ? 'border-success text-success' :
            feedbackFilter === 'not_helpful' ? 'border-error text-error' : ''
          }`}
        >
          {FEEDBACK_TYPES.map(fb => (
            <option key={fb.value} value={fb.value}>{fb.label}</option>
          ))}
        </select>
      </div>

      {/* Active filter indicator */}
      {feedbackFilter && (
        <div className={`mb-4 px-4 py-2 rounded-lg flex items-center justify-between ${
          feedbackFilter === 'helpful' ? 'bg-success/10 border border-success/20' :
          feedbackFilter === 'not_helpful' ? 'bg-error/10 border border-error/20' :
          'bg-bg-secondary'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {feedbackFilter === 'helpful' ? '👍' : feedbackFilter === 'not_helpful' ? '👎' : '🤷'}
            </span>
            <span className="text-sm text-text-primary">
              Visar konversationer med {feedbackFilter === 'helpful' ? 'positiv' : feedbackFilter === 'not_helpful' ? 'negativ' : 'ingen'} feedback
            </span>
          </div>
          <button
            onClick={() => setFeedbackFilter('')}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Laddar...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary">Inga konversationer ännu</h3>
          <p className="text-text-secondary mt-2">Konversationer visas här när användare chattar med din bot</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Conversation list - hidden on mobile when conversation is selected */}
          <div className={`w-full md:w-80 space-y-2 max-h-[600px] overflow-y-auto ${selectedConversation ? 'hidden md:block' : ''}`}>
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                  selectedConversation?.id === conv.id
                    ? 'bg-accent-soft border-accent'
                    : 'bg-bg-tertiary border-border-subtle hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-accent">
                    {conv.reference_id}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {formatDate(conv.started_at)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary truncate mb-2">
                  {conv.first_message || 'Tom konversation'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {conv.widget_type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.widget_type === 'external'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {conv.widget_type === 'external' ? 'Extern' : 'Intern'}
                    </span>
                  )}
                  <span className="text-xs text-text-tertiary">
                    {conv.message_count} meddelanden
                  </span>
                  {conv.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary">
                      {conv.category}
                    </span>
                  )}
                  {conv.was_helpful !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.was_helpful
                        ? 'bg-success/10 text-success'
                        : 'bg-error/10 text-error'
                    }`}>
                      {conv.was_helpful ? 'Hjälpsam' : 'Ej hjälpsam'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Selected conversation - hidden on mobile when nothing selected */}
          <div className={`flex-1 w-full min-w-0 ${!selectedConversation && !loadingDetails ? 'hidden md:block' : ''}`}>
            {loadingDetails ? (
              <div className="card text-center py-12">
                <p className="text-text-tertiary">Laddar konversation...</p>
              </div>
            ) : selectedConversation ? (
              <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-border-subtle">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary flex-shrink-0"
                      aria-label="Tillbaka till listan"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-text-primary">Konversation</h3>
                        <span className="text-sm font-mono text-accent bg-accent-soft px-2 py-0.5 rounded break-all">
                          {selectedConversation.reference_id}
                        </span>
                        {selectedConversation.widget_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                            selectedConversation.widget_type === 'external'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {selectedConversation.widget_type === 'external' ? 'Extern' : 'Intern'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-tertiary flex-wrap">
                        <span>{formatDate(selectedConversation.started_at)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{selectedConversation.message_count} meddelanden</span>
                        {selectedConversation.category && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="capitalize">{selectedConversation.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedConversation.id)}
                    disabled={deleteLoading}
                    className="btn btn-ghost text-error hover:bg-error-soft text-sm py-2 disabled:opacity-50 flex-shrink-0 self-start sm:self-auto"
                  >
                    {deleteLoading ? (
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                    {deleteLoading ? 'Raderar...' : 'Radera'}
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto overflow-x-hidden pr-2">
                  {selectedConversation.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                          msg.role === 'user'
                            ? 'bg-bg-chat-user text-text-primary'
                            : msg.had_answer === false
                            ? 'bg-warning/10 border border-warning/20 text-text-primary'
                            : 'bg-bg-tertiary border border-border-subtle text-text-primary'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border-subtle">
                            <p className="text-xs text-text-tertiary">
                              Källor: {msg.sources.map(s => typeof s === 'string' ? s : s.question).join(', ')}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-text-tertiary">
                            {formatDate(msg.created_at)}
                          </p>
                          {msg.role === 'bot' && msg.had_answer === false && (
                            <span className="text-xs text-warning">Kunde ej svara</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-text-tertiary">Välj en konversation för att se detaljer</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Conversations
