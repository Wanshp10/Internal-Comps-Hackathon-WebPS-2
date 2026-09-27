import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import Roadmap from "./components/Roadmap";
import sampleRoadmap from "./data/sampleRoadmap.json";
import {
  applyStatusToProgress,
  buildRoadmapFromTask,
} from "./utils/taskAdapter.js";
import { useTasks } from "../hooks/useTasks.js";

const PROGRESS_KEY = "sevaroute-progress";

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeProgress(next) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
}

function ServicePicker({ tasks, loading }) {
  return (
    <main className="page roadmap-picker-page">
      <div className="container">
        <header className="page-heading">
          <div className="eyebrow">Interactive dependency roadmap</div>
          <h1>See the route before you start.</h1>
          <p>
            Choose a civic service to turn its steps, prerequisites and
            supporting information into a visual roadmap. Locked steps open
            automatically as their dependencies are completed.
          </p>
        </header>

        {loading ? (
          <div className="empty-state">Loading services…</div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div className="task-card-top">
                  <span className="tag">{task.category}</span>
                  <span className="card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>

                <h3>{task.title}</h3>
                <p>{task.summary}</p>

                <Link className="card-link" to={`/roadmap/${task.id}`}>
                  Open dependency roadmap
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="roadmap-picker-footer">
          <span>
            Want to explore the catalogue first?
          </span>
          <Link className="btn" to="/tasks">
            Explore all services
          </Link>

          <Link className="btn btn-primary" to="/roadmap/demo">
            Open sample roadmap
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * /roadmap             → service picker
 * /roadmap/demo        → static graph for UI development
 * /roadmap/:taskId     → graph generated from the actual frontend task data
 *
 * The progress stored by TaskDetails is reused by the graph, and status
 * changes made inside the graph are written back to the same local store.
 * This keeps both frontend views synchronized until the backend is connected.
 */
function GraphPage() {
  const { taskId } = useParams();
  const { tasks, loading } = useTasks();

  const task = useMemo(
    () =>
      taskId && taskId !== "demo"
        ? tasks.find((item) => item.id === taskId)
        : null,
    [taskId, tasks],
  );

  const roadmap = useMemo(() => {
    if (!taskId || taskId === "demo") {
      return sampleRoadmap;
    }

    if (!task) {
      return null;
    }

    const savedProgress = readProgress()[task.id] || {};
    return buildRoadmapFromTask(task, savedProgress);
  }, [taskId, task]);

  const handleStepStatusChange = (stepId, newStatus) => {
    if (!task) {
      return;
    }

    const allProgress = readProgress();

    const updatedTaskProgress = applyStatusToProgress(
      stepId,
      newStatus,
      allProgress[task.id] || {},
      (task.documents || []).length,
    );

    writeProgress({
      ...allProgress,
      [task.id]: updatedTaskProgress,
    });
  };

  if (!taskId) {
    return <ServicePicker tasks={tasks} loading={loading} />;
  }

  if (taskId !== "demo" && loading) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">…</span>
          <strong>Preparing your roadmap</strong>
          <p>Loading the selected civic service.</p>
        </div>
      </main>
    );
  }

  if (taskId !== "demo" && !task) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">!</span>
          <strong>Service not found</strong>
          <p>We could not find the requested civic service.</p>
          <Link className="btn btn-primary" to="/tasks">
            Browse services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <Roadmap
      roadmap={roadmap}
      backHref={task ? `/tasks/${task.id}` : "/roadmap"}
      backLabel={task ? "Back to service details" : "Back to roadmap list"}
      onStepStatusChange={handleStepStatusChange}
    />
  );
}

export default GraphPage;
