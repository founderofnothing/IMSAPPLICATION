import mongoose from "mongoose";

const feePaymentSchema =
  new mongoose.Schema(
    {
      studentFeeAllocationId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref:
          "StudentFeeAllocation",
        required: true,
      },

      receiptNumber: {
        type: String,
        required: true,
        unique: true,
      },

      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Student",
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
  required: true,
},

academicYear: {
  type: String,
  required: true,
},

amount: {
  type: Number,
  required: true,
},
paymentBreakdown: [
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
      required: true,
      min: 0,
    },

    pendingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
],

      paymentMode: {
        type: String,
        enum: [
          "Cash",
          "UPI",
          "Card",
          "Bank Transfer",
          "Cheque",
        ],
        required: true,
      },

      receivedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      remarks: {
        type: String,
        default: "",
      },

      paidAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "FeePayment",
  feePaymentSchema
);