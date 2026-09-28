import mongoose from "mongoose";

const timetableSessionSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const timetableDateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    sessions: {
      type: [timetableSessionSchema],
      required: true,
      validate: {
        validator: function (sessions) {
          return sessions.length > 0;
        },
        message: "At least one session is required for a date.",
      },
    },
  },
  {
    _id: true,
  }
);

const timetableScheduleSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    dateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    _id: true,
  }
);

const masterTimetableSchema = new mongoose.Schema(
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
    // EXAM TITLE
    // =========================

    examTitleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamTitle",
      required: true,
    },

    // =========================
    // SEMESTER INFORMATION
    // =========================

    semesterType: {
      type: String,
      enum: ["Odd", "Even"],
      required: true,
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // EXAM DATES & SESSIONS
    // =========================

    dates: {
      type: [timetableDateSchema],
      default: [],
    },

    // =========================
    // CLASS / SUBJECT
    // ASSIGNMENTS
    // =========================

    schedules: {
      type: [timetableScheduleSchema],
      default: [],
    },

    // =========================
    // SOFT DELETE
    // =========================

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

// =========================
// INDEXES
// =========================

masterTimetableSchema.index({
  institutionId: 1,
  examTitleId: 1,
  isDeleted: 1,
});

masterTimetableSchema.index({
  institutionId: 1,
  academicYear: 1,
  semesterType: 1,
});

export default mongoose.model(
  "MasterTimetable",
  masterTimetableSchema
);