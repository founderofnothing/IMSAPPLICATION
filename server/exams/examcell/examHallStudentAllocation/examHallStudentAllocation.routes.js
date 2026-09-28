import express from "express";

import {
  createStudentAllocationController,
  createBulkStudentAllocationsController,
  getHallAllocationsController,
  getHallAttendanceListController,
  removeStudentAllocationController,
} from "./examHallStudentAllocation.controller.js";

import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// =====================================================
// CREATE SINGLE STUDENT ALLOCATION
// =====================================================
// Manual allocation

router.post(
  "/",
  protect,
  createStudentAllocationController
);


// =====================================================
// CREATE BULK STUDENT ALLOCATIONS
// =====================================================
// Automatic allocation

router.post(
  "/bulk",
  protect,
  createBulkStudentAllocationsController
);


// =====================================================
// GET HALL ALLOCATIONS
// =====================================================
// Returns all students currently allocated
// to the selected exam session + hall.

router.get(
  "/title/:examTitleId/hall/:hallId",
  protect,
  getHallAllocationsController
);


// =====================================================
// GET HALL ATTENDANCE LIST
// =====================================================
//
// Department-wise student list for attendance sheet.
//
// =====================================================

router.get(
  "/title/:examTitleId/hall/:hallId/attendance",
  protect,
  getHallAttendanceListController
);

// =====================================================
// REMOVE STUDENT ALLOCATION
// =====================================================
// Used later for remove / reassign.

router.delete(
  "/:allocationId",
  protect,
  removeStudentAllocationController
);




export default router;