import express from "express";

import {
  analyzeUserTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/analyze", analyzeUserTask);

export default router;