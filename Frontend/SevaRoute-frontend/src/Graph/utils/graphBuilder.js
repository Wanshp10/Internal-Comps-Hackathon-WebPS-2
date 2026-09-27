import { STATUS } from "./dependencyUtils";

/**
 * Converts a roadmap object (task_id, task_name, steps[]) into
 * React Flow's { nodes, edges } shape.
 *
 * - One node per step, typed "step" (see StepNode.jsx / nodeTypes in Roadmap.jsx)
 * - One edge per depends_on relationship (source = prerequisite, target = this step)
 *
 * Positions are left at (0,0) here — layoutGraph() in graphLayout.js
 * assigns real x/y based on dependency depth, so this stays a pure
 * data-shape transform with no layout concerns of its own.
 */
export function buildGraph(roadmap) {
  const steps = roadmap?.steps || [];

  const nodes = steps.map((step) => ({
    id: step.step_id,
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      title: step.title,
      status: step.status || STATUS.NOT_STARTED,
      canRunInParallel: !!step.can_run_in_parallel,
    },
  }));

  const edges = [];

  steps.forEach((step) => {
    (step.depends_on || []).forEach((dependencyId) => {
      edges.push({
        id: `${dependencyId}->${step.step_id}`,
        source: dependencyId,
        target: step.step_id,
        type: "smoothstep",
        animated: step.status === STATUS.IN_PROGRESS,
      });
    });
  });

  return { nodes, edges };
}