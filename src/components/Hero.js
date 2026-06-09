// components/Hero.js
import React from 'react';
import './Hero.css';

export default function Hero({ stats, onViewSignals }) {
  return (
    <section className="hero">
      <div className="hero__tag">
        <span className="hero__dot" />
        {stats.marketsScanned} markets scanned · live
      </div>

      <h1 className="hero__h1">
        Stop the<br />
        finance{' '}
        <span className="hero__accent">
          idle.
          {/* Wavy SVG underline — Vestox signature element */}
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 7 Q25 2 50 7 Q75 12 98 5" stroke="#FF5C1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </span>
        <br />
        Find your edge.
      </h1>

      <p className="hero__body">
        Our AI scans prediction markets around the clock, estimates true
        probabilities from real data, and surfaces the gap — so you trade
        with conviction, not hope.
      </p>

      <div className="hero__stats">
        <div className="hero__stat">
          <span className="hero__stat-n">{stats.winRate}</span>
          <span className="hero__stat-l">Win rate · 30d</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-n">{stats.activeSignals}</span>
          <span className="hero__stat-l">Live signals</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-n">{stats.avgRoi}</span>
          <span className="hero__stat-l">Avg ROI</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-n">Free</span>
          <span className="hero__stat-l">To start</span>
        </div>
      </div>

      <div className="hero__actions">
        <button className="hero__btn-primary" onClick={onViewSignals}>
          View live signals
        </button>
        <a
          className="hero__btn-ghost"
          href="https://polymarket.com"
          target="_blank"
          rel="noreferrer"
        >
          What is Polymarket? ↗
        </a>
      </div>
    </section>
  );
}
