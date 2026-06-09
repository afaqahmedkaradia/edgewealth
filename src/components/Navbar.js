import React from 'react';
import './Navbar.css';

export default function Navbar({ onGetSignals }) {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo">edge<span>wealth</span></div>
        <div className="navbar__links">
          <button className="navbar__link">How it works</button>
          <button className="navbar__link">Pricing</button>
          <button className="navbar__link">Track record</button>
        </div>
        <button className="navbar__cta" onClick={onGetSignals}>Get started</button>
      </div>
    </nav>
  );
}
