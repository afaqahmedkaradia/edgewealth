// ─────────────────────────────────────────────
//  services/mockData.js
//  Used when config.features.livePolymarketData = false
//  or when the Polymarket API fails.
//  Edit these to test different UI states.
// ─────────────────────────────────────────────

export const MOCK_MARKETS = [
  {
    id: 'mock-1',
    question: 'Will the Fed cut rates at the July 2026 FOMC meeting?',
    category: 'Economy',
    marketOdds: 38,
    volume: 1420000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-2',
    question: 'Will Bitcoin close above $115,000 by end of June 2026?',
    category: 'Crypto',
    marketOdds: 44,
    volume: 3200000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-3',
    question: 'Will US CPI come in below 3.0% for the May 2026 reading?',
    category: 'Economy',
    marketOdds: 41,
    volume: 980000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-4',
    question: 'Will there be a US government shutdown in July 2026?',
    category: 'Politics',
    marketOdds: 33,
    volume: 760000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-5',
    question: 'Will Ethereum ETF see net inflows this week?',
    category: 'Crypto',
    marketOdds: 55,
    volume: 540000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-6',
    question: 'Will the NBA Finals go to 7 games?',
    category: 'Sports',
    marketOdds: 36,
    volume: 420000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-7',
    question: 'Will EU announce new crypto regulations in Q3 2026?',
    category: 'Crypto',
    marketOdds: 30,
    volume: 310000,
    url: 'https://polymarket.com',
  },
  {
    id: 'mock-8',
    question: 'Will US unemployment exceed 4.5% by Sep 2026?',
    category: 'Economy',
    marketOdds: 22,
    volume: 280000,
    url: 'https://polymarket.com',
  },
];

export const MOCK_ANALYSES = {
  'mock-1': { botEstimate: 58, confidence: 'strong', reasoning: 'Jobs data has come in softer than expected for 3 straight months. Inflation cooling persistently. Fed speakers shifted dovish.', recommendation: 'YES', positionSize: 'Medium', keyRisks: 'A hot CPI print before the meeting could reverse expectations.' },
  'mock-2': { botEstimate: 62, confidence: 'strong', reasoning: 'ETF inflows accelerated for 6 consecutive weeks. Post-halving Q2 historically strong for BTC. Options IV skewed upside.', recommendation: 'YES', positionSize: 'Medium', keyRisks: 'Macro risk-off event or surprise Fed hawkishness could derail.' },
  'mock-3': { botEstimate: 55, confidence: 'strong', reasoning: 'Energy prices dropped sharply in May. Shelter deceleration continuing. Cleveland Fed nowcast at 2.87%.', recommendation: 'YES', positionSize: 'Medium', keyRisks: 'Services inflation still sticky — could keep headline above 3%.' },
  'mock-4': { botEstimate: 20, confidence: 'strong', reasoning: 'Congressional whip count shows deal likely. Both chambers want to avoid shutdown before recess. Market overpricing tail risk.', recommendation: 'NO', positionSize: 'Medium', keyRisks: 'A surprise partisan breakdown could still force a shutdown.' },
  'mock-5': { botEstimate: 63, confidence: 'moderate', reasoning: 'Slight edge. Institutional rotation signals net positive. Low confidence — small size only.', recommendation: 'YES', positionSize: 'Small', keyRisks: 'Crypto market sentiment can shift rapidly.' },
  'mock-6': { botEstimate: 44, confidence: 'moderate', reasoning: 'Moderate edge based on series depth and historical matchup patterns. Both teams are evenly matched.', recommendation: 'YES', positionSize: 'Small', keyRisks: 'One dominant performance could end series early.' },
  'mock-7': { botEstimate: 19, confidence: 'moderate', reasoning: 'EU regulatory calendar is packed. MiCA implementation ongoing. Unlikely to rush new framework this quarter.', recommendation: 'NO', positionSize: 'Small', keyRisks: 'A major market incident could accelerate EU response.' },
  'mock-8': { botEstimate: 17, confidence: 'weak', reasoning: 'Marginal edge only. Labor market resilient, jobless claims trending low. Not a high-conviction trade.', recommendation: 'NO', positionSize: 'Avoid', keyRisks: 'Rapid tech layoffs could spike unemployment unexpectedly.' },
};
