import { useState } from 'react'

function AdminLogin({ onLogin, onVerify2FA }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [pendingToken, setPendingToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Ange användarnamn')
      return
    }

    if (!password.trim()) {
      setError('Ange lösenord')
      return
    }

    setLoading(true)
    const result = await onLogin(username.trim(), password.trim(), totpCode.trim() || null)
    setLoading(false)

    if (result.success) {
      // Login complete
      return
    }

    if (result.requires2FA) {
      // Need 2FA verification
      setRequires2FA(true)
      setPendingToken(result.token)
      setError('')
    } else {
      setError(result.error)
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    setError('')

    if (!totpCode.trim() || totpCode.trim().length !== 6) {
      setError('Ange en 6-siffrig kod')
      return
    }

    setLoading(true)
    const result = await onVerify2FA(pendingToken, totpCode.trim())
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  const handleBack = () => {
    setRequires2FA(false)
    setPendingToken(null)
    setTotpCode('')
    setError('')
  }

  // 2FA Verification Screen
  if (requires2FA) {
    return (
      <div className="min-h-screen bg-[#161514] flex items-center justify-center p-4">
        <div className="bg-[#1C1B1A] rounded-xl shadow-lg border border-[#2A2826] w-full max-w-md p-8 animate-scale-in">
          {/* 2FA Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-[#3D8B6D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#161514" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[#F5F5F4] tracking-tight">Tvåfaktorsautentisering</h1>
            <p className="text-[#A8A29E] mt-2">Ange koden från din autentiseringsapp</p>
          </div>

          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div>
              <label htmlFor="totp" className="block text-sm font-medium text-[#F5F5F4] mb-2">
                Verifieringskod
              </label>
              <input
                type="text"
                id="totp"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
                className="w-full px-4 py-3 text-sm bg-[#242321] border border-[#2A2826] rounded-md text-[#F5F5F4] placeholder-[#78716C] focus:outline-none focus:border-success focus:shadow-[0_0_0_3px_rgba(74,157,124,0.15)] transition-all duration-150 text-center text-xl tracking-[0.5em] font-mono"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-error-soft text-error px-4 py-3 rounded-md text-sm animate-slide-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full px-5 py-3 text-sm font-medium rounded-md bg-success text-white hover:bg-[#3D8B6D] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-150 disabled:opacity-50"
            >
              {loading ? 'Verifierar...' : 'Verifiera'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2A2826] text-center">
            <button
              onClick={handleBack}
              className="text-sm text-[#78716C] hover:text-warning transition-colors"
            >
              Tillbaka till inloggning
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Standard Login Screen
  return (
    <div className="min-h-screen bg-[#161514] flex items-center justify-center p-4">
      <div className="bg-[#1C1B1A] rounded-xl shadow-lg border border-[#2A2826] w-full max-w-md p-8 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-warning to-[#B8893D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-[#161514] font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#F5F5F4] tracking-tight">Super Admin</h1>
          <p className="text-[#A8A29E] mt-2">Bobot administratörsportal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#F5F5F4] mb-2">
              Användarnamn
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 text-sm bg-[#242321] border border-[#2A2826] rounded-md text-[#F5F5F4] placeholder-[#78716C] focus:outline-none focus:border-warning focus:shadow-[0_0_0_3px_rgba(212,160,84,0.15)] transition-all duration-150"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F5F5F4] mb-2">
              Lösenord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ditt lösenord"
              className="w-full px-4 py-3 text-sm bg-[#242321] border border-[#2A2826] rounded-md text-[#F5F5F4] placeholder-[#78716C] focus:outline-none focus:border-warning focus:shadow-[0_0_0_3px_rgba(212,160,84,0.15)] transition-all duration-150"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-error-soft text-error px-4 py-3 rounded-md text-sm animate-slide-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 text-sm font-medium rounded-md bg-warning text-[#161514] hover:bg-[#C4923D] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-150 disabled:opacity-50"
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2A2826] text-center">
          <a href="/" className="text-sm text-[#78716C] hover:text-warning transition-colors">
            Tillbaka till företagsinloggning
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
