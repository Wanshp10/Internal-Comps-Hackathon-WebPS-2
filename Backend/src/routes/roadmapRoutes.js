import express from "express";

import {
  createRoadmap,
  createRoadmapFromTask,
  getRoadmapById,
  getRoadmapGraph,
} from "../controllers/roadmapController.js";

import {
  updateProgress,
  getBlockerExplanation,
  getProgressSummaryController,
} from "../controllers/progressController.js";

const router = express.Router();

// ------------------------------------
// Generate roadmap
// ------------------------------------
router.post(
  "/",
  createRoadmap
);

// ------------------------------------
// Generate roadmap directly from task
// ------------------------------------
router.post(
  "/from-task/:taskId",
  createRoadmapFromTask
);

// ------------------------------------
// Graph-ready roadmap
// ------------------------------------
router.get(
  "/:id/graph",
  getRoadmapGraph
);

// ------------------------------------
// Progress summary
// ------------------------------------
router.get(
  "/:roadmapId/progress",
  getProgressSummaryController
);

// ------------------------------------
// Why is this step blocked?
// ------------------------------------
router.get(
  "/:roadmapId/steps/:stepId/blocker",
  getBlockerExplanation
);

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
router.get(
  "/:id",
  getRoadmapById
);

export default router;