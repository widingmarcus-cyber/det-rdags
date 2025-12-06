import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { downloadProposalPDF } from '../components/ProposalPDF'
import {
  BillingTab,
  SystemTab,
  DocsTab,
  OverviewTab,
  CompaniesTab,
  AnalyticsTab,
  AuditTab,
  PreferencesTab,
  GDPRTab,
  PricingTab
} from '../components/superadmin'

const API_BASE = '/api'

// Bobot mascot for header
function BobotMini({ className = "", size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Feet */}
      <rect x="25" y="95" width="30" height="12" rx="6" fill="#78716C" />
      <rect x="65" y="95" width="30" height="12" rx="6" fill="#78716C" />
      <rect x="28" y="97" width="24" height="8" rx="4" fill="#57534E" />
      <rect x="68" y="97" width="24" height="8" rx="4" fill="#57534E" />
      {/* Body */}
      <rect x="30" y="55" width="60" height="42" rx="4" fill="#D97757" />
      <rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
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
      {/* Pupils */}
      <ellipse cx="48" cy="35" rx="5" ry="5" fill="#D97757" />
      <ellipse cx="72" cy="35" rx="5" ry="5" fill="#D97757" />
      {/* Eye highlights */}
      <circle cx="50" cy="32" r="2.5" fill="#FEF2EE" />
      <circle cx="74" cy="32" r="2.5" fill="#FEF2EE" />
      {/* Nose */}
      <rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />
      {/* Arms */}
      <rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C" />
      <rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C" />
      <rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E" />
      <rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E" />
      {/* Antenna */}
      <rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
      <circle cx="60" cy="10" r="5" fill="#4A9D7C">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

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
  const [companyWidgets, setCompanyWidgets] = useState([])
  const [companyLoading, setCompanyLoading] = useState(false)

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null)
  const [peakHours, setPeakHours] = useState(null)
  const [trends, setTrends] = useState(null)
  const [topCompanies, setTopCompanies] = useState([])

  // Billing state
  const [subscriptions, setSubscriptions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(null)
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    company_id: '',
    amount: '',
    description: '',
    due_date: ''
  })
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  // Company notes
  const [companyNotes, setCompanyNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Delete company confirmation (2-step)
  const [deleteConfirmCompany, setDeleteConfirmCompany] = useState(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Admin preferences
  const [adminPrefs, setAdminPrefs] = useState({ dark_mode: false, totp_enabled: false })
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFAData, setTwoFAData] = useState(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying2FA, setVerifying2FA] = useState(false)
  const [twoFAError, setTwoFAError] = useState('')

  // Rate limiting & performance
  const [rateLimitStats, setRateLimitStats] = useState(null)
  const [performanceStats, setPerformanceStats] = useState(null)

  // Audit log search
  const [auditSearchTerm, setAuditSearchTerm] = useState('')
  const [auditActionType, setAuditActionType] = useState('')
  const [auditDateRange, setAuditDateRange] = useState({ start: '', end: '' })
  const [auditActionTypes, setAuditActionTypes] = useState([])

  // New JARVIS features
  const [activityStream, setActivityStream] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState({ insights: [], trending_topics: [] })
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', type: 'info', target_company_id: '' })
  const [companyDocuments, setCompanyDocuments] = useState([])
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [documentForm, setDocumentForm] = useState({ document_type: 'agreement', description: '' })
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commandSearch, setCommandSearch] = useState('')

  // Pricing & Revenue
  const [pricingTiers, setPricingTiers] = useState({})
  const [revenueDashboard, setRevenueDashboard] = useState(null)
  const [showPricingModal, setShowPricingModal] = useState(null)
  const [pricingForm, setPricingForm] = useState({
    pricing_tier: 'starter',
    startup_fee_paid: false,
    contract_start_date: '',
    billing_email: ''
  })

  // Editable Roadmap
  const [roadmapItems, setRoadmapItems] = useState([])
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [roadmapForm, setRoadmapForm] = useState({ title: '', description: '', quarter: 'Q1 2026', status: 'planned' })
  const [editingRoadmapItem, setEditingRoadmapItem] = useState(null)

  // Self-hosting
  const [selfHostingStatus, setSelfHostingStatus] = useState(null)
  const [selfHostingLoading, setSelfHostingLoading] = useState(false)

  // Editable Pricing Tiers
  const [dbPricingTiers, setDbPricingTiers] = useState([])
  const [showPricingTierModal, setShowPricingTierModal] = useState(false)
  const [pricingTierForm, setPricingTierForm] = useState({ tier_key: '', name: '', monthly_fee: 0, startup_fee: 0, max_conversations: 0, features: [] })
  const [editingPricingTier, setEditingPricingTier] = useState(null)
  const [newFeature, setNewFeature] = useState('')

  // Company Discounts
  const [showDiscountModal, setShowDiscountModal] = useState(null)
  const [discountForm, setDiscountForm] = useState({ discount_percent: 0, discount_end_date: '', discount_note: '' })

  // Landing Page Analytics
  const [landingAnalytics, setLandingAnalytics] = useState(null)
  const [landingAnalyticsLoading, setLandingAnalyticsLoading] = useState(false)
  const [landingAnalyticsDays, setLandingAnalyticsDays] = useState(30)

  // Proposal PDF
  const [showProposalModal, setShowProposalModal] = useState(null)
  const [proposalForm, setProposalForm] = useState({
    contactPerson: '',
    startDate: ''
  })
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchCompanies()
    fetchSystemHealth()
    fetchMaintenanceMode()
    fetchActivityStream()
    fetchAiInsights()
    fetchAnnouncements()
    fetchAdminPrefs() // Fetch preferences including dark mode on load
  }, [])

  // Apply dark mode when preferences change
  useEffect(() => {
    document.documentElement.classList.toggle('dark', adminPrefs.dark_mode)
  }, [adminPrefs.dark_mode])

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs()
      fetchAuditActionTypes()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
      fetchLandingAnalytics(landingAnalyticsDays)
    } else if (activeTab === 'billing') {
      fetchBilling()
    } else if (activeTab === 'preferences') {
      fetchAdminPrefs()
    } else if (activeTab === 'pricing') {
      fetchPricingTiers()
      fetchRevenueDashboard()
      fetchRoadmapItems()
      fetchDbPricingTiers()
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

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, peakRes, trendsRes, companiesRes, rateRes, perfRes] = await Promise.all([
        adminFetch(`${API_BASE}/admin/analytics/overview?days=30`),
        adminFetch(`${API_BASE}/admin/analytics/peak-hours`),
        adminFetch(`${API_BASE}/admin/analytics/trends`),
        adminFetch(`${API_BASE}/admin/analytics/companies`),
        adminFetch(`${API_BASE}/admin/rate-limits`),
        adminFetch(`${API_BASE}/admin/performance/overview`)
      ])

      if (overviewRes.ok) setAnalyticsData(await overviewRes.json())
      if (peakRes.ok) setPeakHours(await peakRes.json())
      if (trendsRes.ok) setTrends(await trendsRes.json())
      if (companiesRes.ok) {
        const data = await companiesRes.json()
        setTopCompanies(data.companies || [])
      }
      if (rateRes.ok) setRateLimitStats(await rateRes.json())
      if (perfRes.ok) setPerformanceStats(await perfRes.json())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const fetchLandingAnalytics = async (days = 30) => {
    setLandingAnalyticsLoading(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/landing-analytics?days=${days}`)
      if (response.ok) {
        const data = await response.json()
        setLandingAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch landing analytics:', error)
    } finally {
      setLandingAnalyticsLoading(false)
    }
  }

  const fetchBilling = async () => {
    setBillingLoading(true)
    try {
      const [subsRes, invRes] = await Promise.all([
        adminFetch(`${API_BASE}/admin/subscriptions`),
        adminFetch(`${API_BASE}/admin/invoices?limit=20`)
      ])

      if (subsRes.ok) {
        const data = await subsRes.json()
        setSubscriptions(data.subscriptions || [])
      }
      if (invRes.ok) {
        const data = await invRes.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Failed to fetch billing:', error)
    } finally {
      setBillingLoading(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!invoiceForm.company_id || !invoiceForm.amount) {
      showNotification('Fyll i företag och belopp', 'error')
      return
    }

    setCreatingInvoice(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: invoiceForm.company_id,
          amount: parseFloat(invoiceForm.amount),
          description: invoiceForm.description || 'Månadsavgift',
          due_date: invoiceForm.due_date || null,
          currency: 'SEK'
        })
      })

      if (response.ok) {
        showNotification('Faktura skapad', 'success')
        setShowCreateInvoiceModal(false)
        setInvoiceForm({ company_id: '', amount: '', description: '', due_date: '' })
        fetchBilling()
      } else {
        const error = await response.json()
        showNotification(error.detail || 'Kunde inte skapa faktura', 'error')
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
      showNotification('Fel vid skapande av faktura', 'error')
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleUpdateInvoiceStatus = async (invoiceId, status) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        showNotification(`Faktura markerad som ${status === 'paid' ? 'betald' : status}`, 'success')
        fetchBilling()
      } else {
        showNotification('Kunde inte uppdatera faktura', 'error')
      }
    } catch (error) {
      console.error('Failed to update invoice:', error)
    }
  }

  const fetchPricingTiers = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/pricing-tiers`)
      if (response.ok) {
        const data = await response.json()
        setPricingTiers(data)
      }
    } catch (error) {
      console.error('Failed to fetch pricing tiers:', error)
    }
  }

  const fetchRevenueDashboard = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/revenue-dashboard`)
      if (response.ok) {
        const data = await response.json()
        setRevenueDashboard(data)
      }
    } catch (error) {
      console.error('Failed to fetch revenue dashboard:', error)
    }
  }

  const handleUpdatePricing = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingForm)
      })

      if (response.ok) {
        showNotification('Prisnivå uppdaterad', 'success')
        setShowPricingModal(null)
        fetchCompanies()
        fetchRevenueDashboard()
      } else {
        const error = await response.json()
        showNotification(error.detail || 'Kunde inte uppdatera', 'error')
      }
    } catch (error) {
      showNotification('Fel vid uppdatering', 'error')
    }
  }

  const openPricingModal = (company) => {
    setPricingForm({
      pricing_tier: company.pricing_tier || 'starter',
      startup_fee_paid: company.startup_fee_paid || false,
      contract_start_date: company.contract_start_date || '',
      billing_email: company.billing_email || ''
    })
    setShowPricingModal(company)
  }

  // Roadmap CRUD Functions
  const fetchRoadmapItems = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/roadmap`)
      if (response.ok) {
        const data = await response.json()
        setRoadmapItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error)
    }
  }

  const handleSaveRoadmapItem = async () => {
    try {
      const url = editingRoadmapItem
        ? `${API_BASE}/admin/roadmap/${editingRoadmapItem.id}`
        : `${API_BASE}/admin/roadmap`
      const method = editingRoadmapItem ? 'PUT' : 'POST'

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roadmapForm)
      })

      if (response.ok) {
        showNotification(editingRoadmapItem ? 'Roadmap-punkt uppdaterad' : 'Roadmap-punkt skapad', 'success')
        setShowRoadmapModal(false)
        setEditingRoadmapItem(null)
        setRoadmapForm({ title: '', description: '', quarter: 'Q1 2026', status: 'planned' })
        fetchRoadmapItems()
      } else {
        const error = await response.json()
        showNotification(error.detail || 'Kunde inte spara', 'error')
      }
    } catch (error) {
      showNotification('Fel vid sparning', 'error')
    }
  }

  const handleDeleteRoadmapItem = async (itemId) => {
    if (!confirm('Vill du radera denna roadmap-punkt?')) return

    try {
      const response = await adminFetch(`${API_BASE}/admin/roadmap/${itemId}`, { method: 'DELETE' })
      if (response.ok) {
        showNotification('Roadmap-punkt raderad', 'success')
        fetchRoadmapItems()
      }
    } catch (error) {
      showNotification('Kunde inte radera', 'error')
    }
  }

  const openEditRoadmapModal = (item) => {
    setRoadmapForm({
      title: item.title,
      description: item.description,
      quarter: item.quarter,
      status: item.status
    })
    setEditingRoadmapItem(item)
    setShowRoadmapModal(true)
  }

  // Pricing Tier CRUD Functions
  const fetchDbPricingTiers = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/pricing-tiers/db`)
      if (response.ok) {
        const data = await response.json()
        setDbPricingTiers(data.tiers || [])
      }
    } catch (error) {
      console.error('Failed to fetch db pricing tiers:', error)
    }
  }

  const handleInitPricingTiers = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/pricing-tiers/init`, { method: 'POST' })
      if (response.ok) {
        showNotification('Prisnivåer initierade', 'success')
        fetchDbPricingTiers()
        fetchPricingTiers()
      } else {
        const error = await response.json()
        showNotification(error.detail || 'Kunde inte initiera', 'error')
      }
    } catch (error) {
      showNotification('Fel vid initiering', 'error')
    }
  }

  const handleSavePricingTier = async () => {
    try {
      const url = editingPricingTier
        ? `${API_BASE}/admin/pricing-tiers/db/${editingPricingTier.tier_key}`
        : `${API_BASE}/admin/pricing-tiers/db`
      const method = editingPricingTier ? 'PUT' : 'POST'

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingTierForm)
      })

      if (response.ok) {
        showNotification(editingPricingTier ? 'Prisnivå uppdaterad' : 'Prisnivå skapad', 'success')
        setShowPricingTierModal(false)
        setEditingPricingTier(null)
        setPricingTierForm({ tier_key: '', name: '', monthly_fee: 0, startup_fee: 0, max_conversations: 0, features: [] })
        fetchDbPricingTiers()
        fetchPricingTiers()
        fetchRevenueDashboard()
      } else {
        const error = await response.json()
        showNotification(error.detail || 'Kunde inte spara', 'error')
      }
    } catch (error) {
      showNotification('Fel vid sparning', 'error')
    }
  }

  const openEditPricingTierModal = (tier) => {
    setPricingTierForm({
      tier_key: tier.tier_key,
      name: tier.name,
      monthly_fee: tier.monthly_fee,
      startup_fee: tier.startup_fee,
      max_conversations: tier.max_conversations,
      features: tier.features || []
    })
    setEditingPricingTier(tier)
    setShowPricingTierModal(true)
  }

  const addFeatureToTier = () => {
    if (newFeature.trim()) {
      setPricingTierForm(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeatureFromTier = (index) => {
    setPricingTierForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Discount Functions
  const openDiscountModal = (company) => {
    setDiscountForm({
      discount_percent: company.discount_percent || 0,
      discount_end_date: company.discount_end_date || '',
      discount_note: company.discount_note || ''
    })
    setShowDiscountModal(company)
  }

  const handleSaveDiscount = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${showDiscountModal.id}/discount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discountForm)
      })

      if (response.ok) {
        showNotification('Rabatt uppdaterad', 'success')
        setShowDiscountModal(null)
        fetchCompanies()
        fetchRevenueDashboard()
      } else {
        const error = await response.json()
        showNotification(error.detail || 'Kunde inte uppdatera', 'error')
      }
    } catch (error) {
      showNotification('Fel vid uppdatering', 'error')
    }
  }

  const fetchAdminPrefs = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/preferences`)
      if (response.ok) {
        const data = await response.json()
        setAdminPrefs(data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const fetchAuditActionTypes = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/audit-logs/action-types`)
      if (response.ok) {
        const data = await response.json()
        setAuditActionTypes(data.action_types || [])
      }
    } catch (error) {
      console.error('Failed to fetch action types:', error)
    }
  }

  const fetchCompanyNotes = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setCompanyNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  }

  const fetchCompanyDocuments = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setCompanyDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const fetchActivityStream = async () => {
    setActivityLoading(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/activity-stream?limit=15`)
      if (response.ok) {
        const data = await response.json()
        setActivityStream(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activity stream:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchAiInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/ai-insights`)
      if (response.ok) {
        const data = await response.json()
        setAiInsights(data)
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/announcements`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      // Prepare payload - only include target_company_id if it's set
      const payload = {
        title: announcementForm.title,
        message: announcementForm.message,
        type: announcementForm.type,
        target_company_id: announcementForm.target_company_id || null
      }
      const response = await adminFetch(`${API_BASE}/admin/announcements`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        const targetName = announcementForm.target_company_id
          ? companies.find(c => c.id === announcementForm.target_company_id)?.name || announcementForm.target_company_id
          : 'alla företag'
        showNotification(`Meddelande skickat till ${targetName}`)
        setShowAnnouncementModal(false)
        setAnnouncementForm({ title: '', message: '', type: 'info', target_company_id: '' })
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to create announcement:', error)
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/announcements/${announcementId}`, { method: 'DELETE' })
      if (response.ok) {
        showNotification('Meddelande borttaget')
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error)
    }
  }

  const handleToggleAnnouncement = async (announcementId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/announcements/${announcementId}/toggle`, { method: 'PUT' })
      if (response.ok) {
        const data = await response.json()
        showNotification(data.is_active ? 'Meddelande aktiverat' : 'Meddelande inaktiverat')
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle announcement:', error)
    }
  }

  const handleUploadDocument = async (file) => {
    if (!showCompanyDashboard) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result.split(',')[1]
      try {
        const response = await adminFetch(`${API_BASE}/admin/companies/${showCompanyDashboard.id}/documents`, {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            file_type: file.type,
            file_size: file.size,
            file_data: base64,
            document_type: documentForm.document_type,
            description: documentForm.description
          })
        })
        if (response.ok) {
          showNotification('Dokument uppladdat')
          setShowDocumentUpload(false)
          setDocumentForm({ document_type: 'agreement', description: '' })
          fetchCompanyDocuments(showCompanyDashboard.id)
        }
      } catch (error) {
        console.error('Failed to upload document:', error)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadDocument = async (docId, filename) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/documents/${docId}/download`)
      if (response.ok) {
        const data = await response.json()
        const link = document.createElement('a')
        link.href = `data:${data.file_type};base64,${data.file_data}`
        link.download = filename
        link.click()
      }
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Vill du radera detta dokument?')) return
    try {
      const response = await adminFetch(`${API_BASE}/admin/documents/${docId}`, { method: 'DELETE' })
      if (response.ok) {
        showNotification('Dokument borttaget')
        fetchCompanyDocuments(showCompanyDashboard.id)
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const searchAuditLogs = async () => {
    setAuditLoading(true)
    try {
      const params = new URLSearchParams()
      if (auditSearchTerm) params.append('search_term', auditSearchTerm)
      if (auditActionType) params.append('action_type', auditActionType)
      if (auditDateRange.start) params.append('start_date', auditDateRange.start)
      if (auditDateRange.end) params.append('end_date', auditDateRange.end)

      const response = await adminFetch(`${API_BASE}/admin/audit-logs/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to search audit logs:', error)
    } finally {
      setAuditLoading(false)
    }
  }

  const handleAddNote = async (companyId) => {
    if (!newNote.trim()) return
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: newNote, is_pinned: false })
      })
      if (response.ok) {
        setNewNote('')
        fetchCompanyNotes(companyId)
        showNotification('Anteckning sparad')
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleToggleDarkMode = async () => {
    // Optimistically update UI first
    const newDarkMode = !adminPrefs.dark_mode
    setAdminPrefs(prev => ({ ...prev, dark_mode: newDarkMode }))

    try {
      const response = await adminFetch(`${API_BASE}/admin/preferences`, {
        method: 'PUT',
        body: JSON.stringify({ dark_mode: newDarkMode })
      })
      if (!response.ok) {
        // Revert on error
        setAdminPrefs(prev => ({ ...prev, dark_mode: !newDarkMode }))
        showNotification('Kunde inte spara inställning', 'error')
      }
    } catch (error) {
      console.error('Failed to toggle dark mode:', error)
      // Revert on error
      setAdminPrefs(prev => ({ ...prev, dark_mode: !newDarkMode }))
    }
  }

  const handleSetup2FA = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/2fa/setup`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setTwoFAData(data)
        setShow2FASetup(true)
        setVerifyCode('')
        setTwoFAError('')
      } else {
        const data = await response.json().catch(() => ({}))
        showNotification(data.detail || 'Kunde inte starta 2FA-konfiguration', 'error')
      }
    } catch (error) {
      console.error('Failed to setup 2FA:', error)
      showNotification('Kunde inte ansluta till servern för 2FA', 'error')
    }
  }

  const handleVerify2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setTwoFAError('Ange en 6-siffrig kod')
      return
    }

    setVerifying2FA(true)
    setTwoFAError('')

    try {
      const response = await adminFetch(`${API_BASE}/admin/2fa/verify`, {
        method: 'POST',
        body: JSON.stringify({ code: verifyCode })
      })

      if (response.ok) {
        setShow2FASetup(false)
        setTwoFAData(null)
        setVerifyCode('')
        setAdminPrefs(prev => ({ ...prev, totp_enabled: true }))
        showNotification('2FA aktiverat!')
      } else {
        const data = await response.json().catch(() => ({}))
        setTwoFAError(data.detail || 'Ogiltig kod. Försök igen.')
      }
    } catch (error) {
      console.error('Failed to verify 2FA:', error)
      setTwoFAError('Ett fel uppstod. Försök igen.')
    } finally {
      setVerifying2FA(false)
    }
  }

  const handleCancel2FA = () => {
    setShow2FASetup(false)
    setTwoFAData(null)
    setVerifyCode('')
    setTwoFAError('')
  }

  const handleBulkSetLimits = async (limits) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/bulk/set-limits`, {
        method: 'POST',
        body: JSON.stringify({
          company_ids: Array.from(selectedCompanies),
          ...limits
        })
      })
      if (response.ok) {
        showNotification(`Gränser uppdaterade för ${selectedCompanies.size} företag`)
        setSelectedCompanies(new Set())
        fetchCompanies()
      }
    } catch (error) {
      console.error('Failed to bulk set limits:', error)
    }
  }

  const handleExportCompanies = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/bulk/export-companies`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        showNotification('Export nedladdad')
      }
    } catch (error) {
      console.error('Failed to export:', error)
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
        const data = await response.json()
        fetchCompanies()
        // Update showCompanyDashboard if it's the same company
        if (showCompanyDashboard?.id === companyId) {
          setShowCompanyDashboard(prev => ({ ...prev, is_active: data.is_active }))
        }
        const company = companies.find(c => c.id === companyId)
        showNotification(`${company?.name} ${data.is_active ? 'aktiverad' : 'inaktiverad'}`)
      }
    } catch (error) {
      console.error('Kunde inte ändra status:', error)
    }
  }

  const handleChangePassword = async (companyId) => {
    if (!newPassword || newPassword.length < 6) {
      showNotification('Lösenordet måste vara minst 6 tecken', 'error')
      return
    }
    setPasswordLoading(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ new_password: newPassword })
      })
      if (response.ok) {
        showNotification('Lösenord ändrat')
        setShowPasswordModal(null)
        setNewPassword('')
      } else {
        const err = await response.json()
        showNotification(err.detail || 'Kunde inte ändra lösenord', 'error')
      }
    } catch (error) {
      console.error('Kunde inte ändra lösenord:', error)
      showNotification('Kunde inte ändra lösenord', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteCompany = async (companyId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchCompanies()
        showNotification('Företag borttaget')
        setDeleteConfirmCompany(null)
        setDeleteConfirmStep(1)
        setDeleteConfirmText('')
        setShowCompanyDashboard(null)
      } else {
        const err = await response.json()
        showNotification(err.detail || 'Kunde inte ta bort företag', 'error')
      }
    } catch (error) {
      console.error('Kunde inte ta bort företag:', error)
      showNotification('Kunde inte ta bort företag', 'error')
    }
  }

  const handleToggleWidget = async (widgetId) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/widgets/${widgetId}/toggle`, {
        method: 'PUT'
      })
      if (response.ok) {
        const data = await response.json()
        // Update the widget in companyWidgets
        setCompanyWidgets(prev => prev.map(w =>
          w.id === widgetId ? { ...w, is_active: data.is_active } : w
        ))
        showNotification(data.is_active ? 'Widget aktiverad' : 'Widget inaktiverad')
      }
    } catch (error) {
      console.error('Kunde inte ändra widget status:', error)
      showNotification('Kunde inte ändra widget status', 'error')
    }
  }

  const handleToggleSelfHosting = async (companyId, currentEnabled) => {
    if (!currentEnabled) {
      // Enabling self-hosting - confirm first
      if (!window.confirm('Aktivera self-hosting för detta företag? En licensnyckel genereras automatiskt.')) {
        return
      }
    }

    setSelfHostingLoading(true)
    try {
      const response = await adminFetch(`${API_BASE}/admin/companies/${companyId}/self-hosting`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !currentEnabled })
      })
      if (response.ok) {
        const data = await response.json()
        setSelfHostingStatus({
          ...selfHostingStatus,
          is_self_hosted: data.is_self_hosted,
          license_key: data.license_key,
          valid_until: data.valid_until
        })
        showNotification(data.message)
      } else {
        const errData = await response.json()
        showNotification(errData.detail || 'Kunde inte uppdatera self-hosting', 'error')
      }
    } catch (error) {
      console.error('Failed to toggle self-hosting:', error)
      showNotification('Kunde inte uppdatera self-hosting', 'error')
    } finally {
      setSelfHostingLoading(false)
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
        // Store the impersonation token and redirect to company dashboard
        // Must use 'bobot_auth' key to match App.jsx
        localStorage.setItem('bobot_auth', JSON.stringify({
          token: data.token,
          companyId: data.company_id,
          companyName: data.company_name,
          isImpersonated: true
        }))
        window.location.href = '/dashboard'
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

  const openProposalModal = (company) => {
    setShowProposalModal(company)
    setProposalForm({
      contactPerson: '',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week from now
    })
  }

  const handleGenerateProposal = async () => {
    if (!showProposalModal) return

    setGeneratingPDF(true)
    try {
      // Get pricing info for this company
      const company = showProposalModal
      const tier = company.pricing_tier || 'starter'

      // Find the pricing tier details from database
      const tierInfo = dbPricingTiers.find(t => t.tier_key === tier)
      const startupFee = tierInfo?.startup_fee ?? 0
      const monthlyFee = tierInfo?.monthly_fee ?? 1500
      const conversationLimit = tierInfo?.max_conversations ?? 0

      // Apply discount if any
      const discount = company.discount_percent || 0

      const fileName = await downloadProposalPDF({
        customerName: company.name,
        contactPerson: proposalForm.contactPerson,
        startDate: proposalForm.startDate,
        startupFee,
        monthlyFee: discount > 0 ? Math.round(monthlyFee * (1 - discount / 100)) : monthlyFee,
        tier: tierInfo?.name || tier.charAt(0).toUpperCase() + tier.slice(1),
        discount,
        conversationLimit,
        pricingTiers: dbPricingTiers
      })

      showNotification(`PDF skapad: ${fileName}`)
      setShowProposalModal(null)
    } catch (error) {
      console.error('PDF generation failed:', error)
      showNotification('Kunde inte skapa PDF', 'error')
    } finally {
      setGeneratingPDF(false)
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
    setCompanyNotes([])
    setCompanyDocuments([])
    setCompanyWidgets([])
    setSelfHostingStatus(null)

    try {
      // Fetch all data in parallel
      const [usageRes, activityRes, notesRes, docsRes, widgetsRes, selfHostRes] = await Promise.all([
        adminFetch(`${API_BASE}/admin/companies/${company.id}/usage`),
        adminFetch(`${API_BASE}/admin/company-activity/${company.id}?limit=10`),
        adminFetch(`${API_BASE}/admin/companies/${company.id}/notes`),
        adminFetch(`${API_BASE}/admin/companies/${company.id}/documents`),
        adminFetch(`${API_BASE}/admin/companies/${company.id}/widgets`),
        adminFetch(`${API_BASE}/admin/companies/${company.id}/self-hosting`)
      ])

      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setCompanyUsage(usageData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setCompanyActivity(activityData.logs || [])
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json()
        setCompanyNotes(notesData.notes || [])
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setCompanyDocuments(docsData.documents || [])
      }

      if (widgetsRes.ok) {
        const widgetsData = await widgetsRes.json()
        setCompanyWidgets(widgetsData || [])
      }

      if (selfHostRes.ok) {
        const selfHostData = await selfHostRes.json()
        setSelfHostingStatus(selfHostData)
      }
    } catch (error) {
      console.error('Failed to fetch company details:', error)
    } finally {
      setCompanyLoading(false)
    }
  }

  const getUsageColor = (percent) => {
    if (percent >= 90) return { bar: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/15' }
    if (percent >= 75) return { bar: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/15' }
    return { bar: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-500/15' }
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

      {/* Subtle dot pattern background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.08] dark:opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle, #D97757 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      {/* Header */}
      <nav className="bg-bg-tertiary/80 backdrop-blur-sm border-b border-border-subtle sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg scale-150" />
                <BobotMini size={40} className="relative" />
              </div>
              <div>
                <span className="font-bold text-text-primary text-lg">Bobot</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={handleToggleDarkMode}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
                title={adminPrefs.dark_mode ? 'Ljust läge' : 'Mörkt läge'}
              >
                {adminPrefs.dark_mode ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
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

      {/* Sidebar + Content Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-bg-tertiary border-r border-border-subtle flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Dashboard
            </button>

            {/* KUNDER Section */}
            <div className="pt-4">
              <span className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Kunder</span>
            </div>
            <button
              onClick={() => setActiveTab('companies')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'companies'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Företag
              <span className="ml-auto text-xs bg-bg-secondary px-2 py-0.5 rounded-full">{companies.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'billing'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Fakturering
            </button>

            {/* PRODUKT Section */}
            <div className="pt-4">
              <span className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Produkt</span>
            </div>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pricing'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Prissättning
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Analys
            </button>

            {/* SYSTEM Section */}
            <div className="pt-4">
              <span className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">System</span>
            </div>
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'system'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Hälsa
              {systemHealth && (
                <span className={`ml-auto w-2 h-2 rounded-full ${
                  systemHealth.ollama_status === 'online' ? 'bg-success' : 'bg-error'
                }`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Aktivitetslogg
            </button>
            <button
              onClick={() => setActiveTab('gdpr')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gdpr'
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              GDPR
            </button>

            {/* Divider */}
            <div className="pt-4 border-t border-border-subtle mt-4">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Inställningar
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Dokumentation
              </button>
            </div>

            {/* User section at bottom */}
            <div className="absolute bottom-4 left-4 right-4 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-warning">{adminAuth.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{adminAuth.username}</p>
                  <p className="text-xs text-text-tertiary">Super Admin</p>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab
            setCommandPaletteOpen={setCommandPaletteOpen}
            announcements={announcements}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onToggleAnnouncement={handleToggleAnnouncement}
            systemHealth={systemHealth}
            maintenanceMode={maintenanceMode}
            totalCompanies={totalCompanies}
            activeCompanies={activeCompanies}
            totalChats={totalChats}
            totalKnowledge={totalKnowledge}
            companies={companies}
            setActiveTab={setActiveTab}
            onAddCompany={handleAdd}
            onGdprCleanup={handleGdprCleanup}
            onShowAnnouncementModal={() => setShowAnnouncementModal(true)}
            aiInsights={aiInsights}
            insightsLoading={insightsLoading}
            fetchAiInsights={fetchAiInsights}
            activityStream={activityStream}
            activityLoading={activityLoading}
            fetchActivityStream={fetchActivityStream}
            roadmapItems={roadmapItems}
            onOpenRoadmapModalNew={() => {
              setRoadmapForm({ title: '', description: '', quarter: 'Q1 2026', status: 'planned' })
              setEditingRoadmapItem(null)
              setShowRoadmapModal(true)
            }}
            onOpenEditRoadmapModal={openEditRoadmapModal}
            onDeleteRoadmapItem={handleDeleteRoadmapItem}
          />
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <CompaniesTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedCompanies={selectedCompanies}
            setSelectedCompanies={setSelectedCompanies}
            toggleSelectAll={toggleSelectAll}
            toggleSelectCompany={toggleSelectCompany}
            onBulkToggle={handleBulkToggle}
            loading={loading}
            filteredCompanies={filteredCompanies}
            onOpenCompanyDashboard={openCompanyDashboard}
            formatDate={formatDate}
            getUsageColor={getUsageColor}
            onAddCompany={handleAdd}
          />
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <PricingTab
            revenueDashboard={revenueDashboard}
            pricingTiers={pricingTiers}
            dbPricingTiers={dbPricingTiers}
            onInitPricingTiers={handleInitPricingTiers}
            onOpenEditPricingTierModal={openEditPricingTierModal}
            onOpenPricingTierModalNew={() => {
              setPricingTierForm({ tier_key: '', name: '', monthly_fee: 0, startup_fee: 0, max_conversations: 0, features: [] })
              setEditingPricingTier(null)
              setShowPricingTierModal(true)
            }}
          />
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <AuditTab
            auditLogs={auditLogs}
            auditLoading={auditLoading}
            auditSearchTerm={auditSearchTerm}
            setAuditSearchTerm={setAuditSearchTerm}
            auditActionType={auditActionType}
            setAuditActionType={setAuditActionType}
            auditActionTypes={auditActionTypes}
            auditDateRange={auditDateRange}
            setAuditDateRange={setAuditDateRange}
            onSearch={searchAuditLogs}
          />
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <SystemTab
            systemHealth={systemHealth}
            maintenanceMode={maintenanceMode}
            onToggleMaintenance={handleToggleMaintenance}
          />
        )}

        {/* GDPR Tab */}
        {activeTab === 'gdpr' && (
          <GDPRTab onGdprCleanup={handleGdprCleanup} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            trends={trends}
            performanceStats={performanceStats}
            rateLimitStats={rateLimitStats}
            peakHours={peakHours}
            landingAnalyticsDays={landingAnalyticsDays}
            setLandingAnalyticsDays={setLandingAnalyticsDays}
            fetchLandingAnalytics={fetchLandingAnalytics}
            landingAnalyticsLoading={landingAnalyticsLoading}
            landingAnalytics={landingAnalytics}
            topCompanies={topCompanies}
          />
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <BillingTab
            subscriptions={subscriptions}
            invoices={invoices}
            revenueDashboard={revenueDashboard}
            billingLoading={billingLoading}
            onCreateInvoice={() => setShowCreateInvoiceModal(true)}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          />
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <PreferencesTab
            adminPrefs={adminPrefs}
            adminAuth={adminAuth}
            selectedCompanies={selectedCompanies}
            onToggleDarkMode={handleToggleDarkMode}
            onSetup2FA={handleSetup2FA}
            onExportCompanies={handleExportCompanies}
            onBulkSetLimits={handleBulkSetLimits}
          />
        )}

        {/* Documentation Hub Tab */}
        {activeTab === 'docs' && (
          <DocsTab
            onShowAnnouncementModal={() => setShowAnnouncementModal(true)}
            announcements={announcements}
          />
        )}
        </main>
      </div>

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
          <div className="bg-bg-tertiary rounded-2xl shadow-xl w-full max-w-lg animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-border-subtle flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Användningsgränser</h2>
                  <p className="text-sm text-text-secondary">{showUsageLimitModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUsageLimitModal(null)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Usage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-text-secondary">Konversationer</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{showUsageLimitModal.current_month_conversations || 0}</p>
                  <p className="text-xs text-text-tertiary">denna månad</p>
                </div>
                <div className="bg-bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <span className="text-sm text-text-secondary">Kunskapsposter</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{showUsageLimitModal.knowledge_count || 0}</p>
                  <p className="text-xs text-text-tertiary">totalt</p>
                </div>
              </div>

              {/* Limit Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Max konversationer per månad</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={usageLimitValue.conversations}
                      onChange={(e) => setUsageLimitValue({ ...usageLimitValue, conversations: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full pl-4 pr-28 py-3 rounded-xl bg-bg-secondary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary pointer-events-none">
                      {usageLimitValue.conversations === 0 ? '∞ obegränsat' : 'per månad'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Max kunskapsposter</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={usageLimitValue.knowledge}
                      onChange={(e) => setUsageLimitValue({ ...usageLimitValue, knowledge: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full pl-4 pr-28 py-3 rounded-xl bg-bg-secondary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary pointer-events-none">
                      {usageLimitValue.knowledge === 0 ? '∞ obegränsat' : 'totalt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUsageLimitModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary font-medium transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => handleSetUsageLimit(showUsageLimitModal.id)}
                  className="flex-1 px-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
                >
                  Spara ändringar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-bg-tertiary rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Ändra lösenord</h2>
                  <p className="text-sm text-text-secondary">{showPasswordModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPasswordModal(null); setNewPassword('') }}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Nytt lösenord</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minst 6 tecken"
                  className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text-primary font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowPasswordModal(null); setNewPassword('') }}
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary font-medium transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => handleChangePassword(showPasswordModal.id)}
                  disabled={passwordLoading || newPassword.length < 6}
                  className="flex-1 px-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Sparar...' : 'Spara'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Company Confirmation Modal (2-step) */}
      {deleteConfirmCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-bg-tertiary rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Ta bort företag</h2>
                  <p className="text-sm text-text-secondary">{deleteConfirmCompany.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setDeleteConfirmCompany(null); setDeleteConfirmStep(1); setDeleteConfirmText('') }}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {deleteConfirmStep === 1 ? (
                <>
                  <div className="p-4 rounded-xl bg-error/10 border border-error/20">
                    <p className="text-error font-medium mb-2">Varning!</p>
                    <p className="text-sm text-text-secondary">
                      Detta kommer permanent ta bort företaget <strong>{deleteConfirmCompany.name}</strong> och all dess data:
                    </p>
                    <ul className="text-sm text-text-secondary mt-2 list-disc list-inside space-y-1">
                      <li>Alla widgets</li>
                      <li>All kunskapsbas</li>
                      <li>Alla konversationer</li>
                      <li>All statistik</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setDeleteConfirmCompany(null); setDeleteConfirmStep(1) }}
                      className="flex-1 px-4 py-3 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary font-medium transition-colors"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={() => setDeleteConfirmStep(2)}
                      className="flex-1 px-4 py-3 rounded-xl bg-error hover:bg-error/80 text-white font-medium transition-colors"
                    >
                      Fortsätt
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-error/10 border border-error/20">
                    <p className="text-error font-medium mb-2">Bekräfta borttagning</p>
                    <p className="text-sm text-text-secondary">
                      Skriv <strong className="font-mono">{deleteConfirmCompany.id}</strong> för att bekräfta:
                    </p>
                  </div>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={deleteConfirmCompany.id}
                    className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border-subtle focus:border-error focus:ring-1 focus:ring-error outline-none text-text-primary font-mono"
                    autoFocus
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setDeleteConfirmStep(1)}
                      className="flex-1 px-4 py-3 rounded-xl bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary font-medium transition-colors"
                    >
                      Tillbaka
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(deleteConfirmCompany.id)}
                      disabled={deleteConfirmText !== deleteConfirmCompany.id}
                      className="flex-1 px-4 py-3 rounded-xl bg-error hover:bg-error/80 text-white font-medium transition-colors disabled:opacity-50"
                    >
                      Ta bort permanent
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Company Dashboard Modal */}
      {showCompanyDashboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-2xl shadow-xl w-full max-w-4xl animate-scale-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-subtle flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">{showCompanyDashboard.name}</h2>
                  <p className="text-sm text-text-tertiary font-mono">{showCompanyDashboard.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyDashboard(null)}
                className="p-2.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {companyLoading ? (
              <div className="p-16 text-center">
                <div className="animate-spin w-10 h-10 border-3 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-text-secondary">Laddar företagsdata...</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-bg-secondary rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-text-tertiary">Kunskapsposter</span>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{showCompanyDashboard.knowledge_count || 0}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-text-tertiary">Konversationer</span>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{showCompanyDashboard.chat_count || 0}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span className="text-sm text-text-tertiary">Skapad</span>
                    </div>
                    <p className="text-xl font-bold text-text-primary">{formatDate(showCompanyDashboard.created_at)}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          {showCompanyDashboard.is_active && <polyline points="9 12 11 14 15 10" />}
                          {!showCompanyDashboard.is_active && <path d="M15 9l-6 6M9 9l6 6" />}
                        </svg>
                      </div>
                      <span className="text-sm text-text-tertiary">Status</span>
                    </div>
                    <p className={`text-3xl font-bold ${showCompanyDashboard.is_active ? 'text-success' : 'text-error'}`}>
                      {showCompanyDashboard.is_active ? 'Aktiv' : 'Inaktiv'}
                    </p>
                  </div>
                </div>

                {/* Pricing Tier Info */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    Prissättning
                  </h3>
                  <div className="bg-bg-secondary rounded-xl p-4">
                    {(() => {
                      const tier = pricingTiers[showCompanyDashboard.pricing_tier || 'starter'] || pricingTiers.starter || { name: 'Starter', monthly_fee: 0, startup_fee: 0 }
                      return (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-xs text-text-tertiary block mb-1">Prisnivå</span>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                showCompanyDashboard.pricing_tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                showCompanyDashboard.pricing_tier === 'business' ? 'bg-blue-100 text-blue-800' :
                                showCompanyDashboard.pricing_tier === 'professional' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tier?.name || 'Starter'}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-text-tertiary block mb-1">Månadskostnad</span>
                              <span className="text-lg font-bold text-text-primary">{tier?.monthly_fee?.toLocaleString('sv-SE')} kr</span>
                            </div>
                            <div>
                              <span className="text-xs text-text-tertiary block mb-1">Rabatt</span>
                              {showCompanyDashboard.discount_percent > 0 ? (
                                <div>
                                  <span className="text-lg font-bold text-green-600">{showCompanyDashboard.discount_percent}%</span>
                                  {showCompanyDashboard.discount_end_date && (
                                    <span className="text-xs text-text-tertiary block">t.o.m. {showCompanyDashboard.discount_end_date}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-text-tertiary">Ingen rabatt</span>
                              )}
                            </div>
                            <div>
                              <span className="text-xs text-text-tertiary block mb-1">Uppstart betald</span>
                              {showCompanyDashboard.startup_fee_paid ? (
                                <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Ja
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Nej ({tier?.startup_fee?.toLocaleString('sv-SE')} kr)
                                </span>
                              )}
                            </div>
                          </div>
                          {showCompanyDashboard.contract_start_date && (
                            <div className="text-xs text-text-tertiary mb-3">
                              Avtal startade: {showCompanyDashboard.contract_start_date}
                            </div>
                          )}
                          <div className="flex gap-2 pt-3 border-t border-border-subtle">
                            <button
                              onClick={() => { setShowCompanyDashboard(null); openPricingModal(showCompanyDashboard) }}
                              className="btn btn-secondary text-sm"
                            >
                              Ändra prisnivå
                            </button>
                            <button
                              onClick={() => { setShowCompanyDashboard(null); openDiscountModal(showCompanyDashboard) }}
                              className="btn btn-ghost text-sm"
                            >
                              Hantera rabatt
                            </button>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Usage Meters */}
                {companyUsage && (companyUsage.max_conversations_month > 0 || (showCompanyDashboard.max_knowledge_items || 0) > 0) && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Användningsgränser</h3>
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

                {/* Widgets Section */}
                {companyWidgets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </div>
                      Widgets ({companyWidgets.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {companyWidgets.map((widget) => (
                        <div key={widget.id} className={`rounded-xl p-4 flex items-center gap-3 border transition-all group ${
                          widget.is_active
                            ? 'bg-bg-secondary hover:bg-bg-primary border-transparent hover:border-border-subtle'
                            : 'bg-bg-secondary/50 border-border-subtle opacity-60'
                        }`}>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-transform ${
                              widget.is_active ? 'group-hover:scale-105' : 'grayscale'
                            }`}
                            style={{ backgroundColor: widget.primary_color || '#D97757' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{widget.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                                widget.widget_type === 'external' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                widget.widget_type === 'internal' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {widget.widget_type === 'external' ? 'Extern' :
                                 widget.widget_type === 'internal' ? 'Intern' : 'Anpassad'}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                widget.is_active ? 'text-success' : 'text-error'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  widget.is_active ? 'bg-success' : 'bg-error'
                                }`} />
                                {widget.is_active ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-text-tertiary font-mono bg-bg-tertiary px-2 py-1 rounded-lg truncate max-w-[80px]" title={widget.widget_key}>
                              {widget.widget_key?.slice(0, 6)}...
                            </p>
                            <button
                              onClick={() => handleToggleWidget(widget.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                widget.is_active
                                  ? 'bg-warning/10 hover:bg-warning/20 text-warning'
                                  : 'bg-success/10 hover:bg-success/20 text-success'
                              }`}
                              title={widget.is_active ? 'Inaktivera widget' : 'Aktivera widget'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {widget.is_active ? (
                                  <><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></>
                                ) : (
                                  <><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></>
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Self-Hosting Section */}
                {selfHostingStatus && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      Self-Hosting
                    </h3>
                    <div className="bg-bg-secondary rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                            selfHostingStatus.is_self_hosted
                              ? 'bg-success-soft text-success'
                              : selfHostingStatus.self_host_available
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            {selfHostingStatus.is_self_hosted ? 'Aktiverat' : selfHostingStatus.self_host_available ? 'Tillgängligt' : 'Ej tillgängligt'}
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {selfHostingStatus.tier && `(${selfHostingStatus.tier})`}
                          </span>
                        </div>
                        {selfHostingStatus.self_host_available && (
                          <button
                            onClick={() => handleToggleSelfHosting(showCompanyDashboard.id, selfHostingStatus.is_self_hosted)}
                            disabled={selfHostingLoading}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              selfHostingStatus.is_self_hosted
                                ? 'bg-error-soft text-error hover:bg-error/20'
                                : 'bg-accent text-white hover:bg-accent-hover'
                            } disabled:opacity-50`}
                          >
                            {selfHostingLoading ? '...' : selfHostingStatus.is_self_hosted ? 'Inaktivera' : 'Aktivera'}
                          </button>
                        )}
                      </div>

                      {selfHostingStatus.is_self_hosted && (
                        <div className="space-y-2 pt-3 border-t border-border-subtle">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">Licensnyckel:</span>
                            <code className="text-xs font-mono bg-bg-primary px-2 py-1 rounded select-all">
                              {selfHostingStatus.license_key}
                            </code>
                          </div>
                          {selfHostingStatus.valid_until && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-secondary">Giltig till:</span>
                              <span className="text-xs text-text-primary">
                                {new Date(selfHostingStatus.valid_until).toLocaleDateString('sv-SE')}
                              </span>
                            </div>
                          )}
                          {selfHostingStatus.last_validated && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-secondary">Senast validerad:</span>
                              <span className="text-xs text-text-primary">
                                {new Date(selfHostingStatus.last_validated).toLocaleDateString('sv-SE')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {!selfHostingStatus.self_host_available && (
                        <p className="text-xs text-text-tertiary">
                          Self-hosting är endast tillgängligt för Professional, Business och Enterprise.
                        </p>
                      )}

                      {selfHostingStatus.self_host_available && !selfHostingStatus.is_self_hosted && selfHostingStatus.license_fee > 0 && (
                        <p className="text-xs text-text-tertiary mt-2">
                          Licensavgift: {selfHostingStatus.license_fee.toLocaleString('sv-SE')} kr (engångsavgift)
                        </p>
                      )}

                      {selfHostingStatus.self_host_available && !selfHostingStatus.is_self_hosted && selfHostingStatus.license_fee === 0 && (
                        <p className="text-xs text-success mt-2">
                          Self-hosting ingår i Enterprise-paketet utan extra kostnad.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Senaste aktivitet</h3>
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

                {/* Notes & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Notes Section */}
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Anteckningar
                      </h3>
                      <span className="text-xs text-text-tertiary">{companyNotes.length}</span>
                    </div>

                    {/* Add Note Form */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Ny anteckning..."
                        className="input text-sm flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote(showCompanyDashboard.id)}
                      />
                      <button
                        onClick={() => handleAddNote(showCompanyDashboard.id)}
                        disabled={!newNote.trim()}
                        className="btn btn-primary btn-sm disabled:opacity-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {companyNotes.length === 0 ? (
                        <p className="text-xs text-text-tertiary text-center py-2">Inga anteckningar</p>
                      ) : (
                        companyNotes.map((note) => (
                          <div key={note.id} className={`p-2 rounded-lg text-xs ${note.is_pinned ? 'bg-warning/10 border border-warning/20' : 'bg-bg-primary'}`}>
                            <p className="text-text-primary">{note.content}</p>
                            <p className="text-text-tertiary mt-1">{new Date(note.created_at).toLocaleDateString('sv-SE')} - {note.created_by}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        Dokument
                      </h3>
                      <button
                        onClick={() => setShowDocumentUpload(true)}
                        className="text-xs text-accent hover:text-accent-hover"
                      >
                        + Ladda upp
                      </button>
                    </div>

                    {/* Upload Form */}
                    {showDocumentUpload && (
                      <div className="mb-3 p-3 bg-bg-primary rounded-lg border border-border-subtle">
                        <select
                          value={documentForm.document_type}
                          onChange={(e) => setDocumentForm({ ...documentForm, document_type: e.target.value })}
                          className="input text-sm mb-2"
                        >
                          <option value="agreement">Avtal</option>
                          <option value="contract">Kontrakt</option>
                          <option value="invoice">Faktura</option>
                          <option value="other">Övrigt</option>
                        </select>
                        <input
                          type="text"
                          value={documentForm.description}
                          onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                          placeholder="Beskrivning (valfritt)"
                          className="input text-sm mb-2"
                        />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0])}
                          className="text-xs"
                        />
                        <button
                          onClick={() => setShowDocumentUpload(false)}
                          className="text-xs text-text-tertiary mt-2 block"
                        >
                          Avbryt
                        </button>
                      </div>
                    )}

                    {/* Documents List */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {companyDocuments.length === 0 ? (
                        <p className="text-xs text-text-tertiary text-center py-2">Inga dokument</p>
                      ) : (
                        companyDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-primary group">
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                              doc.file_type.includes('pdf') ? 'bg-red-100 text-red-600' :
                              doc.file_type.includes('image') ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-text-primary truncate">{doc.filename}</p>
                              <p className="text-xs text-text-tertiary">{(doc.file_size / 1024).toFixed(0)} KB</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                                className="p-1 text-text-tertiary hover:text-accent"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-1 text-text-tertiary hover:text-error"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-border-subtle mt-2 space-y-4">
                  {/* Primary Action */}
                  <button
                    onClick={() => { setShowCompanyDashboard(null); handleImpersonate(showCompanyDashboard.id) }}
                    className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Logga in som detta företag
                  </button>

                  {/* Management Actions - Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setShowCompanyDashboard(null); openUsageLimitModal(showCompanyDashboard) }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary text-sm font-medium transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
                        <path d="M12 20V10" />
                        <path d="M18 20V4" />
                        <path d="M6 20v-4" />
                      </svg>
                      Ändra gränser
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(showCompanyDashboard)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary text-sm font-medium transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Ändra lösenord
                    </button>
                    <button
                      onClick={() => handleExport(showCompanyDashboard.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary text-sm font-medium transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Exportera data
                    </button>
                    <button
                      onClick={() => { setShowCompanyDashboard(null); openProposalModal(showCompanyDashboard) }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary hover:bg-bg-primary border border-border-subtle text-text-primary text-sm font-medium transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      Skapa offert
                    </button>
                  </div>

                  {/* Status & Danger Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleToggle(showCompanyDashboard.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        showCompanyDashboard.is_active
                          ? 'bg-warning/10 hover:bg-warning/20 border border-warning/30 text-warning'
                          : 'bg-success/10 hover:bg-success/20 border border-success/30 text-success'
                      }`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showCompanyDashboard.is_active
                          ? <><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></>
                          : <><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></>
                        }
                      </svg>
                      {showCompanyDashboard.is_active ? 'Inaktivera' : 'Aktivera'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmCompany(showCompanyDashboard)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-error/10 hover:bg-error/20 border border-error/30 text-error text-sm font-medium transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FASetup && twoFAData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Aktivera tvåfaktorsautentisering</h2>
              <p className="text-sm text-text-secondary mt-1">Skanna QR-koden med Google Authenticator</p>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFAData.totp_uri)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-text-tertiary text-center">
                  Eller ange denna kod manuellt:
                </p>
                <code className="mt-2 px-3 py-2 bg-bg-secondary rounded-lg text-sm font-mono text-text-primary select-all">
                  {twoFAData.secret}
                </code>
              </div>

              {/* Verification Code Input */}
              <div>
                <label className="input-label">Verifiera med kod från appen</label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {twoFAError && (
                  <p className="text-sm text-error mt-2">{twoFAError}</p>
                )}
              </div>

              {/* Backup Codes */}
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm font-medium text-warning mb-2">Spara dessa reservkoder säkert:</p>
                <div className="grid grid-cols-2 gap-2">
                  {twoFAData.backup_codes?.map((code, i) => (
                    <code key={i} className="text-xs font-mono text-text-secondary bg-bg-secondary px-2 py-1 rounded">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={handleCancel2FA}
                className="btn btn-ghost"
                disabled={verifying2FA}
              >
                Avbryt
              </button>
              <button
                onClick={handleVerify2FA}
                className="btn btn-primary"
                disabled={verifying2FA || verifyCode.length !== 6}
              >
                {verifying2FA ? 'Verifierar...' : 'Verifiera och aktivera'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Proposal PDF Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle" style={{ background: 'linear-gradient(135deg, #C4633A 0%, #A85230 100%)' }}>
              <h2 className="text-lg font-semibold text-white flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Skapa offert-PDF
              </h2>
              <p className="text-sm text-white/80 mt-1">
                För {showProposalModal.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Name (readonly) */}
              <div>
                <label className="input-label">Kundnamn</label>
                <input
                  type="text"
                  value={showProposalModal.name}
                  className="input bg-bg-secondary"
                  disabled
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="input-label">Kontaktperson</label>
                <input
                  type="text"
                  value={proposalForm.contactPerson}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Anna Andersson"
                  className="input"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="input-label">Planerat startdatum</label>
                <input
                  type="date"
                  value={proposalForm.startDate}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => setShowProposalModal(null)}
                className="btn btn-ghost"
                disabled={generatingPDF}
              >
                Avbryt
              </button>
              <button
                onClick={handleGenerateProposal}
                disabled={generatingPDF}
                className="btn"
                style={{ background: 'linear-gradient(135deg, #C4633A 0%, #A85230 100%)', color: 'white' }}
              >
                {generatingPDF ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Skapar PDF...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Ladda ner PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] z-50">
          <div className="bg-bg-primary rounded-2xl shadow-2xl border border-border-subtle w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Sök företag, åtgärder eller inställningar..."
                  className="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder:text-text-tertiary"
                  autoFocus
                />
                <button
                  onClick={() => { setCommandPaletteOpen(false); setCommandSearch(''); }}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {/* Quick Actions */}
              {!commandSearch && (
                <div className="p-3">
                  <p className="text-xs text-text-tertiary uppercase tracking-wider px-3 pb-2">Snabbåtgärder</p>
                  <button
                    onClick={() => { setCommandPaletteOpen(false); setActiveTab('companies'); setShowModal(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary text-left"
                  >
                    <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-text-primary font-medium">Skapa nytt företag</p>
                      <p className="text-xs text-text-tertiary">Lägg till ett nytt kundföretag</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setCommandPaletteOpen(false); setShowAnnouncementModal(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary text-left"
                  >
                    <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-text-primary font-medium">Skicka meddelande</p>
                      <p className="text-xs text-text-tertiary">Broadcast till alla administratörer</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setCommandPaletteOpen(false); setActiveTab('analytics'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary text-left"
                  >
                    <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-text-primary font-medium">Visa Analytics</p>
                      <p className="text-xs text-text-tertiary">Detaljerad statistik och rapporter</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setCommandPaletteOpen(false); setActiveTab('system'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary text-left"
                  >
                    <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-text-primary font-medium">Systeminställningar</p>
                      <p className="text-xs text-text-tertiary">AI-modell, GDPR och databas</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Search Results - Companies */}
              {commandSearch && (
                <div className="p-3">
                  <p className="text-xs text-text-tertiary uppercase tracking-wider px-3 pb-2">Företag</p>
                  {companies
                    .filter(c =>
                      c.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
                      c.id.toLowerCase().includes(commandSearch.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(company => (
                      <button
                        key={company.id}
                        onClick={() => { setCommandPaletteOpen(false); setCommandSearch(''); openCompanyDashboard(company); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary text-left"
                      >
                        <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-accent">{company.name.charAt(0)}</span>
                        </span>
                        <div>
                          <p className="text-text-primary font-medium">{company.name}</p>
                          <p className="text-xs text-text-tertiary">{company.id} • {company.is_active ? 'Aktiv' : 'Inaktiv'}</p>
                        </div>
                      </button>
                    ))
                  }
                  {companies.filter(c =>
                    c.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    c.id.toLowerCase().includes(commandSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-text-tertiary text-sm px-3 py-4 text-center">Inga företag hittades</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-2xl shadow-2xl border border-border-subtle w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-border-subtle">
              <h3 className="text-xl font-bold text-text-primary">Skicka meddelande</h3>
              <p className="text-text-secondary text-sm mt-1">
                {announcementForm.target_company_id
                  ? `Meddelandet skickas till ${companies.find(c => c.id === announcementForm.target_company_id)?.name || announcementForm.target_company_id}`
                  : 'Meddelandet visas för alla företag'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Target selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Mottagare</label>
                <select
                  value={announcementForm.target_company_id}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, target_company_id: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Alla företag</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name} ({company.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Typ</label>
                <select
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input w-full"
                >
                  <option value="info">Information</option>
                  <option value="warning">Varning</option>
                  <option value="maintenance">Underhåll</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Titel</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Systemuppdatering planerad..."
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Meddelande</label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Skriv ditt meddelande här..."
                  rows={4}
                  className="input w-full resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => { setShowAnnouncementModal(false); setAnnouncementForm({ title: '', message: '', type: 'info', target_company_id: '' }); }}
                className="btn btn-ghost"
              >
                Avbryt
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="btn btn-primary"
                disabled={!announcementForm.title || !announcementForm.message}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Skicka meddelande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Ändra prisnivå</h2>
              <p className="text-sm text-text-secondary mt-1">{showPricingModal.name} ({showPricingModal.id})</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Prisnivå</label>
                <select
                  value={pricingForm.pricing_tier}
                  onChange={(e) => setPricingForm({ ...pricingForm, pricing_tier: e.target.value })}
                  className="input w-full"
                >
                  {Object.entries(pricingTiers).map(([key, tier]) => (
                    <option key={key} value={key}>
                      {tier.name} ({tier.monthly_fee?.toLocaleString('sv-SE')} kr/mån{tier.startup_fee > 0 ? ` + ${tier.startup_fee?.toLocaleString('sv-SE')} kr uppstart` : ', gratis uppstart'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pricingForm.startup_fee_paid}
                    onChange={(e) => setPricingForm({ ...pricingForm, startup_fee_paid: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-primary">Uppstartsavgift betald</span>
                </label>
              </div>
              <div>
                <label className="input-label">Kontraktsstartdatum</label>
                <input
                  type="date"
                  value={pricingForm.contract_start_date}
                  onChange={(e) => setPricingForm({ ...pricingForm, contract_start_date: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="input-label">Faktureringsmejl</label>
                <input
                  type="email"
                  value={pricingForm.billing_email}
                  onChange={(e) => setPricingForm({ ...pricingForm, billing_email: e.target.value })}
                  className="input w-full"
                  placeholder="faktura@foretag.se"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => setShowPricingModal(null)}
                className="btn btn-ghost"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleUpdatePricing(showPricingModal.id)}
                className="btn btn-primary"
              >
                Spara ändringar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Skapa faktura</h2>
              <p className="text-sm text-text-secondary mt-1">Skapa en ny faktura för ett företag</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Företag *</label>
                <select
                  value={invoiceForm.company_id}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, company_id: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Välj företag...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Belopp (SEK) *</label>
                <input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="input w-full"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="input-label">Beskrivning</label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="input w-full"
                  placeholder="Månadsavgift"
                />
              </div>
              <div>
                <label className="input-label">Förfallodatum</label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateInvoiceModal(false)
                  setInvoiceForm({ company_id: '', amount: '', description: '', due_date: '' })
                }}
                className="btn btn-ghost"
                disabled={creatingInvoice}
              >
                Avbryt
              </button>
              <button
                onClick={handleCreateInvoice}
                className="btn btn-primary"
                disabled={creatingInvoice || !invoiceForm.company_id || !invoiceForm.amount}
              >
                {creatingInvoice ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Skapar...
                  </>
                ) : 'Skapa faktura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Hantera rabatt</h2>
              <p className="text-sm text-text-secondary mt-1">{showDiscountModal.name} ({showDiscountModal.id})</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Rabattprocent</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountForm.discount_percent}
                  onChange={(e) => setDiscountForm({ ...discountForm, discount_percent: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                  placeholder="0"
                />
                <p className="text-xs text-text-tertiary mt-1">0-100%, 0 = ingen rabatt</p>
              </div>
              <div>
                <label className="input-label">Rabatt gäller t.o.m.</label>
                <input
                  type="date"
                  value={discountForm.discount_end_date}
                  onChange={(e) => setDiscountForm({ ...discountForm, discount_end_date: e.target.value })}
                  className="input w-full"
                />
                <p className="text-xs text-text-tertiary mt-1">Lämna tomt för permanent rabatt</p>
              </div>
              <div>
                <label className="input-label">Anteckning</label>
                <input
                  type="text"
                  value={discountForm.discount_note}
                  onChange={(e) => setDiscountForm({ ...discountForm, discount_note: e.target.value })}
                  className="input w-full"
                  placeholder="T.ex. 'Early adopter', 'Kampanjrabatt'"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => setShowDiscountModal(null)}
                className="btn btn-ghost"
              >
                Avbryt
              </button>
              <button
                onClick={handleSaveDiscount}
                className="btn btn-primary"
              >
                Spara rabatt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingRoadmapItem ? 'Redigera roadmap-punkt' : 'Ny roadmap-punkt'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Titel</label>
                <input
                  type="text"
                  value={roadmapForm.title}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })}
                  className="input w-full"
                  placeholder="T.ex. 'Webhook-integrationer'"
                />
              </div>
              <div>
                <label className="input-label">Beskrivning</label>
                <textarea
                  value={roadmapForm.description}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Kort beskrivning av funktionen..."
                />
              </div>
              <div>
                <label className="input-label">Kvartal</label>
                <select
                  value={roadmapForm.quarter}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, quarter: e.target.value })}
                  className="input w-full"
                >
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                  <option value="Q1 2027">Q1 2027</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </div>
              <div>
                <label className="input-label">Status</label>
                <select
                  value={roadmapForm.status}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="planned">Planerad</option>
                  <option value="in_progress">Pågående</option>
                  <option value="completed">Klar</option>
                  <option value="cancelled">Avbruten</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRoadmapModal(false)
                  setEditingRoadmapItem(null)
                }}
                className="btn btn-ghost"
              >
                Avbryt
              </button>
              <button
                onClick={handleSaveRoadmapItem}
                className="btn btn-primary"
              >
                {editingRoadmapItem ? 'Spara ändringar' : 'Skapa punkt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tier Edit Modal */}
      {showPricingTierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-bg-tertiary rounded-xl shadow-xl w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingPricingTier ? 'Redigera prisnivå' : 'Ny prisnivå'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Nyckel (ID)</label>
                <input
                  type="text"
                  value={pricingTierForm.tier_key}
                  onChange={(e) => setPricingTierForm({ ...pricingTierForm, tier_key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  className="input w-full font-mono"
                  placeholder="t.ex. 'professional'"
                  disabled={!!editingPricingTier}
                />
                {editingPricingTier && (
                  <p className="text-xs text-text-tertiary mt-1">Nyckel kan inte ändras</p>
                )}
              </div>
              <div>
                <label className="input-label">Visningsnamn</label>
                <input
                  type="text"
                  value={pricingTierForm.name}
                  onChange={(e) => setPricingTierForm({ ...pricingTierForm, name: e.target.value })}
                  className="input w-full"
                  placeholder="T.ex. 'Professional'"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Månadsavgift (kr)</label>
                  <input
                    type="number"
                    min="0"
                    value={pricingTierForm.monthly_fee}
                    onChange={(e) => setPricingTierForm({ ...pricingTierForm, monthly_fee: parseFloat(e.target.value) || 0 })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="input-label">Uppstartsavgift (kr)</label>
                  <input
                    type="number"
                    min="0"
                    value={pricingTierForm.startup_fee}
                    onChange={(e) => setPricingTierForm({ ...pricingTierForm, startup_fee: parseFloat(e.target.value) || 0 })}
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Max konversationer/månad</label>
                <input
                  type="number"
                  min="0"
                  value={pricingTierForm.max_conversations}
                  onChange={(e) => setPricingTierForm({ ...pricingTierForm, max_conversations: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                />
                <p className="text-xs text-text-tertiary mt-1">0 = obegränsat</p>
              </div>
              <div>
                <label className="input-label">Inkluderade funktioner</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="input flex-1"
                    placeholder="Lägg till funktion..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeatureToTier())}
                  />
                  <button
                    type="button"
                    onClick={addFeatureToTier}
                    className="btn btn-secondary"
                  >
                    Lägg till
                  </button>
                </div>
                <div className="space-y-2">
                  {pricingTierForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-bg-secondary p-2 rounded">
                      <span className="text-sm text-text-primary">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeatureFromTier(index)}
                        className="text-error hover:text-error/80"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPricingTierModal(false)
                  setEditingPricingTier(null)
                }}
                className="btn btn-ghost"
              >
                Avbryt
              </button>
              <button
                onClick={handleSavePricingTier}
                className="btn btn-primary"
              >
                {editingPricingTier ? 'Spara ändringar' : 'Skapa prisnivå'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdmin
