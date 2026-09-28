import {
  createStudentAllocation,
  createBulkStudentAllocations,
  getHallAllocations,
    getHallAttendanceList,
  removeStudentAllocation,
} from "./examHallStudentAllocation.service.js";


// =====================================================
// CREATE SINGLE STUDENT ALLOCATION
// =====================================================
// Used for MANUAL allocation.
// =====================================================

export const createStudentAllocationController =
  async (req, res) => {

    try {

   const institutionId =
  req.user.institution;

const userId =
  req.user.userId;

      const allocation =
        await createStudentAllocation(
          institutionId,
          req.body,
          userId
        );

      return res.status(201).json({

        success: true,

        message:
          "Student allocated successfully.",

        data:
          allocation,

      });

    } catch (error) {

      console.error(
        "Create Student Allocation Error:",
        error
      );

      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to allocate student.",

      });

    }

  };


// =====================================================
// CREATE BULK STUDENT ALLOCATIONS
// =====================================================
// Used for AUTOMATIC allocation.
// =====================================================

export const createBulkStudentAllocationsController =
  async (req, res) => {

    try {

const institutionId =
  req.user.institution;

const userId =
  req.user.userId;  

      const {
        allocations,
      } = req.body;

      // =================================================
      // BASIC VALIDATION
      // =================================================

      if (
        !Array.isArray(
          allocations
        ) ||
        allocations.length === 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "At least one allocation is required.",

        });

      }

      // =================================================
      // CREATE BULK ALLOCATIONS
      // =================================================

      const result =
        await createBulkStudentAllocations(
          institutionId,
          allocations,
          userId
        );

      return res.status(201).json({

        success: true,

        message:
          "Students allocated successfully.",

        count:
          result.length,

        data:
          result,

      });

    } catch (error) {

      console.error(
        "Create Bulk Student Allocations Error:",
        error
      );

      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to allocate students.",

      });

    }

  };


// =====================================================
// GET HALL ALLOCATIONS
// =====================================================
// Returns students currently sitting in the hall.
//
// IMPORTANT:
// The existing route is:
//
// /session/:examSessionId/hall/:hallId
//
// We are keeping the URL unchanged for now,
// but examSessionId is now treated as examTitleId.
// =====================================================

// =====================================================
// GET HALL ALLOCATIONS
// =====================================================
// Returns all students currently allocated
// to the selected exam title + exam hall.
//
// Route:
// GET /title/:examTitleId/hall/:hallId
// =====================================================

export const getHallAllocationsController =
  async (req, res) => {

    try {

      // =================================================
      // INSTITUTION
      // =================================================

      const institutionId =
        req.user.institution;

      // =================================================
      // ROUTE PARAMETERS
      // =================================================

      const {
        examTitleId,
        hallId,
      } = req.params;

      // =================================================
      // FETCH HALL ALLOCATIONS
      // =================================================

      const allocations =
        await getHallAllocations(
          institutionId,
          examTitleId,
          hallId
        );

      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "Hall allocations fetched successfully.",

        count:
          allocations.length,

        data:
          allocations,

      });

    } catch (error) {

      // =================================================
      // ERROR
      // =================================================

      console.error(
        "Get Hall Allocations Error:",
        error
      );

      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to fetch hall allocations.",

      });

    }

  };


// =====================================================
// REMOVE STUDENT ALLOCATION
// =====================================================
// Used for:
// Remove
// Reassign
// =====================================================

// =====================================================
// REMOVE STUDENT ALLOCATION
// =====================================================
// Used for:
// Remove
// Reassign
// =====================================================

export const removeStudentAllocationController =
  async (req, res) => {

    try {

      // =================================================
      // INSTITUTION
      // =================================================

      const institutionId =
        req.user.institution;

      // =================================================
      // USER
      // =================================================
      // JWT contains userId, not _id.
      // =================================================

      const userId =
        req.user.userId;

      // =================================================
      // ALLOCATION ID
      // =================================================

      const {
        allocationId,
      } = req.params;

      // =================================================
      // REMOVE ALLOCATION
      // =================================================

      const allocation =
        await removeStudentAllocation(
          institutionId,
          allocationId,
          userId
        );

      // =================================================
      // SUCCESS
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "Student allocation removed successfully.",

        data:
          allocation,

      });

    } catch (error) {

      // =================================================
      // ERROR
      // =================================================

      console.error(
        "Remove Student Allocation Error:",
        error
      );

      return res.status(404).json({

        success: false,

        message:
          error.message ||
          "Student allocation not found.",

      });

    }

  };


  // =====================================================
// GET HALL ATTENDANCE LIST
// =====================================================
//
// Returns students from the selected exam hall,
// arranged department-wise.
//
// Route:
//
// GET
// /title/:examTitleId/hall/:hallId/attendance
//
// =====================================================

export const getHallAttendanceListController =
  async (req, res) => {

    try {

      // =================================================
      // INSTITUTION
      // =================================================

      const institutionId =
        req.user.institution;


      // =================================================
      // ROUTE PARAMETERS
      // =================================================

      const {
        examTitleId,
        hallId,
      } = req.params;


      // =================================================
      // FETCH ATTENDANCE LIST
      // =================================================

      const result =
        await getHallAttendanceList(
          institutionId,
          examTitleId,
          hallId
        );


      // =================================================
      // SUCCESS
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "Hall attendance list fetched successfully.",

        data:
          result,

      });

    } catch (error) {

      console.error(
        "Get Hall Attendance List Error:",
        error
      );


      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to fetch hall attendance list.",

      });

    }

  };