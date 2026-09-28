import express from "express";

import {
  getAvailableStudentsController,
  createStudentPoolController,
  getStudentPoolsController,
  deleteStudentPoolController,
  getExamCellStudentsController
} from "./examHallStudentPool.controller.js";

import { protect }from "../../../middleware/auth.middleware.js";

const router = express.Router();

// =====================================================
// GET AVAILABLE STUDENTS
// =====================================================

router.get(
  "/available-students",
  protect,
  getAvailableStudentsController
);


router.get(
  "/students",
  protect,
  getExamCellStudentsController
);


// =====================================================
// CREATE STUDENT POOL
// =====================================================

router.post(
  "/",
  protect,
  createStudentPoolController
);

// =====================================================
// GET POOLS FOR HALL
// =====================================================

router.get(
  "/hall/:hallId",
  protect,
  getStudentPoolsController
);

// =====================================================
// DELETE POOL
// =====================================================

router.delete(
  "/:poolId",
  protect,
  deleteStudentPoolController
);

export default router;