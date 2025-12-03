import { NavLink } from 'react-router-dom'

function Navbar({ companyId, companyName, onLogout, darkMode, toggleDarkMode }) {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'chart' },
    { to: '/knowledge', label: 'Kunskapsbas', icon: 'book' },
    { to: '/widgets', label: 'Widgets', icon: 'widgets' },
    { to: '/conversations', label: 'Konversationer', icon: 'messages' },
    { to: '/analytics', label: 'Statistik', icon: 'analytics' },
    { to: '/settings', label: 'Inställningar', icon: 'settings' },
    { to: '/preview', label: 'Förhandsgranska', icon: 'eye' },
    { to: '/documentation', label: 'Dokumentation', icon: 'docs' },
  ]

  const renderIcon = (icon) => {
    switch (icon) {
      case 'chart':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        )
      case 'book':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        )
      case 'widgets':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        )
      case 'messages':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      case 'settings':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        )
      case 'eye':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      case 'analytics':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        )
      case 'docs':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <aside
      id="main-nav"
      className="w-60 bg-bg-secondary border-r border-border-subtle flex flex-col h-screen sticky top-0"
      role="complementary"
      aria-label="Sidomeny"
    >
      {/* Logo & Mascot */}
      <div className="p-4 mb-2">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Cute Robot Mascot */}
          <div className="w-10 h-10 relative" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Antenna */}
              <circle cx="24" cy="6" r="3" fill="#D97757"/>
              <rect x="22" y="6" width="4" height="6" fill="#D97757"/>
              {/* Head */}
              <rect x="8" y="12" width="32" height="24" rx="6" fill="url(#mascotGradient)"/>
              {/* Eyes */}
              <circle cx="17" cy="24" r="4" fill="white"/>
              <circle cx="31" cy="24" r="4" fill="white"/>
              <circle cx="18" cy="24" r="2" fill="#3D2B24"/>
              <circle cx="32" cy="24" r="2" fill="#3D2B24"/>
              {/* Eye shine */}
              <circle cx="18.5" cy="23" r="0.8" fill="white"/>
              <circle cx="32.5" cy="23" r="0.8" fill="white"/>
              {/* Cheeks */}
              <ellipse cx="12" cy="28" rx="2.5" ry="1.5" fill="#E8A87C" opacity="0.6"/>
              <ellipse cx="36" cy="28" rx="2.5" ry="1.5" fill="#E8A87C" opacity="0.6"/>
              {/* Mouth */}
              <path d="M20 30 Q24 34 28 30" stroke="#3D2B24" strokeWidth="2" strokeLinecap="round" fill="none"/>
              {/* Ears */}
              <rect x="2" y="20" width="6" height="10" rx="2" fill="#C4613D"/>
              <rect x="40" y="20" width="6" height="10" rx="2" fill="#C4613D"/>
              {/* Body hint */}
              <rect x="16" y="36" width="16" height="8" rx="3" fill="#C4613D"/>
              {/* Gradient definition */}
              <defs>
                <linearGradient id="mascotGradient" x1="8" y1="12" x2="40" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D97757"/>
                  <stop offset="1" stopColor="#C4613D"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <span className="font-semibold text-text-primary block">Bobot</span>
            <span className="text-xs text-text-tertiary">AI Assistent</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1" role="navigation" aria-label="Huvudnavigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            end={item.to === '/'}
            aria-current={({ isActive }) => isActive ? 'page' : undefined}
          >
            <span aria-hidden="true">{renderIcon(item.icon)}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border-subtle" role="region" aria-label="Användarmeny">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-text-primary truncate">{companyName}</p>
          <p className="text-xs text-text-tertiary truncate">{companyId}</p>
        </div>
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="sidebar-item w-full text-left mb-1"
          aria-label={darkMode ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
          aria-pressed={darkMode}
        >
          <span aria-hidden="true">
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
          {darkMode ? 'Ljust läge' : 'Mörkt läge'}
        </button>
        <button
          onClick={onLogout}
          className="sidebar-item w-full text-left text-error hover:bg-error-soft hover:text-error"
          aria-label="Logga ut från kontot"
        >
          <span aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          Logga ut
        </button>
      </div>
    </aside>
  )
}

export default Navbar
