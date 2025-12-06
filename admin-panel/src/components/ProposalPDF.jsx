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

// Subtle dot pattern background - like landing page
const DotPattern = ({ opacity = 0.15, color = colors.textLight, spacing = 24 }) => {
  const dots = []
  const cols = Math.ceil(595 / spacing) // A4 width in points
  const rows = Math.ceil(842 / spacing) // A4 height in points
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push(
        <Circle
          key={`${row}-${col}`}
          cx={col * spacing + spacing / 2}
          cy={row * spacing + spacing / 2}
          r={1}
          fill={color}
          opacity={opacity}
        />
      )
    }
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={595} height={842}>
        {dots}
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
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  uspGrid: {
    flexDirection: 'row',
    marginTop: 20,
  },
  uspCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 10,
  },
  uspCardAccent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
  },
  uspIcon: {
    marginBottom: 10,
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
    marginTop: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    marginLeft: 10,
  },
  roleCardHighlight: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
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
  },

  // Page header with mascot
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
      <Text style={[styles.footerText, { marginLeft: 6 }]}>Bobot AB | www.bobot.nu</Text>
    </View>
    <Text style={styles.footerText}>Sida {pageNumber}</Text>
  </View>
)

// SECTION 1: Hero Page with Cover Image
const HeroPage = ({ customerName, contactPerson, startDate }) => (
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
      {/* Contact person - above title */}
      {contactPerson && (
        <Text style={{ fontSize: 11, color: colors.textLight, marginBottom: 8 }}>
          Till {contactPerson}
        </Text>
      )}

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
        {startDate && (
          <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 6 }}>Startdatum: {startDate}</Text>
        )}
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
  <Page size="A4" style={styles.page} wrap={false}>
    <DotPattern opacity={0.12} spacing={28} />
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
          <FancyIconWrapper color={colors.primary} size={44}>
            <IconBolt size={18} color={colors.white} />
          </FancyIconWrapper>
        </View>
        <Text style={styles.uspTitle}>Supersnabb</Text>
        <Text style={styles.uspDescription}>Läser in dokument på sekunder och börjar svara direkt.</Text>
      </View>

      <View style={styles.uspCard}>
        <View style={styles.uspIcon}>
          <FancyIconWrapper color={colors.accent} size={44}>
            <IconHome size={18} color={colors.white} />
          </FancyIconWrapper>
        </View>
        <Text style={styles.uspTitle}>Lokal</Text>
        <Text style={styles.uspDescription}>All kunskap stannar hos er. Inga externa moln.</Text>
      </View>

      <View style={styles.uspCard}>
        <View style={styles.uspIcon}>
          <FancyIconWrapper color={colors.primary} size={44}>
            <IconMoon size={18} color={colors.white} />
          </FancyIconWrapper>
        </View>
        <Text style={styles.uspTitle}>Vaken</Text>
        <Text style={styles.uspDescription}>Tillgänglig dygnet runt, alla dagar om året.</Text>
      </View>
    </View>

    {/* Decorative divider */}
    <View style={{ alignItems: 'center', marginTop: 6 }}>
      <DecorativeDivider width={200} />
    </View>

    {/* Expanded benefits - two columns */}
    <View>
      <Text style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 10 }}>
        Fördelar med en AI-kollega
      </Text>
      <View style={{ flexDirection: 'row' }}>
        {/* Business benefits */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Affärsfördelar</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 700 }}>1</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Minskad supportbelastning</Text>
                <Text style={{ fontSize: 8, color: colors.textLight, marginTop: 1 }}>Upp till 70% av rutinfrågor besvaras automatiskt</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 700 }}>2</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Snabbare onboarding</Text>
                <Text style={{ fontSize: 8, color: colors.textLight, marginTop: 1 }}>Nyanställda hittar svar själva istället för att fråga kollegor</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 700 }}>3</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Tillgänglig dygnet runt</Text>
                <Text style={{ fontSize: 8, color: colors.textLight, marginTop: 1 }}>Kunder och anställda får hjälp även utanför kontorstid</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Technical benefits */}
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tekniska fördelar</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 700 }}>1</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>GDPR-säker arkitektur</Text>
                <Text style={{ fontSize: 8, color: colors.textLight, marginTop: 1 }}>Automatisk radering, EU-datalagring, audit-loggning</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 700 }}>2</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Lokal språkmodell (LLM)</Text>
                <Text style={{ fontSize: 8, color: colors.textLight, marginTop: 1 }}>Ingen data skickas till externa AI-tjänster som OpenAI</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 700 }}>3</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Enkel integration</Text>
                <Text style={{ fontSize: 8, color: colors.textLight, marginTop: 1 }}>En rad JavaScript på er hemsida – ingen kodning krävs</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  </Page>
)

