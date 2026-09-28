import {
  // =========================
  // MASTER TIMETABLE
  // =========================
  createMasterTimetableService,
  getMasterTimetablesService,
  getMasterTimetableService,
  updateMasterTimetableService,
  deleteMasterTimetableService,

  // =========================
  // CLASSES / SUBJECTS
  // =========================
  getClassesByYearService,
  getSubjectsForClassService,

  // =========================
  // DATES / SESSIONS
  // =========================
  addTimetableDateService,
  updateTimetableDateService,
  deleteTimetableDateService,

  // =========================
  // SUBJECT / CELL
  // =========================
  assignSubjectToTimetableCellService,
  changeSubjectInCellService,
  removeSubjectFromCellService,

} from "./MasterTimetable.service.js";
// =========================
// CREATE
// =========================

export const createMasterTimetable = async (
  req,
  res
) => {
  try {

    // =========================
    // GET INSTITUTION FROM JWT
    // =========================

    const institutionId =
      req.user.institution;

    if (!institutionId) {
      return res.status(401).json({
        success: false,
        message:
          "Institution not found in authentication token",
      });
    }

    // =========================
    // CREATE MASTER TIMETABLE
    // =========================

    const timetable =
      await createMasterTimetableService(
        institutionId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Master timetable created successfully",
      data: timetable,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// ======================================================
// GET ALL MASTER TIMETABLES
// ======================================================

export const getMasterTimetables = async (
  req,
  res
) => {

  try {

    // =========================
    // GET INSTITUTION FROM JWT
    // =========================

    const institutionId =
      req.user.institution;

    if (!institutionId) {

      return res.status(401).json({
        success: false,
        message:
          "Institution not found in authentication token",
      });

    }

    // =========================
    // GET ALL TIMETABLES
    // =========================

    const timetables =
      await getMasterTimetablesService(
        institutionId
      );

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      data: timetables,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
// =========================
// GET
// =========================
export const getMasterTimetable = async (
  req,
  res
) => {
  try {

    const timetable =
      await getMasterTimetableService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: timetable,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// =========================
// UPDATE
// =========================
export const updateMasterTimetable = async (
  req,
  res
) => {
  try {

    const timetable =
      await updateMasterTimetableService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Master timetable updated successfully",
      data: timetable,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// =========================
// DELETE
// =========================

export const deleteMasterTimetable = async (
  req,
  res
) => {
  try {

    const timetable =
      await deleteMasterTimetableService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Master timetable deleted successfully",
      data: timetable,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================================
// GET CLASSES BY YEAR
// ======================================================
export const getClassesByYear = async (
  req,
  res
) => {
  try {
    const institutionId =
      req.user.institution;

    const { year } = req.query;

    if (!institutionId) {
      return res.status(401).json({
        success: false,
        message:
          "Institution not found in authentication token",
      });
    }

    const classes =
      await getClassesByYearService(
        institutionId,
        year
      );

    return res.status(200).json({
      success: true,
      data: classes,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



// ======================================================
// ADD TIMETABLE DATE
// ======================================================
export const addTimetableDate = async (
  req,
  res
) => {
  try {

    const timetable =
      await addTimetableDateService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Examination date added successfully",
      data: timetable,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// ======================================================
// ASSIGN SUBJECT TO CELL
// ======================================================
export const assignSubjectToTimetableCell =
  async (
    req,
    res
  ) => {
    try {

      const timetable =
        await assignSubjectToTimetableCellService(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Subject assigned successfully",
        data: timetable,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        code:
          error.code || "TIMETABLE_ERROR",
        message:
          error.message,
        details:
          error.details || null,
      });

    }
  };



  // ======================================================
// GET SUBJECTS FOR CLASS
// ======================================================

// ======================================================
// GET SUBJECTS FOR CLASS
// ======================================================

export const getSubjectsForClass = async (
  req,
  res
) => {
  try {

    const data =
      await getSubjectsForClassService(
        req.params.id,
        req.params.classId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


  // ======================================================
// UPDATE DATE
// ======================================================

export const updateTimetableDate =
  async (
    req,
    res
  ) => {

    try {

      const timetable =
        await updateTimetableDateService(
          req.params.id,
          req.params.dateId,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Examination date updated successfully",
        data: timetable,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        code:
          error.code || "TIMETABLE_ERROR",
        message:
          error.message,
        details:
          error.details || null,
      });

    }
  };



  // ======================================================
// DELETE DATE
// ======================================================

export const deleteTimetableDate =
  async (
    req,
    res
  ) => {

    try {

      const timetable =
        await deleteTimetableDateService(
          req.params.id,
          req.params.dateId
        );

      return res.status(200).json({
        success: true,
        message:
          "Examination date deleted successfully",
        data: timetable,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        code:
          error.code || "TIMETABLE_ERROR",
        message:
          error.message,
        details:
          error.details || null,
      });

    }
  };


  // ======================================================
// CHANGE SUBJECT
// ======================================================

export const changeSubjectInCell =
  async (
    req,
    res
  ) => {

    try {

      const timetable =
        await changeSubjectInCellService(
          req.params.id,
          req.params.scheduleId,
          req.body.subjectId
        );

      return res.status(200).json({
        success: true,
        message:
          "Subject changed successfully",
        data: timetable,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        code:
          error.code || "TIMETABLE_ERROR",
        message:
          error.message,
        details:
          error.details || null,
      });

    }
  };


  // ======================================================
// REMOVE SUBJECT
// ======================================================

export const removeSubjectFromCell =
  async (
    req,
    res
  ) => {

    try {

      const timetable =
        await removeSubjectFromCellService(
          req.params.id,
          req.params.scheduleId
        );

      return res.status(200).json({
        success: true,
        message:
          "Subject removed successfully",
        data: timetable,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };