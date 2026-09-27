import CivicProcedure from "../models/CivicProcedure.js";

// ------------------------------------
// Get all civic procedures
// ------------------------------------
const getAllProcedures = async (req, res) => {
  try {
    const procedures = await CivicProcedure.find()
      .sort({ task_name: 1 });

    return res.status(200).json({
      success: true,
      count: procedures.length,
      data: procedures,
    });
  } catch (error) {
    console.error(
      "Get admin procedures error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch procedures",
    });
  }
};

// ------------------------------------
// Get procedures needing review
// ------------------------------------
const getProceduresNeedingReview = async (
  req,
  res
) => {
  try {
    const procedures =
      await CivicProcedure.find({
        "source_freshness.needs_review": true,
      }).sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: procedures.length,
      data: procedures,
    });
  } catch (error) {
    console.error(
      "Get review procedures error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch procedures needing review",
    });
  }
};

// ------------------------------------
// Get procedure by ID
// ------------------------------------
const getProcedureById = async (
  req,
  res
) => {
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
      "Get admin procedure error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch procedure",
    });
  }
};

// ------------------------------------
// Update complete procedure
// ------------------------------------
const updateProcedure = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const procedure =
      await CivicProcedure.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          "Civic procedure not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Civic procedure updated successfully",
      data: procedure,
    });
  } catch (error) {
    console.error(
      "Update procedure error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Mark procedure for review
// ------------------------------------
const flagProcedureForReview = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const procedure =
      await CivicProcedure.findByIdAndUpdate(
        id,
        {
          $set: {
            "source_freshness.needs_review": true,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          "Civic procedure not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Procedure flagged for review",
      data: procedure,
    });
  } catch (error) {
    console.error(
      "Flag procedure error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to flag procedure",
    });
  }
};

// ------------------------------------
// Mark procedure as reviewed
// ------------------------------------
const markProcedureReviewed = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      last_verified,
    } = req.body;

    const updateData = {
      "source_freshness.needs_review":
        false,
    };

    if (last_verified) {
      updateData[
        "source_freshness.last_verified"
      ] = last_verified;
    }

    const procedure =
      await CivicProcedure.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          "Civic procedure not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Procedure marked as reviewed",
      data: procedure,
    });
  } catch (error) {
    console.error(
      "Mark reviewed error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update review status",
    });
  }
};

// ------------------------------------
// Delete procedure
// ------------------------------------
const deleteProcedure = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const procedure =
      await CivicProcedure.findByIdAndDelete(
        id
      );

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message:
          "Civic procedure not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Civic procedure deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete procedure error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete procedure",
    });
  }
};

export {
  getAllProcedures,
  getProceduresNeedingReview,
  getProcedureById,
  updateProcedure,
  flagProcedureForReview,
  markProcedureReviewed,
  deleteProcedure,
};