import express from "express";

import {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  verifySource,
  flagSource,
  deleteSource,
} from "../controllers/sourceController.js";

const router = express.Router();

// ------------------------------------
// Source CRUD
// ------------------------------------
router.get(
  "/",
  getAllSources
);

router.get(
  "/:id",
  getSourceById
);

router.post(
  "/",
  createSource
);

router.patch(
  "/:id",
  updateSource
);

// ------------------------------------
// Verification
// ------------------------------------
router.patch(
  "/:id/verify",
  verifySource
);

router.patch(
  "/:id/flag",
  flagSource
);

// ------------------------------------
// Delete
// ------------------------------------
router.delete(
  "/:id",
  deleteSource
);

export default router;