import mongoose from "mongoose";

const clubPostSchema = new mongoose.Schema(
  {
    // =========================
    // CLUB
    // =========================

    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },

    // =========================
    // POST AUTHOR
    // =========================

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // POST CONTENT
    // =========================

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // MULTIPLE IMAGES
    // =========================

    images: [
      {
        type: String,
        trim: true,
      },
    ],

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
  },
  {
    timestamps: true,
  }
);

// =========================
// CLUB POST QUERY INDEX
// =========================

clubPostSchema.index({
  clubId: 1,
  isDeleted: 1,
});

export default mongoose.model(
  "ClubPost",
  clubPostSchema
);