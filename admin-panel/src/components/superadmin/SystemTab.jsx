/**
 * SuperAdmin System Tab Component
 * Displays system health, configuration, and maintenance mode
 */

const SystemTab = ({
  systemHealth,
  maintenanceMode,
  onToggleMaintenance,
  onCleanupWidgets
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Systeminställningar</h1>
        <p className="text-text-secondary mt-1">Övervaka och konfigurera systemet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Systemhälsa</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${systemHealth?.ollama_status === 'online' ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-text-primary">Ollama AI</span>
              </div>
              <span className="text-sm text-text-secondary">{systemHealth?.ollama_status || 'Kontrollerar...'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-text-primary">Databas</span>
              </div>
              <span className="text-sm text-text-secondary">{systemHealth?.database_size || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-text-primary">API</span>
              </div>
              <span className="text-sm text-text-secondary">Online</span>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Konfiguration</h2>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary">AI-modell (aktiv)</p>
              <p className="text-text-primary font-medium font-mono">{systemHealth?.ollama_model || 'Laddar...'}</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary">Max retention</p>
              <p className="text-text-primary font-medium">30 dagar</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary">GDPR-cleanup</p>
              <p className="text-text-primary font-medium">Varje timme</p>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-medium text-text-primary mb-4">Underhållsläge</h2>
          <p className="text-sm text-text-secondary mb-4">
            När underhållsläge är aktiverat blockeras alla chattwidgets på alla kundsajter.
            Användare ser ett meddelande om att tjänsten tillfälligt är otillgänglig.
            Admin-panelen och kunskapshantering fungerar fortfarande.
          </p>
          <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary">
            <div>
              <p className="font-medium text-text-primary">
                {maintenanceMode.enabled ? 'Underhållsläge är aktivt' : 'Systemet är online'}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {maintenanceMode.enabled
                  ? maintenanceMode.message || 'Alla chattwidgets är inaktiverade'
                  : 'Alla chattwidgets fungerar normalt'}
              </p>
            </div>
            <button
              onClick={onToggleMaintenance}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                maintenanceMode.enabled
                  ? 'bg-success text-white hover:bg-success-hover'
                  : 'bg-warning text-white hover:bg-warning-hover'
              }`}
            >
              {maintenanceMode.enabled ? 'Avaktivera' : 'Aktivera underhåll'}
            </button>
          </div>
          {maintenanceMode.enabled && (
            <div className="mt-4 p-4 rounded-lg bg-warning-soft border border-warning/20">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning flex-shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="font-medium text-warning">Varning: Underhållsläge aktivt</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Inga chattwidgets kan användas medan underhållsläget är aktivt. Användare ser meddelandet ovan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Widget Cleanup */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-medium text-text-primary mb-4">Widgethantering</h2>
          <p className="text-sm text-text-secondary mb-4">
            Varje företag kan ha max 2 widgets (1 intern och 1 extern). Använd knappen nedan för att
            automatiskt ta bort extra widgets från alla företag som har fler än 2.
          </p>
          <button
            onClick={onCleanupWidgets}
            className="px-4 py-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium transition-colors"
          >
            Rensa extra widgets
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemTab
