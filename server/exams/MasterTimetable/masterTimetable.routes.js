import express from "express";

import {
  // Master Timetable
  createMasterTimetable,
  getMasterTimetables,
  getMasterTimetable,
  updateMasterTimetable,
  deleteMasterTimetable,

  // Classes
  getClassesByYear,

  // Dates / Sessions
  addTimetableDate,
  updateTimetableDate,
  deleteTimetableDate,

  // Subjects
  getSubjectsForClass,

  // Schedule / Cells
  assignSubjectToTimetableCell,
  changeSubjectInCell,
  removeSubjectFromCell,
} from "./MasterTimetable.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();


// ======================================================
// MASTER TIMETABLE
// ======================================================

// Create Master Timetable
// POST /api/master-timetables
router.post(
  "/",
  protect,
  createMasterTimetable
);



router.get(
  "/",
  protect,
  getMasterTimetables
);


// ======================================================
// CLASS / YEAR
// ======================================================

// Get classes by selected year
//
// Example:
// GET /api/master-timetables/classes/by-year?year=1
//
// IMPORTANT:
// This route must come BEFORE /:id
//
router.get(
  "/classes/by-year",
  protect,
  getClassesByYear
);


// ======================================================
// MASTER TIMETABLE - SINGLE RECORD
// ======================================================

// Get Master Timetable
// GET /api/master-timetables/:id
router.get(
  "/:id",
  getMasterTimetable
);


// Update Master Timetable Header
//
// PUT /api/master-timetables/:id
//
// Updates:
// - examTitleId
// - semesterType
// - academicYear
//
router.put(
  "/:id",
  updateMasterTimetable
);


// Soft Delete Master Timetable
// DELETE /api/master-timetables/:id
router.delete(
  "/:id",
  deleteMasterTimetable
);


// ======================================================
// EXAMINATION DATE
// ======================================================

// Add new examination date
//
// POST /api/master-timetables/:id/dates
//
// Body:
// {
//   "date": "2026-01-21",
//   "sessions": [
//     {
//       "startTime": "10:00",
//       "endTime": "12:00"
//     }
//   ]
// }
//
router.post(
  "/:id/dates",
  addTimetableDate
);


// Update examination date / sessions
//
// PUT /api/master-timetables/:id/dates/:dateId
//
router.put(
  "/:id/dates/:dateId",
  updateTimetableDate
);


// Delete examination date
//
// DELETE /api/master-timetables/:id/dates/:dateId
//
router.delete(
  "/:id/dates/:dateId",
  deleteTimetableDate
);


// ======================================================
// CLASS SUBJECTS
// ======================================================

// Get subjects for a specific class
//
// This also tells the frontend which subjects
// have already been scheduled for that class.
//
// GET /api/master-timetables/:id/classes/:classId/subjects
//
router.get(
  "/:id/classes/:classId/subjects",
  getSubjectsForClass
);


// ======================================================
// TIMETABLE CELL / SCHEDULE
// ======================================================

// Assign subject to an empty timetable cell
//
// POST /api/master-timetables/:id/schedules
//
// Body:
// {
//   "classId": "...",
//   "subjectId": "...",
//   "dateId": "...",
//   "sessionId": "..."
// }
//
router.post(
  "/:id/schedules",
  assignSubjectToTimetableCell
);


// ======================================================
// CHANGE SUBJECT
// ======================================================

// Change subject in an existing timetable cell
//
// PUT /api/master-timetables/:id/schedules/:scheduleId
//
// Body:
// {
//   "subjectId": "..."
// }
//
router.put(
  "/:id/schedules/:scheduleId",
  changeSubjectInCell
);


// ======================================================
// REMOVE SUBJECT
// ======================================================

// Remove subject from an existing timetable cell
//
// DELETE /api/master-timetables/:id/schedules/:scheduleId
//
router.delete(
  "/:id/schedules/:scheduleId",
  removeSubjectFromCell
);


export default router;