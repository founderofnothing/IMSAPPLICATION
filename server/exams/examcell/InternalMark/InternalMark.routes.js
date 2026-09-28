import express from "express";

import {
  getMyClass,
  getClassInternalMarkContext,
  createInternalMark,
  getInternalMark,
  updateInternalMark,
  deleteInternalMark,
  restoreInternalMark,
   completeInternalMarkSheet
} from "./InternalMark.controller.js";

// import  from "../../../middleware/";
import { protect } from "../../../middleware/auth.middleware.js"

const router = express.Router();


// ======================================================
// 1. GET MY CLASS
// ======================================================
// Returns the class assigned to the logged-in class in-charge.

router.get(
  "/my-class",
  protect,
  getMyClass
);


// ======================================================
// 2. GET CLASS INTERNAL MARK CONTEXT
// ======================================================
// Returns:
// - class
// - programme
// - batch
// - current study year
// - current semester
// - current subjects
// - students

router.get(
  "/classes/:classId/context",
  protect,
  getClassInternalMarkContext
);


// ======================================================
// 3. CREATE INTERNAL MARK SHEET
// ======================================================
// Creates the mark sheet for:
// Class + Exam Title

router.post(
  "/",
  protect,
  createInternalMark
);


// ======================================================
// 4. GET INTERNAL MARK SHEET
// ======================================================
// Gets the complete mark sheet for:
// Class + Exam Title

router.get(
  "/classes/:classId/exams/:examTitleId",
  protect,
  getInternalMark
);


// ======================================================
// 5. UPDATE INTERNAL MARK SHEET
// ======================================================
// Used while entering/updating student marks.

router.put(
  "/:id",
  protect,
  updateInternalMark
);


router.patch(
  "/:id/complete",
  protect,
  completeInternalMarkSheet
);
// ======================================================
// 6. DELETE INTERNAL MARK SHEET
// ======================================================
// Soft delete.

router.delete(
  "/:id",
  protect,
  deleteInternalMark
);


// ======================================================
// 7. RESTORE INTERNAL MARK SHEET
// ======================================================

router.patch(
  "/:id/restore",
  protect,
  restoreInternalMark
);


export default router;