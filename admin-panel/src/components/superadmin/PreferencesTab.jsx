/**
 * SuperAdmin Preferences Tab Component
 * Handles admin account settings, 2FA, and bulk operations
 */

const PreferencesTab = ({
  adminPrefs,
  adminAuth,
  selectedCompanies,
  onSetup2FA,
  onExportCompanies,
  onBulkSetLimits
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Kontoinställningar</h1>
        <p className="text-text-secondary mt-1">Hantera ditt adminkonto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security */}
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Säkerhet</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Tvåfaktorsautentisering</p>
                <p className="text-sm text-text-secondary">Extra säkerhet för ditt konto</p>
              </div>
              {adminPrefs.totp_enabled ? (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiverad</span>
              ) : (
                <button
                  onClick={onSetup2FA}
                  className="btn btn-secondary text-sm"
                >
                  Aktivera
                </button>
              )}
            </div>
            {!adminPrefs.totp_enabled && (
              <p className="text-xs text-text-tertiary px-1">
                2FA använder Google Authenticator eller liknande app. Om aktivering misslyckas, kontrollera backend-loggarna.
              </p>
            )}

            <div className="p-4 bg-bg-secondary rounded-lg">
              <p className="font-medium text-text-primary mb-2">Inloggad som</p>
              <p className="text-sm text-text-secondary">{adminAuth.username}</p>
            </div>
          </div>
        </div>

        {/* Bulk Operations */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-text-primary mb-4">Massoperationer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onExportCompanies}
              className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary transition-all"
            >
              <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Exportera företag</p>
                <p className="text-sm text-text-secondary">Ladda ner CSV med alla företag</p>
              </div>
            </button>

            {selectedCompanies.size > 0 && (
              <div className="p-4 bg-accent-soft rounded-lg">
                <p className="font-medium text-accent mb-2">{selectedCompanies.size} företag valda</p>
                <button
                  onClick={() => onBulkSetLimits({ max_conversations_month: 500 })}
                  className="btn btn-primary text-sm"
                >
                  Sätt gränser för alla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferencesTab
