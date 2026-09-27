import express from "express";

import {
  createProcedure,
  getProcedureById,
  getProcedureByTaskId,
} from "../controllers/procedureController.js";

const router = express.Router();

// Create procedure
router.post("/", createProcedure);

// Get by task ID
router.get(
  "/task/:taskId",
  getProcedureByTaskId
);

// Get by MongoDB ID
router.get(
  "/:id",
  getProcedureById
);

export default router;