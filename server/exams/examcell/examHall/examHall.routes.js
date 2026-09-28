import express from "express";

import {
  createExamHallController,
  getAllExamHallsController,
  getExamHallByIdController,
  updateExamHallController,
  deleteExamHallController,
} from "./examHall.controller.js";

import { protect  }from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createExamHallController
);

router.get(
  "/",
  protect,
  getAllExamHallsController
);

router.get(
  "/:hallId",
  protect,
  getExamHallByIdController
);

router.put(
  "/:hallId",
  protect,
  updateExamHallController
);

router.delete(
  "/:hallId",
  protect,
  deleteExamHallController
);

export default router;