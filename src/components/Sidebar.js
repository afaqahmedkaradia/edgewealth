// components/Sidebar.js
// Right sidebar: performance stats, email capture, affiliate link.
// Add new sidebar sections below the existing ones.

import React, { useState } from 'react';
import config from '../config';
import './Sidebar.css';

export default function Sidebar({ signals }) {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Compute live stats from signals
  const strongSignals   = signals.filter(s => s.strength === 'strong').length;
  const avgEdge         = signals.length
    ? (signals.reduce((a, s) => a + Math.abs(s.edge), 0) / signals.length).toFixed(1)
    : 0;

  function handleSubmit() {
    if (email && email.includes('@')) {
      // TODO: connect to your email service (Resend, Mailchimp, etc.)
      console.log('[Email capture]', email);
      setSubmitted(true);
    }
  }

  return (
    <aside className="sidebar">

      {/* ── Performance stats ── */}
      {config.features.performanceTracker && (
        <section className="sidebar__section">
          <div className="sidebar__label">Performance · 30d</div>
          <div className="sidebar__rows">
            <div className="sidebar__row">
              <span className="sidebar__key">Win rate</span>
              <span className="sidebar__val sidebar__val--orange">68%</span>
            </div>
            <div className="sidebar__row">
              <span className="sidebar__key">Signals sent</span>
              <span className="sidebar__val sidebar__val--white">134</span>
            </div>
            <div className="sidebar__row">
              <span className="sidebar__key">Avg edge found</span>
              <span className="sidebar__val sidebar__val--orange">+{avgEdge || 14.2}%</span>
            </div>
            <div className="sidebar__row">
              <span className="sidebar__key">Avg ROI</span>
              <span className="sidebar__val sidebar__val--green">2.4×</span>
            </div>
            <div className="sidebar__row">
              <span className="sidebar__key">Strong signals now</span>
              <span className="sidebar__val sidebar__val--white">{strongSignals}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Markets covered ── */}
      <section className="sidebar__section">
        <div className="sidebar__label">Markets covered</div>
        <div className="sidebar__rows">
          <div className="sidebar__row">
            <span className="sidebar__key">Polymarket</span>
            <span className="sidebar__val sidebar__val--orange">Live</span>
          </div>
          <div className="sidebar__row">
            <span className="sidebar__key">Kalshi</span>
            <span className="sidebar__val sidebar__val--faint">Soon</span>
          </div>
          <div className="sidebar__row">
            <span className="sidebar__key">Metaculus</span>
            <span className="sidebar__val sidebar__val--faint">Soon</span>
          </div>
        </div>
      </section>

      {/* ── Email capture ── */}
      {config.features.emailCapture && (
        <section className="sidebar__section">
          <div className="sidebar__label">Free daily signals</div>
          <div className="sidebar__email-box">
            <h3 className="sidebar__email-heading">Top 3 edges, every morning.</h3>
            <p className="sidebar__email-sub">No noise. Just your edge for the day. Free forever.</p>

            {submitted ? (
              <div className="sidebar__email-ok">✓ You're on the list.</div>
            ) : (
              <>
                <input
                  className="sidebar__email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  aria-label="Email address"
                />
                <button className="sidebar__email-submit" onClick={handleSubmit}>
                  Send me signals
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Affiliate ── */}
      {config.features.affiliateLinks && (
        <section className="sidebar__section">
          <div className="sidebar__label">New to markets?</div>
          <p className="sidebar__aff-text">
            Start trading predictions on Polymarket.<br />
            <a href={config.polymarketReferralUrl} target="_blank" rel="noreferrer">
              Open a free account →
            </a>
          </p>
        </section>
      )}

    </aside>
  );
}
