import express from "express";

import {
  searchBorrowers,
  getAvailableBooks,
  issueBooks,
  getBookDistribution,
  getStudentBooks,
  getFacultyBooks,
  returnBook,
  getDistributionHistory,
} from "./bookDistribution.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();


// ============================================================
// BOOK DISTRIBUTION
// ============================================================


// 1. Search Students / Faculty
router.get(
  "/borrowers/search",
  protect,
  searchBorrowers
);


// 2. Get Available Books
router.get(
  "/books/available",
  protect,
  getAvailableBooks
);


// 3. Issue / Distribute Books
router.post(
  "/issue",
  protect,
  issueBooks
);


// 4. Get People Currently Holding a Book
router.get(
  "/book",
  protect,
  getBookDistribution
);


// 5. Get Student's Books
router.get(
  "/student/books",
  protect,
  getStudentBooks
);


// 6. Get Faculty's Books
router.get(
  "/faculty/books",
  protect,
  getFacultyBooks
);


// 7. Return Book
router.patch(
  "/return",
  protect,
  returnBook
);


// 8. Get Distribution History
router.get(
  "/history",
  protect,
  getDistributionHistory
);


export default router;