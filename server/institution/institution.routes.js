import express from "express";
import {
 createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution,

  getDeletedInstitutions,
  restoreInstitution,
  permanentDeleteInstitution,

  getMyInstitution,

  getDepartmentsByInstitution,

} from "./institution.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();





// CREATE
router.post("/",createInstitution);
// READ
// get all deleted int from recycle bin
router.get("/deleted",getDeletedInstitutions);
// get my institution from jwt
router.get("/my-institution",protect,getMyInstitution);
// get insutitution department
router.get("/institution/:institutionId",getDepartmentsByInstitution);
// get all insitution
router.get("/",getAllInstitutions);
// get single insitution by id
router.get("/:id",getInstitutionById);
// UPDATE
router.put("/:id",updateInstitution);
// restore the insitution
router.patch("/restore/:id",restoreInstitution);
// DELETE
// delete from the db
router.delete("/permanent-delete/:id",permanentDeleteInstitution);
// delete the insitutipn
router.delete("/:id",deleteInstitution);


export default router;

