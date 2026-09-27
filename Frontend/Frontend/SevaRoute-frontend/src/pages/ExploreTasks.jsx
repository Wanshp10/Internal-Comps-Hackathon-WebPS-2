import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TaskCard from "../components/common/TaskCard.jsx";
import { useTasks } from "../hooks/useTasks.js";

export default function ExploreTasks() {
  const { tasks, loading } = useTasks();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(tasks.map(t => t.category))];
  const filtered = useMemo(() => tasks.filter(t => (category === "All" || t.category === category) &&
    `${t.title} ${t.category} ${t.summary}`.toLowerCase().includes(query.toLowerCase())), [tasks, category, query]);
  return <main className="page"><div className="container">
    <header className="page-heading"><div className="eyebrow">Service directory</div><h1>Explore government tasks</h1><p>Search the demo catalogue by service name or category. Open a task to view its roadmap, documents, and reference links.</p></header>
    <div className="filter-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search services…" aria-label="Search services"/><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter category">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
    {loading ? <p>Loading services…</p> : filtered.length ? <div className="task-grid">{filtered.map(t=><TaskCard key={t.id} task={t}/>)}</div> : <div className="empty-state">No services match. Try another search or category.</div>}
  </div></main>;
}