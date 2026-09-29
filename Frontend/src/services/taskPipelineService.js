import Task from "../models/Task.js";
import CivicProcedure from "../models/CivicProcedure.js";

import {
  analyzeTask,
  getGovernmentTask,
} from "./aiService.js";

import generateRoadmap from "./roadmapService.js";

import {
  validateTaskAnalysis,
  validateCivicProcedure,
} from "../utils/aiResponseValidator.js";


const createTaskFromAIResult = async (
  aiResult,
  originalQuery = ""
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
      "AI response does not contain intent or task_id"
    );
  }

  return Task.create({
    query,
    normalizedQuery:
      aiResult.normalized_query || query,
    intent,
    route: aiResult.route || null,
    location:
      aiResult.location ||
      aiResult.jurisdiction?.district ||
      null,
    locationScope:
      aiResult.location_scope ||
      aiResult.jurisdiction?.state ||
      null,
    entities: aiResult.entities || null,
    confidence:
      typeof aiResult.confidence === "number"
        ? aiResult.confidence
        : null,
    intentSource:
      aiResult.intent_source || "GEMINI",
    analysisStatus:
      aiResult.status || "OK",
    missingFields:
      Array.isArray(aiResult.missing_fields)
        ? aiResult.missing_fields
        : [],
    rawAIResponse: aiResult,
  });
};


const normalizeStringArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];


const normalizeObject = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? value
    : {};


