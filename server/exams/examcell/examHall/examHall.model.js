import mongoose from "mongoose";

const examHallSchema = new mongoose.Schema(
  {
    // =========================
    // INSTITUTION
    // =========================
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // =========================
    // HALL INFORMATION
    // =========================
    hallNumber: {
      type: String,
      required: true,
      trim: true,
    },

    hallName: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // DESK / BENCH INFORMATION
    // =========================
    totalBenches: {
      type: Number,
      required: true,
      min: 1,
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// UNIQUE HALL NUMBER
// WITHIN AN INSTITUTION
// =========================
examHallSchema.index(
  { institutionId: 1, hallNumber: 1 },
  { unique: true }
);

const ExamHall = mongoose.model("ExamHall", examHallSchema);

export default ExamHall;