import mongoose from "mongoose";

// =====================================================
// EXAM HALL STUDENT ALLOCATION
// =====================================================
//
// One document = one student occupying one seat.
//
// Example:
//
// Model Examination
//   ↓
// LC1 → Bench 12 → Seat 1 → Student A
// LC1 → Bench 12 → Seat 2 → Student B
//
// This represents the FINAL seating allocation.
//
// ExamSession / ExamPaper are NOT involved here.
// They remain part of the marks-entry system.
//
// =====================================================

const examHallStudentAllocationSchema =
  new mongoose.Schema(
    {
      // =================================================
      // INSTITUTION
      // =================================================

      institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      // =================================================
      // EXAM TITLE
      // =================================================
      //
      // Example:
      //
      // Model Examination
      // Internal Examination
      // Semester Examination
      //
      // The seating arrangement belongs to
      // the selected exam title.
      // =================================================

      examTitleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamTitle",
        required: true,
      },

      // =================================================
      // EXAM HALL
      // =================================================

      hallId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamHall",
        required: true,
      },

      // =================================================
      // COLUMN
      // =================================================
      //
      // Examples:
      // LC1
      // LC2
      // M
      // RC2
      // RC1
      //
      // =================================================

      columnKey: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },

      columnName: {
        type: String,
        required: true,
        trim: true,
      },

      // =================================================
      // BENCH
      // =================================================

      benchNumber: {
        type: Number,
        required: true,
        min: 1,
      },

      // =================================================
      // SEAT
      // =================================================
      //
      // Maximum 3 because a bench supports
      // a maximum of 3 students.
      //
      // =================================================

      seatNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
      },

      // =================================================
      // STUDENT
      // =================================================

      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      registerNumber: {
        type: String,
        required: true,
        trim: true,
      },

      studentName: {
        type: String,
        required: true,
        trim: true,
      },

      // =================================================
      // ACADEMIC REFERENCES
      // =================================================

      programmeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Programme",
        required: true,
      },

      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },

      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },

      // =================================================
      // ASSIGNMENT MODE
      // =================================================

      assignmentMode: {
        type: String,
        enum: [
          "automatic",
          "manual",
        ],
        required: true,
      },

      // =================================================
      // ALLOCATION STATUS
      // =================================================

      status: {
        type: String,
        enum: [
          "allocated",
          "present",
          "absent",
          "removed",
        ],
        default: "allocated",
      },

      // =================================================
      // AUDIT
      // =================================================

      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      assignedAt: {
        type: Date,
        default: Date.now,
      },

      removedAt: {
        type: Date,
        default: null,
      },

      removedBy: {
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

// =====================================================
// INDEXES
// =====================================================

examHallStudentAllocationSchema.index({
  institutionId: 1,
});

examHallStudentAllocationSchema.index({
  examTitleId: 1,
});

examHallStudentAllocationSchema.index({
  hallId: 1,
});

examHallStudentAllocationSchema.index({
  studentId: 1,
});

examHallStudentAllocationSchema.index({
  programmeId: 1,
});

examHallStudentAllocationSchema.index({
  batchId: 1,
});

examHallStudentAllocationSchema.index({
  subjectId: 1,
});

// =====================================================
// PREVENT TWO STUDENTS FROM OCCUPYING
// THE SAME SEAT FOR THE SAME EXAM TITLE
// =====================================================

examHallStudentAllocationSchema.index(
  {
    examTitleId: 1,
    hallId: 1,
    columnKey: 1,
    benchNumber: 1,
    seatNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $ne: "removed",
      },
    },
  }
);

// =====================================================
// PREVENT THE SAME STUDENT FROM BEING
// ASSIGNED TWICE FOR THE SAME EXAM TITLE
// =====================================================

examHallStudentAllocationSchema.index(
  {
    examTitleId: 1,
    studentId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $ne: "removed",
      },
    },
  }
);

// =====================================================
// MODEL
// =====================================================

const ExamHallStudentAllocation =
  mongoose.model(
    "ExamHallStudentAllocation",
    examHallStudentAllocationSchema
  );

export default ExamHallStudentAllocation;