import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    stopName: {
      type: String,
      required: true,
      trim: true,
    },

    arrivalTime: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const busRouteSchema = new mongoose.Schema(
  {
    // Basic Information
    routeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    routeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Assigned Bus
assignedBuses: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
  },
],

    // Route Stops
    stops: [stopSchema],

    // Route Details
    totalDistance: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedTravelTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Route Status
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
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
busRouteSchema.index({
  assignedBuses: 1,
});

busRouteSchema.index({
  status: 1,
});

busRouteSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "BusRoute",
  busRouteSchema
);