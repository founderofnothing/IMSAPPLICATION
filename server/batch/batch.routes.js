import express from "express";

import {
  createBatch,
  getAllBatch,
  getBatchesByInstitution,
  getStudentsByBatch,
  updateBatch,
  deleteBatch,
  getDeletedBatch,
  restoreBatch,
  permanentDeleteBatch
} from "./batch.controller.js";
import {protect} from "../middleware/auth.middleware.js"
const router =
  express.Router();

// CREATE BATCH
router.post(
  "/create",
  protect,
  createBatch
);

// GET ALL BATCHES
router.get("/getall",  protect, getAllBatch);

router.get(
  "/institution/:institutionId",
  protect,
  getBatchesByInstitution
);
// GET STUDENTS BY BATCH
router.get("/:id/students", protect, getStudentsByBatch);

// UPDATE BATCH
router.put("/update/:id",  protect, updateBatch);

// DELETE BATCH
router.delete("/delete/:id", protect, deleteBatch);

// RECYCLE BIN
router.get("/deleted/recycle-bin", protect, getDeletedBatch);

// RESTORE BATCH
router.put("/recycle/:id/restore",  protect, restoreBatch);

// PERMANENT DELETE
router.delete("/delete/:id/permanent", protect, permanentDeleteBatch);

export default router;