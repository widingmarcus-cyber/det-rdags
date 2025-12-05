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

  // Admin auth
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('bobot_admin_auth')
    return saved ? JSON.parse(saved) : null
  })

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
    <AuthContext.Provider value={{ auth, authFetch, darkMode, toggleDarkMode }}>
      {/* Skip links for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Hoppa till huvudinnehåll
      </a>
      <a href="#main-nav" className="skip-link" style={{ left: '200px' }}>
        Hoppa till navigation
      </a>

      <div className="flex min-h-screen bg-bg-primary relative">
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
        />
        <main id="main-content" className="flex-1 p-8 overflow-auto relative z-10" role="main" aria-label="Huvudinnehåll">
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
      </div>
    </AuthContext.Provider>
  )
}

export default App
