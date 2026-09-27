import "./StepNode.css";

import { Handle, Position } from "@xyflow/react";

function StatusIcon({ status }) {
  if (status === "COMPLETED") return <span aria-hidden="true">✓</span>;
  if (status === "IN_PROGRESS") return <span aria-hidden="true">•</span>;
  if (status === "LOCKED") return <span aria-hidden="true">×</span>;
  return <span aria-hidden="true">○</span>;
}

function StepNode({ data }) {
  const status = data.status || "NOT_STARTED";
  const statusLabel = status.replaceAll("_", " ");

  return (
    <div
      className={`step-node step-node--${status.toLowerCase()}`}
      style={{
        "--node-delay": `${Math.min(data.index ?? 0, 12) * 65}ms`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="step-node__handle"
      />

      <div className="step-node__topline">
        <span className="step-node__number">
          {String(data.stepNumber).padStart(2, "0")}
        </span>

        <span className="step-node__status">
          <StatusIcon status={status} />
          {statusLabel}
        </span>
      </div>

      <div className="step-node__title">
        {data.title || "Untitled step"}
      </div>

      {data.description && (
        <p className="step-node__description">
          {data.description}
        </p>
      )}

      <div className="step-node__meta">
        {data.dependencyCount > 0 && (
          <span>
            {data.dependencyCount} prerequisite
            {data.dependencyCount > 1 ? "s" : ""}
          </span>
        )}

        {data.documentCount > 0 && (
          <span>
            {data.documentCount} document
            {data.documentCount > 1 ? "s" : ""}
          </span>
        )}

        {data.formCount > 0 && (
          <span>
            {data.formCount} form{data.formCount > 1 ? "s" : ""}
          </span>
        )}

        {data.canRunInParallel && (
          <span className="step-node__parallel">
            Parallel
          </span>
        )}

        {!data.dependencyCount &&
          !data.documentCount &&
          !data.formCount &&
          !data.canRunInParallel && (
            <span>Ready when unlocked</span>
          )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="step-node__handle"
      />
    </div>
  );
}

export default StepNode;
