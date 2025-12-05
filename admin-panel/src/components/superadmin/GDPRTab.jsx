/**
 * SuperAdmin GDPR Tab Component
 * Handles GDPR compliance actions and status display
 */

const GDPRTab = ({ onGdprCleanup }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">GDPR & Dataskydd</h1>
        <p className="text-text-secondary mt-1">Hantera dataskydd och compliance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDPR Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">GDPR-åtgärder</h2>
          <div className="space-y-3">
            <button
              onClick={onGdprCleanup}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all group"
            >
              <div className="w-10 h-10 bg-warning-soft rounded-lg flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Manuell cleanup</p>
                <p className="text-sm text-text-secondary">Rensa utgångna konversationer nu</p>
              </div>
            </button>
          </div>
        </div>

        {/* GDPR Stats */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Dataskyddsstatus</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
              <span className="text-text-primary">Automatisk cleanup</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
              <span className="text-text-primary">IP-anonymisering</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
              <span className="text-text-primary">Samtyckesspårning</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiv</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GDPRTab
