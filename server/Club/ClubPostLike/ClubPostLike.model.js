import mongoose from "mongoose";

const clubPostLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClubPost",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can like a particular post only once
clubPostLikeSchema.index(
  { postId: 1, userId: 1 },
  { unique: true }
);

export default mongoose.model("ClubPostLike", clubPostLikeSchema);