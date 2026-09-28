import express from "express";

import {
  likeClubPost,
  unlikeClubPost,
} from "./clubPostLike.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();


// ==========================================
// LIKE / UNLIKE CLUB POST
// ==========================================

// Like post
router.post(
  "/clubs/:clubId/posts/:postId/like",
  protect,
  likeClubPost
);

// Unlike post
router.delete(
  "/clubs/:clubId/posts/:postId/like",
  protect,
  unlikeClubPost
);


export default router;