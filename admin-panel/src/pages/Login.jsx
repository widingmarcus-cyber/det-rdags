import { useState } from 'react'

function Login({ onLogin }) {
  const [tenantId, setTenantId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!tenantId.trim()) {
      setError('Ange ett tenant-ID')
      return
    }

    // För demo: acceptera alla tenant-IDs
    onLogin(tenantId.trim(), apiKey.trim() || 'demo-key')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FastighetsAI</h1>
          <p className="text-gray-500 mt-2">Admin-panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-2">
              Tenant-ID
            </label>
            <input
              type="text"
              id="tenantId"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="t.ex. demo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API-nyckel <span className="text-gray-400">(valfritt för demo)</span>
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Din API-nyckel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Logga in
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Tips: Använd "demo" som tenant-ID för att testa
        </p>
      </div>
    </div>
  )
}

export default Login
