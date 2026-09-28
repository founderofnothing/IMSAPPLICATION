import express from "express";

import {

  // ==================== EXAM TITLE ====================

  createExamTitle,
  getAllExamTitle,
  getSingleExamTitle,
  updateExamTitle,
  deleteExamTitle,
  restoreExamTitle,
  permanentDeleteExamTitle,


  getStudentExamResult,
  // ==================== EXAM SESSION ====================

  createExamSession,
  getAllExamSession,
  getSingleExamSession,
  updateExamSession,
  deleteExamSession,
  restoreExamSession,
  permanentDeleteExamSession,
  getExamSessionsByClass,

  // ==================== EXAM PAPER ====================

  getExamPaperList,

  // ==================== STUDENT EXAM MARK ====================

  saveStudentExamMarks,
  getStudentExamMarks,
  updateStudentExamMarks,
  deleteStudentExamMarks,
  restoreStudentExamMarks,
  permanentDeleteStudentExamMarks,

  // ==================== REPORT ====================

  getExamResultReport,

} from "./exam.controller.js";

import {protect} from "../middleware/auth.middleware.js"

const router = express.Router();


// ======================================================
// EXAM TITLE
// ======================================================

// Create
router.post(
  "/exam-title",
  protect,
  createExamTitle
);

// Get All
router.get(
  "/exam-title",
  protect,
  getAllExamTitle
);

// Get Single
router.get(
  "/exam-title/:id",
  protect,
  getSingleExamTitle
);



router.get(
  "/student-exam-result/:studentId",
  protect,
  getStudentExamResult
);


// Update
router.put(
  "/exam-title/:id",
  protect,
  updateExamTitle
);

// Soft Delete
router.delete(
  "/exam-title/:id",
  protect,
  deleteExamTitle
);

// Restore
router.put(
  "/exam-title/:id/restore",
  protect,
  restoreExamTitle
);

// Permanent Delete
router.delete(
  "/exam-title/:id/permanent",
  protect,
  permanentDeleteExamTitle
);


// ======================================================
// EXAM SESSION
// ======================================================

// Create
router.post(
  "/exam-session",
  protect,
  createExamSession
);

// Get All
router.get(
  "/exam-session",
  protect,
  getAllExamSession
);

// Get Single
router.get(
  "/exam-session/:id",
  protect,
  getSingleExamSession
);

// Update
router.put(
  "/exam-session/:id",
  protect,
  updateExamSession
);

// Soft Delete
router.delete(
  "/exam-session/:id",
  protect,
  deleteExamSession
);

// Restore
router.put(
  "/exam-session/:id/restore",
  protect,
  restoreExamSession
);

// Permanent Delete
router.delete(
  "/exam-session/:id/permanent",
  protect,
  permanentDeleteExamSession
);

// Get Sessions By Class
router.get(
  "/exam-session/class/:classId",
  protect,
  getExamSessionsByClass
);


// ======================================================
// EXAM PAPER
// ======================================================

// Get Exam Paper List
router.get(
  "/exam-paper",
  protect,
  getExamPaperList
);


// ======================================================
// STUDENT EXAM MARK
// ======================================================

// Save Marks
router.post(
  "/student-exam-mark",
  protect,
  saveStudentExamMarks
);

// Get Marks
router.get(
  "/student-exam-mark/:id",
  protect,
  getStudentExamMarks
);

// Update Marks
router.put(
  "/student-exam-mark",
  protect,
  updateStudentExamMarks
);

// Soft Delete
router.delete(
  "/student-exam-mark/:examPaperId",
  protect,
  deleteStudentExamMarks
);

// Restore
router.put(
  "/student-exam-mark/:examPaperId/restore",
  protect,
  restoreStudentExamMarks
);

// Permanent Delete
router.delete(
  "/student-exam-mark/:examPaperId/permanent",
  protect,
  permanentDeleteStudentExamMarks
);


// ======================================================
// STUDENT EXAM RESULT
// ======================================================

router.get(

  "/student-exam-result/:studentId",

  protect,

  getStudentExamResult

);

// ======================================================
// EXAM REPORT
// ======================================================

// Principal / HOD Report
router.get(
  "/exam-report/:examPaperId",
  protect,
  getExamResultReport
);

export default router;