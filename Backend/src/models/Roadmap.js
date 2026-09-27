import mongoose from "mongoose";

// ------------------------------------
// Roadmap Step
// ------------------------------------
const roadmapStepSchema = new mongoose.Schema(
  {
    step_id: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    office: {
      type: String,
      default: "",
    },

    required_forms: [
      {
        type: String,
      },
    ],

    required_documents: [
      {
        type: String,
      },
    ],

    fee: {
      amount: {
        type: Number,
        default: null,
      },

      currency: {
        type: String,
        default: "INR",
      },

      payment_method: [
        {
          type: String,
        },
      ],
    },

    application: {
      mode: [
        {
          type: String,
        },
      ],

      application_link: {
        type: String,
        default: null,
      },
    },

    eligibility: [
      {
        type: String,
      },
    ],

    instructions: [
      {
        type: String,
      },
    ],

    prerequisites: [
      {
        type: String,
      },
    ],

    depends_on: [
      {
        type: String,
      },
    ],

    unlocks: [
      {
        type: String,
      },
    ],

    can_run_in_parallel: {
      type: Boolean,
      default: false,
    },

    time_limit_days: {
      type: Number,
      default: null,
    },

    official_sources: [
      {
        source_title: String,
        source_url: String,
        authority: String,
        last_verified: String,
        source_type: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "LOCKED",
      ],
      default: "NOT_STARTED",
    },
  },
  {
    _id: false,
  }
);

// ------------------------------------
// Dependency Edge
// ------------------------------------
const dependencySchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// ------------------------------------
// Roadmap
// ------------------------------------
const roadmapSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    procedureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CivicProcedure",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    steps: {
      type: [roadmapStepSchema],
      default: [],
    },

    dependencies: {
      type: [dependencySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model(
  "Roadmap",
  roadmapSchema
);

export default Roadmap;