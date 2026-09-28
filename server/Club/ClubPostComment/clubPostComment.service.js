import Club from "../Clubcurd/Club.model.js";
import ClubPost from "../ClubPost/ClubPost.model.js";
import ClubPostComment from "./ClubPostComment.model.js";


// ==========================================
// CREATE COMMENT
// ==========================================

export const createCommentService = async ({
  clubId,
  postId,
  userId,
  comment,
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
  // CREATE COMMENT
  // ==========================================

  const newComment =
    await ClubPostComment.create({
      postId,
      userId,
      comment,
    });

  // ==========================================
  // POPULATE USER
  // ==========================================

  await newComment.populate(
    "userId",
    "fullName email profileImage"
  );

  return newComment;
};


// ==========================================
// GET ALL COMMENTS OF A POST
// PAGINATED
// ==========================================
export const getCommentsService = async ({
  clubId,
  postId,
  page = 1,
  limit = 10,
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
  // PAGINATION
  // ==========================================

  const pageNumber = Math.max(
    1,
    Number(page)
  );

  const limitNumber = Math.min(
    50,
    Math.max(1, Number(limit))
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  // ==========================================
  // FETCH COMMENTS
  // ==========================================

  const [
    comments,
    totalComments,
  ] = await Promise.all([

    ClubPostComment.find({
      postId,
    })
      .populate(
        "userId",
        "fullName email profileImage"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    ClubPostComment.countDocuments({
      postId,
    }),
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages =
    Math.ceil(
      totalComments /
      limitNumber
    );

  return {
    comments,

    pagination: {
      currentPage:
        pageNumber,

      limit:
        limitNumber,

      totalComments,

      totalPages,

      hasNextPage:
        pageNumber <
        totalPages,

      hasPreviousPage:
        pageNumber > 1,
    },
  };
};


// ==========================================
// UPDATE COMMENT
// ==========================================
export const updateCommentService = async ({
  clubId,
  postId,
  commentId,
  userId,
  comment,
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
  // FIND USER'S COMMENT
  // ==========================================

  const existingComment =
    await ClubPostComment.findOne({
      _id: commentId,
      postId,
      userId,
    });

  if (!existingComment) {
    throw new Error(
      "Comment not found or you are not the owner of this comment."
    );
  }

  // ==========================================
  // UPDATE COMMENT
  // ==========================================

  existingComment.comment =
    comment;

  await existingComment.save();

  // ==========================================
  // POPULATE USER
  // ==========================================

  await existingComment.populate(
    "userId",
    "fullName email profileImage"
  );

  return existingComment;
};


// ==========================================
// DELETE COMMENT
// ==========================================
export const deleteCommentService = async ({
  clubId,
  postId,
  commentId,
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
  // FIND USER'S COMMENT
  // ==========================================

  const existingComment =
    await ClubPostComment.findOne({
      _id: commentId,
      postId,
      userId,
    });

  if (!existingComment) {
    throw new Error(
      "Comment not found or you are not the owner of this comment."
    );
  }

  // ==========================================
  // DELETE COMMENT
  // ==========================================

  await ClubPostComment.deleteOne({
    _id: commentId,
    postId,
    userId,
  });

  return existingComment;
};