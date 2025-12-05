import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { downloadProposalPDF } from '../components/ProposalPDF'

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

  // Company notes
  const [companyNotes, setCompanyNotes] = useState([])
  const [newNote, setNewNote] = useState('')

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
  const [announcement, setAnnouncement] = useState(null)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', type: 'info' })
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
    startDate: '',
    hostingOption: 'cloud'
  })
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchCompanies()
    fetchSystemHealth()
    fetchMaintenanceMode()
    fetchActivityStream()
    fetchAiInsights()
    fetchAnnouncement()
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

  const fetchAnnouncement = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/announcements`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncement(data.announcement)
      }
    } catch (error) {
      console.error('Failed to fetch announcement:', error)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/announcements`, {
        method: 'POST',
        body: JSON.stringify(announcementForm)
      })
      if (response.ok) {
        showNotification('Meddelande publicerat')
        setShowAnnouncementModal(false)
        setAnnouncementForm({ title: '', message: '', type: 'info' })
        fetchAnnouncement()
      }
    } catch (error) {
      console.error('Failed to create announcement:', error)
    }
  }

  const handleDeleteAnnouncement = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/announcements`, { method: 'DELETE' })
      if (response.ok) {
        showNotification('Meddelande borttaget')
        setAnnouncement(null)
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error)
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
        fetchCompanies()
        const company = companies.find(c => c.id === companyId)
        showNotification(`${company?.name} ${company?.is_active ? 'inaktiverad' : 'aktiverad'}`)
      }
    } catch (error) {
      console.error('Kunde inte ändra status:', error)
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

  const openProposalModal = (company) => {
    setShowProposalModal(company)
    setProposalForm({
      contactPerson: '',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      hostingOption: 'cloud'
    })
  }

  const handleGenerateProposal = async () => {
    if (!showProposalModal) return

    setGeneratingPDF(true)
    try {
      // Get pricing info for this company
      const company = showProposalModal
      const tier = company.pricing_tier || 'starter'

      // Find the pricing tier details
      let startupFee = 4900
      let monthlyFee = 990
      let conversationLimit = 0

      // Try to get from dbPricingTiers if available
      const tierInfo = dbPricingTiers.find(t => t.tier_key === tier)
      if (tierInfo) {
        startupFee = tierInfo.startup_fee || 4900
        monthlyFee = tierInfo.monthly_fee || 990
        conversationLimit = tierInfo.max_conversations || 0
      }

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
        hostingOption: proposalForm.hostingOption
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

      {/* Tabs */}
      <div className="bg-bg-tertiary border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Översikt', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
              { id: 'companies', label: 'Företag', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
              { id: 'pricing', label: 'Prissättning', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
              { id: 'analytics', label: 'Analys', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
              { id: 'billing', label: 'Fakturering', icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
              { id: 'audit', label: 'Logg', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></> },
              { id: 'system', label: 'System', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
              { id: 'docs', label: 'Docs', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></> },
              { id: 'preferences', label: 'Konto', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> }
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
        {/* Overview Tab - COMMAND CENTER */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* COMMAND CENTER HEADER */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Kontrollcenter</h1>
                <div className="flex items-center gap-4">
                  {/* Command Palette Trigger */}
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="text-sm">Sök kund, fråga, eller åtgärd...</span>
                  </button>
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    Senast uppdaterad: {new Date().toLocaleTimeString('sv-SE')}
                  </div>
                </div>
              </div>
              <p className="text-text-secondary">Allt du behöver se för att förstå hur din verksamhet går</p>
            </div>

            {/* Active Announcement Banner */}
            {announcement && (
              <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${
                announcement.type === 'warning' ? 'bg-warning/10 border border-warning/30' :
                announcement.type === 'maintenance' ? 'bg-info/10 border border-info/30' :
                'bg-accent/10 border border-accent/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    announcement.type === 'warning' ? 'bg-warning text-white' :
                    announcement.type === 'maintenance' ? 'bg-info text-white' :
                    'bg-accent text-white'
                  }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{announcement.title}</p>
                    <p className="text-sm text-text-secondary">{announcement.message}</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteAnnouncement}
                  className="p-2 rounded-lg hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* SYSTEM STATUS BANNER */}
            <div className={`rounded-xl p-6 mb-8 border-2 ${
              systemHealth?.ollama_status === 'online'
                ? 'bg-success/10 border-success/30'
                : maintenanceMode?.enabled
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-error/10 border-error/30'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    systemHealth?.ollama_status === 'online'
                      ? 'bg-success text-white'
                      : maintenanceMode?.enabled
                        ? 'bg-warning text-white'
                        : 'bg-error text-white'
                  }`}>
                    {systemHealth?.ollama_status === 'online' ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : maintenanceMode?.enabled ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      systemHealth?.ollama_status === 'online'
                        ? 'text-success'
                        : maintenanceMode?.enabled
                          ? 'text-warning'
                          : 'text-error'
                    }`}>
                      {systemHealth?.ollama_status === 'online'
                        ? 'SYSTEMET ÄR ONLINE'
                        : maintenanceMode?.enabled
                          ? 'UNDERHÅLLSLÄGE'
                          : 'SYSTEMET ÄR OFFLINE'}
                    </h2>
                    <p className="text-text-secondary">
                      {systemHealth?.ollama_status === 'online'
                        ? 'AI-chattbotten fungerar och besvarar kundfrågor'
                        : maintenanceMode?.enabled
                          ? maintenanceMode.message || 'Systemet är under underhåll'
                          : 'AI-tjänsten är inte tillgänglig just nu'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">{systemHealth?.database_size || '?'}</p>
                    <p className="text-text-tertiary">Databasstorlek</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">{systemHealth?.uptime || 'N/A'}</p>
                    <p className="text-text-tertiary">Upptid</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BIG KPI SCOREBOARD */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-6 text-center">
                <p className="text-5xl font-bold text-accent mb-2">{totalCompanies}</p>
                <p className="text-lg font-medium text-text-primary">Kunder</p>
                <p className="text-sm text-text-secondary mt-1">{activeCompanies} aktiva just nu</p>
              </div>
              <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-xl p-6 text-center">
                <p className="text-5xl font-bold text-success mb-2">{totalChats.toLocaleString()}</p>
                <p className="text-lg font-medium text-text-primary">Chattsamtal</p>
                <p className="text-sm text-text-secondary mt-1">Totalt besvarade frågor</p>
              </div>
              <div className="bg-gradient-to-br from-info/20 to-info/5 border border-info/30 rounded-xl p-6 text-center">
                <p className="text-5xl font-bold text-info mb-2">{totalKnowledge.toLocaleString()}</p>
                <p className="text-lg font-medium text-text-primary">Kunskapsposter</p>
                <p className="text-sm text-text-secondary mt-1">AI:ns databas</p>
              </div>
              <div className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-xl p-6 text-center">
                <p className="text-5xl font-bold text-warning mb-2">
                  {companies.filter(c => !c.is_active).length}
                </p>
                <p className="text-lg font-medium text-text-primary">Inaktiva</p>
                <p className="text-sm text-text-secondary mt-1">Kunder som pausat</p>
              </div>
            </div>

            {/* NEEDS ATTENTION SECTION */}
            {(companies.filter(c => !c.is_active).length > 0 ||
              companies.filter(c => (c.knowledge_count || 0) < 5).length > 0) && (
              <div className="bg-warning/10 border-2 border-warning/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-warning">KRÄVER DIN UPPMÄRKSAMHET</h3>
                    <p className="text-sm text-text-secondary">Saker som kan behöva åtgärdas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {companies.filter(c => !c.is_active).length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center text-warning">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {companies.filter(c => !c.is_active).length} inaktiva kunder
                          </p>
                          <p className="text-sm text-text-secondary">Kan betyda avslutade eller pausade prenumerationer</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('companies')}
                        className="btn btn-ghost text-sm"
                      >
                        Visa →
                      </button>
                    </div>
                  )}
                  {companies.filter(c => (c.knowledge_count || 0) < 5).length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center text-warning">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {companies.filter(c => (c.knowledge_count || 0) < 5).length} kunder med lite innehåll
                          </p>
                          <p className="text-sm text-text-secondary">Mindre än 5 kunskapsposter - AI:n kan inte svara bra</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('companies')}
                        className="btn btn-ghost text-sm"
                      >
                        Visa →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MAIN GRID - Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* QUICK ACTIONS */}
              <div className="lg:col-span-1">
                <div className="card h-full">
                  <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Snabbåtgärder
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={handleAdd}
                      className="w-full flex items-center gap-3 p-4 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all group"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <div className="text-left">
                        <p className="font-medium">Lägg till ny kund</p>
                        <p className="text-xs opacity-80">Skapa ett nytt företagskonto</p>
                      </div>
                    </button>
                    <button
                      onClick={handleGdprCleanup}
                      className="w-full flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle transition-all"
                    >
                      <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center text-success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text-primary">GDPR-rensning</p>
                        <p className="text-xs text-text-secondary">Radera gamla konversationer</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="w-full flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle transition-all"
                    >
                      <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center text-info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text-primary">Se detaljerad analys</p>
                        <p className="text-xs text-text-secondary">Statistik och trender</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="w-full flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle transition-all"
                    >
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text-primary">Fakturering</p>
                        <p className="text-xs text-text-secondary">Se betalningar och prenumerationer</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* CUSTOMER LEADERBOARD */}
              <div className="lg:col-span-2">
                <div className="card h-full">
                  <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Kundöversikt - Topp 10
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-text-tertiary border-b border-border-subtle">
                          <th className="pb-3 font-medium">#</th>
                          <th className="pb-3 font-medium">Kund</th>
                          <th className="pb-3 font-medium text-center">Status</th>
                          <th className="pb-3 font-medium text-right">Chattsamtal</th>
                          <th className="pb-3 font-medium text-right">Kunskapsposter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies
                          .sort((a, b) => (b.chat_count || 0) - (a.chat_count || 0))
                          .slice(0, 10)
                          .map((company, i) => (
                            <tr key={company.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50">
                              <td className="py-3">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? 'bg-warning text-white' :
                                  i === 1 ? 'bg-text-tertiary text-white' :
                                  i === 2 ? 'bg-accent text-white' :
                                  'bg-bg-secondary text-text-secondary'
                                }`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="py-3">
                                <div>
                                  <p className="font-medium text-text-primary">{company.name}</p>
                                  <p className="text-xs text-text-tertiary">{company.id}</p>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  company.is_active
                                    ? 'bg-success/20 text-success'
                                    : 'bg-error/20 text-error'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    company.is_active ? 'bg-success' : 'bg-error'
                                  }`}></span>
                                  {company.is_active ? 'Aktiv' : 'Inaktiv'}
                                </span>
                              </td>
                              <td className="py-3 text-right font-medium text-text-primary">
                                {(company.chat_count || 0).toLocaleString()}
                              </td>
                              <td className="py-3 text-right">
                                <span className={`font-medium ${
                                  (company.knowledge_count || 0) < 5
                                    ? 'text-warning'
                                    : 'text-text-primary'
                                }`}>
                                  {(company.knowledge_count || 0).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => setActiveTab('companies')}
                    className="w-full mt-4 py-2 text-sm text-accent hover:text-accent-hover font-medium"
                  >
                    Visa alla {companies.length} kunder →
                  </button>
                </div>
              </div>
            </div>

            {/* AI INSIGHTS & LIVE ACTIVITY STREAM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* AI INSIGHTS PANEL */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 0 4h-1v1a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-4 0v-1h-2v1a2 2 0 0 1-4 0v-1H6a2 2 0 0 1-2-2v-1H3a2 2 0 0 1 0-4h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                        <circle cx="12" cy="14" r="3" />
                      </svg>
                    </div>
                    AI Insikter
                  </h2>
                  <button onClick={fetchAiInsights} className="text-sm text-accent hover:text-accent-hover">
                    Uppdatera
                  </button>
                </div>

                {insightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                  </div>
                ) : aiInsights.insights.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-success/20 rounded-full flex items-center justify-center text-success">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-text-secondary">Allt ser bra ut! Inga problem upptäckta.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {aiInsights.insights.slice(0, 5).map((insight, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        insight.severity === 'high' ? 'bg-error/10 border-error/30' :
                        insight.severity === 'medium' ? 'bg-warning/10 border-warning/30' :
                        'bg-info/10 border-info/30'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            insight.severity === 'high' ? 'bg-error text-white' :
                            insight.severity === 'medium' ? 'bg-warning text-white' :
                            'bg-info text-white'
                          }`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary text-sm">{insight.company_name}</p>
                            <p className="text-xs text-text-secondary">{insight.description}</p>
                          </div>
                          <span className="text-xs font-medium text-text-tertiary">{insight.metric}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {aiInsights.trending_topics.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <p className="text-xs text-text-tertiary mb-2">Trendande ämnen denna vecka:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.trending_topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-bg-secondary rounded-full text-xs text-text-secondary">
                          {topic.topic} <span className="text-text-tertiary">({topic.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE ACTIVITY STREAM */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    Live Aktivitet
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <button onClick={fetchActivityStream} className="text-sm text-accent hover:text-accent-hover">
                      Uppdatera
                    </button>
                  </div>
                </div>

                {activityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                  </div>
                ) : activityStream.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Ingen aktivitet ännu</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activityStream.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'conversation' ? 'bg-accent/20 text-accent' : 'bg-info/20 text-info'
                        }`}>
                          {activity.type === 'conversation' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {activity.type === 'conversation' ? (
                            <>
                              <p className="text-sm text-text-primary truncate">
                                <span className="font-medium">{activity.company_name}</span>
                                <span className="text-text-tertiary"> fick </span>
                                <span className="font-medium">{activity.message_count}</span>
                                <span className="text-text-tertiary"> {activity.message_count === 1 ? 'fråga' : 'frågor'}</span>
                              </p>
                              <p className="text-xs text-text-tertiary">{activity.category} • {activity.language}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-text-primary truncate">{activity.description}</p>
                              <p className="text-xs text-text-tertiary">av {activity.admin}</p>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-text-tertiary flex-shrink-0">
                          {new Date(activity.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* BUSINESS HEALTH INDICATORS */}
            <div className="card">
              <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Verksamhetshälsa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Kundaktivitet</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      (activeCompanies / totalCompanies) > 0.8
                        ? 'bg-success/20 text-success'
                        : (activeCompanies / totalCompanies) > 0.5
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                    }`}>
                      {Math.round((activeCompanies / totalCompanies) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-bg-tertiary rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        (activeCompanies / totalCompanies) > 0.8
                          ? 'bg-success'
                          : (activeCompanies / totalCompanies) > 0.5
                            ? 'bg-warning'
                            : 'bg-error'
                      }`}
                      style={{ width: `${(activeCompanies / totalCompanies) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">{activeCompanies} av {totalCompanies} kunder är aktiva</p>
                </div>
                <div className="p-4 rounded-lg bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Kunskapstäckning</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies > 0.7
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {Math.round((companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-bg-tertiary rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies > 0.7
                          ? 'bg-success'
                          : 'bg-warning'
                      }`}
                      style={{ width: `${(companies.filter(c => (c.knowledge_count || 0) >= 10).length / totalCompanies) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">
                    {companies.filter(c => (c.knowledge_count || 0) >= 10).length} kunder har 10+ kunskapsposter
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Genomsnitt frågor/kund</span>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-info/20 text-info">
                      {totalCompanies > 0 ? Math.round(totalChats / totalCompanies) : 0}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {companies
                      .sort((a, b) => (a.chat_count || 0) - (b.chat_count || 0))
                      .slice(0, 20)
                      .map((c, i) => {
                        const maxChats = Math.max(...companies.map(x => x.chat_count || 0)) || 1
                        const height = ((c.chat_count || 0) / maxChats) * 100
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-info/30 rounded-t"
                            style={{ height: `${Math.max(height, 10)}%` }}
                          ></div>
                        )
                      })}
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">Fördelning av chattsamtal</p>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Widgets</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Kunskapsbas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Konversationer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Användning</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Skapad</th>
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
                            <div className="flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                              </svg>
                              <span className="text-sm font-medium text-text-primary">{company.widget_count || 0}</span>
                            </div>
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
                          <td className="px-4 py-4 text-sm text-text-secondary">
                            {formatDate(company.created_at)}
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

        {/* Pricing & Revenue Tab */}
        {activeTab === 'pricing' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Prissättning & Intäkter</h1>
              <p className="text-text-secondary mt-1">Hantera prisnivåer och se intäktsöversikt</p>
            </div>

            {/* Revenue Dashboard */}
            {revenueDashboard && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <p className="text-sm text-green-700 font-medium">MRR (Månadlig)</p>
                  <p className="text-3xl font-bold text-green-800 mt-1">
                    {revenueDashboard.mrr?.toLocaleString('sv-SE')} kr
                  </p>
                  <p className="text-xs text-green-600 mt-1">{revenueDashboard.total_active_companies} aktiva företag</p>
                </div>
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">ARR (Årlig)</p>
                  <p className="text-3xl font-bold text-blue-800 mt-1">
                    {revenueDashboard.arr?.toLocaleString('sv-SE')} kr
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Prognostiserad årsintäkt</p>
                </div>
                <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <p className="text-sm text-amber-700 font-medium">Uppstartsavgifter (inbetalda)</p>
                  <p className="text-3xl font-bold text-amber-800 mt-1">
                    {revenueDashboard.startup_fees_collected?.toLocaleString('sv-SE')} kr
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Engångsintäkter</p>
                </div>
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">Ej fakturerade uppstarter</p>
                  <p className="text-3xl font-bold text-purple-800 mt-1">
                    {revenueDashboard.startup_fees_pending?.toLocaleString('sv-SE')} kr
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Att fakturera</p>
                </div>
              </div>
            )}

            {/* Pricing Tiers */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Prisnivåer</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(pricingTiers).map(([key, tier]) => (
                  <div
                    key={key}
                    className="p-5 rounded-xl border-2 border-border-subtle bg-bg-secondary"
                  >
                    <h3 className="text-lg font-bold text-text-primary">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-text-primary">{tier.monthly_fee?.toLocaleString('sv-SE')}</span>
                      <span className="text-text-secondary"> kr/mån</span>
                    </div>
                    <p className="text-sm text-text-tertiary mt-1">
                      + {tier.startup_fee?.toLocaleString('sv-SE')} kr uppstart
                    </p>
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <ul className="space-y-2">
                        {tier.features?.map((feature, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Tier stats */}
                    {revenueDashboard?.tier_breakdown?.[key] && (
                      <div className="mt-4 pt-4 border-t border-border-subtle">
                        <p className="text-xs text-text-tertiary">
                          {revenueDashboard.tier_breakdown[key].count} företag på denna nivå
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {revenueDashboard.tier_breakdown[key].mrr?.toLocaleString('sv-SE')} kr/mån
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Companies by Tier */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Företag per prisnivå</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Företag</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Prisnivå</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Månadskostnad</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Rabatt</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Uppstart betald</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Startdatum</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => {
                      const tier = pricingTiers[company.pricing_tier || 'starter'] || pricingTiers.starter
                      return (
                        <tr key={company.id} className="border-b border-border-subtle hover:bg-bg-secondary/50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-text-primary">{company.name}</div>
                            <div className="text-xs text-text-tertiary">{company.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              company.pricing_tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              company.pricing_tier === 'business' ? 'bg-blue-100 text-blue-800' :
                              company.pricing_tier === 'professional' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {tier?.name || 'Starter'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary font-medium">
                            {tier?.monthly_fee?.toLocaleString('sv-SE')} kr
                          </td>
                          <td className="px-4 py-3">
                            {company.discount_percent > 0 ? (
                              <span className="text-green-600 font-medium">
                                {company.discount_percent}%
                                {company.discount_end_date && (
                                  <span className="text-xs text-text-tertiary ml-1">
                                    (t.o.m. {company.discount_end_date})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-text-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {company.startup_fee_paid ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Ja
                              </span>
                            ) : (
                              <span className="text-amber-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Nej ({tier?.startup_fee?.toLocaleString('sv-SE')} kr)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {company.contract_start_date || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openPricingModal(company)}
                                className="btn btn-ghost text-sm"
                              >
                                Ändra nivå
                              </button>
                              <button
                                onClick={() => openDiscountModal(company)}
                                className="btn btn-ghost text-sm"
                              >
                                Rabatt
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editable Pricing Tiers */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Redigera prisnivåer</h2>
                <div className="flex gap-2">
                  {dbPricingTiers.length === 0 && (
                    <button
                      onClick={handleInitPricingTiers}
                      className="btn btn-secondary text-sm"
                    >
                      Initiera standardpriser
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPricingTierForm({ tier_key: '', name: '', monthly_fee: 0, startup_fee: 0, max_conversations: 0, features: [] })
                      setEditingPricingTier(null)
                      setShowPricingTierModal(true)
                    }}
                    className="btn btn-primary text-sm"
                  >
                    + Ny prisnivå
                  </button>
                </div>
              </div>
              {dbPricingTiers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Nyckel</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Namn</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Månadsavgift</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Uppstartsavgift</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Max konv.</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase">Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbPricingTiers.map(tier => (
                        <tr key={tier.tier_key} className="border-b border-border-subtle hover:bg-bg-secondary/50">
                          <td className="px-4 py-3 text-sm font-mono text-text-secondary">{tier.tier_key}</td>
                          <td className="px-4 py-3 text-sm font-medium text-text-primary">{tier.name}</td>
                          <td className="px-4 py-3 text-sm text-text-primary">{tier.monthly_fee?.toLocaleString('sv-SE')} kr</td>
                          <td className="px-4 py-3 text-sm text-text-primary">{tier.startup_fee?.toLocaleString('sv-SE')} kr</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{tier.max_conversations === 0 ? 'Obegränsat' : tier.max_conversations}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${tier.is_active ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}>
                              {tier.is_active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEditPricingTierModal(tier)}
                              className="btn btn-ghost text-sm"
                            >
                              Redigera
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-secondary text-center py-8">Inga prisnivåer i databasen. Klicka "Initiera standardpriser" för att komma igång.</p>
              )}
            </div>

            {/* Upcoming Features Roadmap */}
            <div className="card border-dashed border-2 border-accent/30 bg-accent/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Kommande funktioner (Roadmap)
                </h2>
                <button
                  onClick={() => {
                    setRoadmapForm({ title: '', description: '', quarter: 'Q1 2026', status: 'planned' })
                    setEditingRoadmapItem(null)
                    setShowRoadmapModal(true)
                  }}
                  className="btn btn-primary text-sm"
                >
                  + Ny punkt
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-4">Funktioner som planeras för framtida versioner</p>
              {roadmapItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmapItems.map(item => {
                    const quarterColor = item.quarter?.includes('Q1') ? 'blue' :
                                          item.quarter?.includes('Q2') ? 'green' :
                                          item.quarter?.includes('Q3') ? 'purple' :
                                          item.quarter?.includes('Backlog') ? 'amber' : 'gray'
                    const statusBadge = item.status === 'completed' ? 'bg-success-soft text-success' :
                                        item.status === 'in_progress' ? 'bg-accent-soft text-accent' :
                                        item.status === 'cancelled' ? 'bg-error-soft text-error' : ''
                    return (
                      <div key={item.id} className="p-4 bg-white rounded-lg border border-border-subtle group relative">
                        <div className="flex items-start justify-between">
                          <span className={`text-xs font-semibold text-${quarterColor}-600 bg-${quarterColor}-100 px-2 py-1 rounded`}>
                            {item.quarter}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => openEditRoadmapModal(item)}
                              className="p-1 hover:bg-bg-secondary rounded"
                              title="Redigera"
                            >
                              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRoadmapItem(item.id)}
                              className="p-1 hover:bg-error-soft rounded"
                              title="Radera"
                            >
                              <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <h4 className="font-medium text-text-primary mt-2">{item.title}</h4>
                        <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                        {item.status !== 'planned' && (
                          <span className={`mt-2 inline-flex px-2 py-0.5 text-xs rounded-full ${statusBadge}`}>
                            {item.status === 'completed' ? 'Klar' : item.status === 'in_progress' ? 'Pågående' : 'Avbruten'}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">Ingen roadmap definierad ännu.</p>
                  <button
                    onClick={() => {
                      setRoadmapForm({ title: '', description: '', quarter: 'Q1 2026', status: 'planned' })
                      setEditingRoadmapItem(null)
                      setShowRoadmapModal(true)
                    }}
                    className="btn btn-primary"
                  >
                    Lägg till första punkten
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Aktivitetslogg</h1>
              <p className="text-text-secondary mt-1">Spåra alla admin-åtgärder i systemet</p>
            </div>

            {/* Search Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  placeholder="Sök i beskrivning..."
                  className="input"
                />
                <select
                  value={auditActionType}
                  onChange={(e) => setAuditActionType(e.target.value)}
                  className="input"
                >
                  <option value="">Alla åtgärder</option>
                  {auditActionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={auditDateRange.start}
                  onChange={(e) => setAuditDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="input"
                  placeholder="Från datum"
                />
                <button
                  onClick={searchAuditLogs}
                  className="btn btn-primary"
                >
                  Sök
                </button>
              </div>
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
                    <p className="text-text-primary font-medium">Qwen 2.5 14B</p>
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analys & Prestanda</h1>
              <p className="text-text-secondary mt-1">Detaljerad statistik och trender</p>
            </div>

            {/* Trends Overview */}
            {trends && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Vecka-över-vecka</h3>
                  <div className="flex items-end gap-4">
                    <span className="text-3xl font-semibold text-text-primary">{trends.week_over_week.current}</span>
                    <span className={`text-sm font-medium ${trends.week_over_week.change_percent >= 0 ? 'text-success' : 'text-error'}`}>
                      {trends.week_over_week.change_percent >= 0 ? '+' : ''}{trends.week_over_week.change_percent}%
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">vs förra veckan ({trends.week_over_week.previous})</p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Månad-över-månad</h3>
                  <div className="flex items-end gap-4">
                    <span className="text-3xl font-semibold text-text-primary">{trends.month_over_month.current}</span>
                    <span className={`text-sm font-medium ${trends.month_over_month.change_percent >= 0 ? 'text-success' : 'text-error'}`}>
                      {trends.month_over_month.change_percent >= 0 ? '+' : ''}{trends.month_over_month.change_percent}%
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">vs förra månaden ({trends.month_over_month.previous})</p>
                </div>
              </div>
            )}

            {/* Performance Stats */}
            {performanceStats && (
              <div className="card mb-8">
                <h3 className="text-lg font-medium text-text-primary mb-4">Widgetprestanda (24h)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-2xl font-semibold text-text-primary">{performanceStats.total_requests}</p>
                    <p className="text-xs text-text-secondary">Totala förfrågningar</p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-2xl font-semibold text-success">{performanceStats.success_rate}%</p>
                    <p className="text-xs text-text-secondary">Lyckandefrekvens</p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-2xl font-semibold text-text-primary">{performanceStats.avg_response_time}ms</p>
                    <p className="text-xs text-text-secondary">Snitt svarstid</p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-2xl font-semibold text-warning">{performanceStats.rate_limited_requests}</p>
                    <p className="text-xs text-text-secondary">Rate limited</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limit Stats */}
            {rateLimitStats && (
              <div className="card mb-8">
                <h3 className="text-lg font-medium text-text-primary mb-4">Rate Limiting</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-2xl font-semibold text-text-primary">{rateLimitStats.active_sessions}</p>
                    <p className="text-xs text-text-secondary">Aktiva sessioner</p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-2xl font-semibold text-error">{rateLimitStats.rate_limited_sessions}</p>
                    <p className="text-xs text-text-secondary">Begränsade sessioner</p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="text-sm text-text-primary">{rateLimitStats.rate_limit_max_requests} förfrågningar / {rateLimitStats.rate_limit_window_seconds}s</p>
                    <p className="text-xs text-text-secondary">Begränsningsgräns</p>
                  </div>
                </div>
              </div>
            )}

            {/* Peak Hours */}
            {peakHours && peakHours.hourly_distribution.length > 0 && (
              <div className="card mb-8">
                <h3 className="text-lg font-medium text-text-primary mb-4">Aktivitet per timme</h3>
                <div className="flex items-end gap-1 h-32">
                  {peakHours.hourly_distribution.map(({ hour, count }) => {
                    const max = Math.max(...peakHours.hourly_distribution.map(h => h.count))
                    const height = max > 0 ? (count / max) * 100 : 0
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-t ${hour === parseInt(peakHours.peak_hour) ? 'bg-accent' : 'bg-accent/30'}`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-text-tertiary mt-1">{hour}</span>
                      </div>
                    )
                  })}
                </div>
                {peakHours.peak_hour && (
                  <p className="text-sm text-text-secondary mt-2">
                    Mest aktiv timme: <span className="font-medium text-accent">{peakHours.peak_hour}:00</span>
                  </p>
                )}
              </div>
            )}

            {/* Landing Page Analytics */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Landningssida Analytics</h3>
                  <p className="text-sm text-text-secondary">Besöksstatistik för din landningssida</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={landingAnalyticsDays}
                    onChange={(e) => {
                      const days = parseInt(e.target.value)
                      setLandingAnalyticsDays(days)
                      fetchLandingAnalytics(days)
                    }}
                    className="input-field text-sm py-1 px-2"
                  >
                    <option value={7}>7 dagar</option>
                    <option value={30}>30 dagar</option>
                    <option value={90}>90 dagar</option>
                    <option value={365}>1 år</option>
                  </select>
                  <button
                    onClick={() => fetchLandingAnalytics(landingAnalyticsDays)}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                    disabled={landingAnalyticsLoading}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={landingAnalyticsLoading ? 'animate-spin' : ''}>
                      <path d="M23 4v6h-6" />
                      <path d="M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                </div>
              </div>

              {landingAnalyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : landingAnalytics ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-bg-secondary rounded-lg">
                      <p className="text-2xl font-semibold text-text-primary">{landingAnalytics.total_views}</p>
                      <p className="text-xs text-text-secondary">Totala visningar</p>
                    </div>
                    <div className="p-4 bg-bg-secondary rounded-lg">
                      <p className="text-2xl font-semibold text-text-primary">{landingAnalytics.unique_visitors}</p>
                      <p className="text-xs text-text-secondary">Unika besökare</p>
                    </div>
                    <div className="p-4 bg-bg-secondary rounded-lg">
                      <p className="text-2xl font-semibold text-text-primary">{landingAnalytics.avg_time_on_page}s</p>
                      <p className="text-xs text-text-secondary">Snitt tid på sidan</p>
                    </div>
                    <div className="p-4 bg-bg-secondary rounded-lg">
                      <p className={`text-2xl font-semibold ${landingAnalytics.bounce_rate > 70 ? 'text-error' : landingAnalytics.bounce_rate > 50 ? 'text-warning' : 'text-success'}`}>
                        {landingAnalytics.bounce_rate}%
                      </p>
                      <p className="text-xs text-text-secondary">Bounce rate</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-accent-soft rounded-lg text-center">
                      <p className="text-xl font-semibold text-accent">{landingAnalytics.views_today}</p>
                      <p className="text-xs text-text-secondary">Idag</p>
                    </div>
                    <div className="p-3 bg-success-soft rounded-lg text-center">
                      <p className="text-xl font-semibold text-success">{landingAnalytics.views_this_week}</p>
                      <p className="text-xs text-text-secondary">Denna vecka</p>
                    </div>
                    <div className="p-3 bg-warning-soft rounded-lg text-center">
                      <p className="text-xl font-semibold text-warning">{landingAnalytics.views_this_month}</p>
                      <p className="text-xs text-text-secondary">Perioden</p>
                    </div>
                  </div>

                  {/* Daily Trend Chart */}
                  {landingAnalytics.daily_trend && landingAnalytics.daily_trend.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-3">Daglig trend</h4>
                      <div className="flex items-end gap-1 h-24">
                        {landingAnalytics.daily_trend.slice(-14).map((day, i) => {
                          const max = Math.max(...landingAnalytics.daily_trend.map(d => d.views))
                          const height = max > 0 ? (day.views / max) * 100 : 0
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                              <div className="relative w-full">
                                <div
                                  className="w-full bg-accent/30 hover:bg-accent transition-colors rounded-t cursor-pointer"
                                  style={{ height: `${Math.max(height, 2)}px` }}
                                />
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-bg-elevated rounded shadow-lg text-xs whitespace-nowrap z-10">
                                  {day.date}: {day.views} visningar
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Device Breakdown */}
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-3">Enheter</h4>
                      <div className="space-y-2">
                        {Object.entries(landingAnalytics.device_breakdown || {}).map(([device, count]) => {
                          const total = Object.values(landingAnalytics.device_breakdown).reduce((a, b) => a + b, 0)
                          const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                          return (
                            <div key={device} className="flex items-center gap-3">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                                {device === 'desktop' ? (
                                  <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>
                                ) : device === 'mobile' ? (
                                  <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>
                                ) : (
                                  <><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>
                                )}
                              </svg>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-text-primary capitalize">{device}</span>
                                  <span className="text-xs text-text-tertiary">{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                  <div className="h-full bg-accent rounded-full" style={{ width: `${percentage}%` }} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Top Referrers */}
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-3">Trafikkällor</h4>
                      {landingAnalytics.top_referrers && landingAnalytics.top_referrers.length > 0 ? (
                        <div className="space-y-2">
                          {landingAnalytics.top_referrers.slice(0, 5).map((ref, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-bg-secondary rounded">
                              <span className="text-sm text-text-primary truncate flex-1">{ref.source}</span>
                              <span className="text-xs text-text-tertiary ml-2">{ref.count}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-tertiary text-center py-4">Ingen data ännu</p>
                      )}
                    </div>
                  </div>

                  {/* Campaigns */}
                  {landingAnalytics.top_campaigns && landingAnalytics.top_campaigns.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-3">Kampanjer (UTM)</h4>
                      <div className="flex flex-wrap gap-2">
                        {landingAnalytics.top_campaigns.map((camp, i) => (
                          <span key={i} className="px-3 py-1 bg-accent-soft text-accent text-sm rounded-full">
                            {camp.campaign} ({camp.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking Script Info */}
                  <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle">
                    <h4 className="text-sm font-medium text-text-primary mb-2">Spårningskod för landningssidan</h4>
                    <p className="text-xs text-text-secondary mb-3">Lägg till följande kod på din landningssida för att spåra besök:</p>
                    <div className="bg-bg-primary rounded p-3 font-mono text-xs text-text-secondary overflow-x-auto">
                      <code>{`<script>window.BOBOT_TRACKING_URL='${window.location.origin}';</script>`}</code>
                      <br />
                      <code>{`<script src="${window.location.origin}/api/track/script.js"></script>`}</code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-text-tertiary mb-3">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                  <p className="text-text-secondary">Ingen data ännu</p>
                  <p className="text-sm text-text-tertiary mt-1">Lägg till spårningskoden på din landningssida för att börja samla in data</p>
                </div>
              )}
            </div>

            {/* Top Companies */}
            {topCompanies.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-medium text-text-primary mb-4">Mest aktiva företag (30 dagar)</h3>
                <div className="space-y-3">
                  {topCompanies.map((company, index) => (
                    <div key={company.company_id} className="flex items-center gap-4 p-3 bg-bg-secondary rounded-lg">
                      <span className="w-6 h-6 flex items-center justify-center bg-accent-soft rounded text-accent text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{company.company_name}</p>
                        <p className="text-xs text-text-secondary">{company.company_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-text-primary">{company.conversations}</p>
                        <p className="text-xs text-text-tertiary">konversationer</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Fakturering</h1>
              <p className="text-text-secondary mt-1">Hantera prenumerationer och fakturor</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscriptions */}
              <div className="card">
                <h3 className="text-lg font-medium text-text-primary mb-4">Prenumerationer</h3>
                {subscriptions.length === 0 ? (
                  <p className="text-text-secondary text-center py-8">Inga prenumerationer ännu</p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map(sub => (
                      <div key={sub.id} className="p-4 bg-bg-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text-primary">{sub.company_name}</p>
                            <p className="text-xs text-text-secondary">{sub.company_id}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            sub.plan_name === 'enterprise' ? 'bg-accent-soft text-accent' :
                            sub.plan_name === 'professional' ? 'bg-success-soft text-success' :
                            sub.plan_name === 'starter' ? 'bg-warning-soft text-warning' :
                            'bg-bg-primary text-text-secondary'
                          }`}>
                            {sub.plan_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-text-secondary">{sub.plan_price} SEK/{sub.billing_cycle === 'monthly' ? 'mån' : 'år'}</span>
                          <span className={`text-xs ${sub.status === 'active' ? 'text-success' : 'text-warning'}`}>
                            {sub.status === 'active' ? 'Aktiv' : sub.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Invoices */}
              <div className="card">
                <h3 className="text-lg font-medium text-text-primary mb-4">Senaste fakturor</h3>
                {invoices.length === 0 ? (
                  <p className="text-text-secondary text-center py-8">Inga fakturor ännu</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map(inv => (
                      <div key={inv.id} className="p-4 bg-bg-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text-primary">{inv.invoice_number}</p>
                            <p className="text-xs text-text-secondary">{inv.company_name}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            inv.status === 'paid' ? 'bg-success-soft text-success' :
                            inv.status === 'pending' ? 'bg-warning-soft text-warning' :
                            'bg-error-soft text-error'
                          }`}>
                            {inv.status === 'paid' ? 'Betald' : inv.status === 'pending' ? 'Väntar' : inv.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-medium text-text-primary">{inv.amount} {inv.currency}</span>
                          <span className="text-xs text-text-tertiary">{new Date(inv.created_at).toLocaleDateString('sv-SE')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Kontoinställningar</h1>
              <p className="text-text-secondary mt-1">Hantera ditt adminkonto</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appearance */}
              <div className="card">
                <h3 className="text-lg font-medium text-text-primary mb-4">Utseende</h3>
                <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">Mörkt läge</p>
                    <p className="text-sm text-text-secondary">Använd mörkt tema i admingränssnittet</p>
                  </div>
                  <button
                    onClick={handleToggleDarkMode}
                    className={`w-12 h-6 rounded-full transition-colors ${adminPrefs.dark_mode ? 'bg-accent' : 'bg-bg-primary'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${adminPrefs.dark_mode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* Security */}
              <div className="card">
                <h3 className="text-lg font-medium text-text-primary mb-4">Säkerhet</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">Tvåfaktorsautentisering</p>
                      <p className="text-sm text-text-secondary">Extra säkerhet för ditt konto</p>
                    </div>
                    {adminPrefs.totp_enabled ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-soft text-success">Aktiverad</span>
                    ) : (
                      <button
                        onClick={handleSetup2FA}
                        className="btn btn-secondary text-sm"
                      >
                        Aktivera
                      </button>
                    )}
                  </div>

                  <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="font-medium text-text-primary mb-2">Inloggad som</p>
                    <p className="text-sm text-text-secondary">{adminAuth.username}</p>
                  </div>
                </div>
              </div>

              {/* Bulk Operations */}
              <div className="card lg:col-span-2">
                <h3 className="text-lg font-medium text-text-primary mb-4">Massoperationer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleExportCompanies}
                    className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary hover:bg-bg-primary transition-all"
                  >
                    <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-accent">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary">Exportera företag</p>
                      <p className="text-sm text-text-secondary">Ladda ner CSV med alla företag</p>
                    </div>
                  </button>

                  {selectedCompanies.size > 0 && (
                    <div className="p-4 bg-accent-soft rounded-lg">
                      <p className="font-medium text-accent mb-2">{selectedCompanies.size} företag valda</p>
                      <button
                        onClick={() => handleBulkSetLimits({ max_conversations_month: 500 })}
                        className="btn btn-primary text-sm"
                      >
                        Sätt gränser för alla
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Hub Tab */}
        {activeTab === 'docs' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dokumentation</h1>
              <p className="text-text-secondary mt-1">Hur Bobot fungerar - allt du behöver veta</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Architecture Overview */}
              <div className="lg:col-span-2 card">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  Systemarkitektur
                </h2>
                <div className="bg-bg-secondary rounded-xl p-6">
                  <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre font-mono">
{`┌─────────────────────────────────────────────────────────────────────┐
│                     KUNDENS HEMSIDA                                  │
│  ┌──────────────┐                                                   │
│  │ Chattwidget  │ ◀── Inbäddningsbar React-komponent               │
│  └──────┬───────┘                                                   │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin-panel    │────▶│  FastAPI Backend│────▶│     Ollama      │
│  (React)        │     │   (Python)      │     │ (Qwen 2.5 14B)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   SQLite DB     │
                        │  (Multi-tenant) │
                        └─────────────────┘`}
                  </pre>
                </div>
              </div>

              {/* Quick Reference */}
              <div className="card">
                <h2 className="text-lg font-bold text-text-primary mb-4">Snabbreferens</h2>
                <div className="space-y-4">
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <p className="font-medium text-text-primary text-sm">Portar</p>
                    <div className="mt-2 space-y-1 text-xs text-text-secondary">
                      <p>Backend API: <code className="px-1 py-0.5 bg-bg-tertiary rounded">8000</code></p>
                      <p>Admin Panel: <code className="px-1 py-0.5 bg-bg-tertiary rounded">3000</code></p>
                      <p>Widget Demo: <code className="px-1 py-0.5 bg-bg-tertiary rounded">3001</code></p>
                      <p>Ollama: <code className="px-1 py-0.5 bg-bg-tertiary rounded">11434</code></p>
                    </div>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <p className="font-medium text-text-primary text-sm">Standardkonton</p>
                    <div className="mt-2 space-y-1 text-xs text-text-secondary">
                      <p>Demo: <code className="px-1 py-0.5 bg-bg-tertiary rounded">demo / demo123</code></p>
                      <p>Admin: <code className="px-1 py-0.5 bg-bg-tertiary rounded">admin / admin123</code></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Runbooks */}
              <div className="lg:col-span-3 card">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  Guider & Felsökning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-bg-secondary rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Ny kund - Onboarding</h3>
                    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                      <li>Skapa företag (Företag → Lägg till)</li>
                      <li>Konfigurera widgeten (utseende, meddelanden)</li>
                      <li>Lägg till kunskapsbas (minst 10-20 frågor)</li>
                      <li>Ge kunden inbäddningskoden</li>
                      <li>Testa med live preview</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">AI svarar inte</h3>
                    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                      <li>Kontrollera Ollama-status (System → Systemhälsa)</li>
                      <li>Verifiera att modellen är laddad</li>
                      <li>Kontrollera Docker-loggar: <code className="text-xs">docker logs bobot-ollama-1</code></li>
                      <li>Starta om Ollama: <code className="text-xs">docker restart bobot-ollama-1</code></li>
                    </ol>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">GDPR-hantering</h3>
                    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                      <li>Ställ in retention (Inställningar → GDPR)</li>
                      <li>Automatisk rensning körs varje timme</li>
                      <li>Manuell rensning: Översikt → GDPR-rensning</li>
                      <li>Statistik behålls anonymiserat</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Hög obesvarad-andel</h3>
                    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                      <li>Granska "Obesvarade frågor" i Analytics</li>
                      <li>Lägg till vanliga frågor i kunskapsbasen</li>
                      <li>Förbättra befintliga svar med nyckelord</li>
                      <li>Aktivera notifieringar för obesvarade</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Widget visas inte</h3>
                    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                      <li>Kontrollera att företaget är aktivt</li>
                      <li>Verifiera company_id i embed-koden</li>
                      <li>Kolla CORS-inställningar (backend)</li>
                      <li>Kontrollera webbläsarkonsolen för fel</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Databashantering</h3>
                    <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                      <li>Backup: <code className="text-xs">cp bobot.db bobot.backup.db</code></li>
                      <li>Storlek visas i System → Systemhälsa</li>
                      <li>Reset: <code className="text-xs">rm bobot.db && restart</code></li>
                      <li>Migration: Använd Alembic (produktion)</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Security & Production */}
              <div className="lg:col-span-3 card border-green-200 bg-green-50/30">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Säkerhet & Produktion
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-success-soft text-success rounded-full">Produktionsklar</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-bg-secondary rounded-xl border border-success/30">
                    <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <span className="text-success">✓</span> Autentisering
                    </h3>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• bcrypt lösenordshashning</li>
                      <li>• 2FA för Super Admin</li>
                      <li>• Brute force-skydd</li>
                      <li>• JWT med 24h livstid</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl border border-success/30">
                    <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <span className="text-success">✓</span> Rate Limiting
                    </h3>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Chat: 15 req/min</li>
                      <li>• Admin API: 30 req/min</li>
                      <li>• Login: 5 försök/15 min</li>
                      <li>• Auto-lockout 15 min</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl border border-success/30">
                    <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <span className="text-success">✓</span> Security Headers
                    </h3>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• HSTS (produktion)</li>
                      <li>• CSP konfigurerad</li>
                      <li>• X-Frame-Options</li>
                      <li>• XSS-Protection</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-xl border border-success/30">
                    <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <span className="text-success">✓</span> Produktionskrav
                    </h3>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Sätt ENVIRONMENT=production</li>
                      <li>• Generera SECRET_KEY</li>
                      <li>• Konfigurera CORS_ORIGINS</li>
                      <li>• Aktivera HTTPS</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Create Announcement */}
              <div className="lg:col-span-3 card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Skicka meddelande till alla kunder
                  </h2>
                  <button
                    onClick={() => setShowAnnouncementModal(true)}
                    className="btn btn-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nytt meddelande
                  </button>
                </div>
                <p className="text-sm text-text-secondary">
                  Skapa ett meddelande som visas för alla företagsadministratörer i deras dashboard.
                  Användbart för systemunderhåll, nya funktioner eller viktiga uppdateringar.
                </p>
                {announcement && (
                  <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm text-text-tertiary mb-1">Aktivt meddelande:</p>
                    <p className="font-medium text-text-primary">{announcement.title}</p>
                    <p className="text-sm text-text-secondary">{announcement.message}</p>
                  </div>
                )}
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

                {/* Widgets Section */}
                {companyWidgets.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                      </svg>
                      Widgets ({companyWidgets.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {companyWidgets.map((widget) => (
                        <div key={widget.id} className="bg-bg-secondary rounded-xl p-4 flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: widget.primary_color || '#D97757' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{widget.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                widget.widget_type === 'external' ? 'bg-blue-100 text-blue-700' :
                                widget.widget_type === 'internal' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {widget.widget_type === 'external' ? 'Extern' :
                                 widget.widget_type === 'internal' ? 'Intern' : 'Anpassad'}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs ${
                                widget.is_active ? 'text-success' : 'text-error'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  widget.is_active ? 'bg-success' : 'bg-error'
                                }`} />
                                {widget.is_active ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-text-tertiary font-mono truncate max-w-[100px]" title={widget.widget_key}>
                              {widget.widget_key?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Self-Hosting Section */}
                {selfHostingStatus && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
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
                    onClick={() => { setShowCompanyDashboard(null); openProposalModal(showCompanyDashboard) }}
                    className="btn btn-secondary"
                    style={{ background: 'linear-gradient(135deg, #C4633A 0%, #A85230 100%)', borderColor: '#C4633A', color: 'white' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Skapa offert
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

              {/* Hosting Option */}
              <div>
                <label className="input-label">Hosting-alternativ</label>
                <select
                  value={proposalForm.hostingOption}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, hostingOption: e.target.value }))}
                  className="input"
                >
                  <option value="cloud">Bobot Cloud (hanterad)</option>
                  <option value="selfhosted">Självhostad</option>
                </select>
              </div>

              {/* Pricing Info */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#FDF6F0', border: '1px solid #E8A87C' }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: '#3D2B24' }}>Prissättning som inkluderas</h3>
                <div className="space-y-1 text-sm" style={{ color: '#6B5248' }}>
                  <div className="flex justify-between">
                    <span>Prisnivå:</span>
                    <span className="font-medium">{showProposalModal.pricing_tier || 'Starter'}</span>
                  </div>
                  {showProposalModal.discount_percent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Rabatt:</span>
                      <span className="font-medium">-{showProposalModal.discount_percent}%</span>
                    </div>
                  )}
                </div>
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
                    onClick={() => { setCommandPaletteOpen(false); setActiveTab('companies'); setShowCreateModal(true); }}
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
              <p className="text-text-secondary text-sm mt-1">Meddelandet visas för alla administratörer som loggar in</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Typ</label>
                <select
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input w-full"
                >
                  <option value="info">Information</option>
                  <option value="warning">Varning</option>
                  <option value="success">Framgång</option>
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
                onClick={() => { setShowAnnouncementModal(false); setAnnouncementForm({ title: '', message: '', type: 'info' }); }}
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
