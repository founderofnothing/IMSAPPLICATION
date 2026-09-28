import {
  createProgrammeSeatLimitService,
  getAllProgrammeSeatLimitsService,
  getProgrammeSeatLimitByIdService,
  updateProgrammeSeatLimitService,
  deleteProgrammeSeatLimitService,
  getDeletedProgrammeSeatLimitsService,
  restoreProgrammeSeatLimitService,
  permanentDeleteProgrammeSeatLimitService,
} from "./programmeSeatLimit.service.js";

// ============================================================
// CREATE PROGRAMME SEAT LIMIT
// ============================================================

export const createProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const seatLimit =
      await createProgrammeSeatLimitService(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Programme seat limit created successfully",
      seatLimit,
    });
  } catch (error) {
    console.error(
      "Create Programme Seat Limit Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL PROGRAMME SEAT LIMITS
// ============================================================

export const getAllProgrammeSeatLimits = async (
  req,
  res
) => {
  try {
    const seatLimits =
      await getAllProgrammeSeatLimitsService();

    return res.status(200).json({
      success: true,
      count: seatLimits.length,
      seatLimits,
    });
  } catch (error) {
    console.error(
      "Get All Programme Seat Limits Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================================
// GET PROGRAMME SEAT LIMIT BY ID
// ============================================================
export const getProgrammeSeatLimitById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const seatLimit =
      await getProgrammeSeatLimitByIdService(id);

    return res.status(200).json({
      success: true,
      seatLimit,
    });
  } catch (error) {
    console.error(
      "Get Programme Seat Limit Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// UPDATE PROGRAMME SEAT LIMIT
// ============================================================
export const updateProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const seatLimit =
      await updateProgrammeSeatLimitService(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit updated successfully",
      seatLimit,
    });
  } catch (error) {
    console.error(
      "Update Programme Seat Limit Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SOFT DELETE PROGRAMME SEAT LIMIT
// ============================================================
export const deleteProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const seatLimit =
      await deleteProgrammeSeatLimitService(id);

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit deleted successfully",
      seatLimit,
    });
  } catch (error) {
    console.error(
      "Delete Programme Seat Limit Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET DELETED PROGRAMME SEAT LIMITS
// ============================================================
export const getDeletedProgrammeSeatLimits = async (
  req,
  res
) => {
  try {
    const seatLimits =
      await getDeletedProgrammeSeatLimitsService();

    return res.status(200).json({
      success: true,
      count: seatLimits.length,
      seatLimits,
    });
  } catch (error) {
    console.error(
      "Get Deleted Programme Seat Limits Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// RESTORE PROGRAMME SEAT LIMIT
// ============================================================
export const restoreProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const seatLimit =
      await restoreProgrammeSeatLimitService(id);

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit restored successfully",
      seatLimit,
    });
  } catch (error) {
    console.error(
      "Restore Programme Seat Limit Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// PERMANENT DELETE PROGRAMME SEAT LIMIT
// ============================================================
export const permanentDeleteProgrammeSeatLimit =
  async (req, res) => {
    try {
      const { id } = req.params;

      const seatLimit =
        await permanentDeleteProgrammeSeatLimitService(
          id
        );

      return res.status(200).json({
        success: true,
        message:
          "Programme seat limit permanently deleted",
        seatLimit,
      });
    } catch (error) {
      console.error(
        "Permanent Delete Programme Seat Limit Error:",
        error
      );

      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };