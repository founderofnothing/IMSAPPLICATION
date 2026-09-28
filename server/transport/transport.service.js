import Bus from "../transport/models/bus.model.js"
import BusDriver from "../transport/models/busDriver.model.js";
import BusRoute from "../transport/models/busRoute.model.js";
import StudentTransport from "../transport/models/studentTransport.model.js"
import Student from "../student/student.model.js"
import mongoose from "mongoose";




// bus create function 
export const createBusService = async (
  busData
) => {
  // Check duplicate bus number
  const existingBusNumber =
    await Bus.findOne({
      busNumber: busData.busNumber,
    });

  if (existingBusNumber) {
    throw new Error(
      "Bus number already exists."
    );
  }

  // Check duplicate registration number
  const existingRegistration =
    await Bus.findOne({
      registrationNumber:
        busData.registrationNumber,
    });

  if (existingRegistration) {
    throw new Error(
      "Registration number already exists."
    );
  }

  // Check duplicate chassis number
  if (busData.chassisNumber) {
    const existingChassis =
      await Bus.findOne({
        chassisNumber:
          busData.chassisNumber,
      });

    if (existingChassis) {
      throw new Error(
        "Chassis number already exists."
      );
    }
  }

  // Validate driver
  if (busData.driverId) {
    const driver =
      await BusDriver.findById(
        busData.driverId
      );

    if (!driver) {
      throw new Error(
        "Driver not found."
      );
    }
  }

  const bus =
    await Bus.create(busData);

  return bus;
};
// get all bus function
// get all bus function
export const getAllBusService = async (query) => {

  const {
    page = 1,
    limit = 10,
    search = "",
    status,
  } = query;

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  const filter = {
    isDeleted: false,
  };

  // -------------------------
  // Status Filter
  // -------------------------

  if (status) {
    filter.status = status;
  }

  // -------------------------
  // Fetch Buses
  // -------------------------

  const buses = await Bus.find(filter)
    .populate(
      "driverId",
      "employeeId driverName mobileNumber"
    )
    .sort({ createdAt: -1 });

  // -------------------------
  // Attach Route Info
  // -------------------------

  const formattedBus = await Promise.all(

    buses.map(async (bus) => {

   const route = await BusRoute.findOne({
  assignedBuses: bus._id,
}).select("_id routeName routeCode");

      return {
        ...bus.toObject(),
        route,
      };

    })

  );

  // -------------------------
  // Search
  // -------------------------

  const filteredBus = search

    ? formattedBus.filter((bus) => {

        const keyword = search.toLowerCase();

        return (

          bus.busNumber?.toLowerCase().includes(keyword) ||

          bus.registrationNumber?.toLowerCase().includes(keyword) ||

          bus.chassisNumber?.toLowerCase().includes(keyword) ||

          bus.busName?.toLowerCase().includes(keyword) ||

          bus.route?.routeName?.toLowerCase().includes(keyword) ||

          bus.route?.routeCode?.toLowerCase().includes(keyword)

        );

      })

    : formattedBus;

  // -------------------------
  // Pagination
  // -------------------------

  const totalRecords = filteredBus.length;

  const paginatedBus = filteredBus.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit
  );

  // -------------------------
  // Statistics
  // -------------------------

  const totalBus = await Bus.countDocuments({
    isDeleted: false,
  });

  const activeBus = await Bus.countDocuments({
    isDeleted: false,
    status: "Active",
  });

  const totalRoutes = await BusRoute.countDocuments({
    isDeleted: false,
  });

  // -------------------------
  // Return
  // -------------------------

  return {

    currentPage,

    totalPages: Math.ceil(
      totalRecords / pageLimit
    ),

    totalRecords,

    limit: pageLimit,

    statistics: {
      totalBus,
      activeBus,
      totalRoutes,
    },

    buses: paginatedBus,

  };

};
// get single bus info 
export const getSingleBusService = async (
  busId
) => {
  // Validate ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(
      busId
    )
  ) {
    throw new Error(
      "Invalid bus ID."
    );
  }

  // Find Bus
const bus = await Bus.findOne({
  _id: busId,
  isDeleted: false,
}).populate(
  "driverId",
  "employeeId driverName mobileNumber"
);

  if (!bus) {
    throw new Error(
      "Bus not found."
    );
  }

  // Fetch Route
const route =
  await BusRoute.findOne({
    assignedBuses: bus._id,
  }).select(
    "_id routeName routeCode stops totalDistance estimatedTravelTime status"
  );

  return {
    ...bus.toObject(),
    route,
  };
};
// update bus info function 
export const updateBusService = async (
  busId,
  updateData
) => {
  // Validate ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(
      busId
    )
  ) {
    throw new Error(
      "Invalid bus ID."
    );
  }

  // Check bus exists
