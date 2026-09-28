import mongoose from "mongoose";

const bookDistributionSchema = new mongoose.Schema(
  {
    // =========================
    // OWNERSHIP / REFERENCE
    // =========================

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      index: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    // =========================
    // BORROWER
    // =========================

    borrowerType: {
      type: String,
      enum: ["Student", "Faculty"],
      required: true,
      index: true,
    },

    // =========================
    // STUDENT
    // =========================

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
      index: true,
    },

    // =========================
    // FACULTY
    // =========================

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // =========================
    // ISSUE / RETURN
    // =========================

    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    // Number of days the borrower
    // actually kept the book.
    // Calculated when the book is returned.
    daysTaken: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "Issued",
        "Returned",
        "Lost",
        "Damaged",
      ],
      default: "Issued",
      index: true,
    },

    // =========================
    // STAFF TRACKING
    // =========================

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // NOTES
    // =========================

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


// ============================================================
// INDEXES
// ============================================================

// Book → current / historical distribution
bookDistributionSchema.index({
  bookId: 1,
  status: 1,
});


// Student → current / historical books
bookDistributionSchema.index({
  studentId: 1,
  status: 1,
});


// Faculty → current / historical books
bookDistributionSchema.index({
  facultyId: 1,
  status: 1,
});


// Institution + library + book
bookDistributionSchema.index({
  institutionId: 1,
  libraryId: 1,
  bookId: 1,
});


// ============================================================
// MODEL
// ============================================================

const BookDistribution = mongoose.model(
  "BookDistribution",
  bookDistributionSchema
);

export default BookDistribution;