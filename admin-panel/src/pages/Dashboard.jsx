import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Dashboard() {
  const { auth, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalKnowledge: 0,
    questionsToday: 0,
    questionsWeek: 0,
    questionsMonth: 0,
    answerRate: 0
  })
  const [dailyStats, setDailyStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [exporting, setExporting] = useState(false)

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
        setDailyStats(data.daily_stats || [])
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta analytics:', error)
    }
  }

  const handleExportKPIReport = () => {
    if (!analytics) return
    setExporting(true)

    try {
      const today = new Date().toLocaleDateString('sv-SE')
      const satisfactionRate = analytics.feedback_stats
        ? ((analytics.feedback_stats.helpful || 0) /
            Math.max((analytics.feedback_stats.helpful || 0) + (analytics.feedback_stats.not_helpful || 0), 1) * 100).toFixed(1)
        : 0

      const reportData = [
        ['KPI-RAPPORT - BOBOT CHATTSTATISTIK'],
        ['Genererad:', today],
        [''],
        ['=== ÖVERSIKT ==='],
        ['Nyckeltal', 'Värde', 'Beskrivning'],
        ['Totala konversationer', analytics.total_conversations, 'Antal unika chattsamtal sedan start'],
        ['Totalt meddelanden', analytics.total_messages, 'Alla meddelanden (frågor + svar)'],
        ['Svarsfrekvens', `${analytics.answer_rate?.toFixed(1) || 0}%`, 'Andel frågor som AI kunde besvara'],
        ['Svarstid (snitt)', `${(analytics.avg_response_time_ms / 1000).toFixed(1)}s`, 'Genomsnittlig tid för AI-svar'],
        ['Nöjdhetsgrad', `${satisfactionRate}%`, 'Andel positiv feedback (👍)'],
        [''],
        ['=== AKTIVITET ==='],
        ['Period', 'Konversationer', 'Meddelanden'],
        ['Idag', analytics.conversations_today, analytics.messages_today],
        ['Senaste 7 dagarna', analytics.conversations_week, analytics.messages_week],
        [''],
        ['=== FRÅGEANALYS ==='],
        ['Typ', 'Antal', 'Andel'],
        ['Besvarade frågor', analytics.total_answered, `${((analytics.total_answered / Math.max(analytics.total_answered + analytics.total_unanswered, 1)) * 100).toFixed(1)}%`],
        ['Obesvarade frågor', analytics.total_unanswered, `${((analytics.total_unanswered / Math.max(analytics.total_answered + analytics.total_unanswered, 1)) * 100).toFixed(1)}%`],
        [''],
        ['=== ANVÄNDARFEEDBACK ==='],
        ['Typ', 'Antal'],
        ['Positiv (👍)', analytics.feedback_stats?.helpful || 0],
        ['Negativ (👎)', analytics.feedback_stats?.not_helpful || 0],
        ['Ingen feedback', analytics.feedback_stats?.no_feedback || 0],
        [''],
        ['=== SPRÅKFÖRDELNING ==='],
        ['Språk', 'Antal', 'Andel'],
      ]

      const langNames = { sv: 'Svenska', en: 'English', ar: 'العربية' }
      const langTotal = Object.values(analytics.language_stats || {}).reduce((a, b) => a + b, 0) || 1
      Object.entries(analytics.language_stats || {}).forEach(([lang, count]) => {
        reportData.push([langNames[lang] || lang, count, `${((count / langTotal) * 100).toFixed(1)}%`])
      })

      reportData.push([''])
      reportData.push(['=== KATEGORIER ==='])
      reportData.push(['Kategori', 'Antal frågor'])
      Object.entries(analytics.category_stats || {})
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
          reportData.push([cat, count])
        })

      reportData.push([''])
      reportData.push(['=== AKTIVITET PER TIMME ==='])
      reportData.push(['Timme', 'Antal konversationer'])
      Object.entries(analytics.hourly_stats || {})
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .forEach(([hour, count]) => {
          reportData.push([`${hour}:00`, count])
        })

      if (analytics.top_unanswered && analytics.top_unanswered.length > 0) {
        reportData.push([''])
        reportData.push(['=== VANLIGASTE OBESVARADE FRÅGOR ==='])
        reportData.push(['Dessa frågor saknas i kunskapsbasen:'])
        analytics.top_unanswered.forEach((q, i) => {
          reportData.push([`${i + 1}. ${q}`])
        })
      }

      const csv = reportData.map(row =>
        row.map(cell => {
          const str = String(cell ?? '')
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      ).join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `KPI-rapport-${today}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('KPI export failed:', error)
      alert('Export misslyckades: ' + error.message)
    } finally {
      setExporting(false)
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
          trend="konversationer"
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
          trend="konversationer"
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
          trend="konversationer"
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

      {/* Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Snabbåtgärder</h2>
          <div className="space-y-2">
            <Link
              to="/analytics"
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">Se statistik</p>
                <p className="text-sm text-text-secondary">Detaljerad analys och rapporter</p>
              </div>
            </Link>
            <button
              onClick={handleExportKPIReport}
              disabled={exporting || !analytics}
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group w-full text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                {exporting ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-text-primary">{exporting ? 'Exporterar...' : 'KPI-rapport'}</p>
                <p className="text-sm text-text-secondary">Ladda ner sammanställd statistik</p>
              </div>
            </button>
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
                <p className="font-medium text-text-primary">Granska konversationer</p>
                <p className="text-sm text-text-secondary">Se chatthistorik och feedback</p>
              </div>
            </Link>
            <Link
              to="/settings"
              state={{ tab: 'privacy' }}
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all duration-150 group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">GDPR & Integritet</p>
                <p className="text-sm text-text-secondary">Datalagring och sekretesspolicy</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Widgets */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-2">Dina widgets</h2>
          <p className="text-sm text-text-secondary mb-4">
            Hantera dina chatbotar och kunskapsbaser
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
                  <p className="text-xs text-text-secondary">För kunder och besökare</p>
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
                  <p className="text-xs text-text-secondary">För anställda internt</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
          <p className="text-xs text-text-tertiary mt-4">
            Klicka på en widget för att hantera kunskapsbas, utseende och installationskod
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
