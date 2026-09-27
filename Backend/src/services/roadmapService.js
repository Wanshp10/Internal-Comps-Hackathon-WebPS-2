import CivicProcedure from "../models/CivicProcedure.js";
import Roadmap from "../models/Roadmap.js";

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
      step.depends_on &&
      step.depends_on.length > 0;

    return {
      step_id: step.step_id,
      title: step.title || "Untitled Step",
      description: step.description || "",

      department:
        procedure.department?.name || "",

      office: step.office?.office_name || "",

      required_forms:
        step.required_forms || [],

      required_documents:
        step.required_documents || [],

      fee: {
        amount: step.fees?.amount ?? null,
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

      // Initial state
      status: hasDependencies
        ? "LOCKED"
        : "NOT_STARTED",
    };
  });

  // Create dependency edges
  const dependencies = [];

  for (const step of procedure.steps) {
    if (!step.depends_on) continue;

    for (const dependency of step.depends_on) {
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