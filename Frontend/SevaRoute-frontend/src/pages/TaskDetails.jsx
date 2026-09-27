import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";

const readProgress = () => { try { return JSON.parse(localStorage.getItem("sevaroute-progress") || "{}"); } catch { return {}; } };
export default function TaskDetails() {
  const { taskId } = useParams();
  const { tasks } = useTasks();
  const task = tasks.find(t => t.id === taskId);
  const [tab, setTab] = useState("roadmap");
  const [progress, setProgress] = useState(readProgress);
  if (!task) return <main className="page"><div className="container empty-state">Service not found. <Link to="/tasks">Browse services</Link></div></main>;
  const items = [...task.steps.map((text,i)=>({text,key:`step-${i}`})), ...task.documents.map((text,i)=>({text,key:`doc-${i}`}))];
  const done = items.filter(x=>progress[task.id]?.[x.key]).length;
  const percent = items.length ? Math.round(done/items.length*100) : 0;
  const toggle = key => setProgress(prev => {
    const next = {...prev, [task.id]: {...(prev[task.id] || {}), [key]: !(prev[task.id] || {})[key]}};
    localStorage.setItem("sevaroute-progress", JSON.stringify(next)); return next;
  });
  return <main className="page"><div className="container">
    <Link className="back-link" to="/tasks">← Back to tasks</Link>
    <header className="page-heading detail-heading"><span className="tag">{task.category}</span><h1>{task.title}</h1><p>{task.summary}</p></header>
    <div className="detail-layout"><section className="surface">
      <div className="tabs"><button className={tab==="roadmap"?"active":""} onClick={()=>setTab("roadmap")}>Roadmap</button><button className={tab==="documents"?"active":""} onClick={()=>setTab("documents")}>Documents</button><button className={tab==="eligibility"?"active":""} onClick={()=>setTab("eligibility")}>Eligibility & fees</button></div>
      {tab==="roadmap" && <div className="roadmap-list">{task.steps.map((step,i)=><div className="roadmap-step" key={step}><span>{i+1}</span><div><h3>{step}</h3><p>Review this step and mark it complete in your checklist.</p></div></div>)}</div>}
      {tab==="documents" && task.documents.map((doc,i)=><label className="check-row" key={doc}><input type="checkbox" checked={!!progress[task.id]?.[`doc-${i}`]} onChange={()=>toggle(`doc-${i}`)}/>{doc}</label>)}
      {tab==="eligibility" && <div className="fact-list"><h3>General eligibility</h3><p>{task.eligibility}</p><h3>Fees</h3><p>{task.fee}</p><h3>Typical processing time</h3><p>{task.duration}</p><div className="notice">Requirements vary by location. Confirm current rules with the responsible authority.</div></div>}
    </section><aside className="surface"><div className="eyebrow">Your progress</div><div className="progress-label"><b>{percent}% complete</b><span>{done}/{items.length} items</span></div><div className="progress-track"><span style={{width:`${percent}%`}}/></div>
      <h3 className="checklist-title">Checklist</h3>{items.map(item=><label className={`check-row ${progress[task.id]?.[item.key]?"checked":""}`} key={item.key}><input type="checkbox" checked={!!progress[task.id]?.[item.key]} onChange={()=>toggle(item.key)}/>{item.text}</label>)}
      <button className="btn btn-quiet" onClick={()=>{const next={...progress,[task.id]:{}};setProgress(next);localStorage.setItem("sevaroute-progress",JSON.stringify(next));}}>Reset checklist</button>
      <div className="department-box"><b>Department</b><p>{task.department}</p><Link to="/sources">Browse references →</Link></div>
    </aside></div>
  </div></main>;
}