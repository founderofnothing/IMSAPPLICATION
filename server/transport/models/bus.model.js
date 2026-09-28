import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    // Basic Information
    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    busName: {
      type: String,
      required: true,
      trim: true,
    },

    // Vehicle Details
    vehicleType: {
      type: String,
      enum: [
        "Mini Bus",
        "School Bus",
        "Van",
        "College Bus",
        "Other",
      ],
      default: "College Bus",
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    model: {
      type: String,
      trim: true,
    },

    manufacturingYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },

    chassisNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    fuelType: {
      type: String,
      enum: [
        "Diesel",
        "Petrol",
        "CNG",
        "Electric",
      ],
      default: "Diesel",
    },

    // Document Expiry Dates
    insuranceExpiryDate: {
      type: Date,
    },

    fitnessCertificateExpiryDate: {
      type: Date,
    },

    permitExpiryDate: {
      type: Date,
    },

    pollutionCertificateExpiryDate: {
      type: Date,
    },

    // Assigned Driver
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusDriver",
      default: null,
    },

    // Current Status
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Maintenance",
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
  }
);

// Helpful Indexes
busSchema.index({
  driverId: 1,
});

busSchema.index({
  status: 1,
});

busSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "Bus",
  busSchema
);