import { Link } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";

export default function Roadmap() {
  const { tasks } = useTasks();
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("sevaroute-progress") || "{}"); } catch {}
  const active = tasks.map(task => {
    const items = [...task.steps.map((_,i)=>`step-${i}`), ...task.documents.map((_,i)=>`doc-${i}`)];
    const done = items.filter(key=>saved[task.id]?.[key]).length;
    return { task, done, total: items.length, percent: items.length ? Math.round(done/items.length*100) : 0 };
  }).filter(x=>x.done>0);
  return <main className="page"><div className="container">
    <header className="page-heading"><div className="eyebrow">Your journey</div><h1>Roadmap & progress</h1><p>Your checklist progress is saved in this browser. Select a service to continue or review progress.</p></header>
    {!active.length ? <div className="empty-panel"><div className="empty-icon">☑</div><h2 className="serif-heading">Your roadmap starts here</h2><p>Open a service and tick off documents or steps as you complete them. Your progress will appear here.</p><Link className="btn btn-primary" to="/tasks">Choose a service →</Link></div> :
      <div className="task-grid">{active.map(({task,done,total,percent})=><article className="task-card" key={task.id}><span className="tag">{task.category}</span><h3>{task.title}</h3><div className="progress-label"><span>{done} of {total} items</span><b>{percent}%</b></div><div className="progress-track"><span style={{width:`${percent}%`}}/></div><Link className="btn btn-primary card-button" to={`/tasks/${task.id}`}>Continue roadmap →</Link></article>)}</div>}
  </div></main>;
}