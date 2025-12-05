import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Svg,
  Path,
  Circle,
  Rect,
  G,
  Ellipse
} from '@react-pdf/renderer'

// Register Playfair Display - Serif for "Human Voice" headlines
// Using jsDelivr/fontsource CDN for reliable font loading with react-pdf
Font.register({
  family: 'Playfair',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf', fontWeight: 700 },
  ]
})

// Register Inter - Sans-serif for body text
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 },
  ]
})

// Refined, Elegant, Professional Color Palette
const colors = {
  primary: '#D97757',        // Terracotta - warm accent
  background: '#F8FAFC',     // Clean slate - professional
  text: '#1E293B',           // Slate-900 - deep and readable
  textLight: '#64748B',      // Slate-500 - secondary text
  accent: '#10B981',         // Emerald - success/growth
  white: '#FFFFFF',
  cardShadow: 'rgba(15, 23, 42, 0.04)', // Subtle shadow
  heroBackground: '#F1F5F9', // Slate-100 - elegant hero
  border: '#E2E8F0',         // Slate-200 - clean dividers
  slateLight: '#F1F5F9',     // For subtle backgrounds
}

// Bobot Mascot Component (SVG) - Matching landing page design
const BobotMascot = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    {/* Feet */}
    <Rect x="25" y="95" width="30" height="12" rx="6" fill="#78716C" />
    <Rect x="65" y="95" width="30" height="12" rx="6" fill="#78716C" />
    <Rect x="28" y="97" width="24" height="8" rx="4" fill="#57534E" />
    <Rect x="68" y="97" width="24" height="8" rx="4" fill="#57534E" />

    {/* Body */}
    <Rect x="30" y="55" width="60" height="42" rx="4" fill={colors.primary} />
    <Rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
    {/* Control panel screens */}
    <Rect x="36" y="75" width="20" height="16" rx="2" fill={colors.text} />
    <Rect x="64" y="75" width="20" height="16" rx="2" fill={colors.text} />

    {/* Neck */}
    <Rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />

    {/* Head */}
    <Rect x="35" y="20" width="50" height="28" rx="4" fill={colors.primary} />

    {/* Eyes - dark background */}
    <Ellipse cx="48" cy="34" rx="12" ry="11" fill={colors.text} />
    <Ellipse cx="72" cy="34" rx="12" ry="11" fill={colors.text} />
    <Ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
    <Ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />

    {/* Pupils */}
    <Ellipse cx="48" cy="35" rx="5" ry="5" fill={colors.primary} />
    <Ellipse cx="72" cy="35" rx="5" ry="5" fill={colors.primary} />

    {/* Eye highlights */}
    <Circle cx="50" cy="32" r="2.5" fill="#FEF2EE" />
    <Circle cx="74" cy="32" r="2.5" fill="#FEF2EE" />

    {/* Nose/center detail */}
    <Rect x="56" y="30" width="8" height="8" rx="2" fill="#78716C" />

    {/* Arms */}
    <Rect x="15" y="62" width="18" height="6" rx="3" fill="#78716C" />
    <Rect x="87" y="62" width="18" height="6" rx="3" fill="#78716C" />
    {/* Hands */}
    <Rect x="10" y="58" width="8" height="14" rx="2" fill="#57534E" />
    <Rect x="102" y="58" width="8" height="14" rx="2" fill="#57534E" />

    {/* Antenna */}
    <Rect x="58" y="12" width="4" height="10" rx="2" fill="#78716C" />
    <Circle cx="60" cy="10" r="5" fill={colors.accent} />
  </Svg>
)

// Small mascot for headers
const BobotMascotSmall = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    {/* Simplified version */}
    <Rect x="30" y="55" width="60" height="42" rx="4" fill={colors.primary} />
    <Rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />
    <Rect x="35" y="20" width="50" height="28" rx="4" fill={colors.primary} />
    <Ellipse cx="48" cy="34" rx="10" ry="9" fill={colors.text} />
    <Ellipse cx="72" cy="34" rx="10" ry="9" fill={colors.text} />
    <Ellipse cx="48" cy="35" rx="4" ry="4" fill={colors.primary} />
    <Ellipse cx="72" cy="35" rx="4" ry="4" fill={colors.primary} />
    <Circle cx="60" cy="10" r="5" fill={colors.accent} />
  </Svg>
)

