// ─────────────────────────────────────────────
//  EdgeWealth — Central Configuration
//  Edit this file to change API keys, thresholds,
//  categories, and feature flags.
// ─────────────────────────────────────────────

const config = {
  // ── Anthropic API ──────────────────────────
  // Add your Anthropic API key here (or via .env)
  anthropicApiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',

  // ── Polymarket ─────────────────────────────
  // Public API — no key needed for reading markets
  polymarketApiBase: 'https://gamma-api.polymarket.com',

  // ── Edge Detection ─────────────────────────
  // Minimum % difference between market odds and
  // bot estimate to surface a signal
  edgeThresholds: {
    strong:   14,   // >= 14% edge  → orange highlight
    moderate:  7,   // >= 7% edge   → muted highlight
    weak:      0,   // anything below → shown but dimmed
  },

  // ── Signal Feed ────────────────────────────
  maxMarketsToScan:    50,   // how many Polymarket markets to fetch
  maxSignalsToShow:    20,   // max signals shown in the feed
  refreshIntervalMs: 300000, // auto-refresh every 5 minutes (set 0 to disable)

  // ── Categories ─────────────────────────────
  // Add or rename categories here — components pick them up automatically
  categories: ['All', 'Crypto', 'Politics', 'Economy', 'Sports', 'Other'],

  // ── AI Model ───────────────────────────────
  claudeModel: 'claude-sonnet-4-20250514',
  claudeMaxTokens: 600,

  // ── Feature Flags ──────────────────────────
  // Toggle features on/off without deleting code
  features: {
    livePolymarketData: true,   // false = use mock data (good for testing UI)
    aiAnalysis:         true,   // false = skip Claude API calls
    emailCapture:       true,   // show/hide email signup
    affiliateLinks:     true,   // show/hide Polymarket affiliate link
    performanceTracker: true,   // show/hide sidebar stats
    tickerBar:          true,   // show/hide top ticker
  },

  // ── Affiliate ──────────────────────────────
  polymarketReferralUrl: 'https://polymarket.com',   // replace with your referral link

  // ── Branding ───────────────────────────────
  appName:    'EdgeWealth',
  tagline:    'Stop the finance idle. Find your edge.',
  heroHeadline: ['Stop the', 'finance idle.', 'Find your edge.'],
  accentWord: 'idle.', // word that gets the wavy underline
};

export default config;
