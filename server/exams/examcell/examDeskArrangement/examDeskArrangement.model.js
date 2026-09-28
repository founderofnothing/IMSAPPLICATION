import mongoose from "mongoose";

// =====================================================
// BENCH
// =====================================================

const benchSchema = new mongoose.Schema(
  {
    // =========================
    // BENCH NUMBER
    // =========================
    benchNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // =========================
    // STUDENT CAPACITY
    // =========================
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },

    // =========================
    // ORDER
    // =========================
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// COLUMN
// =====================================================

const columnSchema = new mongoose.Schema(
  {
    // =========================
    // COLUMN IDENTIFIER
    // =========================
    columnKey: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // COLUMN DISPLAY NAME
    // =========================
    columnName: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // SIDE
    // =========================
    side: {
      type: String,
      enum: ["left", "middle", "right"],
      required: true,
    },

    // =========================
    // COLUMN ORDER
    // =========================
    order: {
      type: Number,
      required: true,
      min: 1,
    },

    // =========================
    // BENCHES
    // =========================
    benches: {
      type: [benchSchema],
      default: [],
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// EXAM DESK ARRANGEMENT
// =====================================================

const examDeskArrangementSchema = new mongoose.Schema(
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
    // EXAM HALL
    // =========================
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamHall",
      required: true,
    },

    // =========================
    // NUMBER OF COLUMNS
    // =========================
    totalColumns: {
      type: Number,
      required: true,
      min: 2,
    },

    // =========================
    // COLUMNS
    // =========================
    columns: {
      type: [columnSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ONE DESK ARRANGEMENT PER HALL
// =====================================================

examDeskArrangementSchema.index(
  {
    institutionId: 1,
    hallId: 1,
  },
  {
    unique: true,
  }
);

const ExamDeskArrangement = mongoose.model(
  "ExamDeskArrangement",
  examDeskArrangementSchema
);

export default ExamDeskArrangement;