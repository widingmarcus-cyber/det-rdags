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
  Ellipse,
  Image
} from '@react-pdf/renderer'

// Cover illustration - save your image as cover-illustration.png in public folder
const COVER_IMAGE_URL = '/cover-illustration.png'

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

// Decorative corner accent for visual interest
const CornerAccent = ({ position = 'topRight' }) => {
  const isTop = position.includes('top')
  const isRight = position.includes('Right')
  return (
    <View style={{
      position: 'absolute',
      [isTop ? 'top' : 'bottom']: 0,
      [isRight ? 'right' : 'left']: 0
    }}>
      <Svg width={120} height={120}>
        <Circle cx={isRight ? 120 : 0} cy={isTop ? 0 : 120} r={100} fill={colors.primary} opacity={0.08} />
        <Circle cx={isRight ? 120 : 0} cy={isTop ? 0 : 120} r={60} fill={colors.primary} opacity={0.06} />
        <Circle cx={isRight ? 100 : 20} cy={isTop ? 20 : 100} r={8} fill={colors.primary} opacity={0.3} />
      </Svg>
    </View>
  )
}

// Decorative divider with dot
const DecorativeDivider = ({ width = 200 }) => (
  <Svg width={width} height={20} style={{ marginVertical: 24 }}>
    <Rect x={0} y={9} width={width * 0.4} height={2} fill={colors.border} rx={1} />
    <Circle cx={width / 2} cy={10} r={5} fill={colors.primary} />
    <Rect x={width * 0.6} y={9} width={width * 0.4} height={2} fill={colors.border} rx={1} />
  </Svg>
)

// Fancy icon wrapper with decorative ring
const FancyIconWrapper = ({ children, color = colors.primary, size = 56 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={size} height={size}>
      {/* Outer decorative ring */}
      <Circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
      {/* Inner filled circle */}
      <Circle cx={size/2} cy={size/2} r={size/2 - 8} fill={color} />
    </Svg>
    <View style={{ position: 'absolute' }}>
      {children}
    </View>
  </View>
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
    gap: 20,
    marginTop: 30,
  },
  uspCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  uspCardAccent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  uspIcon: {
    marginBottom: 16,
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
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  pricingCard: {
    width: '31%',
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  pricingCardHighlight: {
    width: '31%',
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: 12,
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
    fontSize: 28,
    fontWeight: 700,
    color: colors.primary,
  },
  pricingUnit: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 12,
  },
  pricingFeature: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 4,
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

// SECTION 1: Hero Page with Cover Image
const HeroPage = ({ customerName, year }) => (
  <Page size="A4" style={{ backgroundColor: colors.background, padding: 0 }}>
    {/* Cover Image - takes most of the page */}
    <View style={{ flex: 1, margin: 30, marginBottom: 0 }}>
      <Image
        src={COVER_IMAGE_URL}
        style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 20 }}
      />
    </View>

    {/* Content below image */}
    <View style={{ padding: 40, paddingTop: 30, alignItems: 'center' }}>
      {/* Title */}
      <Text style={{ fontFamily: 'Playfair', fontSize: 36, fontWeight: 700, color: colors.primary, marginBottom: 12, textAlign: 'center' }}>
        Hälsa på Bobot.
      </Text>
      <Text style={{ fontSize: 13, color: colors.textLight, textAlign: 'center', lineHeight: 1.6, maxWidth: 400, marginBottom: 30 }}>
        Er nya digitala medarbetare. Han läser era manualer på sekunder, så att ni slipper svara på samma frågor två gånger.
      </Text>

      {/* Customer name box */}
      <View style={{ backgroundColor: colors.slateLight, borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', maxWidth: 300 }}>
        <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Förslag till</Text>
        <Text style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>{customerName}</Text>
        <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 6 }}>{year}</Text>
      </View>
    </View>

    {/* Footer */}
    <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' }}>
      <Text style={{ fontSize: 9, color: colors.textLight }}>Bobot AB | www.bobot.nu</Text>
    </View>
  </Page>
)

