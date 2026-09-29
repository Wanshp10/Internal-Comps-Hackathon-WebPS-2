import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import taskRoutes from "./routes/taskRoutes.js";
import procedureRoutes from "./routes/procedureRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// ------------------------------------
// Security
// ------------------------------------
app.use(helmet());

// ------------------------------------
// CORS
// ------------------------------------
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

// ------------------------------------
// Request Logging
// ------------------------------------
app.use(morgan("dev"));

// ------------------------------------
// Body Parsing
// ------------------------------------
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ------------------------------------
// Root Route
// ------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "PSWB02 Municipal Bureaucracy Path Visualizer API",
    version: "v1",
  });
});

// ------------------------------------
// Health Check
// ------------------------------------
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

// ------------------------------------
// Task Routes
// ------------------------------------
app.use(
  "/api/v1/tasks",
  taskRoutes
);

// ------------------------------------
// Procedure Routes
// ------------------------------------
app.use(
  "/api/v1/procedures",
  procedureRoutes
);

// ------------------------------------
// Roadmap Routes
// ------------------------------------
app.use(
  "/api/v1/roadmaps",
  roadmapRoutes
);

// ------------------------------------
// Admin Routes
// ------------------------------------
app.use(
  "/api/v1/admin",
  adminRoutes
);

// ------------------------------------
// 404 Handler
// ------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ------------------------------------
// Global Error Handler
// ------------------------------------
app.use(
  (err, req, res, next) => {
    console.error(
      "Unhandled Error:",
      err
    );

    res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

export default app;