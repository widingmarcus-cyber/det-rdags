import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useLayoutEffect, createContext } from 'react'
import LandingPage from './pages/LandingPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WidgetPage from './pages/WidgetPage'
import Settings from './pages/Settings'
import Conversations from './pages/Conversations'
import Analytics from './pages/Analytics'
import Documentation from './pages/Documentation'
import Navbar from './components/Navbar'
import AdminLogin from './pages/AdminLogin'
import SuperAdmin from './pages/SuperAdmin'

const API_BASE = '/api'

// Context för att dela auth-data och dark mode
export const AuthContext = createContext(null)

// Helper to detect system dark mode preference
function getSystemDarkMode() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isLandingPage = location.pathname === '/' || location.pathname === '/integritetspolicy'

  // Dark mode state - check localStorage first, then system preference
  // But on landing page, always default to light mode
  const [darkMode, setDarkMode] = useState(() => {
    // Landing page always starts light
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path === '/' || path === '/integritetspolicy') {
        return false
      }
    }
    const saved = localStorage.getItem('bobot_dark_mode')
    if (saved !== null) return saved === 'true'
    return getSystemDarkMode()
  })

  // Force light mode on landing page BEFORE paint
  useLayoutEffect(() => {
    if (isLandingPage) {
      document.documentElement.classList.remove('dark')
    }
  }, [isLandingPage])

  // Apply dark mode class to html element
  useEffect(() => {
    // Skip on landing page - always light
    if (isLandingPage) {
      document.documentElement.classList.remove('dark')
      return
    }
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('bobot_dark_mode', darkMode)
  }, [darkMode, isLandingPage])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  // Company auth
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('bobot_auth')
    return saved ? JSON.parse(saved) : null
  })

  // Announcements state (supports multiple messages)
  const [announcements, setAnnouncements] = useState([])

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Admin auth
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('bobot_admin_auth')
    return saved ? JSON.parse(saved) : null
  })

  // Company status (for showing inactive overlay)
  const [companyStatus, setCompanyStatus] = useState(null)

  // Fetch company status
  const fetchCompanyStatus = async () => {
    if (!auth?.token) return
    try {
      const response = await fetch(`${API_BASE}/company/status`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCompanyStatus(data)
      }
    } catch (e) {
      console.error('Could not fetch company status:', e)
    }
  }

  useEffect(() => {
    if (auth) {
      fetchCompanyStatus()
      // Check status every 2 minutes
      const interval = setInterval(fetchCompanyStatus, 2 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setCompanyStatus(null)
    }
  }, [auth])

  useEffect(() => {
    if (auth) {
      localStorage.setItem('bobot_auth', JSON.stringify(auth))
    } else {
      localStorage.removeItem('bobot_auth')
    }
  }, [auth])

  useEffect(() => {
    if (adminAuth) {
      localStorage.setItem('bobot_admin_auth', JSON.stringify(adminAuth))
    } else {
      localStorage.removeItem('bobot_admin_auth')
    }
  }, [adminAuth])

  // Dynamic page titles based on route
  useEffect(() => {
    const pageTitles = {
      '/': 'Bobot - din AI-medarbetare',
      '/login': 'Logga in - Bobot',
      '/admin-login': 'Admin Login - Bobot',
      '/dashboard': 'Dashboard - Bobot Admin',
      '/conversations': 'Konversationer - Bobot Admin',
      '/analytics': 'Analys - Bobot Admin',
      '/settings': 'Inställningar - Bobot Admin',
      '/docs': 'Dokumentation - Bobot Admin',
      '/super-admin': 'Super Admin - Bobot'
    }

    // Check for widget routes
    if (location.pathname.startsWith('/widget/')) {
      document.title = 'Widget - Bobot Admin'
    } else {
      document.title = pageTitles[location.pathname] || 'Bobot - din AI-medarbetare'
    }
  }, [location.pathname])

  // Company login
  const handleLogin = async (companyId, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, password })
      })

      if (response.ok) {
        const data = await response.json()
        setAuth({
          token: data.token,
          companyId: data.company_id,
          companyName: data.name
        })
        return { success: true }
      } else {
        const err = await response.json()
        return { success: false, error: err.detail || 'Inloggning misslyckades' }
      }
    } catch (e) {
      return { success: false, error: 'Kunde inte ansluta till servern' }
    }
  }

  // Admin login with 2FA support
  const handleAdminLogin = async (username, password, totpCode = null) => {
    try {
      const body = { username, password }
      if (totpCode) {
        body.totp_code = totpCode
      }

      const response = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()

        // Check if 2FA verification is required
        if (data.requires_2fa) {
          return {
            success: false,
            requires2FA: true,
            token: data.token  // Pending token for 2FA verification
          }
        }

        // Full login successful
        setAdminAuth({
          token: data.token,
          username: data.username
        })
        return { success: true }
      } else {
        const err = await response.json()
        return { success: false, error: err.detail || 'Inloggning misslyckades' }
      }
    } catch (e) {
      return { success: false, error: 'Kunde inte ansluta till servern' }
    }
  }

  // Verify 2FA code
  const handleVerify2FA = async (pendingToken, code) => {
    try {
      const response = await fetch(`${API_BASE}/auth/admin/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pendingToken}`
        },
        body: JSON.stringify({ code })
      })

      if (response.ok) {
        const data = await response.json()
        setAdminAuth({
          token: data.token,
          username: data.username
        })
        return { success: true }
      } else {
        const err = await response.json()
        return { success: false, error: err.detail || 'Verifiering misslyckades' }
      }
    } catch (e) {
      return { success: false, error: 'Kunde inte ansluta till servern' }
    }
  }

  const handleLogout = () => {
    setAuth(null)
  }

  const handleAdminLogout = () => {
    setAdminAuth(null)
  }

  // Hjälpfunktion för autentiserade API-anrop (company)
  const authFetch = async (url, options = {}) => {
    // Don't set Content-Type for FormData - browser sets it with boundary
    const isFormData = options.body instanceof FormData
    const headers = {
      'Authorization': `Bearer ${auth?.token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    }

    // Remove Content-Type if explicitly set to empty for FormData
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type']
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      setAuth(null)
      throw new Error('Session har gått ut')
    }

    return response
  }

  // Fetch announcements for companies (supports multiple messages)
  const fetchAnnouncements = async () => {
    if (!auth?.token) return
    try {
      const response = await fetch(`${API_BASE}/announcements`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (e) {
      console.error('Could not fetch announcements:', e)
    }
  }

  // Mark a specific announcement as read
  const markAnnouncementAsRead = async (announcementId) => {
    if (!auth?.token) return
    try {
      await fetch(`${API_BASE}/announcements/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ announcement_id: announcementId })
      })
      // Remove from local state
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
    } catch (e) {
      console.error('Could not mark announcement as read:', e)
      // Still dismiss locally
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
    }
  }

  // Mark all announcements as read
  const markAllAnnouncementsAsRead = async () => {
    if (!auth?.token) return
    try {
      await fetch(`${API_BASE}/announcements/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      setAnnouncements([])
    } catch (e) {
      console.error('Could not mark all announcements as read:', e)
      setAnnouncements([])
    }
  }

  // Fetch announcements when authenticated
  useEffect(() => {
    if (auth) {
      fetchAnnouncements()
      // Refresh every 5 minutes
      const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [auth])

  // Hjälpfunktion för autentiserade API-anrop (admin)
  const adminFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${adminAuth?.token}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      setAdminAuth(null)
      throw new Error('Session har gått ut')
    }

    return response
  }

  // Admin routes
  if (isAdminRoute) {
    if (!adminAuth) {
      return <AdminLogin onLogin={handleAdminLogin} onVerify2FA={handleVerify2FA} />
    }

    return (
      <AuthContext.Provider value={{ adminAuth, adminFetch, handleAdminLogout }}>
        <Routes>
          <Route path="/admin" element={<SuperAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthContext.Provider>
    )
  }

  // Public routes (landing page and login)
  if (!auth) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/integritetspolicy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Authenticated company routes
  return (
    <AuthContext.Provider value={{ auth, authFetch, darkMode, toggleDarkMode, companyStatus }}>
      {/* Skip links for keyboard navigation - hidden on mobile */}
      <a href="#main-content" className="skip-link hidden md:block">
        Hoppa till huvudinnehåll
      </a>
      <a href="#main-nav" className="skip-link hidden md:block" style={{ left: '200px' }}>
        Hoppa till navigation
      </a>

      <div className="flex min-h-screen bg-bg-primary relative overflow-x-hidden">
        {/* Subtle dot pattern overlay (light mode only) */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.08] dark:opacity-0" style={{
          backgroundImage: 'radial-gradient(circle, #D97757 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        <Navbar
          companyId={auth.companyId}
          companyName={auth.companyName}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          announcements={announcements}
          onDismissAnnouncement={markAnnouncementAsRead}
          onDismissAllAnnouncements={markAllAnnouncementsAsRead}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          companyStatus={companyStatus}
        />
        <main id="main-content" className="flex-1 p-4 md:p-8 overflow-auto relative z-10 w-full" role="main" aria-label="Huvudinnehåll">
          {/* Mobile header with hamburger menu */}
          <div className="md:hidden flex items-center justify-between mb-4 -mt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary transition-colors"
                aria-label="Öppna meny"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="14" y="8" width="20" height="11" rx="2" fill="#D97757" />
                    <ellipse cx="19" cy="13.5" rx="3.5" ry="3" fill="#292524" />
                    <ellipse cx="29" cy="13.5" rx="3.5" ry="3" fill="#292524" />
                    <ellipse cx="19" cy="14" rx="2" ry="2" fill="#D97757" />
                    <ellipse cx="29" cy="14" rx="2" ry="2" fill="#D97757" />
                  </svg>
                </div>
                <span className="font-semibold text-text-primary">Bobot</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error-soft transition-colors"
              aria-label="Logga ut"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/widget/external" element={<WidgetPage widgetType="external" />} />
            <Route path="/widget/internal" element={<WidgetPage widgetType="internal" />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/documentation" element={<Documentation />} />
            {/* Legacy routes redirect */}
            <Route path="/widgets" element={<Navigate to="/widget/external" replace />} />
            <Route path="/preview" element={<Navigate to="/widget/external" replace />} />
            <Route path="/knowledge" element={<Navigate to="/widget/external" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Inactive Company Overlay */}
        {companyStatus && !companyStatus.is_active && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-bg-tertiary rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">Kontot är inaktiverat</h2>
              <p className="text-text-secondary mb-6">
                Ditt företagskonto har tillfälligt inaktiverats. Kontakta oss för att lösa detta.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:hej@bobot.nu"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  hej@bobot.nu
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary font-medium transition-colors"
                >
                  Logga ut
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  )
}

export default App
