import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Conversations() {
  const { authFetch } = useContext(AuthContext)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await authFetch(`${API_BASE}/conversations`)
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

  const handleDelete = async (conversationId) => {
    if (!confirm('Är du säker på att du vill radera denna konversation? Detta kan inte ångras.')) {
      return
    }

    try {
      const response = await authFetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setConversations(conversations.filter(c => c.id !== conversationId))
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
        }
      }
    } catch (error) {
      console.error('Kunde inte radera:', error)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Är du HELT säker på att du vill radera ALLA konversationer? Detta kan inte ångras och raderar all chatthistorik.')) {
      return
    }

    try {
      const response = await authFetch(`${API_BASE}/conversations`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setConversations([])
        setSelectedConversation(null)
      }
    } catch (error) {
      console.error('Kunde inte radera:', error)
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
    return conv.messages?.some(m => m.content.toLowerCase().includes(query))
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Konversationer</h1>
          <p className="text-text-secondary mt-1">Visa och hantera chatthistorik</p>
        </div>
        {conversations.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="btn btn-ghost text-error hover:bg-error-soft"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Radera alla
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Laddar...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-text-primary">Inga konversationer ännu</h3>
          <p className="text-text-secondary mt-2">Konversationer visas här när användare chattar med din bot</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Conversation list */}
          <div className="w-80 space-y-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                  selectedConversation?.id === conv.id
                    ? 'bg-accent-soft border-accent'
                    : 'bg-bg-tertiary border-border-subtle hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    {conv.messages?.length || 0} meddelanden
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {formatDate(conv.created_at)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary truncate">
                  {conv.messages?.[0]?.content || 'Tom konversation'}
                </p>
              </button>
            ))}
          </div>

          {/* Selected conversation */}
          <div className="flex-1">
            {selectedConversation ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
                  <div>
                    <h3 className="font-medium text-text-primary">Konversation</h3>
                    <p className="text-xs text-text-tertiary">{formatDate(selectedConversation.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedConversation.id)}
                    className="btn btn-ghost text-error hover:bg-error-soft text-sm py-2"
                  >
                    Radera
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedConversation.messages?.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-bg-chat-user text-text-primary'
                            : 'bg-bg-tertiary border border-border-subtle text-text-primary'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-text-tertiary mt-1">
                          {formatDate(msg.created_at)}
                        </p>
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