// SECTION 3: Job Description Page
const JobDescriptionPage = () => (
  <Page size="A4" style={styles.page} wrap={false}>
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
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>Lokal AI-modell</Text>
          <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
            Bobot drivs av en lokal språkmodell (LLM) som körs på EU-servrar. Ingen data skickas till externa molntjänster som OpenAI eller Google.
          </Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>GDPR-säker</Text>
          <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
            All data lagras inom EU med automatisk radering. Möjlighet till dedikerad svensk hosting för extra säkerhet.
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>Er kunskapsbas</Text>
          <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
            Bobot svarar endast baserat på den information ni laddar upp. Separata kunskapsbaser för extern och intern användning.
          </Text>
        </View>
      </View>

      {/* Hosting options */}
      <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
        <Text style={{ fontSize: 10, fontWeight: 600, color: colors.text, marginBottom: 10 }}>Hosting-alternativ</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                <IconBolt size={8} color={colors.white} />
              </View>
              <Text style={{ fontSize: 9, fontWeight: 600, color: colors.text }}>Bobot Cloud (rekommenderat)</Text>
            </View>
            <Text style={{ fontSize: 8, color: colors.textLight, lineHeight: 1.4 }}>
              Vi hanterar allt – hosting ingår i månadspriset. EU-servrar med 99.9% SLA.
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                <IconHome size={8} color={colors.white} />
              </View>
              <Text style={{ fontSize: 9, fontWeight: 600, color: colors.text }}>Självhostad</Text>
            </View>
            <Text style={{ fontSize: 8, color: colors.textLight, lineHeight: 1.4 }}>
              Full kontroll. Kräver: 16+ GB RAM, 8 CPU, 100 GB SSD, Docker, Linux.
            </Text>
          </View>
        </View>
      </View>
    </View>
  </Page>
)

// SECTION 4: Customization Page
const CustomizationPage = () => (
  <Page size="A4" style={styles.page} wrap={false}>
    <DotPattern opacity={0.1} spacing={32} />
    <CornerAccent position="topRight" />

    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Er stil, vår mascot</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Bobot ska kännas som en naturlig del av er verksamhet. Han behåller sitt ansikte, men klär sig i er uniform.
    </Text>

    {/* Two-column layout: mascot + customization options */}
    <View style={{ flexDirection: 'row', marginTop: 16 }}>
      {/* Left column - Mascot and intro */}
      <View style={{ width: 140, alignItems: 'center', marginRight: 20 }}>
        <BobotMascot size={100} />
        <Text style={{ fontSize: 9, color: colors.textLight, marginTop: 10, textAlign: 'center', lineHeight: 1.4 }}>
          Bobots personlighet förblir densamma, men utseendet anpassas efter ert varumärke
        </Text>
      </View>

      {/* Right column - Detailed customization */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
          Anpassningsmöjligheter
        </Text>

        {/* Visual customization */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Visuell design</Text>
          <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, marginRight: 8, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}><IconPalette size={10} color={colors.white} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Företagsfärger</Text>
                  <Text style={{ fontSize: 8, color: colors.textLight }}>Primär- och sekundärfärg för widget och knappar</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, marginRight: 8, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 600 }}>Aa</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Typografi</Text>
                  <Text style={{ fontSize: 8, color: colors.textLight }}>Välj typsnitt eller använd standardteckensnittet Inter</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, marginRight: 8, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 600 }}>○</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Form & stil</Text>
                  <Text style={{ fontSize: 8, color: colors.textLight }}>Runda eller raka hörn på widgeten</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Behavior customization */}
        <View>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.accent, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Beteende & röst</Text>
          <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, marginRight: 8, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}><IconChat size={10} color={colors.white} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Tonalitet</Text>
                  <Text style={{ fontSize: 8, color: colors.textLight }}>Formell eller avslappnad – matcha ert varumärke</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, marginRight: 8, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: colors.white, fontWeight: 600 }}>Hi</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Välkomstmeddelande</Text>
                  <Text style={{ fontSize: 8, color: colors.textLight }}>Anpassat hälsningsmeddelande och föreslagna frågor</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, marginRight: 8, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 7, color: colors.white, fontWeight: 600 }}>[*]</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>Källhänvisningar</Text>
                  <Text style={{ fontSize: 8, color: colors.textLight }}>Bobot visar alltid vilken källa svaret kommer från</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>

    {/* Language support - simplified */}
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
        Språkstöd
      </Text>
      <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 8 }}>Anpassningsbart språk</Text>
            <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.5 }}>
              Bobot svarar på svenska som standard. Behöver ni stöd för andra språk? Kontakta oss så diskuterar vi era behov.
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 600, color: colors.accent, marginBottom: 8 }}>Tekniskt</Text>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: colors.text }}>• RTL-stöd för höger-till-vänster-språk</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: colors.text }}>• Fullt Unicode/UTF-8-stöd</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: colors.text }}>• Anpassningsbart gränssnitt</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  </Page>
)

