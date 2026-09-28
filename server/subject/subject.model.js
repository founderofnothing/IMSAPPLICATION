import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    // ==================== ORGANIZATION ====================

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

    // ==================== ACADEMIC STRUCTURE ====================

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

    // ==================== SUBJECT DETAILS ====================

    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    subjectCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    subjectScore: {
      type: Number,
      required: true,
      min: 0,
    },

    subjectType: {
      type: String,
      required: true,
      enum: [
        "Major",
        "Non-Major",
      ],
    },

    // ==================== STATUS ====================

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

    // ==================== AUDIT ====================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==================== FILTER INDEXES ====================

subjectSchema.index({
  institutionId: 1,
});

subjectSchema.index({
  departmentId: 1,
});

subjectSchema.index({
  programmeId: 1,
});

subjectSchema.index({
  studyYear: 1,
});

subjectSchema.index({
  semesterNumber: 1,
});

subjectSchema.index({
  isActive: 1,
});

subjectSchema.index({
  isDeleted: 1,
});

// ==================== UNIQUE SUBJECT NAME ====================

subjectSchema.index(
  {
    programmeId: 1,
    studyYear: 1,
    semesterNumber: 1,
    subjectName: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

// ==================== UNIQUE SUBJECT CODE ====================

subjectSchema.index(
  {
    programmeId: 1,
    studyYear: 1,
    semesterNumber: 1,
    subjectCode: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

export default mongoose.model(
  "Subject",
  subjectSchema
);