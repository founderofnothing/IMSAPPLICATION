import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    passportPhoto: {
      type: String,
      default: null,
    },

    degreeCertificates: [
      {
        type: String,
      },
    ],

    experienceCertificates: [
      {
        type: String,
      },
    ],

    communityCertificate: {
      type: String,
      default: null,
    },

    resume: {
      type: String,
      default: null,
    },

    otherDocuments: [
      {
        type: String,
      },
    ],
  },
  {
    _id: false,
  }
);

const nonTeachingFacultySchema = new mongoose.Schema(
  {
    // Link to User Collection
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    designation: {
      type: String,
      enum: [
        "admin",
        "hr",
        "accountant",
        "cashier",
        "lab_incharge",
        "office_assistant",
        "librarian",
        "admission_officer",
        "examcell",
      ],
      required: true,
    },

    // Optional
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    fatherOrSpouseName: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },

    nationality: {
      type: String,
    },

    religion: {
      type: String,
    },

    community: {
      type: String,
    },

    category: {
      type: String,
      enum: ["GEN", "SC", "ST", "OBC", "OTHERS"],
    },

    aadhaarNumber: {
      type: String,
    },

    panNumber: {
      type: String,
    },

    bloodGroup: {
      type: String,
    },

    communicationAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },

    permanentAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },

    differentlyAbled: {
      type: Boolean,
      default: false,
    },

    disabilityPercentage: {
      type: Number,
      default: 0,
    },

    emergencyContact: {
      name: String,
      phone: String,
    },

    qualification: {
      type: String,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    dateOfJoining: {
      type: Date,
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    previousOrganization: {
      type: String,
      trim: true,
    },

    skills: [
      {
        type: String,
      },
    ],

    languagesKnown: [
      {
        type: String,
      },
    ],

    documents: {
      type: documentSchema,
      default: () => ({}),
    },
    
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

export default mongoose.model(
  "NonTeachingFaculty",
  nonTeachingFacultySchema
);