const existingBus =
  await Bus.findOne({
    _id: busId,
    isDeleted: false,
  });

  if (!existingBus) {
    throw new Error(
      "Bus not found."
    );
  }

  // Check duplicate bus number
  if (updateData.busNumber) {
    const duplicateBus =
      await Bus.findOne({
        busNumber:
          updateData.busNumber,
        _id: { $ne: busId },
      });

    if (duplicateBus) {
      throw new Error(
        "Bus number already exists."
      );
    }
  }

  // Check duplicate registration number
  if (
    updateData.registrationNumber
  ) {
    const duplicateRegistration =
      await Bus.findOne({
        registrationNumber:
          updateData.registrationNumber,
        _id: { $ne: busId },
      });

    if (
      duplicateRegistration
    ) {
      throw new Error(
        "Registration number already exists."
      );
    }
  }

  // Check duplicate chassis number
  if (
    updateData.chassisNumber
  ) {
    const duplicateChassis =
      await Bus.findOne({
        chassisNumber:
          updateData.chassisNumber,
        _id: { $ne: busId },
      });

    if (
      duplicateChassis
    ) {
      throw new Error(
        "Chassis number already exists."
      );
    }
  }

  // Validate driver
  if (updateData.driverId) {
    const driver =
      await BusDriver.findById(
        updateData.driverId
      );

    if (!driver) {
      throw new Error(
        "Driver not found."
      );
    }

    const assignedBus =
      await Bus.findOne({
        driverId:
          updateData.driverId,
        _id: { $ne: busId },
      });

    if (assignedBus) {
      throw new Error(
        "This driver is already assigned to another bus."
      );
    }
  }

  const updatedBus =
    await Bus.findByIdAndUpdate(
      busId,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate(
      "driverId",
      "employeeId driverName mobileNumber"
    );

  return updatedBus;
};
// delete bus info function 
export const deleteBusService = async (
  busId
) => {
  // Validate ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(
      busId
    )
  ) {
    throw new Error(
      "Invalid bus ID."
    );
  }

  // Check Bus Exists
  const bus = await Bus.findOne({
    _id: busId,
    isDeleted: false,
  });

  if (!bus) {
    throw new Error(
      "Bus not found."
    );
  }

  // Soft Delete
  const deletedBus =
    await Bus.findByIdAndUpdate(
      busId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

  return deletedBus;
};


  // get all deleted bus info 
  // FETCH ALL DELETED BUSS
export const getDeletedBusService = async (
  query
) => {

  const {
    page = 1,
    limit = 10,
    search = "",
    vehicleType,
    fuelType,
    status,
  } = query;

  const currentPage =
    Number(page);

  const pageLimit =
    Number(limit);

  // -------------------------
  // Base Filter
  // -------------------------

  const filter = {
    isDeleted: true,
  };

  // -------------------------
  // Search
  // -------------------------

  if (search) {

    filter.$or = [

      {
        busNumber: {
          $regex: search,
          $options: "i",
        },
      },

      {
        registrationNumber: {
          $regex: search,
          $options: "i",
        },
      },

      {
        busName: {
          $regex: search,
          $options: "i",
        },
      },

    ];

  }

  // -------------------------
  // Filters
  // -------------------------

  if (vehicleType) {
    filter.vehicleType =
      vehicleType;
  }

  if (fuelType) {
    filter.fuelType =
      fuelType;
  }

  if (status) {
    filter.status =
      status;
  }

  // -------------------------
  // Count
  // -------------------------

  const totalRecords =
    await Bus.countDocuments(
      filter
    );

  // -------------------------
  // Fetch Deleted Buses
  // -------------------------

  const buses =
    await Bus.find(filter)
      .populate(
        "driverId",
        "driverName employeeId profileImage"
      )
      .sort({
        deletedAt: -1,
      })
      .skip(
        (currentPage - 1) *
          pageLimit
      )
      .limit(pageLimit);

  return {

    currentPage,

    totalPages:
      Math.ceil(
        totalRecords /
          pageLimit
      ),

    totalRecords,

    limit:
      pageLimit,

    buses,

  };

};
// restore function
export const restoreBusService = async (
  busId
) => {
  // Validate ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(
      busId
    )
  ) {
    throw new Error(
      "Invalid bus ID."
    );
  }

  // Find deleted bus
  const bus = await Bus.findOne({
    _id: busId,
    isDeleted: true,
  });

  if (!bus) {
    throw new Error(
      "Deleted bus not found."
    );
  }

  // Restore
  const restoredBus =
    await Bus.findByIdAndUpdate(
      busId,
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

  return restoredBus;
};
// delete the bus  from the db
export const permanentDeleteBusService =
  async (busId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        busId
      )
    ) {
      throw new Error(
        "Invalid bus ID."
      );
    }

    // Find deleted bus
    const bus = await Bus.findOne({
      _id: busId,
      isDeleted: true,
    });

    if (!bus) {
      throw new Error(
        "Deleted bus not found."
      );
    }

    // Permanently Delete
    await Bus.findByIdAndDelete(busId);

    return {
      message:
        "Bus permanently deleted successfully.",
    };
  };








  // BUS DRIVER 
// create bus driver 
export const createBusDriverService =
  async (driverData) => {
    // Normalize Input
    driverData.employeeId =
      driverData.employeeId?.trim();

    driverData.licenceNumber =
      driverData.licenceNumber?.trim();

    driverData.mobileNumber =
      driverData.mobileNumber?.trim();

    driverData.alternateMobileNumber =
      driverData.alternateMobileNumber?.trim();

    driverData.driverName =
      driverData.driverName?.trim();

    driverData.email =
      driverData.email
        ?.trim()
        .toLowerCase();

    // Check Employee ID
    const existingEmployee =
      await BusDriver.findOne({
        employeeId:
          driverData.employeeId,
        isDeleted: {
          $ne: true,
        },
      });

    if (existingEmployee) {
      throw new Error(
        "Employee ID already exists."
      );
    }

    // Check Licence Number
    const existingLicence =
      await BusDriver.findOne({
        licenceNumber:
          driverData.licenceNumber,
        isDeleted: {
          $ne: true,
        },
      });

    if (existingLicence) {
      throw new Error(
        "Licence number already exists."
      );
    }

    // Check Email (Optional)
    if (driverData.email) {
      const existingEmail =
        await BusDriver.findOne({
          email: driverData.email,
          isDeleted: {
            $ne: true,
          },
        });

      if (existingEmail) {
        throw new Error(
          "Email already exists."
        );
      }
    }

    // Create Driver
    const driver =
      await BusDriver.create(
        driverData
      );

    return driver;
  };
  // get all bus driver 
