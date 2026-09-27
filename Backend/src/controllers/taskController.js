import Task from "../models/Task.js";
import analyzeTask from "../services/aiService.js";

const analyzeUserTask = async (req, res) => {
  try {
    const { query } = req.body;

    if (
      !query ||
      typeof query !== "string" ||
      !query.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const cleanedQuery = query.trim();

    const aiResult = await analyzeTask(cleanedQuery);

    if (
      !aiResult ||
      typeof aiResult !== "object"
    ) {
      return res.status(502).json({
        success: false,
        message:
          "Invalid response received from AI service",
      });
    }

    if (!aiResult.intent) {
      return res.status(502).json({
        success: false,
        message:
          "AI service did not return an intent",
      });
    }

    const task = await Task.create({
      query: aiResult.query || cleanedQuery,

      normalizedQuery:
        aiResult.normalized_query || cleanedQuery,

      intent: aiResult.intent,

      route: aiResult.route || null,

      location: aiResult.location || null,

      locationScope:
        aiResult.location_scope || null,

      entities: aiResult.entities || null,

      confidence:
        typeof aiResult.confidence === "number"
          ? aiResult.confidence
          : null,

      intentSource:
        aiResult.intent_source || null,

      analysisStatus:
        aiResult.status || null,

      missingFields:
        Array.isArray(aiResult.missing_fields)
          ? aiResult.missing_fields
          : [],

      rawAIResponse: aiResult,
    });

    return res.status(201).json({
      success: true,
      message: "Task analyzed successfully",
      data: {
        taskId: task._id,
        analysis: aiResult,
      },
    });
  } catch (error) {
    console.error("Task analysis error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to analyze task",
    });
  }
};

export {
  analyzeUserTask,
};