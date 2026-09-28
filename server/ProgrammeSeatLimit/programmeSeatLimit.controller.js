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


/**
 * CREATE PROGRAMME SEAT LIMIT
 * POST /api/programme-seat-limit
 */
export const createProgrammeSeatLimit = async (req, res) => {
  try {
    const seatLimit =
      await createProgrammeSeatLimitService(req.body);

    return res.status(201).json({
      success: true,
      message: "Programme seat limit created successfully",
      data: seatLimit,
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


/**
 * GET ALL ACTIVE PROGRAMME SEAT LIMITS
 * GET /api/programme-seat-limit
 *
 * Optional:
 * ?institutionId=xxxxxxxx
 */
export const getAllProgrammeSeatLimits = async (req, res) => {
  try {
    const { institutionId } = req.query;

    const seatLimits =
      await getAllProgrammeSeatLimitsService(
        institutionId
      );

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limits fetched successfully",
      count: seatLimits.length,
      data: seatLimits,
    });
  } catch (error) {
    console.error(
      "Get All Programme Seat Limits Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * GET SINGLE PROGRAMME SEAT LIMIT
 * GET /api/programme-seat-limit/:id
 */
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
      message:
        "Programme seat limit fetched successfully",
      data: seatLimit,
    });
  } catch (error) {
    console.error(
      "Get Programme Seat Limit By ID Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * UPDATE PROGRAMME SEAT LIMIT
 * PUT /api/programme-seat-limit/:id
 */
export const updateProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const updatedSeatLimit =
      await updateProgrammeSeatLimitService(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit updated successfully",
      data: updatedSeatLimit,
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


/**
 * SOFT DELETE PROGRAMME SEAT LIMIT
 * DELETE /api/programme-seat-limit/:id
 */
export const deleteProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const deletedSeatLimit =
      await deleteProgrammeSeatLimitService(id);

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit deleted successfully",
      data: deletedSeatLimit,
    });
  } catch (error) {
    console.error(
      "Delete Programme Seat Limit Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * GET DELETED PROGRAMME SEAT LIMITS
 * GET /api/programme-seat-limit/deleted
 *
 * Optional:
 * ?institutionId=xxxxxxxx
 */
export const getDeletedProgrammeSeatLimits = async (
  req,
  res
) => {
  try {
    const { institutionId } = req.query;

    const seatLimits =
      await getDeletedProgrammeSeatLimitsService(
        institutionId
      );

    return res.status(200).json({
      success: true,
      message:
        "Deleted programme seat limits fetched successfully",
      count: seatLimits.length,
      data: seatLimits,
    });
  } catch (error) {
    console.error(
      "Get Deleted Programme Seat Limits Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * RESTORE PROGRAMME SEAT LIMIT
 * PATCH /api/programme-seat-limit/:id/restore
 */
export const restoreProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const restoredSeatLimit =
      await restoreProgrammeSeatLimitService(id);

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit restored successfully",
      data: restoredSeatLimit,
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


/**
 * PERMANENT DELETE PROGRAMME SEAT LIMIT
 * DELETE /api/programme-seat-limit/:id/permanent
 */
export const permanentDeleteProgrammeSeatLimit = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result =
      await permanentDeleteProgrammeSeatLimitService(id);

    return res.status(200).json({
      success: true,
      message:
        "Programme seat limit permanently deleted",
      data: result,
    });
  } catch (error) {
    console.error(
      "Permanent Delete Programme Seat Limit Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};