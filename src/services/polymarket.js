// ─────────────────────────────────────────────
//  services/polymarket.js
//  Fetches live prediction markets from Polymarket's
//  public Gamma API. No API key required.
//
//  To add a new data source:
//  1. Create a new file in /services/
//  2. Export a fetchMarkets() function that returns
//     the same shape: { id, question, category,
//     marketOdds, volume, url }
//  3. Import and call it in hooks/useSignals.js
// ─────────────────────────────────────────────

import axios from 'axios';
import config from '../config';

// Maps Polymarket tag strings to our categories
const TAG_CATEGORY_MAP = {
  crypto:      'Crypto',
  bitcoin:     'Crypto',
  ethereum:    'Crypto',
  politics:    'Politics',
  election:    'Politics',
  government:  'Politics',
  economics:   'Economy',
  economy:     'Economy',
  fed:         'Economy',
  inflation:   'Economy',
  sports:      'Sports',
  nba:         'Sports',
  nfl:         'Sports',
  soccer:      'Sports',
};

function detectCategory(market) {
  const text = (market.question + ' ' + (market.tags || []).join(' ')).toLowerCase();
  for (const [keyword, cat] of Object.entries(TAG_CATEGORY_MAP)) {
    if (text.includes(keyword)) return cat;
  }
  return 'Other';
}

// Fetch active binary markets from Polymarket
export async function fetchPolymarkets() {
  try {
    const response = await axios.get(`${config.polymarketApiBase}/markets`, {
      params: {
        active:   true,
        closed:   false,
        limit:    config.maxMarketsToScan,
        order:    'volume24hr',
        ascending: false,
      },
      timeout: 10000,
    });

    const markets = response.data || [];

    return markets
      .filter(m => m.outcomes && m.outcomePrices && m.outcomes.length === 2)
      .map(m => {
        let yesPrice = 50;
        try {
          const prices = JSON.parse(m.outcomePrices);
          const outcomes = JSON.parse(m.outcomes);
          const yesIndex = outcomes.findIndex(o =>
            o.toLowerCase() === 'yes'
          );
          yesPrice = Math.round(parseFloat(prices[yesIndex >= 0 ? yesIndex : 0]) * 100);
        } catch {
          yesPrice = 50;
        }

        return {
          id:          m.id || m.conditionId,
          question:    m.question,
          category:    detectCategory(m),
          marketOdds:  yesPrice,       // current Yes price as %
          volume:      m.volume || 0,
          url:         `https://polymarket.com/event/${m.slug || m.id}`,
          endDate:     m.endDate,
          rawData:     m,              // full raw market for future use
        };
      });
  } catch (err) {
    console.error('[Polymarket] Fetch failed:', err.message);
    throw err;
  }
}
