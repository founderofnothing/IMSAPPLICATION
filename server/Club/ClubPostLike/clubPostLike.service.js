import Club from "../Clubcurd/Club.model.js";
import ClubPost from "../../Club/ClubPost/ClubPost.model.js";
import ClubPostLike from "./ClubPostLike.model.js";

// ==========================================
// LIKE CLUB POST
// ==========================================

export const likeClubPostService = async ({
  clubId,
  postId,
  userId,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // FIND ACTIVE POST
  // POST MUST BELONG TO THIS CLUB
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: false,
  });

  if (!post) {
    throw new Error(
      "Club post not found."
    );
  }

  // ==========================================
  // CHECK EXISTING LIKE
  // ==========================================

  const existingLike =
    await ClubPostLike.findOne({
      postId,
      userId,
    });

  if (existingLike) {
    throw new Error(
      "You have already liked this post."
    );
  }

  // ==========================================
  // CREATE LIKE
  // ==========================================

  const like =
    await ClubPostLike.create({
      postId,
      userId,
    });

  return like;
};


// ==========================================
// UNLIKE CLUB POST
// ==========================================

export const unlikeClubPostService = async ({
  clubId,
  postId,
  userId,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // FIND ACTIVE POST
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: false,
  });

  if (!post) {
    throw new Error(
      "Club post not found."
    );
  }

  // ==========================================
  // FIND USER'S LIKE
  // ==========================================

  const like =
    await ClubPostLike.findOne({
      postId,
      userId,
    });

  if (!like) {
    throw new Error(
      "You have not liked this post."
    );
  }

  // ==========================================
  // DELETE USER'S LIKE
  // ==========================================

  await ClubPostLike.deleteOne({
    _id: like._id,
  });

  return like;
};