import {
  createClubPostService,
  getClubPostsService,
  getClubPostByIdService,
  updateClubPostService,
  deleteClubPostService,
  getDeletedClubPostsService,
  restoreClubPostService,
  permanentlyDeleteClubPostService,
} from "./clubPost.service.js";


// ==========================================
// CREATE CLUB POST
// ==========================================


// ==========================================
// CREATE CLUB POST
// ==========================================

export const createClubPost = async (
  req,
  res
) => {

  try {

    const { clubId } =
      req.params;

    const {
      description,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !description ||
      !description.trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Post description is required.",
      });

    }


    // ==========================================
    // BUILD IMAGE PATHS
    // ==========================================

    const images =
      (req.files || []).map(
        (file) =>
          `/uploads/club-posts/${file.filename}`
      );


    // ==========================================
    // CREATE POST
    // ==========================================

    const post =
      await createClubPostService({

        clubId,

        authorId:
          req.user.userId,

        description:
          description.trim(),

        images,

      });


    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(201).json({

      success: true,

      message:
        "Club post created successfully.",

      data: post,

    });


  } catch (error) {

    console.error(
      "Create Club Post Error:",
      error
    );


    return res.status(400).json({

      success: false,

      message:
        error.message ||
        "Failed to create club post.",

    });

  }

};


// ==========================================
// GET ALL CLUB POSTS
// PAGINATED
// ==========================================

export const getClubPosts = async (req, res) => {

  try {

    const { clubId } = req.params;

    // ==========================================
    // QUERY PARAMETERS
    // ==========================================

    const {
      page = 1,
      limit = 10,
    } = req.query;

    // ==========================================
    // FETCH POSTS
    // ==========================================

    const result =
      await getClubPostsService({
        clubId,
        page,
        limit,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club posts fetched successfully.",
      data: result,
    });

  } catch (error) {

    console.error(
      "Get Club Posts Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch club posts.",
    });
  }
};


// ==========================================
// GET SINGLE CLUB POST
// ==========================================

export const getClubPostById = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    // ==========================================
    // FETCH POST
    // ==========================================

    const post =
      await getClubPostByIdService({
        clubId,
        postId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club post fetched successfully.",
      data: post,
    });

  } catch (error) {

    console.error(
      "Get Club Post Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Club post not found.",
    });
  }
};


// ==========================================
// UPDATE CLUB POST
// ==========================================

export const updateClubPost = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    const {
      description,
      existingImages,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      description === undefined &&
      existingImages === undefined &&
      (!req.files || req.files.length === 0)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "At least one field is required to update the post.",
      });

    }


    // ==========================================
    // EXISTING IMAGES
    // ==========================================

    let parsedExistingImages = [];


    if (existingImages) {

      try {

        parsedExistingImages =
          JSON.parse(existingImages);

      } catch (error) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid existing images data.",
        });

      }

    }


    // ==========================================
    // NEW UPLOADED IMAGES
    // ==========================================

    const newImages =
      (req.files || []).map(
        (file) =>
          `/uploads/club-posts/${file.filename}`
      );


    // ==========================================
    // FINAL IMAGE LIST
    // ==========================================

    const images = [

      ...parsedExistingImages,

      ...newImages,

    ];


    // ==========================================
    // UPDATE POST
    // ==========================================

    const updatedPost =
      await updateClubPostService({

        clubId,

        postId,

        authorId:
          req.user.userId,

        description,

        images,

      });


    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(200).json({

      success: true,

      message:
        "Club post updated successfully.",

      data: updatedPost,

    });


  } catch (error) {

    console.error(
      "Update Club Post Error:",
      error
    );


    return res.status(400).json({

      success: false,

      message:
        error.message ||
        "Failed to update club post.",

    });

  }

};


// ==========================================
// SOFT DELETE CLUB POST
// ==========================================

export const deleteClubPost = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    // ==========================================
    // DELETE POST
    // ==========================================

    const deletedPost =
      await deleteClubPostService({
        clubId,
        postId,

        // Logged-in faculty
        authorId: req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club post moved to recycle bin successfully.",
      data: deletedPost,
    });

  } catch (error) {

    console.error(
      "Delete Club Post Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete club post.",
    });
  }
};


// ==========================================
// GET DELETED POSTS
// CLUB RECYCLE BIN
// ==========================================

export const getDeletedClubPosts = async (
  req,
  res
) => {

  try {

    const { clubId } =
      req.params;

    const posts =
      await getDeletedClubPostsService({
        clubId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Deleted club posts fetched successfully.",
      data: posts,
    });

  } catch (error) {

    console.error(
      "Get Deleted Club Posts Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch deleted club posts.",
    });
  }
};


// ==========================================
// RESTORE CLUB POST
// ==========================================

export const restoreClubPost = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    const restoredPost =
      await restoreClubPostService({
        clubId,
        postId,
        authorId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club post restored successfully.",
      data: restoredPost,
    });

  } catch (error) {

    console.error(
      "Restore Club Post Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to restore club post.",
    });
  }
};


// ==========================================
// PERMANENTLY DELETE CLUB POST
// ==========================================

export const permanentlyDeleteClubPost = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      postId,
    } = req.params;

    const deletedPost =
      await permanentlyDeleteClubPostService({
        clubId,
        postId,
        authorId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club post permanently deleted from database.",
      data: deletedPost,
    });

  } catch (error) {

    console.error(
      "Permanent Delete Club Post Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to permanently delete club post.",
    });
  }
};