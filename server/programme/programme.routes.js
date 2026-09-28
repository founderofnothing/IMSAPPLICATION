import express from "express";

import {
  createProgramme,
  getAllProgrammes,
  updateProgramme,
  deleteProgramme,
  getDeletedProgrammes,
  restoreProgramme,
  permanentDeleteProgramme,
  getProgrammesByDepartment,
  getMyDepartmentProgrammes,
  getInstitutionProgrammesWithStudentCount,
  getProgrammeDetails
} from "./programme.controller.js";
import {protect} from "../middleware/auth.middleware.js"
import  { authorize} from "../middleware/role.middleware.js"
const router = express.Router();


router.get(
  "/principal/institution",
  protect,
  authorize("teaching_faculty"),
  getInstitutionProgrammesWithStudentCount
);

router.get(
  "/:id/details",
  protect,
  
  getProgrammeDetails
);


// Create
router.post("/", createProgramme);
// Read
router.get("/deleted", getDeletedProgrammes);
// get the programme by dpt id 
router.get("/department/:departmentId",getProgrammesByDepartment);

router.get(
  "/my-department",
  protect,
  getMyDepartmentProgrammes
);
// get all programme
router.get("/", getAllProgrammes);
// Update
router.put("/:id", updateProgramme);
// restore the programme
router.patch("/restore/:id",restoreProgramme);
// Delete
router.delete("/permanent-delete/:id",permanentDeleteProgramme);
// delete from the db
router.delete("/:id", deleteProgramme);

export default router;