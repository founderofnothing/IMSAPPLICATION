import mongoose from "mongoose";

// ==================== STUDENT ATTENDANCE SCHEMA ====================

const studentAttendanceSchema =
  new mongoose.Schema(
    {
      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Student",

        required: true,
      },

      status: {
        type: String,

        enum: [
          "present",
          "absent",
        ],

        required: true,
      },

      remarks: {
        type: String,

        default: "",
      },

    },
    {
      _id: false,
    }
  );

// ==================== ATTENDANCE SCHEMA ====================

const attendanceSchema =
  new mongoose.Schema(
    {
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
      },

      subjectId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Subject",

        required: true,
      },

      facultyId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      attendanceDate: {
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

      students: {
        type: [
          studentAttendanceSchema
        ],

        default: [],
      },

      modifiedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      modifiedAt: {
        type: Date,

        default: null,
      },

    },
    {
      timestamps: true,
    }
  );

// ==================== PREVENT DUPLICATE ATTENDANCE ====================

attendanceSchema.index(
  {
    classId: 1,

    attendanceDate: 1,

    dayOrder: 1,

    periodNumber: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "Attendance",
  attendanceSchema
);