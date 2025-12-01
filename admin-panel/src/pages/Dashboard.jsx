import { useState, useEffect } from 'react'

const API_BASE = '/api'

function Dashboard({ tenantId }) {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalKnowledge: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [tenantId])

  const fetchStats = async () => {
    try {
      // Hämta statistik från backend
      const response = await fetch(`${API_BASE}/stats/${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalKnowledge: data.knowledge_items || 0,
          totalQuestions: data.total_questions || 0
        })
      }
    } catch (error) {
      console.error('Kunde inte hämta statistik:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Översikt för {tenantId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Frågor/Svar i kunskapsbas"
          value={stats.totalKnowledge}
          icon="📚"
          color="bg-blue-100"
        />
        <StatCard
          title="Totalt antal chatfrågor"
          value={stats.totalQuestions}
          icon="💬"
          color="bg-green-100"
        />
        <StatCard
          title="Aktiva sessioner"
          value={Math.floor(Math.random() * 10) + 1}
          icon="👥"
          color="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Snabbåtgärder</h2>
          <div className="space-y-3">
            <a
              href="/knowledge"
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">➕</span>
                <div>
                  <p className="font-medium text-gray-800">Lägg till fråga/svar</p>
                  <p className="text-sm text-gray-500">Utöka din kunskapsbas</p>
                </div>
              </div>
            </a>
            <a
              href="/preview"
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👁️</span>
                <div>
                  <p className="font-medium text-gray-800">Förhandsgranska chatbot</p>
                  <p className="text-sm text-gray-500">Testa hur den fungerar</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Widget-kod</h2>
          <p className="text-sm text-gray-500 mb-4">
            Kopiera denna kod och klistra in på din hemsida:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{`<script src="https://cdn.bobot.se/widget.js"></script>
<script>
  Bobot.init({
    tenantId: "${tenantId}"
  });
</script>`}</pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`<script src="https://cdn.bobot.se/widget.js"></script>\n<script>\n  Bobot.init({\n    tenantId: "${tenantId}"\n  });\n</script>`)
              alert('Kopierat!')
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
          >
            Kopiera kod
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
