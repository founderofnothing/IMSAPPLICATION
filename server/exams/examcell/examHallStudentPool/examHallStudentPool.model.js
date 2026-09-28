import mongoose from "mongoose";

// =====================================================
// SELECTED STUDENT
// =====================================================

const selectedStudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    registerNumber: {
      type: String,
      required: true,
      trim: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// EXAM HALL STUDENT POOL
// =====================================================

const examHallStudentPoolSchema = new mongoose.Schema(
  {
    // =========================
    // INSTITUTION
    // =========================

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // =========================
    // EXAM SESSION
    // =========================

    examSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },

    // =========================
    // EXAM PAPER / SUBJECT
    // =========================

    examPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamPaper",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // =========================
    // EXAM HALL
    // =========================

    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamHall",
      required: true,
    },

    // =========================
    // PROGRAMME
    // =========================

    programmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },

    // =========================
    // BATCH
    // =========================

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // =========================
    // REGISTER NUMBER RANGE
    // =========================

    rangeFrom: {
      type: String,
      required: true,
      trim: true,
    },

    rangeTo: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // SELECTED STUDENTS
    // =========================

    students: {
      type: [selectedStudentSchema],
      default: [],
    },

    // =========================
    // STATUS
    // =========================

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =====================================================
// INDEXES
// =====================================================

examHallStudentPoolSchema.index({
  institutionId: 1,
});

examHallStudentPoolSchema.index({
  examSessionId: 1,
});

examHallStudentPoolSchema.index({
  hallId: 1,
});

examHallStudentPoolSchema.index({
  programmeId: 1,
});

examHallStudentPoolSchema.index({
  batchId: 1,
});

examHallStudentPoolSchema.index({
  subjectId: 1,
});

// =====================================================
// ONE POOL PER EXAM + HALL + PROGRAMME + BATCH + SUBJECT
// =====================================================

examHallStudentPoolSchema.index(
  {
    examSessionId: 1,
    hallId: 1,
    programmeId: 1,
    batchId: 1,
    subjectId: 1,
  },
  {
    unique: true,
  }
);

const ExamHallStudentPool = mongoose.model(
  "ExamHallStudentPool",
  examHallStudentPoolSchema
);

export default ExamHallStudentPool;