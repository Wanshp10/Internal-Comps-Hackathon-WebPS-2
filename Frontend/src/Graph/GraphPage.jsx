import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import Roadmap from "./components/Roadmap.jsx";
import sampleRoadmap from "./data/sampleRoadmap.json";

import {
  applyStatusToProgress,
  buildRoadmapFromTask,
} from "./utils/taskAdapter.js";

import { useTasks } from "../hooks/useTasks.js";

import {
  getRoadmap,
  updateStepProgress,
} from "../services/roadmapService.js";

const PROGRESS_KEY =
  "sevaroute-progress";

function readProgress() {
  try {
    return JSON.parse(
      localStorage.getItem(
        PROGRESS_KEY,
      ) || "{}",
    );
  } catch {
    return {};
  }
}

function writeProgress(next) {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify(next),
  );
}

// ------------------------------------
// MongoDB ObjectId detection
// ------------------------------------
function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(
    value || "",
  );
}

// ------------------------------------
// Normalize backend roadmap
// ------------------------------------
function normalizeBackendRoadmap(
  roadmap,
) {
  return {
    ...roadmap,

    title:
      roadmap.title ||
      roadmap.task_name ||
      "Civic Roadmap",

    task_name:
      roadmap.task_name ||
      roadmap.title ||
      "Civic Roadmap",

    steps: (
      roadmap.steps || []
    ).map((step) => {
      let office =
        step.office;

      if (
        typeof office ===
        "string"
      ) {
        office = {
          department:
            step.department || "",

          office_name:
            office,

          office_type: "",

          location_rule: "",
        };
      }

      return {
        ...step,

        fees:
          step.fees ||
          step.fee ||
          {
            amount: null,
            currency: "INR",
            payment_method: [],
            notes: null,
          },

        office:
          office || {
            department:
              step.department ||
              "",

            office_name: "",

            office_type: "",

            location_rule: "",
          },

        required_forms:
          step.required_forms ||
          [],

        required_documents:
          step.required_documents ||
          [],

        prerequisites:
          step.prerequisites ||
          [],

        depends_on:
          step.depends_on ||
          [],

        unlocks:
          step.unlocks ||
          [],

        official_sources:
          step.official_sources ||
          [],

        application:
          step.application || {
            mode: [],
            application_link:
              null,
          },
      };
    }),
  };
}

// ------------------------------------
// Service picker
// ------------------------------------
function ServicePicker({
  tasks,
  loading,
}) {
  return (
    <main className="page roadmap-picker-page">
      <div className="container">
        <header className="page-heading">
          <div className="eyebrow">
            Interactive dependency roadmap
          </div>

          <h1>
            See the route before you start.
          </h1>

          <p>
            Choose a civic service to turn
            its steps, prerequisites and
            supporting information into a
            visual roadmap.
          </p>
        </header>

        {loading ? (
          <div className="empty-state">
            Loading services…
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map(
              (task) => (
                <article
                  className="task-card"
                  key={task.id}
                >
                  <div className="task-card-top">
                    <span className="tag">
                      {task.category}
                    </span>

                    <span
                      className="card-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>

                  <h3>
                    {task.title}
                  </h3>

                  <p>
                    {task.summary}
                  </p>

                  <Link
                    className="card-link"
                    to={`/roadmap/${task.id}`}
                  >
                    Open dependency roadmap

                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </article>
              ),
            )}
          </div>
        )}

        <div className="roadmap-picker-footer">
          <span>
            Start with a natural-language
            request?
          </span>

          <Link
            className="btn btn-primary"
            to="/assistant"
          >
            Open Assistant
          </Link>

          <Link
            className="btn"
            to="/tasks"
          >
            Explore all services
          </Link>

          <Link
            className="btn btn-primary"
            to="/roadmap/demo"
          >
            Open sample roadmap
          </Link>
        </div>
      </div>
    </main>
  );
}

