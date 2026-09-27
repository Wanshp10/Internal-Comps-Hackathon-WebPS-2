import { Controls, MiniMap, Panel } from "@xyflow/react";

function RoadmapControls() {
  return (
    <>
      <Controls showInteractive={false} />

      <MiniMap
        pannable
        zoomable
        nodeColor={(node) => {
          const status = node.data?.status;

          if (status === "COMPLETED") return "#2f7d57";
          if (status === "IN_PROGRESS") return "#b85c35";
          if (status === "LOCKED") return "#a9b0b8";
          return "#637083";
        }}
        maskColor="rgba(247, 249, 247, 0.72)"
      />

      <Panel position="top-right" className="roadmap-legend">
        <div className="roadmap-legend__title">Progress</div>

        <div className="roadmap-legend__item">
          <span className="legend-dot legend-dot--ready" />
          Available
        </div>

        <div className="roadmap-legend__item">
          <span className="legend-dot legend-dot--active" />
          In progress
        </div>

        <div className="roadmap-legend__item">
          <span className="legend-dot legend-dot--done" />
          Completed
        </div>

        <div className="roadmap-legend__item">
          <span className="legend-dot legend-dot--locked" />
          Locked
        </div>
      </Panel>
    </>
  );
}

export default RoadmapControls;
