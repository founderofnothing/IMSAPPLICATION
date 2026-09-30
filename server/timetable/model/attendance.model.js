import mongoose from "mongoose";

// =====================================================
// STUDENT ATTENDANCE
// =====================================================

const studentAttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PRESENT",
        "ABSENT",
        "OD",
        "MEDICAL_LEAVE",
      ],
      required: true,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// ATTENDANCE SCHEMA
// =====================================================

const attendanceSchema = new mongoose.Schema(
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
    },

    // ===================================================
    // ACADEMIC INFORMATION
    // ===================================================

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // ===================================================
    // TIMETABLE REFERENCES
    // ===================================================

    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },

    timetableAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableAssignment",
      required: true,
    },

    // ===================================================
    // ATTENDANCE SLOT
    // ===================================================

    date: {
      type: Date,
      required: true,
    },

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
    // ATTENDANCE TYPE
    // ===================================================

    attendanceType: {
      type: String,
      enum: [
        "FULL_DAY",
        "MORNING",
        "AFTERNOON",
        "HOUR_BASED",
      ],
      required: true,
    },

    // ===================================================
    // WHO MARKED ATTENDANCE
    // ===================================================

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===================================================
    // STUDENT ATTENDANCE
    // ===================================================

    students: {
      type: [studentAttendanceSchema],
      default: [],
    },

    // ===================================================
    // SUBMISSION
    // ===================================================

    submittedAt: {
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

attendanceSchema.index({
  institutionId: 1,
});

attendanceSchema.index({
  departmentId: 1,
});

attendanceSchema.index({
  classId: 1,
});

attendanceSchema.index({
  subjectId: 1,
});

attendanceSchema.index({
  date: 1,
});

attendanceSchema.index({
  markedBy: 1,
});

attendanceSchema.index({
  timetableAssignmentId: 1,
});

// =====================================================
// PREVENT DUPLICATE ATTENDANCE
// FOR SAME ASSIGNMENT + DATE + ATTENDANCE TYPE
// =====================================================

attendanceSchema.index(
  {
    timetableAssignmentId: 1,
    date: 1,
    attendanceType: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

export default mongoose.model(
  "Attendance",
  attendanceSchema
);