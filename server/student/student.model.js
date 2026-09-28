import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
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

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    batchId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Batch",
  default: null,
},

    // Identification
    applicationNumber: {
         type: String,
    unique: true,
    sparse: true,
    default: null,
    },
    academicYear: {
  type: String,
  trim: true,
},

studentType: {
  type: String,
  enum: ["UG", "PG"],
  default: "UG",
},

    registerNumber: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true,
    },

studentName: {
  type: String,
  required: true,
  trim: true,
},

// Student Profile Photo
profilePhoto: {
  type: String,
  trim: true,
  default: null,
},

dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
  type: Number,
  min: 0,
},

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

  bloodGroup: {
  type: String,

  enum: [
    // Standard ABO
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",

    // A subgroups
    "A1+",
    "A1-",
    "A2+",
    "A2-",

    // AB subgroups
    "A1B+",
    "A1B-",
    "A2B+",
    "A2B-",
  ],

  trim: true,

  default: null,
},

    religion: {
      type: String,
      enum: ["Hindu", "Muslim", "Christian", "Other"],
      required: true,
    },

    communityCategory: {
      type: String,
      enum: [
        "OC",
        "BC",
        "MBC",
        "BCM",
        "DNC",
        "SC",
        "SCA",
        "ST",
        "Other",
      ],
      required: true,
    },

    subCaste: {
      type: String,
      trim: true,
    },
    nativePlace: {
  type: String,
  trim: true,
},

motherTongue: {
  type: String,
  trim: true,
},

    // Parent Details
    fatherGuardianName: {
      type: String,
      required: true,
      trim: true,
    },
    guardianRelationship: {
  type: String,
  trim: true,
},

    motherName: {
      type: String,
      trim: true,
    },

    fatherOccupation: {
      type: String,
      trim: true,
    },

    motherOccupation: {
      type: String,
      trim: true,
    },

    annualIncome: {
      type: Number,
      default: 0,
    },

    // Government IDs
    aadharNumber: {
      type: String,
      trim: true,
    },

    emisNumber: {
      type: String,
      trim: true,
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

    // Contact Details
    studentMobile: {
      type: String,
      trim: true,
    },

studentEmail: {
  type: String,
  trim: true,
  lowercase: true,
  unique: true,
  sparse: true,
  default: null,
},

    parentMobile: {
      type: String,
      trim: true,
    },

    // HSC Details
    hscExamMonth: {
      type: String,
    },

    hscExamYear: {
      type: Number,
    },

    hscSchoolName: {
      type: String,
      trim: true,
    },

    lastSchoolPlace: {
      type: String,
      trim: true,
    },

    mediumOfInstruction: {
      type: String,
      enum: ["Tamil", "English", "Other"],
    },

    // HSC Marks
    hscMarks: [
      {
        subjectName: String,
        mark: Number,
      },
    ],

    hscTotalMark: {
      type: Number,
      default: 0,
    },

    // PG Qualification

previousCollegeName: {
  type: String,
  trim: true,
},

qualifyingDegree: {
  type: String,
  trim: true,
},

degreePassingMonth: {
  type: String,
},

degreePassingYear: {
  type: Number,
},

semesterType: {
  type: String,
  enum: ["Semester", "Annual"],
},

// PG Subjects

major: {
  type: String,
  trim: true,
},

nonMajor: {
  type: String,
  trim: true,
},

degreeMarks: {
  type: [
    {
      subjectName: {
        type: String,
        trim: true,
      },

      maximumMark: {
        type: Number,
        default: 0,
      },

      obtainedMark: {
        type: Number,
        default: 0,
      },

      percentage: {
        type: Number,
        default: 0,
      },

      classObtained: {
        type: String,
        trim: true,
      },
    },
  ],

  default: [],
},

degreeTotalMark: {
  type: Number,
  default: 0,
},

    // Facilities
    hostelRequired: {
      type: Boolean,
      default: false,
    },

    transportRequired: {
      type: Boolean,
      default: false,
    },
    scholarshipHolder: {
  type: Boolean,
  default: false,
},

specialCategory: {
  type: [
    {
      type: String,

      enum: [
        "Sports",
        "NSS",
        "NCC",
        "YRC",
        "RRC",
        "Other",
      ],
    },
  ],

  default: [],
},

    // Admission Status
    admissionStatus: {
      type: String,
      enum: [
        "Applied",
        "Selected",
        "Admitted",
        "Discontinued",
      ],
      default: "Applied",
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

// Useful indexes
studentSchema.index({ institutionId: 1 });
studentSchema.index({ departmentId: 1 });
studentSchema.index({ programmeId: 1 });
studentSchema.index({ classId: 1 });
studentSchema.index({ batchId: 1 });
studentSchema.index({ studentType: 1 });
export default mongoose.model("Student", studentSchema);