// SVG Icons to replace broken emojis (react-pdf doesn't support emojis)
const IconBolt = ({ size = 20, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color} />
  </Svg>
)

const IconHome = ({ size = 20, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
)

const IconMoon = ({ size = 20, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={color} />
  </Svg>
)

const IconPalette = ({ size = 14, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={color} />
  </Svg>
)

const IconChat = ({ size = 14, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill={color} />
  </Svg>
)

const IconCheck = ({ size = 12, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
)

// Create styles
const styles = StyleSheet.create({
  // Base page
  page: {
    backgroundColor: colors.background,
    padding: 50,
    fontFamily: 'Inter',
  },

  // SECTION 1: HERO
  heroPage: {
    backgroundColor: colors.background,
    padding: 0,
    fontFamily: 'Inter',
  },
  heroContainer: {
    backgroundColor: colors.heroBackground,
    margin: 40,
    borderRadius: 24,
    padding: 50,
    minHeight: 700,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMascotArea: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Playfair',
    fontSize: 42,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 400,
    marginBottom: 60,
  },
  heroFooter: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  heroFooterText: {
    fontSize: 11,
    color: colors.textLight,
  },

  // SECTION 2: PHILOSOPHY
  sectionHeader: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Playfair',
    fontSize: 28,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  uspGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 30,
  },
  uspCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  uspIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uspIconText: {
    fontSize: 20,
    color: colors.white,
  },
  uspTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  uspDescription: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 1.5,
  },

  // SECTION 3: JOB DESCRIPTION
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCardHighlight: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 10,
  },
  roleDescription: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 1.6,
  },

  // SECTION 4: CUSTOMIZATION
  customizationBox: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  customizationText: {
    flex: 1,
  },
  featureList: {
    marginTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBulletText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 600,
  },
  featureText: {
    fontSize: 11,
    color: colors.text,
  },

  // SECTION 5: PROCESS
  processSteps: {
    marginTop: 30,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.white,
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 1.5,
  },

  // SECTION 6: PRICING
  pricingGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 25,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pricingCardHighlight: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  pricingTier: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.primary,
  },
  pricingUnit: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 16,
  },
  pricingFeature: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 6,
  },
  recommendedBadge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.white,
    textTransform: 'uppercase',
  },
  pricingNote: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
  },

  // SECTION 7: CONTACT
  contactSection: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 40,
    marginTop: 40,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 12,
    color: colors.heroBackground,
    textAlign: 'center',
    marginBottom: 20,
  },
  contactInfo: {
    fontSize: 11,
    color: colors.white,
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: colors.textLight,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Page header with mascot
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageHeaderTitle: {
    fontFamily: 'Playfair',
    fontSize: 24,
    fontWeight: 700,
    color: colors.text,
  },
})

// Page Footer Component
const PageFooter = ({ pageNumber }) => (
  <View style={styles.footer} fixed>
    <View style={styles.footerLogo}>
      <BobotMascotSmall size={20} />
      <Text style={styles.footerText}>Bobot AB | www.bobot.nu</Text>
    </View>
    <Text style={styles.footerText}>Sida {pageNumber}</Text>
  </View>
)

// SECTION 1: Hero Page
const HeroPage = ({ customerName, year }) => (
  <Page size="A4" style={styles.heroPage}>
    <View style={styles.heroContainer}>
      {/* Mascot */}
      <View style={styles.heroMascotArea}>
        <BobotMascot size={120} />
      </View>

      {/* Title */}
      <Text style={styles.heroTitle}>Hälsa på Bobot.</Text>
      <Text style={styles.heroSubtitle}>
        Er nya digitala medarbetare. Han läser era manualer på sekunder, så att ni slipper svara på samma frågor två gånger.
      </Text>

      {/* Customer name */}
      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: colors.textLight, marginBottom: 8 }}>Förslag till</Text>
        <Text style={{ fontSize: 20, fontWeight: 600, color: colors.text }}>{customerName}</Text>
        <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 8 }}>{year}</Text>
      </View>
    </View>
  </Page>
)

