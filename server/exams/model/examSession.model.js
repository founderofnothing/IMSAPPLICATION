import mongoose from "mongoose";

const examSessionSchema =
  new mongoose.Schema(
    {
      examTitleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamTitle",
        required: true,
      },

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

      published: {
        type: Boolean,
        default: false,
      },

      publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      publishedAt: {
        type: Date,
        default: null,
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

examSessionSchema.index(
  {
    classId: 1,
    examTitleId: 1,
  },
  {
    unique: true,
  }
);

examSessionSchema.index({
  institutionId: 1,
});

examSessionSchema.index({
  departmentId: 1,
});

examSessionSchema.index({
  classId: 1,
});

examSessionSchema.index({
  published: 1,
});

examSessionSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "ExamSession",
  examSessionSchema
);