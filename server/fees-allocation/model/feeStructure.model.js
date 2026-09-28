import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    // ==================== ORGANIZATION ====================

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

    programmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // ==================== ACADEMIC DETAILS ====================

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    // 1 = First Year
    // 2 = Second Year
    // 3 = Third Year
    // etc.
    year: {
      type: Number,
      required: true,
      min: 1,
    },

    // ==================== FEE DETAILS ====================

    feeItems: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==================== STATUS ====================

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // ==================== AUDIT ====================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


// ==================== UNIQUE ACTIVE FEE STRUCTURE ====================
//
// Prevent:
//
// Same Institution
// + Same Programme
// + Same Batch
// + Same Study Year
// + Same Academic Year
//
// from having two ACTIVE fee structures.
//
// Soft-deleted structures are excluded from this constraint.
//

feeStructureSchema.index(
  {
    institutionId: 1,
    programmeId: 1,
    batchId: 1,
    year: 1,
    academicYear: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      isDeleted: false,
    },
  }
);


// ==================== MODEL ====================

const FeeStructure = mongoose.model(
  "FeeStructure",
  feeStructureSchema
);

export default FeeStructure;