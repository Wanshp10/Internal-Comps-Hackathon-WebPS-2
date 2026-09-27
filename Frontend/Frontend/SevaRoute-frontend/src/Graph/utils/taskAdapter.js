import { STATUS } from "./dependencyUtils";

/**
 * Bridges the simple task records used across the rest of the app
 * (src/data/tasks.js) with the richer roadmap schema the Graph
 * section renders (see data/sampleRoadmap.json for the target shape).
 *
 * A "Prepare Required Documents" node is generated first (DOC_PREP),
 * followed by one node per task.steps entry, chained sequentially
 * via depends_on so the dependency graph mirrors the order the task
 * is already presented in on the Task Details page.
 *
 * `taskProgress` is the per-task slice of the "sevaroute-progress"
 * checklist saved by TaskDetails (e.g. { "doc-0": true, "step-1": true }),
 * so a step already ticked off in the checklist shows as COMPLETED
 * here too, instead of every graph always starting from scratch.
 */

const stepNodeId = (index) => `STEP_${index + 1}`;

function toSources(task) {
  return (task.sources || []).map((source) => ({
    source_title: source.label,
    source_url: source.url,
    authority: task.department || "",
    last_verified: null,
  }));
}

export function buildRoadmapFromTask(task, taskProgress = {}) {
  if (!task) {
    return null;
  }

  const documents = task.documents || [];
  const steps = task.steps || [];

  const documentsCompleted =
    documents.length > 0 &&
    documents.every((_, index) => !!taskProgress[`doc-${index}`]);

  const stepNodes = steps.map((title, index) => {
    const previousId = index === 0 ? "DOC_PREP" : stepNodeId(index - 1);

    return {
      step_id: stepNodeId(index),
      title,
      description: "",
      required_forms: [],
      required_documents: [],
      fees: { amount: null, currency: "INR", payment_method: [], notes: null },
      office: {
        department: task.department || "",
        office_name: "",
        office_type: "",
        location_rule: "",
      },
      prerequisites: [],
      depends_on: [previousId],
      unlocks: index < steps.length - 1 ? [stepNodeId(index + 1)] : [],
      can_run_in_parallel: false,
      application: { mode: [], application_link: null },
      time_limit_days: null,
      official_sources: toSources(task),
      status: taskProgress[`step-${index}`] ? STATUS.COMPLETED : STATUS.NOT_STARTED,
    };
  });

  const documentStep = {
    step_id: "DOC_PREP",
    title: "Prepare Required Documents",
    description: task.summary || "",
    required_forms: [],
    required_documents: documents,
    fees: {
      amount: null,
      currency: "INR",
      payment_method: [],
      notes: task.fee || null,
    },
    office: {
      department: task.department || "",
      office_name: "",
      office_type: "",
      location_rule: "",
    },
    prerequisites: task.eligibility ? [task.eligibility] : [],
    depends_on: [],
    unlocks: stepNodes.length ? [stepNodes[0].step_id] : [],
    can_run_in_parallel: false,
    application: { mode: [], application_link: null },
    time_limit_days: null,
    official_sources: toSources(task),
    status: documentsCompleted ? STATUS.COMPLETED : STATUS.NOT_STARTED,
  };

  return {
    task_id: task.id,
    task_name: task.title,
    category: task.category,
    jurisdiction: { state: null, local_body: null, district: null },
    department: {
      name: task.department || "",
      sub_department: "",
      designated_officer: "",
      office_type: "",
    },
    eligibility: task.eligibility ? [task.eligibility] : [],
    steps: [documentStep, ...stepNodes],
    status_options: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "LOCKED"],
    source_freshness: { last_verified: null, needs_review: false },
  };
}

/**
 * Reverses a status change made on the graph back into the shape
 * TaskDetails' checklist expects, so ticking a step complete in one
 * view is reflected in the other.
 */
export function applyStatusToProgress(
  stepId,
  newStatus,
  taskProgress = {},
  documentCount = 0,
) {
  const next = { ...taskProgress };
  const isComplete = newStatus === STATUS.COMPLETED;

  if (stepId === "DOC_PREP") {
    for (let index = 0; index < documentCount; index += 1) {
      next[`doc-${index}`] = isComplete;
    }
    return next;
  }

  if (stepId?.startsWith("STEP_")) {
    const index = Number(stepId.split("_")[1]) - 1;
    if (Number.isFinite(index) && index >= 0) {
      next[`step-${index}`] = isComplete;
    }
  }

  return next;
}
