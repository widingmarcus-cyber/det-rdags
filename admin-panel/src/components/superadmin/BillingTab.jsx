/**
 * SuperAdmin Billing Tab Component
 * Handles subscriptions, invoices, and revenue display
 */

const BillingTab = ({
  subscriptions,
  invoices,
  revenueDashboard,
  billingLoading,
  onCreateInvoice,
  onUpdateInvoiceStatus
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Fakturering</h1>
          <p className="text-text-secondary mt-1">Hantera prenumerationer och fakturor</p>
        </div>
        <button
          onClick={onCreateInvoice}
          className="btn btn-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Skapa faktura
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary">MRR</span>
          </div>
          {billingLoading ? (
            <div className="h-8 w-24 bg-bg-secondary rounded animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-text-primary">
              {revenueDashboard?.mrr?.toLocaleString('sv-SE') || 0} kr
            </p>
          )}
          <p className="text-xs text-text-tertiary mt-1">Månadsvis återkommande intäkt</p>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary">ARR</span>
          </div>
          {billingLoading ? (
            <div className="h-8 w-24 bg-bg-secondary rounded animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-text-primary">
              {revenueDashboard?.arr?.toLocaleString('sv-SE') || 0} kr
            </p>
          )}
          <p className="text-xs text-text-tertiary mt-1">Årlig återkommande intäkt</p>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary">Obetalda</span>
          </div>
          {billingLoading ? (
            <div className="h-8 w-12 bg-bg-secondary rounded animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-text-primary">
              {invoices.filter(i => i.status === 'pending').length}
            </p>
          )}
          <p className="text-xs text-text-tertiary mt-1">Väntande fakturor</p>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary">Aktiva pren.</span>
          </div>
          {billingLoading ? (
            <div className="h-8 w-12 bg-bg-secondary rounded animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-text-primary">
              {subscriptions.filter(s => s.status === 'active').length}
            </p>
          )}
          <p className="text-xs text-text-tertiary mt-1">Betalande kunder</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">Prenumerationer</h3>
            <span className="text-sm text-text-secondary">{subscriptions.length} totalt</span>
          </div>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <p className="text-text-secondary font-medium">Inga prenumerationer ännu</p>
              <p className="text-sm text-text-tertiary mt-1">Prenumerationer skapas automatiskt när kunder får en prisnivå</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {subscriptions.map(sub => (
                <div key={sub.id} className="p-4 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{sub.company_name}</p>
                      <p className="text-xs text-text-secondary">{sub.company_id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sub.plan_name === 'enterprise' ? 'bg-accent-soft text-accent' :
                      sub.plan_name === 'professional' || sub.plan_name === 'business' ? 'bg-success-soft text-success' :
                      sub.plan_name === 'starter' ? 'bg-warning-soft text-warning' :
                      'bg-bg-primary text-text-secondary'
                    }`}>
                      {sub.plan_name?.charAt(0).toUpperCase() + sub.plan_name?.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-text-secondary">{sub.plan_price?.toLocaleString('sv-SE')} kr/{sub.billing_cycle === 'monthly' ? 'mån' : 'år'}</span>
                    <span className={`text-xs flex items-center gap-1 ${sub.status === 'active' ? 'text-success' : 'text-warning'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-success' : 'bg-warning'}`} />
                      {sub.status === 'active' ? 'Aktiv' : sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">Senaste fakturor</h3>
            <span className="text-sm text-text-secondary">{invoices.length} totalt</span>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <p className="text-text-secondary font-medium">Inga fakturor ännu</p>
              <p className="text-sm text-text-tertiary mt-1">Skapa din första faktura med knappen ovan</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{inv.invoice_number}</p>
                      <p className="text-xs text-text-secondary">{inv.company_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      inv.status === 'paid' ? 'bg-success-soft text-success' :
                      inv.status === 'pending' ? 'bg-warning-soft text-warning' :
                      'bg-error-soft text-error'
                    }`}>
                      {inv.status === 'paid' ? 'Betald' : inv.status === 'pending' ? 'Väntar' : inv.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-medium text-text-primary">{inv.amount?.toLocaleString('sv-SE')} {inv.currency}</span>
                    <div className="flex items-center gap-2">
                      {inv.status === 'pending' && (
                        <button
                          onClick={() => onUpdateInvoiceStatus(inv.id, 'paid')}
                          className="opacity-0 group-hover:opacity-100 text-xs bg-success/10 text-success px-2 py-1 rounded hover:bg-success/20 transition-all"
                        >
                          Markera betald
                        </button>
                      )}
                      <span className="text-xs text-text-tertiary">{new Date(inv.created_at).toLocaleDateString('sv-SE')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info box about billing */}
      <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
        <div className="flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <p className="text-sm font-medium text-text-primary">Om fakturering</p>
            <p className="text-sm text-text-secondary mt-1">
              Prenumerationer skapas automatiskt när du tilldelar en prisnivå till ett företag under "Prissättning"-fliken.
              Fakturor kan skapas manuellt eller genereras automatiskt vid månadsslut.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingTab
