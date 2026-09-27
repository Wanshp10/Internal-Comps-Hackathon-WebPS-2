import { useCallback, useEffect, useMemo, useState } from "react";

import { ReactFlow, Background } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import StepNode from "./StepNode";
import StepDetails from "./StepDetails";
import RoadmapControls from "./RoadmapControls";

import { buildGraph } from "../utils/graphBuilder";

import { calculateAllStatuses, STATUS } from "../utils/dependencyUtils";

import { layoutGraph } from "../utils/graphLayout";

import "./Roadmap.css";

const nodeTypes = {
  step: StepNode,
};

function Roadmap({ roadmap }) {
  const [steps, setSteps] = useState(roadmap?.steps || []);

  const [selectedStepId, setSelectedStepId] = useState(null);

  /*
   * Whenever a new roadmap comes from the backend/AI,
   * replace the current roadmap.
   */
  useEffect(() => {
    setSteps(roadmap?.steps || []);
    setSelectedStepId(null);
  }, [roadmap]);

  /*
   * Calculate LOCKED / NOT_STARTED states from dependencies.
   */
  const processedSteps = useMemo(() => {
    return calculateAllStatuses(
      steps.map((step) => ({
        ...step,
        status: step.status || STATUS.NOT_STARTED,
      })),
    );
  }, [steps]);

  /*
   * Build React Flow nodes and edges.
   */
  const graph = useMemo(() => {
    const { nodes, edges } = buildGraph({
      ...roadmap,
      steps: processedSteps,
    });

    const positionedNodes = layoutGraph(nodes, edges);

    return {
      nodes: positionedNodes,
      edges,
    };
  }, [roadmap, processedSteps]);

  const selectedStep = useMemo(() => {
    return processedSteps.find((step) => step.step_id === selectedStepId);
  }, [processedSteps, selectedStepId]);

  /*
   * Node click handler.
   */
  const handleNodeClick = useCallback((_event, node) => {
    setSelectedStepId(node.id);
  }, []);

  /*
   * Update progress for a selected step.
   */
  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!selectedStepId) {
        return;
      }

      setSteps((currentSteps) =>
        currentSteps.map((step) => {
          if (step.step_id === selectedStepId) {
            return {
              ...step,
              status: newStatus,
            };
          }

          return step;
        }),
      );
    },
    [selectedStepId],
  );

  if (!roadmap) {
    return <div className="roadmap-empty">No roadmap available.</div>;
  }

  return (
    <div className="roadmap">
      <div className="roadmap__main">
        <div className="roadmap__header">
          <div>
            <p className="roadmap__category">{roadmap.category}</p>

            <h1>{roadmap.task_name}</h1>
          </div>

          <div className="roadmap__summary">
            {
              processedSteps.filter((step) => step.status === STATUS.COMPLETED)
                .length
            }
            {" / "}
            {processedSteps.length} completed
          </div>
        </div>

        <div className="roadmap__flow">
          <ReactFlow
            nodes={graph.nodes}
            edges={graph.edges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{
              padding: 0.2,
            }}
            nodesConnectable={false}
            nodesDraggable
            elementsSelectable
          >
            <Background />
            <RoadmapControls />
          </ReactFlow>
        </div>
      </div>

      <StepDetails
        step={
          selectedStep
            ? {
                stepId: selectedStep.step_id,
                title: selectedStep.title,
                description: selectedStep.description,
                status: selectedStep.status,
                requiredForms: selectedStep.required_forms || [],
                requiredDocuments: selectedStep.required_documents || [],
                fees: selectedStep.fees || {},
                office: selectedStep.office || {},
                prerequisites: selectedStep.prerequisites || [],
                dependsOn: selectedStep.depends_on || [],
                application: selectedStep.application || {},
                timeLimitDays: selectedStep.time_limit_days || null,
                officialSources: selectedStep.official_sources || [],
              }
            : null
        }
        onClose={() => setSelectedStepId(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default Roadmap;
