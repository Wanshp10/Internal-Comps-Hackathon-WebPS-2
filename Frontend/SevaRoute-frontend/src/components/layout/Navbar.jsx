import { NavLink, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

const links = [["Explore tasks", "/tasks"], ["Assistant", "/assistant"], ["Roadmap", "/roadmap"], ["Sources", "/sources"]];
export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  return <header className="topbar"><div className="container nav-row">
    <Link className="brand" to="/"><span className="brand-mark">S</span>SevaRoute</Link>
    <nav className="nav-links" aria-label="Main navigation">
      {links.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>{label}</NavLink>)}
    </nav>
    <div className="nav-actions">
      <button className="theme-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === "light" ? "☾" : "☼"}</button>
      <Link className="btn" to="/login">Log in</Link>
      <Link className="btn btn-primary" to="/assistant">Get started</Link>
    </div>
  </div></header>;
}