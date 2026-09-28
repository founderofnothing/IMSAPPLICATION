import mongoose from "mongoose";

const examPaperSchema =
  new mongoose.Schema(
    {
      examSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamSession",
        required: true,
      },

      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },

   conductedMark: {
  type: Number,
  default: null,
  min: 0,
},

      displayOrder: {
        type: Number,
        default: 1,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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

examPaperSchema.index(
  {
    examSessionId: 1,
    subjectId: 1,
  },
  {
    unique: true,
  }
);

examPaperSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "ExamPaper",
  examPaperSchema
);