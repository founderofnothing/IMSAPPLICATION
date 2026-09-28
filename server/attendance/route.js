import express from "express";

import {
  createAttendance,
  updateAttendance,
  getAttendance,
  getAttendanceStatus,
  deleteAttendance,
   getStudentAttendance
} from "./controller.js";

import {
  authorize,
  authorizeDesignation,
} from "../middleware/role.middleware.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();

// Take Attendance
router.post("/",protect,authorize("teaching_faculty"),authorizeDesignation(
    "principal",
    "hod",
    "assistant_professor",
    "associate_professor",
    "professor"
  ),
  createAttendance
);

router.get(
  "/student/:studentId",
  protect,
  authorize(
    "hod",
    "teaching_faculty",
    "non_teaching_faculty"
  ),
  getStudentAttendance
);


router.put(
  "/",
  protect,
  authorize(
    "teaching_faculty"
  ),
  authorizeDesignation(
    "principal",
    "hod",
    "assistant_professor",
    "associate_professor",
    "professor"
  ),
  updateAttendance
);


router.get(
  "/",
  protect,
  authorize(
    "teaching_faculty"
  ),
  getAttendance
);
router.get(
  "/status",
  protect,
  authorize("teaching_faculty"),
  getAttendanceStatus
);


router.delete(
  "/:id",
  protect,
  authorize(
    "teaching_faculty"
  ),
  authorizeDesignation(
    "principal",
    "hod",
    "assistant_professor",
    "associate_professor",
    "professor"
  ),
  deleteAttendance
);

export default router;