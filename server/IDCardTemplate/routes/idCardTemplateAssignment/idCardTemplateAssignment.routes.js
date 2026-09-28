import express from "express";

import {
  assignTemplateToInstitution,
  getActiveTemplateForInstitution,
  getTemplateAssignmentById,
  getActiveAssignmentForTemplate,
  unassignTemplateFromInstitution,
} from "../../controllers/idCardTemplateAssignmentController/idCardTemplateAssignment.controller.js";

import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();


// ============================================================
// ASSIGN TEMPLATE TO INSTITUTION
// ============================================================

router.post(
  "/",
  protect,
  assignTemplateToInstitution
);


// ============================================================
// GET ACTIVE TEMPLATE FOR INSTITUTION
// ============================================================

router.get(
  "/institution/:institutionId",
  protect,
  getActiveTemplateForInstitution
);


// ============================================================
// GET ACTIVE ASSIGNMENT FOR TEMPLATE
// ============================================================

router.get(
  "/template/:templateId",
  protect,
  getActiveAssignmentForTemplate
);
// ============================================================
// GET ASSIGNMENT BY ID
// ============================================================

router.get(
  "/:id",
  protect,
  getTemplateAssignmentById
);


// ============================================================
// UNASSIGN TEMPLATE FROM INSTITUTION
// ============================================================

router.patch(
  "/institution/:institutionId/unassign",
  protect,
  unassignTemplateFromInstitution
);


export default router;