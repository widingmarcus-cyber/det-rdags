import { useState, useEffect, useContext } from 'react'
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

  useEffect(() => {
    fetchKnowledge()
  }, [])

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
          {filteredItems.map((item) => (
            <div key={item.id} className="card group">
              <div className="flex items-start justify-between gap-4">
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
    </div>
  )
}

export default Knowledge
