import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,

  getDeletedDepartments,
  restoreDepartment,
  permanentDeleteDepartment,
  getDepartmentOverviewController,

  getMyDepartment,
} from "./department.controller.js";

const router = express.Router();

// CREATE

router.post("/",createDepartment);

router.get(
  "/:departmentId/overview",
  getDepartmentOverviewController
);

// READ
// get deleted department
router.get("/deleted",getDeletedDepartments);
// get my department jwt
router.get("/my-department",protect,getMyDepartment);
// get all department
router.get("/",getAllDepartments);
// get department by id
router.get("/:id",getDepartmentById);

// UPDATE
router.put("/:id",updateDepartment);
// restore from bin
router.patch("/restore/:id",restoreDepartment);

// DELETE
router.delete("/permanent-delete/:id",permanentDeleteDepartment);
// soft delete
router.delete("/:id",deleteDepartment
);

export default router;