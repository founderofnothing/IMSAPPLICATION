import mongoose from "mongoose";

// ==================== PERIOD SCHEMA ====================

const periodSchema = new mongoose.Schema(
  {
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    _id: false,
  }
);

// ==================== DAY ORDER SCHEMA ====================

const dayOrderSchema =
  new mongoose.Schema(
    {
      dayOrder: {
        type: Number,
        required: true,
        min: 1,
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

// ==================== PERIOD CONFIGURATION ====================

const periodConfigurationSchema =
  new mongoose.Schema(
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

// ==================== TIMETABLE SCHEMA ====================

const timetableSchema =
  new mongoose.Schema(
    {
      // ==================== ORGANIZATION ====================

      institutionId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      departmentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },

      classId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
        unique: true,
      },

      currentSemester: {
        type: Number,
        required: true,
        min: 1,
      },

      // ==================== PERIOD CONFIGURATION ====================

      periodConfiguration: {
        type: [
          periodConfigurationSchema,
        ],
        default: [],
      },

      // ==================== TIMETABLE ====================

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

// ==================== FILTER INDEXES ====================

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

export default mongoose.model(
  "Timetable",
  timetableSchema
);