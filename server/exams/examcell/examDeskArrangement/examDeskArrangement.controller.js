import {
  createDeskArrangement,
  getDeskArrangement,
  updateDeskArrangement,
  deleteDeskArrangement,
} from "./examDeskArrangement.service.js";

// =====================================================
// CREATE DESK ARRANGEMENT
// =====================================================

export const createDeskArrangementController = async (
  req,
  res
) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const arrangement = await createDeskArrangement(
      institutionId,
      hallId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Desk arrangement created successfully.",
      data: arrangement,
    });
  } catch (error) {
    console.error(
      "Create Desk Arrangement Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create desk arrangement.",
    });
  }
};

// =====================================================
// GET DESK ARRANGEMENT
// =====================================================

export const getDeskArrangementController = async (
  req,
  res
) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const arrangement = await getDeskArrangement(
      institutionId,
      hallId
    );

    return res.status(200).json({
      success: true,
      message: "Desk arrangement fetched successfully.",
      data: arrangement,
    });
  } catch (error) {
    console.error(
      "Get Desk Arrangement Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Desk arrangement not found.",
    });
  }
};

// =====================================================
// UPDATE DESK ARRANGEMENT
// =====================================================

export const updateDeskArrangementController = async (
  req,
  res
) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const arrangement = await updateDeskArrangement(
      institutionId,
      hallId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Desk arrangement updated successfully.",
      data: arrangement,
    });
  } catch (error) {
    console.error(
      "Update Desk Arrangement Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update desk arrangement.",
    });
  }
};

// =====================================================
// DELETE DESK ARRANGEMENT
// =====================================================

export const deleteDeskArrangementController = async (
  req,
  res
) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const arrangement = await deleteDeskArrangement(
      institutionId,
      hallId
    );

    return res.status(200).json({
      success: true,
      message: "Desk arrangement deleted successfully.",
      data: arrangement,
    });
  } catch (error) {
    console.error(
      "Delete Desk Arrangement Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Desk arrangement not found.",
    });
  }
};