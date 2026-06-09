// ─────────────────────────────────────────────
//  services/claude.js
//  Calls the Anthropic API to estimate the true
//  probability for a prediction market question
//  and generate an edge analysis.
//
//  To change the AI model or prompt style,
//  edit the SYSTEM_PROMPT and buildPrompt() below.
// ─────────────────────────────────────────────

import config from '../config';

const SYSTEM_PROMPT = `You are a sharp prediction market analyst. 
Your job is to estimate the TRUE probability of a yes/no market question 
using your knowledge of current events, base rates, and reasoning.

Always respond with ONLY valid JSON in this exact shape:
{
  "botEstimate": <integer 0-100>,
  "confidence": "strong" | "moderate" | "weak",
  "reasoning": "<2-3 sentence explanation of why you think the market is mispriced or correctly priced>",
  "recommendation": "YES" | "NO" | "SKIP",
  "positionSize": "Large" | "Medium" | "Small" | "Avoid",
  "keyRisks": "<one sentence on what could invalidate this signal>"
}

Be calibrated and honest. If the market price seems correct, say so.
Do NOT add any text outside the JSON object.`;

function buildPrompt(market) {
  return `Market question: "${market.question}"
Current market odds (Yes): ${market.marketOdds}%
Category: ${market.category}
Volume: $${Math.round((market.volume || 0)).toLocaleString()}

What is the true probability of this resolving YES? 
Is this market mispriced? Provide your analysis.`;
}

export async function analyzeMarket(market) {
  if (!config.anthropicApiKey) {
    throw new Error('No Anthropic API key set. Add REACT_APP_ANTHROPIC_API_KEY to your .env file.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      config.claudeModel,
      max_tokens: config.claudeMaxTokens,
      system:     SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildPrompt(market) }
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse Claude response as JSON');
  }
}

// Deep-dive: asks Claude for a more thorough analysis
export async function deepDiveMarket(market, initialAnalysis) {
  if (!config.anthropicApiKey) {
    throw new Error('No Anthropic API key set.');
  }

  const prompt = `Prediction market: "${market.question}"
Market odds: ${market.marketOdds}%
Our bot's estimate: ${initialAnalysis.botEstimate}%
Edge: ${initialAnalysis.botEstimate - market.marketOdds}%
Initial reasoning: ${initialAnalysis.reasoning}

Provide a deeper analysis covering:
1. What specific data or events support this edge?
2. Historical base rates for similar events
3. What could move the market against this position?
4. Optimal entry timing and position sizing advice`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      config.claudeModel,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || 'Analysis unavailable.';
}
