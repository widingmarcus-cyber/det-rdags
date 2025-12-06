import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthContext } from '../App'

const API_BASE = '/api'

// Default categories
const DEFAULT_CATEGORIES = [
  'Hyra & Betalning',
  'Felanmälan',
  'Tvättstuga',
  'Parkering',
  'Kontrakt & Uppsägning',
  'Allmänt',
]

function Knowledge() {
  const { authFetch } = useContext(AuthContext)
  const location = useLocation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({ question: '', answer: '', category: '', widget_id: null })
  const [saving, setSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterWidget, setFilterWidget] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [importingUrl, setImportingUrl] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [similarQuestions, setSimilarQuestions] = useState([])
  const [checkingSimilar, setCheckingSimilar] = useState(false)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  // Template states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatePreview, setTemplatePreview] = useState(null)
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [templateWidgetId, setTemplateWidgetId] = useState(null) // null = shared knowledge
  // Widget states
  const [widgets, setWidgets] = useState([])

  useEffect(() => {
    fetchKnowledge()
    fetchSettings()
    fetchWidgets()
  }, [])

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

  const fetchSettings = async () => {
    try {
      const response = await authFetch(`${API_BASE}/settings`)
      if (response.ok) {
        const data = await response.json()
        if (data.custom_categories) {
          try {
            const parsed = JSON.parse(data.custom_categories)
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Support both old format [{value, label}] and new format [string]
              const cats = parsed.map(c => typeof c === 'string' ? c : c.label)
              setCategories(cats)
            }
          } catch {
            // Use default categories if parsing fails
          }
        }
      }
    } catch (error) {
      console.error('Kunde inte hämta inställningar:', error)
    }
  }

  const saveCategories = async (newCategories) => {
    try {
      await authFetch(`${API_BASE}/settings`, {
        method: 'PUT',
        body: JSON.stringify({ custom_categories: JSON.stringify(newCategories) })
      })
      setCategories(newCategories)
    } catch (error) {
      console.error('Kunde inte spara kategorier:', error)
    }
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    if (categories.includes(newCategoryName.trim())) return
    const newCategories = [...categories, newCategoryName.trim()]
    saveCategories(newCategories)
    setNewCategoryName('')
  }

  const updateCategory = (oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) {
      setEditingCategory(null)
      return
    }
    const newCategories = categories.map(c => c === oldName ? newName.trim() : c)
    saveCategories(newCategories)
    setEditingCategory(null)
    // Update items with old category name
    items.forEach(item => {
      if (item.category === oldName) {
        authFetch(`${API_BASE}/knowledge/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...item, category: newName.trim() })
        })
      }
    })
    fetchKnowledge()
  }

  const deleteCategory = (name) => {
    if (!window.confirm(`Ta bort kategorin "${name}"? Frågor i denna kategori blir utan kategori.`)) return
    const newCategories = categories.filter(c => c !== name)
    saveCategories(newCategories)
  }

  // Handle prefilled question from Analytics page
  useEffect(() => {
    if (location.state?.prefillQuestion) {
      setEditItem(null)
      setFormData({ question: location.state.prefillQuestion, answer: '', category: '', widget_id: null })
      setShowModal(true)
      // Clear the state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Check for similar questions when typing (debounced)
  useEffect(() => {
    if (!showModal || editItem) {
      setSimilarQuestions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      if (formData.question.length >= 5) {
        setCheckingSimilar(true)
        try {
          const response = await authFetch(`${API_BASE}/knowledge/check-similar`, {
            method: 'POST',
            body: JSON.stringify({ question: formData.question })
          })
          if (response.ok) {
            const data = await response.json()
            setSimilarQuestions(data)
          }
        } catch (error) {
          console.error('Kunde inte söka liknande:', error)
        } finally {
          setCheckingSimilar(false)
        }
      } else {
        setSimilarQuestions([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.question, showModal, editItem])

  const fetchKnowledge = async () => {
    try {
      const response = await authFetch(`${API_BASE}/knowledge`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta kunskapsbas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditItem(null)
    setFormData({ question: '', answer: '', category: '', widget_id: filterWidget ? parseInt(filterWidget) : null })
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({ question: item.question, answer: item.answer, category: item.category || '', widget_id: item.widget_id || null })
    setShowModal(true)
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna post?')) return

    try {
      const response = await authFetch(`${API_BASE}/knowledge/${item.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchKnowledge()
      }
    } catch (error) {
      console.error('Kunde inte ta bort:', error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editItem) {
        const response = await authFetch(`${API_BASE}/knowledge/${editItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          setShowModal(false)
          fetchKnowledge()
        }
      } else {
        const response = await authFetch(`${API_BASE}/knowledge`, {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          setShowModal(false)
          fetchKnowledge()
        }
      }
    } catch (error) {
      console.error('Kunde inte spara:', error)
    } finally {
      setSaving(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory
    const matchesWidget = !filterWidget || (filterWidget === 'shared' ? !item.widget_id : item.widget_id === parseInt(filterWidget))
    const matchesSearch = !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesWidget && matchesSearch
  })

  const getCategoryLabel = (value) => {
    // Categories are now simple strings, so just return the value
    return value || 'Ingen kategori'
  }

  const handleUrlImport = async (e) => {
    e.preventDefault()
    if (!urlInput.trim()) return

    setImportingUrl(true)
    setUploadResult(null)

    try {
      const response = await authFetch(`${API_BASE}/knowledge/import-url`, {
        method: 'POST',
        body: JSON.stringify({ url: urlInput.trim() })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUploadResult({
          success: true,
          message: result.message,
          count: result.items_added
        })
        fetchKnowledge()
        setShowUrlModal(false)
        setUrlInput('')
      } else {
        setUploadResult({
          success: false,
          message: result.message || result.detail || 'Import misslyckades'
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Ett fel uppstod vid import: ' + error.message
      })
    } finally {
      setImportingUrl(false)
    }
  }

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    if (!window.confirm(`Är du säker på att du vill ta bort ${selectedItems.size} poster?`)) return

    try {
      const response = await authFetch(`${API_BASE}/knowledge/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ item_ids: Array.from(selectedItems) })
      })

      if (response.ok) {
        setUploadResult({
          success: true,
          message: `${selectedItems.size} poster har tagits bort`
        })
        setSelectedItems(new Set())
        setSelectMode(false)
        fetchKnowledge()
      }
    } catch (error) {
      console.error('Kunde inte ta bort:', error)
    }
  }

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const response = await authFetch(`${API_BASE}/export/knowledge?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kunskapsbas.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
        setUploadResult({ success: true, message: `Kunskapsbasen exporterad som ${format.toUpperCase()}` })
      } else {
        setUploadResult({ success: false, message: 'Export misslyckades' })
      }
    } catch (error) {
      console.error('Export failed:', error)
      setUploadResult({ success: false, message: 'Export misslyckades: ' + error.message })
    } finally {
      setExporting(false)
    }
  }

  // Template functions
  const fetchTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await authFetch(`${API_BASE}/templates`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta mallar:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const fetchTemplatePreview = async (templateId) => {
    try {
      const response = await authFetch(`${API_BASE}/templates/${templateId}/preview?limit=5`)
      if (response.ok) {
        const data = await response.json()
        setTemplatePreview(data)
        setSelectedCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Kunde inte hämta förhandsgranskning:', error)
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    fetchTemplatePreview(template.template_id)
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    const confirmMessage = replaceExisting
      ? 'VARNING: Detta kommer att ta bort all befintlig kunskapsbas och ersätta med mallen. Är du säker?'
      : 'Lägga till mallens innehåll till din kunskapsbas?'

    if (!window.confirm(confirmMessage)) return

    setApplyingTemplate(true)
    try {
      const response = await authFetch(`${API_BASE}/templates/${selectedTemplate.template_id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          replace_existing: replaceExisting,
          categories_to_import: selectedCategories.length > 0 && selectedCategories.length < (templatePreview?.categories?.length || 0)
            ? selectedCategories
            : null,
          widget_id: templateWidgetId
        })
      })

      // Try to parse response as JSON
      const text = await response.text()
      let result
      try {
        result = JSON.parse(text)
      } catch {
        setUploadResult({
          success: false,
          message: 'Serverfel: Kunde inte bearbeta svaret'
        })
        return
      }

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message
        })
        setShowTemplateModal(false)
        setSelectedTemplate(null)
        setTemplatePreview(null)
        setReplaceExisting(false)
        setSelectedCategories([])
        setTemplateWidgetId(null)
        fetchKnowledge()
      } else {
        setUploadResult({
          success: false,
          message: result.detail || 'Kunde inte applicera mall'
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Ett fel uppstod: ' + error.message
      })
    } finally {
      setApplyingTemplate(false)
    }
  }

  const openTemplateModal = () => {
    setShowTemplateModal(true)
    fetchTemplates()
  }

  const toggleCategorySelection = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await authFetch(`${API_BASE}/knowledge/upload`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          count: result.items_added
        })
        fetchKnowledge()
      } else {
        setUploadResult({
          success: false,
          message: result.detail || 'Uppladdning misslyckades'
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Ett fel uppstod vid uppladdning: ' + error.message
      })
    } finally {
      setUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Responsibility Disclaimer */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center text-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-text-primary mb-1">Viktigt: Du ansvarar för innehållet</h3>
          <p className="text-sm text-text-secondary">
            All information du lägger till i kunskapsbasen kommer att användas av AI:n för att svara dina kunder.
            <strong className="text-text-primary"> Du ansvarar för att informationen är korrekt och uppdaterad.</strong> Felaktig information kan leda till att dina hyresgäster får fel svar.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Kunskapsbas</h1>
          <p className="text-text-secondary mt-1">Hantera frågor och svar för din chatbot</p>
        </div>
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <button
                onClick={() => { setSelectMode(false); setSelectedItems(new Set()) }}
                className="btn btn-ghost"
              >
                Avbryt
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedItems.size === 0}
                className="btn btn-ghost text-error hover:bg-error-soft"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Ta bort ({selectedItems.size})
              </button>
            </>
          ) : (
            <>
              {items.length > 0 && (
                <>
                  <button
                    onClick={() => setSelectMode(true)}
                    className="btn btn-ghost"
                    title="Välj flera"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                  <div className="relative group">
                    <button
                      className="btn btn-ghost"
                      title="Exportera kunskapsbas"
                      disabled={exporting}
                    >
                      {exporting ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      )}
                      Exportera
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-bg-tertiary border border-border-subtle rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary rounded-t-lg transition-colors"
                      >
                        Exportera CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary rounded-b-lg transition-colors"
                      >
                        Exportera JSON
                      </button>
                    </div>
                  </div>
                </>
              )}
              <button
                onClick={openTemplateModal}
                className="btn btn-ghost"
                title="Använd färdig mall för fastighetsbolag"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Mallar
              </button>
              <button
                onClick={() => setShowUrlModal(true)}
                className="btn btn-ghost"
                title="Importera från URL"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Importera URL
              </button>
              <label className={`btn btn-ghost cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.docx,.pdf,.txt,.csv"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                {uploading ? 'Laddar upp...' : 'Ladda upp fil'}
              </label>
              <button onClick={handleAdd} className="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Lägg till
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload result notification */}
      {uploadResult && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          uploadResult.success
            ? 'bg-success/10 border border-success/20 text-success'
            : 'bg-error/10 border border-error/20 text-error'
        }`}>
          <div className="flex items-center gap-3">
            {uploadResult.success ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span>{uploadResult.message}</span>
          </div>
          <button
            onClick={() => setUploadResult(null)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* File format info */}
      <div className="bg-accent-soft border border-accent/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-text-primary">Ladda upp dokument</p>
            <p className="text-text-secondary mt-1">
              <strong>Excel (.xlsx):</strong> Kolumnerna "Fråga" och "Svar" (+ valfri "Kategori")<br />
              <strong>Word (.docx):</strong> AI analyserar texten och skapar frågor/svar automatiskt<br />
              <strong>Text/CSV:</strong> Stöd för båda formaterade och ostrukturerade texter
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 min-w-0 w-full sm:w-auto sm:min-w-[200px]">
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
            placeholder="Sök frågor och svar..."
            className="input pl-12"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input w-full sm:w-auto sm:min-w-[140px]"
          aria-label="Filtrera efter kategori"
        >
          <option value="">Alla kategorier</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {widgets.length > 0 && (
          <select
            value={filterWidget}
            onChange={(e) => setFilterWidget(e.target.value)}
            className="input w-full sm:w-auto sm:min-w-[140px]"
            aria-label="Filtrera efter widget"
          >
            <option value="">Alla widgets</option>
            <option value="shared">Delade (alla widgets)</option>
            {widgets.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}
        <button
          onClick={() => setShowCategoryModal(true)}
          className="btn btn-ghost w-full sm:w-auto"
          title="Hantera kategorier"
          aria-label="Hantera kategorier"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
          </svg>
          Kategorier
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Laddar...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary">Ingen kunskapsbas ännu</h3>
          <p className="text-text-secondary mt-2">Lägg till din första fråga och svar för att komma igång</p>
          <button onClick={handleAdd} className="btn btn-primary mt-4">
            Lägg till första posten
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary">Inga resultat matchar din sökning</p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectMode && filteredItems.length > 0 && (
            <div className="flex items-center gap-3 py-2 px-4 bg-bg-tertiary rounded-lg border border-border-subtle">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredItems.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border accent-accent"
                />
                <span className="text-sm text-text-secondary">
                  Välj alla ({filteredItems.length})
                </span>
              </label>
            </div>
          )}
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`card group ${selectMode ? 'cursor-pointer' : ''} ${selectedItems.has(item.id) ? 'ring-2 ring-accent' : ''}`}
              onClick={selectMode ? () => toggleSelectItem(item.id) : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                {selectMode && (
                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-border accent-accent"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {item.widget_name ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.widget_name}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        Delad
                      </span>
                    )}
                    {item.category && (
                      <span className="badge badge-accent">
                        {getCategoryLabel(item.category)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary">{item.question}</h3>
                  <p className="text-text-secondary mt-2 text-sm whitespace-pre-wrap line-clamp-3">{item.answer}</p>
                </div>
                {!selectMode && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-text-tertiary hover:text-accent hover:bg-accent-soft rounded-md transition-colors"
                      title="Redigera"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-text-tertiary hover:text-error hover:bg-error-soft rounded-md transition-colors"
                      title="Ta bort"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-text-primary/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                {editItem ? 'Redigera post' : 'Lägg till ny post'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="input-label">Tillgänglighet</label>
                <div className="space-y-2">
                  {/* Shared option */}
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-accent/50 cursor-pointer transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                    <input
                      type="radio"
                      name="widget_scope"
                      checked={formData.widget_id === null}
                      onChange={() => setFormData({ ...formData, widget_id: null })}
                      className="w-4 h-4 text-accent accent-accent"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-text-primary">Delad</span>
                      <p className="text-xs text-text-tertiary">Tillgänglig för både kundtjänst och medarbetarstöd</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Kundtjänst</span>
                      <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Medarbetare</span>
                    </div>
                  </label>
                  {/* External only option */}
                  {(() => {
                    const externalWidget = widgets.find(w => w.widget_type === 'external')
                    return (
                      <label className={`flex items-center gap-3 p-3 rounded-lg border border-border-subtle cursor-pointer transition-colors ${externalWidget ? 'hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5' : 'opacity-50 cursor-not-allowed'}`}>
                        <input
                          type="radio"
                          name="widget_scope"
                          checked={externalWidget && formData.widget_id === externalWidget.id}
                          onChange={() => externalWidget && setFormData({ ...formData, widget_id: externalWidget.id })}
                          disabled={!externalWidget}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-text-primary">Endast kundtjänst</span>
                          <p className="text-xs text-text-tertiary">
                            {externalWidget ? 'Endast för kunder på hemsidan' : 'Besök Kundtjänst-sidan för att aktivera'}
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Kundtjänst</span>
                      </label>
                    )
                  })()}
                  {/* Internal only option */}
                  {(() => {
                    const internalWidget = widgets.find(w => w.widget_type === 'internal')
                    return (
                      <label className={`flex items-center gap-3 p-3 rounded-lg border border-border-subtle cursor-pointer transition-colors ${internalWidget ? 'hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5' : 'opacity-50 cursor-not-allowed'}`}>
                        <input
                          type="radio"
                          name="widget_scope"
                          checked={internalWidget && formData.widget_id === internalWidget.id}
                          onChange={() => internalWidget && setFormData({ ...formData, widget_id: internalWidget.id })}
                          disabled={!internalWidget}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-text-primary">Endast medarbetarstöd</span>
                          <p className="text-xs text-text-tertiary">
                            {internalWidget ? 'Endast för anställda internt' : 'Besök Medarbetarstöd-sidan för att aktivera'}
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Medarbetare</span>
                      </label>
                    )
                  })()}
                </div>
              </div>
              <div>
                <label className="input-label">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  <option value="">Välj kategori (valfritt)</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Fråga</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="T.ex. Hur säger jag upp min lägenhet?"
                  className="input"
                  required
                />
                {/* Similar questions warning */}
                {!editItem && (checkingSimilar || similarQuestions.length > 0) && (
                  <div className="mt-2">
                    {checkingSimilar ? (
                      <p className="text-xs text-text-tertiary">Söker liknande frågor...</p>
                    ) : similarQuestions.length > 0 ? (
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning flex-shrink-0 mt-0.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-warning mb-1">Liknande frågor finns redan:</p>
                            <div className="space-y-1">
                              {similarQuestions.map(sq => (
                                <div key={sq.id} className="text-xs text-text-secondary bg-bg-secondary rounded px-2 py-1">
                                  <span className="font-medium">{sq.similarity}% likhet:</span> {sq.question}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <div>
                <label className="input-label">Svar</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Skriv svaret här..."
                  rows={5}
                  className="input resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Sparar...' : 'Spara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* URL Import Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-text-primary/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                Importera från URL
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                AI analyserar innehållet och skapar frågor/svar automatiskt
              </p>
            </div>
            <form onSubmit={handleUrlImport} className="p-6 space-y-4">
              <div>
                <label className="input-label">URL</label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exempel.se/vanliga-fragor"
                  className="input"
                  disabled={importingUrl}
                  required
                />
              </div>
              <div className="bg-accent-soft border border-accent/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p className="text-xs text-text-secondary">
                    Fungerar bäst med sidor som innehåller FAQ, vanliga frågor, eller strukturerad information.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowUrlModal(false); setUrlInput('') }}
                  className="btn btn-ghost"
                  disabled={importingUrl}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={importingUrl || !urlInput.trim()}
                  className="btn btn-primary"
                >
                  {importingUrl ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Importerar...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      Importera
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
          <div className="bg-bg-tertiary rounded-xl shadow-lg w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h3 id="category-modal-title" className="text-lg font-medium text-text-primary">Hantera kategorier</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                aria-label="Stäng"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Add new category */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="Ny kategori..."
                  className="input flex-1"
                  aria-label="Ny kategori"
                />
                <button
                  onClick={addCategory}
                  disabled={!newCategoryName.trim()}
                  className="btn btn-primary"
                  aria-label="Lägg till kategori"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Category list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-center py-4 text-text-tertiary">Inga kategorier. Lägg till din första!</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2 p-2 bg-bg-secondary rounded-lg">
                      {editingCategory === cat ? (
                        <input
                          type="text"
                          defaultValue={cat}
                          autoFocus
                          onBlur={(e) => updateCategory(cat, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateCategory(cat, e.target.value)
                            if (e.key === 'Escape') setEditingCategory(null)
                          }}
                          className="input flex-1 py-1"
                          aria-label="Redigera kategori"
                        />
                      ) : (
                        <>
                          <span className="flex-1 text-text-primary">{cat}</span>
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
                            title="Redigera"
                            aria-label={`Redigera ${cat}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            className="p-1.5 hover:bg-error-soft hover:text-error rounded transition-colors"
                            title="Ta bort"
                            aria-label={`Ta bort ${cat}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs text-text-tertiary">
                Klicka på pennan för att redigera, eller papperskorgen för att ta bort.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Template Import Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-text-primary/50 flex items-center justify-center p-4 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
          <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 id="template-modal-title" className="text-lg font-semibold text-text-primary">
                Kunskapsmallar
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Kom igång snabbt med färdiga frågor och svar för fastighetsbolag
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingTemplates ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Laddar mallar...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Inga mallar tillgängliga</p>
                </div>
              ) : !selectedTemplate ? (
                <div className="space-y-3">
                  {templates.map(template => (
                    <button
                      key={template.template_id}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full text-left p-4 bg-bg-secondary hover:bg-bg-primary border border-border-subtle rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-text-primary">{template.name}</h3>
                          <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                            <span className="flex items-center gap-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              {template.item_count} frågor/svar
                            </span>
                            <span className="flex items-center gap-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
                              </svg>
                              {template.categories.length} kategorier
                            </span>
                            <span>v{template.version}</span>
                          </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back button */}
                  <button
                    onClick={() => { setSelectedTemplate(null); setTemplatePreview(null); }}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Tillbaka till mallar
                  </button>

                  {/* Template info */}
                  <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                    <h3 className="font-medium text-text-primary">{selectedTemplate.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{selectedTemplate.description}</p>
                    <p className="text-sm text-accent mt-2 font-medium">
                      {selectedTemplate.item_count} frågor/svar i {selectedTemplate.categories.length} kategorier
                    </p>
                  </div>

                  {/* Category selection */}
                  {templatePreview?.categories && templatePreview.categories.length > 0 && (
                    <div>
                      <label className="input-label">Välj kategorier att importera</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {templatePreview.categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => toggleCategorySelection(cat)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              selectedCategories.includes(cat)
                                ? 'bg-accent text-white border-accent'
                                : 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-accent'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-text-tertiary mt-2">
                        {selectedCategories.length === templatePreview.categories.length
                          ? 'Alla kategorier valda'
                          : `${selectedCategories.length} av ${templatePreview.categories.length} valda`
                        }
                      </p>
                    </div>
                  )}

                  {/* Widget selection */}
                  {widgets.length > 0 && (
                    <div>
                      <label className="input-label">Importera till widget</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => setTemplateWidgetId(null)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            templateWidgetId === null
                              ? 'bg-accent text-white border-accent'
                              : 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-accent'
                          }`}
                        >
                          Delad (alla widgets)
                        </button>
                        {widgets.map(w => (
                          <button
                            key={w.id}
                            onClick={() => setTemplateWidgetId(w.id)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              templateWidgetId === w.id
                                ? 'bg-accent text-white border-accent'
                                : 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-accent'
                            }`}
                          >
                            {w.name || (w.widget_type === 'external' ? 'Extern' : 'Intern')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {templatePreview?.preview_items && templatePreview.preview_items.length > 0 && (
                    <div>
                      <label className="input-label">Förhandsgranskning (5 av {templatePreview.total_items})</label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {templatePreview.preview_items.map((item, idx) => (
                          <div key={idx} className="bg-bg-secondary rounded-lg p-3 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-accent font-medium">F:</span>
                              <span className="text-text-primary">{item.question}</span>
                            </div>
                            <div className="flex items-start gap-2 mt-1">
                              <span className="text-text-tertiary font-medium">S:</span>
                              <span className="text-text-secondary line-clamp-2">{item.answer}</span>
                            </div>
                            {item.category && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-bg-tertiary text-xs text-text-tertiary rounded">
                                {item.category}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Replace option */}
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replaceExisting}
                        onChange={(e) => setReplaceExisting(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-border accent-warning"
                      />
                      <div>
                        <span className="font-medium text-text-primary">Ersätt befintlig kunskapsbas</span>
                        <p className="text-xs text-warning mt-1">
                          Varning: Detta tar bort alla befintliga frågor/svar och ersätter med mallen
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setSelectedTemplate(null)
                  setTemplatePreview(null)
                  setReplaceExisting(false)
                  setSelectedCategories([])
                }}
                className="btn btn-ghost"
                disabled={applyingTemplate}
              >
                Avbryt
              </button>
              {selectedTemplate && (
                <button
                  onClick={handleApplyTemplate}
                  disabled={applyingTemplate || selectedCategories.length === 0}
                  className="btn btn-primary"
                >
                  {applyingTemplate ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Applicerar...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Applicera mall
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Knowledge