// SECTION 2: Philosophy Page
const PhilosophyPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Varför anställa Bobot?</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Att lära upp nyanställda tar tid. Att svara på kunders rutinfrågor tar energi. Bobot är lösningen på båda problemen. Han är inte ett IT-system, han är en kollega som läser in er information och delar med sig av den – dygnet runt.
    </Text>

    {/* USP Grid */}
    <View style={styles.uspGrid}>
      <View style={styles.uspCard}>
        <View style={styles.uspIcon}>
          <IconBolt size={20} color={colors.white} />
        </View>
        <Text style={styles.uspTitle}>Supersnabb</Text>
        <Text style={styles.uspDescription}>Läser in dokument på några sekunder och börjar svara direkt.</Text>
      </View>

      <View style={styles.uspCard}>
        <View style={[styles.uspIcon, { backgroundColor: colors.accent }]}>
          <IconHome size={20} color={colors.white} />
        </View>
        <Text style={styles.uspTitle}>Lokal</Text>
        <Text style={styles.uspDescription}>All kunskap stannar hos er. Inga externa moln eller tredjeparter.</Text>
      </View>

      <View style={styles.uspCard}>
        <View style={styles.uspIcon}>
          <IconMoon size={20} color={colors.white} />
        </View>
        <Text style={styles.uspTitle}>Vaken</Text>
        <Text style={styles.uspDescription}>Jobbar dygnet runt. Tillgänglig 24/7, alla dagar.</Text>
      </View>
    </View>

    {/* Additional benefits */}
    <View style={{ marginTop: 40 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
        Fördelar med en AI-kollega
      </Text>
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <View style={styles.featureBullet}><IconCheck size={12} color={colors.white} /></View>
          <Text style={styles.featureText}>Minskar belastning på kundtjänst och support</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureBullet}><IconCheck size={12} color={colors.white} /></View>
          <Text style={styles.featureText}>Nyanställda blir självgående direkt</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureBullet}><IconCheck size={12} color={colors.white} /></View>
          <Text style={styles.featureText}>Konsekvent information – samma svar varje gång</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureBullet}><IconCheck size={12} color={colors.white} /></View>
          <Text style={styles.featureText}>GDPR-säker med automatisk dataradering</Text>
        </View>
      </View>
    </View>

    <PageFooter pageNumber={2} />
  </Page>
)

