import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/common/SearchBar.jsx";

const POPULAR_TASKS = [
  {
    id: "birth-certificate",
    title: "Birth Certificate",
    description:
      "Find the registration steps, required documents, and official government references.",
    query: "Birth Certificate",
  },
  {
    id: "domicile-certificate",
    title: "Domicile Certificate",
    description:
      "Understand eligibility, documents, application steps, and the official service portal.",
    query: "Domicile Certificate",
  },
  {
    id: "small-business",
    title: "Small Business",
    description:
      "Find the relevant civic registrations, licences, and next steps for your business.",
    query: "Small Business",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const search = (event) => {
    event.preventDefault();

    const cleanQuery = query.trim();

    navigate(
      `/tasks${
        cleanQuery
          ? `?q=${encodeURIComponent(
              cleanQuery,
            )}`
          : ""
      }`,
    );
  };

  const openTask = (taskQuery) => {
    navigate(
      `/tasks?q=${encodeURIComponent(
        taskQuery,
      )}`,
    );
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">
              Civic services, made understandable
            </div>

            <h1>
              Your government journey.
              <br />
              <em>Made simpler.</em>
            </h1>

            <p className="lead">
              Find clear, step-by-step guidance
              for public services. Understand
              eligibility, prepare documents,
              identify the right department,
              and keep track of your next
              steps.
            </p>

            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="What do you need help with?"
              onSubmit={search}
            />

            <div className="chips">
              <span>Try:</span>

              {[
                "Birth Certificate",
                "Domicile Certificate",
                "Small Business",
              ].map((item) => (
                <button
                  className="chip"
                  type="button"
                  key={item}
                  onClick={() =>
                    openTask(item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-art">
            <div className="arch-shape" />

            <div className="roadmap-preview">
              <h3>
                Your roadmap at a glance
              </h3>

              {[
                "Check eligibility",
                "Prepare documents",
                "Find the department",
                "Submit & track",
              ].map((step, index) => (
                <div
                  className="mini-step"
                  key={step}
                >
                  <span>{index + 1}</span>

                  <div>
                    <b>{step}</b>

                    <small>
                      {
                        [
                          "See whether the service fits your situation",
                          "Know what to gather before applying",
                          "Identify the relevant office or portal",
                          "Keep track of your progress",
                        ][index]
                      }
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="benefits">
          {[
            [
              "▤",
              "Clear roadmaps",
              "Know what to do next",
            ],
            [
              "☑",
              "Document checklists",
              "Prepare with confidence",
            ],
            [
              "↗",
              "Official references",
              "Find government portals",
            ],
            [
              "◷",
              "Progress tracking",
              "Save completed steps",
            ],
          ].map(
            ([icon, title, description]) => (
              <div
                className="benefit"
                key={title}
              >
                <span>{icon}</span>

                <div>
                  <b>{title}</b>
                  <small>
                    {description}
                  </small>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                Start with a service
              </div>

              <h2>Popular tasks</h2>

              <p>
                Explore common civic procedures
                and see the steps, documents,
                and references in one place.
              </p>
            </div>

            <button
              className="btn"
              type="button"
              onClick={() =>
                navigate("/tasks")
              }
            >
              Explore all tasks →
            </button>
          </div>

          <div className="task-grid">
            {POPULAR_TASKS.map((task) => (
              <button
                key={task.id}
                type="button"
                className="surface"
                onClick={() =>
                  openTask(task.query)
                }
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <div className="eyebrow">
                  Civic service
                </div>

                <h3
                  style={{
                    margin:
                      "10px 0 8px",
                  }}
                >
                  {task.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color:
                      "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {task.description}
                </p>

                <span
                  style={{
                    display:
                      "inline-block",
                    marginTop: 18,
                    color:
                      "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  View service →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="steps-band">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                A clearer path
              </div>

              <h2>
                How SevaRoute works
              </h2>

              <p>
                Move from a question to an
                organized checklist, one step
                at a time.
              </p>
            </div>
          </div>

          <div className="how-grid">
            {[
              [
                "Tell us your goal",
                "Choose a government service or describe what you need.",
              ],
              [
                "Review your roadmap",
                "See common steps, documents, and department details.",
              ],
              [
                "Work through the checklist",
                "Mark items as you prepare and complete them.",
              ],
              [
                "Use official references",
                "Open public portals to confirm current rules.",
              ],
            ].map(([heading, description], index) => (
              <div
                className="how-item"
                key={heading}
              >
                <span>{index + 1}</span>

                <h3>{heading}</h3>

                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="callout">
            <div>
              <h2>
                Ready to find your next step?
              </h2>

              <p>
                Search the service catalogue
                or tell the assistant what you
                are trying to do.
              </p>
            </div>

            <button
              className="btn btn-light"
              type="button"
              onClick={() =>
                navigate("/assistant")
              }
            >
              Open service assistant →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}