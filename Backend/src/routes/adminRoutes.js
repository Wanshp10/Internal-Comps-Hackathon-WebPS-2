import express from "express";

import {
  getAllProcedures,
  getProceduresNeedingReview,
  getProcedureById,
  updateProcedure,
  flagProcedureForReview,
  markProcedureReviewed,
  deleteProcedure,
} from "../controllers/adminController.js";

const router = express.Router();

// ------------------------------------
// Procedure management
// ------------------------------------
router.get(
  "/procedures",
  getAllProcedures
);

router.get(
  "/procedures/review",
  getProceduresNeedingReview
);

router.get(
  "/procedures/:id",
  getProcedureById
);

router.patch(
  "/procedures/:id",
  updateProcedure
);

router.patch(
  "/procedures/:id/flag",
  flagProcedureForReview
);

router.patch(
  "/procedures/:id/review",
  markProcedureReviewed
);

router.delete(
  "/procedures/:id",
  deleteProcedure
);

export default router;