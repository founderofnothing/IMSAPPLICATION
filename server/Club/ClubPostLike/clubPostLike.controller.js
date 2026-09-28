import {
  likeClubPostService,
  unlikeClubPostService,
} from "./clubPostLike.service.js";

// ==========================================
// LIKE CLUB POST
// ==========================================

export const likeClubPost = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    // ==========================================
    // LIKE POST
    // ==========================================

    const like =
      await likeClubPostService({
        clubId,
        postId,

        // Master User ID from JWT
        userId:
          req.user.userId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Post liked successfully.",
      data: like,
    });

  } catch (error) {

    console.error(
      "Like Club Post Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to like post.",
    });
  }
};


// ==========================================
// UNLIKE CLUB POST
// ==========================================

export const unlikeClubPost = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    // ==========================================
    // UNLIKE POST
    // ==========================================

    const like =
      await unlikeClubPostService({
        clubId,
        postId,

        // Master User ID from JWT
        userId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Post unliked successfully.",
      data: like,
    });

  } catch (error) {

    console.error(
      "Unlike Club Post Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to unlike post.",
    });
  }
};