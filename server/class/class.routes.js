import express from "express";

import {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
  getClassesByDepartment,
  getMyClasses,
  getDeletedClasses,
  restoreClass,
  permanentDeleteClass,
  getSingleClass,
  assignClassIncharge,
  getMyClass,
  getMyInstitutionClasses,
} from "./class.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// ==================== CREATE ====================

router.post(
  "/",
  protect,
  createClass
);


// ==================== SPECIFIC GET ROUTES ====================

// Institution classes
router.get(
  "/my-institution",
  protect,
  getMyInstitutionClasses
);

// HOD classes
router.get(
  "/my-classes",
  protect,

  getMyClasses
);

// Recycle bin
router.get(
  "/class/recycle-bin",
  getDeletedClasses
);

// Department classes
router.get(
  "/department/:departmentId",
  getClassesByDepartment
);

// All classes
router.get(
  "/",
  getAllClasses
);

router.get(

  "/my-class",

  protect,

  authorize(
    "teaching_faculty"
  ),

  getMyClass

);


router.put(
  "/:id/incharge",
  protect,
  assignClassIncharge
);


// ==================== SINGLE CLASS ====================

// Keep /:id AFTER specific GET routes
router.get(
  "/:id",
  protect,
  getSingleClass
);


// ==================== UPDATE ====================

router.put(
  "/:id",
  updateClass
);


// ==================== DELETE ====================

router.delete(
  "/:id",
  deleteClass
);


// ==================== RESTORE ====================

router.put(
  "/:id/restore",
  restoreClass
);


// ==================== PERMANENT DELETE ====================

router.delete(
  "/:id/permanent",
  permanentDeleteClass
);


export default router;