// SECTION 5: Process Page
const ProcessPage = () => (
  <Page size="A4" style={styles.page} wrap={false}>
    <CornerAccent position="bottomLeft" />

    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Så här går det till</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Kom igång snabbt med tre enkla steg.
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
  </Page>
)

// SECTION 6: Trial Period Page
const TrialPeriodPage = () => (
  <Page size="A4" style={styles.page} wrap={false}>
    <DotPattern opacity={0.1} spacing={30} />
    <CornerAccent position="topRight" />

    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>4 veckors provperiod</Text>
      <BobotMascotSmall size={36} />
    </View>

    <Text style={styles.sectionSubtitle}>
      Testa Bobot utan risk. Under provperioden får ni full tillgång till alla funktioner och personlig support.
    </Text>

    {/* Week-by-week breakdown - clean timeline design */}
    <View style={{ marginTop: 20 }}>
      {/* Week 1 */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ width: 44, alignItems: 'center', marginRight: 16 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.white, fontWeight: 700 }}>1</Text>
          </View>
          <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 8 }} />
        </View>
        <View style={{ flex: 1, paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Vecka 1: Uppstart & Setup</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 10 }}>Dag 1-7</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Kickoff-möte för att förstå era behov och mål</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Skapa konto och konfigurera grundinställningar</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Anpassa widgetens utseende efter ert varumärke</Text>
          <Text style={{ fontSize: 10, color: colors.text }}>• Teknisk guide för integration på er hemsida</Text>
        </View>
      </View>

      {/* Week 2 */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ width: 44, alignItems: 'center', marginRight: 16 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.white, fontWeight: 700 }}>2</Text>
          </View>
          <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 8 }} />
        </View>
        <View style={{ flex: 1, paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Vecka 2: Kunskapsbas</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 10 }}>Dag 8-14</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Ladda upp era dokument (PDF, Word, Excel)</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Importera FAQ från hemsida eller skriv egna</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Granska och finjustera AI-genererade svar</Text>
          <Text style={{ fontSize: 10, color: colors.text }}>• Sätt upp kategorier och föreslagna frågor</Text>
        </View>
      </View>

      {/* Week 3 */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ width: 44, alignItems: 'center', marginRight: 16 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.white, fontWeight: 700 }}>3</Text>
          </View>
          <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 8 }} />
        </View>
        <View style={{ flex: 1, paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Vecka 3: Testning</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 10 }}>Dag 15-21</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Intern testning med utvalda medarbetare</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Identifiera kunskapsluckor och finjustera</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Genomgång av första statistiken och insikter</Text>
          <Text style={{ fontSize: 10, color: colors.text }}>• Förberedelser inför extern lansering</Text>
        </View>
      </View>

      {/* Week 4 */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 44, alignItems: 'center', marginRight: 16 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.white, fontWeight: 700 }}>4</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Vecka 4: Utvärdering</Text>
          <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 10 }}>Dag 22-28</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Soft launch för externa besökare (valfritt)</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Analysera resultat och ROI-potential</Text>
          <Text style={{ fontSize: 10, color: colors.text, marginBottom: 4 }}>• Avslutande möte för att gå igenom upplevelsen</Text>
          <Text style={{ fontSize: 10, color: colors.text }}>• Beslut om fortsatt samarbete</Text>
        </View>
      </View>
    </View>

    {/* Bottom note */}
    <View style={{ marginTop: 20, backgroundColor: colors.slateLight, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        <IconCheck size={20} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Ingen risk, full transparens</Text>
        <Text style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.5 }}>
          Om ni inte är nöjda efter 4 veckor avslutar vi samarbetet utan extra kostnad. Ni behåller all kunskap och erfarenhet.
        </Text>
      </View>
    </View>
  </Page>
)

