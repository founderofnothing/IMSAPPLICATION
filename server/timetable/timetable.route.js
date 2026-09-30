import express from "express";

import {
  // ================= MASTER TIMETABLE =================
  createTimetable,
  getTimetableByClass,
  updateTimetable,
  deleteTimetable,

  // ================= FACULTY ASSIGNMENT =================
  getClassTimetableForAssignment,
  assignFacultyToTimetable,
  getClassFacultyAssignments,
  updateFacultyAssignment,
  removeFacultyAssignment,

  // ================= FACULTY TIMETABLE =================
  getFacultyTimetable,

  // ================= ATTENDANCE =================
  getAttendanceContext,
  createAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} from "./timetable.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ============================================================
// 1. MASTER TIMETABLE
// ============================================================

// Create master timetable
router.post("/", protect, createTimetable);

// Get master timetable by class
router.get("/class/:classId", protect, getTimetableByClass);

// Update master timetable
router.put("/:id", protect, updateTimetable);

// Delete master timetable
router.delete("/:id", protect, deleteTimetable);


// ============================================================
// 2. FACULTY ASSIGNMENT
// ============================================================

// Get master timetable + assignments for a class
router.get(
  "/assignment/class/:classId",
  protect,
  getClassTimetableForAssignment
);

// Assign faculty to timetable slot
router.post(
  "/assignment",
  protect,
  assignFacultyToTimetable
);

// Get all faculty assignments for a class
router.get(
  "/class/:classId/assignments",
  protect,
  getClassFacultyAssignments
);

// Update faculty assignment
router.put(
  "/assignment/:id",
  protect,
  updateFacultyAssignment
);

// Remove faculty assignment
router.delete(
  "/assignment/:id",
  protect,
  removeFacultyAssignment
);


// ============================================================
// 3. FACULTY WORK TIMETABLE
// ============================================================

// Get faculty timetable
router.get(
  "/faculty/:facultyId",
  protect,
  getFacultyTimetable
);


// ============================================================
// 4. ATTENDANCE
// ============================================================

// Get attendance context from timetable assignment
router.get(
  "/attendance/context/:timetableAssignmentId",
  protect,
  getAttendanceContext
);

// Create attendance
router.post(
  "/attendance",
  protect,
  createAttendance
);

// Get attendance by ID
router.get(
  "/attendance/:id",
  protect,
  getAttendanceById
);

// Update attendance
router.put(
  "/attendance/:id",
  protect,
  updateAttendance
);

// Delete attendance
router.delete(
  "/attendance/:id",
  protect,
  deleteAttendance
);


export default router;