// SECTION 2: Philosophy Page
const PhilosophyPage = () => (
  <Page size="A4" style={styles.page}>
    <CornerAccent position="topRight" />

    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Varför anställa Bobot?</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Att lära upp nyanställda tar tid. Att svara på kunders rutinfrågor tar energi. Bobot är lösningen på båda problemen – en kollega som läser in er information och delar med sig av den, dygnet runt.
    </Text>

    {/* USP Grid */}
    <View style={styles.uspGrid}>
      <View style={styles.uspCardAccent}>
        <View style={styles.uspIcon}>
          <FancyIconWrapper color={colors.primary} size={56}>
            <IconBolt size={22} color={colors.white} />
          </FancyIconWrapper>
        </View>
        <Text style={styles.uspTitle}>Supersnabb</Text>
        <Text style={styles.uspDescription}>Läser in dokument på sekunder och börjar svara direkt.</Text>
      </View>

      <View style={styles.uspCard}>
        <View style={styles.uspIcon}>
          <FancyIconWrapper color={colors.accent} size={56}>
            <IconHome size={22} color={colors.white} />
          </FancyIconWrapper>
        </View>
        <Text style={styles.uspTitle}>Lokal</Text>
        <Text style={styles.uspDescription}>All kunskap stannar hos er. Inga externa moln.</Text>
      </View>

      <View style={styles.uspCard}>
        <View style={styles.uspIcon}>
          <FancyIconWrapper color={colors.primary} size={56}>
            <IconMoon size={22} color={colors.white} />
          </FancyIconWrapper>
        </View>
        <Text style={styles.uspTitle}>Vaken</Text>
        <Text style={styles.uspDescription}>Tillgänglig dygnet runt, alla dagar om året.</Text>
      </View>
    </View>

    {/* Decorative divider */}
    <View style={{ alignItems: 'center', marginTop: 10 }}>
      <DecorativeDivider width={200} />
    </View>

    {/* Additional benefits */}
    <View>
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
    <CornerAccent position="bottomLeft" />

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

    {/* Technical info - How it works */}
    <View style={{ marginTop: 30, backgroundColor: colors.slateLight, borderRadius: 16, padding: 20 }}>
      <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
        Så fungerar tekniken
      </Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>Lokal AI-modell</Text>
          <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
            Bobot drivs av en lokal språkmodell (LLM) som körs på våra svenska servrar. Ingen data skickas till externa molntjänster som OpenAI eller Google.
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>GDPR-säker</Text>
          <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
            All data lagras i Sverige med automatisk radering. Ni behåller full kontroll över er information och uppfyller GDPR-kraven.
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>Er kunskapsbas</Text>
          <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
            Bobot svarar endast baserat på den information ni laddar upp. Separata kunskapsbaser för extern och intern användning.
          </Text>
        </View>
      </View>
    </View>

    <PageFooter pageNumber={3} />
  </Page>
)

// SECTION 4: Customization Page
const CustomizationPage = () => (
  <Page size="A4" style={styles.page}>
    <CornerAccent position="topRight" />

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
      <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 24 }}>
        <Text style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
          Bobot stödjer flera språk och kan anpassas efter era behov. Kontakta oss för att diskutera vilka språk som passar er verksamhet.
        </Text>
      </View>
    </View>

    <PageFooter pageNumber={4} />
  </Page>
)

// SECTION 5: Process Page
const ProcessPage = () => (
  <Page size="A4" style={styles.page}>
    <CornerAccent position="bottomLeft" />

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

    {/* Timeline - 4 week trial */}
    <View style={{ marginTop: 40, backgroundColor: colors.white, borderRadius: 16, padding: 24 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
        4 veckors provperiod
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>Vecka 1</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Uppstart & setup</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>Vecka 2</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Kunskapsbas</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>Vecka 3</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Test & justering</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>Vecka 4</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4 }}>Utvärdering</Text>
        </View>
      </View>
    </View>

    <PageFooter pageNumber={5} />
  </Page>
)

// Helper to format price with Swedish locale
const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return price.toLocaleString('sv-SE')
}

