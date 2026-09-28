import express from "express";


import {
  createTimetable,
  getTimetableByClass,
  getFacultyTimetable,
  updateTimetable,
  deleteTimetable
} from "./timetable.controller.js";

 import{ authorize ,authorizeDesignation} from "../middleware/role.middleware.js"
import { protect  } from "../middleware/auth.middleware.js";
const router = express.Router();

// create class time table 

router.post(
  "/",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("hod"),
  createTimetable
);


// =====================================================
// GET FACULTY WORKING HOURS
// =====================================================

router.get(

  "/faculty/:facultyId",

  protect,

  authorize("teaching_faculty"),

  getFacultyTimetable

);

router.get(
  "/class/:classId",
    protect,
  authorize("teaching_faculty"),
  authorizeDesignation("hod"),
  getTimetableByClass
);

router.put(
  "/:id",
    protect,
  authorize("teaching_faculty"),
  authorizeDesignation("hod"),
  updateTimetable
);


router.delete(
  "/:id",
      protect,
  authorize("teaching_faculty"),
  authorizeDesignation("hod"),
  deleteTimetable
);


//Get All Timetables
// router.get("/",getAllTimetables);

//    Get Timetable By Class
// router.get("/class/:classId", getTimetableByClass);

//    Get Single Timetable
// router.get("/:id",getSingleTimetable);

//    Update Timetable
// router.put("/:id",updateTimetable);

//    Soft Delete Timetable
// router.delete( "/:id",deleteTimetable);

//Restore Timetable
// router.put("/restore/:id",restoreTimetable);

//    Permanent Delete Timetable
// router.delete("/permanent/:id",deleteTimetablePermanently);

export default router;