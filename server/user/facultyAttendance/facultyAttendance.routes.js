import express from "express";

import {
  bulkUploadFacultyAttendance,
  bulkUpdateFacultyAttendance,
    getSingleFacultyAttendance
} from "./facultyAttendance.controller.js";

import { protect}from "../../middleware/auth.middleware.js";

import upload from "../../middleware/upload.middleware.js";


const router =
  express.Router();


// ============================================================
// BULK UPLOAD
// ============================================================

router.post(
  "/bulk-upload",
  protect,
  upload.single("file"),
  bulkUploadFacultyAttendance
);


// ============================================================
// BULK UPDATE
// ============================================================

router.post(
  "/bulk-update",
  protect,
  upload.single("file"),
  bulkUpdateFacultyAttendance
);

router.get(
  "/faculty/:facultyId",
  protect,
  getSingleFacultyAttendance
);

export default router;