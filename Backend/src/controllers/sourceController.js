import Source from "../models/Source.js";

// ------------------------------------
// Get all sources
// ------------------------------------
const getAllSources = async (req, res) => {
  try {
    const sources = await Source.find()
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: sources.length,
      data: sources,
    });
  } catch (error) {
    console.error(
      "Get sources error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch sources",
    });
  }
};

// ------------------------------------
// Get source by ID
// ------------------------------------
const getSourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const source =
      await Source.findById(id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error(
      "Get source error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch source",
    });
  }
};

// ------------------------------------
// Create source
// ------------------------------------
const createSource = async (req, res) => {
  try {
    const {
      source_title,
      source_url,
      authority,
      source_type,
      last_verified,
      verified,
      needs_review,
    } = req.body;

    if (!source_title) {
      return res.status(400).json({
        success: false,
        message:
          "source_title is required",
      });
    }

    if (!source_url) {
      return res.status(400).json({
        success: false,
        message:
          "source_url is required",
      });
    }

    const source =
      await Source.create({
        source_title,
        source_url,
        authority,
        source_type,
        last_verified,
        verified,
        needs_review,
      });

    return res.status(201).json({
      success: true,
      message:
        "Source created successfully",
      data: source,
    });
  } catch (error) {
    console.error(
      "Create source error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Update source
// ------------------------------------
const updateSource = async (req, res) => {
  try {
    const { id } = req.params;

    const source =
      await Source.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Source updated successfully",
      data: source,
    });
  } catch (error) {
    console.error(
      "Update source error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Mark source as verified
// ------------------------------------
const verifySource = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      last_verified,
    } = req.body;

    const updateData = {
      verified: true,
      needs_review: false,
    };

    if (last_verified) {
      updateData.last_verified =
        last_verified;
    }

    const source =
      await Source.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Source marked as verified",
      data: source,
    });
  } catch (error) {
    console.error(
      "Verify source error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify source",
    });
  }
};

// ------------------------------------
// Flag source for review
// ------------------------------------
const flagSource = async (req, res) => {
  try {
    const { id } = req.params;

    const source =
      await Source.findByIdAndUpdate(
        id,
        {
          $set: {
            needs_review: true,
            verified: false,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Source flagged for review",
      data: source,
    });
  } catch (error) {
    console.error(
      "Flag source error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to flag source",
    });
  }
};

// ------------------------------------
// Delete source
// ------------------------------------
const deleteSource = async (req, res) => {
  try {
    const { id } = req.params;

    const source =
      await Source.findByIdAndDelete(id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Source deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete source error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete source",
    });
  }
};

export {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  verifySource,
  flagSource,
  deleteSource,
};