import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Widgets() {
  const { authFetch } = useContext(AuthContext)
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingWidget, setEditingWidget] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    widget_type: 'external',
    description: '',
    primary_color: '#D97757',
    welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
    fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.',
    subtitle: 'Alltid redo att hjälpa',
    language: 'sv'
  })
  const [saving, setSaving] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  const fetchWidgets = async () => {
    try {
      const response = await authFetch(`${API_BASE}/widgets`)
      if (response.ok) {
        const data = await response.json()
        setWidgets(data)
      } else {
        setError('Kunde inte hämta widgets')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWidgets()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await authFetch(`${API_BASE}/widgets`, {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchWidgets()
        setShowCreateModal(false)
        resetForm()
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte skapa widget')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await authFetch(`${API_BASE}/widgets/${editingWidget.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchWidgets()
        setShowEditModal(false)
        setEditingWidget(null)
        resetForm()
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte uppdatera widget')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (widgetId, widgetName) => {
    if (!confirm(`Är du säker på att du vill ta bort "${widgetName}"? Detta tar även bort all kunskapsdata kopplad till denna widget.`)) {
      return
    }

    try {
      const response = await authFetch(`${API_BASE}/widgets/${widgetId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchWidgets()
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte ta bort widget')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    }
  }

  const handleToggleActive = async (widget) => {
    try {
      const response = await authFetch(`${API_BASE}/widgets/${widget.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !widget.is_active })
      })

      if (response.ok) {
        await fetchWidgets()
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte uppdatera widget')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    }
  }

  const openEditModal = (widget) => {
    setEditingWidget(widget)
    setFormData({
      name: widget.name,
      widget_type: widget.widget_type,
      description: widget.description || '',
      primary_color: widget.primary_color || '#D97757',
      welcome_message: widget.welcome_message || '',
      fallback_message: widget.fallback_message || '',
      subtitle: widget.subtitle || '',
      language: widget.language || 'sv'
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      widget_type: 'external',
      description: '',
      primary_color: '#D97757',
      welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
      fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.',
      subtitle: 'Alltid redo att hjälpa',
      language: 'sv'
    })
  }

  const copyWidgetKey = (key) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getWidgetTypeLabel = (type) => {
    switch (type) {
      case 'external': return 'Extern (kunder)'
      case 'internal': return 'Intern (anställda)'
      default: return type
    }
  }

  const getWidgetTypeColor = (type) => {
    switch (type) {
      case 'external': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'internal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Widgets</h1>
          <p className="text-text-secondary mt-1">
            Hantera dina chattwidgets för olika användningsområden
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Skapa widget
        </button>
      </div>

      {error && (
        <div className="bg-error-soft border border-error text-error px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Två typer av widgets</p>
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Extern:</strong> För kunder på er hemsida med kundrelaterad kunskapsbank.<br/>
              <strong>Intern:</strong> För anställda med intern kunskapsbank (policyer, rutiner, etc.).<br/>
              Varje widget har sin egen kunskapsbas och kan anpassas med egna färger och meddelanden.
            </p>
          </div>
        </div>
      </div>

      {/* Widgets grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`card p-5 ${!widget.is_active ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: widget.primary_color + '20' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={widget.primary_color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{widget.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getWidgetTypeColor(widget.widget_type)}`}>
                    {getWidgetTypeLabel(widget.widget_type)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(widget)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    widget.is_active ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={widget.is_active ? 'Inaktivera widget' : 'Aktivera widget'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      widget.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {widget.description && (
              <p className="text-sm text-text-secondary mb-3">{widget.description}</p>
            )}

            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-xs bg-bg-tertiary px-3 py-2 rounded font-mono truncate">
                {widget.widget_key}
              </code>
              <button
                onClick={() => copyWidgetKey(widget.widget_key)}
                className="btn btn-secondary text-xs px-3 py-2"
                aria-label="Kopiera widget-nyckel"
              >
                {copiedKey === widget.widget_key ? 'Kopierad!' : 'Kopiera'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-text-tertiary mb-4">
              <span>{widget.knowledge_count} kunskapsartiklar</span>
              <span>Språk: {widget.language.toUpperCase()}</span>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border-subtle">
              <button
                onClick={() => openEditModal(widget)}
                className="btn btn-secondary flex-1 text-sm"
              >
                Redigera
              </button>
              <button
                onClick={() => handleDelete(widget.id, widget.name)}
                className="btn text-sm px-3 text-error hover:bg-error-soft"
                disabled={widgets.length <= 1}
                title={widgets.length <= 1 ? 'Du måste ha minst en widget' : 'Ta bort widget'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="mb-4">Inga widgets ännu</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Skapa din första widget
          </button>
        </div>
      )}

      {/* Embed code section */}
      {widgets.length > 0 && (
        <div className="mt-8 card p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Inbäddningskod</h2>
          <p className="text-sm text-text-secondary mb-4">
            Kopiera widget-nyckeln och använd den i din inbäddningskod:
          </p>
          <pre className="bg-bg-tertiary p-4 rounded-lg text-sm overflow-x-auto">
            <code className="text-text-secondary">{`<script src="https://din-domän.se/widget.js"></script>
<script>
  Bobot.init({
    widgetKey: 'DIN-WIDGET-NYCKEL',  // Ersätt med din widget-nyckel
    apiUrl: 'https://din-domän.se'
  });
</script>`}</code>
          </pre>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Skapa ny widget</h2>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm() }}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Namn *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      placeholder="T.ex. Kundchatt"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Typ *
                    </label>
                    <select
                      value={formData.widget_type}
                      onChange={(e) => setFormData({ ...formData, widget_type: e.target.value })}
                      className="input w-full"
                    >
                      <option value="external">Extern (för kunder)</option>
                      <option value="internal">Intern (för anställda)</option>
                    </select>
                    <p className="text-xs text-text-tertiary mt-1">
                      Varje widgettyp har sin egen kunskapsbank.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Beskrivning
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full"
                      rows="2"
                      placeholder="Valfri beskrivning..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Primärfärg
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
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
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Språk
                      </label>
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
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Välkomstmeddelande
                    </label>
                    <textarea
                      value={formData.welcome_message}
                      onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                      className="input w-full"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Fallback-meddelande
                    </label>
                    <textarea
                      value={formData.fallback_message}
                      onChange={(e) => setFormData({ ...formData, fallback_message: e.target.value })}
                      className="input w-full"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm() }}
                    className="btn btn-secondary"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.name}
                    className="btn btn-primary"
                  >
                    {saving ? 'Skapar...' : 'Skapa widget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Redigera widget</h2>
                <button
                  onClick={() => { setShowEditModal(false); setEditingWidget(null); resetForm() }}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Namn *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Typ *
                    </label>
                    <select
                      value={formData.widget_type}
                      onChange={(e) => setFormData({ ...formData, widget_type: e.target.value })}
                      className="input w-full"
                    >
                      <option value="external">Extern (för kunder)</option>
                      <option value="internal">Intern (för anställda)</option>
                    </select>
                    <p className="text-xs text-text-tertiary mt-1">
                      Varje widgettyp har sin egen kunskapsbank.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Beskrivning
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Primärfärg
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
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
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Språk
                      </label>
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
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Välkomstmeddelande
                    </label>
                    <textarea
                      value={formData.welcome_message}
                      onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                      className="input w-full"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Fallback-meddelande
                    </label>
                    <textarea
                      value={formData.fallback_message}
                      onChange={(e) => setFormData({ ...formData, fallback_message: e.target.value })}
                      className="input w-full"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingWidget(null); resetForm() }}
                    className="btn btn-secondary"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.name}
                    className="btn btn-primary"
                  >
                    {saving ? 'Sparar...' : 'Spara ändringar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Widgets
