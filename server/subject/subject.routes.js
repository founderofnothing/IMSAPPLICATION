import express from "express";
import {protect } from "../middleware/auth.middleware.js"
import {

  createProgrammeStructure,
addSemester,
removeSemester,
getProgrammeStructure,
  createSubject,
  getSubjects,
   updateSubject,
    deleteSubject,
    restoreSubject,
    getDeletedSubjects,
    getProgrammeBatches,
  permanentDeleteSubject,
  updateCurrentSemester,
  getCurrentSemesterSubjects

} from "./subject.controller.js";

const router = express.Router();


// router.post(
//   "/",
//   protect,
//   createProgrammeStructurej
// );

router.post(
  "/create-structure",
  (req, res, next) => {

    console.log(
      "CREATE STRUCTURE ROUTE REACHED"
    );

    next();

  },
  protect,
  createProgrammeStructure
);

router.patch(
  "/:programmeId/add-semester",
   protect,
  addSemester
);

router.patch(
  "/:programmeId/remove-semester",
   protect,
  removeSemester
);


router.get(
  "/programme/:programmeId",
   protect,
  getProgrammeStructure
);


router.get(
  "/programme/:programmeId/batches",
  protect,
  getProgrammeBatches
);

router.patch(
  "/:programmeId/batch/:batchId/current-semester",
  protect,
  updateCurrentSemester
);



router.post(
  "/create",
    protect,
  createSubject
);

router.get(
  "/getsubject/programme/:programmeId/study-year/:studyYear/semester/:semesterNumber",
    protect,
  getSubjects
);

router.put(
  "/update/:id",
  protect,
  updateSubject
);

router.get(
  "/:classId/current-subjects",
  protect,
  getCurrentSemesterSubjects
);

router.delete(
  "/delete/:id",
    protect,
  deleteSubject
);

router.patch(
  "/restore/:id",
  protect,
  restoreSubject
);

router.get(
  "/deleted",
  protect,
  getDeletedSubjects
);

router.delete(
  "/permanent/:id",
  protect,
  permanentDeleteSubject
);



export default router;