import React from 'react';
import './customer.css';

export default function Home() {
  const handleCustomer = () => {
    window.location.replace('/table');
  };

  const handleHotel = () => {
    window.location.replace('/register');
  };

  return (
    <div className="bghome">
      <div className="home-overlay">
        <div className="home-card">
          <div className="home-brand">
            <span className="home-brand-icon">🍽️</span>
            <h1 className="home-brand-name">DINE-IN</h1>
            <p className="home-brand-tagline">Smart Dining Experience</p>
          </div>

          <div className="home-divider" />

          <p className="home-subtitle">
            Scan your table QR code, browse our menu,<br />place your order & pay — all from your seat.
          </p>

          <div className="home-features">
            <span className="home-feature-chip">📲 Scan & Order</span>
            <span className="home-feature-chip">🛒 Easy Cart</span>
            <span className="home-feature-chip">💳 Quick Pay</span>
          </div>

          <button className="home-btn home-btn-primary" onClick={handleCustomer}>
            🍴 Start Ordering
          </button>
          <button className="home-btn home-btn-secondary" onClick={handleHotel}>
            🔑 Restaurant Admin
          </button>
        </div>
      </div>
    </div>
  );
}
