import CivicProcedure from "../models/CivicProcedure.js";
import Roadmap from "../models/Roadmap.js";

// ------------------------------------
// Generate roadmap from a procedure
// ------------------------------------
const generateRoadmap = async ({
  procedureId,
  taskId,
  location = "",
}) => {
  const procedure = await CivicProcedure.findById(
    procedureId
  );

  if (!procedure) {
    throw new Error("Civic procedure not found");
  }

  const steps = procedure.steps.map((step) => {
    const hasDependencies =
      Array.isArray(step.depends_on) &&
      step.depends_on.length > 0;

    return {
      step_id: step.step_id,

      title:
        step.title?.trim() || "Untitled Step",

      description:
        step.description || "",

      department:
        procedure.department?.name || "",

      office:
        step.office?.office_name || "",

      required_forms:
        step.required_forms || [],

      required_documents:
        step.required_documents || [],

      fee: {
        amount:
          step.fees?.amount ?? null,

        currency:
          step.fees?.currency || "INR",

        payment_method:
          step.fees?.payment_method || [],
      },

      application: {
        mode:
          step.application?.mode || [],

        application_link:
          step.application?.application_link ||
          null,
      },

      eligibility:
        procedure.eligibility || [],

      instructions: [],

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

      status: hasDependencies
        ? "LOCKED"
        : "NOT_STARTED",
    };
  });

  // ------------------------------------
  // Create dependency edges
  // ------------------------------------
  const dependencies = [];

  for (const step of procedure.steps) {
    const dependsOn = step.depends_on || [];

    for (const dependency of dependsOn) {
      dependencies.push({
        from: dependency,
        to: step.step_id,
      });
    }
  }

  const roadmap = await Roadmap.create({
    taskId,
    procedureId,

    title: procedure.task_name,

    location,

    steps,

    dependencies,
  });

  return roadmap;
};

export default generateRoadmap;