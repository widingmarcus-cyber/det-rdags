import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

const CATEGORIES = [
  { value: '', label: 'Alla kategorier' },
  { value: 'hyra', label: 'Hyra' },
  { value: 'felanmalan', label: 'Felanmälan' },
  { value: 'kontrakt', label: 'Kontrakt' },
  { value: 'tvattstuga', label: 'Tvättstuga' },
  { value: 'parkering', label: 'Parkering' },
  { value: 'kontakt', label: 'Kontakt' },
  { value: 'allmant', label: 'Allmänt' }
]

const LANGUAGES = [
  { value: '', label: 'Alla språk' },
  { value: 'sv', label: 'Svenska' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' }
]

function Conversations() {
  const { authFetch } = useContext(AuthContext)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [categoryFilter, languageFilter])

  const fetchConversations = async () => {
    try {
      let url = `${API_BASE}/conversations`
      const params = new URLSearchParams()
      if (categoryFilter) params.append('category', categoryFilter)
      if (languageFilter) params.append('language', languageFilter)
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
    try {
      const response = await authFetch(`${API_BASE}/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedConversation(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta konversationsdetaljer:', error)
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
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
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
          className="input w-auto min-w-[150px]"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="input w-auto min-w-[120px]"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

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
        <div className="flex gap-6">
          {/* Conversation list */}
          <div className="w-80 space-y-2 max-h-[600px] overflow-y-auto">
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
                  <span className="text-xs text-text-tertiary">
                    {conv.message_count} meddelanden
                  </span>
                  {conv.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary">
                      {conv.category}
                    </span>
                  )}
                  {conv.language && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-bg-secondary text-text-tertiary uppercase">
                      {conv.language}
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

          {/* Selected conversation */}
          <div className="flex-1">
            {loadingDetails ? (
              <div className="card text-center py-12">
                <p className="text-text-tertiary">Laddar konversation...</p>
              </div>
            ) : selectedConversation ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">Konversation</h3>
                      <span className="text-sm font-mono text-accent bg-accent-soft px-2 py-0.5 rounded">
                        {selectedConversation.reference_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <span>{formatDate(selectedConversation.started_at)}</span>
                      <span>•</span>
                      <span>{selectedConversation.message_count} meddelanden</span>
                      {selectedConversation.category && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{selectedConversation.category}</span>
                        </>
                      )}
                      {selectedConversation.language && (
                        <>
                          <span>•</span>
                          <span className="uppercase">{selectedConversation.language}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedConversation.id)}
                    disabled={deleteLoading}
                    className="btn btn-ghost text-error hover:bg-error-soft text-sm py-2 disabled:opacity-50"
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

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {selectedConversation.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
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
                              Källor: {msg.sources.join(', ')}
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
