import mongoose from "mongoose";

const internalMarkSchema = new mongoose.Schema(
  {
    // ======================================================
    // ORGANIZATION
    // ======================================================

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
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // ======================================================
    // ACADEMIC / EXAM
    // ======================================================

    examTitleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamTitle",
      required: true,
    },

    studyYear: {
      type: Number,
      required: true,
      min: 1,
    },

    semesterNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // ======================================================
    // MARK DETAILS
    // ======================================================

    marks: {
      type: [
        {
          _id: false,

          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
          },

          subjects: {
            type: [
              {
                _id: false,

                subjectId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Subject",
                  required: true,
                },

                mark: {
                  type: Number,
                  min: 0,
                  default: null,
                },

                status: {
                  type: String,
                  enum: [
                    "PRESENT",
                    "ABSENT",
                    "NOT_ENTERED",
                  ],
                  default: "NOT_ENTERED",
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },

    // ======================================================
    // STATUS
    // ======================================================

    status: {
      type: String,
      enum: [
        "DRAFT",
        "COMPLETED",
      ],
      default: "DRAFT",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // ======================================================
    // AUDIT
    // ======================================================

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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


// ======================================================
// INDEXES
// ======================================================

internalMarkSchema.index({
  institutionId: 1,
});

internalMarkSchema.index({
  departmentId: 1,
});

internalMarkSchema.index({
  programmeId: 1,
});

internalMarkSchema.index({
  classId: 1,
});

internalMarkSchema.index({
  batchId: 1,
});

internalMarkSchema.index({
  examTitleId: 1,
});

internalMarkSchema.index({
  semesterNumber: 1,
});

internalMarkSchema.index({
  isDeleted: 1,
});


// ======================================================
// ONE MARK SHEET PER
// CLASS + EXAM TITLE
// ======================================================

internalMarkSchema.index(
  {
    classId: 1,
    examTitleId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);


export default mongoose.model(
  "InternalMark",
  internalMarkSchema
);