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
    primary_color: '#D97757',
    welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
    fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga.',
    subtitle: 'Alltid redo att hjälpa',
    language: 'sv',
    // Per-widget contact info
    display_name: '',
    contact_email: '',
    contact_phone: '',
    // Font and style options
    widget_font_family: 'Inter',
    widget_font_size: 14,
    widget_border_radius: 16,
    widget_position: 'bottom-right'
  })

  // Knowledge state
  const [knowledgeItems, setKnowledgeItems] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [knowledgeForm, setKnowledgeForm] = useState({ question: '', answer: '', category: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Categories state
  const [categories, setCategories] = useState([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Import state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const fileInputRef = useRef(null)

  // Preview state
  const [previewMessages, setPreviewMessages] = useState([])
  const [previewInput, setPreviewInput] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sessionId] = useState(() => 'preview-' + Math.random().toString(36).substring(2, 15))
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef(null)
  const [healthStatus, setHealthStatus] = useState(null)

  const isExternal = widgetType === 'external'
  const pageTitle = isExternal ? 'Extern Widget' : 'Intern Widget'
  const pageDescription = isExternal
    ? 'Widget för kunder på er hemsida'
    : 'Widget för anställda med intern kunskapsbank'

  // Check health status
  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`)
      if (response.ok) {
        const data = await response.json()
        setHealthStatus(data)
      } else {
        setHealthStatus({ status: 'error', ollama: 'unknown', database: 'unknown' })
      }
    } catch (e) {
      setHealthStatus({ status: 'offline', ollama: 'disconnected', database: 'disconnected' })
    }
  }

  // Fetch or create widget
  useEffect(() => {
    fetchWidget()
    fetchCategories()
    checkHealth()
  }, [widgetType])

  // Recheck health when preview tab is active
  useEffect(() => {
    if (activeTab === 'preview') {
      checkHealth()
    }
  }, [activeTab])

  const fetchCategories = async () => {
    try {
      const response = await authFetch(`${API_BASE}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (e) {
      // If endpoint doesn't exist, use defaults
      setCategories([
        { id: 1, name: 'Hyra & Betalning' },
        { id: 2, name: 'Felanmälan' },
        { id: 3, name: 'Tvättstuga' },
        { id: 4, name: 'Parkering' },
        { id: 5, name: 'Kontrakt & Uppsägning' },
        { id: 6, name: 'Allmänt' }
      ])
    }
  }

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
            primary_color: existingWidget.primary_color || '#D97757',
            welcome_message: existingWidget.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?',
            fallback_message: existingWidget.fallback_message || 'Tyvärr kunde jag inte hitta ett svar.',
            subtitle: existingWidget.subtitle || 'Alltid redo att hjälpa',
            language: existingWidget.language || 'sv',
            // Per-widget contact info
            display_name: existingWidget.display_name || '',
            contact_email: existingWidget.contact_email || '',
            contact_phone: existingWidget.contact_phone || '',
            // Font and style options
            widget_font_family: existingWidget.widget_font_family || 'Inter',
            widget_font_size: existingWidget.widget_font_size || 14,
            widget_border_radius: existingWidget.widget_border_radius || 16,
            widget_position: existingWidget.widget_position || 'bottom-right'
          })
          fetchKnowledge(existingWidget.id)
          setPreviewMessages([{ type: 'bot', text: existingWidget.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?' }])
        } else {
          await createWidget()
        }
      }
    } catch (e) {
      console.error('Widget fetch error:', e)
      setError('Kunde inte hämta widget. Kontrollera att backend-servern körs på port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const createWidget = async () => {
    const defaultWelcome = isExternal
      ? 'Hej! Hur kan jag hjälpa dig idag?'
      : 'Hej! Hur kan jag hjälpa dig med interna frågor?'

    try {
      const response = await authFetch(`${API_BASE}/widgets`, {
        method: 'POST',
        body: JSON.stringify({
          name: isExternal ? 'Extern' : 'Intern',  // Internal identifier only
          widget_type: widgetType,
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
          primary_color: newWidget.primary_color,
          welcome_message: newWidget.welcome_message,
          fallback_message: newWidget.fallback_message,
          subtitle: newWidget.subtitle,
          language: newWidget.language,
          display_name: newWidget.display_name || '',
          contact_email: newWidget.contact_email || '',
          contact_phone: newWidget.contact_phone || '',
          widget_font_family: newWidget.widget_font_family || 'Inter',
          widget_font_size: newWidget.widget_font_size || 14,
          widget_border_radius: newWidget.widget_border_radius || 16,
          widget_position: newWidget.widget_position || 'bottom-right'
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
        // Filter to only show items for this widget or shared items, sorted by newest first
        const filtered = items
          .filter(item => item.widget_id === widgetId || !item.widget_id)
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
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

      let response
      if (editingItem) {
        response = await authFetch(`${API_BASE}/knowledge/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } else {
        response = await authFetch(`${API_BASE}/knowledge`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        setShowKnowledgeModal(false)
        setEditingItem(null)
        setKnowledgeForm({ question: '', answer: '', category: '' })
        fetchKnowledge(widget.id)
        setSuccess(editingItem ? 'Uppdaterad!' : 'Tillagd!')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte spara kunskapspost')
      }
    } catch (e) {
      console.error('Kunde inte spara:', e)
      setError('Ett fel uppstod: ' + e.message)
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

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`Är du säker på att du vill ta bort ${selectedItems.length} poster?`)) return

    setBulkDeleting(true)
    try {
      const response = await authFetch(`${API_BASE}/knowledge/bulk`, {
        method: 'DELETE',
        body: JSON.stringify({ item_ids: selectedItems })
      })
      if (response.ok) {
        setSelectedItems([])
        fetchKnowledge(widget.id)
        setSuccess(`${selectedItems.length} poster borttagna`)
      }
    } catch (e) {
      console.error('Kunde inte ta bort:', e)
      setError('Kunde inte ta bort posterna')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const toggleSelectAll = () => {
    const filteredIds = filteredKnowledge.map(item => item.id)
    if (selectedItems.length === filteredIds.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredIds)
    }
  }

  // Category functions
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      if (editingCategory) {
        await authFetch(`${API_BASE}/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: newCategoryName })
        })
      } else {
        await authFetch(`${API_BASE}/categories`, {
          method: 'POST',
          body: JSON.stringify({ name: newCategoryName })
        })
      }
      fetchCategories()
      setShowCategoryModal(false)
      setEditingCategory(null)
      setNewCategoryName('')
    } catch (e) {
      // Fallback - add to local state
      if (!editingCategory) {
        setCategories(prev => [...prev, { id: Date.now(), name: newCategoryName }])
      } else {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: newCategoryName } : c))
      }
      setShowCategoryModal(false)
      setEditingCategory(null)
      setNewCategoryName('')
    }
  }

  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Ta bort kategorin "${cat.name}"?`)) return

    try {
      await authFetch(`${API_BASE}/categories/${cat.id}`, { method: 'DELETE' })
      fetchCategories()
    } catch (e) {
      // Fallback - remove from local state
      setCategories(prev => prev.filter(c => c.id !== cat.id))
    }
  }

  // Import functions
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !widget) return

    setImporting(true)
    setUploadProgress('Laddar upp...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('widget_id', widget.id.toString())

    try {
      const response = await authFetch(`${API_BASE}/knowledge/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(`Importerade ${data.imported || data.count || 'flera'} poster!`)
        fetchKnowledge(widget.id)
        setShowImportModal(false)
      } else {
        const err = await response.json()
        setError(err.detail || 'Import misslyckades')
      }
    } catch (e) {
      setError('Kunde inte importera: ' + e.message)
    } finally {
      setImporting(false)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUrlImport = async () => {
    if (!importUrl.trim() || !widget) return

    setImporting(true)
    setUploadProgress('Hämtar från URL...')

    try {
      const response = await authFetch(`${API_BASE}/knowledge/import-url`, {
        method: 'POST',
        body: JSON.stringify({ url: importUrl, widget_id: widget.id })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(`Importerade ${data.imported || data.count || 'flera'} poster!`)
        fetchKnowledge(widget.id)
        setShowImportModal(false)
        setImportUrl('')
      } else {
        const err = await response.json()
        setError(err.detail || 'Import misslyckades')
      }
    } catch (e) {
      setError('Kunde inte importera: ' + e.message)
    } finally {
      setImporting(false)
      setUploadProgress(null)
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
      console.error('Preview chat error:', e)
      setPreviewMessages(prev => [...prev, {
        type: 'bot',
        text: 'Anslutningsfel. Kontrollera att backend-servern och Ollama körs.',
        error: true
      }])
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

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })
  }

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
        <div className="bg-error-soft border border-error text-error px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-error hover:text-error/80">&times;</button>
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

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Contact Info Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Kontaktinformation
              </h3>
              <p className="text-sm text-text-secondary mb-4">Visas i widgetens header och fallback-meddelanden</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Visningsnamn</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="input w-full"
                    placeholder="T.ex. Hyresgästservice"
                  />
                  <p className="text-xs text-text-tertiary mt-1">Visas i widgetens header</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Kontakt-email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="input w-full"
                    placeholder="kontakt@foretag.se"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Kontakttelefon</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="input w-full"
                    placeholder="08-123 456 78"
                  />
                </div>
              </div>
            </div>

            {/* Messages Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Meddelanden
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                    <p className="text-xs text-text-tertiary mt-1">Standardspråk (anpassas efter besökare)</p>
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
                    <p className="text-xs text-text-tertiary mt-1">Visas under namnet i headern</p>
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
                  <p className="text-xs text-text-tertiary mt-1">Visas när AI:n inte hittar svar. Kan inkludera kontaktinfo.</p>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                  <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                  <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                  <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                </svg>
                Utseende
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Primärfärg</label>
                  <div className="flex gap-2 max-w-xs">
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
                  <p className="text-xs text-text-tertiary mt-1">Accentfärg för knappar och header</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Typsnitt</label>
                    <select
                      value={formData.widget_font_family}
                      onChange={(e) => setFormData({ ...formData, widget_font_family: e.target.value })}
                      className="input w-full"
                    >
                      <option value="Inter">Inter (standard)</option>
                      <option value="system-ui">System UI</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Textstorlek: {formData.widget_font_size}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="18"
                      value={formData.widget_font_size}
                      onChange={(e) => setFormData({ ...formData, widget_font_size: parseInt(e.target.value) })}
                      className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-xs text-text-tertiary mt-1">
                      <span>Liten</span>
                      <span>Stor</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Hörnradie: {formData.widget_border_radius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={formData.widget_border_radius}
                      onChange={(e) => setFormData({ ...formData, widget_border_radius: parseInt(e.target.value) })}
                      className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-xs text-text-tertiary mt-1">
                      <span>Kantig</span>
                      <span>Rund</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Widgetposition</label>
                    <select
                      value={formData.widget_position}
                      onChange={(e) => setFormData({ ...formData, widget_position: e.target.value })}
                      className="input w-full"
                    >
                      <option value="bottom-right">Nedre högra hörnet</option>
                      <option value="bottom-left">Nedre vänstra hörnet</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Sparar...' : 'Spara inställningar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Knowledge Tab */}
      {activeTab === 'knowledge' && (
        <div>
          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
              {filteredKnowledge.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredKnowledge.length && filteredKnowledge.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border-subtle text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary">Välj alla</span>
                </label>
              )}
              {selectedItems.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="btn btn-ghost text-error hover:bg-error-soft text-sm py-1.5"
                >
                  {bulkDeleting ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                  Ta bort ({selectedItems.length})
                </button>
              )}
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
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
                Kategorier
              </button>
              <button onClick={() => setShowImportModal(true)} className="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Importera
              </button>
              <button
                onClick={() => {
                  setEditingItem(null)
                  setKnowledgeForm({ question: '', answer: '', category: '' })
                  setShowKnowledgeModal(true)
                }}
                className="btn btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Lägg till
              </button>
            </div>
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
              <p className="text-text-secondary mt-2 mb-4">Lägg till frågor och svar för att träna din {isExternal ? 'kundwidget' : 'interna widget'}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowImportModal(true)} className="btn btn-secondary">
                  Importera data
                </button>
                <button onClick={() => setShowKnowledgeModal(true)} className="btn btn-primary">
                  Lägg till manuellt
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKnowledge.map(item => (
                <div key={item.id} className={`card group hover:border-accent/30 transition-colors ${selectedItems.includes(item.id) ? 'border-accent bg-accent-soft/30' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-4 h-4 mt-1 rounded border-border-subtle text-accent focus:ring-accent cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                        {item.created_at && (
                          <span className="text-xs text-text-tertiary ml-auto">{formatDate(item.created_at)}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-text-primary">{item.question}</h3>
                      <p className="text-text-secondary mt-2 text-sm line-clamp-2">{item.answer}</p>
                      </div>
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

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="max-w-md mx-auto">
          {/* Health Status */}
          <div className={`rounded-lg p-3 mb-4 flex items-center gap-3 ${
            healthStatus?.ollama === 'connected'
              ? 'bg-success/10 border border-success/20'
              : 'bg-warning/10 border border-warning/20'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              healthStatus?.ollama === 'connected' ? 'bg-success animate-pulse' : 'bg-warning'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                healthStatus?.ollama === 'connected' ? 'text-success' : 'text-warning'
              }`}>
                {healthStatus?.ollama === 'connected'
                  ? 'AI-modellen är redo'
                  : healthStatus?.status === 'offline'
                    ? 'Backend-servern är inte tillgänglig'
                    : 'AI-modellen (Ollama) är inte ansluten'}
              </p>
              {healthStatus?.ollama !== 'connected' && (
                <p className="text-xs text-text-tertiary mt-0.5">
                  Kör: docker-compose up -d && docker exec -it bobot-ollama-1 ollama pull llama3.1
                </p>
              )}
            </div>
            <button
              onClick={checkHealth}
              className="p-1.5 hover:bg-black/5 rounded-md transition-colors"
              title="Kontrollera status"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className="btn btn-secondary text-sm">
                {darkMode ? 'Ljust läge' : 'Mörkt läge'}
              </button>
              <button onClick={resetPreview} className="btn btn-secondary text-sm">
                Börja om
              </button>
            </div>
          </div>

          {/* Widget preview */}
          <div
            className="overflow-hidden shadow-2xl"
            style={{
              backgroundColor: darkMode ? '#1C1917' : '#FFFFFF',
              borderRadius: `${formData.widget_border_radius}px`,
              fontFamily: formData.widget_font_family
            }}
          >
            <div className="px-5 py-4" style={{ background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -25)} 100%)` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">{formData.display_name || 'Bobot'}</h2>
                  <p className="text-white/80 text-sm">{formData.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: darkMode ? '#1C1917' : '#FAFAF9' }}>
              {previewMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-4 py-2.5"
                    style={{
                      background: msg.type === 'user' ? `linear-gradient(135deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -15)} 100%)` : darkMode ? '#292524' : '#FFFFFF',
                      color: msg.type === 'user' ? 'white' : (darkMode ? '#FAFAF9' : '#1C1917'),
                      border: msg.type === 'bot' ? `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}` : 'none',
                      borderRadius: `${formData.widget_border_radius}px`,
                      borderBottomLeftRadius: msg.type === 'bot' ? '4px' : `${formData.widget_border_radius}px`,
                      borderBottomRightRadius: msg.type === 'user' ? '4px' : `${formData.widget_border_radius}px`,
                      fontSize: `${formData.widget_font_size}px`
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.hadAnswer === false && <p className="text-xs mt-1 text-amber-500">Kunde inte hitta exakt svar</p>}
                  </div>
                </div>
              ))}
              {previewLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3" style={{ backgroundColor: darkMode ? '#292524' : '#FFFFFF', border: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`, borderRadius: `${formData.widget_border_radius}px` }}>
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

            <form onSubmit={handlePreviewSend} className="p-3" style={{ backgroundColor: darkMode ? '#292524' : '#FFFFFF', borderTop: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}` }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  placeholder="Skriv ett meddelande..."
                  className="flex-1 px-4 py-2.5 outline-none"
                  style={{
                    backgroundColor: darkMode ? '#1C1917' : '#F5F5F4',
                    color: darkMode ? '#FAFAF9' : '#1C1917',
                    border: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`,
                    borderRadius: '9999px',
                    fontSize: `${formData.widget_font_size}px`,
                    fontFamily: formData.widget_font_family
                  }}
                  disabled={previewLoading}
                />
                <button type="submit" disabled={previewLoading || !previewInput.trim()} className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50" style={{ backgroundColor: formData.primary_color }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-sm text-text-tertiary mt-4">Testa din widget med riktiga frågor från kunskapsbanken</p>
        </div>
      )}

      {/* Knowledge Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">{editingItem ? 'Redigera fråga' : 'Lägg till fråga'}</h2>
            </div>
            <form onSubmit={handleSaveKnowledge} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Kategori</label>
                <select value={knowledgeForm.category} onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })} className="input w-full">
                  <option value="">Välj kategori (valfritt)</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Fråga</label>
                <input type="text" value={knowledgeForm.question} onChange={(e) => setKnowledgeForm({ ...knowledgeForm, question: e.target.value })} className="input w-full" placeholder="T.ex. Hur säger jag upp min lägenhet?" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Svar</label>
                <textarea value={knowledgeForm.answer} onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answer: e.target.value })} className="input w-full" rows="4" placeholder="Skriv svaret här..." required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowKnowledgeModal(false)} className="btn btn-ghost">Avbryt</button>
                <button type="submit" className="btn btn-primary">Spara</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Hantera kategorier</h2>
              <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); setNewCategoryName('') }} className="text-text-tertiary hover:text-text-primary">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={editingCategory ? 'Nytt namn...' : 'Ny kategori...'}
                  className="input flex-1"
                />
                <button onClick={handleSaveCategory} disabled={!newCategoryName.trim()} className="btn btn-primary">
                  {editingCategory ? 'Uppdatera' : 'Lägg till'}
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg group">
                    <span className="text-text-primary">{cat.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name) }} className="p-1 text-text-tertiary hover:text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteCategory(cat)} className="p-1 text-text-tertiary hover:text-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Importera kunskapsbank</h2>
              <button onClick={() => { setShowImportModal(false); setImportUrl('') }} className="text-text-tertiary hover:text-text-primary">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              {/* File upload */}
              <div>
                <h3 className="font-medium text-text-primary mb-2">Ladda upp fil</h3>
                <p className="text-sm text-text-secondary mb-3">Stöder Excel (.xlsx), Word (.docx), PDF, CSV och TXT</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.docx,.doc,.pdf,.csv,.txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="btn btn-secondary w-full cursor-pointer flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Välj fil
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-bg-primary text-text-tertiary">eller</span></div>
              </div>

              {/* URL import */}
              <div>
                <h3 className="font-medium text-text-primary mb-2">Importera från URL</h3>
                <p className="text-sm text-text-secondary mb-3">Hämta frågor och svar från en webbsida</p>
                <div className="flex gap-2">
                  <input type="url" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://example.com/faq" className="input flex-1" />
                  <button onClick={handleUrlImport} disabled={!importUrl.trim() || importing} className="btn btn-primary">
                    {importing ? 'Importerar...' : 'Hämta'}
                  </button>
                </div>
              </div>

              {uploadProgress && (
                <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" />
                    <span className="text-sm text-accent">{uploadProgress}</span>
                  </div>
                </div>
              )}

              <div className="bg-bg-secondary rounded-lg p-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Tips för Excel/CSV</h4>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Kolumn A: Fråga</li>
                  <li>• Kolumn B: Svar</li>
                  <li>• Kolumn C: Kategori (valfritt)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function adjustColor(hex, amount) {
  if (!hex) return '#C4613D'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export default WidgetPage
