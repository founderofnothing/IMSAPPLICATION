import mongoose from "mongoose";

const idCardTemplateSchema = new mongoose.Schema(
  {
    // =========================
    // TEMPLATE INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // TEMPLATE STATUS
    // =========================

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    // =========================
    // FABRIC.JS DESIGN
    // =========================

    design: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // =========================
    // TEMPLATE PREVIEW
    // =========================

    thumbnail: {
      type: String,
      default: null,
    },

    // =========================
    // VERSION
    // =========================

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    // =========================
    // CREATOR
    // =========================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =========================
// INDEXES
// =========================

idCardTemplateSchema.index({
  status: 1,
  updatedAt: -1,
});

idCardTemplateSchema.index({
  createdBy: 1,
});

export default mongoose.model(
  "IDCardTemplate",
  idCardTemplateSchema
);