import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const submit = e => { e.preventDefault(); setMessage("Demo sign-in only: no server authentication is connected."); };
  return <main className="page"><div className="container auth-container"><section className="surface auth-card">
    <div className="eyebrow">Welcome back</div><h1>Log in to SevaRoute</h1><p>Pick up where you left off. Authentication is currently a frontend demo.</p>
    <form onSubmit={submit}><label className="field-label" htmlFor="email">Email</label><input id="email" type="email" placeholder="you@example.com" required/><label className="field-label" htmlFor="password">Password</label><input id="password" type="password" placeholder="Demo password" required/><button className="btn btn-primary full-width" type="submit">Log in →</button></form>
    {message && <div className="notice" role="status">{message}</div>}<p className="auth-switch">New here? <Link to="/register">Create an account</Link></p><div className="notice">Do not enter a real password. This form does not verify credentials or create a secure session.</div>
  </section></div></main>;
}