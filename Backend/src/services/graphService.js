import Roadmap from "../models/Roadmap.js";

// ------------------------------------
// Convert roadmap into graph structure
// ------------------------------------
const generateGraphData = async (roadmapId) => {
  const roadmap = await Roadmap.findById(roadmapId);

  if (!roadmap) {
    throw new Error("Roadmap not found");
  }

  // ----------------------------------
  // Graph Nodes
  // ----------------------------------
  const nodes = roadmap.steps.map((step) => ({
    id: step.step_id,

    type: "civicStep",

    data: {
      title: step.title,
      description: step.description,

      status: step.status,

      department: step.department,
      office: step.office,

      required_forms:
        step.required_forms || [],

      required_documents:
        step.required_documents || [],

      fee: step.fee || {
        amount: null,
        currency: "INR",
        payment_method: [],
      },

      application:
        step.application || {
          mode: [],
          application_link: null,
        },

      eligibility:
        step.eligibility || [],

      prerequisites:
        step.prerequisites || [],

      depends_on:
        step.depends_on || [],

      unlocks:
        step.unlocks || [],

      can_run_in_parallel:
        step.can_run_in_parallel || false,

      time_limit_days:
        step.time_limit_days ?? null,

      official_sources:
        step.official_sources || [],
    },

    // Leave actual layout calculation to frontend
    position: {
      x: 0,
      y: 0,
    },
  }));

  // ----------------------------------
  // Graph Edges
  // ----------------------------------
  const edges = roadmap.dependencies.map(
    (dependency) => ({
      id: `${dependency.from}-${dependency.to}`,

      source: dependency.from,

      target: dependency.to,

      type: "smoothstep",

      animated: false,
    })
  );

  return {
    roadmapId: roadmap._id,

    title: roadmap.title,

    location: roadmap.location,

    nodes,

    edges,
  };
};

export default generateGraphData;