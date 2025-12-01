import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function SuperAdmin() {
  const { adminAuth, adminFetch } = useContext(AuthContext)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ id: '', name: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta företag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ id: '', name: '', password: '' })
    setError('')
    setShowModal(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await adminFetch(`${API_BASE}/admin/companies`, {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        fetchCompanies()
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte skapa företag')
      }
    } catch (error) {
      setError('Kunde inte ansluta till servern')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/toggle`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchCompanies()
      }
    } catch (error) {
      console.error('Kunde inte ändra status:', error)
    }
  }

  const handleDelete = async (companyId) => {
    if (!confirm(`Är du säker på att du vill ta bort företag "${companyId}"? All data kommer att raderas.`)) {
      return
    }

    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchCompanies()
      }
    } catch (error) {
      console.error('Kunde inte ta bort:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-white">Bobot Super Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">{adminAuth.username}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Företagshantering</h1>
            <p className="text-gray-500 mt-1">Hantera alla företag i systemet</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Nytt företag
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Totalt antal företag</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{companies.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Aktiva företag</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {companies.filter(c => c.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Totalt kunskapsposter</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {companies.reduce((sum, c) => sum + c.knowledge_count, 0)}
            </p>
          </div>
        </div>

        {/* Companies table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Laddar...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-800">Inga företag ännu</h3>
            <p className="text-gray-500 mt-2">Skapa ditt första företag för att komma igång</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Skapa första företaget
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Företag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunskapsbas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chattmeddelanden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skapad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          company.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.knowledge_count} poster
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.chat_count} meddelanden
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleToggle(company.id)}
                        className={`mr-3 ${
                          company.is_active
                            ? 'text-yellow-600 hover:text-yellow-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {company.is_active ? 'Inaktivera' : 'Aktivera'}
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Skapa nytt företag</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Företags-ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="t.ex. bostadsbolaget"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Endast små bokstäver, siffror och bindestreck</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Företagsnamn
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="t.ex. Bostadsbolaget AB"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lösenord
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Välj ett starkt lösenord"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

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
                  {saving ? 'Skapar...' : 'Skapa företag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdmin
