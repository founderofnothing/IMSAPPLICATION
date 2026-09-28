import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    programmes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Programme",
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


departmentSchema.index({
  departmentName: 1,
});

departmentSchema.index({
  isDeleted: 1,
});
departmentSchema.index({
  institution: 1,
  departmentName: 1,
});
export default mongoose.model(
  "Department",
  departmentSchema
);