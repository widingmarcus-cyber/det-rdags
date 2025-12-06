/**
 * SuperAdmin Pricing Tab Component
 * Manages pricing tiers and revenue dashboard
 */

const PricingTab = ({
  revenueDashboard,
  pricingTiers,
  dbPricingTiers,
  onInitPricingTiers,
  onOpenEditPricingTierModal,
  onOpenPricingTierModalNew
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Prissättning & Intäkter</h1>
        <p className="text-text-secondary mt-1">Hantera prisnivåer och se intäktsöversikt</p>
      </div>

      {/* Revenue Dashboard */}
      {revenueDashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

    </div>
  )
}

export default PricingTab
