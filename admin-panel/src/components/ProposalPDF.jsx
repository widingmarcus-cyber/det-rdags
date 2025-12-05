import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf
} from '@react-pdf/renderer'

// Register fonts (using system fonts)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 },
  ]
})

// Warm Terracotta Design System
const colors = {
  primary: '#C4633A',      // Terracotta
  background: '#FDF6F0',   // Warm cream
  text: '#3D2B24',         // Deep brown
  textLight: '#6B5248',    // Lighter brown
  accent: '#E8A87C',       // Soft clay
  white: '#FFFFFF',
  border: '#E5D5CA',       // Warm border
  success: '#5D8A66',      // Muted green
}

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    padding: 50,
    fontFamily: 'Inter',
  },
  // Cover Page
  coverPage: {
    backgroundColor: colors.background,
    padding: 0,
    fontFamily: 'Inter',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 80,
    textAlign: 'center',
  },
  coverYear: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 20,
  },
  coverCustomer: {
    fontSize: 24,
    fontWeight: 600,
    color: colors.primary,
    textAlign: 'center',
    padding: 20,
    borderTop: `2px solid ${colors.accent}`,
    borderBottom: `2px solid ${colors.accent}`,
    marginTop: 40,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 12,
    color: colors.textLight,
  },

  // Content Pages
  pageHeader: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: `2px solid ${colors.primary}`,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.primary,
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 5,
  },

  // Section styling
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paragraph: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.6,
    marginBottom: 8,
  },

  // Feature boxes
  featureContainer: {
    marginTop: 15,
  },
  featureBox: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
    borderLeft: `4px solid ${colors.primary}`,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: 1.5,
  },

  // Timeline table
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginBottom: 2,
  },
  tableHeaderCell: {
    padding: 12,
    fontSize: 10,
    fontWeight: 600,
    color: colors.white,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.border}`,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#FAF5F0',
    borderBottom: `1px solid ${colors.border}`,
  },
  tableCell: {
    padding: 12,
    fontSize: 10,
    color: colors.text,
  },
  tableCellWeek: {
    width: '15%',
    fontWeight: 600,
    color: colors.primary,
  },
  tableCellActivity: {
    width: '55%',
  },
  tableCellResponsible: {
    width: '30%',
    color: colors.textLight,
  },

  // Pricing
  priceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 25,
    marginBottom: 20,
    border: `2px solid ${colors.accent}`,
  },
  priceCardHighlight: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 25,
    marginBottom: 20,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  priceTitleLight: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.white,
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.primary,
  },
  priceAmountLight: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.white,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 5,
  },
  priceUnitLight: {
    fontSize: 14,
    color: colors.accent,
    marginLeft: 5,
  },
  priceDescription: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 10,
    lineHeight: 1.5,
  },
  priceDescriptionLight: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 10,
    lineHeight: 1.5,
  },
  discountBadge: {
    backgroundColor: colors.success,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.white,
  },

  // List items
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  listBullet: {
    width: 20,
    fontSize: 10,
    color: colors.primary,
    fontWeight: 600,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },

  // Requirements box
  requirementsBox: {
    backgroundColor: '#FEF3E8',
    borderRadius: 8,
    padding: 18,
    marginTop: 20,
    borderLeft: `4px solid ${colors.accent}`,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 10,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: colors.textLight,
  },
  pageNumber: {
    fontSize: 9,
    color: colors.textLight,
  },

  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },

  // Process steps
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 3,
  },
  stepDescription: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: 1.4,
  },

  // Hosting options
  hostingOption: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeft: `4px solid ${colors.accent}`,
  },
  hostingTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 5,
  },
  hostingPrice: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: 600,
  },
  hostingDescription: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 5,
    lineHeight: 1.4,
  },

  // Contact section
  contactBox: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 20,
    marginTop: 30,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.white,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 10,
    color: colors.accent,
    lineHeight: 1.5,
  },
})

// Page Footer Component
const PageFooter = ({ pageNumber, totalPages }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>Bobot AB | www.bobot.nu | hej@bobot.nu</Text>
    <Text style={styles.pageNumber}>Sida {pageNumber} av {totalPages}</Text>
  </View>
)

// Cover Page
const CoverPage = ({ customerName, contactPerson, year }) => (
  <Page size="A4" style={styles.coverPage}>
    <View style={styles.coverContent}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>BOBOT</Text>
        <Text style={styles.logoSubtext}>AI-driven kundtjänst</Text>
      </View>

      {/* Title */}
      <Text style={styles.coverTitle}>Trial - AI Chatbot</Text>
      <Text style={styles.coverSubtitle}>Förslag och villkor för provperiod</Text>

      {/* Year */}
      <Text style={styles.coverYear}>{year}</Text>

      {/* Customer */}
      <View style={{ marginTop: 40 }}>
        <Text style={styles.coverCustomer}>{customerName}</Text>
        {contactPerson && (
          <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 12 }}>
            Kontaktperson: {contactPerson}
          </Text>
        )}
      </View>
    </View>

    <View style={styles.coverFooter}>
      <Text style={styles.coverDate}>
        Dokumentdatum: {new Date().toLocaleDateString('sv-SE')}
      </Text>
    </View>
  </Page>
)

// Features Page
const FeaturesPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>Funktioner & Fördelar</Text>
      <Text style={styles.pageSubtitle}>Vad Bobot erbjuder er organisation</Text>
    </View>

    <View style={styles.featureContainer}>
      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Säkerhet & Compliance</Text>
        <Text style={styles.featureDescription}>
          On-premise/självhostad installation möjlig. Fullt GDPR-kompatibelt med automatisk dataradering.
          Ni behåller full kontroll över er data. Inga externa API-anrop krävs - allt körs lokalt.
        </Text>
      </View>

      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Dual Bot-lösning</Text>
        <Text style={styles.featureDescription}>
          Extern bot för hyresgäster/kunder med publikt tillgänglig FAQ och serviceinformation.
          Intern bot för anställda med känslig dokumentation, policyer och arbetsrutiner.
          Separata kunskapsbaser med individuell åtkomstkontroll.
        </Text>
      </View>

      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Kontroll & Flexibilitet</Text>
        <Text style={styles.featureDescription}>
          Egen kunskapsbas som ni själva uppdaterar. Omedelbara uppdateringar utan väntetid.
          Anpassningsbar ton och stil. Välj exakt vad boten ska kunna svara på.
          Kategorisering för enkel organisation av innehåll.
        </Text>
      </View>

      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Kostnadseffektivitet</Text>
        <Text style={styles.featureDescription}>
          Förutsägbar prissättning utan dolda kostnader. 24/7 tillgänglighet utan bemanningskrav.
          Minskar belastning på kundtjänst och support. Skalar automatiskt vid hög belastning.
        </Text>
      </View>

      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Integration & Kompatibilitet</Text>
        <Text style={styles.featureDescription}>
          Enkel inbäddning via JavaScript-widget på valfri hemsida. Fungerar med WordPress,
          egenutvecklade system och moderna webbramverk. Importera befintliga FAQ från Excel,
          Word eller CSV. Stöd för svenska, engelska och arabiska.
        </Text>
      </View>
    </View>

    <PageFooter pageNumber={2} totalPages={5} />
  </Page>
)

// Trial Details Page
const TrialDetailsPage = ({ startDate, hostingOption }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>Provperiod</Text>
      <Text style={styles.pageSubtitle}>Villkor och process för trial</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trial-period: 4 veckor</Text>
      <Text style={styles.paragraph}>
        Under provperioden får ni full tillgång till Bobot-plattformen med alla funktioner.
        Ni kan testa både extern och intern bot, bygga kunskapsbas och låta användare
        interagera med systemet i en verklig miljö.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Process</Text>

      <View style={styles.processStep}>
        <Text style={styles.stepNumber}>1</Text>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Avtal & Uppstartsavgift</Text>
          <Text style={styles.stepDescription}>
            Signera trial-avtal och betala engångsavgift för uppstart.
          </Text>
        </View>
      </View>

      <View style={styles.processStep}>
        <Text style={styles.stepNumber}>2</Text>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Leverans av kod/credentials</Text>
          <Text style={styles.stepDescription}>
            Ni får tillgång till admin-panel och widget-kod för implementering.
          </Text>
        </View>
      </View>

      <View style={styles.processStep}>
        <Text style={styles.stepNumber}>3</Text>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Implementering & Kunskapsbas</Text>
          <Text style={styles.stepDescription}>
            Implementera widget på er hemsida och bygg upp kunskapsbasen med FAQ.
          </Text>
        </View>
      </View>

      <View style={styles.processStep}>
        <Text style={styles.stepNumber}>4</Text>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Intern testning</Text>
          <Text style={styles.stepDescription}>
            Testa chattboten internt innan ni går live mot slutanvändare.
          </Text>
        </View>
      </View>

      <View style={styles.processStep}>
        <Text style={styles.stepNumber}>5</Text>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Go live & Utvärdering</Text>
          <Text style={styles.stepDescription}>
            Lansera för slutanvändare och utvärdera resultat under provperioden.
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.twoColumn}>
      <View style={styles.column}>
        <View style={styles.hostingOption}>
          <Text style={styles.hostingTitle}>Bobot-hostad</Text>
          <Text style={styles.hostingDescription}>
            Vi sköter all infrastruktur. Snabbaste sättet att komma igång.
            Automatiska uppdateringar och underhåll ingår.
          </Text>
        </View>
      </View>
      <View style={styles.column}>
        <View style={styles.hostingOption}>
          <Text style={styles.hostingTitle}>Självhostad</Text>
          <Text style={styles.hostingDescription}>
            Installera på egen server/infrastruktur. Full kontroll över data
            och miljö. Kräver teknisk kompetens för drift.
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.requirementsBox}>
      <Text style={styles.requirementsTitle}>Krav för uppstart</Text>
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listText}>Signerat trial-avtal</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listText}>Betald uppstartsavgift</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listText}>Kunden tillhandahåller FAQ/kunskapsinnehåll</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listText}>Kontaktperson med teknisk behörighet för implementering</Text>
      </View>
    </View>

    <PageFooter pageNumber={3} totalPages={5} />
  </Page>
)

// Timeline Page
const TimelinePage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>Tidplan</Text>
      <Text style={styles.pageSubtitle}>Aktiviteter under 4-veckors trial</Text>
    </View>

    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Vecka</Text>
        <Text style={[styles.tableHeaderCell, { width: '55%' }]}>Aktivitet</Text>
        <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Ansvarig</Text>
      </View>

      {/* Row 1 */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableCellWeek]}>1</Text>
        <Text style={[styles.tableCell, styles.tableCellActivity]}>Avtal signeras + uppstartsavgift betalas</Text>
        <Text style={[styles.tableCell, styles.tableCellResponsible]}>Kund</Text>
      </View>

      {/* Row 2 */}
      <View style={styles.tableRowAlt}>
        <Text style={[styles.tableCell, styles.tableCellWeek]}>1</Text>
        <Text style={[styles.tableCell, styles.tableCellActivity]}>Leverans av kod och inloggningsuppgifter</Text>
        <Text style={[styles.tableCell, styles.tableCellResponsible]}>Bobot</Text>
      </View>

      {/* Row 3 */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableCellWeek]}>1-2</Text>
        <Text style={[styles.tableCell, styles.tableCellActivity]}>Implementering på hemsida + uppsättning av kunskapsbas</Text>
        <Text style={[styles.tableCell, styles.tableCellResponsible]}>Kund + Bobot</Text>
      </View>

      {/* Row 4 */}
      <View style={styles.tableRowAlt}>
        <Text style={[styles.tableCell, styles.tableCellWeek]}>2</Text>
        <Text style={[styles.tableCell, styles.tableCellActivity]}>Intern testning och finjustering</Text>
        <Text style={[styles.tableCell, styles.tableCellResponsible]}>Kund</Text>
      </View>

      {/* Row 5 */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableCellWeek]}>3-4</Text>
        <Text style={[styles.tableCell, styles.tableCellActivity]}>Live-test med riktiga användare</Text>
        <Text style={[styles.tableCell, styles.tableCellResponsible]}>Kund</Text>
      </View>

      {/* Row 6 */}
      <View style={styles.tableRowAlt}>
        <Text style={[styles.tableCell, styles.tableCellWeek]}>4</Text>
        <Text style={[styles.tableCell, styles.tableCellActivity]}>Utvärdering och beslut om fortsättning</Text>
        <Text style={[styles.tableCell, styles.tableCellResponsible]}>Kund</Text>
      </View>
    </View>

    <View style={{ marginTop: 30 }}>
      <Text style={styles.sectionTitle}>Support under trial</Text>
      <Text style={styles.paragraph}>
        Under hela provperioden har ni tillgång till support via e-post. Vi hjälper till med
        tekniska frågor, kunskapsbasuppsättning och optimering av bot-svar. En dedikerad
        kontaktperson tilldelas för er trial.
      </Text>
    </View>

    <View style={styles.requirementsBox}>
      <Text style={styles.requirementsTitle}>Efter trial</Text>
      <Text style={styles.paragraph}>
        Vid avslut av provperioden väljer ni att antingen fortsätta med en prenumeration
        eller avsluta samarbetet. Vid fortsättning behålls all data och konfiguration.
        Vid avslut raderas all data inom 30 dagar enligt GDPR.
      </Text>
    </View>

    <PageFooter pageNumber={4} totalPages={5} />
  </Page>
)

// Pricing Page
const PricingPage = ({ startupFee, monthlyFee, tier, discount, conversationLimit }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>Prissättning</Text>
      <Text style={styles.pageSubtitle}>Kostnader för trial och fortsatt användning</Text>
    </View>

    {/* Startup Fee */}
    <View style={styles.priceCardHighlight}>
      <Text style={styles.priceTitleLight}>Uppstartsavgift (engångskostnad)</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={styles.priceAmountLight}>{startupFee?.toLocaleString('sv-SE') || '4 900'}</Text>
        <Text style={styles.priceUnitLight}> kr</Text>
      </View>
      <Text style={styles.priceDescriptionLight}>
        Inkluderar initial uppsättning, onboarding, teknisk support under trial-perioden
        och konfiguration av er första chattbot.
      </Text>
    </View>

    {/* Monthly Fee */}
    <View style={styles.priceCard}>
      <Text style={styles.priceTitle}>Månadskostnad efter trial ({tier || 'Starter'})</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={styles.priceAmount}>{monthlyFee?.toLocaleString('sv-SE') || '990'}</Text>
        <Text style={styles.priceUnit}> kr/mån</Text>
      </View>
      <Text style={styles.priceDescription}>
        {conversationLimit ? `Upp till ${conversationLimit.toLocaleString('sv-SE')} konversationer per månad ingår.` : 'Obegränsat antal konversationer ingår.'}{' '}
        Inkluderar tillgång till admin-panel, statistik, och kontinuerliga uppdateringar.
      </Text>
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% rabatt aktiv</Text>
        </View>
      )}
    </View>

    {/* Hosting Options */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Hosting-alternativ</Text>
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <View style={styles.hostingOption}>
            <Text style={styles.hostingTitle}>Bobot Cloud</Text>
            <Text style={styles.hostingPrice}>Ingår i månadspris</Text>
            <Text style={styles.hostingDescription}>
              Fullt hanterad lösning. Vi sköter drift, säkerhet och uppdateringar.
              99.9% upptidsgaranti.
            </Text>
          </View>
        </View>
        <View style={styles.column}>
          <View style={styles.hostingOption}>
            <Text style={styles.hostingTitle}>Self-hosted</Text>
            <Text style={styles.hostingPrice}>Reducerat månadspris</Text>
            <Text style={styles.hostingDescription}>
              Installera på egen infrastruktur. Kräver Docker.
              Teknisk support tillkommer vid behov.
            </Text>
          </View>
        </View>
      </View>
    </View>

    {/* What's included */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vad ingår</Text>
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>Obegränsade kunskapsposter</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>Multi-språkstöd (SV/EN/AR)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>Anpassningsbar widget-design</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>Konversationshistorik</Text>
          </View>
        </View>
        <View style={styles.column}>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>Detaljerad statistik</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>GDPR-verktyg</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>E-post support</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>✓</Text>
            <Text style={styles.listText}>Kontinuerliga uppdateringar</Text>
          </View>
        </View>
      </View>
    </View>

    {/* Contact */}
    <View style={styles.contactBox}>
      <Text style={styles.contactTitle}>Nästa steg</Text>
      <Text style={styles.contactText}>
        Kontakta oss för att påbörja er trial eller om ni har frågor om offerten.{'\n'}
        E-post: hej@bobot.nu | Webb: www.bobot.nu
      </Text>
    </View>

    <PageFooter pageNumber={5} totalPages={5} />
  </Page>
)

// Main Document Component
const ProposalDocument = ({
  customerName,
  contactPerson,
  startDate,
  startupFee,
  monthlyFee,
  tier,
  discount,
  conversationLimit,
  hostingOption
}) => {
  const year = new Date().getFullYear()

  return (
    <Document>
      <CoverPage
        customerName={customerName}
        contactPerson={contactPerson}
        year={year}
      />
      <FeaturesPage />
      <TrialDetailsPage
        startDate={startDate}
        hostingOption={hostingOption}
      />
      <TimelinePage />
      <PricingPage
        startupFee={startupFee}
        monthlyFee={monthlyFee}
        tier={tier}
        discount={discount}
        conversationLimit={conversationLimit}
      />
    </Document>
  )
}

// Export PDF generation function
export const generateProposalPDF = async (props) => {
  const blob = await pdf(<ProposalDocument {...props} />).toBlob()
  return blob
}

// Export download function
export const downloadProposalPDF = async (props) => {
  const blob = await generateProposalPDF(props)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileName = `${props.customerName.replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, '_')}_Bobot_Proposal.pdf`
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return fileName
}

export default ProposalDocument
