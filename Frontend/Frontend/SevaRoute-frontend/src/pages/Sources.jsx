import { useTasks } from "../hooks/useTasks.js";

export default function Sources() {
  const { tasks } = useTasks();
  const all = tasks.flatMap(task => task.sources.map(source => ({...source, task: task.title})));
  const unique = [...new Map(all.map(s=>[s.url,s])).values()];
  return <main className="page"><div className="container">
    <header className="page-heading"><div className="eyebrow">Reference library</div><h1>Official sources</h1><p>Public portals to help you verify service details. Sample guidance is illustrative; confirm current rules, fees, eligibility, and application links directly with the responsible authority.</p></header>
    <section className="surface"><div className="notice">Always confirm that you are using an official government website and that the information applies to your state or local authority.</div>
      {unique.map(source=><div className="source-row" key={source.url}><span className="source-icon">↗</span><div><h3>{source.label}</h3><p>Referenced for: {all.filter(x=>x.url===source.url).map(x=>x.task).join(", ")}</p><a href={source.url} target="_blank" rel="noreferrer">{source.url} ↗</a></div></div>)}
    </section>
  </div></main>;
}