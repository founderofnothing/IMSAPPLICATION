import express from "express";

import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getDeletedBooks,
  restoreBook,
  permanentlyDeleteBook,


  // bulk upload 
   bulkUploadBooks,
     bulkUpdateBooks
} from "./book.controller.js";

import upload  from "../../middleware/upload.middleware.js"
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// =========================
// BOOK CRUD
// =========================

// Create Book
router.post("/", protect, createBook);

// Get All Books
router.get("/", protect, getBooks);

// =========================
// BOOK RECYCLE BIN
// =========================

// Get All Deleted Books
router.get(
  "/deleted",
  protect,
  getDeletedBooks
);


router.post(
  "/bulk-upload",
  protect,
  upload.single("file"),
  bulkUploadBooks
);

// Bulk Update Books
router.post(
  "/bulk-update",
  protect,
  upload.single("file"),
  bulkUpdateBooks
);


// Restore Deleted Book
router.patch(
  "/:id/restore",
  protect,
  restoreBook
);

// Permanently Delete Book
router.delete(
  "/:id/permanent",
  protect,
  permanentlyDeleteBook
);

// =========================
// SINGLE BOOK
// =========================

// Get Single Book
router.get(
  "/:id",
  protect,
  getBookById
);

// Update Book
router.put(
  "/:id",
  protect,
  updateBook
);

// Soft Delete Book
router.delete(
  "/:id",
  protect,
  deleteBook
);

export default router;