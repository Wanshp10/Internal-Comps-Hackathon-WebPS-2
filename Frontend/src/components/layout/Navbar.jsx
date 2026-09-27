import { NavLink, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

const links = [
  ["Explore tasks", "/tasks"],
  ["Assistant", "/assistant"],
  ["Roadmap", "/roadmap"],
  ["Sources", "/sources"],
];

function SevaRouteMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 42 42" role="presentation">
        <path
          d="M21 4.5 34 10v9.3c0 8.2-5.1 14.8-13 18.2-7.9-3.4-13-10-13-18.2V10L21 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M14.3 20.8 18.7 25l9.2-9.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="container nav-row">
        <Link className="brand" to="/" aria-label="SevaRoute home">
          <SevaRouteMark />
          <span>SevaRoute</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {links.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="theme-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "☾" : "☀"}
          </button>

          <Link className="btn btn-compact" to="/login">
            Log in
          </Link>

          <Link className="btn btn-primary btn-compact" to="/assistant">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
