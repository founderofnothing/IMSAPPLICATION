import express from "express";

import {
  createIDCardTemplate,
  getIDCardTemplates,
  getIDCardTemplateById,
  updateIDCardTemplate,
  deleteIDCardTemplate,
  publishIDCardTemplate,
  unpublishIDCardTemplate,
} from "../../controllers/idCardTemplatecontroller/idCardTemplateController.js";

import {protect} from "../../../middleware/auth.middleware.js"

const router = express.Router();


router.post(
  "/",
  protect,
  createIDCardTemplate
);


// GET ALL
router.get(
  "/",
   protect,
  getIDCardTemplates
);


// GET ONE
router.get(
  "/:id",
 protect,
  getIDCardTemplateById
);


// UPDATE
router.put(
  "/:id",
 protect,
  updateIDCardTemplate
);


// DELETE
router.delete(
  "/:id",
 protect,
  deleteIDCardTemplate
);


// PUBLISH
router.patch(
  "/:id/publish",
 protect,
  publishIDCardTemplate
);


// UNPUBLISH
router.patch(
  "/:id/unpublish",
 protect,
  unpublishIDCardTemplate
);


export default router;