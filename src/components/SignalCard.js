// components/SignalCard.js
// A single signal row in the feed.
// To add new fields to the card, edit the JSX below
// and update the signal shape in hooks/useSignals.js

import React from 'react';
import './SignalCard.css';

const CATEGORY_CLASS = {
  Crypto:   'badge--crypto',
  Politics: 'badge--politics',
  Economy:  'badge--economy',
  Sports:   'badge--sports',
  Other:    'badge--other',
};

export default function SignalCard({ signal, onClick }) {
  const edgeSign = signal.edge > 0 ? '+' : '';

  return (
    <article
      className={`signal-card signal-card--${signal.strength}`}
      onClick={() => onClick(signal)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(signal)}
      aria-label={`Signal: ${signal.question}`}
    >
      <div className="signal-card__left">
        <div className="signal-card__question">{signal.question}</div>
        <div className="signal-card__meta">
          <span className={`badge ${CATEGORY_CLASS[signal.category] || 'badge--other'}`}>
            {signal.category}
          </span>
          <span className="signal-card__odds">
            Market <strong>{signal.marketOdds}%</strong>
          </span>
          <span className="signal-card__odds signal-card__odds--bot">
            Bot <strong>{signal.botEstimate}%</strong>
          </span>
        </div>
      </div>

      <div className="signal-card__right">
        <div className={`signal-card__edge signal-card__edge--${signal.strength}`}>
          {edgeSign}{signal.edge}%
        </div>
        <div className="signal-card__edge-label">edge</div>
        <div className={`signal-card__rec signal-card__rec--${signal.recommendation}`}>
          {signal.recommendation}
        </div>
      </div>
    </article>
  );
}
