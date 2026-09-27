import {
  updateStepProgress,
  getStepBlockers,
  getProgressSummary,
} from "../services/progressService.js";

// ------------------------------------
// Update step progress
// ------------------------------------
const updateProgress = async (
  req,
  res
) => {
  try {
    const {
      roadmapId,
      stepId,
    } = req.params;

    const status = req.body?.status;

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "status is required in request body",
      });
    }

    const roadmap =
      await updateStepProgress({
        roadmapId,
        stepId,
        status,
      });

    return res.status(200).json({
      success: true,
      message:
        "Step progress updated successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error(
      "Update progress error:",
      error
    );

    const isClientError =
      error.message ===
        "Roadmap not found" ||
      error.message ===
        "Step not found in roadmap" ||
      error.message.startsWith(
        "Invalid status"
      ) ||
      error.message.startsWith(
        "This step is locked"
      );

    return res.status(
      isClientError ? 400 : 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Explain why a step is blocked
// ------------------------------------
const getBlockerExplanation = async (
  req,
  res
) => {
  try {
    const {
      roadmapId,
      stepId,
    } = req.params;

    const result =
      await getStepBlockers({
        roadmapId,
        stepId,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Get blocker explanation error:",
      error
    );

    const isNotFound =
      error.message ===
        "Roadmap not found" ||
      error.message ===
        "Step not found in roadmap";

    return res.status(
      isNotFound ? 404 : 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Get roadmap progress summary
// ------------------------------------
const getProgressSummaryController =
  async (req, res) => {
    try {
      const { roadmapId } =
        req.params;

      const result =
        await getProgressSummary(
          roadmapId
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "Get progress summary error:",
        error
      );

      return res.status(
        error.message ===
          "Roadmap not found"
          ? 404
          : 500
      ).json({
        success: false,
        message: error.message,
      });
    }
  };

export {
  updateProgress,
  getBlockerExplanation,
  getProgressSummaryController,
};