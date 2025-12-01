import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Knowledge from './pages/Knowledge'
import Preview from './pages/Preview'
import Navbar from './components/Navbar'

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('fastighetsai_auth')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (auth) {
      localStorage.setItem('fastighetsai_auth', JSON.stringify(auth))
    } else {
      localStorage.removeItem('fastighetsai_auth')
    }
  }, [auth])

  const handleLogin = (tenantId, apiKey) => {
    setAuth({ tenantId, apiKey })
  }

  const handleLogout = () => {
    setAuth(null)
  }

  if (!auth) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar tenantId={auth.tenantId} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard tenantId={auth.tenantId} />} />
          <Route path="/knowledge" element={<Knowledge tenantId={auth.tenantId} />} />
          <Route path="/preview" element={<Preview tenantId={auth.tenantId} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
