/**
 * SuperAdmin Companies Tab Component
 * Company list with search, filtering, bulk operations, and usage tracking
 */

const CompaniesTab = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCompanies,
  setSelectedCompanies,
  toggleSelectAll,
  toggleSelectCompany,
  onBulkToggle,
  loading,
  filteredCompanies,
  onOpenCompanyDashboard,
  formatDate,
  getUsageColor,
  onAddCompany
}) => {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Företag</h1>
          <p className="text-text-secondary mt-1">Hantera alla kunder i systemet</p>
        </div>
        <button onClick={onAddCompany} className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nytt företag
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök företag..."
              className="input pl-10"
            />
          </div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-')
              setSortBy(by)
              setSortOrder(order)
            }}
            className="input w-auto"
          >
            <option value="created_at-desc">Nyast först</option>
            <option value="created_at-asc">Äldst först</option>
            <option value="name-asc">Namn A-Ö</option>
            <option value="name-desc">Namn Ö-A</option>
            <option value="chat_count-desc">Mest aktiva</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedCompanies.size > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
            <span className="text-sm text-text-secondary">{selectedCompanies.size} valda</span>
            <button onClick={() => onBulkToggle(true)} className="btn btn-ghost text-success text-sm py-1">
              Aktivera alla
            </button>
            <button onClick={() => onBulkToggle(false)} className="btn btn-ghost text-warning text-sm py-1">
              Inaktivera alla
            </button>
            <button onClick={() => setSelectedCompanies(new Set())} className="btn btn-ghost text-sm py-1">
              Avmarkera
            </button>
          </div>
        )}
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Laddar företag...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary">Inga företag hittades</h3>
          <p className="text-text-secondary mt-2">
            {searchQuery ? 'Prova en annan sökning' : 'Skapa ditt första företag'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {/* Mobile scroll hint */}
          <div className="sm:hidden px-4 py-2 bg-bg-secondary border-b border-border-subtle flex items-center gap-2 text-xs text-text-tertiary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Svep för att se mer
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-bg-secondary border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <button
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                      selectedCompanies.size === filteredCompanies.length && filteredCompanies.length > 0
                        ? 'bg-accent text-white'
                        : 'bg-bg-primary border border-border-subtle hover:border-accent/50'
                    }`}
                  >
                    {selectedCompanies.size === filteredCompanies.length && filteredCompanies.length > 0 && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Företag</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Widgets</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Kunskapsbas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Konversationer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Användning</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">Skapad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredCompanies.map((company) => {
                // Calculate usage percentages
                const convLimit = company.max_conversations_month || 0
                const convCurrent = company.current_month_conversations || 0
                const convPercent = convLimit > 0 ? Math.min(100, (convCurrent / convLimit) * 100) : 0
                const hasConvLimit = convLimit > 0

                const knowledgeLimit = company.max_knowledge_items || 0
                const knowledgeCurrent = company.knowledge_count || 0
                const knowledgePercent = knowledgeLimit > 0 ? Math.min(100, (knowledgeCurrent / knowledgeLimit) * 100) : 0
                const hasKnowledgeLimit = knowledgeLimit > 0

                const hasAnyLimit = hasConvLimit || hasKnowledgeLimit
                const maxPercent = Math.max(hasConvLimit ? convPercent : 0, hasKnowledgeLimit ? knowledgePercent : 0)
                const usageColors = getUsageColor(maxPercent)

                return (
                  <tr key={company.id} className="hover:bg-bg-secondary transition-colors">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelectCompany(company.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          selectedCompanies.has(company.id)
                            ? 'bg-accent text-white'
                            : 'bg-bg-primary border border-border-subtle hover:border-accent/50'
                        }`}
                      >
                        {selectedCompanies.has(company.id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onOpenCompanyDashboard(company)}
                        className="text-left hover:bg-bg-primary p-1 -m-1 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-text-primary hover:text-accent transition-colors">{company.name}</p>
                        <p className="text-sm text-text-tertiary">{company.id}</p>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        company.is_active
                          ? 'bg-success-soft text-success'
                          : 'bg-error-soft text-error'
                      }`}>
                        {company.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                        <span className="text-sm font-medium text-text-primary">{company.widget_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <span className="text-text-primary font-medium">{knowledgeCurrent}</span>
                        {hasKnowledgeLimit && (
                          <span className="text-text-tertiary"> / {knowledgeLimit}</span>
                        )}
                        {!hasKnowledgeLimit && (
                          <span className="text-text-tertiary"> poster</span>
                        )}
                      </div>
                      {hasKnowledgeLimit && (
                        <div className="w-16 h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${getUsageColor(knowledgePercent).bar} rounded-full`} style={{ width: `${knowledgePercent}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <span className="text-text-primary font-medium">{convCurrent}</span>
                        {hasConvLimit && (
                          <span className="text-text-tertiary"> / {convLimit}</span>
                        )}
                        {!hasConvLimit && (
                          <span className="text-text-tertiary"> denna mån</span>
                        )}
                      </div>
                      {hasConvLimit && (
                        <div className="w-16 h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${getUsageColor(convPercent).bar} rounded-full`} style={{ width: `${convPercent}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {hasAnyLimit ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${usageColors.bg} ${usageColors.text}`}>
                          {maxPercent >= 100 ? 'Gräns nådd' : maxPercent >= 75 ? 'Nära gräns' : 'OK'}
                        </span>
                      ) : (
                        <span className="text-xs text-text-tertiary">Obegränsat</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {formatDate(company.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompaniesTab
