import express from "express";

import {
  createProgrammeSeatLimit,
  getAllProgrammeSeatLimits,
  getProgrammeSeatLimitById,
  updateProgrammeSeatLimit,
  deleteProgrammeSeatLimit,
  getDeletedProgrammeSeatLimits,
  restoreProgrammeSeatLimit,
  permanentDeleteProgrammeSeatLimit,
} from "./programmeSeatLimit.controller.js";

const router = express.Router();

// ============================================================
// CREATE
// ============================================================

router.post(
  "/",
  createProgrammeSeatLimit
);

// ============================================================
// GET DELETED
// IMPORTANT: Keep this BEFORE /:id
// ============================================================

router.get(
  "/deleted",
  getDeletedProgrammeSeatLimits
);

// ============================================================
// GET ALL
// ============================================================

router.get(
  "/",
  getAllProgrammeSeatLimits
);

// ============================================================
// GET SINGLE
// ============================================================

router.get(
  "/:id",
  getProgrammeSeatLimitById
);

// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  updateProgrammeSeatLimit
);

// ============================================================
// RESTORE
// ============================================================

router.patch(
  "/restore/:id",
  restoreProgrammeSeatLimit
);

// ============================================================
// PERMANENT DELETE
// ============================================================

router.delete(
  "/permanent-delete/:id",
  permanentDeleteProgrammeSeatLimit
);

// ============================================================
// SOFT DELETE
// IMPORTANT: Keep this AFTER /permanent-delete/:id
// ============================================================

router.delete(
  "/:id",
  deleteProgrammeSeatLimit
);

export default router;