const normalizeStep = (step, index) => {
  const source = normalizeObject(step);
  const fees = normalizeObject(
    source.fees || source.fee
  );
  const office = normalizeObject(source.office);
  const application = normalizeObject(
    source.application
  );

  const stepId =
    String(
      source.step_id ||
        `STEP_${index + 1}`
    )
      .trim()
      .toUpperCase();

  const title = String(
    source.title || `Step ${index + 1}`
  ).trim();

  return {
    step_id: stepId,
    title,
    description: String(
      source.description || ""
    ).trim(),
    required_forms:
      normalizeStringArray(
        source.required_forms
      ),
    required_documents:
      normalizeStringArray(
        source.required_documents
      ),
    fees: {
      amount:
        typeof fees.amount === "number"
          ? fees.amount
          : null,
      currency:
        String(
          fees.currency || "INR"
        ).trim(),
      payment_method:
        normalizeStringArray(
          fees.payment_method
        ),
      notes:
        fees.notes || null,
    },
    office: {
      department:
        String(
          office.department || ""
        ).trim(),
      office_name:
        office.office_name || null,
      office_type:
        office.office_type || null,
      location_rule:
        office.location_rule || null,
    },
    prerequisites:
      normalizeStringArray(
        source.prerequisites
      ),
    depends_on:
      normalizeStringArray(
        source.depends_on
      ).map((value) =>
        value.toUpperCase()
      ),
    unlocks:
      normalizeStringArray(
        source.unlocks
      ).map((value) =>
        value.toUpperCase()
      ),
    can_run_in_parallel:
      Boolean(
        source.can_run_in_parallel
      ),
    application: {
      mode:
        normalizeStringArray(
          application.mode
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
    instructions:
      normalizeStringArray(
        source.instructions
      ),
    official_sources:
      Array.isArray(
        source.official_sources
      )
        ? source.official_sources
            .filter(
              (item) =>
                item &&
                typeof item === "object" &&
                !Array.isArray(item)
            )
            .map((item) => ({
              source_title:
                String(
                  item.source_title || ""
                ).trim(),
              source_url:
                String(
                  item.source_url || ""
                ).trim(),
              authority:
                String(
                  item.authority || ""
                ).trim(),
              last_verified:
                String(
                  item.last_verified || ""
                ).trim(),
              source_type:
                String(
                  item.source_type ||
                    "official_government"
                ).trim(),
            }))
        : [],
  };
};


const normalizeGovernmentProcedure = (
  procedureData,
  fallbackTaskId = ""
) => {
  const data = normalizeObject(
    procedureData
  );

  const taskId = String(
    data.task_id || fallbackTaskId
  )
    .trim()
    .toUpperCase();

  if (!taskId) {
    throw new Error(
      "Government procedure does not contain task_id"
    );
  }

  const taskName = String(
    data.task_name || taskId
  ).trim();

  if (!taskName) {
    throw new Error(
      "Government procedure does not contain task_name"
    );
  }

  const rawSteps = Array.isArray(data.steps)
    ? data.steps
        .slice(0, 8)
        .map(normalizeStep)
    : [];

  if (!rawSteps.length) {
    throw new Error(
      "Government procedure does not contain usable steps"
    );
  }

  const validIds = new Set(
    rawSteps.map(
      (step) => step.step_id
    )
  );

  for (const step of rawSteps) {
    step.depends_on = step.depends_on.filter(
      (dependency) =>
        validIds.has(dependency) &&
        dependency !== step.step_id
    );

    step.unlocks = [];
  }

  for (const step of rawSteps) {
    for (const dependency of step.depends_on) {
      const dependencyStep = rawSteps.find(
        (item) =>
          item.step_id === dependency
      );

      if (
        dependencyStep &&
        !dependencyStep.unlocks.includes(
          step.step_id
        )
      ) {
        dependencyStep.unlocks.push(
          step.step_id
        );
      }
    }
  }

  const jurisdiction = normalizeObject(
    data.jurisdiction
  );

  const department = normalizeObject(
    data.department
  );

  const freshness = normalizeObject(
    data.source_freshness
  );

  return {
    task_id: taskId,
    task_name: taskName,
    category:
      String(
        data.category ||
          "civic_service"
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
        data.user_context_required
      ),
    department: {
      name:
        String(
          department.name || ""
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
        data.eligibility
      ),
    steps: rawSteps,
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
        freshness.needs_review !== false,
    },
  };
};


const validateAndNormalizeProcedure = (
  procedureData,
  fallbackTaskId
) => {
  const normalized =
    normalizeGovernmentProcedure(
      procedureData,
      fallbackTaskId
    );

  const validation =
    validateCivicProcedure(
      normalized
    );

  if (!validation.valid) {
    const error =
      new Error(
        "Gemini procedure validation failed"
      );

    error.details =
      validation.errors;

    throw error;
  }

  return normalized;
};


const resolveCivicProcedure = async (
  aiResult
) => {
  const taskIdentifier = String(
    aiResult.task_id ||
      aiResult.intent ||
      ""
  )
    .trim()
    .toUpperCase();

  if (!taskIdentifier) {
    throw new Error(
      "AI response does not contain a task identifier"
    );
  }

  // Gemini now returns the complete procedure in /ai/analyze.
  let procedureData =
    aiResult.procedure;

  // Compatibility fallback: this endpoint is also Gemini-powered.
  if (!procedureData) {
    procedureData =
      await getGovernmentTask(
        taskIdentifier
      );
  }

  const normalizedProcedure =
    validateAndNormalizeProcedure(
      procedureData,
      taskIdentifier
    );

  return CivicProcedure.findOneAndUpdate(
    {
      task_id:
        normalizedProcedure.task_id,
    },
    {
      $set: normalizedProcedure,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};


const processUserTask = async (
  query
) => {
  const aiResult =
    await analyzeTask(query);

  const validation =
    validateTaskAnalysis(
      aiResult
    );

  if (!validation.valid) {
    const error =
      new Error(
        "AI response validation failed"
      );

    error.details =
      validation.errors;

    throw error;
  }

  if (
    aiResult.intent ===
    "GENERAL_CIVIC_TASK"
  ) {
    const error =
      new Error(
        "Unsupported civic service request"
      );

    error.details = [
      "Gemini could not map this request to a supported civic service.",
    ];

    throw error;
  }

  if (
    aiResult.status ===
    "NEEDS_INFO"
  ) {
    const error =
      new Error(
        "AI response requires additional information"
      );

    error.details =
      aiResult.missing_fields || [];

    throw error;
  }

  if (!aiResult.procedure) {
    throw new Error(
      "AI response does not contain a civic procedure"
    );
  }

  const task =
    await createTaskFromAIResult(
      aiResult,
      query
    );

  const procedure =
    await resolveCivicProcedure(
      aiResult
    );

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

  task.roadmapId =
    roadmap._id;

  await task.save();

  return {
    task,
    procedure,
    roadmap,
    aiResult,
    aiResponseType:
      "TASK_ANALYSIS_WITH_GEMINI_PROCEDURE",
  };
};


export {
  processUserTask,
  createTaskFromAIResult,
  resolveCivicProcedure,
  normalizeGovernmentProcedure,
};
