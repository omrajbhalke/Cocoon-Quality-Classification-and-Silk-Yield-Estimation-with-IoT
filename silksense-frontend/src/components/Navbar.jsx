import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        Silk<span className="brand-accent">Sense</span>
        <span className="nav-version">AI v3</span>
      </div>
      <div className="nav-links">
        <NavLink to="/"          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink>
        <NavLink to="/cocoons"   className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About Cocoons</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link nav-link--cta active' : 'nav-link nav-link--cta'}>Dashboard</NavLink>
      </div>
    </nav>
  )
}
