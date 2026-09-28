import express from "express";

import {
  createClub,
  getClubs,
  getClubById,
  updateClub,
  deleteClub,
  getDeletedClubs,
  restoreClub,
    clubLogin,

  permanentlyDeleteClub,
} from "./club.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

import {
  authorize,
  authorizeDesignation,
} from "../../middleware/role.middleware.js";

const router = express.Router();


// ==========================================
// CREATE CLUB
// Principal only
// ==========================================

router.post(
  "/",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("principal"),
  createClub
);


// ==========================================
// GET ALL ACTIVE CLUBS
// Authenticated users
// ==========================================

router.get(
  "/",
  protect,
  getClubs
);


// ==========================================
// RECYCLE BIN
// ==========================================

// Get deleted clubs
router.get(
  "/recycle-bin",
  protect,
  getDeletedClubs
);


// Restore deleted club
router.patch(
  "/recycle-bin/:clubId/restore",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("principal"),
  restoreClub
);


// Permanently delete club
router.delete(
  "/recycle-bin/:clubId/permanent",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("principal"),
  permanentlyDeleteClub
);


// ==========================================
// SINGLE CLUB
// Authenticated users
// ==========================================

router.get(
  "/:clubId",
  protect,
  getClubById
);


// ==========================================
// UPDATE CLUB
// Principal only
// ==========================================

router.patch(
  "/:clubId",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("principal"),
  updateClub
);


// ==========================================
// SOFT DELETE CLUB
// Principal only
// ==========================================

router.delete(
  "/:clubId",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("principal"),
  deleteClub
);


router.post(
  "/login",
  clubLogin
);



export default router;