export const getAllBusDriverService =
  async (query) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      bloodGroup,
      gender,
      status,
      licenceType,
    } = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    // Base Filter
    const filter = {
      isDeleted: {
        $ne: true,
      },
    };

    // -------------------------
    // Search
    // -------------------------

    if (search) {
      filter.$or = [
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },

        {
          driverName: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // -------------------------
    // Filters
    // -------------------------

    if (bloodGroup) {
      filter.bloodGroup =
        bloodGroup;
    }

    if (gender) {
      filter.gender = gender;
    }

    if (status) {
      filter.status = status;
    }

    if (licenceType) {
      filter.licenceType =
        licenceType;
    }

    // -------------------------
    // Count
    // -------------------------

    const totalRecords =
      await BusDriver.countDocuments(
        filter
      );

    // -------------------------
    // Fetch Drivers
    // -------------------------

    const drivers =
      await BusDriver.find(filter)
        .select(
          "-communicationAddress -permanentAddress"
        )
        .skip(
          (currentPage - 1) *
            pageLimit
        )
        .limit(pageLimit)
        .sort({
          createdAt: -1,
        });

   // -------------------------
// Statistics
// -------------------------

const activeDrivers =
  await BusDriver.countDocuments({
    ...filter,
    status: "Active",
  });

const inactiveDrivers =
  await BusDriver.countDocuments({
    ...filter,
    status: "Inactive",
  });

const onLeaveDrivers =
  await BusDriver.countDocuments({
    ...filter,
    status: "On Leave",
  });

const resignedDrivers =
  await BusDriver.countDocuments({
    ...filter,
    status: "Resigned",
  });

return {

  statistics: {

    totalDrivers:
      totalRecords,

    activeDrivers,

    inactiveDrivers,

    onLeaveDrivers,

    resignedDrivers,

  },

  pagination: {

    currentPage,

    totalPages: Math.ceil(
      totalRecords /
        pageLimit
    ),

    totalRecords,

    limit: pageLimit,

  },

  drivers,

};
  };
  // get single driver
  export const getSingleBusDriverService =
  async (driverId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        driverId
      )
    ) {
      throw new Error(
        "Invalid bus driver ID."
      );
    }

    // Find Driver
    const driver =
      await BusDriver.findOne({
        _id: driverId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!driver) {
      throw new Error(
        "Bus driver not found."
      );
    }

    return driver;
  };


  // fetch busses by route


  // update bus driver 