// SECTION 3: Job Description Page
const JobDescriptionPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Två roller i en anställning</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Bobot är flexibel och kan hjälpa till på flera fronter. Välj att använda honom för kundservice, intern support, eller båda.
    </Text>

    <View style={styles.twoColumnGrid}>
      {/* External Role */}
      <View style={styles.roleCardHighlight}>
        <Text style={{ fontSize: 10, color: colors.primary, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Utåtriktad
        </Text>
        <Text style={styles.roleTitle}>Extern Kundservice</Text>
        <Text style={styles.roleDescription}>
          Svarar direkt på hemsidan. Era kunder slipper telefonkö och får hjälp med priser, öppettider och bokningar oavsett tid på dygnet.
        </Text>
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Besvarar vanliga frågor</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Guidar besökare på hemsidan</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Tillgänglig dygnet runt</Text>
        </View>
      </View>

      {/* Internal Role */}
      <View style={styles.roleCard}>
        <Text style={{ fontSize: 10, color: colors.accent, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Inåtriktad
        </Text>
        <Text style={styles.roleTitle}>Intern Mentor</Text>
        <Text style={styles.roleDescription}>
          Ny på jobbet? Bobot svarar på frågor om rutiner och system. Senior personal slipper bli avbruten med samma frågor, och nyanställda blir självgående direkt.
        </Text>
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Onboarding av nyanställda</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Svar på rutinfrågor</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Intern kunskapsbas</Text>
        </View>
      </View>
    </View>

    {/* Security note */}
    <View style={{ marginTop: 40, backgroundColor: colors.slateLight, borderRadius: 16, padding: 24 }}>
      <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
        Separata kunskapsbaser
      </Text>
      <Text style={{ fontSize: 11, color: colors.textLight, lineHeight: 1.6 }}>
        Extern och intern bot kan ha helt separata kunskapsbaser. Känslig intern information delas aldrig med externa besökare. Ni styr exakt vad varje bot ska kunna svara på.
      </Text>
    </View>

    <PageFooter pageNumber={3} />
  </Page>
)

// SECTION 4: Customization Page
const CustomizationPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Er stil, vår mascot</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Bobot ska kännas som en naturlig del av er verksamhet. Han behåller sitt ansikte, men klär sig i er uniform.
    </Text>

    <View style={styles.customizationBox}>
      <View style={{ alignItems: 'center' }}>
        <BobotMascot size={100} />
        <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 12, textAlign: 'center' }}>
          Er egen färg och stil
        </Text>
      </View>
      <View style={styles.customizationText}>
        <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
          Anpassningsmöjligheter
        </Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet}><IconPalette size={12} color={colors.white} /></View>
            <Text style={styles.featureText}>Välj era företagsfärger</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet}><Text style={styles.featureBulletText}>Aa</Text></View>
            <Text style={styles.featureText}>Anpassa typsnitt</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet}><IconCheck size={12} color={colors.white} /></View>
            <Text style={styles.featureText}>Runda eller raka hörn</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet}><IconChat size={12} color={colors.white} /></View>
            <Text style={styles.featureText}>Anpassad ton och röst</Text>
          </View>
        </View>
      </View>
    </View>

    {/* Languages */}
    <View style={{ marginTop: 30 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
        Språkstöd
      </Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>SV</Text>
          <Text style={{ fontSize: 12, fontWeight: 500, color: colors.text }}>Svenska</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>EN</Text>
          <Text style={{ fontSize: 12, fontWeight: 500, color: colors.text }}>English</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>AR</Text>
          <Text style={{ fontSize: 12, fontWeight: 500, color: colors.text }}>Arabic</Text>
        </View>
      </View>
    </View>

    <PageFooter pageNumber={4} />
  </Page>
)

// SECTION 5: Process Page
const ProcessPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Så här går det till</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Kom igång snabbt med tre enkla steg. Ingen teknisk kompetens krävs – vi hjälper er hela vägen.
    </Text>

    <View style={styles.processSteps}>
      <View style={styles.processStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Ge honom material</Text>
          <Text style={styles.stepDescription}>
            Ladda upp PDF, Word, Excel eller peka på er hemsida. Bobot accepterar de vanligaste filformaten och kan även läsa innehåll direkt från URL:er.
          </Text>
        </View>
      </View>

      <View style={styles.processStep}>
        <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Han läser på</Text>
          <Text style={styles.stepDescription}>
            Bobot analyserar och lär sig allt på några sekunder. All information indexeras och blir sökbar. Ingen manuell kategorisering krävs.
          </Text>
        </View>
      </View>

      <View style={styles.processStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Han börjar jobba</Text>
          <Text style={styles.stepDescription}>
            Redo att svara direkt. Ni kan alltid justera vad han säger genom admin-panelen. Testa internt först, sedan live när ni är nöjda.
          </Text>
        </View>
      </View>
    </View>

    {/* Timeline */}
    <View style={{ marginTop: 40, backgroundColor: colors.white, borderRadius: 16, padding: 24 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
        Typisk tidplan för uppstart
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>Dag 1</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Avtal & uppstart</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Text style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>Dag 2-3</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Kunskapsbas byggs</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Text style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>Dag 4-7</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Test & lansering</Text>
        </View>
      </View>
    </View>

    <PageFooter pageNumber={5} />
  </Page>
)

// SECTION 6: Pricing Page
const PricingPage = ({ startupFee, monthlyFee, tier, discount }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Välj nivå för er nya kollega</Text>
      <BobotMascotSmall size={36} />
    </View>

    <View style={styles.pricingGrid}>
      {/* Bas */}
      <View style={styles.pricingCard}>
        <Text style={styles.pricingTier}>Bas</Text>
        <Text style={styles.pricingPrice}>990</Text>
        <Text style={styles.pricingUnit}>kr/mån</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.pricingFeature}>• 1 chattbot</Text>
          <Text style={styles.pricingFeature}>• 500 konversationer/mån</Text>
          <Text style={styles.pricingFeature}>• E-post support</Text>
          <Text style={styles.pricingFeature}>• Grundläggande statistik</Text>
        </View>
      </View>

      {/* Standard - Highlighted */}
      <View style={styles.pricingCardHighlight}>
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Rekommenderad</Text>
        </View>
        <Text style={styles.pricingTier}>Standard</Text>
        <Text style={styles.pricingPrice}>1 990</Text>
        <Text style={styles.pricingUnit}>kr/mån</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.pricingFeature}>• 2 chattbotar (extern + intern)</Text>
          <Text style={styles.pricingFeature}>• 2 000 konversationer/mån</Text>
          <Text style={styles.pricingFeature}>• Prioriterad support</Text>
          <Text style={styles.pricingFeature}>• Avancerad statistik</Text>
          <Text style={styles.pricingFeature}>• Anpassningsbar design</Text>
        </View>
      </View>

      {/* Pro */}
      <View style={styles.pricingCard}>
        <Text style={styles.pricingTier}>Pro</Text>
        <Text style={styles.pricingPrice}>3 990</Text>
        <Text style={styles.pricingUnit}>kr/mån</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.pricingFeature}>• Obegränsade botar</Text>
          <Text style={styles.pricingFeature}>• Obegränsade konversationer</Text>
          <Text style={styles.pricingFeature}>• Dedikerad support</Text>
          <Text style={styles.pricingFeature}>• White-label möjlighet</Text>
          <Text style={styles.pricingFeature}>• API-åtkomst</Text>
        </View>
      </View>
    </View>

    {/* Startup fee */}
    <View style={{ marginTop: 30, backgroundColor: colors.slateLight, borderRadius: 16, padding: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Uppstartsavgift (engångskostnad)</Text>
          <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 4 }}>
            Inkluderar onboarding, uppsättning och teknisk support under trial
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 24, fontWeight: 700, color: colors.primary }}>{startupFee?.toLocaleString('sv-SE') || '4 900'} kr</Text>
          {discount > 0 && (
            <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 9, color: colors.white, fontWeight: 600 }}>{discount}% rabatt</Text>
            </View>
          )}
        </View>
      </View>
    </View>

    <Text style={styles.pricingNote}>
      Ingen bindningstid. Full support ingår. Avsluta när som helst.
    </Text>

    <PageFooter pageNumber={6} />
  </Page>
)

