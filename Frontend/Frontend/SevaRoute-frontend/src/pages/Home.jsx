import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskCard from "../components/common/TaskCard.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import { useTasks } from "../hooks/useTasks.js";

export default function Home() {
  const { tasks } = useTasks();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const search = e => { e.preventDefault(); navigate(`/tasks${query ? `?q=${encodeURIComponent(query)}` : ""}`); };
  return <>
    <section className="hero"><div className="container hero-grid">
      <div><div className="eyebrow">Civic services, made understandable</div>
        <h1>Your government journey.<br/><em>Made simpler.</em></h1>
        <p className="lead">Find clear, step-by-step guidance for public services. Understand eligibility, prepare documents, identify the right department, and keep track of your next steps.</p>
        <SearchBar value={query} onChange={setQuery} placeholder="What do you need help with?" onSubmit={search}/>
        <div className="chips"><span>Try:</span>{["Birth Certificate", "Domicile Certificate", "Small Business"].map(s=><button className="chip" key={s} onClick={()=>navigate(`/tasks?q=${encodeURIComponent(s)}`)}>{s}</button>)}</div>
      </div>
      <div className="hero-art"><div className="arch-shape"/><div className="roadmap-preview"><h3>Your roadmap at a glance</h3>
        {["Check eligibility", "Prepare documents", "Find the department", "Submit & track"].map((s,i)=><div className="mini-step" key={s}><span>{i+1}</span><div><b>{s}</b><small>{["See whether the service fits your situation","Know what to gather before applying","Identify the relevant office or portal","Keep track of your progress"][i]}</small></div></div>)}
      </div></div>
    </div></section>
    <div className="container"><div className="benefits">{[["▤","Clear roadmaps","Know what to do next"],["☑","Document checklists","Prepare with confidence"],["↗","Official references","Find government portals"],["◷","Progress tracking","Save completed steps"]].map(([icon,title,desc])=><div className="benefit" key={title}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div></div>)}</div></div>
    <section className="section"><div className="container"><div className="section-heading"><div><div className="eyebrow">Start with a service</div><h2>Popular tasks</h2><p>Explore common civic procedures and see the steps, documents, and references in one place.</p></div><button className="btn" onClick={()=>navigate("/tasks")}>Explore all tasks →</button></div>
      <div className="task-grid">{tasks.slice(0,3).map(task=><TaskCard task={task} key={task.id}/>)}</div>
    </div></section>
    <section className="steps-band"><div className="container"><div className="section-heading"><div><div className="eyebrow">A clearer path</div><h2>How SevaRoute works</h2><p>Move from a question to an organized checklist, one step at a time.</p></div></div>
      <div className="how-grid">{[["Tell us your goal","Choose a government service or describe what you need."],["Review your roadmap","See common steps, documents, and department details."],["Work through the checklist","Mark items as you prepare and complete them."],["Use official references","Open public portals to confirm current rules."]].map(([h,p],i)=><div className="how-item" key={h}><span>{i+1}</span><h3>{h}</h3><p>{p}</p></div>)}</div>
    </div></section>
    <section className="section"><div className="container"><div className="callout"><div><h2>Ready to find your next step?</h2><p>Search the service catalogue or tell the assistant what you are trying to do.</p></div><button className="btn btn-light" onClick={()=>navigate("/assistant")}>Open service assistant →</button></div></div></section>
  </>;
}