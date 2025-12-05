import { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Rect, Circle, Path, Ellipse, Font } from '@react-pdf/renderer'

const API_BASE = '/api'

// ═══════════════════════════════════════════════════════════════════════════
// DIGITAL CRAFTSMANSHIP DESIGN SYSTEM
// "A helpful new colleague who is going to make your work life calmer"
// ═══════════════════════════════════════════════════════════════════════════

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

// Register Inter - Sans-serif for "Tech Utility" body text
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf', fontWeight: 600 },
  ]
})

// The Color Palette - Refined, Elegant, Professional
const colors = {
  terracotta: '#D97757',      // Primary accent - warm, confident
  slate: '#F8FAFC',           // Canvas - clean, modern, professional
  slateLight: '#F1F5F9',      // Subtle variation for depth
  slateMid: '#E2E8F0',        // Borders and dividers
  espresso: '#1E293B',        // Ink - slate-900, deep and readable
  stone: '#64748B',           // Secondary text - slate-500
  sage: '#10B981',            // Success/Growth - emerald
  cream: '#FFFFFF',           // Card backgrounds - pure white
  cardBg: '#FFFFFF',          // Card surfaces
  border: '#E2E8F0',          // Clean dividers - slate-200
  highlight: '#FFF7ED',       // Warm highlight - orange-50
  accent: '#EA580C',          // Accent for emphasis - orange-600
}

// Bobot Mascot - Matching landing page design (matte, robot-like, friendly)
const BobotMascot = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    {/* Feet */}
    <Rect x="25" y="95" width="30" height="12" rx="6" fill="#78716C" />
    <Rect x="65" y="95" width="30" height="12" rx="6" fill="#78716C" />
    <Rect x="28" y="97" width="24" height="8" rx="4" fill="#57534E" />
    <Rect x="68" y="97" width="24" height="8" rx="4" fill="#57534E" />

    {/* Body */}
    <Rect x="30" y="55" width="60" height="42" rx="4" fill={colors.terracotta} />
    <Rect x="33" y="58" width="54" height="36" rx="2" fill="#C4613D" />
    {/* Control panel screens */}
    <Rect x="36" y="75" width="20" height="16" rx="2" fill={colors.espresso} />
    <Rect x="64" y="75" width="20" height="16" rx="2" fill={colors.espresso} />

    {/* Neck */}
    <Rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />

    {/* Head */}
    <Rect x="35" y="20" width="50" height="28" rx="4" fill={colors.terracotta} />

    {/* Eyes - dark background */}
    <Ellipse cx="48" cy="34" rx="12" ry="11" fill={colors.espresso} />
    <Ellipse cx="72" cy="34" rx="12" ry="11" fill={colors.espresso} />
    <Ellipse cx="48" cy="34" rx="9" ry="8" fill="#292524" />
    <Ellipse cx="72" cy="34" rx="9" ry="8" fill="#292524" />

    {/* Pupils */}
    <Ellipse cx="48" cy="35" rx="5" ry="5" fill={colors.terracotta} />
    <Ellipse cx="72" cy="35" rx="5" ry="5" fill={colors.terracotta} />

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
    <Circle cx="60" cy="10" r="5" fill={colors.sage} />
  </Svg>
)

// Small mascot for footer
const BobotSmall = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    {/* Simplified version */}
    <Rect x="30" y="55" width="60" height="42" rx="4" fill={colors.terracotta} />
    <Rect x="50" y="45" width="20" height="14" rx="2" fill="#78716C" />
    <Rect x="35" y="20" width="50" height="28" rx="4" fill={colors.terracotta} />
    <Ellipse cx="48" cy="34" rx="10" ry="9" fill={colors.espresso} />
    <Ellipse cx="72" cy="34" rx="10" ry="9" fill={colors.espresso} />
    <Ellipse cx="48" cy="35" rx="4" ry="4" fill={colors.terracotta} />
    <Ellipse cx="72" cy="35" rx="4" ry="4" fill={colors.terracotta} />
    <Circle cx="60" cy="10" r="5" fill={colors.sage} />
  </Svg>
)

// ═══════════════════════════════════════════════════════════════════════════
// PDF STYLES - Artistic Editorial Design
// "Like a beautiful magazine spread - every element intentional"
// ═══════════════════════════════════════════════════════════════════════════

// Decorative corner element for pages
const CornerAccent = ({ position = 'topLeft' }) => {
  const size = 60
  const transforms = {
    topLeft: { x: 0, y: 0, rotate: 0 },
    topRight: { x: 535, y: 0, rotate: 90 },
    bottomLeft: { x: 0, y: 782, rotate: 270 },
    bottomRight: { x: 535, y: 782, rotate: 180 },
  }
  const t = transforms[position]
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', left: t.x, top: t.y }}>
      <Path
        d={t.rotate === 0 ? "M0 0 L60 0 L60 8 L8 8 L8 60 L0 60 Z" :
           t.rotate === 90 ? "M60 0 L60 60 L52 60 L52 8 L0 8 L0 0 Z" :
           t.rotate === 180 ? "M60 60 L0 60 L0 52 L52 52 L52 0 L60 0 Z" :
           "M0 60 L0 0 L8 0 L8 52 L60 52 L60 60 Z"}
        fill={colors.terracotta}
        opacity={0.15}
      />
    </Svg>
  )
}

// Elegant horizontal divider
const ElegantDivider = ({ width = 80 }) => (
  <Svg width={width} height={12} style={{ marginVertical: 16 }}>
    <Circle cx={width/2} cy={6} r={3} fill={colors.terracotta} />
    <Rect x={0} y={5} width={width/2 - 8} height={2} fill={colors.border} rx={1} />
    <Rect x={width/2 + 8} y={5} width={width/2 - 8} height={2} fill={colors.border} rx={1} />
  </Svg>
)

