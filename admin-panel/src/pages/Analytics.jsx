import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Analytics() {
  const { authFetch, token } = useContext(AuthContext)
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingQuestion, setAddingQuestion] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch(`${API_BASE}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const [exporting, setExporting] = useState(null)

  const handleAddToKnowledge = async (question) => {
    setAddingQuestion(question)
    // Navigate to knowledge page with pre-filled question
    navigate('/knowledge', { state: { prefillQuestion: question } })
  }

  const handleExport = async (type) => {
    const endpoints = {
      conversations: '/export/conversations',
      statistics: '/export/statistics',
      knowledge: '/export/knowledge'
    }

    setExporting(type)
    try {
      const response = await authFetch(`${API_BASE}${endpoints[type]}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        alert('Export misslyckades. Försök igen.')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export misslyckades: ' + error.message)
    } finally {
      setExporting(null)
    }
  }

  const handleExportKPIReport = () => {
    if (!analytics) return
    setExporting('kpi')

    try {
      // Generate comprehensive KPI report as CSV
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

      // Add language stats
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

      // Add peak hours
      reportData.push([''])
      reportData.push(['=== AKTIVITET PER TIMME ==='])
      reportData.push(['Timme', 'Antal konversationer'])
      Object.entries(analytics.hourly_stats || {})
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .forEach(([hour, count]) => {
          reportData.push([`${hour}:00`, count])
        })

      // Add top unanswered questions
      if (analytics.top_unanswered && analytics.top_unanswered.length > 0) {
        reportData.push([''])
        reportData.push(['=== VANLIGASTE OBESVARADE FRÅGOR ==='])
        reportData.push(['Dessa frågor saknas i kunskapsbasen:'])
        analytics.top_unanswered.forEach((q, i) => {
          reportData.push([`${i + 1}. ${q}`])
        })
      }

      // Convert to CSV
      const csv = reportData.map(row =>
        row.map(cell => {
          const str = String(cell ?? '')
          // Escape quotes and wrap in quotes if contains comma or quote
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      ).join('\n')

      // Add BOM for Excel compatibility with Swedish characters
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
      setExporting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Laddar statistik...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Kunde inte ladda statistik</p>
      </div>
    )
  }

  // Find max value for chart scaling
  const maxMessages = Math.max(...(analytics.daily_stats?.map(d => d.messages) || [1]), 1)

  // Calculate peak hour
  const peakHour = Object.entries(analytics.hourly_stats || {})
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Statistik</h1>
          <p className="text-text-secondary mt-1">Anonymiserad data - GDPR-säker</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportKPIReport()}
            disabled={exporting !== null}
            className="btn btn-primary text-sm disabled:opacity-50"
          >
            {exporting === 'kpi' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            )}
            KPI-rapport
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Totala konversationer"
          value={analytics.total_conversations}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Totalt meddelanden"
          value={analytics.total_messages}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />
        <StatCard
          label="Svarsfrekvens"
          value={`${analytics.answer_rate.toFixed(1)}%`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          color={analytics.answer_rate >= 80 ? 'success' : analytics.answer_rate >= 50 ? 'warning' : 'error'}
        />
        <StatCard
          label="Svarstid (snitt)"
          value={analytics.avg_response_time_ms > 0 ? `${(analytics.avg_response_time_ms / 1000).toFixed(1)}s` : '-'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      {/* Today & This Week */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Idag</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-text-primary">{analytics.conversations_today}</span>
            <span className="text-text-tertiary">konversationer</span>
          </div>
          <p className="text-sm text-text-tertiary mt-1">{analytics.messages_today} meddelanden</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Senaste 7 dagarna</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-text-primary">{analytics.conversations_week}</span>
            <span className="text-text-tertiary">konversationer</span>
          </div>
          <p className="text-sm text-text-tertiary mt-1">{analytics.messages_week} meddelanden</p>
        </div>
      </div>

      {/* Chart - Last 30 days */}
      {analytics.daily_stats && analytics.daily_stats.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-text-primary mb-4">Senaste 30 dagarna</h3>
          {maxMessages === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary mx-auto mb-2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <p className="text-text-tertiary text-sm">Ingen aktivitet ännu</p>
                <p className="text-text-tertiary text-xs mt-1">Data visas när konversationer startar</p>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-stretch gap-[3px]">
              {analytics.daily_stats.map((day, index) => {
                const barHeight = maxMessages > 0 ? (day.messages / maxMessages) * 100 : 0
                return (
                  <div
                    key={index}
                    className="flex-1 h-full flex flex-col items-center group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {new Date(day.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                      <br />
                      {day.messages} meddelanden
                    </div>
                    {/* Bar container */}
                    <div className="w-full h-full flex items-end">
                      <div
                        className={`w-full rounded-t transition-all cursor-pointer ${
                          day.messages > 0 ? 'bg-accent hover:bg-accent/80' : 'bg-border-subtle'
                        }`}
                        style={{
                          height: day.messages > 0 ? `${Math.max(barHeight, 5)}%` : '4px'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex justify-between mt-2 text-xs text-text-tertiary">
            <span>30 dagar sedan</span>
            <span>Idag</span>
          </div>
        </div>
      )}

      {/* Feedback & Satisfaction - Full Width */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-text-primary">Användarfeedback</h3>
            <p className="text-sm text-text-secondary">Klicka på en kategori för att se relaterade konversationer</p>
          </div>
          <button
            onClick={() => navigate('/conversations')}
            className="btn btn-ghost text-sm"
          >
            Alla konversationer →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Helpful */}
          <button
            onClick={() => navigate('/conversations?feedback=helpful')}
            className="p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👍</span>
                <span className="font-medium text-text-primary">Hjälpsamma svar</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-success transition-colors">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-success">{analytics.feedback_stats?.helpful || 0}</span>
            <p className="text-xs text-text-tertiary mt-1">Användare tyckte svaret var bra</p>
          </button>

          {/* Not Helpful */}
          <button
            onClick={() => navigate('/conversations?feedback=not_helpful')}
            className="p-4 bg-error/5 border border-error/20 rounded-xl hover:bg-error/10 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👎</span>
                <span className="font-medium text-text-primary">Behöver förbättras</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-error transition-colors">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-error">{analytics.feedback_stats?.not_helpful || 0}</span>
            <p className="text-xs text-text-tertiary mt-1">Granska för att förbättra kunskapsbasen</p>
          </button>

          {/* No Feedback */}
          <div className="p-4 bg-bg-secondary rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤷</span>
              <span className="font-medium text-text-primary">Ingen feedback</span>
            </div>
            <span className="text-3xl font-bold text-text-tertiary">{analytics.feedback_stats?.no_feedback || 0}</span>
            <p className="text-xs text-text-tertiary mt-1">Användare gav ingen feedback</p>
          </div>
        </div>

        {/* Satisfaction Rate Bar */}
        {(analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0) > 0 && (
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Nöjdhetsgrad</span>
              <span className="font-medium text-text-primary">
                {(((analytics.feedback_stats?.helpful || 0) /
                  ((analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0))) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-bg-secondary rounded-full overflow-hidden flex">
              <div
                className="h-full bg-success transition-all"
                style={{
                  width: `${((analytics.feedback_stats?.helpful || 0) /
                    ((analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0))) * 100}%`
                }}
              />
              <div
                className="h-full bg-error transition-all"
                style={{
                  width: `${((analytics.feedback_stats?.not_helpful || 0) /
                    ((analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0))) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Activity & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Peak Hours */}
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Aktivitet per timme</h3>
          {peakHour && peakHour[1] > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-accent-soft rounded-lg">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  {peakHour[0]}
                </div>
                <div>
                  <p className="font-medium text-text-primary">Mest aktiv kl {peakHour[0]}:00</p>
                  <p className="text-sm text-text-secondary">{peakHour[1]} konversationer</p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-1 h-24">
                {Array.from({ length: 24 }, (_, i) => {
                  const count = analytics.hourly_stats?.[String(i)] || 0
                  const maxCount = Math.max(...Object.values(analytics.hourly_stats || {}), 1)
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all cursor-pointer ${
                        String(i) === peakHour[0] ? 'bg-accent' : 'bg-accent/40 hover:bg-accent/60'
                      }`}
                      style={{ height: `${Math.max((count / maxCount) * 100, 4)}%` }}
                      title={`${String(i).padStart(2, '0')}:00 - ${count} konversationer`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-tertiary">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">Ingen tidsdata ännu</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Populära kategorier</h3>
          {Object.keys(analytics.category_stats || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.category_stats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([category, count], index) => {
                  const total = Object.values(analytics.category_stats).reduce((a, b) => a + b, 0)
                  const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                            index === 0 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-text-primary capitalize">{category}</span>
                        </div>
                        <span className="text-sm text-text-secondary">{count} ({percent}%)</span>
                      </div>
                      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden ml-8">
                        <div
                          className={`h-full rounded-full transition-all ${index === 0 ? 'bg-accent' : 'bg-accent/50'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">Ingen kategoridata ännu</p>
          )}
        </div>
      </div>

      {/* Top Unanswered Questions */}
      {analytics.top_unanswered && analytics.top_unanswered.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">Obesvarade frågor</h3>
              <p className="text-sm text-text-secondary">
                Klicka på "+" för att lägga till i kunskapsbasen
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {analytics.top_unanswered.map((question, index) => (
              <div key={index} className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between gap-3 group">
                <p className="text-sm text-text-primary flex-1">{question}</p>
                <button
                  onClick={() => handleAddToKnowledge(question)}
                  className="flex-shrink-0 p-2 text-text-tertiary hover:text-accent hover:bg-accent-soft rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Lägg till i kunskapsbasen"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color = 'accent' }) {
  const colorClasses = {
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  }

  return (
    <div className="card">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </div>
  )
}

export default Analytics
