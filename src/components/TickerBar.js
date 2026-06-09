// components/TickerBar.js
import React from 'react';
import './TickerBar.css';

export default function TickerBar({ signals }) {
  // Build ticker items from top signals
  const items = signals.slice(0, 8).map(s => ({
    name:  s.question.substring(0, 28) + '…',
    value: `${s.marketOdds}%`,
    edge:  `${s.edge > 0 ? '+' : ''}${s.edge}%`,
    dir:   s.edge > 0 ? 'up' : 'dn',
  }));

  if (!items.length) return null;

  return (
    <div className="ticker" role="marquee" aria-label="Live signal ticker">
      {items.map((t, i) => (
        <div className="ticker__item" key={i}>
          <span className="ticker__name">{t.name}</span>
          <span className="ticker__val">{t.value}</span>
          <span className={`ticker__edge ticker__edge--${t.dir}`}>{t.edge}</span>
        </div>
      ))}
    </div>
  );
}
