import express from "express";
import {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  softDeleteStudent,
  getDeletedStudents,
  restoreStudent,
  permanentDeleteStudent,
  getInstitutionStudents,
  getStudentsByDepartment,
  getStudentsByClass,
  bulkUploadStudents,
  bulkUpdateStudents,
  getMyInstitutionClasses,
  getStudentAssignment,
  moveStudents,
  getStudentClassAssignment,
  assignClass,
  unassignStudents,
  getStudentIdCardData,
  transferStudent,
  getAllocationClasses,
  mergeClass,
  splitClass
} from "./student.controller.js";



import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  authorize,
  authorizeDesignation
} from "../middleware/role.middleware.js";

const router = express.Router();

/* ==========================================================
   CREATE
========================================================== */

router.post(
  "/create",
  protect,
  createStudent
);

/* ==========================================================
   BULK OPERATIONS
========================================================== */

router.post(
  "/bulk-upload",
  protect,
  upload.single("file"),
  bulkUploadStudents
);

router.post(
  "/bulk-update",
  protect,
  upload.single("file"),
  bulkUpdateStudents
);

/* ==========================================================
   STUDENT ASSIGNMENT
========================================================== */

router.get(
  "/student-transport/student-assignment",
  getStudentAssignment
);


// ============================================================
// GET STUDENT DATA FOR ID CARD
// ============================================================

router.get(
  "/id-card-data/:studentId",
  protect,
  getStudentIdCardData
);
/* ==========================================================
   SOFT DELETE
========================================================== */

router.patch(
  "/soft-delete/:id",
  protect,
  softDeleteStudent
);

router.get(
  "/deleted",
  protect,
  getDeletedStudents
);

router.patch(
  "/restore/:id",
  protect,
  restoreStudent
);

router.delete(
  "/permanent-delete/:id",
  protect,
  permanentDeleteStudent
);

/* ==========================================================
   CLASS ALLOCATION
========================================================== */

router.get(
  "/my-institution",
  protect,
  getMyInstitutionClasses
);

router.get(
  "/class-assignment",
  protect,
  getStudentClassAssignment
);

router.patch(
  "/assign-class",
  protect,
  assignClass
);

router.patch(
  "/merge-class",
  protect,
  mergeClass
);

router.patch(
  "/split-class",
  protect,
  splitClass
);

router.patch(
  "/unassign-class",
  protect,
  unassignStudents
);

router.patch(
  "/move-students",
  protect,
  moveStudents
);

router.get(
  "/allocation",
  protect,
  getAllocationClasses
);

/* ==========================================================
   ROLE BASED
========================================================== */

router.get(
  "/principal/institution",
  protect,
  authorize("teaching_faculty"),
  getInstitutionStudents
);

router.get(
  "/hod/department",
  protect,
  authorize("teaching_faculty"),
  getStudentsByDepartment
);

router.get(
  "/class/studentlist/:classId",
  protect,
  authorize("teaching_faculty"),
  getStudentsByClass
);


router.put(
  "/:id/transfer",
  protect,
  transferStudent
);

/* ==========================================================
   GENERAL CRUD
========================================================== */

router.get(
  "/",
  protect,
  getAllStudents
);

router.get(
  "/:id",
  getSingleStudent
);

router.put(
  "/:id",
  protect,
  updateStudent
);

export default router;









