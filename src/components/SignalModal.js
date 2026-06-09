// components/SignalModal.js
// Full-detail view of a signal. Opened when user
// clicks a SignalCard. Add more fields here as needed.

import React from 'react';
import './SignalModal.css';

export default function SignalModal({ signal, onClose }) {
  if (!signal) return null;

  const edgeSign = signal.edge > 0 ? '+' : '';

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="modal-wrap"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Signal detail: ${signal.question}`}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__question">{signal.question}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Badges */}
        <div className="modal__badges">
          <span className={`badge badge--${signal.category?.toLowerCase()}`}>
            {signal.category}
          </span>
          <span className="modal__strength-badge">
            {signal.confidence} edge
          </span>
        </div>

        {/* AI Reasoning */}
        <div className="modal__reasoning">
          {signal.reasoning}
        </div>

        {/* Key data */}
        <div className="modal__data-grid">
          <div className="modal__data-item">
            <div className="modal__data-label">Market odds</div>
            <div className="modal__data-value modal__data-value--muted">{signal.marketOdds}%</div>
          </div>
          <div className="modal__data-item">
            <div className="modal__data-label">Bot estimate</div>
            <div className="modal__data-value">{signal.botEstimate}%</div>
          </div>
          <div className="modal__data-item">
            <div className="modal__data-label">Edge</div>
            <div className="modal__data-value">{edgeSign}{signal.edge}%</div>
          </div>
          <div className="modal__data-item">
            <div className="modal__data-label">Recommendation</div>
            <div className={`modal__data-value modal__data-value--rec-${signal.recommendation}`}>
              {signal.recommendation}
            </div>
          </div>
          <div className="modal__data-item">
            <div className="modal__data-label">Position size</div>
            <div className="modal__data-value modal__data-value--muted">{signal.positionSize}</div>
          </div>
          <div className="modal__data-item">
            <div className="modal__data-label">Confidence</div>
            <div className="modal__data-value modal__data-value--muted">{signal.confidence}</div>
          </div>
        </div>

        {/* Key risks */}
        {signal.keyRisks && (
          <div className="modal__risks">
            <span className="modal__risks-label">Key risk:</span> {signal.keyRisks}
          </div>
        )}

        {/* Actions */}
        <div className="modal__actions">
          <a
            className="modal__trade-btn"
            href={signal.url}
            target="_blank"
            rel="noreferrer"
          >
            Trade on Polymarket ↗
          </a>
        </div>
      </div>
    </div>
  );
}
