import { MarkerType } from "@xyflow/react";
import { STATUS } from "./dependencyUtils";

/**
 * Converts the structured roadmap into React Flow's node/edge model.
 * `depends_on` is the single source of truth for dependency edges.
 */
export function buildGraph(roadmap) {
  const steps = roadmap?.steps || [];

  const nodes = steps.map((step, index) => ({
    id: step.step_id,
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      title: step.title,
      description: step.description,
      status: step.status || STATUS.NOT_STARTED,
      canRunInParallel: Boolean(step.can_run_in_parallel),
      index,
      stepNumber: index + 1,
      dependencyCount: (step.depends_on || []).length,
      documentCount: (step.required_documents || []).length,
      formCount: (step.required_forms || []).length,
    },
  }));

  const nodeIds = new Set(steps.map((step) => step.step_id));
  const edges = [];

  steps.forEach((step) => {
    (step.depends_on || []).forEach((dependencyId) => {
      if (!nodeIds.has(dependencyId)) {
        console.warn(
          `Dependency "${dependencyId}" referenced by "${step.step_id}" was not found.`,
        );
        return;
      }

      edges.push({
        id: `${dependencyId}->${step.step_id}`,
        source: dependencyId,
        target: step.step_id,
        type: "smoothstep",
        animated: step.status === STATUS.IN_PROGRESS,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
        },
        data: {
          dependency: true,
        },
      });
    });
  });

  return { nodes, edges };
}
