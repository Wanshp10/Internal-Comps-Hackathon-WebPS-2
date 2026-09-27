import CivicProcedure from "../models/CivicProcedure.js";

// ------------------------------------
// Create / store AI-generated procedure
// ------------------------------------
const createProcedure = async (req, res) => {
  try {
    const procedureData = req.body;

    if (
      !procedureData ||
      !procedureData.task_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "task_id is required",
      });
    }

    if (!procedureData.task_name) {
      return res.status(400).json({
        success: false,
        message:
          "task_name is required",
      });
    }

    const procedure =
      await CivicProcedure.create(
        procedureData
      );

    return res.status(201).json({
      success: true,
      message:
        "Civic procedure stored successfully",
      data: procedure,
    });
  } catch (error) {
    console.error(
      "Create procedure error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Get procedure by MongoDB ID
// ------------------------------------
const getProcedureById = async (req, res) => {
  try {
    const { id } = req.params;

    const procedure =
      await CivicProcedure.findById(id);

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          "Civic procedure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: procedure,
    });
  } catch (error) {
    console.error(
      "Get procedure error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch civic procedure",
    });
  }
};

// ------------------------------------
// Get procedure by task ID
// ------------------------------------
const getProcedureByTaskId = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    const procedure =
      await CivicProcedure.findOne({
        task_id: taskId,
      });

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          "Civic procedure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: procedure,
    });
  } catch (error) {
    console.error(
      "Get procedure by task ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch civic procedure",
    });
  }
};

export {
  createProcedure,
  getProcedureById,
  getProcedureByTaskId,
};