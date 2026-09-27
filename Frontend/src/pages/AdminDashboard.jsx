import { useState } from "react";
import { initialTasks } from "../data/tasks.js";
import { useTasks } from "../hooks/useTasks.js";

const KEY = "sevaroute-admin-tasks";
function getSaved() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } }
export default function AdminDashboard() {
  const { tasks: baseTasks } = useTasks();
  const [custom, setCustom] = useState(() => getSaved() || []);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal documents");
  const [summary, setSummary] = useState("");
  const all = [...baseTasks.filter(t=>!custom.some(c=>c.id===t.id)), ...custom];
  const add = e => {
    e.preventDefault();
    const task = { id: `custom-${Date.now()}`, title: title.trim(), category, summary: summary.trim() || "Custom demo service.", department: "Confirm with the relevant local authority", eligibility: "Confirm with the relevant authority.", fee: "Confirm with the relevant authority.", duration: "Varies; confirm with the relevant authority.", documents: ["Confirm required documents with the authority"], steps: ["Check official eligibility and requirements.", "Prepare required documents.", "Apply through the official authority.", "Track the application."], sources: [{label:"India government services portal",url:"https://services.india.gov.in/"}] };
    const next = [...custom, task]; setCustom(next); localStorage.setItem(KEY, JSON.stringify(next)); setTitle(""); setSummary("");
  };
  const remove = id => { const next=custom.filter(t=>t.id!==id); setCustom(next); localStorage.setItem(KEY,JSON.stringify(next)); };
  return <main className="page"><div className="container">
    <header className="page-heading"><div className="eyebrow">Local content management</div><h1>Admin dashboard</h1><p>Manage demo service entries stored in this browser. This is not connected to a secure admin backend.</p></header>
    <div className="two-column"><section className="surface"><div className="eyebrow">Add a service</div><h2 className="serif-heading">Create catalogue entry</h2>
      <form onSubmit={add}><label className="field-label" htmlFor="title">Service name</label><input id="title" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Trade License"/><label className="field-label" htmlFor="category">Category</label><select id="category" value={category} onChange={e=>setCategory(e.target.value)}>{["Personal documents","Business & finance","Community & events","Education","Housing","Other"].map(x=><option key={x}>{x}</option>)}</select><label className="field-label" htmlFor="summary">Description</label><textarea id="summary" value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Short service description"/><button className="btn btn-primary" type="submit">Add service +</button></form>
    </section><section className="surface"><div className="eyebrow">Catalogue overview</div><h2 className="serif-heading">{all.length} services</h2><p>Demo entries are stored in this browser only. The initial catalogue contains {initialTasks.length} sample services.</p><div className="notice">Production admin needs server-side authentication, validation, and persistent database storage.</div></section></div>
    <section className="surface admin-list"><h2 className="serif-heading">Custom entries</h2>{custom.length===0 ? <p>No custom services added yet.</p> : custom.map(t=><div className="admin-row" key={t.id}><div><b>{t.title}</b><small>{t.category}</small></div><button className="btn btn-small" onClick={()=>remove(t.id)}>Remove</button></div>)}</section>
  </div></main>;
}