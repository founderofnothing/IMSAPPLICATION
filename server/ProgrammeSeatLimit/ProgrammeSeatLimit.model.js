import mongoose from "mongoose";

const programmeSeatLimitSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    programmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
      index: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    seatLimit: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Seat limit must be a whole number",
      },
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

// Prevent duplicate seat-limit configuration
// for the same programme + batch
programmeSeatLimitSchema.index(
  {
    programmeId: 1,
    batchId: 1,
  },
  {
    unique: true,
  }
);

programmeSeatLimitSchema.index({
  institutionId: 1,
});

programmeSeatLimitSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "ProgrammeSeatLimit",
  programmeSeatLimitSchema
);