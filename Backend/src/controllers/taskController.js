import Task from "../models/Task.js";

import {
  processUserTask,
  createTaskFromAIResult,
} from "../services/taskPipelineService.js";

// ------------------------------------
// Create task from existing AI result
// ------------------------------------
const createTaskFromAnalysis = async (
  req,
  res
) => {
  try {
    const aiResult = req.body;

    if (
      !aiResult ||
      typeof aiResult !== "object" ||
      Array.isArray(aiResult)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "AI analysis data is required",
      });
    }

    if (
      !aiResult.intent &&
      !aiResult.task_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "intent or task_id is required",
      });
    }

    const task =
      await createTaskFromAIResult(
        aiResult,
        aiResult.query || ""
      );

    return res.status(201).json({
      success: true,
      message:
        "Task created successfully",
      data: {
        taskId: task._id,
        task,
      },
    });
  } catch (error) {
    console.error(
      "Create task from analysis error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create task",
    });
  }
};

// ------------------------------------
// Final end-to-end pipeline
// ------------------------------------
const analyzeUserTask = async (
  req,
  res
) => {
  try {
    const { query } = req.body;

    if (
      !query ||
      typeof query !== "string" ||
      !query.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Query is required",
      });
    }

    const result =
      await processUserTask(
        query.trim()
      );

    return res.status(201).json({
      success: true,

      message:
        "Task analyzed and roadmap generated successfully",

      data: {
        taskId:
          result.task._id,

        procedureId:
          result.procedure._id,

        roadmapId:
          result.roadmap._id,

        aiResponseType:
          result.aiResponseType,

        analysis:
          result.aiResult,

        task:
          result.task,

        procedure:
          result.procedure,

        roadmap:
          result.roadmap,
      },
    });
  } catch (error) {
    console.error(
      "Task pipeline error:",
      error
    );

    if (
      error.message ===
      "AI service is unavailable"
    ) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is currently unavailable",
      });
    }

    if (
      error.message ===
      "AI service request timed out"
    ) {
      return res.status(504).json({
        success: false,
        message:
          "AI service request timed out",
      });
    }

    if (
      error.message ===
      "AI response validation failed"
    ) {
      return res.status(502).json({
        success: false,
        message:
          "AI returned an invalid response",
        details:
          error.details || [],
      });
    }

    if (
      error.message.startsWith(
        "No civic procedure found"
      )
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.startsWith(
        "AI response does not contain"
      )
    ) {
      return res.status(502).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to process task",
    });
  }
};

// ------------------------------------
// Get Task
// ------------------------------------
const getTaskById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const task =
      await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error(
      "Get task error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch task",
    });
  }
};

export {
  createTaskFromAnalysis,
  analyzeUserTask,
  getTaskById,
};