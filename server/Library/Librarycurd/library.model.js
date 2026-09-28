import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    // =========================
    // INSTITUTION
    // =========================
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    // =========================
    // LIBRARY INFORMATION
    // =========================
    libraryName: {
      type: String,
      required: true,
      trim: true,
    },

    libraryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    about: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // =========================
    // SOFT DELETE
    // =========================
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // AUDIT
    // =========================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One active library code per institution.
// Deleted libraries don't block reuse of the code.
librarySchema.index(
  { institutionId: 1, libraryCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

const Library = mongoose.model("Library", librarySchema);

export default Library;