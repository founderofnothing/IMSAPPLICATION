import express from "express";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./clubPostComment.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();


// ==========================================
// CLUB POST COMMENTS
// ==========================================


// ==========================================
// GET ALL COMMENTS
// PAGINATED
// ==========================================

router.get(
  "/clubs/:clubId/posts/:postId/comments",
  protect,
  getComments
);


// ==========================================
// CREATE COMMENT
// ==========================================

router.post(
  "/clubs/:clubId/posts/:postId/comments",
  protect,
  createComment
);


// ==========================================
// UPDATE COMMENT
// OWNER ONLY
// ==========================================

router.patch(
  "/clubs/:clubId/posts/:postId/comments/:commentId",
  protect,
  updateComment
);


// ==========================================
// DELETE COMMENT
// OWNER ONLY
// ==========================================

router.delete(
  "/clubs/:clubId/posts/:postId/comments/:commentId",
  protect,
  deleteComment
);


export default router;