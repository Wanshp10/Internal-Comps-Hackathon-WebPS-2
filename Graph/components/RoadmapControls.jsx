import {
  Controls,
  MiniMap
} from "@xyflow/react";

function RoadmapControls() {
  return (
    <>
      <Controls />

      <MiniMap
        pannable
        zoomable
      />
    </>
  );
}

export default RoadmapControls;