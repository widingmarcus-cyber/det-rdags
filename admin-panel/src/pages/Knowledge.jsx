import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Knowledge() {
  const { authFetch } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({ question: '', answer: '' })
  const [saving, setSaving] = useState(false)

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
    setFormData({ question: '', answer: '' })
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({ question: item.question, answer: item.answer })
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
        // Uppdatera befintlig
        const response = await authFetch(`${API_BASE}/knowledge/${editItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          setShowModal(false)
          fetchKnowledge()
        }
      } else {
        // Lägg till ny
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kunskapsbas</h1>
          <p className="text-gray-500 mt-1">Hantera frågor och svar för din chatbot</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Lägg till
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laddar...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-800">Ingen kunskapsbas ännu</h3>
          <p className="text-gray-500 mt-2">Lägg till din första fråga och svar för att komma igång</p>
          <button
            onClick={handleAdd}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Lägg till första posten
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.question}</h3>
                  <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap">{item.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Redigera"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Ta bort"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editItem ? 'Redigera post' : 'Lägg till ny post'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fråga
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="T.ex. Hur säger jag upp min lägenhet?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Svar
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Skriv svaret här..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
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
