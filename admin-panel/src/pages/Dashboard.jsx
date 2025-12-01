import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Dashboard() {
  const { auth, authFetch } = useContext(AuthContext)
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalKnowledge: 0,
    questionsToday: 0,
    questionsWeek: 0,
    answerRate: 0
  })
  const [dailyStats, setDailyStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchAnalytics()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await authFetch(`${API_BASE}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalKnowledge: data.knowledge_items || 0,
          totalQuestions: data.total_questions || 0,
          questionsToday: data.questions_today || 0,
          questionsWeek: data.questions_this_week || 0,
          answerRate: data.answer_rate || 0
        })
      }
    } catch (error) {
      console.error('Kunde inte hämta statistik:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch(`${API_BASE}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setDailyStats(data.daily_stats?.slice(-7) || [])
      }
    } catch (error) {
      console.error('Kunde inte hämta analytics:', error)
    }
  }

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="card group hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-3xl font-semibold text-text-primary mt-2 tracking-tight">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-bg-secondary rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
          {trend && (
            <p className="text-xs text-text-tertiary mt-2">{trend}</p>
          )}
        </div>
        <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
        <p className="text-text-secondary mt-1">Välkommen tillbaka, {auth.companyName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Kunskapsposter"
          value={stats.totalKnowledge}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />
        <StatCard
          title="Totalt frågor"
          value={stats.totalQuestions}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Idag"
          value={stats.questionsToday}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          trend="frågor"
        />
        <StatCard
          title="Denna vecka"
          value={stats.questionsWeek}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
          trend="frågor"
        />
      </div>

      {/* Weekly Chart */}
      {dailyStats.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-text-primary">Aktivitet senaste 7 dagarna</h2>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-accent"></span> Frågor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success"></span> Besvarade
              </span>
            </div>
          </div>
          <div className="h-40 flex items-end gap-2">
            {dailyStats.map((day, i) => {
              const maxQuestions = Math.max(...dailyStats.map(d => d.questions || 0), 1)
              const questionHeight = ((day.questions || 0) / maxQuestions) * 100
              const answeredHeight = ((day.answered || 0) / maxQuestions) * 100
              const date = new Date(day.date)
              const dayName = date.toLocaleDateString('sv-SE', { weekday: 'short' })

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-1 h-32">
                    <div
                      className="flex-1 bg-accent/20 rounded-t transition-all hover:bg-accent/30"
                      style={{ height: `${questionHeight}%`, minHeight: day.questions ? '4px' : '0' }}
                      title={`${day.questions || 0} frågor`}
                    />
                    <div
                      className="flex-1 bg-success/30 rounded-t transition-all hover:bg-success/40"
                      style={{ height: `${answeredHeight}%`, minHeight: day.answered ? '4px' : '0' }}
                      title={`${day.answered || 0} besvarade`}
                    />
                  </div>
                  <span className="text-xs text-text-tertiary capitalize">{dayName}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Snabbåtgärder</h2>
          <div className="space-y-2">
            <Link
              to="/knowledge"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Lägg till fråga/svar</p>
                <p className="text-sm text-text-secondary">Utöka din kunskapsbas</p>
              </div>
            </Link>
            <Link
              to="/preview"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Förhandsgranska chatbot</p>
                <p className="text-sm text-text-secondary">Testa hur den fungerar</p>
              </div>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Inställningar</p>
                <p className="text-sm text-text-secondary">Anpassa din chatbot</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Widget Code */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-2">Widget-kod</h2>
          <p className="text-sm text-text-secondary mb-4">
            Klistra in på din hemsida för att aktivera chatboten
          </p>
          <div className="bg-[#1C1917] text-[#F5F5F4] p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{`<script src="https://cdn.bobot.se/widget.js"></script>
<script>
  Bobot.init({
    companyId: "${auth.companyId}"
  });
</script>`}</pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`<script src="https://cdn.bobot.se/widget.js"></script>\n<script>\n  Bobot.init({\n    companyId: "${auth.companyId}"\n  });\n</script>`)
            }}
            className="btn btn-primary mt-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Kopiera kod
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
