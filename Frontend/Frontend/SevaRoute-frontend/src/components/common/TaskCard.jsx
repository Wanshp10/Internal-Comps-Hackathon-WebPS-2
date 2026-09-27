import { Link } from "react-router-dom";

export default function TaskCard({ task }) {
  return <article className="task-card">
    <div className="task-card-top"><span className="tag">{task.category}</span><span className="card-arrow">↗</span></div>
    <h3>{task.title}</h3><p>{task.summary}</p>
    <Link className="card-link" to={`/tasks/${task.id}`}>View steps & documents <span>→</span></Link>
  </article>;
}