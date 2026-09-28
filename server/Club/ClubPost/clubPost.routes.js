import express from "express";

import {
  createClubPost,
  getClubPosts,
  getClubPostById,
  updateClubPost,
  deleteClubPost,
  getDeletedClubPosts,
  restoreClubPost,
  permanentlyDeleteClubPost,
} from "./clubPost.controller.js";

import clubPostUpload from "./clubPost.upload.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();


// ==========================================
// CLUB POSTS
// ==========================================

// Get all posts from a club
router.get(
  "/clubs/:clubId/posts",
  protect,
  getClubPosts
);


// ==========================================
// POST RECYCLE BIN
// IMPORTANT: BEFORE /:postId
// ==========================================

// Get deleted posts
router.get(
  "/clubs/:clubId/posts/recycle-bin",
  protect,
  getDeletedClubPosts
);


// Restore deleted post
router.patch(
  "/clubs/:clubId/posts/recycle-bin/:postId/restore",
  protect,
  restoreClubPost
);


// Permanently delete deleted post
router.delete(
  "/clubs/:clubId/posts/recycle-bin/:postId/permanent",
  protect,
  permanentlyDeleteClubPost
);


// ==========================================
// SINGLE POST
// ==========================================

// Get single post
router.get(
  "/clubs/:clubId/posts/:postId",
  protect,
  getClubPostById
);


// ==========================================
// CREATE POST
// ==========================================

router.post(
  "/clubs/:clubId/posts",
  protect,
  clubPostUpload.array("images", 10),
  createClubPost
);


// ==========================================
// UPDATE POST
// ==========================================

router.patch(
  "/clubs/:clubId/posts/:postId",
  protect,
  clubPostUpload.array("images", 10),
  updateClubPost
);;


// ==========================================
// SOFT DELETE POST
// ==========================================

router.delete(
  "/clubs/:clubId/posts/:postId",
  protect,
  deleteClubPost
);


export default router;