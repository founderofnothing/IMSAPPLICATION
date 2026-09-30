import {
  createTimetableService,
  getTimetableByClassService,
  updateTimetableService,
  deleteTimetableService,

// SEC SLICE
    getClassTimetableForAssignmentService,
  assignFacultyToTimetableService,
  getClassFacultyAssignmentsService,
  updateFacultyAssignmentService,
  removeFacultyAssignmentService,


  // 3rd layer
  getFacultyTimetableService,

    getAttendanceContextService,
  createAttendanceService,
  getAttendanceByIdService,
  updateAttendanceService,
  deleteAttendanceService,
} from "./timetable.service.js";

// ============================================================
// CREATE MASTER TIMETABLE
// ============================================================

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
          "Master timetable created successfully.",

        data:
          timetable,
      });

    } catch (error) {

      console.error(
        "CREATE MASTER TIMETABLE ERROR:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================================
// GET TIMETABLE BY CLASS
// ============================================================

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
          "Master timetable fetched successfully.",

        data:
          timetable,
      });

    } catch (error) {

      if (
        error.message ===
        "Timetable not found."
      ) {

        return res.status(404).json({
          success: false,

          message:
            "No timetable has been created for this class yet.",

          data: null,
        });
      }

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

      console.error(
        "GET TIMETABLE BY CLASS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================================
// UPDATE MASTER TIMETABLE
// ============================================================

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
          "Master timetable updated successfully.",

        data:
          timetable,
      });

    } catch (error) {

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

      if (
        error.message ===
        "Invalid timetable ID."
      ) {

        return res.status(400).json({
          success: false,

          message:
            error.message,
        });
      }

      console.error(
        "UPDATE MASTER TIMETABLE ERROR:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================================
// DELETE MASTER TIMETABLE
// ============================================================

export const deleteTimetable =
  async (req, res) => {

    try {

      await deleteTimetableService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Master timetable deleted successfully.",
      });

    } catch (error) {

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

      if (
        error.message ===
        "Invalid timetable ID."
      ) {

        return res.status(400).json({
          success: false,

          message:
            error.message,
        });
      }

      console.error(
        "DELETE MASTER TIMETABLE ERROR:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };









  // SLICE TWO 



// =====================================================
// 1. GET CLASS TIMETABLE FOR FACULTY ASSIGNMENT
// =====================================================

export const getClassTimetableForAssignment = async (
  req,
  res
) => {
  try {
    const { classId } = req.params;

    const data =
      await getClassTimetableForAssignmentService(
        classId
      );

    return res.status(200).json({
      success: true,
      message:
        "Class timetable fetched successfully.",
      data,
    });
  } catch (error) {
    console.error(
      "GET CLASS TIMETABLE FOR ASSIGNMENT ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// 2. ASSIGN FACULTY TO TIMETABLE
// =====================================================

export const assignFacultyToTimetable = async (
  req,
  res
) => {
  try {
    // =================================================
    // CHECK AUTHENTICATION
    // =================================================

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // =================================================
    // REQUEST DATA
    // =================================================

    const assignmentData =
      req.body;

    // =================================================
    // ASSIGN FACULTY
    // =================================================

    const data =
      await assignFacultyToTimetableService(
        assignmentData,
        req.user
      );

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "Faculty assigned to timetable successfully.",
      data,
    });

  } catch (error) {
    console.error(
      "ASSIGN FACULTY TO TIMETABLE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};

// =====================================================
// 3. GET CLASS FACULTY ASSIGNMENTS
// =====================================================

export const getClassFacultyAssignments = async (
  req,
  res
) => {
  try {
    const { classId } = req.params;

    const data =
      await getClassFacultyAssignmentsService(
        classId
      );

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignments fetched successfully.",
      data,
    });
  } catch (error) {
    console.error(
      "GET CLASS FACULTY ASSIGNMENTS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// 4. UPDATE FACULTY ASSIGNMENT
// =====================================================

export const updateFacultyAssignment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const assignmentData = req.body;

    const data =
      await updateFacultyAssignmentService(
        id,
        assignmentData
      );

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignment updated successfully.",
      data,
    });
  } catch (error) {
    console.error(
      "UPDATE FACULTY ASSIGNMENT ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// 5. REMOVE FACULTY ASSIGNMENT
// =====================================================

export const removeFacultyAssignment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const data =
      await removeFacultyAssignmentService(id);

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignment removed successfully.",
      data,
    });
  } catch (error) {
    console.error(
      "REMOVE FACULTY ASSIGNMENT ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// slice 3
// =====================================================
// GET FACULTY TIMETABLE
// =====================================================
export const getFacultyTimetable = async (
  req,
  res
) => {
  try {

    // =================================================
    // GET FACULTY ID
    // =================================================

    const { facultyId } =
      req.params;

    // =================================================
    // GET FACULTY TIMETABLE
    // =================================================

    const data =
      await getFacultyTimetableService(
        facultyId
      );

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Faculty timetable fetched successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "GET FACULTY TIMETABLE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};




// layer 4th 




// =====================================================
// ATTENDANCE CONTROLLER
// =====================================================



// =====================================================
// 1. GET ATTENDANCE CONTEXT
// =====================================================

export const getAttendanceContext = async (
  req,
  res
) => {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =================================================
    // PARAMS
    // =================================================

    const {
      timetableAssignmentId,
    } = req.params;


    // =================================================
    // OPTIONAL DATE
    // =================================================

    const {
      date,
    } = req.query;


    // =================================================
    // GET ATTENDANCE CONTEXT
    // =================================================

    const data =
      await getAttendanceContextService(
        timetableAssignmentId,
        req.user.userId,
        date || new Date()
      );


    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Attendance context fetched successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "GET ATTENDANCE CONTEXT ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};


// =====================================================
// 2. CREATE ATTENDANCE
// =====================================================

export const createAttendance = async (
  req,
  res
) => {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =================================================
    // REQUEST DATA
    // =================================================

    const attendanceData =
      req.body;


    // =================================================
    // CREATE ATTENDANCE
    // =================================================

    const data =
      await createAttendanceService(
        attendanceData,
        req.user.userId
      );


    // =================================================
    // SUCCESS
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Attendance marked successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "CREATE ATTENDANCE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};


// =====================================================
// 3. GET ATTENDANCE BY ID
// =====================================================

export const getAttendanceById = async (
  req,
  res
) => {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =================================================
    // PARAMS
    // =================================================

    const {
      id,
    } = req.params;


    // =================================================
    // GET ATTENDANCE
    // =================================================

    const data =
      await getAttendanceByIdService(
        id,
        req.user.userId
      );


    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Attendance fetched successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "GET ATTENDANCE BY ID ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};


// =====================================================
// 4. UPDATE ATTENDANCE
// =====================================================

export const updateAttendance = async (
  req,
  res
) => {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =================================================
    // PARAMS
    // =================================================

    const {
      id,
    } = req.params;


    // =================================================
    // REQUEST DATA
    // =================================================

    const attendanceData =
      req.body;


    // =================================================
    // UPDATE ATTENDANCE
    // =================================================

    const data =
      await updateAttendanceService(
        id,
        attendanceData,
        req.user.userId
      );


    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Attendance updated successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "UPDATE ATTENDANCE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};


// =====================================================
// 5. DELETE ATTENDANCE
// =====================================================

export const deleteAttendance = async (
  req,
  res
) => {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =================================================
    // PARAMS
    // =================================================

    const {
      id,
    } = req.params;


    // =================================================
    // DELETE ATTENDANCE
    // =================================================

    const data =
      await deleteAttendanceService(
        id,
        req.user.userId
      );


    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Attendance deleted successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "DELETE ATTENDANCE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};