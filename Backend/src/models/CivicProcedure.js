import mongoose from "mongoose";

// ------------------------------------
// Jurisdiction
// ------------------------------------
const jurisdictionSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      default: null,
      trim: true,
    },

    district: {
      type: String,
      default: null,
      trim: true,
    },

    local_body: {
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
// Department
// ------------------------------------
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    sub_department: {
      type: String,
      default: null,
      trim: true,
    },

    designated_officer: {
      type: String,
      default: null,
      trim: true,
    },

    office_type: {
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
// Fees
// ------------------------------------
const feesSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: null,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    payment_method: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
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
// Office
// ------------------------------------
const officeSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      default: "",
      trim: true,
    },

    office_name: {
      type: String,
      default: null,
      trim: true,
    },

    office_type: {
      type: String,
      default: null,
      trim: true,
    },

    location_rule: {
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
// Application
// ------------------------------------
const applicationSchema = new mongoose.Schema(
  {
    mode: [
      {
        type: String,
        trim: true,
      },
    ],

    application_link: {
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
// Official Source
// ------------------------------------
const officialSourceSchema = new mongoose.Schema(
  {
    source_title: {
      type: String,
      default: "",
      trim: true,
    },

    source_url: {
      type: String,
      default: "",
      trim: true,
    },

    authority: {
      type: String,
      default: "",
      trim: true,
    },

    last_verified: {
      type: String,
      default: "",
      trim: true,
    },

    source_type: {
      type: String,
      default: "official_government",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ------------------------------------
// Step
// ------------------------------------
const stepSchema = new mongoose.Schema(
  {
    step_id: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    required_forms: [
      {
        type: String,
        trim: true,
      },
    ],

    required_documents: [
      {
        type: String,
        trim: true,
      },
    ],

    fees: {
      type: feesSchema,
      default: () => ({}),
    },

    office: {
      type: officeSchema,
      default: () => ({}),
    },

    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],

    depends_on: [
      {
        type: String,
        trim: true,
      },
    ],

    unlocks: [
      {
        type: String,
        trim: true,
      },
    ],

    can_run_in_parallel: {
      type: Boolean,
      default: false,
    },

    application: {
      type: applicationSchema,
      default: () => ({}),
    },

    time_limit_days: {
      type: Number,
      default: null,
    },

    official_sources: {
      type: [officialSourceSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

// ------------------------------------
// Source Freshness
// ------------------------------------
const sourceFreshnessSchema = new mongoose.Schema(
  {
    last_verified: {
      type: String,
      default: "",
      trim: true,
    },

    needs_review: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

// ------------------------------------
// Civic Procedure
// ------------------------------------
const civicProcedureSchema = new mongoose.Schema(
  {
    task_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    task_name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    jurisdiction: {
      type: jurisdictionSchema,
      default: () => ({}),
    },

    user_context_required: [
      {
        type: String,
        trim: true,
      },
    ],

    department: {
      type: departmentSchema,
      default: () => ({}),
    },

    eligibility: [
      {
        type: String,
        trim: true,
      },
    ],

    steps: {
      type: [stepSchema],
      default: [],
    },

    status_options: {
      type: [String],
      default: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "LOCKED",
      ],
    },

    source_freshness: {
      type: sourceFreshnessSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const CivicProcedure = mongoose.model(
  "CivicProcedure",
  civicProcedureSchema
);

export default CivicProcedure;