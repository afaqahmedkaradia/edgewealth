import React from 'react';
import './Hero.css';

export default function Hero({ stats, onViewSignals }) {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__left">
          <div className="hero__tag">
            <span className="hero__dot" />
            {stats.marketsScanned} markets scanned · live
          </div>
          <h1 className="hero__h1">
            The market<br />
            is wrong.<br />
            <em>
              We found it.
              <svg viewBox="0 0 160 10" preserveAspectRatio="none" aria-hidden="true" fill="none">
                <path d="M2 7 Q40 2 80 7 Q120 12 158 5" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </em>
          </h1>
          <p className="hero__body">
            AI that reads prediction markets 24/7, estimates true probabilities,
            and surfaces mispriced odds — so you trade with conviction, not hope.
          </p>
          <div className="hero__actions">
            <button className="hero__btn-primary" onClick={onViewSignals}>
              View live signals
            </button>
            <a className="hero__btn-ghost" href="https://polymarket.com" target="_blank" rel="noreferrer">
              What is Polymarket?
            </a>
          </div>
        </div>

        <div className="hero__card">
          <div className="hero__card-title">Performance · last 30 days</div>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-n green">68%</span>
              <span className="hero__stat-l">Win rate</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-n">{stats.activeSignals || 12}</span>
              <span className="hero__stat-l">Active signals</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-n green">2.4×</span>
              <span className="hero__stat-l">Avg return</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-n">Free</span>
              <span className="hero__stat-l">To get started</span>
            </div>
          </div>
          <div className="hero__card-note">
            Signals are for informational purposes only. Not financial advice. Past performance does not guarantee future results.
          </div>
        </div>
      </div>
    </section>
  );
}
