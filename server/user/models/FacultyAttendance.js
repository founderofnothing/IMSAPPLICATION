import mongoose from "mongoose";

const facultyAttendanceSchema = new mongoose.Schema(
  {
    // ============================================
    // FACULTY
    // ============================================

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeachingFaculty",
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    // ============================================
    // INSTITUTION
    // ============================================

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ============================================
    // DEPARTMENT
    // ============================================

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // ============================================
    // ATTENDANCE DATE
    // ============================================

    date: {
      type: Date,
      required: true,
    },

    // ============================================
    // ATTENDANCE STATUS
    // ============================================

    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },

    // ============================================
    // SOURCE
    // ============================================

    source: {
      type: String,
      enum: ["manual", "excel_upload"],
      default: "manual",
    },

    // ============================================
    // SOFT DELETE
    // ============================================

    isDeleted: {
      type: Boolean,
      default: false,
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

// ============================================
// PREVENT DUPLICATE ATTENDANCE
// ============================================
//
// One faculty can have only one attendance
// record for a particular date.
//

facultyAttendanceSchema.index(
  {
    faculty: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "FacultyAttendance",
  facultyAttendanceSchema
);