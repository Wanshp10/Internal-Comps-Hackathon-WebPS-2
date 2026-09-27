import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-row">
        <div>
          <Link className="footer-brand" to="/">
            SevaRoute
          </Link>
          <p>A clearer path through civic services.</p>
        </div>

        <p>Illustrative guidance · Verify details with official authorities</p>

        <div className="footer-links">
          <Link to="/sources">Sources</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
