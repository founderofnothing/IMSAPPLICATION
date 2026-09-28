import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    // Academic References

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

    // Basic Details

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },
 
    gender: {
      type: String,
      enum: [
        "Male",
        "Female",
        "Other",
      ],
      required: true,
    },

    // Contact Details

    studentMobile: {
      type: String,
      required: true,
      trim: true,
    },

    studentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    parentName: {
      type: String,
      required: true,
      trim: true,
    },

    parentMobile: {
      type: String,
      trim: true,
    },

    // Address

    address: {
      type: String,
      trim: true,
    },

    // Enquiry Details

    enquirySource: {
      type: String,
      enum: [
        "Walk-In",
        "Phone",
        "Website",
        "Social Media",
        "Reference",
        "Other",
      ],
      default: "Walk-In",
    },

    status: {
      type: String,
      enum: [
        "New",
        "Interested",
        "Follow Up",
        "Converted",
        "Rejected",
      ],
      default: "New",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
    },

    // Conversion Tracking

    convertedAt: {
      type: Date,
      default: null,
    },

    convertedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // Audit Fields

createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},

updatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
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

// Indexes

enquirySchema.index({
  institutionId: 1,
});

enquirySchema.index({
  departmentId: 1,
});

enquirySchema.index({
  programmeId: 1,
});

enquirySchema.index({
  status: 1,
});

enquirySchema.index({
  studentMobile: 1,
});

enquirySchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "Enquiry",
  enquirySchema
);