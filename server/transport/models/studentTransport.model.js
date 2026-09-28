import mongoose from "mongoose";

const studentTransportSchema =
  new mongoose.Schema(
    {
      // Institution Reference
      institutionId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      // Department Reference
      departmentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },

      // Class Reference
      classId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
      },

      // Student Reference
      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        unique: true,
      },

      // Assigned Bus
      busId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true,
      },

      // Assigned Route
      routeId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "BusRoute",
        required: true,
      },

      // Pickup Stop
      pickupStop: {
        type: String,
        required: true,
        trim: true,
      },

      // Drop Stop
      dropStop: {
        type: String,
        required: true,
        trim: true,
      },

      // Annual Transport Fee
      transportFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Fee Status
      feeStatus: {
        type: String,
        enum: [
          "Pending",
          "Partially Paid",
          "Paid",
        ],
        default: "Pending",
      },

      // Assignment Date
      assignedDate: {
        type: Date,
        default: Date.now,
      },

      // Transport Status
      status: {
        type: String,
        enum: [
          "Active",
          "Inactive",
          "Cancelled",
        ],
        default: "Active",
      },

      // Additional Notes
      remarks: {
        type: String,
        trim: true,
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

studentTransportSchema.index({
  busId: 1,
});

studentTransportSchema.index({
  routeId: 1,
});

studentTransportSchema.index({
  status: 1,
});

studentTransportSchema.index({
  feeStatus: 1,
});

studentTransportSchema.index({
  isDeleted: 1,
});

studentTransportSchema.index({
  institutionId: 1,
});

studentTransportSchema.index({
  departmentId: 1,
});

studentTransportSchema.index({
  classId: 1,
});

// Compound Index for Principal/HOD Queries
studentTransportSchema.index({
  institutionId: 1,
  departmentId: 1,
  classId: 1,
});

export default mongoose.model(
  "StudentTransport",
  studentTransportSchema
);