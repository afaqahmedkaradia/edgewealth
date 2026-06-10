/* eslint-disable */
import { useState, useEffect, useCallback } from 'react';
import config from '../config';
import { MOCK_MARKETS, MOCK_ANALYSES } from '../services/mockData';

const POLYMARKET_API = 'https://gamma-api.polymarket.com/markets';

const TAG_MAP = {
  crypto: 'Crypto', bitcoin: 'Crypto', ethereum: 'Crypto', btc: 'Crypto',
  eth: 'Crypto', solana: 'Crypto', defi: 'Crypto',
  politics: 'Politics', election: 'Politics', president: 'Politics',
  congress: 'Politics', government: 'Politics', trump: 'Politics',
  fed: 'Economy', inflation: 'Economy', economy: 'Economy',
  gdp: 'Economy', recession: 'Economy', rate: 'Economy',
  nba: 'Sports', nfl: 'Sports', soccer: 'Sports', sports: 'Sports',
  world: 'Sports', championship: 'Sports',
};

function getCategory(question) {
  const q = question.toLowerCase();
  for (const [kw, cat] of Object.entries(TAG_MAP)) {
    if (q.includes(kw)) return cat;
  }
  return 'Other';
}

async function fetchLiveMarkets() {
  const res = await fetch(
    `${POLYMARKET_API}?active=true&closed=false&limit=50&order=volume24hr&ascending=false`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!res.ok) throw new Error('Polymarket API error');
  const data = await res.json();

  return data
    .filter(m => {
      try {
        const outcomes = JSON.parse(m.outcomes || '[]');
        const prices = JSON.parse(m.outcomePrices || '[]');
        return outcomes.length === 2 && prices.length === 2;
      } catch { return false; }
    })
    .map(m => {
      let yesPrice = 50;
      try {
        const outcomes = JSON.parse(m.outcomes);
        const prices = JSON.parse(m.outcomePrices);
        const yesIdx = outcomes.findIndex(o => o.toLowerCase() === 'yes');
        const idx = yesIdx >= 0 ? yesIdx : 0;
        yesPrice = Math.round(parseFloat(prices[idx]) * 100);
      } catch { yesPrice = 50; }

      return {
        id: m.id || m.conditionId,
        question: m.question,
        category: getCategory(m.question),
        marketOdds: yesPrice,
        volume: m.volume || 0,
        url: `https://polymarket.com/event/${m.slug || m.id}`,
      };
    });
}

async function analyzeWithClaude(market, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: `You are a prediction market analyst. Respond ONLY with valid JSON, no other text:
{"botEstimate":integer,"confidence":"strong"|"moderate"|"weak","reasoning":"2 sentences","recommendation":"YES"|"NO"|"SKIP","positionSize":"Large"|"Medium"|"Small"|"Avoid","keyRisks":"1 sentence"}`,
      messages: [{
        role: 'user',
        content: `Market: "${market.question}"\nCurrent Yes price: ${market.marketOdds}%\nIs this mispriced? What is the true probability?`
      }]
    })
  });
  if (!res.ok) throw new Error('Claude API error');
  const data = await res.json();
  const text = data.content?.[0]?.text || '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function buildSignal(market, analysis) {
  const botEstimate = analysis?.botEstimate ?? market.marketOdds;
  const edge = botEstimate - market.marketOdds;
  const absEdge = Math.abs(edge);
  const strength = absEdge >= 14 ? 'strong' : absEdge >= 7 ? 'moderate' : 'weak';
  return {
    ...market, botEstimate, edge, strength,
    confidence: analysis?.confidence ?? 'weak',
    reasoning: analysis?.reasoning ?? 'Based on available market data.',
    recommendation: analysis?.recommendation ?? (edge > 0 ? 'YES' : 'NO'),
    positionSize: analysis?.positionSize ?? 'Avoid',
    keyRisks: analysis?.keyRisks ?? '',
  };
}

export function useSignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSignals([]);

    try {
      // Step 1: fetch live markets
      let markets;
      try {
        markets = await fetchLiveMarkets();
        if (!markets || markets.length === 0) throw new Error('No markets returned');
      } catch (e) {
        console.warn('Live fetch failed, using mock:', e.message);
        markets = MOCK_MARKETS;
      }

      setProgress({ done: 0, total: markets.length });
      setLoading(false);
      setAnalyzing(true);

      // Step 2: AI analysis if key available
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      let results = [];

      if (apiKey) {
        // Analyze top 20 markets to save API costs
        const toAnalyze = markets.slice(0, 20);
        for (let i = 0; i < toAnalyze.length; i++) {
          const market = toAnalyze[i];
          try {
            const analysis = await analyzeWithClaude(market, apiKey);
            results.push(buildSignal(market, analysis));
          } catch {
            results.push(buildSignal(market, MOCK_ANALYSES[market.id] || null));
          }
          setProgress({ done: i + 1, total: toAnalyze.length });
          // Show signals as they come in
          const sorted = results
            .filter(s => Math.abs(s.edge) >= 7)
            .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
          setSignals(sorted);
        }
      } else {
        // No API key — use mock analyses with live market questions
        results = markets.slice(0, 20).map((m, i) => {
          const mockKeys = Object.keys(MOCK_ANALYSES);
          const mockAnalysis = MOCK_ANALYSES[mockKeys[i % mockKeys.length]];
          return buildSignal(m, mockAnalysis);
        });
        setProgress({ done: markets.length, total: markets.length });
      }

      const sorted = results
        .filter(s => Math.abs(s.edge) >= 5)
        .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))
        .slice(0, 20);

      setSignals(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      // Always fall back to mock
      const fallback = MOCK_MARKETS.map(m => buildSignal(m, MOCK_ANALYSES[m.id] || null));
      setSignals(fallback);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { signals, loading, analyzing, error, lastUpdated, progress, refresh: load };
}
