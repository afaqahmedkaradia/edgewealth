// ─────────────────────────────────────────────
//  hooks/useSignals.js
//  Core data hook. Fetches markets, runs AI analysis,
//  and returns processed signals to the UI.
//
//  To add a new data source:
//  Import its fetchMarkets() here and merge the
//  results into the `markets` array below.
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import config from '../config';
import { fetchPolymarkets } from '../services/polymarket';
import { analyzeMarket } from '../services/claude';
import { MOCK_MARKETS, MOCK_ANALYSES } from '../services/mockData';

export function useSignals() {
  const [signals,      setSignals]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [analyzing,    setAnalyzing]    = useState(false);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [progress,     setProgress]     = useState({ done: 0, total: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ── Step 1: Fetch markets ───────────────
      let markets;
      if (config.features.livePolymarketData) {
        try {
          markets = await fetchPolymarkets();
        } catch (e) {
          console.warn('[useSignals] Polymarket fetch failed, falling back to mock data:', e.message);
          markets = MOCK_MARKETS;
        }
      } else {
        markets = MOCK_MARKETS;
      }

      // ── Step 2: AI analysis ────────────────
      setAnalyzing(true);
      setProgress({ done: 0, total: markets.length });

      let results = [];

      if (config.features.aiAnalysis && config.anthropicApiKey) {
        // Analyze markets concurrently in batches of 5
        const batchSize = 5;
        for (let i = 0; i < markets.length; i += batchSize) {
          const batch = markets.slice(i, i + batchSize);
          const batchResults = await Promise.allSettled(
            batch.map(m => analyzeMarket(m))
          );

          batchResults.forEach((result, j) => {
            const market = batch[j];
            if (result.status === 'fulfilled') {
              results.push(buildSignal(market, result.value));
            } else {
              // Analysis failed — still show market with fallback
              results.push(buildSignal(market, null));
            }
          });

          setProgress(p => ({ ...p, done: Math.min(i + batchSize, markets.length) }));
        }
      } else {
        // Use mock analyses when AI is disabled or no key set
        results = markets.map(m => buildSignal(m, MOCK_ANALYSES[m.id] || null));
        setProgress({ done: markets.length, total: markets.length });
      }

      // ── Step 3: Filter & sort ───────────────
      const sorted = results
        .filter(s => s.edge !== 0)                        // skip zero-edge
        .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge)) // highest edge first
        .slice(0, config.maxSignalsToShow);

      setSignals(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh
  useEffect(() => {
    if (!config.refreshIntervalMs) return;
    const id = setInterval(load, config.refreshIntervalMs);
    return () => clearInterval(id);
  }, [load]);

  return { signals, loading, analyzing, error, lastUpdated, progress, refresh: load };
}

// ── Helpers ──────────────────────────────────

function buildSignal(market, analysis) {
  const botEstimate = analysis?.botEstimate ?? market.marketOdds;
  const edge        = botEstimate - market.marketOdds;
  const absEdge     = Math.abs(edge);

  const strength =
    absEdge >= config.edgeThresholds.strong   ? 'strong'   :
    absEdge >= config.edgeThresholds.moderate ? 'moderate' : 'weak';

  return {
    ...market,
    botEstimate,
    edge,
    strength,
    confidence:    analysis?.confidence    ?? 'weak',
    reasoning:     analysis?.reasoning     ?? 'Analysis unavailable.',
    recommendation:analysis?.recommendation ?? (edge > 0 ? 'YES' : 'NO'),
    positionSize:  analysis?.positionSize  ?? 'Avoid',
    keyRisks:      analysis?.keyRisks      ?? '',
  };
}
