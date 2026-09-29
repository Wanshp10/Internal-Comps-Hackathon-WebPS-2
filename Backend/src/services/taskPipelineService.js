import Task from "../models/Task.js";
import CivicProcedure from "../models/CivicProcedure.js";

import analyzeTask from "./aiService.js";
import generateRoadmap from "./roadmapService.js";

import {
  validateTaskAnalysis,
  validateCivicProcedure,
} from "../utils/aiResponseValidator.js";


// ============================================================
// HELPERS
// ============================================================

const normalizeStringArray = (
  value,
) =>
  Array.isArray(value)
    ? value
        .map((item) =>
          String(item || "").trim(),
        )
        .filter(Boolean)
    : [];


const normalizeObject = (
  value,
) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? value
    : {};


// ============================================================
// CREATE TASK
// ============================================================

const createTaskFromAIResult =
  async (
    aiResult,
    originalQuery = "",
  ) => {

    const query =
      originalQuery ||
      aiResult.query ||
      aiResult.normalized_query ||
      "";

    const intent =
      aiResult.intent ||
      aiResult.task_id ||
      "";

    if (!intent) {
      throw new Error(
        "AI response does not contain intent or task_id",
      );
    }

    return Task.create({
      query,

      normalizedQuery:
        aiResult.normalized_query ||
        query,

      intent,

      route:
        aiResult.route ||
        null,

      location:
        aiResult.location ||
        aiResult.jurisdiction?.district ||
        null,

      locationScope:
        aiResult.location_scope ||
        aiResult.jurisdiction?.state ||
        null,

      entities:
        aiResult.entities ||
        null,

      confidence:
        typeof aiResult.confidence ===
        "number"
          ? aiResult.confidence
          : null,

      intentSource:
        aiResult.intent_source ||
        "GEMINI",

      analysisStatus:
        aiResult.status ||
        "OK",

      missingFields:
        Array.isArray(
          aiResult.missing_fields,
        )
          ? aiResult.missing_fields
          : [],

      rawAIResponse:
        aiResult,
    });
  };


// ============================================================
// STEP NORMALIZATION
// ============================================================

const normalizeStep = (
  step,
  index,
) => {

  const source =
    normalizeObject(step);

  const fees =
    normalizeObject(
      source.fees ||
        source.fee,
    );

  const office =
    normalizeObject(
      source.office,
    );

  const application =
    normalizeObject(
      source.application,
    );

  const stepId =
    String(
      source.step_id ||
        `STEP_${index + 1}`,
    )
      .trim()
      .toUpperCase();

  const title =
    String(
      source.title ||
        `Step ${index + 1}`,
    ).trim();

  return {
    step_id:
      stepId,

    title:
      title,

    description:
      String(
        source.description ||
          "",
      ).trim(),

    required_forms:
      normalizeStringArray(
        source.required_forms,
      ),

    required_documents:
      normalizeStringArray(
        source.required_documents,
      ),

    instructions:
      normalizeStringArray(
        source.instructions,
      ),

    fees: {
      amount:
        typeof fees.amount ===
        "number"
          ? fees.amount
          : null,

      currency:
        String(
          fees.currency ||
            "INR",
        ).trim(),

      payment_method:
        normalizeStringArray(
          fees.payment_method,
        ),

      notes:
        fees.notes ||
        null,
    },

    office: {
      department:
        String(
          office.department ||
            "",
        ).trim(),

      office_name:
        office.office_name ||
        null,

      office_type:
        office.office_type ||
        null,

      location_rule:
        office.location_rule ||
        null,
    },

    prerequisites:
      normalizeStringArray(
        source.prerequisites,
      ),

    depends_on:
      normalizeStringArray(
        source.depends_on,
      ).map((value) =>
        value.toUpperCase(),
      ),

    unlocks:
      normalizeStringArray(
        source.unlocks,
      ).map((value) =>
        value.toUpperCase(),
      ),

    can_run_in_parallel:
      Boolean(
        source.can_run_in_parallel,
      ),

    application: {
      mode:
        normalizeStringArray(
          application.mode,
        ),

      application_link:
        application.application_link ||
        null,
    },

    time_limit_days:
      typeof source.time_limit_days ===
      "number"
        ? source.time_limit_days
        : null,

    official_sources:
      Array.isArray(
        source.official_sources,
      )
        ? source.official_sources
            .filter(
              (item) =>
                item &&
                typeof item ===
                  "object" &&
                !Array.isArray(item),
            )
            .map((item) => ({
              source_title:
                String(
                  item.source_title ||
                    "",
                ).trim(),

              source_url:
                String(
                  item.source_url ||
                    "",
                ).trim(),

              authority:
                String(
                  item.authority ||
                    "",
                ).trim(),

              last_verified:
                String(
                  item.last_verified ||
                    "",
                ).trim(),

              source_type:
                String(
                  item.source_type ||
                    "official_government",
                ).trim(),
            }))
        : [],
  };
};


