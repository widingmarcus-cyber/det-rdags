import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Settings() {
  const { auth, authFetch } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    company_name: '',
    welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
    fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.',
    subtitle: 'Alltid redo att hjälpa',
    primary_color: '#D97757',
    contact_email: '',
    contact_phone: '',
    data_retention_days: 30,
    notify_unanswered: false,
    notification_email: '',
    custom_categories: '',
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
    { id: 'general', label: 'Allmänt', icon: 'building' },
    { id: 'chatbot', label: 'Chatbot', icon: 'chat' },
    { id: 'appearance', label: 'Utseende', icon: 'palette' },
    { id: 'notifications', label: 'Notiser', icon: 'bell' },
    { id: 'privacy', label: 'Integritet', icon: 'shield' },
    { id: 'install', label: 'Installation', icon: 'code' },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

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
    return `<script src="https://cdn.bobot.se/widget.js"></script>
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
      case 'chat':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      case 'palette':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="10.5" r="2.5" />
            <circle cx="8.5" cy="7.5" r="2.5" />
            <circle cx="6.5" cy="12.5" r="2.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
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
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Inställningar</h1>
          <p className="text-text-secondary mt-1">Anpassa din chatbot och widget</p>
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
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="card animate-fade-in">
              <h2 className="text-lg font-medium text-text-primary mb-6">Företagsinformation</h2>
              <div className="space-y-5">
                <div>
                  <label className="input-label">Företagsnamn</label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    placeholder="T.ex. Bostadsbolaget AB"
                    className="input"
                  />
                  <p className="text-xs text-text-tertiary mt-1">Visas i widgetens header</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">E-post för kontakt</label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      placeholder="kundtjanst@foretag.se"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Telefon för kontakt</label>
                    <input
                      type="tel"
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      placeholder="08-123 456 78"
                      className="input"
                    />
                  </div>
                </div>
                <p className="text-xs text-text-tertiary">
                  Kontaktuppgifterna visas när chatboten inte kan svara på en fråga
                </p>
              </div>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="card animate-fade-in">
              <h2 className="text-lg font-medium text-text-primary mb-6">Chatbot-meddelanden</h2>
              <div className="space-y-5">
                <div>
                  <label className="input-label">Välkomstmeddelande</label>
                  <textarea
                    value={settings.welcome_message}
                    onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                    placeholder="Hej! Hur kan jag hjälpa dig idag?"
                    rows={3}
                    className="input resize-none"
                  />
                  <p className="text-xs text-text-tertiary mt-1">Första meddelandet användaren ser när chatten öppnas</p>
                </div>
                <div>
                  <label className="input-label">Slogan/Underrubrik</label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                    placeholder="Alltid redo att hjälpa"
                    className="input"
                  />
                  <p className="text-xs text-text-tertiary mt-1">Visas under företagsnamnet i widgetens header</p>
                </div>
                <div>
                  <label className="input-label">Fallback-meddelande</label>
                  <textarea
                    value={settings.fallback_message}
                    onChange={(e) => setSettings({ ...settings, fallback_message: e.target.value })}
                    placeholder="Tyvärr kunde jag inte svara på din fråga..."
                    rows={3}
                    className="input resize-none"
                  />
                  <p className="text-xs text-text-tertiary mt-1">Visas när AI inte kan hitta ett svar i kunskapsbasen</p>
                </div>
                <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>Chatboten svarar automatiskt på samma språk som användaren skriver</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="card animate-fade-in">
              <h2 className="text-lg font-medium text-text-primary mb-6">Utseende</h2>
              <div className="space-y-5">
                <div>
                  <label className="input-label">Primärfärg</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="w-14 h-14 rounded-lg border border-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={settings.primary_color}
                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                        className="input w-32"
                        placeholder="#D97757"
                      />
                      <p className="text-xs text-text-tertiary mt-1">HEX-färgkod</p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="input-label mb-3">Förhandsvisning</label>
                  <div className="bg-bg-secondary rounded-xl p-4 border border-border-subtle">
                    <div
                      className="rounded-lg overflow-hidden shadow-lg max-w-xs"
                      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                    >
                      {/* Widget Header Preview */}
                      <div
                        className="text-white px-4 py-3"
                        style={{
                          background: `linear-gradient(135deg, ${settings.primary_color}, ${adjustColor(settings.primary_color, -30)})`
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{settings.company_name || 'Ditt Företag'}</p>
                            <p className="text-xs opacity-80">Alltid redo att hjälpa</p>
                          </div>
                        </div>
                      </div>
                      {/* Widget Body Preview */}
                      <div className="bg-white p-3">
                        <div className="bg-gray-100 rounded-lg rounded-bl-sm px-3 py-2 text-sm text-gray-700 max-w-[80%]">
                          {settings.welcome_message || 'Hej! Hur kan jag hjälpa dig?'}
                        </div>
                      </div>
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

// Helper function to darken/lighten a hex color
function adjustColor(hex, amount) {
  if (!hex) return '#C4613D'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export default Settings
