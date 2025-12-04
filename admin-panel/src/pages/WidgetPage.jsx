import { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

// Load Google Font dynamically for preview
const loadGoogleFont = (fontFamily) => {
  const fontId = `widget-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(fontId)) return // Already loaded

  // Map of supported fonts to their Google Fonts URL format
  const googleFonts = {
    'Inter': 'Inter:wght@400;500;600',
    'Roboto': 'Roboto:wght@400;500;700',
    'Open Sans': 'Open+Sans:wght@400;500;600',
    'Lato': 'Lato:wght@400;700',
    'Poppins': 'Poppins:wght@400;500;600',
    'Source Sans Pro': 'Source+Sans+Pro:wght@400;600',
    'Nunito': 'Nunito:wght@400;500;600',
    'Montserrat': 'Montserrat:wght@400;500;600',
  }

  const fontUrl = googleFonts[fontFamily]
  if (fontUrl) {
    const link = document.createElement('link')
    link.id = fontId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}&display=swap`
    document.head.appendChild(link)
  }
}

function WidgetPage({ widgetType }) {
  const { authFetch } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('settings')
  const [widget, setWidget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Settings form - internal widgets default to bottom-left, external to bottom-right
  const [formData, setFormData] = useState({
    primary_color: '#D97757',
    secondary_color: '#FEF3EC',
    background_color: '#FAF8F5',
    welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
    fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga.',
    subtitle: 'Alltid redo att hjälpa',
    language: 'sv',
    tone: '',  // professional, collegial, casual - empty means use widget_type default
    // Per-widget contact info
    display_name: '',
    contact_email: '',
    contact_phone: '',
    // Font and style options
    widget_font_family: 'Inter',
    widget_font_size: 14,
    widget_border_radius: 16,
    widget_position: widgetType === 'internal' ? 'bottom-left' : 'bottom-right',
    start_expanded: false  // Start widget open instead of as floating button
  })

  // Knowledge state
  const [knowledgeItems, setKnowledgeItems] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [knowledgeForm, setKnowledgeForm] = useState({ question: '', answer: '', category: '', widget_scope: 'widget' })
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
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [expandedSources, setExpandedSources] = useState({})
  const messagesEndRef = useRef(null)
  const [healthStatus, setHealthStatus] = useState(null)

  // Template state
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatePreview, setTemplatePreview] = useState(null)
  const [templatePreviewLoading, setTemplatePreviewLoading] = useState(false)
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])

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
    fetchTemplates()
    checkHealth()
  }, [widgetType])

  // Recheck health when settings tab is active (since preview is shown there)
  useEffect(() => {
    if (activeTab === 'settings') {
      checkHealth()
    }
  }, [activeTab])

  // Load Google Font for preview when font changes
  useEffect(() => {
    if (formData.widget_font_family) {
      loadGoogleFont(formData.widget_font_family)
    }
  }, [formData.widget_font_family])

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

  const fetchTemplates = async () => {
    setTemplatesLoading(true)
    try {
      const response = await authFetch(`${API_BASE}/templates`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (e) {
      console.error('Kunde inte hämta mallar:', e)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const fetchTemplatePreview = async (templateId) => {
    setTemplatePreviewLoading(true)
    try {
      const response = await authFetch(`${API_BASE}/templates/${templateId}/preview?limit=500`)
      if (response.ok) {
        const data = await response.json()
        setTemplatePreview(data)
        // Pre-select all categories
        if (data.categories) {
          setSelectedCategories(data.categories)
        }
      }
    } catch (e) {
      console.error('Kunde inte hämta mallförhandsvisning:', e)
    } finally {
      setTemplatePreviewLoading(false)
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !widget) return

    setApplyingTemplate(true)
    try {
      const response = await authFetch(`${API_BASE}/templates/${selectedTemplate.template_id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          replace_existing: false,
          categories_to_import: selectedCategories.length > 0 ? selectedCategories : null,
          widget_id: widget.id  // Associate imported items with this widget
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(`Importerade ${data.items_added || 'flera'} frågor och svar från mallen!`)
        fetchKnowledge(widget.id)
        setShowTemplateModal(false)
        setSelectedTemplate(null)
        setTemplatePreview(null)
        setSelectedCategories([])
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte applicera mallen')
      }
    } catch (e) {
      setError('Ett fel uppstod: ' + e.message)
    } finally {
      setApplyingTemplate(false)
    }
  }

  const openTemplateModal = (template) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
    fetchTemplatePreview(template.template_id)
  }

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
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
            secondary_color: existingWidget.secondary_color || '#FEF3EC',
            background_color: existingWidget.background_color || '#FAF8F5',
            welcome_message: existingWidget.welcome_message || 'Hej! Hur kan jag hjälpa dig idag?',
            fallback_message: existingWidget.fallback_message || 'Tyvärr kunde jag inte hitta ett svar.',
            subtitle: existingWidget.subtitle || 'Alltid redo att hjälpa',
            language: existingWidget.language || 'sv',
            tone: existingWidget.tone || '',
            // Per-widget contact info
            display_name: existingWidget.display_name || '',
            contact_email: existingWidget.contact_email || '',
            contact_phone: existingWidget.contact_phone || '',
            // Font and style options
            widget_font_family: existingWidget.widget_font_family || 'Inter',
            widget_font_size: existingWidget.widget_font_size || 14,
            widget_border_radius: existingWidget.widget_border_radius || 16,
            widget_position: existingWidget.widget_position || (widgetType === 'internal' ? 'bottom-left' : 'bottom-right'),
            start_expanded: existingWidget.start_expanded || false
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
          secondary_color: '#FEF3EC',
          background_color: '#FAF8F5',
          welcome_message: defaultWelcome,
          fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga.',
          subtitle: 'Alltid redo att hjälpa',
          language: 'sv',
          tone: ''  // Use widget_type default
        })
      })

      if (response.ok) {
        const newWidget = await response.json()
        setWidget(newWidget)
        setFormData({
          primary_color: newWidget.primary_color,
          secondary_color: newWidget.secondary_color || '#FEF3EC',
          background_color: newWidget.background_color || '#FAF8F5',
          welcome_message: newWidget.welcome_message,
          fallback_message: newWidget.fallback_message,
          subtitle: newWidget.subtitle,
          language: newWidget.language,
          tone: newWidget.tone || '',
          display_name: newWidget.display_name || '',
          contact_email: newWidget.contact_email || '',
          contact_phone: newWidget.contact_phone || '',
          widget_font_family: newWidget.widget_font_family || 'Inter',
          widget_font_size: newWidget.widget_font_size || 14,
          widget_border_radius: newWidget.widget_border_radius || 16,
          widget_position: newWidget.widget_position || (widgetType === 'internal' ? 'bottom-left' : 'bottom-right'),
          start_expanded: newWidget.start_expanded || false
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
        question: knowledgeForm.question,
        answer: knowledgeForm.answer,
        category: knowledgeForm.category,
        // Only set widget_id if scope is 'widget', otherwise null for shared
        widget_id: knowledgeForm.widget_scope === 'widget' ? widget.id : null
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
        setKnowledgeForm({ question: '', answer: '', category: '', widget_scope: 'widget' })
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

  const filteredKnowledge = knowledgeItems
    .filter(item =>
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by newest first (created_at descending)
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0)
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0)
      return dateB - dateA
    })

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
        setPreviewMessages(prev => [...prev, {
          type: 'bot',
          text: data.answer,
          hadAnswer: data.had_answer,
          sources: data.sources_detail || [],
          id: Date.now()
        }])
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
    setFeedbackGiven({})
  }

  const handlePreviewFeedback = (msgIndex, helpful) => {
    setFeedbackGiven(prev => ({ ...prev, [msgIndex]: helpful }))
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
    { id: 'knowledge', label: 'Kunskapsbank', icon: 'book', count: knowledgeItems.length }
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
                  <label className="block text-sm font-medium text-text-primary mb-1">Namn</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="input w-full"
                    placeholder={isExternal ? "T.ex. Hyresgästservice" : "T.ex. Albert"}
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
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">AI-ton</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: '' })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        !formData.tone
                          ? 'border-accent bg-accent-soft'
                          : 'border-border-subtle hover:border-accent/50'
                      }`}
                    >
                      <div className="font-medium text-text-primary text-sm">Standard</div>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {isExternal ? 'Professionell & vänlig' : 'Som en kollega'}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: 'collegial' })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.tone === 'collegial'
                          ? 'border-accent bg-accent-soft'
                          : 'border-border-subtle hover:border-accent/50'
                      }`}
                    >
                      <div className="font-medium text-text-primary text-sm">Kollegial</div>
                      <p className="text-xs text-text-tertiary mt-0.5">Varm & hjälpsam kollega</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: 'casual' })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.tone === 'casual'
                          ? 'border-accent bg-accent-soft'
                          : 'border-border-subtle hover:border-accent/50'
                      }`}
                    >
                      <div className="font-medium text-text-primary text-sm">Avslappnad</div>
                      <p className="text-xs text-text-tertiary mt-0.5">Som en kompis</p>
                    </button>
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">Påverkar hur AI:n formulerar sina svar - från professionell till mer personlig ton.</p>
                </div>
              </div>
            </div>

            {/* Appearance Section with Preview */}
            <div className="grid lg:grid-cols-[1fr,400px] gap-6">
              {/* Appearance Settings */}
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
                  {/* Color Settings */}
                  <div className="grid md:grid-cols-3 gap-4">
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
                      <p className="text-xs text-text-tertiary mt-1">Knappar, header & dina meddelanden</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Sekundärfärg</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border border-border-subtle"
                        />
                        <input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="input flex-1"
                        />
                      </div>
                      <p className="text-xs text-text-tertiary mt-1">AI-botens meddelandebubblor</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Bakgrundsfärg</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border border-border-subtle"
                        />
                        <input
                          type="text"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="input flex-1"
                        />
                      </div>
                      <p className="text-xs text-text-tertiary mt-1">Chattområdets bakgrund</p>
                    </div>
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
                    <div className="col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={formData.start_expanded}
                          onClick={() => setFormData({ ...formData, start_expanded: !formData.start_expanded })}
                          className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${formData.start_expanded ? 'bg-accent' : 'bg-stone-400 dark:bg-stone-600'}`}
                        >
                          <span
                            className={`pointer-events-none block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${formData.start_expanded ? 'translate-x-5' : 'translate-x-0.5'}`}
                          />
                        </button>
                        <div>
                          <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">Starta öppen</span>
                          <p className="text-xs text-text-tertiary">Widgeten öppnas direkt istället för att visa en flytande knapp</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">Förhandsgranskning</span>
                    <div className={`w-2 h-2 rounded-full ${healthStatus?.ollama === 'connected' ? 'bg-success animate-pulse' : 'bg-warning'}`} title={healthStatus?.ollama === 'connected' ? 'AI redo' : 'AI ej ansluten'} />
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded hover:bg-bg-secondary transition-colors" title={darkMode ? 'Ljust läge' : 'Mörkt läge'}>
                      {darkMode ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      )}
                    </button>
                    <button type="button" onClick={resetPreview} className="p-1.5 rounded hover:bg-bg-secondary transition-colors" title="Börja om">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    </button>
                  </div>
                </div>

                {/* Redesigned Widget Preview - Warm Earthy Style */}
                <div
                  className="overflow-hidden"
                  style={{
                    borderRadius: `${formData.widget_border_radius}px`,
                    fontFamily: `'${formData.widget_font_family}', system-ui, sans-serif`,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Header with Bobot mascot */}
                  <div
                    className="px-4 py-3.5"
                    style={{
                      background: `linear-gradient(145deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -30)} 100%)`,
                      borderBottom: `1px solid ${adjustColor(formData.primary_color, -40)}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini Bobot Mascot */}
                      <div className="relative">
                        <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                          {/* Feet */}
                          <rect x="25" y="95" width="30" height="12" rx="6" fill="rgba(255,255,255,0.2)" />
                          <rect x="65" y="95" width="30" height="12" rx="6" fill="rgba(255,255,255,0.2)" />
                          {/* Body */}
                          <rect x="30" y="55" width="60" height="42" rx="4" fill="rgba(255,255,255,0.95)" />
                          <rect x="36" y="75" width="20" height="16" rx="2" fill={formData.primary_color} opacity="0.3" />
                          <rect x="64" y="75" width="20" height="16" rx="2" fill={formData.primary_color} opacity="0.3" />
                          {/* Neck */}
                          <rect x="50" y="45" width="20" height="14" rx="2" fill="rgba(255,255,255,0.6)" />
                          {/* Head */}
                          <rect x="35" y="20" width="50" height="28" rx="4" fill="rgba(255,255,255,0.95)" />
                          {/* Eyes outer */}
                          <ellipse cx="48" cy="34" rx="10" ry="9" fill={formData.primary_color} opacity="0.2" />
                          <ellipse cx="72" cy="34" rx="10" ry="9" fill={formData.primary_color} opacity="0.2" />
                          {/* Eyes inner */}
                          <ellipse cx="48" cy="34" rx="7" ry="6" fill={adjustColor(formData.primary_color, -20)} />
                          <ellipse cx="72" cy="34" rx="7" ry="6" fill={adjustColor(formData.primary_color, -20)} />
                          {/* Pupils */}
                          <ellipse cx="48" cy="35" rx="4" ry="4" fill="white" />
                          <ellipse cx="72" cy="35" rx="4" ry="4" fill="white" />
                          {/* Eye highlights */}
                          <circle cx="50" cy="33" r="1.5" fill="rgba(255,255,255,0.8)" />
                          <circle cx="74" cy="33" r="1.5" fill="rgba(255,255,255,0.8)" />
                          {/* Nose */}
                          <rect x="56" y="30" width="8" height="8" rx="2" fill="rgba(255,255,255,0.4)" />
                          {/* Antenna */}
                          <rect x="58" y="12" width="4" height="10" rx="2" fill="rgba(255,255,255,0.4)" />
                          <circle cx="60" cy="10" r="4" fill="#4A9D7C">
                            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-white text-sm tracking-tight truncate">{formData.display_name || 'Bobot'}</h2>
                        <p className="text-white/70 text-xs truncate">{formData.subtitle || 'Alltid redo att hjälpa'}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/60 text-xs">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages area - Warm earthy background */}
                  <div
                    className="h-64 overflow-y-auto p-4 space-y-3"
                    style={{
                      backgroundColor: darkMode ? '#1C1917' : formData.background_color,
                      backgroundImage: darkMode ? 'none' : `radial-gradient(circle at 100% 0%, ${formData.primary_color}08 0%, transparent 50%)`
                    }}
                  >
                    {previewMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                          {msg.type === 'bot' && (
                            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${formData.primary_color}15` }}>
                              <svg width="14" height="14" viewBox="0 0 120 120" fill="none">
                                <rect x="35" y="20" width="50" height="28" rx="4" fill={formData.primary_color} opacity="0.6" />
                                <ellipse cx="48" cy="34" rx="5" ry="4" fill="white" />
                                <ellipse cx="72" cy="34" rx="5" ry="4" fill="white" />
                              </svg>
                            </div>
                          )}
                          <div
                            className="max-w-[80%] px-3.5 py-2.5 shadow-sm"
                            style={{
                              background: msg.type === 'user'
                                ? `linear-gradient(135deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -20)} 100%)`
                                : darkMode ? '#292524' : formData.secondary_color,
                              color: msg.type === 'user' ? 'white' : (darkMode ? '#FAF9F7' : '#44403C'),
                              border: msg.type === 'bot' ? `1px solid ${darkMode ? '#3D3835' : adjustColor(formData.secondary_color, -15)}` : 'none',
                              borderRadius: msg.type === 'user'
                                ? `${formData.widget_border_radius}px ${formData.widget_border_radius}px 4px ${formData.widget_border_radius}px`
                                : `${formData.widget_border_radius}px ${formData.widget_border_radius}px ${formData.widget_border_radius}px 4px`,
                              fontSize: `${formData.widget_font_size}px`,
                              lineHeight: '1.5',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Sources section for bot messages */}
                            {msg.type === 'bot' && msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2">
                                <button
                                  onClick={() => setExpandedSources(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                  className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md font-medium transition-colors"
                                  style={{
                                    background: `${formData.primary_color}15`,
                                    color: formData.primary_color,
                                    border: `1px solid ${formData.primary_color}30`
                                  }}
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={`transition-transform ${expandedSources[msg.id] ? 'rotate-90' : ''}`}
                                  >
                                    <polyline points="9 18 15 12 9 6"/>
                                  </svg>
                                  Källor ({msg.sources.length})
                                </button>

                                {expandedSources[msg.id] && (
                                  <div className="mt-2 space-y-2">
                                    {msg.sources.map((source, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 rounded-lg text-xs"
                                        style={{
                                          background: darkMode ? '#1C1917' : '#FAF9F7',
                                          border: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`
                                        }}
                                      >
                                        <div className="font-medium mb-1" style={{ color: formData.primary_color }}>
                                          {source.question}
                                        </div>
                                        <div style={{ color: darkMode ? '#A8A29E' : '#57534E', lineHeight: 1.5 }}>
                                          {source.answer}
                                        </div>
                                        {source.category && (
                                          <span
                                            className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px]"
                                            style={{
                                              background: darkMode ? '#292524' : '#F5F5F4',
                                              color: darkMode ? '#78716C' : '#78716C'
                                            }}
                                          >
                                            {source.category}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Feedback buttons for bot messages */}
                        {msg.type === 'bot' && i > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 ml-8" style={{ fontSize: `${formData.widget_font_size - 2}px` }}>
                            {feedbackGiven[i] === undefined ? (
                              <>
                                <span style={{ color: darkMode ? '#78716C' : '#A8A29E' }}>Hjälpsamt?</span>
                                <button
                                  onClick={() => handlePreviewFeedback(i, true)}
                                  className="p-1 rounded hover:bg-success/10 transition-colors"
                                  style={{ color: darkMode ? '#78716C' : '#A8A29E' }}
                                  title="Ja, hjälpsamt"
                                >
                                  👍
                                </button>
                                <button
                                  onClick={() => handlePreviewFeedback(i, false)}
                                  className="p-1 rounded hover:bg-error/10 transition-colors"
                                  style={{ color: darkMode ? '#78716C' : '#A8A29E' }}
                                  title="Nej, inte hjälpsamt"
                                >
                                  👎
                                </button>
                              </>
                            ) : (
                              <span style={{ color: feedbackGiven[i] ? '#22C55E' : '#EF4444' }}>
                                {feedbackGiven[i] ? '👍 Tack för feedback!' : '👎 Tack, vi förbättrar oss!'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {previewLoading && (
                      <div className="flex justify-start items-end gap-2">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${formData.primary_color}15` }}>
                          <svg width="14" height="14" viewBox="0 0 120 120" fill="none">
                            <rect x="35" y="20" width="50" height="28" rx="4" fill={formData.primary_color} opacity="0.6" />
                            <ellipse cx="48" cy="34" rx="5" ry="4" fill="white" />
                            <ellipse cx="72" cy="34" rx="5" ry="4" fill="white" />
                          </svg>
                        </div>
                        <div
                          className="px-4 py-3 shadow-sm"
                          style={{
                            backgroundColor: darkMode ? '#292524' : formData.secondary_color,
                            border: `1px solid ${darkMode ? '#3D3835' : adjustColor(formData.secondary_color, -15)}`,
                            borderRadius: `${formData.widget_border_radius}px ${formData.widget_border_radius}px ${formData.widget_border_radius}px 4px`
                          }}
                        >
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: formData.primary_color, animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: formData.primary_color, opacity: 0.7, animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: formData.primary_color, opacity: 0.4, animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div
                    className="p-3"
                    style={{
                      backgroundColor: darkMode ? '#292524' : '#FFFFFF',
                      borderTop: `1px solid ${darkMode ? '#3D3835' : '#E7E5E4'}`
                    }}
                  >
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={previewInput}
                        onChange={(e) => setPreviewInput(e.target.value)}
                        placeholder="Skriv ett meddelande..."
                        className="flex-1 px-4 py-2.5 outline-none transition-all"
                        style={{
                          backgroundColor: darkMode ? '#1C1917' : formData.background_color,
                          color: darkMode ? '#FAF9F7' : '#1C1917',
                          border: `1px solid ${darkMode ? '#3D3835' : adjustColor(formData.background_color, -20)}`,
                          borderRadius: '9999px',
                          fontSize: `${formData.widget_font_size}px`,
                          fontFamily: `'${formData.widget_font_family}', system-ui, sans-serif`
                        }}
                        disabled={previewLoading}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePreviewSend(e)}
                      />
                      <button
                        type="button"
                        onClick={handlePreviewSend}
                        disabled={previewLoading || !previewInput.trim()}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${adjustColor(formData.primary_color, -20)} 100%)`,
                          boxShadow: `0 2px 8px ${formData.primary_color}40`
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2L11 13" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-text-tertiary">Testa med riktiga frågor från kunskapsbanken</p>
              </div>
            </div>

            {/* Widget Embed Code Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Installera widget
              </h3>
              <p className="text-sm text-text-secondary mb-4">Kopiera koden nedan och klistra in den på din webbplats</p>
              {widget?.widget_key && (
                <div className="space-y-3">
                  <div className="relative">
                    <pre className="bg-bg-secondary border border-border-subtle rounded-lg p-4 text-xs text-text-primary overflow-x-auto font-mono whitespace-pre-wrap">
{`<script src="https://cdn.bobot.nu/widget.js"></script>
<script>
  Bobot.init({
    widgetKey: '${widget.widget_key}',
    position: '${formData.widget_position}'${formData.start_expanded ? `,
    startExpanded: true` : ''}
  });
</script>`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        const expandedOption = formData.start_expanded ? `,\n    startExpanded: true` : ''
                        navigator.clipboard.writeText(`<script src="https://cdn.bobot.nu/widget.js"></script>\n<script>\n  Bobot.init({\n    widgetKey: '${widget.widget_key}',\n    position: '${formData.widget_position}'${expandedOption}\n  });\n</script>`)
                        setSuccess('Kod kopierad!')
                        setTimeout(() => setSuccess(''), 2000)
                      }}
                      className="absolute top-2 right-2 btn btn-ghost text-xs py-1 px-2"
                    >
                      Kopiera
                    </button>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Klistra in koden precis före <code className="bg-bg-tertiary px-1 py-0.5 rounded">&lt;/body&gt;</code> på din webbplats. Positionen ({formData.widget_position === 'bottom-right' ? 'nedre högra' : 'nedre vänstra'} hörnet){formData.start_expanded ? ' och automatisk öppning' : ''} är inkluderad.
                  </p>
                </div>
              )}
            </div>

            {/* Save button with inline success message */}
            <div className="flex items-center justify-end gap-3">
              {success && (
                <span className="text-success text-sm animate-fade-in flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {success}
                </span>
              )}
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
          {/* Templates section - always show if templates are available */}
          {templates.length > 0 && (
            <div className="mb-6">
              <div className="card p-5 border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">Kom igång snabbt med mallar</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Importera färdiga frågor och svar anpassade för din bransch. Du kan redigera och anpassa innehållet efter dina behov.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {templates.map(template => (
                        <button
                          key={template.template_id}
                          onClick={() => openTemplateModal(template)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-bg-secondary rounded-lg border border-border-subtle hover:border-accent hover:shadow-sm transition-all group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            {template.industry === 'property_management' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                            )}
                          </span>
                          <div className="text-left">
                            <div className="font-medium text-text-primary text-sm">{template.name}</div>
                            <div className="text-xs text-text-tertiary">{template.item_count || template.items?.length || '?'} frågor</div>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-accent ml-2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
              {filteredKnowledge.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedItems.length === filteredKnowledge.length && filteredKnowledge.length > 0
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-accent-soft hover:text-accent'
                  }`}
                >
                  {selectedItems.length === filteredKnowledge.length && filteredKnowledge.length > 0 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    </svg>
                  )}
                  Välj alla
                </button>
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

              {/* Template options if available */}
              {templates.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-text-secondary mb-3">Börja med en färdig mall:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {templates.map(template => (
                      <button
                        key={template.template_id}
                        onClick={() => openTemplateModal(template)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-accent-soft text-accent rounded-lg hover:bg-accent hover:text-white transition-colors text-sm"
                      >
                        {template.industry === 'property_management' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        )}
                        {template.name}
                      </button>
                    ))}
                  </div>
                  <div className="my-4 flex items-center gap-4">
                    <div className="flex-1 border-t border-border-subtle"></div>
                    <span className="text-xs text-text-tertiary">eller</span>
                    <div className="flex-1 border-t border-border-subtle"></div>
                  </div>
                </div>
              )}

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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setKnowledgeForm({
                            question: item.question,
                            answer: item.answer,
                            category: item.category || '',
                            widget_scope: item.widget_id ? 'widget' : 'shared'
                          })
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
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Tillgänglighet</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${knowledgeForm.widget_scope === 'shared' ? 'border-accent bg-accent-soft' : 'border-border-default hover:border-accent/50'}`}>
                    <input
                      type="radio"
                      name="widget_scope"
                      value="shared"
                      checked={knowledgeForm.widget_scope === 'shared'}
                      onChange={() => setKnowledgeForm({ ...knowledgeForm, widget_scope: 'shared' })}
                      className="w-4 h-4 text-accent"
                    />
                    <div>
                      <p className="font-medium text-text-primary">Delad</p>
                      <p className="text-xs text-text-tertiary">Visas i både kundtjänst och medarbetarstöd</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${knowledgeForm.widget_scope === 'widget' ? 'border-accent bg-accent-soft' : 'border-border-default hover:border-accent/50'}`}>
                    <input
                      type="radio"
                      name="widget_scope"
                      value="widget"
                      checked={knowledgeForm.widget_scope === 'widget'}
                      onChange={() => setKnowledgeForm({ ...knowledgeForm, widget_scope: 'widget' })}
                      className="w-4 h-4 text-accent"
                    />
                    <div>
                      <p className="font-medium text-text-primary">Endast {isExternal ? 'kundtjänst' : 'medarbetarstöd'}</p>
                      <p className="text-xs text-text-tertiary">Visas endast i denna widget</p>
                    </div>
                  </label>
                </div>
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

      {/* Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{selectedTemplate.name}</h2>
                <p className="text-sm text-text-secondary mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setSelectedTemplate(null)
                  setTemplatePreview(null)
                  setSelectedCategories([])
                }}
                className="text-text-tertiary hover:text-text-primary text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {templatePreviewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : templatePreview ? (
                <div className="space-y-6">
                  {/* Category selection */}
                  <div>
                    <h3 className="font-medium text-text-primary mb-3">Välj kategorier att importera</h3>
                    <div className="flex flex-wrap gap-2">
                      {templatePreview.categories?.map(category => (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedCategories.includes(category)
                              ? 'bg-accent text-white'
                              : 'bg-bg-secondary text-text-secondary hover:bg-accent-soft hover:text-accent'
                          }`}
                        >
                          {category}
                          {selectedCategories.includes(category) && (
                            <span className="ml-1.5">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setSelectedCategories(templatePreview.categories || [])}
                        className="text-xs text-accent hover:underline"
                      >
                        Välj alla
                      </button>
                      <span className="text-text-tertiary">|</span>
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-accent hover:underline"
                      >
                        Avmarkera alla
                      </button>
                    </div>
                  </div>

                  {/* Preview items */}
                  <div>
                    <h3 className="font-medium text-text-primary mb-3">
                      Förhandsvisning ({selectedCategories.length > 0
                        ? templatePreview.items?.filter(item => selectedCategories.includes(item.category)).length
                        : templatePreview.items?.length || 0} frågor)
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-border-subtle rounded-lg">
                      {templatePreview.items
                        ?.filter(item => selectedCategories.length === 0 || selectedCategories.includes(item.category))
                        .slice(0, 20)
                        .map((item, index) => (
                          <div
                            key={index}
                            className={`p-3 ${index % 2 === 0 ? 'bg-bg-secondary' : 'bg-bg-primary'}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="badge badge-accent text-xs flex-shrink-0">{item.category}</span>
                              <div className="min-w-0">
                                <p className="font-medium text-text-primary text-sm">{item.question}</p>
                                <p className="text-text-secondary text-xs mt-1 line-clamp-2">{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {templatePreview.items?.filter(item => selectedCategories.length === 0 || selectedCategories.includes(item.category)).length > 20 && (
                        <div className="p-3 text-center text-text-tertiary text-sm">
                          ... och {templatePreview.items.filter(item => selectedCategories.length === 0 || selectedCategories.includes(item.category)).length - 20} fler frågor
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Vad händer vid import?</p>
                        <ul className="text-blue-700 dark:text-blue-300 space-y-0.5">
                          <li>• Frågorna läggs till i din kunskapsbank</li>
                          <li>• Du kan redigera och anpassa innehållet efteråt</li>
                          <li>• Befintliga frågor påverkas inte</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  Kunde inte ladda mallförhandsvisning
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border-subtle flex items-center justify-between flex-shrink-0">
              <span className="text-sm text-text-secondary">
                {selectedCategories.length > 0
                  ? `${templatePreview?.items?.filter(item => selectedCategories.includes(item.category)).length || 0} frågor valda`
                  : `${templatePreview?.items?.length || 0} frågor totalt`}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTemplateModal(false)
                    setSelectedTemplate(null)
                    setTemplatePreview(null)
                    setSelectedCategories([])
                  }}
                  className="btn btn-ghost"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleApplyTemplate}
                  disabled={applyingTemplate || selectedCategories.length === 0}
                  className="btn btn-primary"
                >
                  {applyingTemplate ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importerar...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Importera mall
                    </>
                  )}
                </button>
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
