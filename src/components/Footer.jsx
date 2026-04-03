import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">🌸 Petal & Bloom</span>
          <p>Bringing nature's beauty to your doorstep, one bouquet at a time.</p>
        </div>
        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li>Bouquets</li>
            <li>Seasonal</li>
            <li>Gifts</li>
            <li>Subscriptions</li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Help</h4>
          <ul>
            <li>FAQ</li>
            <li>Delivery Info</li>
            <li>Returns</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h4>Stay in Bloom</h4>
          <p>Get weekly deals and flower tips.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="your@email.com" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Petal & Bloom. Made with 🌹 and lots of love.</p>
      </div>
    </footer>
  )
}