// ============================================================
// PROCEDURE NORMALIZATION
// ============================================================

const normalizeGovernmentProcedure =
  (
    procedureData,
    fallbackTaskId = "",
  ) => {

    const data =
      normalizeObject(
        procedureData,
      );

    const taskId =
      String(
        data.task_id ||
          fallbackTaskId,
      )
        .trim()
        .toUpperCase();

    if (!taskId) {
      throw new Error(
        "Gemini procedure does not contain task_id",
      );
    }

    const taskName =
      String(
        data.task_name ||
          taskId
            .replace(
              /_/g,
              " ",
            )
            .replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase(),
            ),
      ).trim();

    const rawSteps =
      Array.isArray(
        data.steps,
      )
        ? data.steps
            .slice(0, 8)
            .map(
              normalizeStep,
            )
        : [];

    if (
      rawSteps.length < 4
    ) {

      throw new Error(
        "Gemini procedure must contain at least 4 usable steps",
      );
    }

    const validIds =
      new Set(
        rawSteps.map(
          (step) =>
            step.step_id,
        ),
      );

    for (const step of rawSteps) {

      step.depends_on =
        step.depends_on.filter(
          (dependency) =>
            validIds.has(
              dependency,
            ) &&
            dependency !==
              step.step_id,
        );

      step.unlocks = [];
    }

    for (
      const step
      of rawSteps
    ) {

      for (
        const dependency
        of step.depends_on
      ) {

        const dependencyStep =
          rawSteps.find(
            (item) =>
              item.step_id ===
              dependency,
          );

        if (
          dependencyStep &&
          !dependencyStep.unlocks.includes(
            step.step_id,
          )
        ) {

          dependencyStep.unlocks.push(
            step.step_id,
          );
        }
      }
    }

    const jurisdiction =
      normalizeObject(
        data.jurisdiction,
      );

    const department =
      normalizeObject(
        data.department,
      );

    const freshness =
      normalizeObject(
        data.source_freshness,
      );

    return {
      task_id:
        taskId,

      task_name:
        taskName,

      category:
        String(
          data.category ||
            "civic_service",
        ).trim(),

      jurisdiction: {
        state:
          jurisdiction.state ||
          "Maharashtra",

        district:
          jurisdiction.district ||
          null,

        local_body:
          jurisdiction.local_body ||
          null,
      },

      user_context_required:
        normalizeStringArray(
          data.user_context_required,
        ),

      department: {
        name:
          String(
            department.name ||
              "",
          ).trim(),

        sub_department:
          department.sub_department ||
          null,

        designated_officer:
          department.designated_officer ||
          null,

        office_type:
          department.office_type ||
          null,
      },

      eligibility:
        normalizeStringArray(
          data.eligibility,
        ),

      steps:
        rawSteps,

      status_options: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "LOCKED",
      ],

      source_freshness: {
        last_verified:
          freshness.last_verified ||
          null,

        needs_review:
          freshness.needs_review !==
          false,
      },
    };
  };


// ============================================================
// STORE GEMINI PROCEDURE
// ============================================================

