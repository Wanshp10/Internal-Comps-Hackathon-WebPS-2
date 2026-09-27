export const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  LOCKED: "LOCKED"
};

/**
 * Find a step by its ID.
 */
export function findStep(steps, stepId) {
  return steps.find((step) => step.step_id === stepId);
}

/**
 * Return the steps that a given step depends on.
 */
export function getDependencies(step, steps) {
  const dependencyIds = step.depends_on || [];

  return dependencyIds
    .map((id) => findStep(steps, id))
    .filter(Boolean);
}

/**
 * A step is unlocked when all of its dependencies are completed.
 *
 * A step with no dependencies is automatically available.
 */
export function areDependenciesCompleted(step, steps) {
  const dependencies = getDependencies(step, steps);

  if (dependencies.length === 0) {
    return true;
  }

  return dependencies.every(
    (dependency) => dependency.status === STATUS.COMPLETED
  );
}

/**
 * Calculate the effective status of a step.
 *
 * COMPLETED and IN_PROGRESS are preserved.
 * Steps whose dependencies are incomplete become LOCKED.
 * Steps whose dependencies are complete become NOT_STARTED.
 */
export function calculateStepStatus(step, steps) {
  if (step.status === STATUS.COMPLETED) {
    return STATUS.COMPLETED;
  }

  if (step.status === STATUS.IN_PROGRESS) {
    return STATUS.IN_PROGRESS;
  }

  if (!areDependenciesCompleted(step, steps)) {
    return STATUS.LOCKED;
  }

  return STATUS.NOT_STARTED;
}

/**
 * Recalculate statuses for the complete roadmap.
 *
 * This is useful after the user completes a step.
 */
export function calculateAllStatuses(steps) {
  let updatedSteps = steps.map((step) => ({
    ...step
  }));

  /*
   * Repeat because completing one dependency may unlock
   * another step further down the graph.
   */
  let changed = true;

  while (changed) {
    changed = false;

    const nextSteps = updatedSteps.map((step) => {
      const newStatus = calculateStepStatus(step, updatedSteps);

      if (newStatus !== step.status) {
        changed = true;
      }

      return {
        ...step,
        status: newStatus
      };
    });

    updatedSteps = nextSteps;
  }

  return updatedSteps;
}

/**
 * Return all steps that directly depend on the given step.
 */
export function getDependents(stepId, steps) {
  return steps.filter((step) =>
    (step.depends_on || []).includes(stepId)
  );
}

/**
 * Return all steps that become available after completing
 * a particular step.
 */
export function getUnlockedSteps(stepId, steps) {
  return getDependents(stepId, steps).filter(
    (step) => areDependenciesCompleted(step, steps)
  );
}