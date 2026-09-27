import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";

const readProgress = () => {
  try {
    return JSON.parse(localStorage.getItem("sevaroute-progress") || "{}");
  } catch {
    return {};
  }
};

export default function TaskDetails() {
  const { taskId } = useParams();
  const { tasks } = useTasks();
  const task = tasks.find((item) => item.id === taskId);

  const [tab, setTab] = useState("roadmap");
  const [progress, setProgress] = useState(readProgress);

  if (!task) {
    return (
      <main className="page">
        <div className="container empty-state">
          Service not found.{" "}
          <Link to="/tasks">Browse services</Link>
        </div>
      </main>
    );
  }

  const items = [
    ...task.steps.map((text, index) => ({
      text,
      key: `step-${index}`,
    })),
    ...task.documents.map((text, index) => ({
      text,
      key: `doc-${index}`,
    })),
  ];

  const done = items.filter(
    (item) => progress[task.id]?.[item.key],
  ).length;

  const percent = items.length
    ? Math.round((done / items.length) * 100)
    : 0;

  const toggle = (key) =>
    setProgress((previous) => {
      const next = {
        ...previous,
        [task.id]: {
          ...(previous[task.id] || {}),
          [key]: !(previous[task.id] || {})[key],
        },
      };

      localStorage.setItem(
        "sevaroute-progress",
        JSON.stringify(next),
      );

      return next;
    });

  return (
    <main className="page">
      <div className="container">
        <Link className="back-link" to="/tasks">
          ← Back to services
        </Link>

        <header className="page-heading detail-heading">
          <span className="tag">{task.category}</span>
          <h1>{task.title}</h1>
          <p>{task.summary}</p>
        </header>

        <div className="detail-layout">
          <section className="surface">
            <div className="tabs">
              {[
                ["roadmap", "Roadmap"],
                ["documents", "Documents"],
                ["eligibility", "Eligibility & fees"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={tab === value ? "active" : ""}
                  onClick={() => setTab(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "roadmap" && (
              <div className="roadmap-list">
                <div className="graph-launch-card">
                  <div className="graph-launch-card__icon">
                    ↗
                  </div>

                  <div className="graph-launch-card__copy">
                    <span>Interactive dependency graph</span>
                    <strong>See what unlocks what.</strong>
                    <p>
                      Open the visual roadmap to follow dependencies,
                      inspect each step, and update your progress.
                    </p>
                  </div>

                  <Link
                    className="btn btn-primary"
                    to={`/roadmap/${task.id}`}
                  >
                    Open roadmap
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="detail-section-label">
                  Typical journey
                </div>

                {task.steps.map((step, index) => (
                  <div className="roadmap-step" key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{step}</h3>
                      <p>
                        Review this step and mark it complete in your
                        checklist.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "documents" &&
              task.documents.map((doc, index) => (
                <label
                  className={`check-row ${
                    progress[task.id]?.[`doc-${index}`]
                      ? "checked"
                      : ""
                  }`}
                  key={doc}
                >
                  <input
                    type="checkbox"
                    checked={!!progress[task.id]?.[`doc-${index}`]}
                    onChange={() => toggle(`doc-${index}`)}
                  />
                  <span>{doc}</span>
                </label>
              ))}

            {tab === "eligibility" && (
              <div className="fact-list">
                <h3>General eligibility</h3>
                <p>{task.eligibility}</p>

                <h3>Fees</h3>
                <p>{task.fee}</p>

                <h3>Typical processing time</h3>
                <p>{task.duration}</p>

                <div className="notice">
                  Requirements vary by location. Confirm current rules
                  with the responsible authority.
                </div>
              </div>
            )}
          </section>

          <aside className="surface progress-panel">
            <div className="eyebrow">Your progress</div>

            <div className="progress-panel__heading">
              <strong>{percent}% complete</strong>
              <span>
                {done}/{items.length} items
              </span>
            </div>

            <div className="progress-track">
              <span style={{ width: `${percent}%` }} />
            </div>

            <h3 className="checklist-title">Checklist</h3>

            {items.map((item) => (
              <label
                className={`check-row ${
                  progress[task.id]?.[item.key] ? "checked" : ""
                }`}
                key={item.key}
              >
                <input
                  type="checkbox"
                  checked={!!progress[task.id]?.[item.key]}
                  onChange={() => toggle(item.key)}
                />
                <span>{item.text}</span>
              </label>
            ))}

            <button
              className="btn btn-quiet"
              onClick={() => {
                const next = {
                  ...progress,
                  [task.id]: {},
                };

                setProgress(next);
                localStorage.setItem(
                  "sevaroute-progress",
                  JSON.stringify(next),
                );
              }}
            >
              Reset checklist
            </button>

            <div className="department-box">
              <b>Department</b>
              <p>{task.department}</p>
              <Link to="/sources">Browse references →</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
