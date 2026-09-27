import { useState } from "react";
import { Link } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";
import { askAssistant } from "../services/aiService.js";

export default function Assistant() {
  const { tasks } = useTasks();
  const [goal, setGoal] = useState("");
  const [match, setMatch] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault(); setMatch(null); setReply("");
    const normalized = goal.toLowerCase();
    const found = tasks.find(t => t.title.toLowerCase().split(/\s+/).some(w => w.length > 3 && normalized.includes(w))) ||
      tasks.find(t => `${t.title} ${t.summary} ${t.id}`.toLowerCase().includes(normalized.trim()));
    setMatch(found || null);
    // Backend AI is optional; if configured and reachable, show its response.
    setLoading(true);
    try {
      const result = await askAssistant(goal);
      setReply(result?.answer || result?.message || "AI service responded, but no answer field was returned.");
    } catch {
      setReply(found ? "This is a local catalogue match. AI backend is not connected; review the sample guidance and official sources." : "No local catalogue match found. AI backend is not connected yet; try browsing the service directory.");
    } finally { setLoading(false); }
  };
  return <main className="page"><div className="container">
    <header className="page-heading"><div className="eyebrow">Guided service finder</div><h1>What do you need help with?</h1><p>Describe your goal. The assistant checks the local demo catalogue and can call the configured AI endpoint when available.</p></header>
    <div className="two-column"><section className="surface">
      <form onSubmit={submit}><label className="field-label" htmlFor="goal">Describe your goal</label><textarea id="goal" value={goal} onChange={e=>{setGoal(e.target.value);setMatch(null);setReply("");}} placeholder="For example: I need a birth certificate or want to register a small business." required/><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Checking…" : "Find a matching service →"}</button></form>
      <div className="chips">{["Birth certificate","Domicile certificate","Small business","Public event permission"].map(s=><button className="chip" key={s} onClick={()=>setGoal(s)}>{s}</button>)}</div>
      {reply && <div className="assistant-reply"><b>Assistant response</b><p>{reply}</p></div>}
      {match && <div className="match-card"><span className="tag">Suggested match</span><h3>{match.title}</h3><p>{match.summary}</p><Link className="btn btn-primary" to={`/tasks/${match.id}`}>View this roadmap →</Link></div>}
    </section><aside className="surface"><div className="eyebrow">What you get</div><h2 className="serif-heading">A practical next-step guide</h2>{[["Eligibility","A general summary of who may apply."],["Documents","A checklist of commonly requested records."],["Department","The usual office or department to contact."],["Roadmap","An ordered list of common steps."]].map(([h,p],i)=><div className="info-row" key={h}><span>{i+1}</span><div><b>{h}</b><p>{p}</p></div></div>)}</aside></div>
  </div></main>;
}