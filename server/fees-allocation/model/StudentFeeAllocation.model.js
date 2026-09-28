import mongoose from "mongoose";

const studentFeeAllocationSchema =
  new mongoose.Schema(
    {
      academicYear: {
        type: String,
        required: true,
        trim: true,
      },

      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      feeStructureId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
        required: true,
      },

      institutionId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      departmentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },

classId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Class",
  default: null,
},

    feeItems: [
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
],

      totalAmount: {
        type: Number,
        required: true,
      },

      paidAmount: {
        type: Number,
        default: 0,
      },

      pendingAmount: {
        type: Number,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Partially Paid",
          "Paid",
        ],
        default: "Pending",
      },

      assignedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

studentFeeAllocationSchema.index(
  {
    studentId: 1,
    feeStructureId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "StudentFeeAllocation",
  studentFeeAllocationSchema
);