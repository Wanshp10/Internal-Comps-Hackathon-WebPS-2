import express from "express";

import {
  createRoadmap,
  getRoadmapById,
} from "../controllers/roadmapController.js";

import {
  updateProgress,
} from "../controllers/progressController.js";

const router = express.Router();

// ------------------------------------
// Create roadmap
// ------------------------------------
router.post("/", createRoadmap);

// ------------------------------------
// Update step progress
// ------------------------------------
router.patch(
  "/:roadmapId/steps/:stepId/progress",
  updateProgress
);

// ------------------------------------
// Get roadmap
// ------------------------------------
router.get("/:id", getRoadmapById);

export default router;