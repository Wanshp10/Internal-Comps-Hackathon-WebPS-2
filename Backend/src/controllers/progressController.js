import updateStepProgress from "../services/progressService.js";

// ------------------------------------
// Update roadmap step progress
// ------------------------------------
const updateProgress = async (req, res) => {
  try {
    const { roadmapId, stepId } = req.params;

    const status = req.body?.status;

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "status is required in request body",
      });
    }

    const roadmap = await updateStepProgress({
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
      error.message === "Roadmap not found" ||
      error.message ===
        "Step not found in roadmap" ||
      error.message.startsWith(
        "Invalid status"
      ) ||
      error.message.startsWith(
        "This step is locked"
      );

    return res.status(isClientError ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export { updateProgress };