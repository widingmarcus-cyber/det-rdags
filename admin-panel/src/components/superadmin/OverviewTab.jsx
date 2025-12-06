/**
 * SuperAdmin Overview Tab Component
 * Modern dashboard command center with KPIs, alerts, and quick actions
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
  onShowAnnouncementModal,
  aiInsights,
  insightsLoading,
  fetchAiInsights,
  activityStream,
  activityLoading,
  fetchActivityStream
}) => {
  const inactiveCount = companies.filter(c => !c.is_active).length
  const lowContentCount = companies.filter(c => (c.knowledge_count || 0) < 5).length

  return (
    <div className="animate-fade-in space-y-8">
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Kontrollcenter</h1>
          <p className="text-text-secondary mt-1">Överblick av din plattform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary hover:bg-bg-secondary border border-border-subtle rounded-xl text-text-secondary hover:text-text-primary transition-all shadow-sm hover:shadow"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-sm hidden sm:inline">Sök...</span>
            <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-bg-secondary rounded text-xs text-text-tertiary border border-border-subtle">
              ⌘K
            </kbd>
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-xl border border-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs text-success font-medium">Live</span>
          </div>
        </div>
      </header>

      {/* SYSTEM STATUS */}
      <div className={`relative overflow-hidden rounded-2xl p-6 ${
        systemHealth?.ollama_status === 'online'
          ? 'bg-gradient-to-br from-success/5 via-success/10 to-success/5 border border-success/20'
          : maintenanceMode?.enabled
            ? 'bg-gradient-to-br from-warning/5 via-warning/10 to-warning/5 border border-warning/20'
            : 'bg-gradient-to-br from-error/5 via-error/10 to-error/5 border border-error/20'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              systemHealth?.ollama_status === 'online'
                ? 'bg-gradient-to-br from-success to-emerald-600 text-white'
                : maintenanceMode?.enabled
                  ? 'bg-gradient-to-br from-warning to-amber-600 text-white'
                  : 'bg-gradient-to-br from-error to-red-600 text-white'
            }`}>
              {systemHealth?.ollama_status === 'online' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : maintenanceMode?.enabled ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${
                systemHealth?.ollama_status === 'online'
                  ? 'text-success'
                  : maintenanceMode?.enabled
                    ? 'text-warning'
                    : 'text-error'
              }`}>
                {systemHealth?.ollama_status === 'online'
                  ? 'Systemet är online'
                  : maintenanceMode?.enabled
                    ? 'Underhållsläge'
                    : 'Systemet är offline'}
              </h2>
              <p className="text-text-secondary text-sm">
                {systemHealth?.ollama_status === 'online'
                  ? 'AI-tjänsten fungerar normalt'
                  : maintenanceMode?.enabled
                    ? maintenanceMode.message || 'Planerat underhåll pågår'
                    : 'Kontrollera AI-tjänsten'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{systemHealth?.database_size || '—'}</p>
              <p className="text-xs text-text-tertiary">Databas</p>
            </div>
            <div className="w-px h-10 bg-border-subtle" />
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{systemHealth?.uptime || '—'}</p>
              <p className="text-xs text-text-tertiary">Upptid</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden bg-bg-tertiary rounded-2xl p-6 border border-border-subtle hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-text-primary mb-1">{totalCompanies}</p>
            <p className="text-sm text-text-secondary">Kunder</p>
            <p className="text-xs text-accent mt-2">{activeCompanies} aktiva</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-bg-tertiary rounded-2xl p-6 border border-border-subtle hover:border-success/30 transition-all hover:shadow-lg hover:shadow-success/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-success/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-text-primary mb-1">{totalChats.toLocaleString()}</p>
            <p className="text-sm text-text-secondary">Chattsamtal</p>
            <p className="text-xs text-success mt-2">Totalt besvarade</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-bg-tertiary rounded-2xl p-6 border border-border-subtle hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-text-primary mb-1">{totalKnowledge.toLocaleString()}</p>
            <p className="text-sm text-text-secondary">Kunskapsposter</p>
            <p className="text-xs text-blue-500 mt-2">I AI-databasen</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-bg-tertiary rounded-2xl p-6 border border-border-subtle hover:border-warning/30 transition-all hover:shadow-lg hover:shadow-warning/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-warning/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-text-primary mb-1">{inactiveCount}</p>
            <p className="text-sm text-text-secondary">Inaktiva</p>
            <p className="text-xs text-warning mt-2">Pausade kunder</p>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Aktiva meddelanden
            </h3>
            <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-1 rounded-lg">{announcements.length}</span>
          </div>
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`rounded-xl p-4 flex items-center justify-between border transition-all ${
              announcement.type === 'warning' ? 'bg-warning/5 border-warning/20' :
              announcement.type === 'maintenance' ? 'bg-error/5 border-error/20' :
              'bg-accent/5 border-accent/20'
            } ${!announcement.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  announcement.type === 'warning' ? 'bg-warning text-white' :
                  announcement.type === 'maintenance' ? 'bg-error text-white' :
                  'bg-accent text-white'
                }`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-text-primary text-sm">{announcement.title}</p>
                    {announcement.target_company_name && (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                        {announcement.target_company_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{announcement.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => onToggleAnnouncement(announcement.id)}
                  className="p-2 rounded-lg hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ATTENTION NEEDED */}
      {(inactiveCount > 0 || lowContentCount > 0) && (
        <div className="bg-gradient-to-r from-warning/5 via-warning/10 to-warning/5 rounded-2xl p-5 border border-warning/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning rounded-xl flex items-center justify-center text-white shadow-lg shadow-warning/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Kräver uppmärksamhet</h3>
              <p className="text-xs text-text-secondary">Saker som kan behöva åtgärdas</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inactiveCount > 0 && (
              <button
                onClick={() => setActiveTab('companies')}
                className="flex items-center justify-between p-4 bg-bg-tertiary hover:bg-bg-secondary rounded-xl transition-all group border border-border-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center text-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary text-sm">{inactiveCount} inaktiva kunder</p>
                    <p className="text-xs text-text-tertiary">Pausade prenumerationer</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
            {lowContentCount > 0 && (
              <button
                onClick={() => setActiveTab('companies')}
                className="flex items-center justify-between p-4 bg-bg-tertiary hover:bg-bg-secondary rounded-xl transition-all group border border-border-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center text-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary text-sm">{lowContentCount} med lite innehåll</p>
                    <p className="text-xs text-text-tertiary">Under 5 kunskapsposter</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QUICK ACTIONS */}
        <div className="lg:col-span-1">
          <div className="bg-bg-tertiary rounded-2xl p-6 border border-border-subtle h-full">
            <h2 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              Snabbåtgärder
            </h2>
            <div className="space-y-3">
              <button
                onClick={onAddCompany}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white hover:shadow-lg hover:shadow-accent/20 transition-all group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">Lägg till kund</p>
                  <p className="text-xs opacity-80">Skapa nytt företagskonto</p>
                </div>
              </button>
              <button
                onClick={onShowAnnouncementModal}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle hover:border-blue-500/30 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">Skicka meddelande till kunder</p>
                  <p className="text-xs text-text-secondary">Broadcast till administratörer</p>
                </div>
              </button>
              <button
                onClick={onGdprCleanup}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle hover:border-success/30 transition-all group"
              >
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle hover:border-purple-500/30 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">Se analys</p>
                  <p className="text-xs text-text-secondary">Statistik och trender</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* TOP CUSTOMERS */}
        <div className="lg:col-span-2">
          <div className="bg-bg-tertiary rounded-2xl p-6 border border-border-subtle h-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                Topp 10 kunder
              </h2>
              <button
                onClick={() => setActiveTab('companies')}
                className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Visa alla →
              </button>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left text-xs text-text-tertiary border-b border-border-subtle">
                    <th className="pb-3 font-medium w-8">#</th>
                    <th className="pb-3 font-medium">Kund</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Chattar</th>
                    <th className="pb-3 font-medium text-right">Kunskap</th>
                  </tr>
                </thead>
                <tbody>
                  {companies
                    .sort((a, b) => (b.chat_count || 0) - (a.chat_count || 0))
                    .slice(0, 10)
                    .map((company, i) => (
                      <tr key={company.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors">
                        <td className="py-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-sm' :
                            i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm' :
                            i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm' :
                            'bg-bg-secondary text-text-tertiary'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-text-primary text-sm">{company.name}</p>
                          <p className="text-xs text-text-tertiary">{company.id}</p>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            company.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-error/10 text-error'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              company.is_active ? 'bg-success' : 'bg-error'
                            }`} />
                            {company.is_active ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-semibold text-text-primary text-sm">
                            {(company.chat_count || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`font-medium text-sm ${
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
          </div>
        </div>
      </div>

      {/* INSIGHTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI INSIGHTS */}
        <div className="bg-bg-tertiary rounded-2xl p-6 border border-border-subtle">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 0 4h-1v1a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-4 0v-1h-2v1a2 2 0 0 1-4 0v-1H6a2 2 0 0 1-2-2v-1H3a2 2 0 0 1 0-4h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                </svg>
              </div>
              AI Insikter
            </h2>
            <button onClick={fetchAiInsights} className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">
              Uppdatera
            </button>
          </div>

          {insightsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : aiInsights.insights.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-text-secondary">Allt ser bra ut!</p>
              <p className="text-xs text-text-tertiary mt-1">Inga problem upptäckta</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {aiInsights.insights.slice(0, 5).map((insight, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  insight.severity === 'high' ? 'bg-error/5 border-error/20' :
                  insight.severity === 'medium' ? 'bg-warning/5 border-warning/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      insight.severity === 'high' ? 'bg-error text-white' :
                      insight.severity === 'medium' ? 'bg-warning text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm">{insight.company_name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{insight.description}</p>
                    </div>
                    <span className="text-xs font-medium text-text-tertiary bg-bg-secondary px-2 py-1 rounded-lg">{insight.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {aiInsights.trending_topics.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border-subtle">
              <p className="text-xs text-text-tertiary mb-3">Trendande ämnen</p>
              <div className="flex flex-wrap gap-2">
                {aiInsights.trending_topics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 bg-bg-secondary rounded-lg text-xs text-text-secondary hover:bg-bg-primary transition-colors">
                    {topic.topic} <span className="text-text-tertiary">({topic.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LIVE ACTIVITY */}
        <div className="bg-bg-tertiary rounded-2xl p-6 border border-border-subtle">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              Live aktivitet
            </h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <button onClick={fetchActivityStream} className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">
                Uppdatera
              </button>
            </div>
          </div>

          {activityLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : activityStream.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 bg-bg-secondary rounded-2xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <p className="text-text-secondary">Ingen aktivitet ännu</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {activityStream.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'conversation' ? 'bg-accent/10 text-accent' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {activity.type === 'conversation' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {activity.type === 'conversation' ? (
                      <>
                        <p className="text-sm text-text-primary">
                          <span className="font-medium">{activity.company_name}</span>
                          <span className="text-text-tertiary"> fick </span>
                          <span className="font-medium">{activity.message_count}</span>
                          <span className="text-text-tertiary"> {activity.message_count === 1 ? 'fråga' : 'frågor'}</span>
                        </p>
                        <p className="text-xs text-text-tertiary">{activity.category}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-text-primary">{activity.description}</p>
                        <p className="text-xs text-text-tertiary">av {activity.admin}</p>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-text-tertiary flex-shrink-0 tabular-nums">
                    {new Date(activity.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BUSINESS HEALTH */}
      <div className="bg-bg-tertiary rounded-2xl p-6 border border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          Verksamhetshälsa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Kundaktivitet</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                (activeCompanies / totalCompanies) > 0.8
                  ? 'bg-success/10 text-success'
                  : (activeCompanies / totalCompanies) > 0.5
                    ? 'bg-warning/10 text-warning'
                    : 'bg-error/10 text-error'
              }`}>
                {Math.round((activeCompanies / totalCompanies) * 100) || 0}%
              </span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  (activeCompanies / totalCompanies) > 0.8
                    ? 'bg-gradient-to-r from-success to-emerald-400'
                    : (activeCompanies / totalCompanies) > 0.5
                      ? 'bg-gradient-to-r from-warning to-amber-400'
                      : 'bg-gradient-to-r from-error to-red-400'
                }`}
                style={{ width: `${(activeCompanies / totalCompanies) * 100 || 0}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-3">{activeCompanies} av {totalCompanies} kunder är aktiva</p>
          </div>

          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Kunskapstäckning</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies > 0.7
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              }`}>
                {Math.round((companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies) * 100) || 0}%
              </span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies > 0.7
                    ? 'bg-gradient-to-r from-success to-emerald-400'
                    : 'bg-gradient-to-r from-warning to-amber-400'
                }`}
                style={{ width: `${(companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies) * 100 || 0}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-3">
              {companies.filter(c => (c.knowledge_count || 0) >= 10).length} kunder har 10+ kunskapsposter
            </p>
          </div>

          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Snitt frågor/kund</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500">
                {totalCompanies > 0 ? Math.round(totalChats / totalCompanies) : 0}
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-10">
              {companies
                .sort((a, b) => (a.chat_count || 0) - (b.chat_count || 0))
                .slice(0, 20)
                .map((c, i) => {
                  const maxChats = Math.max(...companies.map(x => x.chat_count || 0)) || 1
                  const height = ((c.chat_count || 0) / maxChats) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-500/20 rounded-t transition-all hover:from-blue-500/60 hover:to-blue-500/40"
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                  )
                })}
            </div>
            <p className="text-xs text-text-tertiary mt-3">Fördelning av chattsamtal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
