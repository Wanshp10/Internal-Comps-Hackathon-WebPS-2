import Roadmap from "../models/Roadmap.js";
import Task from "../models/Task.js";
import CivicProcedure from "../models/CivicProcedure.js";

import generateRoadmap from "../services/roadmapService.js";
import generateGraphData from "../services/graphService.js";

// ------------------------------------
// Generate roadmap using explicit IDs
// ------------------------------------
const createRoadmap = async (req, res) => {
  try {
    const {
      procedureId,
      taskId,
      location,
    } = req.body;

    if (!procedureId) {
      return res.status(400).json({
        success: false,
        message: "procedureId is required",
      });
    }

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "taskId is required",
      });
    }

    const roadmap = await generateRoadmap({
      procedureId,
      taskId,
      location,
    });

    // Link roadmap back to task
    await Task.findByIdAndUpdate(
      taskId,
      {
        roadmapId: roadmap._id,
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Roadmap generated successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error(
      "Create roadmap error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate roadmap",
    });
  }
};

// ------------------------------------
// Generate roadmap directly from Task
// ------------------------------------
const createRoadmapFromTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!task.intent) {
      return res.status(400).json({
        success: false,
        message:
          "Task does not contain an intent",
      });
    }

    const procedure =
      await CivicProcedure.findOne({
        task_id: task.intent,
      });

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          `No civic procedure found for intent: ${task.intent}`,
      });
    }

    const roadmap = await generateRoadmap({
      procedureId: procedure._id,
      taskId: task._id,
      location: task.location || "",
    });

    task.roadmapId = roadmap._id;

    await task.save();

    return res.status(201).json({
      success: true,
      message:
        "Roadmap generated from task successfully",

      data: {
        taskId: task._id,
        procedureId: procedure._id,
        roadmapId: roadmap._id,
        roadmap,
      },
    });
  } catch (error) {
    console.error(
      "Create roadmap from task error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate roadmap from task",
    });
  }
};

// ------------------------------------
// Get roadmap
// ------------------------------------
const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await Roadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error(
      "Get roadmap error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch roadmap",
    });
  }
};

// ------------------------------------
// Get graph-ready roadmap
// ------------------------------------
const getRoadmapGraph = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const graphData =
      await generateGraphData(id);

    return res.status(200).json({
      success: true,
      data: graphData,
    });
  } catch (error) {
    console.error(
      "Get roadmap graph error:",
      error
    );

    const statusCode =
      error.message ===
      "Roadmap not found"
        ? 404
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createRoadmap,
  createRoadmapFromTask,
  getRoadmapById,
  getRoadmapGraph,
};