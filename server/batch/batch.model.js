import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },


    batchName: {
      type: String,
      required: true,
      trim: true,
    },

    admissionYear: {
      type: Number,
      required: true,
    },

    graduationYear: {
      type: Number,
      required: true,
    },

    currentYear: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },

    remarks: {
      type: String,
      trim: true,
    },

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

// batchSchema.index({
//   institutionId: 1,
// });



batchSchema.index({
  status: 1,
});

batchSchema.index({
  isDeleted: 1,
});

// Prevent duplicate batch names within the same institution

batchSchema.index(
  {
    institutionId: 1,
    batchName: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "Batch",
  batchSchema
);