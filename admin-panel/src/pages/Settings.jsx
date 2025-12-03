import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Settings() {
  const { auth, authFetch } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('notifications')
  const [settings, setSettings] = useState({
    company_name: '',
    data_retention_days: 30,
    notify_unanswered: false,
    notification_email: '',
    contact_email: '', // Still needed for notification fallback
    // PuB/GDPR Compliance
    privacy_policy_url: '',
    require_consent: true,
    consent_text: 'Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn.',
    data_controller_name: '',
    data_controller_email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const tabs = [
    { id: 'notifications', label: 'Notiser', icon: 'bell' },
    { id: 'privacy', label: 'Integritet', icon: 'shield' },
    { id: 'compliance', label: 'Compliance', icon: 'badge' },
    { id: 'activity', label: 'Aktivitet', icon: 'clock' },
  ]

  const [activityLogs, setActivityLogs] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivityLogs()
    }
  }, [activeTab])

  const fetchActivityLogs = async () => {
    setActivityLoading(true)
    try {
      const response = await authFetch(`${API_BASE}/activity-log?limit=50`)
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Kunde inte hämta aktivitetslogg:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await authFetch(`${API_BASE}/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Kunde inte hämta inställningar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await authFetch(`${API_BASE}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Kunde inte spara:', error)
    } finally {
      setSaving(false)
    }
  }

  const generateEmbedCode = () => {
    return `<script src="https://cdn.bobot.nu/widget.js"></script>
<script>
  Bobot.init({
    companyId: '${auth.companyId}'
  });
</script>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderIcon = (icon) => {
    switch (icon) {
      case 'building':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
          </svg>
        )
      case 'bell':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )
      case 'shield':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )
      case 'code':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        )
      case 'clock':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      case 'badge':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Laddar...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Företagsinställningar</h1>
          <p className="text-text-secondary mt-1">Hantera GDPR, notiser och compliance</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-success text-sm animate-fade-in flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Sparat!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>

      {/* Tabs + Content Layout */}
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                {renderIcon(tab.icon)}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card animate-fade-in">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-text-primary">E-postnotifieringar</h2>
                  <p className="text-sm text-text-secondary">Få meddelanden om obesvarade frågor</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-subtle">
                  <div>
                    <p className="font-medium text-text-primary">Notifiera vid obesvarade frågor</p>
                    <p className="text-sm text-text-secondary mt-1">
                      Få ett e-postmeddelande när chatboten inte kan svara på en fråga
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notify_unanswered}
                      onChange={(e) => setSettings({ ...settings, notify_unanswered: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-bg-tertiary border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-tertiary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {settings.notify_unanswered && (
                  <div className="animate-fade-in">
                    <label className="input-label">E-postadress för notifieringar</label>
                    <input
                      type="email"
                      value={settings.notification_email}
                      onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                      placeholder="notis@foretag.se"
                      className="input"
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      Lämna tomt för att använda kontakt-e-posten ({settings.contact_email || 'ej angiven'})
                    </p>
                  </div>
                )}

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-text-primary">Kräver e-postkonfiguration</p>
                      <p className="text-text-secondary mt-1">
                        E-postnotifieringar kräver att en SMTP-server är konfigurerad. Kontakta support för att aktivera denna funktion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              {/* Data Retention Section */}
              <div className="card">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">GDPR & Datalagring</h2>
                    <p className="text-sm text-text-secondary">Hantera hur länge användardata sparas</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="input-label">Datalagring (dagar)</label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="range"
                        min="7"
                        max="30"
                        value={settings.data_retention_days}
                        onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                      <input
                        type="number"
                        min="7"
                        max="30"
                        value={settings.data_retention_days}
                        onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) || 30 })}
                        className="input w-20 text-center"
                      />
                    </div>
                    <p className="text-xs text-text-tertiary mt-2">
                      Konversationer raderas automatiskt efter {settings.data_retention_days} dagar
                    </p>
                  </div>

                  <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                    <h4 className="text-sm font-medium text-text-primary mb-3">Vad sparas?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 bg-success rounded-full flex-shrink-0"></span>
                        <span className="text-text-secondary">Anonymiserad statistik (antal frågor, svarstider) - sparas permanent</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 bg-warning rounded-full flex-shrink-0"></span>
                        <span className="text-text-secondary">Konversationshistorik - raderas efter {settings.data_retention_days} dagar</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></span>
                        <span className="text-text-secondary">IP-adresser anonymiseras direkt (xxx.xxx.xxx.xxx)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* PuB Compliance Section */}
              <div className="card">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">PuB-avtal & Samtycke</h2>
                    <p className="text-sm text-text-secondary">Personuppgiftsbiträdesavtal (PuB) och samtyckeshantering</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-subtle">
                    <div>
                      <p className="font-medium text-text-primary">Kräv samtycke innan chatt</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Användare måste godkänna innan de kan chatta
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.require_consent}
                        onChange={(e) => setSettings({ ...settings, require_consent: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-bg-tertiary border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-tertiary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {settings.require_consent && (
                    <div className="animate-fade-in">
                      <label className="input-label">Samtyckestext</label>
                      <textarea
                        value={settings.consent_text}
                        onChange={(e) => setSettings({ ...settings, consent_text: e.target.value })}
                        placeholder="Jag godkänner att mina meddelanden behandlas enligt integritetspolicyn."
                        rows={2}
                        className="input resize-none"
                      />
                      <p className="text-xs text-text-tertiary mt-1">Texten som visas bredvid checkboxen för samtycke</p>
                    </div>
                  )}

                  <div>
                    <label className="input-label">Länk till integritetspolicy</label>
                    <input
                      type="url"
                      value={settings.privacy_policy_url}
                      onChange={(e) => setSettings({ ...settings, privacy_policy_url: e.target.value })}
                      placeholder="https://dittforetag.se/integritetspolicy"
                      className="input"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Visas i widgeten så användare kan läsa policyn</p>
                  </div>
                </div>
              </div>

              {/* Data Controller Section */}
              <div className="card">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">Personuppgiftsansvarig</h2>
                    <p className="text-sm text-text-secondary">Information om vem som ansvarar för personuppgifter</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="input-label">Namn på personuppgiftsansvarig</label>
                    <input
                      type="text"
                      value={settings.data_controller_name}
                      onChange={(e) => setSettings({ ...settings, data_controller_name: e.target.value })}
                      placeholder="T.ex. Bostadsbolaget AB"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">E-post för dataskyddsfrågor</label>
                    <input
                      type="email"
                      value={settings.data_controller_email}
                      onChange={(e) => setSettings({ ...settings, data_controller_email: e.target.value })}
                      placeholder="gdpr@dittforetag.se"
                      className="input"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Dit användare kan vända sig för GDPR-förfrågningar (registerutdrag, radering)</p>
                  </div>
                </div>
              </div>

              {/* GDPR Rights Info */}
              <div className="card bg-accent/5 border-accent/20">
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-text-primary">Automatiska GDPR-rättigheter</p>
                    <p className="text-text-secondary mt-1">
                      Widgeten ger automatiskt användare möjlighet att:
                    </p>
                    <ul className="mt-2 space-y-1 text-text-secondary">
                      <li>• Se sin data (registerutdrag)</li>
                      <li>• Radera sin konversationshistorik</li>
                      <li>• Dra tillbaka samtycke</li>
                    </ul>
                    <p className="text-text-secondary mt-2">
                      Alla åtgärder loggas i GDPR-revisionsloggen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-fade-in">
              {/* EU Hosting Badge */}
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-accent-soft rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      <path d="M2 12h20" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-medium text-text-primary">EU-hostning</h2>
                      <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">Aktivt</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-4">
                      All data lagras och bearbetas i Sverige i enlighet med GDPR.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-bg-secondary rounded-lg p-3">
                        <p className="text-text-tertiary text-xs uppercase tracking-wide mb-1">Datacenter</p>
                        <p className="text-text-primary font-medium">Sverige</p>
                      </div>
                      <div className="bg-bg-secondary rounded-lg p-3">
                        <p className="text-text-tertiary text-xs uppercase tracking-wide mb-1">AI-behandling</p>
                        <p className="text-text-primary font-medium">Lokal (Ollama)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="card">
                <h3 className="font-medium text-text-primary mb-4">Certifieringar & Compliance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-success/30 bg-success/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">GDPR</p>
                        <p className="text-xs text-success">Kompatibel</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Full efterlevnad av EU:s dataskyddsförordning (2016/679)
                    </p>
                  </div>

                  <div className="border border-success/30 bg-success/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4l2 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">WCAG 2.2 AA</p>
                        <p className="text-xs text-success">Uppfyllt</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Tillgänglighetskraven enligt DOS-lagen och WCAG 2.2
                    </p>
                  </div>

                  <div className="border border-success/30 bg-success/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">PuB</p>
                        <p className="text-xs text-success">Kompatibel</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Svensk personuppgiftsbehandling enligt offentlighetsprincipen
                    </p>
                  </div>

                  <div className="border border-success/30 bg-success/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Lokal AI</p>
                        <p className="text-xs text-success">Ingen extern data</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">
                      AI-behandling sker lokalt - data skickas aldrig till tredje part
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Processing Summary */}
              <div className="card">
                <h3 className="font-medium text-text-primary mb-4">Databehandlingsöversikt</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm text-text-primary">Chattmeddelanden</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Raderas efter {settings.data_retention_days} dagar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm text-text-primary">IP-adresser</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Anonymiseras omedelbart</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm text-text-primary">Statistik</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Aggregerad & anonymiserad</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm text-text-primary">AI-förfrågningar</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Behandlas lokalt (Ollama)</span>
                  </div>
                </div>
              </div>

              {/* Documentation Link */}
              <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <div>
                      <p className="font-medium text-text-primary">Fullständig dokumentation</p>
                      <p className="text-xs text-text-secondary">Tekniska detaljer om GDPR, säkerhet och tillgänglighet</p>
                    </div>
                  </div>
                  <a href="/documentation" className="btn btn-secondary text-sm">
                    Visa dokumentation
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Card */}
              <div className="card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">Aktivitetslogg</h2>
                    <p className="text-sm text-text-secondary">Historik över ändringar i ditt konto</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-bg-secondary rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-text-primary">
                      {activityLogs.filter(l => l.action_type.includes('create')).length}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Skapade</p>
                  </div>
                  <div className="bg-bg-secondary rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-text-primary">
                      {activityLogs.filter(l => l.action_type.includes('update')).length}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Uppdaterade</p>
                  </div>
                  <div className="bg-bg-secondary rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-text-primary">
                      {activityLogs.filter(l => l.action_type.includes('delete')).length}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Borttagna</p>
                  </div>
                </div>
              </div>

              {/* Activity List */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-primary">Senaste händelser</h3>
                  <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
                    Sparas i 12 månader
                  </span>
                </div>

                {activityLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">Laddar aktivitetslogg...</p>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <p className="font-medium">Ingen aktivitet ännu</p>
                    <p className="text-sm text-text-tertiary mt-1">Händelser visas här när du gör ändringar</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle" />

                    <div className="space-y-4">
                      {activityLogs.map((log, index) => {
                        const isCreate = log.action_type.includes('create')
                        const isDelete = log.action_type.includes('delete')
                        const isUpdate = log.action_type.includes('update')
                        const isKnowledge = log.action_type.includes('knowledge')
                        const isSettings = log.action_type.includes('settings')
                        const isConversation = log.action_type.includes('conversation')

                        const bgColor = isCreate ? 'bg-green-50 dark:bg-green-900/20' :
                                       isDelete ? 'bg-red-50 dark:bg-red-900/20' :
                                       isUpdate ? 'bg-amber-50 dark:bg-amber-900/20' :
                                       'bg-accent-soft'
                        const iconBg = isCreate ? 'bg-green-500' :
                                      isDelete ? 'bg-red-500' :
                                      isUpdate ? 'bg-amber-500' :
                                      'bg-accent'
                        const actionLabel = isCreate ? 'Skapad' :
                                           isDelete ? 'Borttagen' :
                                           isUpdate ? 'Uppdaterad' :
                                           'Händelse'
                        const categoryLabel = isKnowledge ? 'Kunskapsbas' :
                                             isSettings ? 'Inställningar' :
                                             isConversation ? 'Konversation' :
                                             'System'

                        return (
                          <div key={log.id} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className={`absolute left-2 top-3 w-5 h-5 rounded-full ${iconBg} flex items-center justify-center ring-4 ring-bg-primary`}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                {isCreate ? (
                                  <path d="M12 5v14M5 12h14" />
                                ) : isDelete ? (
                                  <path d="M18 6L6 18M6 6l12 12" />
                                ) : isUpdate ? (
                                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                ) : (
                                  <circle cx="12" cy="12" r="4" />
                                )}
                              </svg>
                            </div>

                            <div className={`${bgColor} rounded-lg p-4 border border-border-subtle`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                      isCreate ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' :
                                      isDelete ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' :
                                      isUpdate ? 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200' :
                                      'bg-accent-soft text-accent'
                                    }`}>
                                      {actionLabel}
                                    </span>
                                    <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-0.5 rounded">
                                      {categoryLabel}
                                    </span>
                                  </div>
                                  <p className="text-sm text-text-primary font-medium">{log.description}</p>
                                  {log.details && (
                                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-text-tertiary">
                                    {new Date(log.timestamp).toLocaleDateString('sv-SE')}
                                  </p>
                                  <p className="text-xs text-text-tertiary">
                                    {new Date(log.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Install Tab */}
          {activeTab === 'install' && (
            <div className="card animate-fade-in">
              <h2 className="text-lg font-medium text-text-primary mb-2">Installera widgeten</h2>
              <p className="text-text-secondary text-sm mb-6">
                Klistra in koden på din webbplats för att aktivera chatboten
              </p>

              <div className="space-y-4">
                <div>
                  <label className="input-label mb-2">Widget-kod</label>
                  <div className="relative">
                    <pre className="bg-bg-secondary border border-border-subtle rounded-lg p-4 text-sm text-text-primary overflow-x-auto font-mono">
                      <code>{generateEmbedCode()}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={copyEmbedCode}
                      className="absolute top-3 right-3 btn btn-secondary text-xs py-1.5 px-3"
                    >
                      {copied ? 'Kopierat!' : 'Kopiera'}
                    </button>
                  </div>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Instruktioner</h4>
                  <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                    <li>Kopiera koden ovan</li>
                    <li>Klistra in precis före <code className="bg-bg-tertiary px-1 py-0.5 rounded text-xs">&lt;/body&gt;</code> på din webbplats</li>
                    <li>Widgeten visas automatiskt i nedre högra hörnet</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Widgeten hämtar automatiskt dina inställningar och anpassar språket efter besökarens webbläsare</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
