import { 

  // bus info
    createBusService,
    getAllBusService,
    getSingleBusService,
    updateBusService,
    deleteBusService,
    getDeletedBusService,
    restoreBusService,
    permanentDeleteBusService,


// bus driver function 
    createBusDriverService,
    getAllBusDriverService,
    getSingleBusDriverService,
    updateBusDriverService,
    deleteBusDriverService,
    getDeletedBusDriversService,
    restoreBusDriverService,
    permanentDeleteBusDriverService,


// bus route 
    createBusRouteService,
    getAllBusRouteService,
    getSingleBusRouteService,
    updateBusRouteService,
     deleteBusRouteService,
     getDeletedBusRouteService,
     restoreBusRouteService,
     permanentDeleteBusRouteService,


    //  std bus info 
bulkAssignStudentTransportService,
     getAllStudentTransportService,
      getSingleStudentTransportService,
      updateStudentTransportService,
      deleteStudentTransportService,
      restoreStudentTransportService,
      permanentDeleteStudentTransportService,

       getPrincipalInstitutionBusesService,
  getPrincipalBusDetailsService

} from "../transport/transport.service.js"





// create bus info function 
export const createBus = async (
  req,
  res
) => {
  try {
    const bus =
      await createBusService(
        req.body
      );

    return res.status(201).json({
      success: true,

      message:
        "Bus created successfully.",

      data: bus,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
// get all buses function
export const getAllBus = async (
  req,
  res
) => {
  try {
    const result =
      await getAllBusService(
        req.query
      );

  return res.status(200).json({
  success: true,

  message:
    result.totalRecords > 0
      ? "Bus records fetched successfully."
      : "No bus records found.",

  currentPage: result.currentPage,

  totalPages: result.totalPages,

  totalRecords: result.totalRecords,

  limit: result.limit,

  statistics: result.statistics,

  data: result.buses,
});
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
// get single bus info
export const getSingleBus =
  async (req, res) => {
    try {
      const bus =
        await getSingleBusService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus fetched successfully.",

        data: bus,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
// update bus info function 
export const updateBus =
  async (req, res) => {
    try {
      const bus =
        await updateBusService(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus updated successfully.",

        data: bus,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
// delete bus info function 
export const deleteBus = async (
  req,
  res
) => {
  try {
    const bus =
      await deleteBusService(
        req.params.id
      );

    return res.status(200).json({
      success: true,

      message:
        "Bus moved to recycle bin successfully.",

      data: bus,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
// FETCH ALL DELETED BUS
export const getDeletedBus =
  async (req, res) => {

    try {

      const result =
        await getDeletedBusService(
          req.query
        );

      return res.status(200).json({

        success: true,

        message:
          result.totalRecords > 0
            ? "Deleted buses fetched successfully."
            : "No deleted buses found.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data:
          result.buses,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
// restore function 
export const restoreBus =
  async (req, res) => {
    try {
      const bus =
        await restoreBusService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus restored successfully.",

        data: bus,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // delete the bus driver from the db 
  export const permanentDeleteBus =
  async (req, res) => {
    try {
      const result =
     await permanentDeleteBusService(
  req.params.id
);

      return res.status(200).json({
        success: true,
        message: result.message,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };









// bus driver 
// create bus driver funciton 
export const createBusDriver =
  async (req, res) => {

    try {

      const payload = {

        ...req.body,

        profileImage: req.file

          ? `/uploads/profile/${req.file.filename}`

          : null,

      };

      const driver =
        await createBusDriverService(
          payload
        );

      return res.status(201).json({

        success: true,

        message:
          "Bus driver created successfully.",

        data: driver,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message: error.message,

      });

    }

  };
  // get all bus driver function
  export const getAllBusDriver =
  async (req, res) => {
    try {
      const result =
        await getAllBusDriverService(
          req.query
        );

   return res.status(200).json({

  success: true,

  message:
    result.pagination
      .totalRecords > 0
      ? "Bus drivers fetched successfully."
      : "No bus drivers found.",

  statistics:
    result.statistics,

  pagination:
    result.pagination,

  data:
    result.drivers,

});
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // get single bus driver
  export const getSingleBusDriver =
  async (req, res) => {
    try {
      const driver =
        await getSingleBusDriverService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus driver fetched successfully.",

        data: driver,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
    // update bus driver 
// update bus driver
export const updateBusDriver = async (req, res) => {
  try {

    const payload = {
      ...req.body,
    };

    if (req.file) {
      payload.profileImage =
        `/uploads/profile/${req.file.filename}`;
    }

    const driver =
      await updateBusDriverService(
        req.params.id,
        payload
      );

    return res.status(200).json({
      success: true,
      message: "Bus driver updated successfully.",
      data: driver,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
  // delete bus driver 
export const deleteBusDriver =
  async (req, res) => {
    try {
      const driver =
        await deleteBusDriverService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus driver moved to recycle bin successfully.",

        data: driver,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
// FETCH DELETED BUS DRIVERS
export const getDeletedBusDrivers =
  async (req, res) => {

    try {

      const result =
        await getDeletedBusDriversService(
          req.query
        );

      return res.status(200).json({

        success: true,

        message:
          result.totalRecords > 0
            ? "Deleted bus drivers fetched successfully."
            : "No deleted bus drivers found.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data:
          result.drivers,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };

  // restore bus driver
  export const restoreBusDriver =
  async (req, res) => {
    try {
      const driver =
        await restoreBusDriverService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus driver restored successfully.",

        data: driver,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // delete peermanamtly 
  export const permanentDeleteBusDriver =
  async (req, res) => {
    try {
      await permanentDeleteBusDriverService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Bus driver permanently deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };






  // bus route 
  // create bus info 
  export const createBusRoute =
  async (req, res) => {
    try {
      const route =
        await createBusRouteService(
          req.body
        );

      return res.status(201).json({
        success: true,

        message:
          "Bus route created successfully.",

        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // get all buses 
  export const getAllBusRoute =
  async (req, res) => {
    try {
      const result =
        await getAllBusRouteService(
          req.query
        );

 return res.status(200).json({

  success: true,

  message:
    result.totalRecords > 0
      ? "Bus routes fetched successfully."
      : "No bus routes found.",

  statistics:
    result.statistics,

  currentPage:
    result.currentPage,

  totalPages:
    result.totalPages,

  totalRecords:
    result.totalRecords,

  limit:
    result.limit,

  data:
    result.routes,

});
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // get single bus route
export const getSingleBusRoute =
  async (req, res) => {
    try {
      const route =
        await getSingleBusRouteService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus route fetched successfully.",

        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // update bus route function 
export const updateBusRoute =
  async (req, res) => {
    try {
      const route =
        await updateBusRouteService(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus route updated successfully.",

        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // delete bus route function 
export const deleteBusRoute =
  async (req, res) => {
    try {
      const route =
        await deleteBusRouteService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus route moved to recycle bin successfully.",

        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // FETCH ALL DELETED BUS ROUTES
export const getDeletedBusRoute =
  async (req, res) => {

    try {

      const result =
        await getDeletedBusRouteService(
          req.query
        );

      return res.status(200).json({

        success: true,

        message:
          result.totalRecords > 0
            ? "Deleted bus routes fetched successfully."
            : "No deleted bus routes found.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data:
          result.routes,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // restore bus route function 
export const restoreBusRoute =
  async (req, res) => {
    try {
      const route =
        await restoreBusRouteService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Bus route restored successfully.",

        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // delete from db bus route function 
export const permanentDeleteBusRoute =
  async (req, res) => {
    try {
      await permanentDeleteBusRouteService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Bus route permanently deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };












// bulk assign student transport
export const bulkAssignStudentTransport =
async (req,res)=>{

  try{

    const result =
      await bulkAssignStudentTransportService(
        req.body
      );

    return res.status(201).json({

      success:true,

      message:
        `${result.assignedCount} student(s) assigned successfully.`,

      assignedCount:
        result.assignedCount,

      failedCount:
        result.failedCount,

      failedStudents:
        result.failedStudents,

    });

  }catch(error){

    return res.status(400).json({

      success:false,

      message:error.message,

    });

  }

};
    // get all std businfo
    export const getAllStudentTransport =
  async (req, res) => {
    try {
      const result =
        await getAllStudentTransportService(
          req.query
        );

      return res.status(200).json({
        success: true,

        message:
          "Student transport records fetched successfully.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data: result.data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // get single std businfo 
  export const getSingleStudentTransport =
  async (req, res) => {
    try {
      const transport =
        await getSingleStudentTransportService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Student transport details fetched successfully.",

        data: transport,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // update std businfo 
export const updateStudentTransport =
  async (req, res) => {
    try {
      const transport =
        await updateStudentTransportService(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,

        message:
          "Student transport updated successfully.",

        data: transport,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // delete std businfo
  export const deleteStudentTransport =
  async (req, res) => {
    try {
      const transport =
        await deleteStudentTransportService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Student transport moved to recycle bin successfully.",

        data: transport,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // restore std businfo 
  export const restoreStudentTransport =
  async (req, res) => {
    try {
      const transport =
        await restoreStudentTransportService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Student transport restored successfully.",

        data: transport,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }
  };
  // delete std businfo permanantly from  db
  export const permanentDeleteStudentTransport =
  async (req, res) => {
    try {
      await permanentDeleteStudentTransportService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Student transport record permanently deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };






// ==========================================================
// GET PRINCIPAL INSTITUTION BUSES
// ==========================================================

export const getPrincipalInstitutionBuses =
  async (
    req,
    res
  ) => {

    try {

      // ======================================================
      // INSTITUTION FROM JWT
      // ======================================================

      const institutionId =
        req.user.institution;


      // ======================================================
      // SERVICE
      // ======================================================

      const buses =
        await getPrincipalInstitutionBusesService({
          institutionId,
        });


      // ======================================================
      // RESPONSE
      // ======================================================

      return res.status(200).json({

        success: true,

        count:
          buses.length,

        data:
          buses,

      });

    } catch (error) {

      console.error(
        "GET PRINCIPAL INSTITUTION BUSES ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


  // ==========================================================
// GET SELECTED BUS DETAILS
// ==========================================================



/*
============================================================
PRINCIPAL — GET BUS DETAILS
============================================================
*/



export const getPrincipalBusDetails = async (
  req,
  res
) => {
  try {
    // ========================================================
    // GET INSTITUTION FROM LOGGED-IN USER
    // ========================================================

    const institutionId =
      req.user?.institution;

    // ========================================================
    // GET BUS ID FROM URL
    // ========================================================

    const { busId } =
      req.params;

    // ========================================================
    // VALIDATE INSTITUTION
    // ========================================================

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message:
          "Institution not found for this user",
      });
    }

    // ========================================================
    // VALIDATE BUS ID
    // ========================================================

    if (!busId) {
      return res.status(400).json({
        success: false,
        message:
          "Bus ID is required",
      });
    }

    // ========================================================
    // CALL SERVICE
    // ========================================================

    const result =
      await getPrincipalBusDetailsService({
        institutionId,
        busId,
      });

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    // ========================================================
    // ERROR LOG
    // ========================================================

    console.error(
      "GET PRINCIPAL BUS DETAILS ERROR:",
      error
    );

    // ========================================================
    // ERROR RESPONSE
    // ========================================================

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch bus details",
    });
  }
};