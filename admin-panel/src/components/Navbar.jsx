import { Link, useLocation } from 'react-router-dom'

function Navbar({ companyId, companyName, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-primary-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-gray-800">Bobot</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              Dashboard
            </Link>
            <Link to="/knowledge" className={linkClass('/knowledge')}>
              Kunskapsbas
            </Link>
            <Link to="/preview" className={linkClass('/preview')}>
              Förhandsgranska
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{companyName}</p>
              <p className="text-xs text-gray-500">{companyId}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
