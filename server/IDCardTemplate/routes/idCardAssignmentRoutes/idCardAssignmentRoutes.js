import express from "express";

import {
  createIDCardAssignment,
  getIDCardAssignments,
  getIDCardAssignmentById,
  updateIDCardAssignment,
  deleteIDCardAssignment,
  deactivateIDCardAssignment,
  activateIDCardAssignment,
   getStudentIDCardPreview,
} from "../../controllers/idCardAssignmentController/idCardAssignmentController.js";

import {protect} from "../../../middleware/auth.middleware.js";

const router = express.Router();


// ============================================================
// CREATE ID CARD ASSIGNMENT
// ============================================================

router.post(
  "/",
  protect,
  createIDCardAssignment
);


router.get(
  "/",
  protect,
  getIDCardAssignments
);


// ============================================================
// GET STUDENT ID CARD PREVIEW
// ============================================================

router.get(
  "/student/:studentId/preview",
  getStudentIDCardPreview
);
// ============================================================
// GET SINGLE
// ============================================================

router.get(
  "/:id",
  protect,
  getIDCardAssignmentById
);


// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  protect,
  updateIDCardAssignment
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  protect,
  deleteIDCardAssignment
);

// ============================================================
// DEACTIVATE
// ============================================================

router.patch(
  "/:id/deactivate",
  protect,
  deactivateIDCardAssignment
);

// ============================================================
// ACTIVATE
// ============================================================

router.patch(
  "/:id/activate",
  protect,
  activateIDCardAssignment
);

export default router;