import mongoose from "mongoose";

const studentExamMarkSchema =
  new mongoose.Schema(
    {
      examPaperId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "ExamPaper",
        required: true,
      },

      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      obtainedMark: {
        type: Number,
        required: true,
        min: 0,
      },

      // User who first entered the mark
      enteredBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // User who last updated the mark
      updatedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      // Soft Delete
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
      versionKey: false,
    }
  );

// Prevent duplicate mark entry
studentExamMarkSchema.index(
  {
    examPaperId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "StudentExamMark",
  studentExamMarkSchema
);