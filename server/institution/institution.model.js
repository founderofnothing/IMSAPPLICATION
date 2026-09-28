import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    // =========================
    // INSTITUTION INFORMATION
    // =========================

    institutionName: {
      type: String,
      required: true,
      trim: true,
    },

    institutionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // =========================
    // INSTITUTION ADDRESS
    // =========================

    address: {
      addressLine1: {
        type: String,
        trim: true,
        default: "",
      },

      addressLine2: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      district: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    // =========================
    // DEPARTMENTS
    // =========================

    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    // =========================
    // PRINCIPAL
    // =========================

    principal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // SOFT DELETE
    // =========================

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

// =========================
// INDEXES
// =========================

institutionSchema.index({
  isDeleted: 1,
});

export default mongoose.model("Institution", institutionSchema);