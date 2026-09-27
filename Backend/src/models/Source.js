import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    source_title: {
      type: String,
      required: true,
      trim: true,
    },

    source_url: {
      type: String,
      required: true,
      trim: true,
    },

    authority: {
      type: String,
      default: "",
      trim: true,
    },

    source_type: {
      type: String,
      default: "official_government",
      trim: true,
    },

    last_verified: {
      type: String,
      default: "",
      trim: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    needs_review: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Source = mongoose.model("Source", sourceSchema);

export default Source;