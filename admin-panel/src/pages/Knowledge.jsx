import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthContext } from '../App'

const API_BASE = '/api'

const CATEGORIES = [
  { value: '', label: 'Alla kategorier' },
  { value: 'hyra', label: 'Hyra & Betalning' },
  { value: 'felanmalan', label: 'Felanmälan' },
  { value: 'tvattstuga', label: 'Tvättstuga' },
  { value: 'parkering', label: 'Parkering' },
  { value: 'kontrakt', label: 'Kontrakt & Uppsägning' },
  { value: 'allmant', label: 'Allmänt' },
]

function Knowledge() {
  const { authFetch } = useContext(AuthContext)
  const location = useLocation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({ question: '', answer: '', category: '' })
  const [saving, setSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
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

  useEffect(() => {
    fetchKnowledge()
  }, [])

  // Handle prefilled question from Analytics page
  useEffect(() => {
    if (location.state?.prefillQuestion) {
      setEditItem(null)
      setFormData({ question: location.state.prefillQuestion, answer: '', category: '' })
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
    setFormData({ question: '', answer: '', category: '' })
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({ question: item.question, answer: item.answer, category: item.category || '' })
    setShowModal(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Är du säker på att du vill ta bort denna post?')) return

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
    const matchesSearch = !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find(c => c.value === value)
    return cat ? cat.label : value
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
    if (!confirm(`Är du säker på att du vill ta bort ${selectedItems.size} poster?`)) return

    try {
      const response = await authFetch(`${API_BASE}/knowledge/bulk`, {
        method: 'DELETE',
        body: JSON.stringify(Array.from(selectedItems))
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
        body: formData,
        headers: {} // Let browser set content-type with boundary
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
                  accept=".xlsx,.xls,.docx,.txt,.csv"
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
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
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
          className="input w-48"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
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
                  <div className="flex items-center gap-2 mb-2">
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
                <label className="input-label">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  <option value="">Välj kategori (valfritt)</option>
                  {CATEGORIES.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
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
    </div>
  )
}

export default Knowledge
