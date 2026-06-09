// components/SignalFeed.js
// The main signal list with category filters.
// To add a new filter, edit config/index.js → categories.

import React, { useState } from 'react';
import SignalCard from './SignalCard';
import config from '../config';
import './SignalFeed.css';

export default function SignalFeed({ signals, loading, analyzing, progress, onSignalClick, onRefresh, lastUpdated }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? signals
    : signals.filter(s => s.category === activeFilter);

  const timeAgo = lastUpdated
    ? `updated ${Math.round((Date.now() - lastUpdated) / 60000)} min ago`
    : '';

  return (
    <div className="feed">
      {/* Header */}
      <div className="feed__header">
        <span className="feed__title">Signal feed</span>
        <div className="feed__header-right">
          {timeAgo && <span className="feed__updated">{timeAgo}</span>}
          <button className="feed__refresh" onClick={onRefresh} disabled={loading || analyzing}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="feed__filters" role="tablist" aria-label="Category filters">
        {config.categories.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeFilter === cat}
            className={`feed__filter ${activeFilter === cat ? 'feed__filter--active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {(loading || analyzing) && (
        <div className="feed__loading">
          {loading   && <span>Fetching markets…</span>}
          {analyzing && <span>Analyzing {progress.done}/{progress.total} with AI…</span>}
          <div className="feed__progress">
            <div
              className="feed__progress-bar"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Signal cards */}
      {!loading && (
        <div className="feed__cards">
          {filtered.length === 0 ? (
            <div className="feed__empty">
              No signals found in this category right now.
            </div>
          ) : (
            filtered.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onClick={onSignalClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
