import mongoose from "mongoose";

const classSchema =
  new mongoose.Schema(
    {
      institution: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      department: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },

      programme: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Programme",
        required: true,
      },

      batchId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },

     section: {
  type: String,
  uppercase: true,
  trim: true,
  default: null,
},

      classIncharge: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      // Class Status

isActive: {
  type: Boolean,
  default: true,
},

      subjects: {
        type: [
          {
            type:
              mongoose.Schema.Types.ObjectId,
            ref: "Subject",
          },
        ],
        default: [],
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

// Helpful Indexes

classSchema.index({
  institution: 1,
});

classSchema.index({
  department: 1,
});

classSchema.index({
  programme: 1,
});

classSchema.index({
  batchId: 1,
});

classSchema.index({
  section: 1,
});

classSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "Class",
  classSchema
);