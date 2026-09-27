import { Handle, Position } from "@xyflow/react";

import "./StepNode.css";

function StepNode({ data }) {
  const status = data.status;

  return (
    <div className={`step-node step-node--${status.toLowerCase()}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="step-node__handle"
      />

      <div className="step-node__header">
        <span className="step-node__icon">
          {status === "COMPLETED" && "✓"}
          {status === "IN_PROGRESS" && "●"}
          {status === "NOT_STARTED" && "○"}
          {status === "LOCKED" && "🔒"}
        </span>

        <span className="step-node__status">{status.replace("_", " ")}</span>
      </div>

      <div className="step-node__title">{data.title || "Untitled Step"}</div>

      {data.canRunInParallel && (
        <div className="step-node__parallel">Parallel task</div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="step-node__handle"
      />
    </div>
  );
}

export default StepNode;
