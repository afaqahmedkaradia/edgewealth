// App.js — Root component
// This is the main layout. Each section is a separate
// component — swap, hide, or reorder them freely.

import React, { useState, useRef } from 'react';
import './styles/global.css';
import config from './config';

import Navbar      from './components/Navbar';
import Hero        from './components/Hero';
import TickerBar   from './components/TickerBar';
import SignalFeed  from './components/SignalFeed';
import Sidebar     from './components/Sidebar';
import SignalModal from './components/SignalModal';

import { useSignals } from './hooks/useSignals';

export default function App() {
  const [activeSignal, setActiveSignal] = useState(null);
  const feedRef = useRef(null);

  const {
    signals,
    loading,
    analyzing,
    error,
    lastUpdated,
    progress,
    refresh,
  } = useSignals();

  function scrollToFeed() {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const heroStats = {
    marketsScanned: signals.length || config.maxMarketsToScan,
    activeSignals:  signals.filter(s => s.strength !== 'weak').length,
    winRate:        '68%',
    avgRoi:         '2.4×',
  };

  return (
    <div className="app">
      <Navbar onGetSignals={scrollToFeed} />
      <Hero stats={heroStats} onViewSignals={scrollToFeed} />
      {config.features.tickerBar && signals.length > 0 && (
        <TickerBar signals={signals} />
      )}
      <div className="app__main" ref={feedRef}>
        {error && (
          <div className="app__error">
            ⚠ {error} — showing cached data.
          </div>
        )}
        <div className="app__body">
          <SignalFeed
            signals={signals}
            loading={loading}
            analyzing={analyzing}
            progress={progress}
            lastUpdated={lastUpdated}
            onSignalClick={setActiveSignal}
            onRefresh={refresh}
          />
          <Sidebar signals={signals} />
        </div>
      </div>
      {activeSignal && (
        <SignalModal
          signal={activeSignal}
          onClose={() => setActiveSignal(null)}
        />
      )}
    </div>
  );
}