// Visual progress indicator - Elegant horizontal bar that works in react-pdf
const ProgressBar = ({ percent, width = 100, height = 8, color = colors.terracotta }) => {
  const fillWidth = Math.max((percent / 100) * width, 0)

  return (
    <Svg width={width} height={height}>
      {/* Background track */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={height / 2}
        fill={colors.border}
      />
      {/* Progress fill */}
      {fillWidth > 0 && (
        <Rect
          x={0}
          y={0}
          width={fillWidth}
          height={height}
          rx={height / 2}
          fill={color}
        />
      )}
    </Svg>
  )
}

// Large percentage display with elegant styling
const PercentageDisplay = ({ value, size = 70, color = colors.terracotta }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle cx={size/2} cy={size/2} r={size/2 - 2} fill={colors.slateLight} />
      {/* Inner white circle */}
      <Circle cx={size/2} cy={size/2} r={size/2 - 8} fill={colors.cream} />
      {/* Accent dot */}
      <Circle cx={size/2} cy={8} r={4} fill={color} />
    </Svg>
    <View style={{ position: 'absolute', alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Playfair', fontSize: 18, fontWeight: 700, color: colors.espresso }}>{value}%</Text>
    </View>
  </View>
)

// Mini bar chart for visual data
const MiniBarChart = ({ data, width = 200, height = 60 }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barWidth = (width - (data.length - 1) * 4) / data.length

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const barHeight = (d.value / maxVal) * (height - 16)
        return (
          <Rect
            key={i}
            x={i * (barWidth + 4)}
            y={height - 16 - barHeight}
            width={barWidth}
            height={barHeight}
            fill={d.highlight ? colors.terracotta : colors.border}
            rx={2}
          />
        )
      })}
    </Svg>
  )
}

const pdfStyles = StyleSheet.create({
  // ─────────────────────────────────────────────────────────────────────────
  // COVER PAGE - Magazine editorial feel
  // ─────────────────────────────────────────────────────────────────────────
  coverPage: {
    backgroundColor: colors.slate,
    padding: 0,
    position: 'relative',
  },
  coverInner: {
    flex: 1,
    margin: 40,
    backgroundColor: colors.cream,
    borderRadius: 24,
    padding: 60,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  coverAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.terracotta,
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coverBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverBrandText: {
    fontFamily: 'Playfair',
    fontSize: 18,
    fontWeight: 600,
    color: colors.espresso,
  },
  coverDateBadge: {
    backgroundColor: colors.slateLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  coverDateText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: 500,
    color: colors.stone,
  },
  coverMain: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  coverMascot: {
    marginBottom: 48,
  },
  coverTitleWrap: {
    alignItems: 'center',
  },
  coverEyebrow: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 600,
    color: colors.terracotta,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
  },
  coverTitle: {
    fontFamily: 'Playfair',
    fontSize: 52,
    fontWeight: 700,
    color: colors.espresso,
    textAlign: 'center',
    lineHeight: 1.1,
  },
  coverSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.stone,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 1.6,
    maxWidth: 340,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: colors.stone,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverFooterValue: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 600,
    color: colors.espresso,
    marginTop: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT PAGES - Refined grid layouts
  // ─────────────────────────────────────────────────────────────────────────
  page: {
    backgroundColor: colors.slate,
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 50,
    position: 'relative',
  },
  pageHeader: {
    marginBottom: 36,
  },
  pageNumber: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: colors.stone,
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: 'Playfair',
    fontSize: 32,
    fontWeight: 700,
    color: colors.espresso,
  },
  pageDivider: {
    height: 3,
    width: 48,
    backgroundColor: colors.terracotta,
    marginTop: 16,
    borderRadius: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HERO METRICS - Large editorial numbers (explicit widths prevent text wrap)
  // ─────────────────────────────────────────────────────────────────────────
  heroMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  heroMetricCard: {
    width: 150,
    backgroundColor: colors.cream,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  heroMetricCardAccent: {
    width: 150,
    backgroundColor: colors.terracotta,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  heroMetricValue: {
    fontFamily: 'Playfair',
    fontSize: 44,
    fontWeight: 700,
    color: colors.espresso,
    lineHeight: 1,
    textAlign: 'center',
  },
  heroMetricValueWhite: {
    fontFamily: 'Playfair',
    fontSize: 44,
    fontWeight: 700,
    color: colors.cream,
    lineHeight: 1,
    textAlign: 'center',
  },
  heroMetricLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: colors.stone,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 10,
    textAlign: 'center',
  },
  heroMetricLabelWhite: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 12,
  },
  heroMetricSubtext: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: colors.stone,
    marginTop: 6,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INSIGHT CARDS - Visual data presentations
  // ─────────────────────────────────────────────────────────────────────────
  insightRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 24,
  },
  insightCardWide: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightTitle: {
    fontFamily: 'Playfair',
    fontSize: 14,
    fontWeight: 600,
    color: colors.espresso,
  },
  insightBadge: {
    backgroundColor: colors.sage,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  insightBadgeText: {
    fontFamily: 'Inter',
    fontSize: 8,
    fontWeight: 600,
    color: colors.cream,
    textTransform: 'uppercase',
  },
  insightValue: {
    fontFamily: 'Playfair',
    fontSize: 36,
    fontWeight: 700,
    color: colors.terracotta,
    marginBottom: 4,
  },
  insightSubtext: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: colors.stone,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VISUAL METRICS - Clean vertical layout with explicit widths
  // ─────────────────────────────────────────────────────────────────────────
  visualMetricCard: {
    width: 230,
    backgroundColor: colors.cream,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  visualMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  visualMetricContent: {
    width: '100%',
  },
  visualMetricLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: colors.stone,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  visualMetricValue: {
    fontFamily: 'Playfair',
    fontSize: 42,
    fontWeight: 700,
    color: colors.espresso,
    marginBottom: 12,
  },
  visualMetricProgressRow: {
    marginBottom: 12,
  },
  visualMetricDesc: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.stone,
    lineHeight: 1.6,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DATA LISTS - Refined rows
  // ─────────────────────────────────────────────────────────────────────────
  dataList: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dataListHeader: {
    backgroundColor: colors.espresso,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  dataListHeaderText: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: 600,
    color: colors.cream,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  dataRowLast: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dataRowNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.slateLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataRowNumberText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: 600,
    color: colors.stone,
  },
  dataRowLabel: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.espresso,
  },
  dataRowValue: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 600,
    color: colors.terracotta,
  },
  dataRowBar: {
    width: 60,
    height: 6,
    backgroundColor: colors.slateLight,
    borderRadius: 3,
    marginLeft: 12,
    overflow: 'hidden',
  },
  dataRowBarFill: {
    height: '100%',
    backgroundColor: colors.terracotta,
    borderRadius: 3,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // QUOTE/CALLOUT BOXES - Elegant, subtle design
  // ─────────────────────────────────────────────────────────────────────────
  calloutBox: {
    backgroundColor: colors.slateLight,
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
  },
  calloutBoxHighlight: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
  },
  calloutIcon: {
    marginBottom: 12,
  },
  calloutText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.espresso,
    lineHeight: 1.7,
  },
  calloutAuthor: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: colors.stone,
    marginTop: 12,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FEEDBACK SECTION - Visual emotional indicators
  // ─────────────────────────────────────────────────────────────────────────
  feedbackRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  feedbackCard: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  feedbackCardSuccess: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sage,
  },
  feedbackCardWarning: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E6A756',
  },
  feedbackEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  feedbackValue: {
    fontFamily: 'Playfair',
    fontSize: 32,
    fontWeight: 700,
    color: colors.espresso,
  },
  feedbackLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: colors.stone,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTIONS LIST - Numbered items
  // ─────────────────────────────────────────────────────────────────────────
  questionsList: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 24,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  questionItemLast: {
    flexDirection: 'row',
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  questionNumberText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 600,
    color: colors.cream,
  },
  questionText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.espresso,
    lineHeight: 1.6,
    paddingTop: 4,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FOOTER - Minimal, elegant
  // ─────────────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerBrand: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: 600,
    color: colors.stone,
  },
  footerUrl: {
    fontFamily: 'Inter',
    fontSize: 8,
    color: colors.stone,
  },
  footerPage: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: colors.stone,
  },
})

