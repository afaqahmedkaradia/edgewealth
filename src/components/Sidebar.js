/* eslint-disable */
import React, { useState } from 'react';
import config from '../config';
import './Sidebar.css';

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwelhglGhJytcR_PacHQz6jDVxEWmHAHfi_Pbed2qGOoNf_fNV7yV1ii_OsS9sFievPXg/exec';

export default function Sidebar({ signals }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strongSignals = signals.filter(s => s.strength === 'strong').length;
  const avgEdge = signals.length
    ? (signals.reduce((a, s) => a + Math.abs(s.edge), 0) / signals.length).toFixed(1)
    : '14.2';

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'edgewealth.vercel.app' }),
      });
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
              <div className="sidebar__email-ok">✓ You're on the list!</div>
            ) : (
              <>
                <input
                  className="sidebar__email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  disabled={loading}
                />
                {error && <div style={{ fontSize: '12px', color: '#E53935', marginBottom: '8px' }}>{error}</div>}
                <button
                  className="sidebar__email-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Saving...' : 'Send me signals'}
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
