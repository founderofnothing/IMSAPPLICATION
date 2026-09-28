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


// =====================================================
// CREATE
// POST /api/programme-seat-limit
// =====================================================

router.post(
  "/",
  createProgrammeSeatLimit
);


// =====================================================
// GET ALL ACTIVE
// GET /api/programme-seat-limit
// =====================================================

router.get(
  "/",
  getAllProgrammeSeatLimits
);


// =====================================================
// GET ALL DELETED
// GET /api/programme-seat-limit/deleted
// =====================================================

router.get(
  "/deleted",
  getDeletedProgrammeSeatLimits
);


// =====================================================
// GET SINGLE
// GET /api/programme-seat-limit/:id
// =====================================================

router.get(
  "/:id",
  getProgrammeSeatLimitById
);


// =====================================================
// UPDATE
// PUT /api/programme-seat-limit/:id
// =====================================================

router.put(
  "/:id",
  updateProgrammeSeatLimit
);


// =====================================================
// SOFT DELETE
// DELETE /api/programme-seat-limit/:id
// =====================================================

router.delete(
  "/:id",
  deleteProgrammeSeatLimit
);


// =====================================================
// RESTORE
// PATCH /api/programme-seat-limit/:id/restore
// =====================================================

router.patch(
  "/:id/restore",
  restoreProgrammeSeatLimit
);


// =====================================================
// PERMANENT DELETE
// DELETE /api/programme-seat-limit/:id/permanent
// =====================================================

router.delete(
  "/:id/permanent",
  permanentDeleteProgrammeSeatLimit
);


export default router;