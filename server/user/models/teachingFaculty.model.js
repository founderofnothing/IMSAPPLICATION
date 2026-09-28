import mongoose from "mongoose";

const academicQualificationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    university: {
      type: String,
      required: true,
      trim: true,
    },

    yearOfPassing: {
      type: Number,
      required: true,
    },

    percentageOrCGPA: {
      type: String,
      required: true,
      trim: true,
    },

    classDivision: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const teachingExperienceSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      default: null,
    },

    totalYears: {
      type: Number,
      default: 0,
    },

    level: {
      type: String,
      enum: ["UG", "PG", "Both"],
      default: "UG",
    },
  },
  { _id: false }
);

const publicationSchema = new mongoose.Schema(
  {
    paperTitle: String,

    journalName: String,

    issn: String,

    volume: String,

    issue: String,

    year: Number,

    authorType: {
      type: String,
      enum: ["first_author", "corresponding_author"],
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: String,

    fundingAgency: String,

    amount: Number,

    duration: String,

    role: String,
  },
  { _id: false }
);

const referenceSchema = new mongoose.Schema(
  {
    name: String,

    designation: String,

    institution: String,

    email: String,

    mobile: String,
  },
  { _id: false }
);

const teachingFacultySchema = new mongoose.Schema(
  {
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
        "principal",
        "hod",
        "professor",
        "associate_professor",
        "assistant_professor",
        "lecturer",
      ],
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    fatherOrSpouseName: {
      type: String,
      trim: true,
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },

    nationality: String,

    religion: String,

    community: String,

    category: {
      type: String,
      enum: ["GEN", "SC", "ST", "OBC", "OTHERS"],
    },

    aadhaarNumber: String,

    panNumber: String,

    bloodGroup: String,

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

    academicQualifications: [academicQualificationSchema],

    phd: {
      thesisTitle: String,
      university: String,
      awardDate: Date,
    },

    teachingExperience: [teachingExperienceSchema],

    totalTeachingExperience: {
      years: {
        type: Number,
        default: 0,
      },

      months: {
        type: Number,
        default: 0,
      },
    },

    totalResearchExperience: {
      years: {
        type: Number,
        default: 0,
      },

      months: {
        type: Number,
        default: 0,
      },
    },

    publications: [publicationSchema],

    publicationSummary: {
      totalPublications: {
        type: Number,
        default: 0,
      },

      hIndex: {
        type: Number,
        default: 0,
      },

      totalCitations: {
        type: Number,
        default: 0,
      },
    },

    books: [
      {
        title: String,
        publisher: String,
        year: Number,
      },
    ],

    conferences: [
      {
        paperTitle: String,
        conferenceName: String,
        year: Number,
      },
    ],

    projects: [projectSchema],

    patents: [
      {
        title: String,
        patentNumber: String,
        status: {
          type: String,
          enum: ["filed", "granted"],
        },
      },
    ],

    consultancy: {
      type: String,
      default: null,
    },

    academicAchievements: [String],

    professionalMemberships: [String],

    additionalResponsibilities: [String],

    subjectsTaught: [String],

    researchAreas: [String],

    technicalSkills: [String],

    languagesKnown: [String],

    references: [referenceSchema],

    declarationAccepted: {
      type: Boolean,
      default: false,
    },

    documents: {
      passportPhoto: String,

      degreeCertificates: [String],

      experienceCertificates: [String],

      publicationDocuments: [String],

      communityCertificate: String,

      phdCertificate: String,

      resume: String,

      otherDocuments: [String],
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
  "TeachingFaculty",
  teachingFacultySchema
);