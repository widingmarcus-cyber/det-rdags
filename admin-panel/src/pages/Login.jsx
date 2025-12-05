import { useState, useEffect } from 'react'

function Login({ onLogin }) {
  const [companyId, setCompanyId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second for the clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#161514] to-[#1a1918] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D97757]/3 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="relative w-full max-w-md">
        {/* Time display */}
        <div className="text-center mb-6">
          <span className="text-xs font-mono text-[#57534E] tracking-wider">
            {currentTime.toLocaleDateString('sv-SE')} • {currentTime.toLocaleTimeString('sv-SE')}
          </span>
        </div>

        <div className="bg-[#1C1B1A]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#2A2826] overflow-hidden animate-scale-in">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-[#D97757] via-[#C4633A] to-[#A85230] p-8 text-center">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Bobot Mascot Logo - with white background for visibility */}
            <div className="relative">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-4 bg-white rounded-2xl shadow-lg">
                <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Feet */}
                  <rect x="25" y="95" width="30" height="12" rx="6" fill="#78716C" />
                  <rect x="65" y="95" width="30" height="12" rx="6" fill="#78716C" />
                  <rect x="28" y="97" width="24" height="8" rx="4" fill="#57534E" />
                  <rect x="68" y="97" width="24" height="8" rx="4" fill="#57534E" />
                  {/* Body */}
                  <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
                  <rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
                  {/* Body screens */}
                  <rect x="36" y="75" width="20" height="16" rx="2" fill="#1C1917" />
                  <rect x="64" y="75" width="20" height="16" rx="2" fill="#1C1917" />
                  {/* Neck */}
                  <rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />
                  {/* Head */}
                  <rect x="35" y="20" width="50" height="28" rx="4" fill="#D97757" />
                  {/* Eyes */}
                  <ellipse cx="48" cy="34" rx="12" ry="11" fill="#1C1917" />
                  <ellipse cx="72" cy="34" rx="12" ry="11" fill="#1C1917" />
                  <ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
                  <ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />
                  {/* Pupils with blink animation */}
                  <ellipse cx="48" cy="35" rx="5" ry="5" fill="#D97757">
                    <animate attributeName="ry" values="5;5;5;0.5;5;5;5;5;5;5" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="72" cy="35" rx="5" ry="5" fill="#D97757">
                    <animate attributeName="ry" values="5;5;5;0.5;5;5;5;5;5;5" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  {/* Eye highlights */}
                  <circle cx="50" cy="32" r="2.5" fill="#FEF2EE">
                    <animate attributeName="opacity" values="1;1;1;0;1;1;1;1;1;1" dur="4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="74" cy="32" r="2.5" fill="#FEF2EE">
                    <animate attributeName="opacity" values="1;1;1;0;1;1;1;1;1;1" dur="4s" repeatCount="indefinite" />
                  </circle>
                  {/* Nose */}
                  <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />
                  {/* Left arm with waving animation */}
                  <g>
                    <animateTransform attributeName="transform" type="rotate" values="0 24 65;-25 24 65;0 24 65;-25 24 65;0 24 65" dur="1.5s" repeatCount="indefinite" />
                    <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C" />
                    <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E" />
                  </g>
                  {/* Right arm - subtle movement */}
                  <g>
                    <animateTransform attributeName="transform" type="rotate" values="0 96 65;5 96 65;0 96 65" dur="2s" repeatCount="indefinite" />
                    <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C" />
                    <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E" />
                  </g>
                  {/* Antenna */}
                  <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
                  <circle cx="60" cy="10" r="5" fill="#4A9D7C">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Företagslogin</h1>
              <p className="text-white/70 mt-1 text-sm">Logga in på din admin-panel</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="companyId" className="block text-sm font-medium text-[#E7E5E4] mb-2">
                  Företags-ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-5 h-5 text-[#57534E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="companyId"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    placeholder="t.ex. bostadsbolaget"
                    className="w-full pl-12 pr-4 py-3.5 text-sm bg-[#242321] border border-[#3A3836] rounded-xl text-white placeholder-[#57534E] focus:outline-none focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#E7E5E4] mb-2">
                  Lösenord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-5 h-5 text-[#57534E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ditt lösenord"
                    className="w-full pl-12 pr-12 py-3.5 text-sm bg-[#242321] border border-[#3A3836] rounded-xl text-white placeholder-[#57534E] focus:outline-none focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/20 transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#57534E] hover:text-[#A8A29E] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-slide-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#D97757] to-[#C4633A] text-white hover:from-[#C4633A] hover:to-[#A85230] hover:shadow-lg hover:shadow-[#D97757]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loggar in...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Logga in
                  </>
                )}
              </button>
            </form>

            {/* Security info */}
            <div className="mt-6 pt-6 border-t border-[#2A2826]">
              <div className="flex items-center justify-center gap-4 text-xs text-[#57534E]">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Krypterad
                </span>
                <span className="text-[#3A3836]">•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Loggas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-[#57534E] hover:text-[#D97757] transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
