import express from "express";

import {
  createAcademicCalendar,
  getAcademicCalendars,
  updateAcademicCalendar,
  deleteAcademicCalendar,
  restoreAcademicCalendar,
  deleteAcademicCalendarFromDB,


  uploadCalendarEvents,
  getCalendarEvents,
  updateCalendarEvents,
  deleteCalendarEvents
} from "./controller.js";

 import{ authorize ,authorizeDesignation} from "../middleware/role.middleware.js"
import { protect  } from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";
import {
  calendarUpload
} from "../middleware/upload.middleware.js";

const router = express.Router();







// Create Academic Calendar
router.post("/",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),createAcademicCalendar);
  // get calendar by institution id 
router.get("/",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),getAcademicCalendars);
  // restore acc calendar function 
router.put("/restore/:id",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),restoreAcademicCalendar);
// update function of calender
router.put("/:id",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),updateAcademicCalendar);
// delete calendar from db
router.delete("/permanent/:id",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),deleteAcademicCalendarFromDB);
  // delete acc calendar function 
router.delete("/:id",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),deleteAcademicCalendar);






// post events 
router.post("/event/upload",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),calendarUpload.single("file"),uploadCalendarEvents);
// get events 
router.get("/event/:calendarId",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),getCalendarEvents );
// update  event from calender
router.put("/event/upload",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),calendarUpload.single("file"),updateCalendarEvents);
// delete event from calender
router.delete("/event/:calendarId",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),deleteCalendarEvents);


export default router;