export const updateBusDriverService =
  async (
    driverId,
    updateData
  ) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        driverId
      )
    ) {
      throw new Error(
        "Invalid bus driver ID."
      );
    }

    // Check Driver Exists
    const existingDriver =
      await BusDriver.findOne({
        _id: driverId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingDriver) {
      throw new Error(
        "Bus driver not found."
      );
    }

    // Normalize Input
    if (
      updateData.employeeId
    ) {
      updateData.employeeId =
        updateData.employeeId.trim();
    }

    if (
      updateData.driverName
    ) {
      updateData.driverName =
        updateData.driverName.trim();
    }

    if (
      updateData.mobileNumber
    ) {
      updateData.mobileNumber =
        updateData.mobileNumber.trim();
    }

    if (
      updateData.alternateMobileNumber
    ) {
      updateData.alternateMobileNumber =
        updateData.alternateMobileNumber.trim();
    }

    if (
      updateData.licenceNumber
    ) {
      updateData.licenceNumber =
        updateData.licenceNumber.trim();
    }

    if (
      updateData.email
    ) {
      updateData.email =
        updateData.email
          .trim()
          .toLowerCase();
    }

    // Employee ID Check
    if (
      updateData.employeeId
    ) {
      const duplicateEmployee =
        await BusDriver.findOne({
          employeeId:
            updateData.employeeId,
          _id: {
            $ne: driverId,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        duplicateEmployee
      ) {
        throw new Error(
          "Employee ID already exists."
        );
      }
    }

    // Licence Number Check
    if (
      updateData.licenceNumber
    ) {
      const duplicateLicence =
        await BusDriver.findOne({
          licenceNumber:
            updateData.licenceNumber,
          _id: {
            $ne: driverId,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        duplicateLicence
      ) {
        throw new Error(
          "Licence number already exists."
        );
      }
    }

    // Email Check
    if (
      updateData.email
    ) {
      const duplicateEmail =
        await BusDriver.findOne({
          email:
            updateData.email,
          _id: {
            $ne: driverId,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        duplicateEmail
      ) {
        throw new Error(
          "Email already exists."
        );
      }
    }

    // Update Driver
const updatedDriver =
  await BusDriver.findByIdAndUpdate(
    driverId,
    {

      ...updateData,

      ...(updateData.profileImage && {
        profileImage:
          updateData.profileImage,
      }),

    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

    return updatedDriver;
  };
  // delete bus driver 
export const deleteBusDriverService =
  async (driverId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        driverId
      )
    ) {
      throw new Error(
        "Invalid bus driver ID."
      );
    }

    // Check Driver Exists
    const existingDriver =
      await BusDriver.findOne({
        _id: driverId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingDriver) {
      throw new Error(
        "Bus driver not found."
      );
    }

    // Soft Delete
    const deletedDriver =
      await BusDriver.findOneAndUpdate(
        {
          _id: driverId,
          isDeleted: {
            $ne: true,
          },
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          returnDocument: "after",
        }
      );

    return deletedDriver;
  };
// FETCH ALL DELETED BUS DRIVERS
export const getDeletedBusDriversService =
  async (query) => {

    const {
      page = 1,
      limit = 10,
      search = "",
      bloodGroup,
      gender,
      status,
      licenceType,
    } = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    const filter = {
      isDeleted: true,
    };

    // -------------------------
    // Search
    // -------------------------

    if (search) {

      filter.$or = [

        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },

        {
          driverName: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

      ];

    }

    // -------------------------
    // Filters
    // -------------------------

    if (bloodGroup) {
      filter.bloodGroup =
        bloodGroup;
    }

    if (gender) {
      filter.gender =
        gender;
    }

    if (status) {
      filter.status =
        status;
    }

    if (licenceType) {
      filter.licenceType =
        licenceType;
    }

    // -------------------------
    // Count
    // -------------------------

    const totalRecords =
      await BusDriver.countDocuments(
        filter
      );

    // -------------------------
    // Fetch Drivers
    // -------------------------

    const drivers =
      await BusDriver.find(filter)
        .select(
          "-communicationAddress -permanentAddress"
        )
        .sort({
          deletedAt: -1,
        })
        .skip(
          (currentPage - 1) *
            pageLimit
        )
        .limit(pageLimit);

    return {

      currentPage,

      totalPages:
        Math.ceil(
          totalRecords /
            pageLimit
        ),

      totalRecords,

      limit: pageLimit,

      drivers,

    };

  };

  // restore dus driver
  export const restoreBusDriverService =
  async (driverId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        driverId
      )
    ) {
      throw new Error(
        "Invalid bus driver ID."
      );
    }

    // Find Deleted Driver
    const driver =
      await BusDriver.findOne({
        _id: driverId,
        isDeleted: true,
      });

    if (!driver) {
      throw new Error(
        "Deleted bus driver not found."
      );
    }

    // Restore Driver
    const restoredDriver =
      await BusDriver.findOneAndUpdate(
        {
          _id: driverId,
          isDeleted: true,
        },
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    return restoredDriver;
  };
  // delete premanantly 
  export const permanentDeleteBusDriverService =
  async (driverId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        driverId
      )
    ) {
      throw new Error(
        "Invalid bus driver ID."
      );
    }

    // Check Driver Exists in Recycle Bin
    const driver =
      await BusDriver.findOne({
        _id: driverId,
        isDeleted: true,
      });

    if (!driver) {
      throw new Error(
        "Deleted bus driver not found."
      );
    }

    // Permanently Delete
    await BusDriver.findByIdAndDelete(
      driverId
    );

    return;
  };







  // BUS ROUTE
// create bus route 
export const createBusRouteService =
  async (routeData) => {
    // Normalize Input
    routeData.routeName =
      routeData.routeName?.trim();

    routeData.routeCode =
      routeData.routeCode?.trim();

    routeData.remarks =
      routeData.remarks?.trim();

    // Check Route Name
    const existingRouteName =
      await BusRoute.findOne({
        routeName:
          routeData.routeName,
        isDeleted: {
          $ne: true,
        },
      });

    if (existingRouteName) {
      throw new Error(
        "Route name already exists."
      );
    }

    // Check Route Code
    const existingRouteCode =
      await BusRoute.findOne({
        routeCode:
          routeData.routeCode,
        isDeleted: {
          $ne: true,
        },
      });

    if (existingRouteCode) {
      throw new Error(
        "Route code already exists."
      );
    }

    // Validate Assigned Buses
    if (
      routeData.assignedBuses &&
      routeData.assignedBuses.length > 0
    ) {
      const buses =
        await Bus.find({
          _id: {
            $in: routeData.assignedBuses,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        buses.length !==
        routeData.assignedBuses.length
      ) {
        throw new Error(
          "One or more selected buses are invalid."
        );
      }
    }

    // Create Route
    const route =
      await BusRoute.create(
        routeData
      );

    return route;
  };
  // get all buses route
  export const getAllBusRouteService =
  async (query) => {
 const {
  page = 1,
  limit = 10,
  search = "",
  status,
  busId,
} = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    // Base Filter
const filter = {
  isDeleted: {
    $ne: true,
  },
};

// Search
if (search) {
  filter.$or = [
    {
      routeName: {
        $regex: search,
        $options: "i",
      },
    },
    {
      routeCode: {
        $regex: search,
        $options: "i",
      },
    },
  ];
}

// Status
if (status) {
  filter.status = status;
}

// Assigned Bus
if (busId) {
  filter.assignedBuses = busId;
}

    // Total Count
    const totalRecords =
      await BusRoute.countDocuments(
        filter
      );

    // Fetch Routes
    const routes =
      await BusRoute.find(filter)
        .populate(
          "assignedBuses",
          "busNumber"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (currentPage - 1) *
            pageLimit
        )
        .limit(pageLimit);

    // Custom Response
    const formattedRoutes =
      routes.map((route) => ({
        _id: route._id,

        routeName:
          route.routeName,

        routeCode:
          route.routeCode,

        assignedBuses:
          route.assignedBuses,

        assignedBusCount:
          route.assignedBuses
            ?.length || 0,

        totalStops:
          route.stops?.length ||
          0,

        totalDistance:
          route.totalDistance,

        estimatedTravelTime:
          route.estimatedTravelTime,

        status: route.status,
      }));

      // -------------------------
// Statistics
// -------------------------

const totalRoutes =
  await BusRoute.countDocuments({
    isDeleted: false,
  });

const activeRoutes =
  await BusRoute.countDocuments({
    isDeleted: false,
    status: "Active",
  });

const assignedBuses =
  routes.reduce(
    (total, route) =>
      total + route.assignedBuses.length,
    0
  );

  return {

  currentPage,

  totalPages: Math.ceil(
    totalRecords / pageLimit
  ),

  totalRecords,

  limit: pageLimit,

  statistics: {

    totalRoutes,

    activeRoutes,

    assignedBuses,

  },

  routes: formattedRoutes,

};
  };
  // get single bus route 
  export const getSingleBusRouteService =
  async (routeId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        routeId
      )
    ) {
      throw new Error(
        "Invalid bus route ID."
      );
    }

    // Find Route
    const route =
      await BusRoute.findOne({
        _id: routeId,
        isDeleted: {
          $ne: true,
        },
      }).populate(
        "assignedBuses",
        "busNumber registrationNumber busName status"
      );

    if (!route) {
      throw new Error(
        "Bus route not found."
      );
    }

    return route;
  };
  // update bus route function 
export const updateBusRouteService =
  async (
    routeId,
    updateData
  ) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        routeId
      )
    ) {
      throw new Error(
        "Invalid bus route ID."
      );
    }

    // Check Route Exists
    const existingRoute =
      await BusRoute.findOne({
        _id: routeId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingRoute) {
      throw new Error(
        "Bus route not found."
      );
    }

    // Normalize Input
    if (
      updateData.routeName
    ) {
      updateData.routeName =
        updateData.routeName.trim();
    }

    if (
      updateData.routeCode
    ) {
      updateData.routeCode =
        updateData.routeCode.trim();
    }

    if (
      updateData.remarks
    ) {
      updateData.remarks =
        updateData.remarks.trim();
    }

    // Check Duplicate Route Name
    if (
      updateData.routeName
    ) {
      const duplicateRouteName =
        await BusRoute.findOne({
          routeName:
            updateData.routeName,
          _id: {
            $ne: routeId,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        duplicateRouteName
      ) {
        throw new Error(
          "Route name already exists."
        );
      }
    }

    // Check Duplicate Route Code
    if (
      updateData.routeCode
    ) {
      const duplicateRouteCode =
        await BusRoute.findOne({
          routeCode:
            updateData.routeCode,
          _id: {
            $ne: routeId,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        duplicateRouteCode
      ) {
        throw new Error(
          "Route code already exists."
        );
      }
    }

    // Validate Assigned Buses
    if (
      updateData.assignedBuses &&
      updateData.assignedBuses.length > 0
    ) {
      const buses =
        await Bus.find({
          _id: {
            $in:
              updateData.assignedBuses,
          },
          isDeleted: {
            $ne: true,
          },
        });

      if (
        buses.length !==
        updateData
          .assignedBuses.length
      ) {
        throw new Error(
          "One or more selected buses are invalid."
        );
      }
    }

    // Sort Stops
    if (
      updateData.stops
    ) {
      updateData.stops.sort(
        (a, b) =>
          a.order - b.order
      );
    }

    // Update Route
    const updatedRoute =
      await BusRoute.findOneAndUpdate(
        {
          _id: routeId,
          isDeleted: {
            $ne: true,
          },
        },
        updateData,
        {
          returnDocument:
            "after",
          runValidators: true,
        }
      );

    return updatedRoute;
  };
  // delete bus route function 
export const deleteBusRouteService =
  async (routeId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        routeId
      )
    ) {
      throw new Error(
        "Invalid bus route ID."
      );
    }

    // Check Route Exists
    const existingRoute =
      await BusRoute.findOne({
        _id: routeId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingRoute) {
      throw new Error(
        "Bus route not found."
      );
    }

    // Soft Delete
    const deletedRoute =
      await BusRoute.findOneAndUpdate(
        {
          _id: routeId,
          isDeleted: {
            $ne: true,
          },
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          returnDocument:
            "after",
        }
      );

    return deletedRoute;
  };
// FETCH ALL DELETED BUS ROUTES
export const getDeletedBusRouteService = async (query) => {

  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    busId,
  } = query;

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  // -------------------------
  // Base Filter
  // -------------------------

  const filter = {
    isDeleted: true,
  };

  // -------------------------
  // Search
  // -------------------------

  if (search) {

    filter.$or = [

      {
        routeName: {
          $regex: search,
          $options: "i",
        },
      },

      {
        routeCode: {
          $regex: search,
          $options: "i",
        },
      },

    ];

  }

  // -------------------------
  // Status Filter
  // -------------------------

  if (status) {
    filter.status = status;
  }

  // -------------------------
  // Assigned Bus Filter
  // -------------------------

  if (busId) {
    filter.assignedBuses = busId;
  }

  // -------------------------
  // Count
  // -------------------------

  const totalRecords =
    await BusRoute.countDocuments(filter);

  // -------------------------
  // Fetch Deleted Routes
  // -------------------------

  const routes =
    await BusRoute.find(filter)
      .populate(
        "assignedBuses",
        "busNumber"
      )
      .sort({
        deletedAt: -1,
      })
      .skip(
        (currentPage - 1) *
          pageLimit
      )
      .limit(pageLimit);

  // -------------------------
  // Response
  // -------------------------

  const formattedRoutes =
    routes.map((route) => ({

      _id: route._id,

      routeName:
        route.routeName,

      routeCode:
        route.routeCode,

      assignedBuses:
        route.assignedBuses,

      assignedBusCount:
        route.assignedBuses?.length || 0,

      totalStops:
        route.stops?.length || 0,

      totalDistance:
        route.totalDistance,

      estimatedTravelTime:
        route.estimatedTravelTime,

      status:
        route.status,

      deletedAt:
        route.deletedAt,

    }));

  return {

    currentPage,

    totalPages:
      Math.ceil(
        totalRecords /
        pageLimit
      ),

    totalRecords,

    limit: pageLimit,

    routes:
      formattedRoutes,

  };

};


  // restore bus route function 
export const restoreBusRouteService =
  async (routeId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        routeId
      )
    ) {
      throw new Error(
        "Invalid bus route ID."
      );
    }

    // Check Route Exists in Recycle Bin
    const existingRoute =
      await BusRoute.findOne({
        _id: routeId,
        isDeleted: true,
      });

    if (!existingRoute) {
      throw new Error(
        "Deleted bus route not found."
      );
    }

    // Restore Route
    const restoredRoute =
      await BusRoute.findOneAndUpdate(
        {
          _id: routeId,
          isDeleted: true,
        },
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    return restoredRoute;
  };
  // delete from db bus route function 
export const permanentDeleteBusRouteService =
  async (routeId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        routeId
      )
    ) {
      throw new Error(
        "Invalid bus route ID."
      );
    }

    // Check Route Exists
    const route =
      await BusRoute.findById(
        routeId
      );

    if (!route) {
      throw new Error(
        "Bus route not found."
      );
    }

    // Check Recycle Bin
    if (!route.isDeleted) {
      throw new Error(
        "Please move the bus route to the recycle bin before permanently deleting it."
      );
    }

    // Permanent Delete
    await BusRoute.findByIdAndDelete(
      routeId
    );

    return;
  };











// STD BUS INFO
// bulk assign student transport
export const bulkAssignStudentTransportService =
async (transportData) => {

  // Normalize Input
  transportData.pickupStop =
    transportData.pickupStop?.trim();

  transportData.dropStop =
    transportData.dropStop?.trim();

  transportData.remarks =
    transportData.remarks?.trim();

  // Validate Student List
  if (
    !transportData.studentIds ||
    transportData.studentIds.length === 0
  ) {
    throw new Error(
      "Please select at least one student."
    );
  }

  // Validate Bus
  const bus =
    await Bus.findOne({
      _id: transportData.busId,
      isDeleted: {
        $ne: true,
      },
    });

  if (!bus) {
    throw new Error(
      "Selected bus not found."
    );
  }

  // Validate Route
  const route =
    await BusRoute.findOne({
      _id: transportData.routeId,
      isDeleted: {
        $ne: true,
      },
    });

  if (!route) {
    throw new Error(
      "Selected route not found."
    );
  }

  // Check Bus belongs to Route
  const busAssigned =
    route.assignedBuses.some(
      (id) =>
        id.toString() ===
        transportData.busId.toString()
    );

  if (!busAssigned) {
    throw new Error(
      "The selected bus is not assigned to the selected route."
    );
  }

  // Result
  const assignedStudents = [];
  const failedStudents = [];

  // Loop Students
  for (const studentId of transportData.studentIds) {

    try {

      // Validate Student
      const student =
        await Student.findById(
          studentId
        );

      if (!student) {
        failedStudents.push({
          studentId,
          reason: "Student not found.",
        });

        continue;
      }

      // Already Assigned
      const existingTransport =
        await StudentTransport.findOne({
          studentId,
          isDeleted: {
            $ne: true,
          },
        });

      if (existingTransport) {

        failedStudents.push({

          studentId,

          reason:
            "Transport already assigned.",

        });

        continue;

      }

      // Create Transport
      const transport =
        await StudentTransport.create({

          institutionId:
            student.institutionId,

          departmentId:
            student.departmentId,

          classId:
            student.classId,

          studentId,

          busId:
            transportData.busId,

          routeId:
            transportData.routeId,

          pickupStop:
            transportData.pickupStop,

          dropStop:
            transportData.dropStop,

          remarks:
            transportData.remarks,

        });

      assignedStudents.push(
        transport
      );

    } catch (error) {

      failedStudents.push({

        studentId,

        reason:
          error.message,

      });

    }

  }

  return {

    assignedCount:
      assignedStudents.length,

    failedCount:
      failedStudents.length,

    failedStudents,

  };

};
  // get all std businfo
  export const getAllStudentTransportService =
  async (query) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      institutionId,
      departmentId,
      classId,
      busId,
      routeId,
      feeStatus,
      status,
    } = query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    // Base Filter
    const filter = {
      isDeleted: {
        $ne: true,
      },
    };

    // Filters
    if (institutionId) {
      filter.institutionId =
        institutionId;
    }

    if (departmentId) {
      filter.departmentId =
        departmentId;
    }

    if (classId) {
      filter.classId =
        classId;
    }

    if (busId) {
      filter.busId = busId;
    }

    if (routeId) {
      filter.routeId = routeId;
    }

    if (feeStatus) {
      filter.feeStatus =
        feeStatus;
    }

    if (status) {
      filter.status = status;
    }

    // Fetch Records
    let transports =
      await StudentTransport.find(
        filter
      )
        .populate(
          "studentId",
          "studentName registerNumber"
        )
        .populate(
          "institutionId",
          "institutionName"
        )
        .populate(
          "busId",
          "busNumber"
        )
        .populate(
          "routeId",
          "routeName"
        )
        .sort({
          createdAt: -1,
        });

    // Search
    if (search) {
      const keyword =
        search.toLowerCase();

      transports =
        transports.filter(
          (item) => {
            return (
              item.studentId?.studentName
                ?.toLowerCase()
                .includes(
                  keyword
                ) ||
              item.studentId?.registerNumber
                ?.toLowerCase()
                .includes(
                  keyword
                ) ||
              item.busId?.busNumber
                ?.toLowerCase()
                .includes(
                  keyword
                ) ||
              item.routeId?.routeName
                ?.toLowerCase()
                .includes(
                  keyword
                )
            );
          }
        );
    }

    const totalRecords =
      transports.length;

    const paginatedData =
      transports.slice(
        (currentPage - 1) *
          pageLimit,
        currentPage *
          pageLimit
      );

    // Response Format
    const formattedData =
      paginatedData.map(
        (item) => ({
          _id: item._id,

          student:
            item.studentId
              ?.studentName,

          institution:
            item.institutionId
              ?.institutionName,

          bus:
            item.busId
              ?.busNumber,

          route:
            item.routeId
              ?.routeName,

          pickupStop:
            item.pickupStop,

          transportFee:
            item.transportFee,

          feeStatus:
            item.feeStatus,

          status:
            item.status,
        })
      );

    return {
      currentPage,

      totalPages:
        Math.ceil(
          totalRecords /
            pageLimit
        ),

      totalRecords,

      limit: pageLimit,

      data: formattedData,
    };
  };
  // get single std businfo 
