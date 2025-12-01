import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function SuperAdmin() {
  const { adminAuth, adminFetch, handleAdminLogout, handleLogin } = useContext(AuthContext)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ id: '', name: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [systemHealth, setSystemHealth] = useState(null)
  const [selectedCompanies, setSelectedCompanies] = useState(new Set())
  const [notification, setNotification] = useState(null)

  // New state for added features
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false, message: '' })
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(null)
  const [usageLimitValue, setUsageLimitValue] = useState({ conversations: 0, knowledge: 0 })
  const [showCompanyDashboard, setShowCompanyDashboard] = useState(null)
  const [companyUsage, setCompanyUsage] = useState(null)
  const [companyActivity, setCompanyActivity] = useState([])
  const [companyLoading, setCompanyLoading] = useState(false)

  useEffect(() => {
    fetchCompanies()
    fetchSystemHealth()
    fetchMaintenanceMode()
  }, [])

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs()
    }
  }, [activeTab])

  const fetchCompanies = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta företag:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/system-health`)
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (error) {
      // System health endpoint might not exist yet
      setSystemHealth({
        ollama_status: 'unknown',
        database_size: 'N/A',
        total_conversations: companies.reduce((sum, c) => sum + (c.chat_count || 0), 0),
        uptime: 'N/A'
      })
    }
  }

  const fetchAuditLogs = async () => {
    setAuditLoading(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/audit-log?limit=100`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Kunde inte hämta audit logs:', error)
    } finally {
      setAuditLoading(false)
    }
  }

  const fetchMaintenanceMode = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/maintenance-mode`)
      if (response.ok) {
        const data = await response.json()
        setMaintenanceMode(data)
      }
    } catch (error) {
      // Endpoint might not exist yet
      setMaintenanceMode({ enabled: false, message: '' })
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAdd = () => {
    setFormData({ id: '', name: '', password: '' })
    setError('')
    setShowModal(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await adminFetch(`${API_BASE}/admin/companies`, {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        fetchCompanies()
        showNotification(`Företag "${formData.name}" skapat`)
      } else {
        const err = await response.json()
        setError(err.detail || 'Kunde inte skapa företag')
      }
    } catch (error) {
      setError('Kunde inte ansluta till servern')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/toggle`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchCompanies()
        const company = companies.find(c => c.id === companyId)
        showNotification(`${company?.name} ${company?.is_active ? 'inaktiverad' : 'aktiverad'}`)
      }
    } catch (error) {
      console.error('Kunde inte ändra status:', error)
    }
  }

  const handleDelete = async (companyId) => {
    if (!window.confirm(`Är du säker på att du vill ta bort företag "${companyId}"? All data kommer att raderas permanent.`)) {
      return
    }

    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchCompanies()
        showNotification('Företag raderat')
      }
    } catch (error) {
      console.error('Kunde inte ta bort:', error)
    }
  }

  const handleBulkToggle = async (activate) => {
    if (selectedCompanies.size === 0) return

    for (const companyId of selectedCompanies) {
      const company = companies.find(c => c.id === companyId)
      if ((activate && !company?.is_active) || (!activate && company?.is_active)) {
        await adminFetch(`${API_BASE}/admin/companies/${companyId}/toggle`, { method: 'PUT' })
      }
    }
    fetchCompanies()
    setSelectedCompanies(new Set())
    showNotification(`${selectedCompanies.size} företag ${activate ? 'aktiverade' : 'inaktiverade'}`)
  }

  const handleGdprCleanup = async () => {
    if (!window.confirm('Kör GDPR-cleanup nu? Detta raderar gamla konversationer enligt retention-inställningar.')) return

    try {
      const response = await adminFetch(`${API_BASE}/admin/gdpr-cleanup`, { method: 'POST' })
      if (response.ok) {
        showNotification('GDPR-cleanup slutförd')
      }
    } catch (error) {
      console.error('GDPR cleanup failed:', error)
    }
  }

  const handleImpersonate = async (companyId) => {
    if (!window.confirm(`Logga in som företag "${companyId}"? Du kommer att lämna super admin-panelen.`)) return

    try {
      const response = await adminFetch(`${API_BASE}/admin/impersonate/${companyId}`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        // Store the impersonation token and redirect to company admin
        localStorage.setItem('auth', JSON.stringify({
          token: data.token,
          companyId: data.company_id,
          companyName: data.company_name,
          isImpersonated: true
        }))
        window.location.href = '/'
      } else {
        showNotification('Kunde inte impersonera företag', 'error')
      }
    } catch (error) {
      console.error('Impersonation failed:', error)
      showNotification('Kunde inte impersonera företag', 'error')
    }
  }

  const handleExport = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/export/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${companyId}-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showNotification('Data exporterad')
      } else {
        showNotification('Kunde inte exportera data', 'error')
      }
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('Kunde inte exportera data', 'error')
    }
  }

  const handleToggleMaintenance = async () => {
    const newEnabled = !maintenanceMode.enabled
    const message = newEnabled ? (prompt('Ange underhållsmeddelande:', 'Systemet är under underhåll. Försök igen senare.') || '') : ''

    if (newEnabled && !message) return

    try {
      const response = await adminFetch(`${API_BASE}/admin/maintenance-mode`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: newEnabled, message })
      })
      if (response.ok) {
        setMaintenanceMode({ enabled: newEnabled, message })
        showNotification(newEnabled ? 'Underhållsläge aktiverat' : 'Underhållsläge avaktiverat')
      }
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error)
      showNotification('Kunde inte ändra underhållsläge', 'error')
    }
  }

  const handleSetUsageLimit = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/usage-limit`, {
        method: 'PUT',
        body: JSON.stringify({
          max_conversations_month: usageLimitValue.conversations,
          max_knowledge_items: usageLimitValue.knowledge
        })
      })
      if (response.ok) {
        showNotification('Användningsgränser uppdaterade')
        setShowUsageLimitModal(null)
        fetchCompanies()
      }
    } catch (error) {
      console.error('Failed to set usage limit:', error)
      showNotification('Kunde inte uppdatera gränser', 'error')
    }
  }

  const openUsageLimitModal = (company) => {
    setShowUsageLimitModal(company)
    setUsageLimitValue({
      conversations: company.max_conversations_month || 0,
      knowledge: company.max_knowledge_items || 0
    })
  }

  const openCompanyDashboard = async (company) => {
    setShowCompanyDashboard(company)
    setCompanyLoading(true)
    setCompanyUsage(null)
    setCompanyActivity([])

    try {
      // Fetch usage data
      const usageRes = await adminFetch(`${API_BASE}/admin/companies/${company.id}/usage`)
      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setCompanyUsage(usageData)
      }

      // Fetch activity logs for this company
      const activityRes = await adminFetch(`${API_BASE}/admin/company-activity/${company.id}?limit=10`)
      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setCompanyActivity(activityData.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch company details:', error)
    } finally {
      setCompanyLoading(false)
    }
  }

  const getUsageColor = (percent) => {
    if (percent >= 90) return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-100' }
    if (percent >= 75) return { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-100' }
    return { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-100' }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter and sort companies
  const filteredCompanies = companies
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      if (sortBy === 'created_at') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })

  const toggleSelectCompany = (id) => {
    const newSelected = new Set(selectedCompanies)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCompanies(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedCompanies.size === filteredCompanies.length) {
      setSelectedCompanies(new Set())
    } else {
      setSelectedCompanies(new Set(filteredCompanies.map(c => c.id)))
    }
  }

  // Stats
  const totalCompanies = companies.length
  const activeCompanies = companies.filter(c => c.is_active).length
  const totalKnowledge = companies.reduce((sum, c) => sum + (c.knowledge_count || 0), 0)
  const totalChats = companies.reduce((sum, c) => sum + (c.chat_count || 0), 0)

  const StatCard = ({ title, value, subtitle, icon, color = 'accent' }) => (
    <div className="card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-3xl font-semibold text-text-primary mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 bg-${color}-soft rounded-lg flex items-center justify-center text-${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
          notification.type === 'success' ? 'bg-success text-white' : 'bg-error text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <nav className="bg-bg-tertiary border-b border-border-subtle sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-warning to-warning-hover rounded-lg flex items-center justify-center shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bg-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Bobot</span>
                <span className="text-xs text-text-tertiary ml-2">Systemöversikt</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary px-2 py-1 bg-warning-soft text-warning rounded-full text-xs font-medium">
                {adminAuth.username}
              </span>
              <button
                onClick={handleAdminLogout}
                className="btn btn-ghost text-sm"
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-bg-tertiary border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Översikt', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
              { id: 'companies', label: 'Företag', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
              { id: 'audit', label: 'Aktivitetslogg', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></> },
              { id: 'system', label: 'System', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
              { id: 'gdpr', label: 'GDPR', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {tab.icon}
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Totalt företag"
                value={totalCompanies}
                subtitle={`${activeCompanies} aktiva`}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                }
              />
              <StatCard
                title="Kunskapsposter"
                value={totalKnowledge}
                subtitle="totalt i systemet"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Chattmeddelanden"
                value={totalChats}
                subtitle="totalt i systemet"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Systemstatus"
                value={systemHealth?.ollama_status === 'online' ? 'Online' : 'Okänd'}
                subtitle={systemHealth?.database_size || 'Kontrollerar...'}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
              />
            </div>

            {/* Quick Actions & Top Companies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="card">
                <h2 className="text-lg font-medium text-text-primary mb-4">Snabbåtgärder</h2>
                <div className="space-y-2">
                  <button
                    onClick={handleAdd}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all group"
                  >
                    <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Skapa nytt företag</p>
                      <p className="text-sm text-text-secondary">Lägg till en ny kund</p>
                    </div>
                  </button>
                  <button
                    onClick={handleGdprCleanup}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all group"
                  >
                    <div className="w-10 h-10 bg-warning-soft rounded-lg flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Kör GDPR-cleanup</p>
                      <p className="text-sm text-text-secondary">Rensa gamla konversationer</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('companies')}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all group"
                  >
                    <div className="w-10 h-10 bg-success-soft rounded-lg flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Hantera företag</p>
                      <p className="text-sm text-text-secondary">Visa och redigera alla kunder</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Top Companies */}
              <div className="card">
                <h2 className="text-lg font-medium text-text-primary mb-4">Mest aktiva företag</h2>
                <div className="space-y-3">
                  {companies
                    .sort((a, b) => (b.chat_count || 0) - (a.chat_count || 0))
                    .slice(0, 5)
                    .map((company, i) => (
                      <div key={company.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs font-medium flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-text-primary text-sm">{company.name}</p>
                            <p className="text-xs text-text-tertiary">{company.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text-primary">{company.chat_count || 0}</p>
                          <p className="text-xs text-text-tertiary">meddelanden</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Företag</h1>
                <p className="text-text-secondary mt-1">Hantera alla kunder i systemet</p>
              </div>
              <button onClick={handleAdd} className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nytt företag
              </button>
            </div>

            {/* Search and Filters */}
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sök företag..."
                    className="input pl-10"
                  />
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-')
                    setSortBy(by)
                    setSortOrder(order)
                  }}
                  className="input w-auto"
                >
                  <option value="created_at-desc">Nyast först</option>
                  <option value="created_at-asc">Äldst först</option>
                  <option value="name-asc">Namn A-Ö</option>
                  <option value="name-desc">Namn Ö-A</option>
                  <option value="chat_count-desc">Mest aktiva</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedCompanies.size > 0 && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
                  <span className="text-sm text-text-secondary">{selectedCompanies.size} valda</span>
                  <button onClick={() => handleBulkToggle(true)} className="btn btn-ghost text-success text-sm py-1">
                    Aktivera alla
                  </button>
                  <button onClick={() => handleBulkToggle(false)} className="btn btn-ghost text-warning text-sm py-1">
                    Inaktivera alla
                  </button>
                  <button onClick={() => setSelectedCompanies(new Set())} className="btn btn-ghost text-sm py-1">
                    Avmarkera
                  </button>
                </div>
              )}
            </div>

            {/* Companies List */}
            {loading ? (
              <div className="card text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-text-secondary">Laddar företag...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary">Inga företag hittades</h3>
                <p className="text-text-secondary mt-2">
                  {searchQuery ? 'Prova en annan sökning' : 'Skapa ditt första företag'}
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="bg-bg-secondary border-b border-border-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.size === filteredCompanies.length && filteredCompanies.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Företag</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Kunskapsbas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Konversationer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Användning</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredCompanies.map((company) => {
                      // Calculate usage percentages
                      const convLimit = company.max_conversations_month || 0
                      const convCurrent = company.current_month_conversations || 0
                      const convPercent = convLimit > 0 ? Math.min(100, (convCurrent / convLimit) * 100) : 0
                      const hasConvLimit = convLimit > 0

                      const knowledgeLimit = company.max_knowledge_items || 0
                      const knowledgeCurrent = company.knowledge_count || 0
                      const knowledgePercent = knowledgeLimit > 0 ? Math.min(100, (knowledgeCurrent / knowledgeLimit) * 100) : 0
                      const hasKnowledgeLimit = knowledgeLimit > 0

                      const hasAnyLimit = hasConvLimit || hasKnowledgeLimit
                      const maxPercent = Math.max(hasConvLimit ? convPercent : 0, hasKnowledgeLimit ? knowledgePercent : 0)
                      const usageColors = getUsageColor(maxPercent)

                      return (
                        <tr key={company.id} className="hover:bg-bg-secondary transition-colors">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedCompanies.has(company.id)}
                              onChange={() => toggleSelectCompany(company.id)}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => openCompanyDashboard(company)}
                              className="text-left hover:bg-bg-primary p-1 -m-1 rounded-lg transition-colors"
                            >
                              <p className="font-medium text-text-primary hover:text-accent transition-colors">{company.name}</p>
                              <p className="text-sm text-text-tertiary">{company.id}</p>
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              company.is_active
                                ? 'bg-success-soft text-success'
                                : 'bg-error-soft text-error'
                            }`}>
                              {company.is_active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <span className="text-text-primary font-medium">{knowledgeCurrent}</span>
                              {hasKnowledgeLimit && (
                                <span className="text-text-tertiary"> / {knowledgeLimit}</span>
                              )}
                              {!hasKnowledgeLimit && (
                                <span className="text-text-tertiary"> poster</span>
                              )}
                            </div>
                            {hasKnowledgeLimit && (
                              <div className="w-16 h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                                <div className={`h-full ${getUsageColor(knowledgePercent).bar} rounded-full`} style={{ width: `${knowledgePercent}%` }} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <span className="text-text-primary font-medium">{convCurrent}</span>
                              {hasConvLimit && (
                                <span className="text-text-tertiary"> / {convLimit}</span>
                              )}
                              {!hasConvLimit && (
                                <span className="text-text-tertiary"> denna mån</span>
                              )}
                            </div>
                            {hasConvLimit && (
                              <div className="w-16 h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                                <div className={`h-full ${getUsageColor(convPercent).bar} rounded-full`} style={{ width: `${convPercent}%` }} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {hasAnyLimit ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${usageColors.bg} ${usageColors.text}`}>
                                {maxPercent >= 100 ? 'Gräns nådd' : maxPercent >= 75 ? 'Nära gräns' : 'OK'}
                              </span>
                            ) : (
                              <span className="text-xs text-text-tertiary">Obegränsat</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleImpersonate(company.id)}
                                className="p-2 rounded-lg text-accent hover:bg-accent-soft transition-colors"
                                title="Logga in som"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleExport(company.id)}
                                className="p-2 rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
                                title="Exportera data"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openUsageLimitModal(company)}
                                className="p-2 rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
                                title="Användningsgräns"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20V10" />
                                  <path d="M18 20V4" />
                                  <path d="M6 20v-4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleToggle(company.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  company.is_active
                                    ? 'text-warning hover:bg-warning-soft'
                                    : 'text-success hover:bg-success-soft'
                                }`}
                                title={company.is_active ? 'Inaktivera' : 'Aktivera'}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  {company.is_active ? (
                                    <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>
                                  ) : (
                                    <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                                  )}
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(company.id)}
                                className="p-2 rounded-lg text-error hover:bg-error-soft transition-colors"
                                title="Ta bort"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Aktivitetslogg</h1>
              <p className="text-text-secondary mt-1">Spåra alla admin-åtgärder i systemet</p>
            </div>

            {auditLoading ? (
              <div className="card text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-text-secondary">Laddar aktivitetslogg...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary">Ingen aktivitet ännu</h3>
                <p className="text-text-secondary mt-2">Åtgärder kommer att loggas här</p>
              </div>
            ) : (
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="bg-bg-secondary border-b border-border-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tidpunkt</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Åtgärd</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Företag</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Beskrivning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-bg-secondary transition-colors">
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('sv-SE')}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary font-medium">
                          {log.admin_username}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            log.action_type === 'create_company' ? 'bg-success-soft text-success' :
                            log.action_type === 'delete_company' ? 'bg-error-soft text-error' :
                            log.action_type === 'toggle_company' ? 'bg-warning-soft text-warning' :
                            log.action_type === 'impersonate' ? 'bg-accent-soft text-accent' :
                            'bg-bg-secondary text-text-secondary'
                          }`}>
                            {log.action_type === 'create_company' ? 'Skapat' :
                             log.action_type === 'delete_company' ? 'Raderat' :
                             log.action_type === 'toggle_company' ? 'Växlat status' :
                             log.action_type === 'impersonate' ? 'Impersonerat' :
                             log.action_type === 'export' ? 'Exporterat' :
                             log.action_type === 'maintenance_mode' ? 'Underhållsläge' :
                             log.action_type === 'usage_limit' ? 'Användningsgräns' :
                             log.action_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {log.target_company_id || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {log.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Systeminställningar</h1>
              <p className="text-text-secondary mt-1">Övervaka och konfigurera systemet</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <div className="card">
                <h2 className="text-lg font-medium text-text-primary mb-4">Systemhälsa</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${systemHealth?.ollama_status === 'online' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="text-text-primary">Ollama AI</span>
                    </div>
                    <span className="text-sm text-text-secondary">{systemHealth?.ollama_status || 'Kontrollerar...'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-text-primary">Databas</span>
                    </div>
                    <span className="text-sm text-text-secondary">{systemHealth?.database_size || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-text-primary">API</span>
                    </div>
                    <span className="text-sm text-text-secondary">Online</span>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="card">
                <h2 className="text-lg font-medium text-text-primary mb-4">Konfiguration</h2>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-bg-secondary">
                    <p className="text-sm text-text-secondary">AI-modell</p>
                    <p className="text-text-primary font-medium">Llama 3.1</p>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-secondary">
                    <p className="text-sm text-text-secondary">Max retention</p>
                    <p className="text-text-primary font-medium">30 dagar</p>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-secondary">
                    <p className="text-sm text-text-secondary">GDPR-cleanup</p>
                    <p className="text-text-primary font-medium">Varje timme</p>
                  </div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="card lg:col-span-2">
                <h2 className="text-lg font-medium text-text-primary mb-4">Underhållsläge</h2>
                <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary">
                  <div>
                    <p className="font-medium text-text-primary">
                      {maintenanceMode.enabled ? 'Underhållsläge är aktivt' : 'Systemet är online'}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {maintenanceMode.enabled
                        ? maintenanceMode.message || 'Alla chattwidgets är inaktiverade'
                        : 'Alla chattwidgets fungerar normalt'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      maintenanceMode.enabled
                        ? 'bg-success text-white hover:bg-success-hover'
                        : 'bg-warning text-white hover:bg-warning-hover'
                    }`}
                  >
                    {maintenanceMode.enabled ? 'Avaktivera' : 'Aktivera underhåll'}
                  </button>
                </div>
                {maintenanceMode.enabled && (
                  <div className="mt-4 p-4 rounded-lg bg-warning-soft border border-warning/20">
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning flex-shrink-0 mt-0.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <div>
                        <p className="font-medium text-warning">Varning: Underhållsläge aktivt</p>
                        <p className="text-sm text-text-secondary mt-1">
                          Inga chattwidgets kan användas medan underhållsläget är aktivt. Användare ser meddelandet ovan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GDPR Tab */}
        {activeTab === 'gdpr' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">GDPR & Dataskydd</h1>
              <p className="text-text-secondary mt-1">Hantera dataskydd och compliance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GDPR Actions */}
              <div className="card">
                <h2 className="text-lg font-medium text-text-primary mb-4">GDPR-åtgärder</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleGdprCleanup}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-transparent hover:border-border-subtle transition-all group"
                  >
                    <div className="w-10 h-10 bg-warning-soft rounded-lg flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Manuell cleanup</p>
                      <p className="text-sm text-text-secondary">Rensa utgångna konversationer nu</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* GDPR Stats */}
              <div className="card">
                <h2 className="text-lg font-medium text-text-primary mb-4">Dataskyddsstatus</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                    <span className="text-text-primary">Automatisk cleanup</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                    <span className="text-text-primary">IP-anonymisering</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                    <span className="text-text-primary">Samtyckesspårning</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiv</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Skapa nytt företag</h2>
              <p className="text-sm text-text-secondary mt-1">Lägg till en ny kund i systemet</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="input-label">Företags-ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="t.ex. bostadsbolaget"
                  className="input"
                  required
                />
                <p className="text-xs text-text-tertiary mt-1">Endast små bokstäver, siffror och bindestreck</p>
              </div>
              <div>
                <label className="input-label">Företagsnamn</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="t.ex. Bostadsbolaget AB"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="input-label">Lösenord</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Välj ett starkt lösenord"
                  className="input"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-error-soft text-error px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Skapar...' : 'Skapa företag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage Limit Modal */}
      {showUsageLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Användningsgränser</h2>
              <p className="text-sm text-text-secondary mt-1">
                Ange gränser för {showUsageLimitModal.name}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Max konversationer/månad</label>
                <input
                  type="number"
                  value={usageLimitValue.conversations}
                  onChange={(e) => setUsageLimitValue({ ...usageLimitValue, conversations: parseInt(e.target.value) || 0 })}
                  placeholder="0 = obegränsat"
                  className="input"
                  min="0"
                />
                <p className="text-xs text-text-tertiary mt-1">Sätt till 0 för obegränsat</p>
              </div>

              <div>
                <label className="input-label">Max kunskapsposter</label>
                <input
                  type="number"
                  value={usageLimitValue.knowledge}
                  onChange={(e) => setUsageLimitValue({ ...usageLimitValue, knowledge: parseInt(e.target.value) || 0 })}
                  placeholder="0 = obegränsat"
                  className="input"
                  min="0"
                />
                <p className="text-xs text-text-tertiary mt-1">Sätt till 0 för obegränsat</p>
              </div>

              <div className="p-3 rounded-lg bg-bg-secondary space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Konversationer denna månad</span>
                  <span className="text-sm font-medium text-text-primary">
                    {showUsageLimitModal.current_month_conversations || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Kunskapsposter</span>
                  <span className="text-sm font-medium text-text-primary">
                    {showUsageLimitModal.knowledge_count || 0}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUsageLimitModal(null)}
                  className="btn btn-ghost"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => handleSetUsageLimit(showUsageLimitModal.id)}
                  className="btn btn-primary"
                >
                  Spara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Dashboard Modal */}
      {showCompanyDashboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-4xl animate-scale-in my-8">
            {/* Header */}
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-soft rounded-xl flex items-center justify-center text-accent">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">{showCompanyDashboard.name}</h2>
                  <p className="text-sm text-text-secondary">{showCompanyDashboard.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyDashboard(null)}
                className="p-2 rounded-lg text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {companyLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-10 h-10 border-3 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-text-secondary">Laddar företagsdata...</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-text-tertiary">Kunskapsposter</span>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">{showCompanyDashboard.knowledge_count || 0}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-success-soft rounded-lg flex items-center justify-center text-success">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-text-tertiary">Konversationer</span>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">{showCompanyDashboard.chat_count || 0}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-warning-soft rounded-lg flex items-center justify-center text-warning">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span className="text-xs text-text-tertiary">Skapad</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{formatDate(showCompanyDashboard.created_at)}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showCompanyDashboard.is_active ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          {showCompanyDashboard.is_active && <polyline points="9 12 11 14 15 10" />}
                          {!showCompanyDashboard.is_active && <path d="M15 9l-6 6M9 9l6 6" />}
                        </svg>
                      </div>
                      <span className="text-xs text-text-tertiary">Status</span>
                    </div>
                    <p className={`text-sm font-medium ${showCompanyDashboard.is_active ? 'text-success' : 'text-error'}`}>
                      {showCompanyDashboard.is_active ? 'Aktiv' : 'Inaktiv'}
                    </p>
                  </div>
                </div>

                {/* Usage Meters */}
                {companyUsage && (companyUsage.max_conversations_month > 0 || (showCompanyDashboard.max_knowledge_items || 0) > 0) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-text-primary mb-3">Användningsgränser</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyUsage.max_conversations_month > 0 && (
                        <div className={`p-4 rounded-xl border ${companyUsage.usage_percent >= 90 ? 'border-red-200 bg-red-50' : companyUsage.usage_percent >= 75 ? 'border-amber-200 bg-amber-50' : 'border-border-default bg-bg-primary'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">Konversationer denna månad</span>
                            <span className={`text-sm font-medium ${getUsageColor(companyUsage.usage_percent).text}`}>
                              {companyUsage.current_month_conversations} / {companyUsage.max_conversations_month}
                            </span>
                          </div>
                          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getUsageColor(companyUsage.usage_percent).bar} rounded-full transition-all`}
                              style={{ width: `${Math.min(100, companyUsage.usage_percent)}%` }}
                            />
                          </div>
                          <p className="text-xs text-text-tertiary mt-1">{Math.round(companyUsage.usage_percent)}% använt</p>
                        </div>
                      )}
                      {(showCompanyDashboard.max_knowledge_items || 0) > 0 && (() => {
                        const knowledgePercent = (showCompanyDashboard.knowledge_count / showCompanyDashboard.max_knowledge_items) * 100
                        return (
                          <div className={`p-4 rounded-xl border ${knowledgePercent >= 90 ? 'border-red-200 bg-red-50' : knowledgePercent >= 75 ? 'border-amber-200 bg-amber-50' : 'border-border-default bg-bg-primary'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-text-secondary">Kunskapsposter</span>
                              <span className={`text-sm font-medium ${getUsageColor(knowledgePercent).text}`}>
                                {showCompanyDashboard.knowledge_count} / {showCompanyDashboard.max_knowledge_items}
                              </span>
                            </div>
                            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getUsageColor(knowledgePercent).bar} rounded-full transition-all`}
                                style={{ width: `${Math.min(100, knowledgePercent)}%` }}
                              />
                            </div>
                            <p className="text-xs text-text-tertiary mt-1">{Math.round(knowledgePercent)}% använt</p>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text-primary mb-3">Senaste aktivitet</h3>
                  {companyActivity.length === 0 ? (
                    <div className="bg-bg-secondary rounded-xl p-6 text-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-text-tertiary">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <p className="text-sm text-text-secondary">Ingen aktivitet registrerad</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {companyActivity.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            log.action_type.includes('create') ? 'bg-green-500' :
                            log.action_type.includes('delete') ? 'bg-red-500' :
                            log.action_type.includes('update') ? 'bg-amber-500' :
                            'bg-accent'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{log.description}</p>
                          </div>
                          <span className="text-xs text-text-tertiary flex-shrink-0">
                            {new Date(log.timestamp).toLocaleDateString('sv-SE')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setShowCompanyDashboard(null); handleImpersonate(showCompanyDashboard.id) }}
                    className="btn btn-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Logga in som
                  </button>
                  <button
                    onClick={() => { setShowCompanyDashboard(null); openUsageLimitModal(showCompanyDashboard) }}
                    className="btn btn-secondary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-4" />
                    </svg>
                    Ändra gränser
                  </button>
                  <button
                    onClick={() => handleExport(showCompanyDashboard.id)}
                    className="btn btn-secondary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Exportera
                  </button>
                  <button
                    onClick={() => { setShowCompanyDashboard(null); handleToggle(showCompanyDashboard.id) }}
                    className={`btn ${showCompanyDashboard.is_active ? 'btn-ghost text-warning' : 'btn-ghost text-success'}`}
                  >
                    {showCompanyDashboard.is_active ? 'Inaktivera' : 'Aktivera'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdmin
