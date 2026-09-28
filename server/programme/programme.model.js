import mongoose from "mongoose";

const programmeSchema = new mongoose.Schema(
  {
    programmeName: {
      type: String,
      required: true,
      trim: true,
    },

    programmeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    programmeType: {
      type: String,
      required: true,
      enum: ["UG", "PG", "Diploma", "Certificate", "Other"],
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    duration: {
      type: Number,
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

programmeSchema.index({
  department: 1,
});

programmeSchema.index({
  programmeType: 1,
});

programmeSchema.index({
  isDeleted: 1,
});

export default mongoose.model("Programme", programmeSchema);