export const getSingleStudentTransportService =
  async (transportId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        transportId
      )
    ) {
      throw new Error(
        "Invalid student transport ID."
      );
    }

    // Fetch Student Transport
    const transport =
      await StudentTransport.findOne({
        _id: transportId,
        isDeleted: {
          $ne: true,
        },
      })
        .populate(
          "studentId",
          "studentName registerNumber"
        )
        .populate(
          "institutionId",
          "institutionName"
        )
        .populate(
          "departmentId",
          "departmentName"
        )
        .populate(
          "classId",
          "year section"
        )
        .populate(
          "busId",
          "busNumber registrationNumber busName"
        )
        .populate(
          "routeId",
          "routeName routeCode"
        );

    if (!transport) {
      throw new Error(
        "Student transport record not found."
      );
    }

    return transport;
  };
  // update std businfo 
export const updateStudentTransportService =
  async (
    transportId,
    updateData
  ) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        transportId
      )
    ) {
      throw new Error(
        "Invalid student transport ID."
      );
    }

    // Check Existing Transport
    const existingTransport =
      await StudentTransport.findOne({
        _id: transportId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingTransport) {
      throw new Error(
        "Student transport record not found."
      );
    }

    // Prevent updating these fields
if (
  updateData.studentId ||
  updateData.institutionId ||
  updateData.departmentId ||
  updateData.classId
) {
  throw new Error(
    "Student, institution, department and class cannot be updated. Create a new transport assignment if these details change."
  );
}
    // Normalize Input
    if (
      updateData.pickupStop
    ) {
      updateData.pickupStop =
        updateData.pickupStop.trim();
    }

    if (
      updateData.dropStop
    ) {
      updateData.dropStop =
        updateData.dropStop.trim();
    }

    if (
      updateData.remarks
    ) {
      updateData.remarks =
        updateData.remarks.trim();
    }

    // Validate Bus
    if (updateData.busId) {
      const bus =
        await Bus.findOne({
          _id: updateData.busId,
          isDeleted: {
            $ne: true,
          },
        });

      if (!bus) {
        throw new Error(
          "Selected bus not found."
        );
      }
    }

    // Validate Route
    if (updateData.routeId) {
      const route =
        await BusRoute.findOne({
          _id: updateData.routeId,
          isDeleted: {
            $ne: true,
          },
        });

      if (!route) {
        throw new Error(
          "Selected route not found."
        );
      }

      const selectedBusId =
        updateData.busId ||
        existingTransport.busId;

      const busAssigned =
        route.assignedBuses.some(
          (id) =>
            id.toString() ===
            selectedBusId.toString()
        );

      if (!busAssigned) {
        throw new Error(
          "The selected bus is not assigned to the selected route."
        );
      }
    }

    // Update Record
    const updatedTransport =
      await StudentTransport.findOneAndUpdate(
        {
          _id: transportId,
          isDeleted: {
            $ne: true,
          },
        },
        updateData,
        {
          returnDocument:
            "after",
          runValidators: true,
        }
      );

    return updatedTransport;
  };
  // delete std businfo
