import Roadmap from "../models/Roadmap.js";
import generateRoadmap from "../services/roadmapService.js";

// ------------------------------------
// Generate roadmap
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
      message: "Failed to fetch roadmap",
    });
  }
};

export {
  createRoadmap,
  getRoadmapById,
};