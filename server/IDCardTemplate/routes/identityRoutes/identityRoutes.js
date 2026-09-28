import express from "express";

import {
  createIdentity,
  resolveIdentity,
  createBulkIdentities
} from "../../controllers/identityController/identityController.js";

import {protect} from "../../../middleware/auth.middleware.js";

const router = express.Router();


// ============================================================
// CREATE IDENTITY
// ============================================================

router.post(
  "/",
  protect,
  createIdentity
);

router.post(
  "/bulk",
  protect,
  createBulkIdentities
);

// ============================================================
// RESOLVE IDENTITY TOKEN
// ============================================================

router.get(
  "/resolve/:token",
  protect,
  resolveIdentity
);




export default router;