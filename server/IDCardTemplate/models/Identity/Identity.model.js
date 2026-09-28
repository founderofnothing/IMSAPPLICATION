import mongoose from "mongoose";

const identitySchema = new mongoose.Schema(
  {
    // ==========================================================
    // UNIQUE IDENTITY TOKEN
    // ==========================================================

    identityToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },


    // ==========================================================
    // PERSON TYPE
    // ==========================================================

    personType: {
      type: String,
      required: true,
      enum: [
        "student",
        "teaching_faculty",
        "non_teaching_faculty",
      ],
      index: true,
    },


    // ==========================================================
    // PERSON REFERENCE
    // ==========================================================

    personId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },


    // ==========================================================
    // INSTITUTION
    // ==========================================================

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },


    // ==========================================================
    // IDENTITY STATUS
    // ==========================================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
      index: true,
    },


    // ==========================================================
    // OPTIONAL REVOCATION INFORMATION
    // ==========================================================

    revokedAt: {
      type: Date,
      default: null,
    },

    revokeReason: {
      type: String,
      trim: true,
      default: null,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);


// ============================================================
// COMPOUND INDEX
// ============================================================

identitySchema.index({
  institutionId: 1,
  personType: 1,
  personId: 1,
});


// ============================================================
// MODEL
// ============================================================

export default mongoose.model(
  "Identity",
  identitySchema
);