// ═══════════════════════════════════════════════════════════════════════════
// KPI REPORT PDF - Artistic Editorial Design
// "Like a beautiful magazine spread - every element intentional"
// ═══════════════════════════════════════════════════════════════════════════
const KPIReportPDF = ({ analytics, dateRange, companyName = 'Ert företag' }) => {
  // Calculate key metrics
  const satisfactionRate = analytics.feedback_stats
    ? ((analytics.feedback_stats.helpful || 0) /
        Math.max((analytics.feedback_stats.helpful || 0) + (analytics.feedback_stats.not_helpful || 0), 1) * 100).toFixed(0)
    : 0

  const answerRate = analytics.answer_rate?.toFixed(0) || 0
  const avgResponseTime = (analytics.avg_response_time_ms / 1000).toFixed(1)
  const timeSaved = Math.round(analytics.total_conversations * 3) // ~3 min per conversation
  const langNames = { sv: 'Svenska', en: 'English', ar: 'العربية' }
  const langTotal = Object.values(analytics.language_stats || {}).reduce((a, b) => a + b, 0) || 1
  const categoryTotal = Object.values(analytics.category_stats || {}).reduce((a, b) => a + b, 0) || 1

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange || !dateRange.start || !dateRange.end) {
      return new Date().toLocaleDateString('sv-SE')
    }
    const start = new Date(dateRange.start).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
    const end = new Date(dateRange.end).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${start} – ${end}`
  }

  // Get report title based on date range
  const getReportTitle = () => {
    if (!dateRange || !dateRange.start || !dateRange.end) return 'Statistikrapport'
    const days = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)) + 1
    if (days === 1) return 'Dagsrapport'
    if (days <= 7) return 'Veckorapport'
    if (days <= 31) return 'Månadsrapport'
    return 'Periodrapport'
  }

  // Elegant footer component
  const PageFooter = ({ pageNum }) => (
    <View style={pdfStyles.footer} fixed>
      <View style={pdfStyles.footerLeft}>
        <BobotSmall size={18} />
        <Text style={pdfStyles.footerBrand}>Bobot</Text>
        <Text style={pdfStyles.footerUrl}>· www.bobot.nu</Text>
      </View>
      <Text style={pdfStyles.footerPage}>Sida {pageNum}</Text>
    </View>
  )

  return (
    <Document>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COVER PAGE - Magazine editorial feel */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={pdfStyles.coverPage}>
        <View style={pdfStyles.coverInner}>
          {/* Top accent bar */}
          <View style={pdfStyles.coverAccentBar} />

          {/* Header with brand and date */}
          <View style={pdfStyles.coverHeader}>
            <View style={pdfStyles.coverBrand}>
              <BobotSmall size={28} />
              <Text style={pdfStyles.coverBrandText}>Bobot</Text>
            </View>
            <View style={pdfStyles.coverDateBadge}>
              <Text style={pdfStyles.coverDateText}>{formatDateRange()}</Text>
            </View>
          </View>

          {/* Main content - dramatic center focus */}
          <View style={pdfStyles.coverMain}>
            <View style={pdfStyles.coverMascot}>
              <BobotMascot size={120} />
            </View>
            <View style={pdfStyles.coverTitleWrap}>
              <Text style={pdfStyles.coverEyebrow}>Prestationsrapport</Text>
              <Text style={pdfStyles.coverTitle}>{getReportTitle()}</Text>
              <Text style={pdfStyles.coverSubtitle}>
                En sammanfattning av hur Bobot har hjälpt er{'\n'}
                och insikter för att förbättra kundupplevelsen.
              </Text>
            </View>
          </View>

          {/* Footer stats preview */}
          <View style={pdfStyles.coverFooter}>
            <View>
              <Text style={pdfStyles.coverFooterLabel}>Konversationer</Text>
              <Text style={pdfStyles.coverFooterValue}>{analytics.total_conversations}</Text>
            </View>
            <View>
              <Text style={pdfStyles.coverFooterLabel}>Svarsfrekvens</Text>
              <Text style={pdfStyles.coverFooterValue}>{answerRate}%</Text>
            </View>
            <View>
              <Text style={pdfStyles.coverFooterLabel}>Tid sparad</Text>
              <Text style={pdfStyles.coverFooterValue}>~{timeSaved} min</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 1 - Executive Summary with Hero Metrics */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={pdfStyles.page}>
        <CornerAccent position="topRight" />

        {/* Page header */}
        <View style={pdfStyles.pageHeader}>
          <Text style={pdfStyles.pageNumber}>01</Text>
          <Text style={pdfStyles.pageTitle}>Översikt</Text>
          <View style={pdfStyles.pageDivider} />
        </View>

        {/* Hero metrics - large, dramatic numbers */}
        <View style={pdfStyles.heroMetricsGrid}>
          <View style={pdfStyles.heroMetricCardAccent}>
            <Text style={pdfStyles.heroMetricValueWhite}>{analytics.total_conversations}</Text>
            <Text style={pdfStyles.heroMetricLabelWhite}>Konversationer</Text>
          </View>
          <View style={pdfStyles.heroMetricCard}>
            <Text style={pdfStyles.heroMetricValue}>{answerRate}%</Text>
            <Text style={pdfStyles.heroMetricLabel}>Besvarade</Text>
          </View>
          <View style={pdfStyles.heroMetricCard}>
            <Text style={pdfStyles.heroMetricValue}>{satisfactionRate}%</Text>
            <Text style={pdfStyles.heroMetricLabel}>Nöjda</Text>
          </View>
        </View>

        {/* Visual metrics with full-width progress bars */}
        <View style={pdfStyles.insightRow}>
          <View style={pdfStyles.visualMetricCard}>
            <Text style={pdfStyles.visualMetricLabel}>Svarsfrekvens</Text>
            <Text style={pdfStyles.visualMetricValue}>{answerRate}%</Text>
            <View style={pdfStyles.visualMetricProgressRow}>
              <ProgressBar percent={Number(answerRate)} width={180} height={8} color={colors.sage} />
            </View>
            <Text style={pdfStyles.visualMetricDesc}>
              {Number(answerRate) >= 80 ? 'Utmärkt! De flesta frågor besvaras.' :
               Number(answerRate) >= 60 ? 'Bra, men det finns utrymme för förbättring.' :
               'Överväg att utöka kunskapsbasen.'}
            </Text>
          </View>
          <View style={pdfStyles.visualMetricCard}>
            <Text style={pdfStyles.visualMetricLabel}>Nöjdhetsgrad</Text>
            <Text style={pdfStyles.visualMetricValue}>{satisfactionRate}%</Text>
            <View style={pdfStyles.visualMetricProgressRow}>
              <ProgressBar percent={Number(satisfactionRate)} width={180} height={8} color={colors.terracotta} />
            </View>
            <Text style={pdfStyles.visualMetricDesc}>
              {Number(satisfactionRate) >= 80 ? 'Fantastiskt! Användarna uppskattar Bobot.' :
               Number(satisfactionRate) >= 60 ? 'Användarna är nöjda överlag.' :
               'Granska negativ feedback för förbättringar.'}
            </Text>
          </View>
        </View>

        {/* Callout box */}
        <View style={pdfStyles.calloutBox}>
          <Text style={pdfStyles.calloutText}>
            Under denna period har Bobot hanterat {analytics.total_conversations} konversationer och sparat
            uppskattningsvis {timeSaved} minuter av er arbetstid – motsvarande cirka {Math.round(timeSaved / 60)} timmar.
          </Text>
        </View>

        <PageFooter pageNum={1} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 2 - Feedback & Satisfaction */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={pdfStyles.page}>
        <CornerAccent position="topRight" />

        <View style={pdfStyles.pageHeader}>
          <Text style={pdfStyles.pageNumber}>02</Text>
          <Text style={pdfStyles.pageTitle}>Användarfeedback</Text>
          <View style={pdfStyles.pageDivider} />
        </View>

        {/* Feedback cards */}
        <View style={pdfStyles.feedbackRow}>
          <View style={pdfStyles.feedbackCardSuccess}>
            <Text style={pdfStyles.feedbackEmoji}>👍</Text>
            <Text style={pdfStyles.feedbackValue}>{analytics.feedback_stats?.helpful || 0}</Text>
            <Text style={pdfStyles.feedbackLabel}>Hjälpsamma svar</Text>
          </View>
          <View style={pdfStyles.feedbackCardWarning}>
            <Text style={pdfStyles.feedbackEmoji}>👎</Text>
            <Text style={pdfStyles.feedbackValue}>{analytics.feedback_stats?.not_helpful || 0}</Text>
            <Text style={pdfStyles.feedbackLabel}>Behöver förbättras</Text>
          </View>
          <View style={pdfStyles.feedbackCard}>
            <Text style={pdfStyles.feedbackEmoji}>💬</Text>
            <Text style={pdfStyles.feedbackValue}>{analytics.feedback_stats?.no_feedback || 0}</Text>
            <Text style={pdfStyles.feedbackLabel}>Ingen feedback</Text>
          </View>
        </View>

        {/* Activity breakdown */}
        <View style={pdfStyles.insightCardWide}>
          <View style={pdfStyles.insightHeader}>
            <Text style={pdfStyles.insightTitle}>Aktivitet</Text>
            <View style={pdfStyles.insightBadge}>
              <Text style={pdfStyles.insightBadgeText}>Senaste data</Text>
            </View>
          </View>
          <View style={pdfStyles.dataRow}>
            <Text style={pdfStyles.dataRowLabel}>Idag</Text>
            <Text style={pdfStyles.dataRowValue}>{analytics.conversations_today} konversationer</Text>
          </View>
          <View style={pdfStyles.dataRow}>
            <Text style={pdfStyles.dataRowLabel}>Senaste 7 dagarna</Text>
            <Text style={pdfStyles.dataRowValue}>{analytics.conversations_week} konversationer</Text>
          </View>
          <View style={pdfStyles.dataRowLast}>
            <Text style={pdfStyles.dataRowLabel}>Genomsnittlig svarstid</Text>
            <Text style={pdfStyles.dataRowValue}>{avgResponseTime} sekunder</Text>
          </View>
        </View>

        {/* Language distribution */}
        {Object.keys(analytics.language_stats || {}).length > 0 && (
          <View style={pdfStyles.dataList}>
            <View style={pdfStyles.dataListHeader}>
              <Text style={[pdfStyles.dataListHeaderText, { flex: 1 }]}>Språkfördelning</Text>
              <Text style={[pdfStyles.dataListHeaderText, { width: 80, textAlign: 'right' }]}>Andel</Text>
            </View>
            {Object.entries(analytics.language_stats || {})
              .sort((a, b) => b[1] - a[1])
              .map(([lang, count], idx, arr) => {
                const percent = ((count / langTotal) * 100).toFixed(0)
                return (
                  <View style={idx === arr.length - 1 ? pdfStyles.dataRowLast : pdfStyles.dataRow} key={lang}>
                    <View style={pdfStyles.dataRowNumber}>
                      <Text style={pdfStyles.dataRowNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={pdfStyles.dataRowLabel}>{langNames[lang] || lang}</Text>
                    <Text style={pdfStyles.dataRowValue}>{percent}%</Text>
                    <View style={pdfStyles.dataRowBar}>
                      <View style={[pdfStyles.dataRowBarFill, { width: `${percent}%` }]} />
                    </View>
                  </View>
                )
              })}
          </View>
        )}

        <PageFooter pageNum={2} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 3 - Categories & Activity Patterns */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(Object.keys(analytics.category_stats || {}).length > 0 || Object.keys(analytics.hourly_stats || {}).length > 0) && (
        <Page size="A4" style={pdfStyles.page}>
          <CornerAccent position="topRight" />

          <View style={pdfStyles.pageHeader}>
            <Text style={pdfStyles.pageNumber}>03</Text>
            <Text style={pdfStyles.pageTitle}>Analys & Mönster</Text>
            <View style={pdfStyles.pageDivider} />
          </View>

          {/* Categories */}
          {Object.keys(analytics.category_stats || {}).length > 0 && (
            <View style={[pdfStyles.dataList, { marginBottom: 24 }]}>
              <View style={pdfStyles.dataListHeader}>
                <Text style={[pdfStyles.dataListHeaderText, { flex: 1 }]}>Populära kategorier</Text>
                <Text style={[pdfStyles.dataListHeaderText, { width: 60, textAlign: 'right' }]}>Frågor</Text>
              </View>
              {Object.entries(analytics.category_stats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([cat, count], idx, arr) => {
                  const percent = ((count / categoryTotal) * 100).toFixed(0)
                  return (
                    <View style={idx === arr.length - 1 ? pdfStyles.dataRowLast : pdfStyles.dataRow} key={cat}>
                      <View style={pdfStyles.dataRowNumber}>
                        <Text style={pdfStyles.dataRowNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={pdfStyles.dataRowLabel}>{cat}</Text>
                      <Text style={pdfStyles.dataRowValue}>{count}</Text>
                      <View style={pdfStyles.dataRowBar}>
                        <View style={[pdfStyles.dataRowBarFill, { width: `${percent}%` }]} />
                      </View>
                    </View>
                  )
                })}
            </View>
          )}

          {/* Peak hours */}
          {Object.keys(analytics.hourly_stats || {}).length > 0 && (
            <View style={pdfStyles.insightCardWide}>
              <View style={pdfStyles.insightHeader}>
                <Text style={pdfStyles.insightTitle}>Mest aktiva tider</Text>
              </View>
              {Object.entries(analytics.hourly_stats || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([hour, count], idx, arr) => (
                  <View style={idx === arr.length - 1 ? pdfStyles.dataRowLast : pdfStyles.dataRow} key={hour}>
                    <View style={pdfStyles.dataRowNumber}>
                      <Text style={pdfStyles.dataRowNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={pdfStyles.dataRowLabel}>Klockan {hour}:00</Text>
                    <Text style={pdfStyles.dataRowValue}>{count} konversationer</Text>
                  </View>
                ))}
            </View>
          )}

          <PageFooter pageNum={3} />
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 4 - Unanswered Questions (Growth Opportunities) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {analytics.top_unanswered && analytics.top_unanswered.length > 0 && (
        <Page size="A4" style={pdfStyles.page}>
          <CornerAccent position="topRight" />

          <View style={pdfStyles.pageHeader}>
            <Text style={pdfStyles.pageNumber}>04</Text>
            <Text style={pdfStyles.pageTitle}>Kunskapsluckor</Text>
            <View style={pdfStyles.pageDivider} />
          </View>

          {/* Intro callout */}
          <View style={pdfStyles.calloutBox}>
            <Text style={pdfStyles.calloutText}>
              Dessa frågor har ställts av användare men Bobot kunde inte hitta ett bra svar.
              Genom att lägga till dessa i kunskapsbasen kan ni förbättra svarsfrekvensen och
              göra Bobot ännu mer hjälpsam.
            </Text>
          </View>

          {/* Questions list */}
          <View style={pdfStyles.questionsList}>
            {analytics.top_unanswered.slice(0, 10).map((q, i, arr) => (
              <View
                key={i}
                style={i < arr.length - 1 ? pdfStyles.questionItem : pdfStyles.questionItemLast}
              >
                <View style={pdfStyles.questionNumber}>
                  <Text style={pdfStyles.questionNumberText}>{i + 1}</Text>
                </View>
                <Text style={pdfStyles.questionText}>{q}</Text>
              </View>
            ))}
          </View>

          {analytics.top_unanswered.length > 10 && (
            <View style={[pdfStyles.calloutBox, { marginTop: 20 }]}>
              <Text style={pdfStyles.calloutText}>
                ...och {analytics.top_unanswered.length - 10} fler frågor väntar på svar i kunskapsbasen.
              </Text>
            </View>
          )}

          <PageFooter pageNum={4} />
        </Page>
      )}
    </Document>
  )
}

function Analytics() {
  const { authFetch, token } = useContext(AuthContext)
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingQuestion, setAddingQuestion] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [exportType, setExportType] = useState(null) // 'pdf' or 'csv'
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const exportMenuRef = useRef(null)
  const datePickerRef = useRef(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch(`${API_BASE}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Kunde inte hämta analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const [exporting, setExporting] = useState(null)

  const handleAddToKnowledge = async (question) => {
    setAddingQuestion(question)
    // Navigate to knowledge page with pre-filled question
    navigate('/knowledge', { state: { prefillQuestion: question } })
  }

  const handleExport = async (type) => {
    const endpoints = {
      conversations: '/export/conversations',
      statistics: '/export/statistics',
      knowledge: '/export/knowledge'
    }

    setExporting(type)
    try {
      const response = await authFetch(`${API_BASE}${endpoints[type]}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        alert('Export misslyckades. Försök igen.')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export misslyckades: ' + error.message)
    } finally {
      setExporting(null)
    }
  }

  const handleExportKPIReport = () => {
    if (!analytics) return
    setExporting('kpi')

    try {
      // Generate comprehensive KPI report as CSV
      const today = new Date().toLocaleDateString('sv-SE')
      const satisfactionRate = analytics.feedback_stats
        ? ((analytics.feedback_stats.helpful || 0) /
            Math.max((analytics.feedback_stats.helpful || 0) + (analytics.feedback_stats.not_helpful || 0), 1) * 100).toFixed(1)
        : 0

      const reportData = [
        ['KPI-RAPPORT - BOBOT CHATTSTATISTIK'],
        ['Genererad:', today],
        [''],
        ['=== ÖVERSIKT ==='],
        ['Nyckeltal', 'Värde', 'Beskrivning'],
        ['Totala konversationer', analytics.total_conversations, 'Antal unika chattsamtal sedan start'],
        ['Totalt meddelanden', analytics.total_messages, 'Alla meddelanden (frågor + svar)'],
        ['Svarsfrekvens', `${analytics.answer_rate?.toFixed(1) || 0}%`, 'Andel frågor som AI kunde besvara'],
        ['Svarstid (snitt)', `${(analytics.avg_response_time_ms / 1000).toFixed(1)}s`, 'Genomsnittlig tid för AI-svar'],
        ['Nöjdhetsgrad', `${satisfactionRate}%`, 'Andel positiv feedback (👍)'],
        [''],
        ['=== AKTIVITET ==='],
        ['Period', 'Konversationer', 'Meddelanden'],
        ['Idag', analytics.conversations_today, analytics.messages_today],
        ['Senaste 7 dagarna', analytics.conversations_week, analytics.messages_week],
        [''],
        ['=== FRÅGEANALYS ==='],
        ['Typ', 'Antal', 'Andel'],
        ['Besvarade frågor', analytics.total_answered, `${((analytics.total_answered / Math.max(analytics.total_answered + analytics.total_unanswered, 1)) * 100).toFixed(1)}%`],
        ['Obesvarade frågor', analytics.total_unanswered, `${((analytics.total_unanswered / Math.max(analytics.total_answered + analytics.total_unanswered, 1)) * 100).toFixed(1)}%`],
        [''],
        ['=== ANVÄNDARFEEDBACK ==='],
        ['Typ', 'Antal'],
        ['Positiv (👍)', analytics.feedback_stats?.helpful || 0],
        ['Negativ (👎)', analytics.feedback_stats?.not_helpful || 0],
        ['Ingen feedback', analytics.feedback_stats?.no_feedback || 0],
        [''],
        ['=== SPRÅKFÖRDELNING ==='],
        ['Språk', 'Antal', 'Andel'],
      ]

      // Add language stats
      const langNames = { sv: 'Svenska', en: 'English', ar: 'العربية' }
      const langTotal = Object.values(analytics.language_stats || {}).reduce((a, b) => a + b, 0) || 1
      Object.entries(analytics.language_stats || {}).forEach(([lang, count]) => {
        reportData.push([langNames[lang] || lang, count, `${((count / langTotal) * 100).toFixed(1)}%`])
      })

      reportData.push([''])
      reportData.push(['=== KATEGORIER ==='])
      reportData.push(['Kategori', 'Antal frågor'])
      Object.entries(analytics.category_stats || {})
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
          reportData.push([cat, count])
        })

      // Add peak hours
      reportData.push([''])
      reportData.push(['=== AKTIVITET PER TIMME ==='])
      reportData.push(['Timme', 'Antal konversationer'])
      Object.entries(analytics.hourly_stats || {})
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .forEach(([hour, count]) => {
          reportData.push([`${hour}:00`, count])
        })

      // Add top unanswered questions
      if (analytics.top_unanswered && analytics.top_unanswered.length > 0) {
        reportData.push([''])
        reportData.push(['=== VANLIGASTE OBESVARADE FRÅGOR ==='])
        reportData.push(['Dessa frågor saknas i kunskapsbasen:'])
        analytics.top_unanswered.forEach((q, i) => {
          reportData.push([`${i + 1}. ${q}`])
        })
      }

      // Convert to CSV
      const csv = reportData.map(row =>
        row.map(cell => {
          const str = String(cell ?? '')
          // Escape quotes and wrap in quotes if contains comma or quote
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      ).join('\n')

      // Add BOM for Excel compatibility with Swedish characters
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `KPI-rapport-${dateRange.start}-till-${dateRange.end}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('KPI export failed:', error)
      alert('Export misslyckades: ' + error.message)
    } finally {
      setExporting(null)
    }
  }

  const handleExportKPIReportPDF = async () => {
    if (!analytics) return
    setExporting('kpi-pdf')
    setShowDatePicker(false)

    try {
      const blob = await pdf(<KPIReportPDF analytics={analytics} dateRange={dateRange} />).toBlob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fileName = `KPI-rapport-${dateRange.start}-till-${dateRange.end}.pdf`
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF-export misslyckades: ' + error.message)
    } finally {
      setExporting(null)
    }
  }

  const handleExportCSV = () => {
    setShowDatePicker(false)
    handleExportKPIReport()
  }

  // Open date picker for export type
  const openDatePickerForExport = (type) => {
    setExportType(type)
    setShowExportMenu(false)
    setShowDatePicker(true)
  }

  // Quick date range presets
  const setDatePreset = (preset) => {
    const end = new Date()
    let start = new Date()
    switch (preset) {
      case 'today':
        start = new Date()
        break
      case 'yesterday':
        start = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        end.setTime(start.getTime())
        break
      case 'week':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        break
    }
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    })
  }

  // Execute export after date selection
  const executeExport = () => {
    if (exportType === 'pdf') {
      handleExportKPIReportPDF()
    } else if (exportType === 'csv') {
      handleExportCSV()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Laddar statistik...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Kunde inte ladda statistik</p>
      </div>
    )
  }

  // Find max value for chart scaling
  const maxMessages = Math.max(...(analytics.daily_stats?.map(d => d.messages) || [1]), 1)

  // Calculate peak hour
  const peakHour = Object.entries(analytics.hourly_stats || {})
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Statistik</h1>
          <p className="text-text-secondary mt-1">Anonymiserad data - GDPR-säker</p>
        </div>
        <div className="flex gap-2 relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting !== null}
            className="btn btn-primary text-sm disabled:opacity-50"
          >
            {exporting === 'kpi' || exporting === 'kpi-pdf' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            )}
            KPI-rapport
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`ml-1 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Export dropdown menu */}
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 bg-bg-tertiary border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px] animate-scale-in">
              <button
                onClick={() => openDatePickerForExport('csv')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">CSV-format</div>
                  <div className="text-xs text-text-tertiary">Excel-kompatibel</div>
                </div>
              </button>
              <button
                onClick={() => openDatePickerForExport('pdf')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-secondary transition-colors border-t border-border-subtle"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <text x="6" y="18" fontSize="7" fill="currentColor" fontWeight="bold">PDF</text>
                </svg>
                <div className="text-left">
                  <div className="font-medium">PDF-format</div>
                  <div className="text-xs text-text-tertiary">Formaterad rapport</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div ref={datePickerRef} className="bg-bg-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-accent px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Välj period för export</h3>
              <p className="text-white/80 text-sm mt-1">
                {exportType === 'pdf' ? 'PDF-rapport' : 'CSV-export'}
              </p>
            </div>

            {/* Quick presets */}
            <div className="px-6 py-4 border-b border-border">
              <p className="text-sm text-text-secondary mb-3">Snabbval</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDatePreset('today')}
                  className="px-3 py-1.5 text-sm bg-bg-secondary hover:bg-accent hover:text-white rounded-lg transition-colors"
                >
                  Idag
                </button>
                <button
                  onClick={() => setDatePreset('yesterday')}
                  className="px-3 py-1.5 text-sm bg-bg-secondary hover:bg-accent hover:text-white rounded-lg transition-colors"
                >
                  Igår
                </button>
                <button
                  onClick={() => setDatePreset('week')}
                  className="px-3 py-1.5 text-sm bg-bg-secondary hover:bg-accent hover:text-white rounded-lg transition-colors"
                >
                  7 dagar
                </button>
                <button
                  onClick={() => setDatePreset('month')}
                  className="px-3 py-1.5 text-sm bg-bg-secondary hover:bg-accent hover:text-white rounded-lg transition-colors"
                >
                  30 dagar
                </button>
                <button
                  onClick={() => setDatePreset('quarter')}
                  className="px-3 py-1.5 text-sm bg-bg-secondary hover:bg-accent hover:text-white rounded-lg transition-colors"
                >
                  90 dagar
                </button>
              </div>
            </div>

            {/* Custom date range */}
            <div className="px-6 py-4">
              <p className="text-sm text-text-secondary mb-3">Eller välj datum</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-tertiary mb-1.5">Från</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    max={dateRange.end}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-tertiary mb-1.5">Till</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    min={dateRange.start}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Selected range preview */}
              <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
                <p className="text-sm text-text-secondary">
                  Vald period: <span className="font-medium text-text-primary">
                    {new Date(dateRange.start).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' – '}
                    {new Date(dateRange.end).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-bg-secondary flex gap-3 justify-end">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={executeExport}
                disabled={exporting !== null}
                className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Exporterar...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Exportera {exportType === 'pdf' ? 'PDF' : 'CSV'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Totala konversationer"
          value={analytics.total_conversations}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Totalt meddelanden"
          value={analytics.total_messages}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />
        <StatCard
          label="Svarsfrekvens"
          value={`${analytics.answer_rate.toFixed(1)}%`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          color={analytics.answer_rate >= 80 ? 'success' : analytics.answer_rate >= 50 ? 'warning' : 'error'}
        />
        <StatCard
          label="Svarstid (snitt)"
          value={analytics.avg_response_time_ms > 0 ? `${(analytics.avg_response_time_ms / 1000).toFixed(1)}s` : '-'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      {/* Today & This Week */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Idag</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-text-primary">{analytics.conversations_today}</span>
            <span className="text-text-tertiary">konversationer</span>
          </div>
          <p className="text-sm text-text-tertiary mt-1">{analytics.messages_today} meddelanden</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Senaste 7 dagarna</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-text-primary">{analytics.conversations_week}</span>
            <span className="text-text-tertiary">konversationer</span>
          </div>
          <p className="text-sm text-text-tertiary mt-1">{analytics.messages_week} meddelanden</p>
        </div>
      </div>

      {/* Chart - Last 30 days */}
      {analytics.daily_stats && analytics.daily_stats.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-text-primary mb-4">Senaste 30 dagarna</h3>
          {maxMessages === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary mx-auto mb-2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <p className="text-text-tertiary text-sm">Ingen aktivitet ännu</p>
                <p className="text-text-tertiary text-xs mt-1">Data visas när konversationer startar</p>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-stretch gap-[3px]">
              {analytics.daily_stats.map((day, index) => {
                const barHeight = maxMessages > 0 ? (day.messages / maxMessages) * 100 : 0
                return (
                  <div
                    key={index}
                    className="flex-1 h-full flex flex-col items-center group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {new Date(day.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                      <br />
                      {day.messages} meddelanden
                    </div>
                    {/* Bar container */}
                    <div className="w-full h-full flex items-end">
                      <div
                        className={`w-full rounded-t transition-all cursor-pointer ${
                          day.messages > 0 ? 'bg-accent hover:bg-accent/80' : 'bg-border-subtle'
                        }`}
                        style={{
                          height: day.messages > 0 ? `${Math.max(barHeight, 5)}%` : '4px'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex justify-between mt-2 text-xs text-text-tertiary">
            <span>30 dagar sedan</span>
            <span>Idag</span>
          </div>
        </div>
      )}

      {/* Feedback & Satisfaction - Full Width */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-text-primary">Användarfeedback</h3>
            <p className="text-sm text-text-secondary">Klicka på en kategori för att se relaterade konversationer</p>
          </div>
          <button
            onClick={() => navigate('/conversations')}
            className="btn btn-ghost text-sm"
          >
            Alla konversationer →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Helpful */}
          <button
            onClick={() => navigate('/conversations?feedback=helpful')}
            className="p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👍</span>
                <span className="font-medium text-text-primary">Hjälpsamma svar</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-success transition-colors">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-success">{analytics.feedback_stats?.helpful || 0}</span>
            <p className="text-xs text-text-tertiary mt-1">Användare tyckte svaret var bra</p>
          </button>

          {/* Not Helpful */}
          <button
            onClick={() => navigate('/conversations?feedback=not_helpful')}
            className="p-4 bg-error/5 border border-error/20 rounded-xl hover:bg-error/10 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👎</span>
                <span className="font-medium text-text-primary">Behöver förbättras</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary group-hover:text-error transition-colors">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-error">{analytics.feedback_stats?.not_helpful || 0}</span>
            <p className="text-xs text-text-tertiary mt-1">Granska för att förbättra kunskapsbasen</p>
          </button>

          {/* No Feedback */}
          <div className="p-4 bg-bg-secondary rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤷</span>
              <span className="font-medium text-text-primary">Ingen feedback</span>
            </div>
            <span className="text-3xl font-bold text-text-tertiary">{analytics.feedback_stats?.no_feedback || 0}</span>
            <p className="text-xs text-text-tertiary mt-1">Användare gav ingen feedback</p>
          </div>
        </div>

        {/* Satisfaction Rate Bar */}
        {(analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0) > 0 && (
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Nöjdhetsgrad</span>
              <span className="font-medium text-text-primary">
                {(((analytics.feedback_stats?.helpful || 0) /
                  ((analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0))) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-bg-secondary rounded-full overflow-hidden flex">
              <div
                className="h-full bg-success transition-all"
                style={{
                  width: `${((analytics.feedback_stats?.helpful || 0) /
                    ((analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0))) * 100}%`
                }}
              />
              <div
                className="h-full bg-error transition-all"
                style={{
                  width: `${((analytics.feedback_stats?.not_helpful || 0) /
                    ((analytics.feedback_stats?.helpful || 0) + (analytics.feedback_stats?.not_helpful || 0))) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Activity & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Peak Hours */}
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Aktivitet per timme</h3>
          {peakHour && peakHour[1] > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-accent-soft rounded-lg">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  {peakHour[0]}
                </div>
                <div>
                  <p className="font-medium text-text-primary">Mest aktiv kl {peakHour[0]}:00</p>
                  <p className="text-sm text-text-secondary">{peakHour[1]} konversationer</p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-1 h-24">
                {Array.from({ length: 24 }, (_, i) => {
                  const count = analytics.hourly_stats?.[String(i)] || 0
                  const maxCount = Math.max(...Object.values(analytics.hourly_stats || {}), 1)
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all cursor-pointer ${
                        String(i) === peakHour[0] ? 'bg-accent' : 'bg-accent/40 hover:bg-accent/60'
                      }`}
                      style={{ height: `${Math.max((count / maxCount) * 100, 4)}%` }}
                      title={`${String(i).padStart(2, '0')}:00 - ${count} konversationer`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-tertiary">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">Ingen tidsdata ännu</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-text-primary mb-4">Populära kategorier</h3>
          {Object.keys(analytics.category_stats || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.category_stats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([category, count], index) => {
                  const total = Object.values(analytics.category_stats).reduce((a, b) => a + b, 0)
                  const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                            index === 0 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-text-primary capitalize">{category}</span>
                        </div>
                        <span className="text-sm text-text-secondary">{count} ({percent}%)</span>
                      </div>
                      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden ml-8">
                        <div
                          className={`h-full rounded-full transition-all ${index === 0 ? 'bg-accent' : 'bg-accent/50'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">Ingen kategoridata ännu</p>
          )}
        </div>
      </div>

      {/* Top Unanswered Questions */}
      {analytics.top_unanswered && analytics.top_unanswered.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">Obesvarade frågor</h3>
              <p className="text-sm text-text-secondary">
                Klicka på "+" för att lägga till i kunskapsbasen
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {analytics.top_unanswered.map((question, index) => (
              <div key={index} className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between gap-3 group">
                <p className="text-sm text-text-primary flex-1">{question}</p>
                <button
                  onClick={() => handleAddToKnowledge(question)}
                  className="flex-shrink-0 p-2 text-text-tertiary hover:text-accent hover:bg-accent-soft rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Lägg till i kunskapsbasen"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color = 'accent' }) {
  const colorClasses = {
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  }

  return (
    <div className="card">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </div>
  )
}

export default Analytics