const saveGeminiProcedure =
  async (
    aiResult,
  ) => {

    const taskIdentifier =
      String(
        aiResult.task_id ||
          aiResult.intent ||
          "",
      )
        .trim()
        .toUpperCase();

    if (!taskIdentifier) {

      throw new Error(
        "AI response does not contain a task identifier",
      );
    }

    if (
      !aiResult.procedure
    ) {

      throw new Error(
        "Gemini response does not contain a procedure",
      );
    }

    const normalizedProcedure =
      normalizeGovernmentProcedure(
        aiResult.procedure,
        taskIdentifier,
      );

    const validation =
      validateCivicProcedure(
        normalizedProcedure,
      );

    if (!validation.valid) {

      const error =
        new Error(
          "Gemini procedure validation failed",
        );

      error.details =
        validation.errors;

      throw error;
    }

    return CivicProcedure.findOneAndUpdate(
      {
        task_id:
          normalizedProcedure.task_id,
      },

      {
        $set:
          normalizedProcedure,
      },

      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert:
          true,
      },
    );
  };


// ============================================================
// MAIN PIPELINE
// ============================================================

const processUserTask =
  async (
    query,
  ) => {

    // --------------------------------------------------------
    // 1. Gemini does EVERYTHING
    // --------------------------------------------------------

    const aiResult =
      await analyzeTask(
        query,
      );

    console.log(
      "Gemini intent:",
      aiResult.intent,
    );

    console.log(
      "Gemini procedure steps:",
      Array.isArray(
        aiResult.procedure?.steps,
      )
        ? aiResult.procedure.steps.length
        : 0,
    );

    // --------------------------------------------------------
    // 2. Validate AI response
    // --------------------------------------------------------

    const validation =
      validateTaskAnalysis(
        aiResult,
      );

    if (!validation.valid) {

      const error =
        new Error(
          "AI response validation failed",
        );

      error.details =
        validation.errors;

      throw error;
    }

    // --------------------------------------------------------
    // 3. Unsupported request
    // --------------------------------------------------------

    if (
      aiResult.intent ===
      "GENERAL_CIVIC_TASK"
    ) {

      const error =
        new Error(
          "Unsupported civic service request",
        );

      error.details = [
        "Gemini could not map this request to a supported civic service.",
      ];

      throw error;
    }

    // --------------------------------------------------------
    // 4. Missing information
    // --------------------------------------------------------

    if (
      aiResult.status ===
      "NEEDS_INFO"
    ) {

      const error =
        new Error(
          "AI response requires additional information",
        );

      error.details =
        aiResult.missing_fields ||
        [];

      throw error;
    }

    // --------------------------------------------------------
    // 5. Gemini MUST provide procedure
    // --------------------------------------------------------

    if (
      !aiResult.procedure
    ) {

      throw new Error(
        "Gemini response does not contain a procedure",
      );
    }

    // --------------------------------------------------------
    // 6. Create task
    // --------------------------------------------------------

    const task =
      await createTaskFromAIResult(
        aiResult,
        query,
      );

    // --------------------------------------------------------
    // 7. Save/replace Gemini procedure
    // --------------------------------------------------------

    const procedure =
      await saveGeminiProcedure(
        aiResult,
      );

    // --------------------------------------------------------
    // 8. Generate roadmap
    // --------------------------------------------------------

    const roadmap =
      await generateRoadmap({
        procedureId:
          procedure._id,

        taskId:
          task._id,

        location:
          task.location ||
          procedure.jurisdiction
            ?.district ||
          procedure.jurisdiction
            ?.state ||
          "Maharashtra",
      });

    // --------------------------------------------------------
    // 9. Link roadmap
    // --------------------------------------------------------

    task.roadmapId =
      roadmap._id;

    await task.save();

    return {
      task,

      procedure,

      roadmap,

      aiResult,

      aiResponseType:
        "GEMINI_COMPLETE_PROCEDURE",
    };
  };


// ============================================================
// EXPORTS
// ============================================================

export {
  processUserTask,
  createTaskFromAIResult,
  normalizeGovernmentProcedure,
};