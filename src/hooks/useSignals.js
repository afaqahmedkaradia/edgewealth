/* eslint-disable */
import { useState, useEffect, useCallback } from 'react';
import config from '../config';
import { fetchPolymarkets } from '../services/polymarket';
import { analyzeMarket } from '../services/claude';
import { MOCK_MARKETS, MOCK_ANALYSES } from '../services/mockData';

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
    try {
      let markets;
      if (config.features.livePolymarketData) {
        try { markets = await fetchPolymarkets(); }
        catch (e) { markets = MOCK_MARKETS; }
      } else {
        markets = MOCK_MARKETS;
      }
      setAnalyzing(true);
      setProgress({ done: 0, total: markets.length });
      let results = [];
      if (config.features.aiAnalysis && config.anthropicApiKey) {
        const allResults = await Promise.allSettled(markets.map(m => analyzeMarket(m)));
        allResults.forEach((result, j) => {
          const market = markets[j];
          results.push(buildSignal(market, result.status === 'fulfilled' ? result.value : null));
        });
        setProgress({ done: markets.length, total: markets.length });
      } else {
        results = markets.map(m => buildSignal(m, MOCK_ANALYSES[m.id] || null));
        setProgress({ done: markets.length, total: markets.length });
      }
      const sorted = results.filter(s => s.edge !== 0).sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge)).slice(0, config.maxSignalsToShow);
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
  useEffect(() => {
    if (!config.refreshIntervalMs) return;
    const id = setInterval(load, config.refreshIntervalMs);
    return () => clearInterval(id);
  }, [load]);

  return { signals, loading, analyzing, error, lastUpdated, progress, refresh: load };
}

function buildSignal(market, analysis) {
  const botEstimate = analysis?.botEstimate ?? market.marketOdds;
  const edge = botEstimate - market.marketOdds;
  const absEdge = Math.abs(edge);
  const strength = absEdge >= config.edgeThresholds.strong ? 'strong' : absEdge >= config.edgeThresholds.moderate ? 'moderate' : 'weak';
  return {
    ...market, botEstimate, edge, strength,
    confidence: analysis?.confidence ?? 'weak',
    reasoning: analysis?.reasoning ?? 'Analysis unavailable.',
    recommendation: analysis?.recommendation ?? (edge > 0 ? 'YES' : 'NO'),
    positionSize: analysis?.positionSize ?? 'Avoid',
    keyRisks: analysis?.keyRisks ?? '',
  };
}
