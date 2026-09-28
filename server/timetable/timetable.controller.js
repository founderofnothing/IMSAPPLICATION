
import {
  createTimetableService,
    getSingleFacultyTimetableService,
  getTimetableByClassService,
  updateTimetableService,
  deleteTimetableService

} from "./timetable.service.js"



// // create class time table 

export const createTimetable =
  async (req, res) => {

    try {

      const timetable =
        await createTimetableService(

          req.body,

          req.user

        );

      return res.status(201).json({

        success: true,

        message:
          "Timetable created successfully.",

        data: timetable,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // get time table by class id 
// ==================== GET TIMETABLE BY CLASS ====================

export const getTimetableByClass =
  async (req, res) => {

    try {

      const timetable =
        await getTimetableByClassService(

          req.params.classId

        );

      return res.status(200).json({

        success: true,

        message:
          "Timetable fetched successfully.",

        data: timetable,

      });

    } catch (error) {

      // ==================== TIMETABLE NOT FOUND ====================

      if (
        error.message ===
        "Timetable not found."
      ) {

        return res.status(404).json({

          success: false,

          message:
            "No timetable has been created for this class yet. Please create a new timetable.",

          data: null,

        });

      }

      // ==================== INVALID CLASS ID ====================

      if (
        error.message ===
        "Invalid class ID."
      ) {

        return res.status(400).json({

          success: false,

          message:
            error.message,

        });

      }

      // ==================== OTHER ERRORS ====================

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // update class time table
// ==================== UPDATE TIMETABLE ====================
export const updateTimetable =
  async (req, res) => {

    try {

      const timetable =
        await updateTimetableService(

          req.params.id,

          req.body

        );

      return res.status(200).json({

        success: true,

        message:
          "Timetable updated successfully.",

        data: timetable,

      });

    } catch (error) {

      // ==================== TIMETABLE NOT FOUND ====================

      if (
        error.message ===
        "Timetable not found."
      ) {

        return res.status(404).json({

          success: false,

          message:
            error.message,

        });

      }

      // ==================== VALIDATION ERRORS ====================

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // delete class time table
// ==================== DELETE TIMETABLE ====================
export const deleteTimetable =
  async (req, res) => {

    try {

      await deleteTimetableService(

        req.params.id

      );

      return res.status(200).json({

        success: true,

        message:
          "Timetable deleted successfully.",

      });

    } catch (error) {

      // ==================== TIMETABLE NOT FOUND ====================

      if (
        error.message ===
        "Timetable not found."
      ) {

        return res.status(404).json({

          success: false,

          message:
            error.message,

        });

      }

      // ==================== OTHER ERRORS ====================

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };

  // =====================================================
// GET FACULTY WORKING HOURS TIMETABLE
// =====================================================

// ============================================================
// GET FACULTY TIMETABLE
// ============================================================

// ============================================================
// GET FACULTY TIMETABLE
// ============================================================

export const getFacultyTimetable =
  async (req, res) => {

    try {

      // ========================================================
      // 1. GET FACULTY ID
      // ========================================================

      const {
        facultyId
      } = req.params;


      // ========================================================
      // 2. FETCH FACULTY TIMETABLE
      // ========================================================

      const timetable =
        await getSingleFacultyTimetableService(
          facultyId
        );


      // ========================================================
      // 3. SUCCESS RESPONSE
      // ========================================================

      return res.status(200).json({

        success: true,

        message:
          "Faculty timetable fetched successfully.",

        data:
          timetable,

      });

    } catch (error) {

      // ========================================================
      // 4. INVALID FACULTY ID
      // ========================================================

      if (
        error.message ===
        "Invalid faculty ID."
      ) {

        return res.status(400).json({

          success: false,

          message:
            error.message,

        });

      }


      // ========================================================
      // 5. FACULTY NOT FOUND
      // ========================================================

      if (
        error.message ===
        "Teaching faculty not found."
      ) {

        return res.status(404).json({

          success: false,

          message:
            error.message,

        });

      }


      // ========================================================
      // 6. GENERAL ERROR
      // ========================================================

      console.error(
        "GET FACULTY TIMETABLE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };