import Roadmap from "../models/Roadmap.js";

const VALID_USER_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
];

// ------------------------------------
// Recalculate LOCKED / UNLOCKED states
// ------------------------------------
const recalculateStepLocks = (roadmap) => {
  let changed = true;
  let passes = 0;

  // Repeat until no status changes remain.
  // This handles dependency chains such as:
  // STEP_1 -> STEP_2 -> STEP_3
  while (changed && passes < roadmap.steps.length + 1) {
    changed = false;
    passes += 1;

    const statusMap = new Map();

    for (const step of roadmap.steps) {
      statusMap.set(
        step.step_id,
        step.status
      );
    }

    for (const step of roadmap.steps) {
      const dependencies =
        step.depends_on || [];

      // No dependencies = never locked
      if (dependencies.length === 0) {
        if (step.status === "LOCKED") {
          step.status = "NOT_STARTED";
          changed = true;
        }

        continue;
      }

      const allDependenciesCompleted =
        dependencies.every(
          (dependencyId) =>
            statusMap.get(dependencyId) ===
            "COMPLETED"
        );

      // Dependencies incomplete -> lock the step
      if (!allDependenciesCompleted) {
        if (step.status !== "COMPLETED" &&
            step.status !== "LOCKED") {
          step.status = "LOCKED";
          changed = true;
        }

        continue;
      }

      // Dependencies complete -> unlock the step
      if (step.status === "LOCKED") {
        step.status = "NOT_STARTED";
        changed = true;
      }
    }
  }
};

// ------------------------------------
// Update a step's progress
// ------------------------------------
const updateStepProgress = async ({
  roadmapId,
  stepId,
  status,
}) => {
  if (!VALID_USER_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status. Allowed values: ${VALID_USER_STATUSES.join(
        ", "
      )}`
    );
  }

  const roadmap =
    await Roadmap.findById(
      roadmapId
    );

  if (!roadmap) {
    throw new Error(
      "Roadmap not found"
    );
  }

  const step = roadmap.steps.find(
    (item) =>
      item.step_id === stepId
  );

  if (!step) {
    throw new Error(
      "Step not found in roadmap"
    );
  }

  const dependencies =
    step.depends_on || [];

  const dependencyMap = new Map(
    roadmap.steps.map((item) => [
      item.step_id,
      item.status,
    ])
  );

  const allDependenciesCompleted =
    dependencies.every(
      (dependencyId) =>
        dependencyMap.get(
          dependencyId
        ) === "COMPLETED"
    );

  // A locked step cannot be started or completed
  if (
    dependencies.length > 0 &&
    !allDependenciesCompleted &&
    status !== "NOT_STARTED"
  ) {
    throw new Error(
      "This step is locked because its prerequisites are not completed"
    );
  }

  step.status = status;

  // Recalculate every dependent step
  recalculateStepLocks(
    roadmap
  );

  await roadmap.save();

  return roadmap;
};

// ------------------------------------
// Get blockers for a step
// ------------------------------------
const getStepBlockers = async ({
  roadmapId,
  stepId,
}) => {
  const roadmap =
    await Roadmap.findById(
      roadmapId
    );

  if (!roadmap) {
    throw new Error(
      "Roadmap not found"
    );
  }

  const step = roadmap.steps.find(
    (item) =>
      item.step_id === stepId
  );

  if (!step) {
    throw new Error(
      "Step not found in roadmap"
    );
  }

  const dependencies =
    step.depends_on || [];

  const stepMap = new Map(
    roadmap.steps.map((item) => [
      item.step_id,
      item,
    ])
  );

  const blockers = dependencies
    .map((dependencyId) => {
      const dependency =
        stepMap.get(
          dependencyId
        );

      if (!dependency) {
        return {
          step_id:
            dependencyId,
          title:
            "Unknown prerequisite",
          status: "UNKNOWN",
          completed: false,
        };
      }

      return {
        step_id:
          dependency.step_id,
        title:
          dependency.title,
        status:
          dependency.status,
        completed:
          dependency.status ===
          "COMPLETED",
      };
    })
    .filter(
      (dependency) =>
        dependency.status !==
        "COMPLETED"
    );

  return {
    step_id:
      step.step_id,

    title:
      step.title,

    status:
      step.status,

    is_locked:
      step.status === "LOCKED",

    blockers,

    message:
      blockers.length > 0
        ? `Complete ${blockers.length} prerequisite step(s) before starting this step.`
        : "This step is not blocked.",
  };
};

// ------------------------------------
// Get roadmap progress summary
// ------------------------------------
const getProgressSummary = async (
  roadmapId
) => {
  const roadmap =
    await Roadmap.findById(
      roadmapId
    );

  if (!roadmap) {
    throw new Error(
      "Roadmap not found"
    );
  }

  const total =
    roadmap.steps.length;

  const completed =
    roadmap.steps.filter(
      (step) =>
        step.status ===
        "COMPLETED"
    ).length;

  const inProgress =
    roadmap.steps.filter(
      (step) =>
        step.status ===
        "IN_PROGRESS"
    ).length;

  const locked =
    roadmap.steps.filter(
      (step) =>
        step.status ===
        "LOCKED"
    ).length;

  const notStarted =
    roadmap.steps.filter(
      (step) =>
        step.status ===
        "NOT_STARTED"
    ).length;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  return {
    roadmapId:
      roadmap._id,

    title:
      roadmap.title,

    totalSteps:
      total,

    completed,

    inProgress,

    notStarted,

    locked,

    completionPercentage:
      percentage,
  };
};

export {
  updateStepProgress,
  getStepBlockers,
  getProgressSummary,
};