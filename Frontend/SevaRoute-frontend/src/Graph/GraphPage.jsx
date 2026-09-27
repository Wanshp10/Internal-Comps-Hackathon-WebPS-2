import Roadmap from "./components/Roadmap";

import sampleRoadmap from "./data/sampleRoadmap.json";

function GraphPage({ roadmap = sampleRoadmap }) {
  return <Roadmap roadmap={roadmap} />;
}

export default GraphPage;
