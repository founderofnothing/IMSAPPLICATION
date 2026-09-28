import express from "express";

import {
  createLibrary,
  getLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  getDeletedLibraries,
  restoreLibrary,
  permanentlyDeleteLibrary
} from "./library.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// =========================
// LIBRARY CRUD
// =========================

// Create
router.post("/", protect, createLibrary);

// Get active libraries
router.get("/", protect, getLibraries);

// Get deleted libraries
router.get("/deleted", protect, getDeletedLibraries);

// Get single active library
router.get("/:id", protect, getLibraryById);

// Update
router.put("/:id", protect, updateLibrary);

// Soft delete
router.delete("/:id", protect, deleteLibrary);

// Restore
router.patch("/:id/restore", protect, restoreLibrary);

// Permanent delete
router.delete(
  "/:id/permanent",
  protect,
  permanentlyDeleteLibrary
);

export default router;