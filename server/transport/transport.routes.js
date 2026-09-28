import express from "express";

import {
createBus,
getAllBus,
getSingleBus,
updateBus,
deleteBus,
getDeletedBus,
restoreBus,
permanentDeleteBus,


// bus driver 
createBusDriver,
getAllBusDriver,
getSingleBusDriver,
updateBusDriver,
getDeletedBusDrivers,
deleteBusDriver,
restoreBusDriver,
permanentDeleteBusDriver,

//  bus route 
createBusRoute,
getAllBusRoute,
 getSingleBusRoute,
 updateBusRoute,
 deleteBusRoute,
 getDeletedBusRoute,
 restoreBusRoute,
 permanentDeleteBusRoute,


//  std bus info
bulkAssignStudentTransport,
getAllStudentTransport,
getSingleStudentTransport,
updateStudentTransport,
deleteStudentTransport,
restoreStudentTransport,
  getPrincipalInstitutionBuses,
  getPrincipalBusDetails,

permanentDeleteStudentTransport




} from "./transport.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {profileUpload} from "../middleware/upload.middleware.js"

const router = express.Router();


  
// create bus function 
router.post("/bus",createBus);
// Get All Bus
router.get("/bus",getAllBus);
// FETCH ALL DELETED BUS
router.get("/bus/recycle-bin",getDeletedBus);
// get single bus info 
router.get( "/bus/:id",getSingleBus);
// update bus info 
router.put( "/bus/:id",updateBus);
// delete bus info 
router.delete( "/bus/:id",deleteBus);
// Restore Bus
router.put("/bus/:id/restore",restoreBus);
// delete bus info from db
router.delete("/bus/:id/permanent",permanentDeleteBus);


// ==========================================================
// PRINCIPAL TRANSPORTATION
// ==========================================================

router.get(

  "/principal/buses",

  protect,

  // authorize("teaching_faculty"),

  getPrincipalInstitutionBuses

);


router.get(

  "/principal/bus/:busId",

  protect,

  // authorize("teaching_faculty"),

  getPrincipalBusDetails

);




router.post("/bus-driver",profileUpload.single("profileImage"),
  createBusDriver
);
// get all bus driver 
router.get("/bus-driver",getAllBusDriver);
// FETCH DELETED BUS DRIVERS
router.get(
  "/bus-driver/recycle-bin",
  getDeletedBusDrivers
);

// get single bus driver info 
router.get("/bus-driver/:id",getSingleBusDriver);
  // update bus driver 
router.put("/bus-driver/:id",profileUpload.single("profileImage"),updateBusDriver);
  // delete bus driver 
router.delete("/bus-driver/:id",deleteBusDriver);
// restore bus driver
router.put("/bus-driver/:id/restore",restoreBusDriver);
// delete permanamtly 
router.delete("/bus-driver/:id/permanent",permanentDeleteBusDriver);


// bus route 
// create bus route
router.post("/bus-route",createBusRoute);
// Fetch Deleted Bus Routes
router.get(
  "/bus-route/recycle-bin",
  getDeletedBusRoute
);
// get all bus route
router.get("/bus-route",getAllBusRoute);
// get single bus route 
router.get("/bus-route/:id",getSingleBusRoute);
  // update bus route function 
router.put("/bus-route/:id",updateBusRoute);
  // delete bus route function 
router.delete("/bus-route/:id",deleteBusRoute);

  // restore bus route function 
router.put("/bus-route/:id/restore",restoreBusRoute);
  // delete from db bus route function 
router.delete("/bus-route/:id/permanent",permanentDeleteBusRoute);



// std bus info 
// bulk assign students
router.post(
  "/student-transport/bulk",
  bulkAssignStudentTransport
);
  // get all std businfo
  router.get("/student-transport",getAllStudentTransport);
  // get single std businfo 
  router.get("/student-transport/:id",getSingleStudentTransport);
  // update std businfo 
  router.put("/student-transport/:id",updateStudentTransport);
  // delete std businfo
  router.delete("/student-transport/:id",deleteStudentTransport);
  // restore std businfo 
  router.put("/student-transport/:id/restore",restoreStudentTransport);
  // delete std businfo permanantly from  db
router.delete("/student-transport/:id/permanent",permanentDeleteStudentTransport);





export default router;

