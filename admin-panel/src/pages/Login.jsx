import { useState } from 'react'

function Login({ onLogin }) {
  const [companyId, setCompanyId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!companyId.trim()) {
      setError('Ange ditt Företags-ID')
      return
    }

    if (!password.trim()) {
      setError('Ange ditt lösenord')
      return
    }

    setLoading(true)
    const result = await onLogin(companyId.trim(), password.trim())
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="bg-bg-tertiary rounded-xl shadow-lg border border-border-subtle w-full max-w-md p-8 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Bobot</h1>
          <p className="text-text-secondary mt-2">Logga in på din admin-panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="companyId" className="input-label">
              Företags-ID
            </label>
            <input
              type="text"
              id="companyId"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="t.ex. bostadsbolaget"
              className="input"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="input-label">
              Lösenord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ditt lösenord"
              className="input"
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
            className="btn btn-primary w-full"
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        {/* Admin login hidden - access via /admin URL directly */}
      </div>
    </div>
  )
}

export default Login
