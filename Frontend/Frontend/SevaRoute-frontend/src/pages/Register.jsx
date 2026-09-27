import { Link } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const [message, setMessage] = useState("");
  const submit = e => { e.preventDefault(); setMessage("Demo registration only: account creation is not connected to a backend."); };
  return <main className="page"><div className="container auth-container"><section className="surface auth-card">
    <div className="eyebrow">Get started</div><h1>Create an account</h1><p>Registration UI preview. Backend authentication can be connected later.</p>
    <form onSubmit={submit}><label className="field-label" htmlFor="name">Full name</label><input id="name" placeholder="Your name" required/><label className="field-label" htmlFor="email">Email</label><input id="email" type="email" placeholder="you@example.com" required/><label className="field-label" htmlFor="password">Password</label><input id="password" type="password" minLength="6" placeholder="At least 6 characters" required/><button className="btn btn-primary full-width" type="submit">Create account →</button></form>
    {message && <div className="notice" role="status">{message}</div>}<p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p><div className="notice">Demo only. Do not use a real password; details are not sent to a server.</div>
  </section></div></main>;
}