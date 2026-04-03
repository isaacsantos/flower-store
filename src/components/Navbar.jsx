import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span className="logo-icon">🌸</span>
        <span className="logo-text">Petal & Bloom</span>
      </div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#shop">Shop</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button className="nav-cta">Order Now</button>
    </nav>
  )
}
