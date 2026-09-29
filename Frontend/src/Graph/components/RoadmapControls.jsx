import { Controls, Panel } from "@xyflow/react";

function RoadmapControls() {
  return (
    <>
      <Controls showInteractive={false} />

      <Panel
        position="bottom-right"
        className="roadmap-legend"
      >
        <div className="roadmap-legend__title">
          Progress
        </div>

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