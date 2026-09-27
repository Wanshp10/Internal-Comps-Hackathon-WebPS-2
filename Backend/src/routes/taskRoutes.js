import express from "express";

import {
  createTaskFromAnalysis,
  analyzeUserTask,
  getTaskById,
} from "../controllers/taskController.js";

const router = express.Router();

// ------------------------------------
// Main application pipeline
// Query → AI → Task → Procedure → Roadmap
// ------------------------------------
router.post(
  "/analyze",
  analyzeUserTask
);

// ------------------------------------
// Manual AI-result insertion
// Useful during development
// ------------------------------------
router.post(
  "/from-analysis",
  createTaskFromAnalysis
);

// ------------------------------------
// Get task
// ------------------------------------
router.get(
  "/:id",
  getTaskById
);

export default router;