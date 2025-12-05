/**
 * SuperAdmin Pricing Tab Component
 * Manages pricing tiers, revenue dashboard, and feature roadmap
 */

const PricingTab = ({
  revenueDashboard,
  pricingTiers,
  dbPricingTiers,
  companies,
  roadmapItems,
  onOpenPricingModal,
  onOpenDiscountModal,
  onInitPricingTiers,
  onOpenEditPricingTierModal,
  onOpenPricingTierModalNew,
  onOpenRoadmapModalNew,
  onOpenEditRoadmapModal,
  onDeleteRoadmapItem
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Prissättning & Intäkter</h1>
        <p className="text-text-secondary mt-1">Hantera prisnivåer och se intäktsöversikt</p>
      </div>

      {/* Revenue Dashboard */}
      {revenueDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-sm text-green-700 font-medium">MRR (Månadlig)</p>
            <p className="text-3xl font-bold text-green-800 mt-1">
              {revenueDashboard.mrr?.toLocaleString('sv-SE')} kr
            </p>
            <p className="text-xs text-green-600 mt-1">{revenueDashboard.total_active_companies} aktiva företag</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-sm text-blue-700 font-medium">ARR (Årlig)</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">
              {revenueDashboard.arr?.toLocaleString('sv-SE')} kr
            </p>
            <p className="text-xs text-blue-600 mt-1">Prognostiserad årsintäkt</p>
          </div>
          <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <p className="text-sm text-amber-700 font-medium">Uppstartsavgifter (inbetalda)</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">
              {revenueDashboard.startup_fees_collected?.toLocaleString('sv-SE')} kr
            </p>
            <p className="text-xs text-amber-600 mt-1">Engångsintäkter</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-sm text-purple-700 font-medium">Ej fakturerade uppstarter</p>
            <p className="text-3xl font-bold text-purple-800 mt-1">
              {revenueDashboard.startup_fees_pending?.toLocaleString('sv-SE')} kr
            </p>
            <p className="text-xs text-purple-600 mt-1">Att fakturera</p>
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Prisnivåer</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(pricingTiers).map(([key, tier]) => (
            <div
              key={key}
              className="p-5 rounded-xl border-2 border-border-subtle bg-bg-secondary"
            >
              <h3 className="text-lg font-bold text-text-primary">{tier.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-text-primary">{tier.monthly_fee?.toLocaleString('sv-SE')}</span>
                <span className="text-text-secondary"> kr/mån</span>
              </div>
              <p className="text-sm text-text-tertiary mt-1">
                + {tier.startup_fee?.toLocaleString('sv-SE')} kr uppstart
              </p>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <ul className="space-y-2">
                  {tier.features?.map((feature, idx) => (
                    <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Tier stats */}
              {revenueDashboard?.tier_breakdown?.[key] && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-xs text-text-tertiary">
                    {revenueDashboard.tier_breakdown[key].count} företag på denna nivå
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {revenueDashboard.tier_breakdown[key].mrr?.toLocaleString('sv-SE')} kr/mån
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Companies by Tier */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Företag per prisnivå</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Företag</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Prisnivå</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Månadskostnad</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Rabatt</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Uppstart betald</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Startdatum</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => {
                const tier = pricingTiers[company.pricing_tier || 'starter'] || pricingTiers.starter
                return (
                  <tr key={company.id} className="border-b border-border-subtle hover:bg-bg-secondary/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{company.name}</div>
                      <div className="text-xs text-text-tertiary">{company.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.pricing_tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        company.pricing_tier === 'business' ? 'bg-blue-100 text-blue-800' :
                        company.pricing_tier === 'professional' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tier?.name || 'Starter'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">
                      {tier?.monthly_fee?.toLocaleString('sv-SE')} kr
                    </td>
                    <td className="px-4 py-3">
                      {company.discount_percent > 0 ? (
                        <span className="text-green-600 font-medium">
                          {company.discount_percent}%
                          {company.discount_end_date && (
                            <span className="text-xs text-text-tertiary ml-1">
                              (t.o.m. {company.discount_end_date})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {company.startup_fee_paid ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ja
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Nej ({tier?.startup_fee?.toLocaleString('sv-SE')} kr)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {company.contract_start_date || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenPricingModal(company)}
                          className="btn btn-ghost text-sm"
                        >
                          Ändra nivå
                        </button>
                        <button
                          onClick={() => onOpenDiscountModal(company)}
                          className="btn btn-ghost text-sm"
                        >
                          Rabatt
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editable Pricing Tiers */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Redigera prisnivåer</h2>
          <div className="flex gap-2">
            {dbPricingTiers.length === 0 && (
              <button
                onClick={onInitPricingTiers}
                className="btn btn-secondary text-sm"
              >
                Initiera standardpriser
              </button>
            )}
            <button
              onClick={onOpenPricingTierModalNew}
              className="btn btn-primary text-sm"
            >
              + Ny prisnivå
            </button>
          </div>
        </div>
        {dbPricingTiers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Nyckel</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Namn</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Månadsavgift</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Uppstartsavgift</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Max konv.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {dbPricingTiers.map(tier => (
                  <tr key={tier.tier_key} className="border-b border-border-subtle hover:bg-bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">{tier.tier_key}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{tier.name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{tier.monthly_fee?.toLocaleString('sv-SE')} kr</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{tier.startup_fee?.toLocaleString('sv-SE')} kr</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{tier.max_conversations === 0 ? 'Obegränsat' : tier.max_conversations}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${tier.is_active ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}>
                        {tier.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onOpenEditPricingTierModal(tier)}
                        className="btn btn-ghost text-sm"
                      >
                        Redigera
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">Inga prisnivåer i databasen. Klicka "Initiera standardpriser" för att komma igång.</p>
        )}
      </div>

      {/* Upcoming Features Roadmap */}
      <div className="card border-dashed border-2 border-accent/30 bg-accent/5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Kommande funktioner (Roadmap)
          </h2>
          <button
            onClick={onOpenRoadmapModalNew}
            className="btn btn-primary text-sm"
          >
            + Ny punkt
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-4">Funktioner som planeras för framtida versioner</p>
        {roadmapItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmapItems.map(item => {
              const quarterColor = item.quarter?.includes('Q1') ? 'blue' :
                                    item.quarter?.includes('Q2') ? 'green' :
                                    item.quarter?.includes('Q3') ? 'purple' :
                                    item.quarter?.includes('Backlog') ? 'amber' : 'gray'
              const statusBadge = item.status === 'completed' ? 'bg-success-soft text-success' :
                                  item.status === 'in_progress' ? 'bg-accent-soft text-accent' :
                                  item.status === 'cancelled' ? 'bg-error-soft text-error' : ''
              return (
                <div key={item.id} className="p-4 bg-white rounded-lg border border-border-subtle group relative">
                  <div className="flex items-start justify-between">
                    <span className={`text-xs font-semibold text-${quarterColor}-600 bg-${quarterColor}-100 px-2 py-1 rounded`}>
                      {item.quarter}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => onOpenEditRoadmapModal(item)}
                        className="p-1 hover:bg-bg-secondary rounded"
                        title="Redigera"
                      >
                        <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteRoadmapItem(item.id)}
                        className="p-1 hover:bg-error-soft rounded"
                        title="Radera"
                      >
                        <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-text-primary mt-2">{item.title}</h4>
                  <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                  {item.status !== 'planned' && (
                    <span className={`mt-2 inline-flex px-2 py-0.5 text-xs rounded-full ${statusBadge}`}>
                      {item.status === 'completed' ? 'Klar' : item.status === 'in_progress' ? 'Pågående' : 'Avbruten'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">Ingen roadmap definierad ännu.</p>
            <button
              onClick={onOpenRoadmapModalNew}
              className="btn btn-primary"
            >
              Lägg till första punkten
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PricingTab