// SECTION 7: Contact Page
const ContactPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BobotMascot size={100} />

      <Text style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginTop: 40, marginBottom: 16, textAlign: 'center' }}>
        Redo att frigöra tid?
      </Text>

      <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', maxWidth: 400, lineHeight: 1.6, marginBottom: 40 }}>
        Låt oss börja med en provmånad. Ni testar Bobot i er verksamhet och bestämmer sedan om ni vill fortsätta.
      </Text>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Ta kontakt</Text>
        <Text style={styles.contactText}>
          Vi svarar inom 24 timmar och hjälper er komma igång direkt.
        </Text>
        <Text style={styles.contactInfo}>
          Marcus Widing{'\n'}
          hej@bobot.nu{'\n'}
          www.bobot.nu
        </Text>
      </View>
    </View>

    <PageFooter pageNumber={7} />
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
      <HeroPage customerName={customerName} year={year} />
      <PhilosophyPage />
      <JobDescriptionPage />
      <CustomizationPage />
      <ProcessPage />
      <PricingPage
        startupFee={startupFee}
        monthlyFee={monthlyFee}
        tier={tier}
        discount={discount}
      />
      <ContactPage />
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

// Export colors and mascot for reuse in KPI report
export { colors, BobotMascot, BobotMascotSmall }

export default ProposalDocument
