import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const API_BASE = '/api'

function Settings() {
  const { auth, authFetch } = useContext(AuthContext)
  const [settings, setSettings] = useState({
    company_name: '',
    welcome_message: 'Hej! Hur kan jag hjälpa dig idag?',
    fallback_message: 'Tyvärr kunde jag inte hitta ett svar på din fråga. Vänligen kontakta oss direkt.',
    primary_color: '#D97757',
    contact_email: '',
    contact_phone: '',
    data_retention_days: 30,
    language: 'sv',
  })

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ]
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [embedCode, setEmbedCode] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    generateEmbedCode()
  }, [settings, auth.companyId])

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

  const generateEmbedCode = () => {
    const code = `<script src="https://cdn.bobot.se/widget.js"></script>
<script>
  Bobot.init({
    companyId: '${auth.companyId}',
    title: '${settings.company_name || 'Kundtjänst'}',
    language: '${settings.language || 'sv'}',
    primaryColor: '${settings.primary_color || '#D97757'}',
    welcomeMessage: '${settings.welcome_message || ''}',
    fallbackMessage: '${settings.fallback_message || ''}',
    contactEmail: '${settings.contact_email || ''}',
    contactPhone: '${settings.contact_phone || ''}',
  });
</script>`
    setEmbedCode(code)
  }

  const handleSave = async (e) => {
    e.preventDefault()
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

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Laddar...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Inställningar</h1>
        <p className="text-text-secondary mt-1">Anpassa din chatbot och widget</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Företagsinformation */}
        <section className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Företagsinformation</h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Företagsnamn</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="T.ex. Bostadsbolaget AB"
                className="input"
              />
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
          </div>
        </section>

        {/* Chatbot-meddelanden */}
        <section className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Chatbot-meddelanden</h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Välkomstmeddelande</label>
              <textarea
                value={settings.welcome_message}
                onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                placeholder="Hej! Hur kan jag hjälpa dig idag?"
                rows={2}
                className="input resize-none"
              />
              <p className="text-xs text-text-tertiary mt-1">Första meddelandet användaren ser</p>
            </div>
            <div>
              <label className="input-label">Fallback-meddelande</label>
              <textarea
                value={settings.fallback_message}
                onChange={(e) => setSettings({ ...settings, fallback_message: e.target.value })}
                placeholder="Tyvärr kunde jag inte svara på din fråga..."
                rows={2}
                className="input resize-none"
              />
              <p className="text-xs text-text-tertiary mt-1">Visas när AI inte kan svara</p>
            </div>
          </div>
        </section>

        {/* Utseende & Språk */}
        <section className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">Utseende & Språk</h2>
          <div className="space-y-6">
            <div>
              <label className="input-label">Primärfärg</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-md border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="input w-32"
                  placeholder="#D97757"
                />
                <div
                  className="px-4 py-2 rounded-md text-white text-sm font-medium"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  Förhandsvisning
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Widgetens språk</label>
              <div className="flex gap-3 mt-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSettings({ ...settings, language: lang.code })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      settings.language === lang.code
                        ? 'border-accent bg-accent-soft'
                        : 'border-border-subtle hover:border-border bg-bg-secondary'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className={`text-sm font-medium ${
                      settings.language === lang.code ? 'text-accent' : 'text-text-primary'
                    }`}>
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Påverkar texter i widgeten (välkomstmeddelande, knappar, etc.)
              </p>
            </div>
          </div>
        </section>

        {/* GDPR & Integritet */}
        <section className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-text-primary">GDPR & Integritet</h2>
              <p className="text-sm text-text-secondary">Hantera hur länge användardata sparas</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="input-label">Datalagring (dagar)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="7"
                  max="365"
                  value={settings.data_retention_days}
                  onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.data_retention_days}
                  onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) || 30 })}
                  className="input w-20 text-center"
                />
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Konversationer raderas automatiskt efter {settings.data_retention_days} dagar.
                Anonymiserad statistik bevaras för analys.
              </p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
              <h4 className="text-sm font-medium text-text-primary mb-2">Vad sparas?</h4>
              <ul className="text-xs text-text-secondary space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                  Anonymiserad statistik (antal frågor, svarstider, kategorier)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full"></span>
                  Konversationer (raderas efter {settings.data_retention_days} dagar)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                  IP-adresser anonymiseras direkt (xxx.xxx.xxx.xxx)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Spara-knapp */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Sparar...' : 'Spara inställningar'}
          </button>
          {saved && (
            <span className="text-success text-sm animate-fade-in">
              Inställningar sparade!
            </span>
          )}
        </div>
      </form>

      {/* Embed-kod */}
      <section className="card mt-8">
        <h2 className="text-lg font-medium text-text-primary mb-2">Widget-kod</h2>
        <p className="text-text-secondary text-sm mb-4">
          Klistra in denna kod precis före <code className="bg-bg-secondary px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> på din webbplats
        </p>
        <div className="relative">
          <pre className="bg-bg-secondary border border-border-subtle rounded-lg p-4 text-sm text-text-primary overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
          <button
            type="button"
            onClick={copyEmbedCode}
            className="absolute top-3 right-3 btn btn-secondary text-xs py-1.5 px-3"
          >
            Kopiera
          </button>
        </div>
      </section>
    </div>
  )
}

export default Settings
