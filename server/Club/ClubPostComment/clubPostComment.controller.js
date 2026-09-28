import {
  createCommentService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
} from "./clubPostComment.service.js";


// ==========================================
// CREATE COMMENT
// ==========================================

export const createComment = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    const {
      comment,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Comment is required.",
      });
    }

    // ==========================================
    // CREATE COMMENT
    // ==========================================

    const newComment =
      await createCommentService({
        clubId,
        postId,

        // Master User ID from JWT
        userId:
          req.user.userId,

        comment:
          comment.trim(),
      });

    return res.status(201).json({
      success: true,
      message:
        "Comment added successfully.",
      data: newComment,
    });

  } catch (error) {

    console.error(
      "Create Comment Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to add comment.",
    });
  }
};


// ==========================================
// GET ALL COMMENTS
// PAGINATED
// ==========================================

export const getComments = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    const {
      page = 1,
      limit = 10,
    } = req.query;

    // ==========================================
    // FETCH COMMENTS
    // ==========================================

    const result =
      await getCommentsService({
        clubId,
        postId,
        page,
        limit,
      });

    return res.status(200).json({
      success: true,
      message:
        "Comments fetched successfully.",
      data: result,
    });

  } catch (error) {

    console.error(
      "Get Comments Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch comments.",
    });
  }
};


// ==========================================
// UPDATE COMMENT
// ==========================================

export const updateComment = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
      commentId,
    } = req.params;

    const {
      comment,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Comment is required.",
      });
    }

    // ==========================================
    // UPDATE COMMENT
    // ==========================================

    const updatedComment =
      await updateCommentService({
        clubId,
        postId,
        commentId,

        // Master User ID from JWT
        userId:
          req.user.userId,

        comment:
          comment.trim(),
      });

    return res.status(200).json({
      success: true,
      message:
        "Comment updated successfully.",
      data: updatedComment,
    });

  } catch (error) {

    console.error(
      "Update Comment Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update comment.",
    });
  }
};


// ==========================================
// DELETE COMMENT
// ==========================================

export const deleteComment = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
      commentId,
    } = req.params;

    // ==========================================
    // DELETE COMMENT
    // ==========================================

    const deletedComment =
      await deleteCommentService({
        clubId,
        postId,
        commentId,

        // Master User ID from JWT
        userId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Comment deleted successfully.",
      data: deletedComment,
    });

  } catch (error) {

    console.error(
      "Delete Comment Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete comment.",
    });
  }
};