// Helper to format price with Swedish locale
const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return price.toLocaleString('sv-SE')
}

// SECTION 7: Pricing Page - Redesigned to show recommended tier
const PricingPage = ({ startupFee, monthlyFee, tier, tierInfo, discount, discountEndDate }) => {
  // Get original price from tierInfo (before discount)
  // monthlyFee passed from SuperAdmin is already discounted, so we need the original from tierInfo
  const originalMonthlyFee = tierInfo?.monthly_fee || monthlyFee
  // Use the already-discounted monthlyFee if discount > 0, otherwise use original
  const discountedMonthlyFee = discount > 0 ? monthlyFee : originalMonthlyFee
  const discountAmount = originalMonthlyFee - discountedMonthlyFee

  // Format discount end date
  const formattedDiscountEndDate = discountEndDate
    ? new Date(discountEndDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // Get features for the tier
  const tierFeatures = tierInfo?.features || []
  const maxConversations = tierInfo?.max_conversations || 0
  const maxWidgets = tierInfo?.max_widgets || 0
  const maxKnowledgeItems = tierInfo?.max_knowledge_items || 0

  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <CornerAccent position="topRight" />

      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Vi rekommenderar</Text>
        <BobotMascotSmall size={36} />
      </View>

      {/* Main recommendation card */}
      <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, borderWidth: 2, borderColor: colors.primary, marginTop: 8 }}>
        {/* Recommended badge */}
        <View style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start', marginBottom: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rekommenderat för er</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* Left side - Tier info */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Playfair', fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
              {tier || 'Standard'}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textLight, lineHeight: 1.5, maxWidth: 280 }}>
              En prisnivå anpassad efter era behov med alla funktioner ni behöver för att komma igång.
            </Text>
          </View>

          {/* Right side - Pricing */}
          <View style={{ alignItems: 'flex-end' }}>
            {discount > 0 && (
              <Text style={{ fontSize: 14, color: colors.textLight, textDecoration: 'line-through', marginBottom: 2 }}>
                {formatPrice(originalMonthlyFee)} kr
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 36, fontWeight: 700, color: colors.primary }}>{formatPrice(discountedMonthlyFee)}</Text>
              <Text style={{ fontSize: 12, color: colors.textLight, marginLeft: 4 }}>kr/månad</Text>
            </View>
            {discount > 0 && (
              <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, marginTop: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 600, color: colors.white }}>-{discount}% rabatt</Text>
              </View>
            )}
            {formattedDiscountEndDate && discount > 0 && (
              <Text style={{ fontSize: 9, color: colors.textLight, marginTop: 6 }}>
                Gäller t.o.m. {formattedDiscountEndDate}
              </Text>
            )}
          </View>
        </View>

        {/* Features included */}
        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
            Ingår i {tier || 'Standard'}:
          </Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconCheck size={10} color={colors.white} />
              </View>
              <Text style={{ fontSize: 11, color: colors.text }}>
                {maxConversations > 0 ? `${formatPrice(maxConversations)} konversationer/månad` : 'Obegränsade konversationer'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconCheck size={10} color={colors.white} />
              </View>
              <Text style={{ fontSize: 11, color: colors.text }}>
                {maxWidgets > 0 ? `${maxWidgets} widgets` : 'Obegränsade widgets'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconCheck size={10} color={colors.white} />
              </View>
              <Text style={{ fontSize: 11, color: colors.text }}>
                {maxKnowledgeItems > 0 ? `${formatPrice(maxKnowledgeItems)} kunskapsposter` : 'Obegränsade kunskapsposter'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Startup fee section */}
      <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 20, marginTop: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>Uppstartsavgift (engångskostnad)</Text>
            <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 4, lineHeight: 1.5 }}>
              Inkluderar onboarding, uppsättning av konto och widget, hjälp att bygga kunskapsbasen, och personlig support under hela provperioden.
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 700, color: colors.primary }}>{formatPrice(startupFee)} kr</Text>
            <Text style={{ fontSize: 9, color: colors.textLight }}>engångsbelopp</Text>
          </View>
        </View>
      </View>

      {/* Cost summary */}
      <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 20, marginTop: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 16 }}>Sammanfattning av kostnad</Text>

        {/* Startup fee line */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, color: colors.textLight }}>Uppstartsavgift (engång)</Text>
          <Text style={{ fontSize: 11, color: colors.text }}>{formatPrice(startupFee)} kr</Text>
        </View>

        {/* Monthly fee line */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, color: colors.textLight }}>Månadsavgift ({tier || 'Standard'})</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {discount > 0 && (
              <Text style={{ fontSize: 11, color: colors.textLight, textDecoration: 'line-through', marginRight: 8 }}>
                {formatPrice(originalMonthlyFee)} kr
              </Text>
            )}
            <Text style={{ fontSize: 11, color: colors.text, fontWeight: 500 }}>{formatPrice(discountedMonthlyFee)} kr/mån</Text>
          </View>
        </View>

        {/* Discount line */}
        {discount > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 11, color: colors.accent, fontWeight: 500 }}>Rabatt ({discount}%)</Text>
            <Text style={{ fontSize: 11, color: colors.accent, fontWeight: 500 }}>-{formatPrice(discountAmount)} kr/mån</Text>
          </View>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

        {/* Total first month */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>Total första månaden</Text>
          <Text style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>{formatPrice(startupFee + discountedMonthlyFee)} kr</Text>
        </View>

        {/* Thereafter */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, color: colors.textLight }}>Därefter</Text>
          <Text style={{ fontSize: 11, color: colors.text }}>{formatPrice(discountedMonthlyFee)} kr/mån</Text>
        </View>
      </View>
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
  <Page size="A4" style={styles.page} wrap={false}>
    <DotPattern opacity={0.08} spacing={30} />
    <CornerAccent position="topRight" />

    {/* Header */}
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>Nästa steg</Text>
      <BobotMascotSmall size={36} />
    </View>

    {/* Main content - two column layout */}
    <View style={{ flexDirection: 'row', marginTop: 16 }}>
      {/* Left column - Next steps */}
      <View style={{ flex: 1, marginRight: 12 }}>
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
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <IconUser size={20} color={colors.white} />
            </View>
            <Text style={{ fontFamily: 'Playfair', fontSize: 16, fontWeight: 700, color: colors.text }}>Kontakta oss</Text>
          </View>

          {/* Contact details */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.slateLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <IconUser size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>Marcus Widing</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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

    {/* Bottom quote - redesigned */}
    <View style={{ marginTop: 24, backgroundColor: colors.slateLight, borderRadius: 12, padding: 24, alignItems: 'center' }}>
      <View style={{ width: 40, height: 2, backgroundColor: colors.primary, marginBottom: 16, borderRadius: 1 }} />
      <Text style={{ fontFamily: 'Playfair', fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: 8 }}>
        Låt Bobot sköta rutinfrågorna.
      </Text>
      <Text style={{ fontSize: 11, color: colors.textLight, textAlign: 'center' }}>
        Så ni kan fokusera på det som verkligen räknas.
      </Text>
    </View>
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
  tierInfo,
  discount,
  discountEndDate,
  conversationLimit,
  pricingTiers
}) => {
  // Format start date for display
  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : null

  return (
    <Document>
      <HeroPage customerName={customerName} contactPerson={contactPerson} startDate={formattedStartDate} />
      <PhilosophyPage />
      <JobDescriptionPage />
      <CustomizationPage />
      <ProcessPage />
      <TrialPeriodPage />
      <PricingPage
        startupFee={startupFee}
        monthlyFee={monthlyFee}
        tier={tier}
        tierInfo={tierInfo}
        discount={discount}
        discountEndDate={discountEndDate}
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
