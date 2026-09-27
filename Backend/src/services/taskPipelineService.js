import Task from "../models/Task.js";
import CivicProcedure from "../models/CivicProcedure.js";

import analyzeTask from "./aiService.js";
import generateRoadmap from "./roadmapService.js";

import {
  validateAIResponse,
} from "../utils/aiResponseValidator.js";

// ------------------------------------
// Create Task from AI result
// ------------------------------------
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

  const task =
    await Task.create({
      query,

      normalizedQuery:
        aiResult.normalized_query ||
        query,

      intent,

      route:
        aiResult.route || null,

      location:
        aiResult.location ||
        aiResult.jurisdiction
          ?.district ||
        null,

      locationScope:
        aiResult.location_scope ||
        aiResult.jurisdiction
          ?.state ||
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
        "AI",

      analysisStatus:
        aiResult.status ||
        "OK",

      missingFields:
        Array.isArray(
          aiResult.missing_fields
        )
          ? aiResult.missing_fields
          : [],

      rawAIResponse:
        aiResult,
    });

  return task;
};

// ------------------------------------
// Resolve civic procedure
// ------------------------------------
const resolveCivicProcedure = async (
  aiResult
) => {
  // ----------------------------------
  // Case 1:
  // AI directly returned full procedure
  // ----------------------------------
  if (
    aiResult.task_id &&
    Array.isArray(aiResult.steps)
  ) {
    const procedure =
      await CivicProcedure.findOneAndUpdate(
        {
          task_id:
            aiResult.task_id,
        },

        aiResult,

        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    return procedure;
  }

  // ----------------------------------
  // Case 2:
  // AI returned task analysis only
  // ----------------------------------
  const taskIdentifier =
    aiResult.intent ||
    aiResult.task_id;

  if (!taskIdentifier) {
    throw new Error(
      "AI response does not contain a task identifier"
    );
  }

  const procedure =
    await CivicProcedure.findOne({
      task_id:
        taskIdentifier,
    });

  if (procedure) {
    return procedure;
  }

  throw new Error(
    `No civic procedure found for intent: ${taskIdentifier}`
  );
};

// ------------------------------------
// Complete pipeline
// ------------------------------------
const processUserTask = async (
  query
) => {
  // ----------------------------------
  // 1. Call ML model
  // ----------------------------------
  const aiResult =
    await analyzeTask(query);

  // ----------------------------------
  // 2. Validate model response
  // ----------------------------------
  const validation =
    validateAIResponse(
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

  // ----------------------------------
  // 3. Create task record
  // ----------------------------------
  const task =
    await createTaskFromAIResult(
      aiResult,
      query
    );

  // ----------------------------------
  // 4. Resolve dynamic procedure
  // ----------------------------------
  const procedure =
    await resolveCivicProcedure(
      aiResult
    );

  // ----------------------------------
  // 5. Generate roadmap
  // ----------------------------------
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
        "",
    });

  // ----------------------------------
  // 6. Connect task -> roadmap
  // ----------------------------------
  task.roadmapId =
    roadmap._id;

  await task.save();

  return {
    task,
    procedure,
    roadmap,
    aiResult,

    aiResponseType:
      validation.type,
  };
};

export {
  processUserTask,
  createTaskFromAIResult,
  resolveCivicProcedure,
};