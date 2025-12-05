/**
 * SuperAdmin Sidebar Navigation Component
 * Extracted from SuperAdmin.jsx for better maintainability
 */

const SuperAdminSidebar = ({
  activeTab,
  setActiveTab,
  companiesCount,
  systemHealth,
  adminUsername
}) => {
  const navItems = [
    // Dashboard
    {
      id: 'overview',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      section: null
    },
    // Kunder section
    {
      id: 'companies',
      label: 'Företag',
      badge: companiesCount,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      section: 'Kunder'
    },
    {
      id: 'billing',
      label: 'Fakturering',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      section: null
    },
    // Produkt section
    {
      id: 'pricing',
      label: 'Prissättning',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      section: 'Produkt'
    },
    {
      id: 'analytics',
      label: 'Analys',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      section: null
    },
    // System section
    {
      id: 'system',
      label: 'Hälsa',
      statusIndicator: systemHealth?.ollama_status === 'online' ? 'online' : 'offline',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      section: 'System'
    },
    {
      id: 'audit',
      label: 'Aktivitetslogg',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      section: null
    },
    {
      id: 'gdpr',
      label: 'GDPR',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      section: null
    },
  ]

  const bottomItems = [
    {
      id: 'preferences',
      label: 'Inställningar',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
    {
      id: 'docs',
      label: 'Dokumentation',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
  ]

  const NavButton = ({ item }) => (
    <button
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        activeTab === item.id
          ? 'bg-accent/10 text-accent'
          : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
      }`}
    >
      {item.icon}
      {item.label}
      {item.badge !== undefined && (
        <span className="ml-auto text-xs bg-bg-secondary px-2 py-0.5 rounded-full">{item.badge}</span>
      )}
      {item.statusIndicator && (
        <span className={`ml-auto w-2 h-2 rounded-full ${
          item.statusIndicator === 'online' ? 'bg-success' : 'bg-error'
        }`} />
      )}
    </button>
  )

  // Group items by section for rendering
  const renderNavItems = () => {
    let lastSection = null
    return navItems.map((item) => {
      const showSection = item.section && item.section !== lastSection
      if (item.section) lastSection = item.section

      return (
        <div key={item.id}>
          {showSection && (
            <div className="pt-4">
              <span className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {item.section}
              </span>
            </div>
          )}
          <NavButton item={item} />
        </div>
      )
    })
  }

  return (
    <aside className="w-64 bg-bg-tertiary border-r border-border-subtle flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="p-4 space-y-1">
        {renderNavItems()}

        {/* Divider and bottom items */}
        <div className="pt-4 border-t border-border-subtle mt-4">
          {bottomItems.map(item => (
            <NavButton key={item.id} item={item} />
          ))}
        </div>

        {/* User section at bottom */}
        <div className="absolute bottom-4 left-4 right-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-warning">
                {adminUsername?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{adminUsername}</p>
              <p className="text-xs text-text-tertiary">Super Admin</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}

export default SuperAdminSidebar
