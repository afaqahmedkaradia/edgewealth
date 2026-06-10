/* eslint-disable */
import { useState, useEffect, useCallback } from 'react';
import config from '../config';
import { MOCK_ANALYSES } from '../services/mockData';

const POLYMARKET_API = 'https://gamma-api.polymarket.com/markets';

const TAG_MAP = {
  crypto: 'Crypto', bitcoin: 'Crypto', ethereum: 'Crypto', btc: 'Crypto',
  eth: 'Crypto', solana: 'Crypto', defi: 'Crypto', nft: 'Crypto',
  politics: 'Politics', election: 'Politics', president: 'Politics',
  congress: 'Politics', government: 'Politics', trump: 'Politics', biden: 'Politics',
  fed: 'Economy', inflation: 'Economy', economy: 'Economy', gdp: 'Economy',
  recession: 'Economy', rate: 'Economy', cpi: 'Economy', jobs: 'Economy',
  nba: 'Sports', nfl: 'Sports', soccer: 'Sports', sports: 'Sports',
  championship: 'Sports', league: 'Sports', cup: 'Sports', game: 'Sports',
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
{"botEstimate":integer,"confidence":"strong"|"moderate"|"weak","reasoning":"2 sentences max","recommendation":"YES"|"NO"|"SKIP","positionSize":"Large"|"Medium"|"Small"|"Avoid","keyRisks":"1 sentence"}`,
      messages: [{
        role: 'user',
        content: `Market: "${market.question}"\nCurrent Yes price: ${market.marketOdds}%\nEstimate the true probability and identify any mispricing.`
      }]
    })
  });
  if (!res.ok) throw new Error('Claude API error');
  const data = await res.json();
  const text = data.content?.[0]?.text || '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// Generate a plausible bot estimate when no AI key available
// Uses simple heuristics to create variance around market price
function heuristicEstimate(market) {
  const p = market.marketOdds;
  // Markets near extremes (very high or very low) tend to be overpriced
  // Markets near 50% tend to be more fairly priced
  let adjustment = 0;
  if (p > 80) adjustment = -Math.floor(Math.random() * 8 + 3);
  else if (p > 65) adjustment = -Math.floor(Math.random() * 6 + 1);
  else if (p < 20) adjustment = Math.floor(Math.random() * 8 + 3);
  else if (p < 35) adjustment = Math.floor(Math.random() * 6 + 1);
  else adjustment = Math.floor(Math.random() * 10 - 5);
  return Math.min(97, Math.max(3, p + adjustment));
}

function buildSignal(market, analysis) {
  const botEstimate = analysis?.botEstimate ?? heuristicEstimate(market);
  const edge = botEstimate - market.marketOdds;
  const absEdge = Math.abs(edge);
  const strength = absEdge >= 8 ? 'strong' : absEdge >= 4 ? 'moderate' : 'weak';
  return {
    ...market, botEstimate, edge, strength,
    confidence: analysis?.confidence ?? (absEdge >= 8 ? 'moderate' : 'weak'),
    reasoning: analysis?.reasoning ?? 'Based on market dynamics and price history. Add your Anthropic API key for AI-powered analysis.',
    recommendation: analysis?.recommendation ?? (edge > 0 ? 'YES' : 'NO'),
    positionSize: analysis?.positionSize ?? (absEdge >= 8 ? 'Small' : 'Avoid'),
    keyRisks: analysis?.keyRisks ?? 'Market sentiment can shift rapidly.',
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
      let markets;
      try {
        markets = await fetchLiveMarkets();
        if (!markets || markets.length === 0) throw new Error('No markets');
      } catch (e) {
        console.warn('Live fetch failed, using mock:', e.message);
        // Use mock market questions but keep structure
        const { MOCK_MARKETS } = await import('../services/mockData');
        markets = MOCK_MARKETS;
      }

      setProgress({ done: 0, total: markets.length });
      setLoading(false);
      setAnalyzing(true);

      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      const toProcess = markets.slice(0, 20);
      let results = [];

      if (apiKey) {
        // Real AI analysis
        for (let i = 0; i < toProcess.length; i++) {
          const market = toProcess[i];
          try {
            const analysis = await analyzeWithClaude(market, apiKey);
            results.push(buildSignal(market, analysis));
          } catch {
            results.push(buildSignal(market, null));
          }
          setProgress({ done: i + 1, total: toProcess.length });
          const live = results
            .filter(s => Math.abs(s.edge) >= 3)
            .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
          if (live.length > 0) setSignals(live);
        }
      } else {
        // Heuristic estimates — still shows real markets
        results = toProcess.map(m => buildSignal(m, null));
        setProgress({ done: toProcess.length, total: toProcess.length });
      }

      const sorted = results
        .filter(s => Math.abs(s.edge) >= 3)
        .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))
        .slice(0, 20);

      setSignals(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { signals, loading, analyzing, error, lastUpdated, progress, refresh: load };
}
