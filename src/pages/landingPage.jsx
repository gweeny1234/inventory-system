import { Link } from "react-router-dom";
import "./landingPage.css";

// Deterministic bar heights for the barcode / stock-level divider —
// reads like a barcode at a glance, like a mini stock chart up close.
const DIVIDER_BARS = Array.from({ length: 46 }).map((_, i) => ({
  height: Math.round(Math.abs(Math.sin(i * 0.55)) * 34 + 10),
  amber: i % 7 === 0,
}));

export default function LandingPage() {
  return (
    <div className="landing">

      <nav className="navbar">
        <h2>Inventory</h2>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <Link to="/login" className="login-btn">
            Log In
          </Link>

          
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">● Live stock tracking</span>

          <h1>Know what's in stock, before it runs out.</h1>

          <p>
            Manage products, categories, suppliers and orders
            with one modern dashboard — built for teams who'd
            rather prevent a stockout than explain one.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="primary-btn">
              Log In
            </Link>

            
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="preview-card">
            <div className="preview-card-header">
              <span><span className="preview-dot"></span>Low Stock Alert</span>
              <span>Live</span>
            </div>
            <div className="preview-row">
              <span>Laptop Computer</span>
              <span className="low">1 left</span>
            </div>
            <div className="preview-row">
              <span>Wireless Mouse</span>
              <span className="low">1 left</span>
            </div>
            <div className="preview-row">
              <span>USB-C Cable</span>
              <span>24 left</span>
            </div>
          </div>
        </div>
      </section>

      <div className="stock-divider" aria-hidden="true">
        {DIVIDER_BARS.map((bar, i) => (
          <span
            key={i}
            className={`bar${bar.amber ? " amber" : ""}`}
            style={{ height: `${bar.height}px` }}
          ></span>
        ))}
      </div>

      <section id="features" className="features-wrap">
        <div className="features-intro">
          <span className="features-eyebrow">What you get</span>
          <h2>Everything the stockroom needs</h2>
          <p>
            Four tools that cover the full loop — from receiving
            stock to fulfilling the order it was bought for.
          </p>
        </div>

        <div className="features">
          <div className="card">
            <h3>📦 Products</h3>
            <p>Track every SKU, price and stock count in one searchable list.</p>
          </div>

          <div className="card">
            <h3>🗂 Categories</h3>
            <p>Group products so reporting and reordering stay organized.</p>
          </div>

          <div className="card">
            <h3>🚚 Suppliers</h3>
            <p>Keep contact details on hand for every restock call.</p>
          </div>

          <div className="card">
            <h3>🛒 Orders</h3>
            <p>Follow each order from pending to fulfilled, in real time.</p>
          </div>
        </div>
      </section>

      <footer>
        © 2026 Jen's Inventory
        <span className="build-tag">Inventory Management System</span>
      </footer>

    </div>
  );
}
