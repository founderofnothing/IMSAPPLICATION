import mongoose from "mongoose";

const busDriverSchema =
  new mongoose.Schema(
    {
      // Basic Information
      employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      driverName: {
        type: String,
        required: true,
        trim: true,
      },

      profileImage: {
        type: String,
        default: null,
      },

      // Contact Information
      mobileNumber: {
        type: String,
        required: true,
        trim: true,
      },

      alternateMobileNumber: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        sparse: true,
      },

      // Personal Information
      dateOfBirth: {
        type: Date,
      },

      gender: {
        type: String,
        enum: [
          "Male",
          "Female",
          "Other",
        ],
      },

      bloodGroup: {
        type: String,
        enum: [
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
        ],
      },

      // Communication Address
      communicationAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
      },

      // Permanent Address
      permanentAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
      },

      // Driving Licence
      licenceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      licenceIssueDate: {
        type: Date,
      },

      licenceExpiryDate: {
        type: Date,
      },

      licenceType: {
        type: String,
        enum: [
          "LMV",
          "HMV",
          "Transport",
          "Heavy Vehicle",
        ],
      },

      // Employment
      joiningDate: {
        type: Date,
      },

      experienceInYears: {
        type: Number,
        default: 0,
        min: 0,
      },

      salary: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Emergency Contact
      emergencyContactName: {
        type: String,
        trim: true,
      },

      emergencyContactNumber: {
        type: String,
        trim: true,
      },

      // Status
      status: {
        type: String,
        enum: [
          "Active",
          "Inactive",
          "On Leave",
          "Resigned",
        ],
        default: "Active",
      },

      // Remarks
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
busDriverSchema.index({
  mobileNumber: 1,
});

busDriverSchema.index({
  status: 1,
});

busDriverSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "BusDriver",
  busDriverSchema
);