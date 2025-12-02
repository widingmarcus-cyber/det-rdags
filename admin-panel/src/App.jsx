import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Knowledge from './pages/Knowledge'
import Preview from './pages/Preview'
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

  // Dark mode state - check localStorage first, then system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('bobot_dark_mode')
    if (saved !== null) return saved === 'true'
    return getSystemDarkMode()
  })

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('bobot_dark_mode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  // Company auth
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('bobot_auth')
    return saved ? JSON.parse(saved) : null
  })

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

  // Admin login
  const handleAdminLogin = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
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
        return { success: false, error: err.detail || 'Inloggning misslyckades' }
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
      return <AdminLogin onLogin={handleAdminLogin} />
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
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Authenticated company routes
  return (
    <AuthContext.Provider value={{ auth, authFetch, darkMode, toggleDarkMode }}>
      <div className="flex min-h-screen bg-bg-primary">
        <Navbar
          companyId={auth.companyId}
          companyName={auth.companyName}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export default App