export const deleteStudentTransportService =
  async (transportId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        transportId
      )
    ) {
      throw new Error(
        "Invalid student transport ID."
      );
    }

    // Check Existing Record
    const existingTransport =
      await StudentTransport.findOne({
        _id: transportId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingTransport) {
      throw new Error(
        "Student transport record not found."
      );
    }

    // Soft Delete
    const deletedTransport =
      await StudentTransport.findOneAndUpdate(
        {
          _id: transportId,
          isDeleted: {
            $ne: true,
          },
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          returnDocument: "after",
        }
      );

    return deletedTransport;
  };


  // restore std businfo 
  export const restoreStudentTransportService =
  async (transportId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        transportId
      )
    ) {
      throw new Error(
        "Invalid student transport ID."
      );
    }

    // Check Existing Deleted Record
    const existingTransport =
      await StudentTransport.findOne({
        _id: transportId,
        isDeleted: true,
      });

    if (!existingTransport) {
      throw new Error(
        "Deleted student transport record not found."
      );
    }

    // Restore Record
    const restoredTransport =
      await StudentTransport.findOneAndUpdate(
        {
          _id: transportId,
          isDeleted: true,
        },
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    return restoredTransport;
  };
  // delete std businfo permanantly from  db
  export const permanentDeleteStudentTransportService =
  async (transportId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        transportId
      )
    ) {
      throw new Error(
        "Invalid student transport ID."
      );
    }

    // Check Record Exists
    const transport =
      await StudentTransport.findById(
        transportId
      );

    if (!transport) {
      throw new Error(
        "Student transport record not found."
      );
    }

    // Must be in Recycle Bin
    if (!transport.isDeleted) {
      throw new Error(
        "Please move the student transport record to the recycle bin before permanently deleting it."
      );
    }

    // Permanent Delete
    await StudentTransport.findByIdAndDelete(
      transportId
    );

    return;
  };



  // ==========================================================
