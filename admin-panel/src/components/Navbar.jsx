import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { createPortal } from 'react-dom'

function Navbar({ companyId, companyName, onLogout, darkMode, toggleDarkMode, announcement, onDismissAnnouncement }) {
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'chart' },
    { to: '/widget/external', label: 'Kundtjänst', icon: 'external' },
    { to: '/widget/internal', label: 'Medarbetarstöd', icon: 'internal' },
    { to: '/conversations', label: 'Konversationer', icon: 'messages' },
    { to: '/analytics', label: 'Statistik', icon: 'analytics' },
    { to: '/settings', label: 'Företagsinställningar', icon: 'settings' },
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
      case 'external':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="10" r="3" />
            <path d="M12 13v2" />
          </svg>
        )
      case 'internal':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
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
          {/* Mini Bobot Mascot - matches Landing page style */}
          <div className="w-10 h-10 relative" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Feet */}
              <rect x="10" y="38" width="12" height="5" rx="2.5" fill="#78716C" />
              <rect x="26" y="38" width="12" height="5" rx="2.5" fill="#78716C" />
              <rect x="11.5" y="39" width="9" height="3" rx="1.5" fill="#57534E" />
              <rect x="27.5" y="39" width="9" height="3" rx="1.5" fill="#57534E" />
              {/* Body */}
              <rect x="12" y="22" width="24" height="17" rx="2" fill="#D97757" />
              <rect x="13.5" y="23.5" width="21" height="14" rx="1" fill="#C4613D" />
              {/* Chest screens */}
              <rect x="15" y="30" width="8" height="6" rx="1" fill="#1C1917" />
              <rect x="25" y="30" width="8" height="6" rx="1" fill="#1C1917" />
              {/* Neck */}
              <rect x="20" y="18" width="8" height="5" rx="1" fill="#78716C" />
              {/* Head */}
              <rect x="14" y="8" width="20" height="11" rx="2" fill="#D97757" />
              {/* Eyes - dark screens */}
              <ellipse cx="19" cy="13.5" rx="4.5" ry="4" fill="#1C1917" />
              <ellipse cx="29" cy="13.5" rx="4.5" ry="4" fill="#1C1917" />
              <ellipse cx="19" cy="13.5" rx="3.5" ry="3" fill="#292524" />
              <ellipse cx="29" cy="13.5" rx="3.5" ry="3" fill="#292524" />
              {/* Pupils */}
              <ellipse cx="19" cy="14" rx="2" ry="2" fill="#D97757">
                <animate attributeName="ry" values="2;0.2;2;2;2" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
              </ellipse>
              <ellipse cx="29" cy="14" rx="2" ry="2" fill="#D97757">
                <animate attributeName="ry" values="2;0.2;2;2;2" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
              </ellipse>
              {/* Eye shine */}
              <circle cx="20" cy="13" r="1" fill="#FEF2EE">
                <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
              </circle>
              <circle cx="30" cy="13" r="1" fill="#FEF2EE">
                <animate attributeName="opacity" values="1;0;1;1;1" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.95;1" />
              </circle>
              {/* Nose */}
              <rect x="22.5" cy="12" width="3" height="3" rx="1" fill="#78716C" />
              {/* Arms */}
              <rect x="5" y="25" width="7" height="2.5" rx="1.2" fill="#78716C">
                <animateTransform attributeName="transform" type="rotate" values="0 8 26;-8 8 26;0 8 26" dur="3s" repeatCount="indefinite" />
              </rect>
              <rect x="36" y="25" width="7" height="2.5" rx="1.2" fill="#78716C">
                <animateTransform attributeName="transform" type="rotate" values="0 40 26;8 40 26;0 40 26" dur="3s" repeatCount="indefinite" />
              </rect>
              {/* Hands */}
              <rect x="3" y="23" width="3.5" height="6" rx="1" fill="#57534E">
                <animateTransform attributeName="transform" type="rotate" values="0 4.5 26;-8 4.5 26;0 4.5 26" dur="3s" repeatCount="indefinite" />
              </rect>
              <rect x="41.5" y="23" width="3.5" height="6" rx="1" fill="#57534E">
                <animateTransform attributeName="transform" type="rotate" values="0 43.5 26;8 43.5 26;0 43.5 26" dur="3s" repeatCount="indefinite" />
              </rect>
              {/* Antenna */}
              <rect x="22.5" y="4" width="3" height="5" rx="1" fill="#78716C" />
              <circle cx="24" cy="3" r="2.5" fill="#4A9D7C">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          <div>
            <span className="font-semibold text-text-primary block">Bobot</span>
            <span className="text-xs text-text-tertiary">din medarbetare</span>
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

      {/* Notification bell - always visible */}
      <div className="px-3 py-2 relative">
        <button
          onClick={() => setShowAnnouncement(!showAnnouncement)}
          className={`sidebar-item w-full text-left relative ${!announcement ? 'opacity-60' : ''}`}
          aria-label={announcement ? "Visa meddelanden" : "Inga meddelanden"}
        >
          <span className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {announcement && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
            )}
          </span>
          <span>Meddelanden</span>
          {announcement && (
            <span className="ml-auto bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
          )}
        </button>
      </div>

      {/* Slide-out message panel - rendered via portal to ensure proper z-index */}
      {showAnnouncement && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity"
            onClick={() => setShowAnnouncement(false)}
          />

          {/* Slide-out panel */}
          <div className="fixed top-0 left-60 bottom-0 w-96 bg-bg-primary border-r border-border-subtle shadow-2xl z-[9999] flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-soft rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">Meddelanden</h2>
                  <p className="text-xs text-text-tertiary">Från administratören</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {announcement ? (
                <div className="space-y-4">
                  {/* Message card */}
                  <div className={`rounded-xl border overflow-hidden ${
                    announcement.type === 'warning' ? 'border-warning/30 bg-warning/5' :
                    announcement.type === 'maintenance' ? 'border-error/30 bg-error/5' : 'border-accent/30 bg-accent/5'
                  }`}>
                    {/* Message header */}
                    <div className={`px-4 py-3 flex items-center gap-3 ${
                      announcement.type === 'warning' ? 'bg-warning/10' :
                      announcement.type === 'maintenance' ? 'bg-error/10' : 'bg-accent/10'
                    }`}>
                      {announcement.type === 'warning' ? (
                        <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </div>
                      ) : announcement.type === 'maintenance' ? (
                        <div className="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">{announcement.title}</h3>
                        <p className="text-xs text-text-tertiary">
                          {announcement.type === 'warning' ? 'Varning' :
                           announcement.type === 'maintenance' ? 'Underhåll' : 'Information'}
                        </p>
                      </div>
                    </div>

                    {/* Message body */}
                    <div className="px-4 py-4">
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
                    </div>

                    {/* Message footer */}
                    <div className="px-4 py-3 bg-bg-secondary/50 border-t border-border-subtle flex items-center justify-between">
                      {announcement.created_at && (
                        <p className="text-xs text-text-tertiary flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {new Date(announcement.created_at).toLocaleDateString('sv-SE', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                      <button
                        onClick={() => { onDismissAnnouncement(); setShowAnnouncement(false) }}
                        className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Markera som läst
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-text-primary mb-1">Inga meddelanden</h3>
                  <p className="text-sm text-text-tertiary max-w-[200px]">
                    Du har inga nya meddelanden från administratören just nu.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

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
