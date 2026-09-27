import { Link } from "react-router-dom";
export default function NotFound() {
  return <main className="page"><div className="container not-found"><div className="eyebrow">404 · Page not found</div><h1>This path doesn't exist.</h1><p>Let's get you back to a useful starting point.</p><Link className="btn btn-primary" to="/">Back to home →</Link></div></main>;
}