// GET BUSES USED BY PRINCIPAL'S INSTITUTION
// ==========================================================

export const getPrincipalInstitutionBusesService = async ({
  institutionId,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution ID is required."
    );
  }

  const institutionObjectId =
    new mongoose.Types.ObjectId(
      institutionId
    );


  // ========================================================
  // GET ACTIVE TRANSPORT ASSIGNMENTS
  // FOR THIS INSTITUTION
  // ========================================================

  const assignments =
    await StudentTransport.find({

      institutionId:
        institutionObjectId,

      status: "Active",

      isDeleted: false,

    })
      .populate(
        "busId",
        "busNumber busName status"
      )
      .lean();


  // ========================================================
  // REMOVE DUPLICATE BUSES
  // ========================================================

  const busMap = new Map();


  assignments.forEach(
    (assignment) => {

      if (
        assignment.busId &&
        !busMap.has(
          assignment.busId._id.toString()
        )
      ) {

        busMap.set(
          assignment.busId._id.toString(),
          assignment.busId
        );

      }

    }
  );


  const buses =
    Array.from(
      busMap.values()
    );


  return buses;

};

// ==========================================================
// GET SELECTED BUS DETAILS
// FOR PRINCIPAL'S INSTITUTION
// ==========================================================

// ==========================================================
// GET SELECTED BUS DETAILS
// FOR PRINCIPAL'S INSTITUTION
// ==========================================================

// import mongoose from "mongoose";

// import Bus from "./bus.model.js";
// import BusDriver from "./busDriver.model.js";
// import BusRoute from "./busRoute.model.js";
// import StudentTransport from "./studentTransport.model.js";

/*
============================================================
PRINCIPAL — GET BUS DETAILS SERVICE
============================================================
*/

