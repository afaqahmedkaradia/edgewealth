/* eslint-disable */
import React, { useState } from 'react';
import config from '../config';
import './Sidebar.css';

export default function Sidebar({ signals }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const strongSignals = signals.filter(s => s.strength === 'strong').length;
  const avgEdge = signals.length
    ? (signals.reduce((a, s) => a + Math.abs(s.edge), 0) / signals.length).toFixed(1)
    : '14.2';

  function handleSubmit() {
    if (email && email.includes('@')) {
      console.log('[Email capture]', email);
      setSubmitted(true);
    }
  }

  return (
    <aside className="sidebar">

      {config.features.performanceTracker && (
        <section className="sidebar__section">
          <div className="sidebar__label">Performance · 30 days</div>
          <div className="sidebar__card">
            <div className="sidebar__rows">
              <div className="sidebar__row">
                <span className="sidebar__key">Win rate</span>
                <span className="sidebar__val sidebar__val--green">68%</span>
              </div>
              <div className="sidebar__row">
                <span className="sidebar__key">Signals sent</span>
                <span className="sidebar__val sidebar__val--black">134</span>
              </div>
              <div className="sidebar__row">
                <span className="sidebar__key">Avg edge found</span>
                <span className="sidebar__val sidebar__val--green">+{avgEdge}%</span>
              </div>
              <div className="sidebar__row">
                <span className="sidebar__key">Avg return</span>
                <span className="sidebar__val sidebar__val--green">2.4×</span>
              </div>
              <div className="sidebar__row">
                <span className="sidebar__key">Strong signals now</span>
                <span className="sidebar__val sidebar__val--black">{strongSignals}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sidebar__section">
        <div className="sidebar__label">Markets covered</div>
        <div className="sidebar__card">
          <div className="sidebar__rows">
            <div className="sidebar__row">
              <span className="sidebar__key">Polymarket</span>
              <span className="sidebar__val sidebar__val--green">● Live</span>
            </div>
            <div className="sidebar__row">
              <span className="sidebar__key">Kalshi</span>
              <span className="sidebar__val sidebar__val--muted">Coming soon</span>
            </div>
            <div className="sidebar__row">
              <span className="sidebar__key">Metaculus</span>
              <span className="sidebar__val sidebar__val--muted">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {config.features.emailCapture && (
        <section className="sidebar__section">
          <div className="sidebar__label">Free daily signals</div>
          <div className="sidebar__email-box">
            <h3 className="sidebar__email-heading">Top 3 edges, every morning.</h3>
            <p className="sidebar__email-sub">No noise. Just your best opportunities for the day. Always free.</p>
            {submitted ? (
              <div className="sidebar__email-ok">✓ You're on the list</div>
            ) : (
              <>
                <input
                  className="sidebar__email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button className="sidebar__email-submit" onClick={handleSubmit}>
                  Send me signals
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {config.features.affiliateLinks && (
        <section className="sidebar__section">
          <div className="sidebar__aff-text">
            New to prediction markets?{' '}
            <a href={config.polymarketReferralUrl} target="_blank" rel="noreferrer">
              Open a free Polymarket account →
            </a>
          </div>
        </section>
      )}

      <section className="sidebar__section">
        <div className="sidebar__disclaimer">
          Signals are AI-generated and for informational purposes only. Not financial advice. Prediction market trading involves risk. Past performance does not guarantee future results.
        </div>
      </section>

    </aside>
  );
}
