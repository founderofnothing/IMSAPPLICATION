import mongoose from "mongoose";

// =====================================================
// TIMETABLE ASSIGNMENT SCHEMA
// =====================================================

const timetableAssignmentSchema = new mongoose.Schema(
  {
    // ===================================================
    // MASTER TIMETABLE REFERENCE
    // ===================================================

    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },

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
    },

    // ===================================================
    // TIMETABLE SLOT
    // ===================================================

    dayOrder: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    periodNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // ===================================================
    // FACULTY
    // ===================================================

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===================================================
    // ATTENDANCE RESPONSIBILITY
    // ===================================================

    attendanceFacultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===================================================
    // ASSIGNMENT TYPE
    // ===================================================

    assignmentType: {
      type: String,
      enum: [
        "REGULAR",
        "COMBINED",
      ],
      default: "REGULAR",
    },

    // ===================================================
    // STATUS
    // ===================================================

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
      ],
      default: "ACTIVE",
    },

    // ===================================================
    // AUDIT
    // ===================================================

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
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

timetableAssignmentSchema.index({
  timetableId: 1,
});

timetableAssignmentSchema.index({
  institutionId: 1,
});

timetableAssignmentSchema.index({
  departmentId: 1,
});

timetableAssignmentSchema.index({
  classId: 1,
});

timetableAssignmentSchema.index({
  facultyId: 1,
});

timetableAssignmentSchema.index({
  attendanceFacultyId: 1,
});

timetableAssignmentSchema.index({
  dayOrder: 1,
  periodNumber: 1,
});

timetableAssignmentSchema.index({
  facultyId: 1,
  dayOrder: 1,
  periodNumber: 1,
});

export default mongoose.model(
  "TimetableAssignment",
  timetableAssignmentSchema
);