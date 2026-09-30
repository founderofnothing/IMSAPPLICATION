import mongoose from "mongoose";

// =====================================================
// PERIOD SCHEMA
// =====================================================

const periodSchema = new mongoose.Schema(
  {
    // ===================================================
    // PERIOD
    // ===================================================

    periodNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // ===================================================
    // SUBJECT
    // ===================================================

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // ===================================================
    // ATTENDANCE
    // ===================================================

    attendanceRequired: {
      type: Boolean,
      default: false,
    },

    attendanceType: {
      type: String,
      enum: [
        "FULL_DAY",
        "MORNING",
        "AFTERNOON",
        "HOUR_BASED",
      ],
      default: null,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// DAY ORDER SCHEMA
// =====================================================

const dayOrderSchema = new mongoose.Schema(
  {
    dayOrder: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    periods: {
      type: [periodSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// PERIOD CONFIGURATION SCHEMA
// =====================================================

const periodConfigurationSchema = new mongoose.Schema(
  {
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    periodType: {
      type: String,
      enum: [
        "Teaching",
        "Break",
        "Lunch",
      ],
      default: "Teaching",
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// MASTER TIMETABLE SCHEMA
// =====================================================

const timetableSchema = new mongoose.Schema(
  {
    // ===================================================
    // ORGANIZATION
    // ===================================================

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      unique: true,
    },

    currentSemester: {
      type: Number,
      required: true,
      min: 1,
    },

    // ===================================================
    // PERIOD CONFIGURATION
    // ===================================================

    periodConfiguration: {
      type: [periodConfigurationSchema],
      default: [],
    },

    // ===================================================
    // MASTER TIMETABLE
    // ===================================================

    timetable: {
      type: [dayOrderSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =====================================================
// INDEXES
// =====================================================

timetableSchema.index({
  institutionId: 1,
});

timetableSchema.index({
  departmentId: 1,
});

timetableSchema.index({
  classId: 1,
});

timetableSchema.index({
  currentSemester: 1,
});

// =====================================================
// EXPORT
// =====================================================

export default mongoose.model(
  "Timetable",
  timetableSchema
);