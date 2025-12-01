import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Analytics() {
  const { authFetch } = useContext(AuthContext)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Statistik</h1>
        <p className="text-text-secondary mt-1">Anonymiserad data - GDPR-säker</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Totalt konversationer"
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
          <div className="h-48 flex items-end gap-1">
            {analytics.daily_stats.map((day, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="relative w-full">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                    <br />
                    {day.messages} meddelanden
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full bg-accent/80 hover:bg-accent rounded-t transition-all cursor-pointer"
                    style={{
                      height: `${Math.max((day.messages / maxMessages) * 160, 4)}px`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-tertiary">
            <span>30 dagar sedan</span>
            <span>Idag</span>
          </div>
        </div>
      )}

      {/* Answer Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Frågor</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-success rounded-full"></span>
                <span className="text-text-secondary">Besvarade</span>
              </div>
              <span className="font-medium text-text-primary">{analytics.total_answered}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-warning rounded-full"></span>
                <span className="text-text-secondary">Obesvarade</span>
              </div>
              <span className="font-medium text-text-primary">{analytics.total_unanswered}</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${analytics.answer_rate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Kategorier</h3>
          {Object.keys(analytics.category_stats || {}).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.category_stats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-text-secondary capitalize">{category}</span>
                    <span className="font-medium text-text-primary">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">Ingen kategoridata ännu</p>
          )}
        </div>
      </div>

      {/* Unanswered Questions Section */}
      {analytics.total_unanswered > 0 && (
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
                {analytics.total_unanswered} frågor kunde inte besvaras - lägg till i kunskapsbasen!
              </p>
            </div>
          </div>
          <p className="text-sm text-text-tertiary">
            Se konversationer för att hitta specifika frågor som behöver svar.
          </p>
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
