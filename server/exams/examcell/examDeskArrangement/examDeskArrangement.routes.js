import express from "express";

import {
  createDeskArrangementController,
  getDeskArrangementController,
  updateDeskArrangementController,
  deleteDeskArrangementController,
} from "./examDeskArrangement.controller.js";

import{ protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// =====================================================
// DESK ARRANGEMENT
// =====================================================

// Create
router.post(
  "/:hallId/desk-arrangement",
  protect,
  createDeskArrangementController
);

// Get
router.get(
  "/:hallId/desk-arrangement",
  protect,
  getDeskArrangementController
);

// Update
router.put(
  "/:hallId/desk-arrangement",
  protect,
  updateDeskArrangementController
);

// Delete
router.delete(
  "/:hallId/desk-arrangement",
  protect,
  deleteDeskArrangementController
);

export default router;