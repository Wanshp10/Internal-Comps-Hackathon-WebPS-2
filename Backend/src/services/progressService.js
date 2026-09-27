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
  const statusMap = new Map();

  // Build current status map
  for (const step of roadmap.steps) {
    statusMap.set(step.step_id, step.status);
  }

  for (const step of roadmap.steps) {
    const dependencies = step.depends_on || [];

    // No dependencies => step can be started
    if (dependencies.length === 0) {
      if (step.status === "LOCKED") {
        step.status = "NOT_STARTED";
      }

      continue;
    }

    // Check whether every dependency is completed
    const allDependenciesCompleted =
      dependencies.every((dependencyId) => {
        const dependencyStatus =
          statusMap.get(dependencyId);

        return dependencyStatus === "COMPLETED";
      });

    if (!allDependenciesCompleted) {
      // Do not overwrite an already completed step
      if (step.status !== "COMPLETED") {
        step.status = "LOCKED";
      }
    } else {
      // Dependencies are satisfied.
      // Unlock only previously locked steps.
      if (step.status === "LOCKED") {
        step.status = "NOT_STARTED";
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

  const roadmap = await Roadmap.findById(roadmapId);

  if (!roadmap) {
    throw new Error("Roadmap not found");
  }

  const step = roadmap.steps.find(
    (item) => item.step_id === stepId
  );

  if (!step) {
    throw new Error("Step not found in roadmap");
  }

  // Determine whether this step is currently blocked
  const dependencies = step.depends_on || [];

  const dependencyMap = new Map(
    roadmap.steps.map((item) => [
      item.step_id,
      item.status,
    ])
  );

  const allDependenciesCompleted =
    dependencies.every((dependencyId) => {
      return (
        dependencyMap.get(dependencyId) ===
        "COMPLETED"
      );
    });

  // Prevent user from progressing a locked step
  if (
    !allDependenciesCompleted &&
    dependencies.length > 0 &&
    status !== "NOT_STARTED"
  ) {
    throw new Error(
      "This step is locked because its prerequisites are not completed"
    );
  }

  // Update requested step
  step.status = status;

  // Recalculate all dependent states
  recalculateStepLocks(roadmap);

  await roadmap.save();

  return roadmap;
};

export default updateStepProgress;