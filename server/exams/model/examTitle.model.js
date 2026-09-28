import mongoose from "mongoose";

const examTitleSchema =
  new mongoose.Schema(
    {
      // Institution Reference
      institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      // Exam Title
      title: {
        type: String,
        required: true,
        trim: true,
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

examTitleSchema.index(
  {
    institutionId: 1,
    title: 1,
  },
  {
    unique: true,
  }
);

examTitleSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "ExamTitle",
  examTitleSchema
);