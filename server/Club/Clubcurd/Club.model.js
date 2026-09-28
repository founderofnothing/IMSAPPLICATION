import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    // =========================
    // CLUB INFORMATION
    // =========================

    clubName: {
      type: String,
      required: true,
      trim: true,
    },

    shortTag: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

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
    // CLUB INCHARGE
    // =========================

    inchargeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Club", clubSchema);