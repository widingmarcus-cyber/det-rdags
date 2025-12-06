/**
 * SuperAdmin Analytics Tab Component
 * Displays platform analytics, trends, performance stats, and landing page analytics
 */

// Helper to check if trends have meaningful data
const hasTrendsData = (trends) => {
  if (!trends) return false
  const wow = trends.week_over_week
  const mom = trends.month_over_month
  return (wow?.current > 0 || wow?.previous > 0 || mom?.current > 0 || mom?.previous > 0)
}

// Helper to check if performance stats have meaningful data
const hasPerformanceData = (stats) => {
  if (!stats) return false
  return stats.total_requests > 0 ||
         (stats.success_rate !== undefined && stats.success_rate !== null) ||
         stats.avg_response_time > 0
}

// Helper to check if rate limit stats have meaningful data (only show when there's activity)
const hasRateLimitData = (stats) => {
  if (!stats) return false
  // Only show when there are active sessions or rate limited sessions
  return stats.active_sessions > 0 || stats.rate_limited_sessions > 0
}

const AnalyticsTab = ({
  trends,
  performanceStats,
  rateLimitStats,
  peakHours,
  landingAnalyticsDays,
  setLandingAnalyticsDays,
  fetchLandingAnalytics,
  landingAnalyticsLoading,
  landingAnalytics,
  topCompanies
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analys & Prestanda</h1>
        <p className="text-text-secondary mt-1">Detaljerad statistik och trender</p>
      </div>

      {/* Trends Overview */}
      {hasTrendsData(trends) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Vecka-över-vecka</h3>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-semibold text-text-primary">{trends.week_over_week.current}</span>
              <span className={`text-sm font-medium ${trends.week_over_week.change_percent >= 0 ? 'text-success' : 'text-error'}`}>
                {trends.week_over_week.change_percent >= 0 ? '+' : ''}{trends.week_over_week.change_percent}%
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-1">vs förra veckan ({trends.week_over_week.previous})</p>
            <p className="text-xs text-text-tertiary mt-2">Jämför antal konversationer denna vecka mot förra veckan</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Månad-över-månad</h3>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-semibold text-text-primary">{trends.month_over_month.current}</span>
              <span className={`text-sm font-medium ${trends.month_over_month.change_percent >= 0 ? 'text-success' : 'text-error'}`}>
                {trends.month_over_month.change_percent >= 0 ? '+' : ''}{trends.month_over_month.change_percent}%
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-1">vs förra månaden ({trends.month_over_month.previous})</p>
            <p className="text-xs text-text-tertiary mt-2">Jämför antal konversationer denna månad mot förra månaden</p>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      {hasPerformanceData(performanceStats) && (
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-text-primary mb-4">Widgetprestanda (24h)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-semibold text-text-primary">{performanceStats.total_requests}</p>
              <p className="text-xs text-text-secondary">Totala förfrågningar</p>
            </div>
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-semibold text-success">{performanceStats.success_rate}%</p>
              <p className="text-xs text-text-secondary">Lyckandefrekvens</p>
            </div>
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-semibold text-text-primary">{performanceStats.avg_response_time}ms</p>
              <p className="text-xs text-text-secondary">Snitt svarstid</p>
            </div>
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-semibold text-warning">{performanceStats.rate_limited_requests}</p>
              <p className="text-xs text-text-secondary">Rate limited</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limit Stats */}
      {hasRateLimitData(rateLimitStats) && (
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-text-primary mb-4">Rate Limiting</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-semibold text-text-primary">{rateLimitStats.active_sessions}</p>
              <p className="text-xs text-text-secondary">Aktiva sessioner</p>
            </div>
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-semibold text-error">{rateLimitStats.rate_limited_sessions}</p>
              <p className="text-xs text-text-secondary">Begränsade sessioner</p>
            </div>
            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="text-sm text-text-primary">{rateLimitStats.rate_limit_max_requests} förfrågningar / {rateLimitStats.rate_limit_window_seconds}s</p>
              <p className="text-xs text-text-secondary">Begränsningsgräns</p>
            </div>
          </div>
        </div>
      )}

      {/* Peak Hours */}
      {peakHours && peakHours.hourly_distribution.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-text-primary mb-4">Aktivitet per timme</h3>
          <div className="flex items-end gap-1 h-32">
            {peakHours.hourly_distribution.map(({ hour, count }) => {
              const max = Math.max(...peakHours.hourly_distribution.map(h => h.count))
              const height = max > 0 ? (count / max) * 100 : 0
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${hour === parseInt(peakHours.peak_hour) ? 'bg-accent' : 'bg-accent/30'}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-text-tertiary mt-1">{hour}</span>
                </div>
              )
            })}
          </div>
          {peakHours.peak_hour && (
            <p className="text-sm text-text-secondary mt-2">
              Mest aktiv timme: <span className="font-medium text-accent">{peakHours.peak_hour}:00</span>
            </p>
          )}
        </div>
      )}

      {/* Landing Page Analytics */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-text-primary">Landningssida Analytics</h3>
            <p className="text-sm text-text-secondary">Besöksstatistik för din landningssida</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={landingAnalyticsDays}
              onChange={(e) => {
                const days = parseInt(e.target.value)
                setLandingAnalyticsDays(days)
                fetchLandingAnalytics(days)
              }}
              className="px-3 py-1.5 text-sm bg-bg-tertiary text-text-primary border border-border rounded-md hover:border-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value={7}>7 dagar</option>
              <option value={30}>30 dagar</option>
              <option value={90}>90 dagar</option>
              <option value={365}>1 år</option>
            </select>
            <button
              onClick={() => fetchLandingAnalytics(landingAnalyticsDays)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              disabled={landingAnalyticsLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={landingAnalyticsLoading ? 'animate-spin' : ''}>
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
        </div>

        {landingAnalyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : landingAnalytics ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-bg-secondary rounded-lg">
                <p className="text-2xl font-semibold text-text-primary">{landingAnalytics.total_views}</p>
                <p className="text-xs text-text-secondary">Totala visningar</p>
              </div>
              <div className="p-4 bg-bg-secondary rounded-lg">
                <p className="text-2xl font-semibold text-text-primary">{landingAnalytics.unique_visitors}</p>
                <p className="text-xs text-text-secondary">Unika besökare</p>
              </div>
              <div className="p-4 bg-bg-secondary rounded-lg">
                <p className="text-2xl font-semibold text-text-primary">{landingAnalytics.avg_time_on_page}s</p>
                <p className="text-xs text-text-secondary">Snitt tid på sidan</p>
              </div>
              <div className="p-4 bg-bg-secondary rounded-lg">
                <p className={`text-2xl font-semibold ${landingAnalytics.bounce_rate > 70 ? 'text-error' : landingAnalytics.bounce_rate > 50 ? 'text-warning' : 'text-success'}`}>
                  {landingAnalytics.bounce_rate}%
                </p>
                <p className="text-xs text-text-secondary">Bounce rate</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-accent-soft rounded-lg text-center">
                <p className="text-xl font-semibold text-accent">{landingAnalytics.views_today}</p>
                <p className="text-xs text-text-secondary">Idag</p>
              </div>
              <div className="p-3 bg-success-soft rounded-lg text-center">
                <p className="text-xl font-semibold text-success">{landingAnalytics.views_this_week}</p>
                <p className="text-xs text-text-secondary">Denna vecka</p>
              </div>
              <div className="p-3 bg-warning-soft rounded-lg text-center">
                <p className="text-xl font-semibold text-warning">{landingAnalytics.views_this_month}</p>
                <p className="text-xs text-text-secondary">Perioden</p>
              </div>
            </div>

            {/* Daily Trend Chart */}
            {landingAnalytics.daily_trend && landingAnalytics.daily_trend.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Daglig trend</h4>
                <div className="flex items-end gap-1 h-24">
                  {landingAnalytics.daily_trend.slice(-14).map((day, i) => {
                    const max = Math.max(...landingAnalytics.daily_trend.map(d => d.views))
                    const height = max > 0 ? (day.views / max) * 100 : 0
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-accent/30 hover:bg-accent transition-colors rounded-t cursor-pointer"
                            style={{ height: `${Math.max(height, 2)}px` }}
                          />
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-bg-elevated rounded shadow-lg text-xs whitespace-nowrap z-10">
                            {day.date}: {day.views} visningar
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Enheter</h4>
                <div className="space-y-2">
                  {Object.entries(landingAnalytics.device_breakdown || {}).map(([device, count]) => {
                    const total = Object.values(landingAnalytics.device_breakdown).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={device} className="flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                          {device === 'desktop' ? (
                            <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>
                          ) : device === 'mobile' ? (
                            <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>
                          ) : (
                            <><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>
                          )}
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-text-primary capitalize">{device}</span>
                            <span className="text-xs text-text-tertiary">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Referrers */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Trafikkällor</h4>
                {landingAnalytics.top_referrers && landingAnalytics.top_referrers.length > 0 ? (
                  <div className="space-y-2">
                    {landingAnalytics.top_referrers.slice(0, 5).map((ref, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-bg-secondary rounded">
                        <span className="text-sm text-text-primary truncate flex-1">{ref.source}</span>
                        <span className="text-xs text-text-tertiary ml-2">{ref.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-tertiary text-center py-4">Ingen data ännu</p>
                )}
              </div>
            </div>

            {/* Campaigns */}
            {landingAnalytics.top_campaigns && landingAnalytics.top_campaigns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Kampanjer (UTM)</h4>
                <div className="flex flex-wrap gap-2">
                  {landingAnalytics.top_campaigns.map((camp, i) => (
                    <span key={i} className="px-3 py-1 bg-accent-soft text-accent text-sm rounded-full">
                      {camp.campaign} ({camp.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-text-tertiary mb-3">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            <p className="text-text-secondary">Ingen data ännu</p>
            <p className="text-sm text-text-tertiary mt-1">Lägg till spårningskoden på din landningssida för att börja samla in data</p>
          </div>
        )}
      </div>

      {/* Top Companies */}
      {topCompanies.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Mest aktiva företag (30 dagar)</h3>
          <div className="space-y-3">
            {topCompanies.map((company, index) => (
              <div key={company.company_id} className="flex items-center gap-4 p-3 bg-bg-secondary rounded-lg">
                <span className="w-6 h-6 flex items-center justify-center bg-accent-soft rounded text-accent text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{company.company_name}</p>
                  <p className="text-xs text-text-secondary">{company.company_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">{company.conversations}</p>
                  <p className="text-xs text-text-tertiary">konversationer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsTab
