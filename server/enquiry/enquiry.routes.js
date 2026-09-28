import express from "express";

// import { protect } from "../middleware/auth.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
  createEnquiry,

  getAllEnquiries,
  getEnquiryById,
  getDeletedEnquiries,
  getMyInstitutionEnquiries,
  getMyEnquiries,
  getEnquiriesByStatus,

  updateEnquiry,
  restoreEnquiry,
  convertEnquiry,
getConvertedEnquiries,
getAllConvertedEnquiries,
  deleteEnquiry,
  permanentDeleteEnquiry,
  bulkUploadEnquiries

} from "./enquiry.controller.js";

const router = express.Router();

/* ===========================
          CREATE
=========================== */

router.post("/",protect,createEnquiry);
/* ===========================
            READ
=========================== */

router.get("/deleted",protect,getDeletedEnquiries);

router.get("/my-institution",protect,getMyInstitutionEnquiries);

router.get("/my-enquiries",protect,getMyEnquiries);

router.get("/status/:status",protect,getEnquiriesByStatus);

router.get("/",protect,getAllEnquiries);

router.get(
  "/converted",
  protect,
  getConvertedEnquiries
);

router.get(
  "/all-converted",
  protect,
  getAllConvertedEnquiries
);

router.get("/:id",protect,getEnquiryById);

/* ===========================
           UPDATE
=========================== */

router.put("/:id",protect,updateEnquiry);

router.patch("/restore/:id",protect,restoreEnquiry);

router.patch("/convert/:id",protect,convertEnquiry);

router.post(

  "/bulk-upload",

  protect,

  upload.single("file"),

  bulkUploadEnquiries

);

/* ===========================
           DELETE
=========================== */

router.delete("/permanent-delete/:id",protect,permanentDeleteEnquiry);

router.delete("/:id",protect,deleteEnquiry);

export default router;