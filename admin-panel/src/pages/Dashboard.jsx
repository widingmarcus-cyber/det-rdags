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
    questionsMonth: 0,
    answerRate: 0
  })
  const [dailyStats, setDailyStats] = useState([])
  const [allDailyStats, setAllDailyStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState(7) // 7 or 30 days
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    fetchStats()
    fetchAnalytics()
    fetchUsage()
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
          questionsMonth: data.questions_this_month || 0,
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
        const allStats = data.daily_stats || []
        setAllDailyStats(allStats)
        setDailyStats(allStats.slice(-7))
      }
    } catch (error) {
      console.error('Kunde inte hämta analytics:', error)
    }
  }

  const fetchUsage = async () => {
    try {
      const response = await authFetch(`${API_BASE}/my-usage`)
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta användning:', error)
    }
  }

  useEffect(() => {
    setDailyStats(allDailyStats.slice(-chartPeriod))
  }, [chartPeriod, allDailyStats])

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

  const getUsageColor = (percent) => {
    if (percent >= 90) return { bar: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10' }
    if (percent >= 75) return { bar: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' }
    return { bar: 'bg-accent', text: 'text-accent', bg: 'bg-accent-soft' }
  }

  const UsageMeter = ({ label, current, limit, percent, icon, hasLimit }) => {
    if (!hasLimit) return null
    const colors = getUsageColor(percent)
    const isNearLimit = percent >= 75
    const isAtLimit = percent >= 100

    return (
      <div className={`p-4 rounded-xl border ${isAtLimit ? 'border-red-500/30 bg-red-500/10' : isNearLimit ? 'border-amber-500/30 bg-amber-500/10' : 'border-border-default bg-bg-primary'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">{label}</p>
            <p className={`text-xs ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-text-secondary'}`}>
              {isAtLimit ? 'Gränsen nådd' : isNearLimit ? 'Närmar dig gränsen' : 'Inom gränsen'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-semibold ${colors.text}`}>{current}</p>
            <p className="text-xs text-text-tertiary">av {limit}</p>
          </div>
        </div>
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-tertiary">{percent.toFixed(0)}% använt</span>
          <span className="text-xs text-text-tertiary">{Math.max(0, limit - current)} kvar</span>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
        <p className="text-text-secondary mt-1">Välkommen tillbaka, {auth.companyName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          title="Totala konversationer"
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
        <StatCard
          title="Senaste 30 dagar"
          value={stats.questionsMonth}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          }
          trend="frågor"
        />
      </div>

      {/* Usage Limits */}
      {usage && (usage.conversations.has_limit || usage.knowledge.has_limit) && (
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
            <h2 className="text-lg font-medium text-text-primary">Användningsgränser</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UsageMeter
              label="Konversationer denna månad"
              current={usage.conversations.current}
              limit={usage.conversations.limit}
              percent={usage.conversations.percent}
              hasLimit={usage.conversations.has_limit}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
            <UsageMeter
              label="Kunskapsposter totalt"
              current={usage.knowledge.current}
              limit={usage.knowledge.limit}
              percent={usage.knowledge.percent}
              hasLimit={usage.knowledge.has_limit}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              }
            />
          </div>
        </div>
      )}

      {/* Activity Chart */}
      {dailyStats.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-text-primary">
              Aktivitet senaste {chartPeriod} dagarna
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-accent"></span> Frågor
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-success"></span> Besvarade
                </span>
              </div>
              <div className="flex rounded-lg bg-bg-secondary p-1">
                <button
                  onClick={() => setChartPeriod(7)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${chartPeriod === 7 ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
                  aria-pressed={chartPeriod === 7}
                >
                  7 dagar
                </button>
                <button
                  onClick={() => setChartPeriod(30)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${chartPeriod === 30 ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
                  aria-pressed={chartPeriod === 30}
                >
                  30 dagar
                </button>
              </div>
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
              to="/widget/external"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 13v2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Kundtjänst</p>
                <p className="text-sm text-text-secondary">Widget för kunder och besökare</p>
              </div>
            </Link>
            <Link
              to="/widget/internal"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Medarbetarstöd</p>
                <p className="text-sm text-text-secondary">Widget för anställda</p>
              </div>
            </Link>
            <Link
              to="/conversations"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Se konversationer</p>
                <p className="text-sm text-text-secondary">Granska chatthistorik</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Widget Code */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-2">Kom igång</h2>
          <p className="text-sm text-text-secondary mb-4">
            Konfigurera dina widgets och hämta installationskod
          </p>
          <div className="space-y-3">
            <Link
              to="/widget/external"
              className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">Kundtjänst</p>
                  <p className="text-xs text-text-secondary">För din webbplats</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <Link
              to="/widget/internal"
              className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">Medarbetarstöd</p>
                  <p className="text-xs text-text-secondary">För intern användning</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
          <p className="text-xs text-text-tertiary mt-4">
            Installationskod finns under varje widgets inställningar → Installera-fliken
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
