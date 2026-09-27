import Task from "../models/Task.js";
import analyzeTask from "../services/aiService.js";

const analyzeUserTask = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    // Send query to Python AI service
    const aiResult = await analyzeTask(query.trim());

    // Save AI analysis in MongoDB
    const task = await Task.create({
      query: aiResult.query,
      normalizedQuery: aiResult.normalized_query,

      intent: aiResult.intent,
      route: aiResult.route,

      location: aiResult.location,
      locationScope: aiResult.location_scope,

      entities: aiResult.entities,

      confidence: aiResult.confidence,
      intentSource: aiResult.intent_source,

      analysisStatus: aiResult.status,
      missingFields: aiResult.missing_fields || [],
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
      message: error.message || "Failed to analyze task",
    });
  }
};

export { analyzeUserTask };