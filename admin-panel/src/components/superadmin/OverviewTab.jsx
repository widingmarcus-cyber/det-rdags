/**
 * SuperAdmin Overview Tab Component
 * Main dashboard command center with KPIs, alerts, and quick actions
 */

const OverviewTab = ({
  setCommandPaletteOpen,
  announcements = [],
  onDeleteAnnouncement,
  onToggleAnnouncement,
  systemHealth,
  maintenanceMode,
  totalCompanies,
  activeCompanies,
  totalChats,
  totalKnowledge,
  companies,
  setActiveTab,
  onAddCompany,
  onGdprCleanup,
  aiInsights,
  insightsLoading,
  fetchAiInsights,
  activityStream,
  activityLoading,
  fetchActivityStream
}) => {
  return (
    <div className="animate-fade-in">
      {/* COMMAND CENTER HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Kontrollcenter</h1>
          <div className="flex items-center gap-4">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="text-sm">Sök kund, fråga, eller åtgärd...</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Senast uppdaterad: {new Date().toLocaleTimeString('sv-SE')}
            </div>
          </div>
        </div>
        <p className="text-text-secondary">Allt du behöver se för att förstå hur din verksamhet går</p>
      </div>

      {/* Active Announcements List */}
      {announcements.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Aktiva meddelanden ({announcements.length})</h3>
          </div>
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`rounded-xl p-4 flex items-center justify-between ${
              announcement.type === 'warning' ? 'bg-warning/10 border border-warning/30' :
              announcement.type === 'maintenance' ? 'bg-error/10 border border-error/30' :
              'bg-accent/10 border border-accent/30'
            } ${!announcement.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  announcement.type === 'warning' ? 'bg-warning text-white' :
                  announcement.type === 'maintenance' ? 'bg-error text-white' :
                  'bg-accent text-white'
                }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary truncate">{announcement.title}</p>
                    {announcement.target_company_name && (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full flex-shrink-0">
                        {announcement.target_company_name}
                      </span>
                    )}
                    {!announcement.is_active && (
                      <span className="px-2 py-0.5 bg-text-tertiary/20 text-text-tertiary text-xs rounded-full flex-shrink-0">
                        Inaktivt
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary truncate">{announcement.message}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {announcement.read_count || 0} har läst • {new Date(announcement.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                <button
                  onClick={() => onToggleAnnouncement(announcement.id)}
                  className="p-2 rounded-lg hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
                  title={announcement.is_active ? 'Inaktivera' : 'Aktivera'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {announcement.is_active ? (
                      <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>
                    ) : (
                      <polygon points="5 3 19 12 5 21 5 3" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteAnnouncement(announcement.id)}
                  className="p-2 rounded-lg hover:bg-error/10 text-text-tertiary hover:text-error transition-colors"
                  title="Ta bort"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SYSTEM STATUS BANNER */}
      <div className={`rounded-xl p-6 mb-8 border-2 ${
        systemHealth?.ollama_status === 'online'
          ? 'bg-success/10 border-success/30'
          : maintenanceMode?.enabled
            ? 'bg-warning/10 border-warning/30'
            : 'bg-error/10 border-error/30'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              systemHealth?.ollama_status === 'online'
                ? 'bg-success text-white'
                : maintenanceMode?.enabled
                  ? 'bg-warning text-white'
                  : 'bg-error text-white'
            }`}>
              {systemHealth?.ollama_status === 'online' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : maintenanceMode?.enabled ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${
                systemHealth?.ollama_status === 'online'
                  ? 'text-success'
                  : maintenanceMode?.enabled
                    ? 'text-warning'
                    : 'text-error'
              }`}>
                {systemHealth?.ollama_status === 'online'
                  ? 'SYSTEMET ÄR ONLINE'
                  : maintenanceMode?.enabled
                    ? 'UNDERHÅLLSLÄGE'
                    : 'SYSTEMET ÄR OFFLINE'}
              </h2>
              <p className="text-text-secondary">
                {systemHealth?.ollama_status === 'online'
                  ? 'AI-chattbotten fungerar och besvarar kundfrågor'
                  : maintenanceMode?.enabled
                    ? maintenanceMode.message || 'Systemet är under underhåll'
                    : 'AI-tjänsten är inte tillgänglig just nu'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{systemHealth?.database_size || '?'}</p>
              <p className="text-text-tertiary">Databasstorlek</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{systemHealth?.uptime || 'N/A'}</p>
              <p className="text-text-tertiary">Upptid</p>
            </div>
          </div>
        </div>
      </div>

      {/* BIG KPI SCOREBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-6 text-center">
          <p className="text-5xl font-bold text-accent mb-2">{totalCompanies}</p>
          <p className="text-lg font-medium text-text-primary">Kunder</p>
          <p className="text-sm text-text-secondary mt-1">{activeCompanies} aktiva just nu</p>
        </div>
        <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-xl p-6 text-center">
          <p className="text-5xl font-bold text-success mb-2">{totalChats.toLocaleString()}</p>
          <p className="text-lg font-medium text-text-primary">Chattsamtal</p>
          <p className="text-sm text-text-secondary mt-1">Totalt besvarade frågor</p>
        </div>
        <div className="bg-gradient-to-br from-info/20 to-info/5 border border-info/30 rounded-xl p-6 text-center">
          <p className="text-5xl font-bold text-info mb-2">{totalKnowledge.toLocaleString()}</p>
          <p className="text-lg font-medium text-text-primary">Kunskapsposter</p>
          <p className="text-sm text-text-secondary mt-1">AI:ns databas</p>
        </div>
        <div className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-xl p-6 text-center">
          <p className="text-5xl font-bold text-warning mb-2">
            {companies.filter(c => !c.is_active).length}
          </p>
          <p className="text-lg font-medium text-text-primary">Inaktiva</p>
          <p className="text-sm text-text-secondary mt-1">Kunder som pausat</p>
        </div>
      </div>

      {/* NEEDS ATTENTION SECTION */}
      {(companies.filter(c => !c.is_active).length > 0 ||
        companies.filter(c => (c.knowledge_count || 0) < 5).length > 0) && (
        <div className="bg-warning/10 border-2 border-warning/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-warning">KRÄVER DIN UPPMÄRKSAMHET</h3>
              <p className="text-sm text-text-secondary">Saker som kan behöva åtgärdas</p>
            </div>
          </div>
          <div className="space-y-3">
            {companies.filter(c => !c.is_active).length > 0 && (
              <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center text-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {companies.filter(c => !c.is_active).length} inaktiva kunder
                    </p>
                    <p className="text-sm text-text-secondary">Kan betyda avslutade eller pausade prenumerationer</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('companies')}
                  className="btn btn-ghost text-sm"
                >
                  Visa →
                </button>
              </div>
            )}
            {companies.filter(c => (c.knowledge_count || 0) < 5).length > 0 && (
              <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center text-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {companies.filter(c => (c.knowledge_count || 0) < 5).length} kunder med lite innehåll
                    </p>
                    <p className="text-sm text-text-secondary">Mindre än 5 kunskapsposter - AI:n kan inte svara bra</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('companies')}
                  className="btn btn-ghost text-sm"
                >
                  Visa →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN GRID - Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* QUICK ACTIONS */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Snabbåtgärder
            </h2>
            <div className="space-y-3">
              <button
                onClick={onAddCompany}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all group"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <div className="text-left">
                  <p className="font-medium">Lägg till ny kund</p>
                  <p className="text-xs opacity-80">Skapa ett nytt företagskonto</p>
                </div>
              </button>
              <button
                onClick={onGdprCleanup}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle transition-all"
              >
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center text-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">GDPR-rensning</p>
                  <p className="text-xs text-text-secondary">Radera gamla konversationer</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle transition-all"
              >
                <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center text-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">Se detaljerad analys</p>
                  <p className="text-xs text-text-secondary">Statistik och trender</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle transition-all"
              >
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">Fakturering</p>
                  <p className="text-xs text-text-secondary">Se betalningar och prenumerationer</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* CUSTOMER LEADERBOARD */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Kundöversikt - Topp 10
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-text-tertiary border-b border-border-subtle">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Kund</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Chattsamtal</th>
                    <th className="pb-3 font-medium text-right">Kunskapsposter</th>
                  </tr>
                </thead>
                <tbody>
                  {companies
                    .sort((a, b) => (b.chat_count || 0) - (a.chat_count || 0))
                    .slice(0, 10)
                    .map((company, i) => (
                      <tr key={company.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50">
                        <td className="py-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-warning text-white' :
                            i === 1 ? 'bg-text-tertiary text-white' :
                            i === 2 ? 'bg-accent text-white' :
                            'bg-bg-secondary text-text-secondary'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-text-primary">{company.name}</p>
                            <p className="text-xs text-text-tertiary">{company.id}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            company.is_active
                              ? 'bg-success/20 text-success'
                              : 'bg-error/20 text-error'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              company.is_active ? 'bg-success' : 'bg-error'
                            }`}></span>
                            {company.is_active ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium text-text-primary">
                          {(company.chat_count || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`font-medium ${
                            (company.knowledge_count || 0) < 5
                              ? 'text-warning'
                              : 'text-text-primary'
                          }`}>
                            {(company.knowledge_count || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setActiveTab('companies')}
              className="w-full mt-4 py-2 text-sm text-accent hover:text-accent-hover font-medium"
            >
              Visa alla {companies.length} kunder →
            </button>
          </div>
        </div>
      </div>

      {/* AI INSIGHTS & LIVE ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI INSIGHTS PANEL */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 0 4h-1v1a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-4 0v-1h-2v1a2 2 0 0 1-4 0v-1H6a2 2 0 0 1-2-2v-1H3a2 2 0 0 1 0-4h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                  <circle cx="12" cy="14" r="3" />
                </svg>
              </div>
              AI Insikter
            </h2>
            <button onClick={fetchAiInsights} className="text-sm text-accent hover:text-accent-hover">
              Uppdatera
            </button>
          </div>

          {insightsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : aiInsights.insights.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-success/20 rounded-full flex items-center justify-center text-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-text-secondary">Allt ser bra ut! Inga problem upptäckta.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiInsights.insights.slice(0, 5).map((insight, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  insight.severity === 'high' ? 'bg-error/10 border-error/30' :
                  insight.severity === 'medium' ? 'bg-warning/10 border-warning/30' :
                  'bg-info/10 border-info/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      insight.severity === 'high' ? 'bg-error text-white' :
                      insight.severity === 'medium' ? 'bg-warning text-white' :
                      'bg-info text-white'
                    }`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm">{insight.company_name}</p>
                      <p className="text-xs text-text-secondary">{insight.description}</p>
                    </div>
                    <span className="text-xs font-medium text-text-tertiary">{insight.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {aiInsights.trending_topics.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-tertiary mb-2">Trendande ämnen denna vecka:</p>
              <div className="flex flex-wrap gap-2">
                {aiInsights.trending_topics.map((topic, i) => (
                  <span key={i} className="px-2 py-1 bg-bg-secondary rounded-full text-xs text-text-secondary">
                    {topic.topic} <span className="text-text-tertiary">({topic.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LIVE ACTIVITY STREAM */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              Live Aktivitet
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <button onClick={fetchActivityStream} className="text-sm text-accent hover:text-accent-hover">
                Uppdatera
              </button>
            </div>
          </div>

          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : activityStream.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">Ingen aktivitet ännu</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activityStream.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'conversation' ? 'bg-accent/20 text-accent' : 'bg-info/20 text-info'
                  }`}>
                    {activity.type === 'conversation' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {activity.type === 'conversation' ? (
                      <>
                        <p className="text-sm text-text-primary truncate">
                          <span className="font-medium">{activity.company_name}</span>
                          <span className="text-text-tertiary"> fick </span>
                          <span className="font-medium">{activity.message_count}</span>
                          <span className="text-text-tertiary"> {activity.message_count === 1 ? 'fråga' : 'frågor'}</span>
                        </p>
                        <p className="text-xs text-text-tertiary">{activity.category} • {activity.language}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-text-primary truncate">{activity.description}</p>
                        <p className="text-xs text-text-tertiary">av {activity.admin}</p>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-text-tertiary flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BUSINESS HEALTH INDICATORS */}
      <div className="card">
        <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Verksamhetshälsa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-bg-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Kundaktivitet</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                (activeCompanies / totalCompanies) > 0.8
                  ? 'bg-success/20 text-success'
                  : (activeCompanies / totalCompanies) > 0.5
                    ? 'bg-warning/20 text-warning'
                    : 'bg-error/20 text-error'
              }`}>
                {Math.round((activeCompanies / totalCompanies) * 100) || 0}%
              </span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  (activeCompanies / totalCompanies) > 0.8
                    ? 'bg-success'
                    : (activeCompanies / totalCompanies) > 0.5
                      ? 'bg-warning'
                      : 'bg-error'
                }`}
                style={{ width: `${(activeCompanies / totalCompanies) * 100 || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-text-tertiary mt-2">{activeCompanies} av {totalCompanies} kunder är aktiva</p>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Kunskapstäckning</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies > 0.7
                  ? 'bg-success/20 text-success'
                  : 'bg-warning/20 text-warning'
              }`}>
                {Math.round((companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies) * 100) || 0}%
              </span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies > 0.7
                    ? 'bg-success'
                    : 'bg-warning'
                }`}
                style={{ width: `${(companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies) * 100 || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-text-tertiary mt-2">
              {companies.filter(c => (c.knowledge_count || 0) >= 10).length} kunder har 10+ kunskapsposter
            </p>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Genomsnitt frågor/kund</span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-info/20 text-info">
                {totalCompanies > 0 ? Math.round(totalChats / totalCompanies) : 0}
              </span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {companies
                .sort((a, b) => (a.chat_count || 0) - (b.chat_count || 0))
                .slice(0, 20)
                .map((c, i) => {
                  const maxChats = Math.max(...companies.map(x => x.chat_count || 0)) || 1
                  const height = ((c.chat_count || 0) / maxChats) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-info/30 rounded-t"
                      style={{ height: `${Math.max(height, 10)}%` }}
                    ></div>
                  )
                })}
            </div>
            <p className="text-xs text-text-tertiary mt-2">Fördelning av chattsamtal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
