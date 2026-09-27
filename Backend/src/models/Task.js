import mongoose from "mongoose";

// ------------------------------------
// AI Extracted Entities
// ------------------------------------
const entitySchema = new mongoose.Schema(
  {
    location: {
      type: String,
      default: null,
      trim: true,
    },

    business_type: {
      type: String,
      default: null,
      trim: true,
    },

    event_type: {
      type: String,
      default: null,
      trim: true,
    },

    birth_subtype: {
      type: String,
      default: null,
      trim: true,
    },

    domicile_purpose: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ------------------------------------
// Task Schema
// ------------------------------------
const taskSchema = new mongoose.Schema(
  {
    // Original query entered by the citizen
    query: {
      type: String,
      required: true,
      trim: true,
    },

    // Query normalized by the AI model
    normalizedQuery: {
      type: String,
      default: null,
      trim: true,
    },

    // AI detected intent
    // Example: OPEN_FOOD_BUSINESS
    intent: {
      type: String,
      required: true,
      trim: true,
    },

    // Route selected by the AI
    // Example: CUSTOM_FAST_PATH
    route: {
      type: String,
      default: null,
      trim: true,
    },

    // Detected location
    // Example: Pune
    location: {
      type: String,
      default: null,
      trim: true,
    },

    // Geographic scope
    // Example: MAHARASHTRA
    locationScope: {
      type: String,
      default: null,
      trim: true,
    },

    // Entities extracted from the query
    entities: {
      type: entitySchema,
      default: null,
    },

    // AI confidence score
    // Expected range: 0 to 1
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    // Source of the detected intent
    // Example: CUSTOM_MODEL
    intentSource: {
      type: String,
      default: null,
      trim: true,
    },

    // AI analysis status
    // Example: OK
    analysisStatus: {
      type: String,
      default: null,
      trim: true,
    },

    // Fields that AI says are missing
    // Example: ["business_type", "location"]
    missingFields: [
      {
        type: String,
        trim: true,
      },
    ],

    // Complete AI response
    // Useful for debugging and future model changes
    rawAIResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Will be linked once a roadmap is generated
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------
// Model
// ------------------------------------
const Task = mongoose.model("Task", taskSchema);

export default Task;