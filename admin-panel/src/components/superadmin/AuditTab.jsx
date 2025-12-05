/**
 * SuperAdmin Audit Tab Component
 * Displays audit logs with search and filter capabilities
 */

const AuditTab = ({
  auditLogs,
  auditLoading,
  auditSearchTerm,
  setAuditSearchTerm,
  auditActionType,
  setAuditActionType,
  auditActionTypes,
  auditDateRange,
  setAuditDateRange,
  onSearch
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Aktivitetslogg</h1>
        <p className="text-text-secondary mt-1">Spåra alla admin-åtgärder i systemet</p>
      </div>

      {/* Search Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={auditSearchTerm}
            onChange={(e) => setAuditSearchTerm(e.target.value)}
            placeholder="Sök i beskrivning..."
            className="input"
          />
          <select
            value={auditActionType}
            onChange={(e) => setAuditActionType(e.target.value)}
            className="input"
          >
            <option value="">Alla åtgärder</option>
            {auditActionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="date"
            value={auditDateRange.start}
            onChange={(e) => setAuditDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="input"
            placeholder="Från datum"
          />
          <button
            onClick={onSearch}
            className="btn btn-primary"
          >
            Sök
          </button>
        </div>
      </div>

      {auditLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Laddar aktivitetslogg...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary">Ingen aktivitet ännu</h3>
          <p className="text-text-secondary mt-2">Åtgärder kommer att loggas här</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tidpunkt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Åtgärd</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Företag</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Beskrivning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-bg-secondary transition-colors">
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('sv-SE')}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary font-medium">
                    {log.admin_username}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      log.action_type === 'create_company' ? 'bg-success-soft text-success' :
                      log.action_type === 'delete_company' ? 'bg-error-soft text-error' :
                      log.action_type === 'toggle_company' ? 'bg-warning-soft text-warning' :
                      log.action_type === 'impersonate' ? 'bg-accent-soft text-accent' :
                      'bg-bg-secondary text-text-secondary'
                    }`}>
                      {log.action_type === 'create_company' ? 'Skapat' :
                       log.action_type === 'delete_company' ? 'Raderat' :
                       log.action_type === 'toggle_company' ? 'Växlat status' :
                       log.action_type === 'impersonate' ? 'Impersonerat' :
                       log.action_type === 'export' ? 'Exporterat' :
                       log.action_type === 'maintenance_mode' ? 'Underhållsläge' :
                       log.action_type === 'usage_limit' ? 'Användningsgräns' :
                       log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {log.target_company_id || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {log.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AuditTab
