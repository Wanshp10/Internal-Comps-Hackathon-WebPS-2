import mongoose from "mongoose";

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

const taskSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedQuery: {
      type: String,
      default: null,
      trim: true,
    },

    intent: {
      type: String,
      required: true,
      trim: true,
    },

    route: {
      type: String,
      default: null,
      trim: true,
    },

    location: {
      type: String,
      default: null,
      trim: true,
    },

    locationScope: {
      type: String,
      default: null,
      trim: true,
    },

    entities: {
      type: entitySchema,
      default: null,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    intentSource: {
      type: String,
      default: null,
      trim: true,
    },

    analysisStatus: {
      type: String,
      default: null,
      trim: true,
    },

    missingFields: [
      {
        type: String,
        trim: true,
      },
    ],

    rawAIResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

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

const Task = mongoose.model("Task", taskSchema);

export default Task;