export const getPrincipalBusDetailsService = async ({
  institutionId,
  busId,
}) => {
  // ==========================================================
  // VALIDATE IDS
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(institutionId) ||
    !mongoose.Types.ObjectId.isValid(busId)
  ) {
    throw new Error("Invalid institutionId or busId");
  }

  const institutionObjectId =
    new mongoose.Types.ObjectId(institutionId);

  const busObjectId =
    new mongoose.Types.ObjectId(busId);

  // ==========================================================
  // GET BUS
  // ==========================================================

  const bus = await Bus.findOne({
    _id: busObjectId,
    isDeleted: false,
  })
    .populate("driverId")
    .lean();

  if (!bus) {
    throw new Error("Bus not found");
  }

  // ==========================================================
  // GET STUDENTS ASSIGNED TO THIS BUS
  // ==========================================================

  const assignments = await StudentTransport.find({
    institutionId: institutionObjectId,
    busId: busObjectId,
    status: "Active",
    isDeleted: false,
  })
    .populate(
      "studentId",
      "studentName registerNumber profileImage"
    )
    .populate(
      "departmentId",
      "departmentName"
    )
    .populate(
      "classId",
      "year section"
    )
    .lean();

  // ==========================================================
  // FORMAT STUDENT DATA
  // ==========================================================

  const students = assignments.map((assignment) => ({
    id: assignment.studentId?._id || null,

    studentName:
      assignment.studentId?.studentName || "",

    registerNumber:
      assignment.studentId?.registerNumber || "",

    profileImage:
      assignment.studentId?.profileImage || null,

    department:
      assignment.departmentId?.departmentName || "",

    class: assignment.classId
      ? `${assignment.classId.year || ""} ${
          assignment.classId.section || ""
        }`.trim()
      : "",

    pickupStop:
      assignment.pickupStop || "",

    dropStop:
      assignment.dropStop || "",

    transportId:
      assignment._id,
  }));

  // ==========================================================
  // DRIVER
  // ==========================================================
  //
  // IMPORTANT:
  //
  // The frontend expects:
  //
  // driver.driverName
  // driver.profileImage
  // driver.employeeId
  // driver.mobileNumber
  // driver.alternateMobileNumber
  // driver.email
  // driver.licenceNumber
  // driver.licenceType
  // driver.licenceExpiryDate
  // driver.experienceInYears
  // driver.joiningDate
  // driver.status
  //
  // Therefore we return the driver in that exact structure.
  // ==========================================================

  let driver = null;

  if (bus.driverId) {
    const driverData = bus.driverId;

    driver = {
      // --------------------------------------------------------
      // ID
      // --------------------------------------------------------

      id:
        driverData._id || null,

      // --------------------------------------------------------
      // BASIC INFORMATION
      // --------------------------------------------------------

      employeeId:
        driverData.employeeId || "",

      driverName:
        driverData.driverName ||
        driverData.name ||
        "",

      profileImage:
        driverData.profileImage || null,

      // --------------------------------------------------------
      // CONTACT INFORMATION
      // --------------------------------------------------------

      mobileNumber:
        driverData.mobileNumber ||
        driverData.mobile ||
        driverData.phone ||
        "",

      alternateMobileNumber:
        driverData.alternateMobileNumber ||
        driverData.alternateMobile ||
        driverData.alternatePhone ||
        "",

      email:
        driverData.email || "",

      // --------------------------------------------------------
      // LICENCE INFORMATION
      // --------------------------------------------------------

      licenceNumber:
        driverData.licenceNumber ||
        driverData.licenseNumber ||
        "",

      licenceType:
        driverData.licenceType ||
        driverData.licenseType ||
        "",

      licenceExpiryDate:
        driverData.licenceExpiryDate ||
        driverData.licenseExpiryDate ||
        null,

      // --------------------------------------------------------
      // EXPERIENCE
      // --------------------------------------------------------

      experienceInYears:
        driverData.experienceInYears ??
        driverData.experience ??
        0,

      // --------------------------------------------------------
      // EMPLOYMENT INFORMATION
      // --------------------------------------------------------

      joiningDate:
        driverData.joiningDate ||
        driverData.dateOfJoining ||
        null,

      status:
        driverData.status || "",
    };
  }

  // ==========================================================
  // GET ROUTES ASSIGNED TO THIS BUS
  // ==========================================================

  const routes = await BusRoute.find({
    assignedBuses: busObjectId,
    isDeleted: false,
  })
    .lean();

  // ==========================================================
  // FORMAT ROUTE DATA
  // ==========================================================

  const routeData = routes.map((route) => ({
    id: route._id,

    routeName:
      route.routeName || "",

    routeNumber:
      route.routeNumber || "",

    startPoint:
      route.startPoint || "",

    endPoint:
      route.endPoint || "",

    stopCount:
      route.stopCount ??
      route.stops?.length ??
      0,

    totalDistance:
      route.totalDistance ??
      0,

    stops:
      route.stops || [],
  }));

  // ==========================================================
  // OCCUPANCY
  // ==========================================================

  const totalSeats =
    Number(bus.totalSeats || 0);

  const occupiedSeats =
    assignments.length;

  const availableSeats =
    Math.max(
      totalSeats - occupiedSeats,
      0
    );

  // ==========================================================
  // FINAL RESPONSE
  // ==========================================================

  return {
    // ========================================================
    // BUS
    // ========================================================

    bus: {
      id:
        bus._id,

      busName:
        bus.busName || "",

      busNumber:
        bus.busNumber || "",

      registrationNumber:
        bus.registrationNumber || "",

      model:
        bus.model || "",

      manufacturer:
        bus.manufacturer || "",

      manufacturingYear:
        bus.manufacturingYear || "",

      totalSeats,

      status:
        bus.status || "",
    },

    // ========================================================
    // OCCUPANCY
    // ========================================================

    occupancy: {
      totalSeats,

      occupiedSeats,

      availableSeats,
    },

    // ========================================================
    // STUDENTS
    // ========================================================

    students,

    // ========================================================
    // ROUTES
    // ========================================================

    routes: routeData,

    // ========================================================
    // DRIVER
    // ========================================================

    driver,
  };
};