// ------------------------------------
// Graph page
// ------------------------------------
function GraphPage() {
  const {
    taskId,
  } = useParams();

  const {
    tasks,
    loading,
  } = useTasks();

  const [
    backendRoadmap,
    setBackendRoadmap,
  ] = useState(null);

  const [
    backendLoading,
    setBackendLoading,
  ] = useState(false);

  const [
    backendError,
    setBackendError,
  ] = useState("");

  // ----------------------------------
  // Load real roadmap when the route
  // contains a MongoDB roadmap ID.
  // ----------------------------------
  useEffect(() => {
    if (
      !taskId ||
      taskId === "demo" ||
      !isMongoId(taskId)
    ) {
      setBackendRoadmap(null);
      setBackendLoading(false);
      setBackendError("");
      return;
    }

    let alive = true;

    const loadRoadmap =
      async () => {
        setBackendLoading(
          true,
        );

        setBackendError("");

        try {
          const roadmap =
            await getRoadmap(
              taskId,
            );

          if (!alive) {
            return;
          }

          setBackendRoadmap(
            normalizeBackendRoadmap(
              roadmap,
            ),
          );
        } catch (error) {
          if (!alive) {
            return;
          }

          console.error(
            "Failed to load backend roadmap:",
            error,
          );

          setBackendRoadmap(
            null,
          );

          setBackendError(
            error?.message ||
              "Failed to load roadmap",
          );
        } finally {
          if (alive) {
            setBackendLoading(
              false,
            );
          }
        }
      };

    loadRoadmap();

    return () => {
      alive = false;
    };
  }, [taskId]);

  // ----------------------------------
  // Find old local task
  // ----------------------------------
  const task =
    useMemo(
      () =>
        taskId &&
        taskId !== "demo"
          ? tasks.find(
              (item) =>
                item.id ===
                taskId,
            )
          : null,
      [taskId, tasks],
    );

  // ----------------------------------
  // Select roadmap source
  // ----------------------------------
  const roadmap =
    useMemo(() => {
      // Demo graph
      if (
        !taskId ||
        taskId === "demo"
      ) {
        return sampleRoadmap;
      }

      // Real backend roadmap
      if (backendRoadmap) {
        return backendRoadmap;
      }

      // Existing local frontend task
      if (task) {
        const savedProgress =
          readProgress()[
            task.id
          ] || {};

        return buildRoadmapFromTask(
          task,
          savedProgress,
        );
      }

      return null;
    }, [
      taskId,
      backendRoadmap,
      task,
    ]);

  // ----------------------------------
  // Update progress
  // ----------------------------------
  const handleStepStatusChange =
    async (
      stepId,
      newStatus,
    ) => {
      // Real backend roadmap
      if (
        backendRoadmap
      ) {
        try {
          const updatedRoadmap =
            await updateStepProgress(
              {
                roadmapId:
                  backendRoadmap._id,

                stepId,

                status:
                  newStatus,
              },
            );

          setBackendRoadmap(
            normalizeBackendRoadmap(
              updatedRoadmap,
            ),
          );
        } catch (error) {
          console.error(
            "Backend progress update failed:",
            error,
          );
        }

        return;
      }

      // Existing local roadmap
      if (!task) {
        return;
      }

      const allProgress =
        readProgress();

      const updatedTaskProgress =
        applyStatusToProgress(
          stepId,
          newStatus,
          allProgress[
            task.id
          ] || {},
          (
            task.documents ||
            []
          ).length,
        );

      writeProgress({
        ...allProgress,

        [task.id]:
          updatedTaskProgress,
      });
    };

  // ----------------------------------
  // Service picker
  // ----------------------------------
  if (!taskId) {
    return (
      <ServicePicker
        tasks={tasks}
        loading={loading}
      />
    );
  }

  // ----------------------------------
  // Backend roadmap loading
  // ----------------------------------
  if (
    isMongoId(taskId) &&
    backendLoading
  ) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">
            …
          </span>

          <strong>
            Preparing your roadmap
          </strong>

          <p>
            Loading the roadmap generated
            for your request.
          </p>
        </div>
      </main>
    );
  }

  // ----------------------------------
  // Backend roadmap error
  // ----------------------------------
  if (
    isMongoId(taskId) &&
    backendError
  ) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">
            !
          </span>

          <strong>
            Could not load roadmap
          </strong>

          <p>
            {backendError}
          </p>

          <Link
            className="btn btn-primary"
            to="/assistant"
          >
            Back to Assistant
          </Link>
        </div>
      </main>
    );
  }

  // ----------------------------------
  // Local task loading
  // ----------------------------------
  if (
    !isMongoId(taskId) &&
    taskId !== "demo" &&
    loading
  ) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">
            …
          </span>

          <strong>
            Preparing your roadmap
          </strong>

          <p>
            Loading the selected civic
            service.
          </p>
        </div>
      </main>
    );
  }

  // ----------------------------------
  // Not found
  // ----------------------------------
  if (!roadmap) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">
            !
          </span>

          <strong>
            Service not found
          </strong>

          <p>
            We could not find the requested
            civic service.
          </p>

          <Link
            className="btn btn-primary"
            to="/assistant"
          >
            Try another request
          </Link>
        </div>
      </main>
    );
  }

  return (
    <Roadmap
      roadmap={roadmap}
      backHref={
        backendRoadmap
          ? "/assistant"
          : task
            ? `/tasks/${task.id}`
            : "/roadmap"
      }
      backLabel={
        backendRoadmap
          ? "Back to assistant"
          : task
            ? "Back to service details"
            : "Back to roadmap list"
      }
      onStepStatusChange={
        handleStepStatusChange
      }
    />
  );
}

export default GraphPage;