// SECTION 6: Pricing Page
const PricingPage = ({ startupFee, monthlyFee, tier, discount, pricingTiers = [] }) => {
  // Sort tiers by price (lowest first)
  const sortedTiers = [...pricingTiers].sort((a, b) => (a.monthly_fee || 0) - (b.monthly_fee || 0))

  return (
    <Page size="A4" style={styles.page}>
      <CornerAccent position="topRight" />

      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Välj nivå för er nya kollega</Text>
        <BobotMascotSmall size={36} />
      </View>

      {/* Pricing cards - 2x2 grid to fit better on page */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
        {sortedTiers.length > 0 ? (
          sortedTiers.map((tierItem, index) => (
            <View key={tierItem.tier_key || index} style={{
              width: '48%',
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 8
            }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                {tierItem.name || tierItem.tier_key}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: 700, color: colors.primary }}>{formatPrice(tierItem.monthly_fee)}</Text>
              <Text style={{ fontSize: 9, color: colors.textLight, marginBottom: 10 }}>kr/mån</Text>
              <View>
                {tierItem.max_conversations > 0 ? (
                  <Text style={{ fontSize: 9, color: colors.text, marginBottom: 3 }}>• {formatPrice(tierItem.max_conversations)} konversationer/mån</Text>
                ) : (
                  <Text style={{ fontSize: 9, color: colors.text, marginBottom: 3 }}>• Obegränsade konversationer</Text>
                )}
                {tierItem.features && tierItem.features.slice(0, 3).map((feature, fIndex) => (
                  <Text key={fIndex} style={{ fontSize: 9, color: colors.text, marginBottom: 3 }}>• {feature}</Text>
                ))}
              </View>
            </View>
          ))
        ) : (
          // Fallback if no pricing tiers provided
          <View style={{
            width: '48%',
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <Text style={{ fontSize: 11, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{tier || 'Standard'}</Text>
            <Text style={{ fontSize: 22, fontWeight: 700, color: colors.primary }}>{formatPrice(monthlyFee)}</Text>
            <Text style={{ fontSize: 9, color: colors.textLight }}>kr/mån</Text>
          </View>
        )}
      </View>

      {/* Startup fee */}
      <View style={{ marginTop: 20, backgroundColor: colors.slateLight, borderRadius: 12, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>Uppstartsavgift (engångskostnad)</Text>
            <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 4 }}>
              Inkluderar onboarding, uppsättning och support under provperiod
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>{formatPrice(startupFee)} kr</Text>
            {discount > 0 && (
              <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 9, color: colors.white, fontWeight: 600 }}>{discount}% rabatt</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <PageFooter pageNumber={6} />
    </Page>
  )
}

// Icon for email
const IconMail = ({ size = 20, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={2} fill="none" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
)

// Icon for web/globe
const IconGlobe = ({ size = 20, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
)

// Icon for phone/contact
const IconUser = ({ size = 20, color = colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
)

// SECTION 7: Contact Page
const ContactPage = () => (
  <Page size="A4" style={styles.page}>
    <CornerAccent position="topRight" />

    {/* Header */}
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Nästa steg</Text>
      <BobotMascotSmall size={36} />
    </View>

    {/* Main content - two column layout */}
    <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
      {/* Left column - Next steps */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Playfair', fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
          Så kommer ni igång
        </Text>

        {/* Step 1 */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ color: colors.white, fontWeight: 700, fontSize: 12 }}>1</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 3 }}>Boka ett möte</Text>
            <Text style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.5 }}>Vi går igenom era behov och visar hur Bobot kan hjälpa er verksamhet.</Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ color: colors.white, fontWeight: 700, fontSize: 12 }}>2</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 3 }}>Skräddarsy lösningen</Text>
            <Text style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.5 }}>Vi anpassar Bobot efter era önskemål och bygger er kunskapsbas.</Text>
          </View>
        </View>

        {/* Step 3 */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ color: colors.white, fontWeight: 700, fontSize: 12 }}>3</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 3 }}>Starta provperioden</Text>
            <Text style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.5 }}>4 veckors test utan risk. Bestäm sedan om ni vill fortsätta.</Text>
          </View>
        </View>
      </View>

      {/* Right column - Contact card (cleaner design with less orange) */}
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <IconUser size={20} color={colors.white} />
            </View>
            <Text style={{ fontFamily: 'Playfair', fontSize: 16, fontWeight: 700, color: colors.text }}>Kontakta oss</Text>
          </View>

          {/* Contact details */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.slateLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconUser size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>Marcus Widing</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.slateLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconMail size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>hej@bobot.nu</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.slateLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconGlobe size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>www.bobot.nu</Text>
            </View>
          </View>
        </View>
      </View>
    </View>

    {/* Bottom quote - positioned with fixed distance from footer */}
    <View style={{ marginTop: 24, backgroundColor: colors.slateLight, borderRadius: 12, padding: 20, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Playfair', fontSize: 14, color: colors.text, textAlign: 'center', lineHeight: 1.5 }}>
        "Låt Bobot ta hand om rutinfrågorna så ni kan fokusera på det som verkligen räknas."
      </Text>
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
  hostingOption,
  pricingTiers
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
        pricingTiers={pricingTiers}
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
