import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Knowledge from './pages/Knowledge'
import Preview from './pages/Preview'
import Navbar from './components/Navbar'
import AdminLogin from './pages/AdminLogin'
import SuperAdmin from './pages/SuperAdmin'

const API_BASE = '/api'

// Context för att dela auth-data
export const AuthContext = createContext(null)

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

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
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${auth?.token}`,
      'Content-Type': 'application/json'
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

  // Company routes
  if (!auth) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <AuthContext.Provider value={{ auth, authFetch }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          companyId={auth.companyId}
          companyName={auth.companyName}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export default App
