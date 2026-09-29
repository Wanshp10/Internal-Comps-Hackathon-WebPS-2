import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ReactFlow,
  Background,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import StepNode from "./StepNode";
import StepDetails from "./StepDetails";
import RoadmapControls from "./RoadmapControls";

import {
  buildGraph,
} from "../utils/graphBuilder";

import {
  calculateAllStatuses,
  STATUS,
} from "../utils/dependencyUtils";

import {
  layoutGraph,
} from "../utils/graphLayout";

import "./Roadmap.css";

const nodeTypes = {
  step: StepNode,
};

function Roadmap({
  roadmap,
  onStepStatusChange,
  backHref = "/tasks",
  backLabel = "Back to service",
}) {
  const [steps, setSteps] =
    useState(
      roadmap?.steps || [],
    );

  const [
    selectedStepId,
    setSelectedStepId,
  ] = useState(null);

  useEffect(() => {
    setSteps(
      roadmap?.steps || [],
    );

    setSelectedStepId(null);
  }, [roadmap]);

  const processedSteps =
    useMemo(
      () =>
        calculateAllStatuses(
          steps.map(
            (step) => ({
              ...step,
              status:
                step.status ||
                STATUS.NOT_STARTED,
            }),
          ),
        ),
      [steps],
    );

  const graph =
    useMemo(() => {
      const {
        nodes,
        edges,
      } = buildGraph({
        ...roadmap,
        steps:
          processedSteps,
      });

      return {
        nodes: layoutGraph(
          nodes,
          edges,
        ),
        edges,
      };
    }, [
      roadmap,
      processedSteps,
    ]);

  const selectedStep =
    useMemo(
      () =>
        processedSteps.find(
          (step) =>
            step.step_id ===
            selectedStepId,
        ),
      [
        processedSteps,
        selectedStepId,
      ],
    );

  const completedCount =
    processedSteps.filter(
      (step) =>
        step.status ===
        STATUS.COMPLETED,
    ).length;

  const progressPercent =
    processedSteps.length
      ? Math.round(
          (completedCount /
            processedSteps.length) *
            100,
        )
      : 0;

  const handleNodeClick =
    useCallback(
      (_event, node) => {
        setSelectedStepId(
          node.id,
        );
      },
      [],
    );

  const handleStatusChange =
    useCallback(
      (newStatus) => {
        if (
          !selectedStepId
        ) {
          return;
        }

        setSteps(
          (currentSteps) =>
            currentSteps.map(
              (step) =>
                step.step_id ===
                selectedStepId
                  ? {
                      ...step,
                      status:
                        newStatus,
                    }
                  : step,
            ),
        );

        onStepStatusChange?.(
          selectedStepId,
          newStatus,
        );
      },
      [
        selectedStepId,
        onStepStatusChange,
      ],
    );

  if (!roadmap) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-empty">
          <span className="roadmap-empty__icon">
            !
          </span>

          <strong>
            No roadmap available
          </strong>

          <p>
            The selected service does not
            have a roadmap yet.
          </p>
        </div>
      </main>
    );
  }

  const selectedStepForDetails =
    selectedStep
      ? {
          stepId:
            selectedStep.step_id,

          title:
            selectedStep.title,

          description:
            selectedStep.description,

          status:
            selectedStep.status,

          requiredForms:
            selectedStep.required_forms ||
            [],

          requiredDocuments:
            selectedStep.required_documents ||
            [],

          fees:
            selectedStep.fees ||
            selectedStep.fee ||
            {},

          office:
            selectedStep.office ||
            {},

          prerequisites:
            selectedStep.prerequisites ||
            [],

          dependsOn:
            selectedStep.depends_on ||
            [],

          application:
            selectedStep.application ||
            {},

          timeLimitDays:
            selectedStep.time_limit_days ||
            null,

          officialSources:
            selectedStep.official_sources ||
            [],
        }
      : null;

  return (
    <main className="roadmap-page">
      <section className="roadmap">
        <div className="roadmap__main">
          <header className="roadmap__header">
            <div className="roadmap__heading">
              <Link
                className="roadmap__back"
                to={backHref}
              >
                <span
                  aria-hidden="true"
                >
                  ←
                </span>

                {backLabel}
              </Link>

              <div className="roadmap__title-row">
                <div>
                  <div className="roadmap__eyebrow">
                    Interactive dependency
                    roadmap
                  </div>

                  <h1>
                    {roadmap.task_name ||
                      roadmap.title}
                  </h1>

                  <p>
                    Follow the required order,
                    open a step for its details,
                    and complete prerequisites
                    to unlock what comes next.
                  </p>
                </div>

                <div className="roadmap__progress-card">
                  <div className="roadmap__progress-copy">
                    <span>
                      Journey progress
                    </span>

                    <strong>
                      {
                        progressPercent
                      }
                      %
                    </strong>
                  </div>

                  <div className="roadmap__progress-track">
                    <span
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>

                  <small>
                    {completedCount} of{" "}
                    {
                      processedSteps.length
                    }{" "}
                    steps completed
                  </small>
                </div>
              </div>
            </div>
          </header>

          <div className="roadmap__canvas-shell">
            <div className="roadmap__canvas-intro">
              <div>
                <strong>
                  Dependency map
                </strong>

                <span>
                  Drag the canvas · Scroll to
                  zoom · Select a step
                </span>
              </div>

              <span className="roadmap__step-count">
                {
                  processedSteps.length
                }{" "}
                steps
              </span>
            </div>

            <div className="roadmap__flow">
              <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                nodeTypes={nodeTypes}
                onNodeClick={
                  handleNodeClick
                }
                fitView
                fitViewOptions={{
                  padding: 0.18,
                  minZoom: 0.42,
                  maxZoom: 1.12,
                }}
                minZoom={0.35}
                maxZoom={1.4}
                nodesConnectable={
                  false
                }
                nodesDraggable
                elementsSelectable
                proOptions={{
                  hideAttribution: true,
                }}
              >
                <Background
                  gap={26}
                  size={1.1}
                  color="var(--graph-grid)"
                />

                <RoadmapControls />
              </ReactFlow>
            </div>
          </div>
        </div>

        <StepDetails
          key={
            selectedStepId ||
            "empty"
          }
          step={
            selectedStepForDetails
          }
          onClose={() =>
            setSelectedStepId(
              null,
            )
          }
          onStatusChange={
            handleStatusChange
          }
        />
      </section>
    </main>
  );
}

export default Roadmap;