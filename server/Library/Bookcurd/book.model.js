import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    // =========================
    // OWNERSHIP
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

    // =========================
    // BOOK INFORMATION
    // =========================
    bookNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    bookName: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    publisher: {
      type: String,
      trim: true,
      default: "",
    },

    edition: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // INVENTORY
    // =========================
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    price: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
    },

    // =========================
    // MISSING INFORMATION
    // =========================
    missingFields: {
      type: [String],
      default: [],
    },

    // =========================
    // SOFT DELETE
    // =========================
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // AUDIT
    // =========================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One active book number inside a library.
bookSchema.index(
  {
    institutionId: 1,
    libraryId: 1,
    bookNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;