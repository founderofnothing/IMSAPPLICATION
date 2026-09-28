import {
  createExamHall,
  getAllExamHalls,
  getExamHallById,
  updateExamHall,
  deleteExamHall,
} from "./examHall.service.js";

// =====================================================
// CREATE EXAM HALL
// =====================================================

export const createExamHallController = async (req, res) => {
  try {
    const institutionId = req.user.institution;

    const examHall = await createExamHall(
      institutionId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Exam hall created successfully.",
      data: examHall,
    });
  } catch (error) {
    console.error("Create Exam Hall Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create exam hall.",
    });
  }
};

// =====================================================
// GET ALL EXAM HALLS
// =====================================================

// =====================================================
// GET ALL EXAM HALLS
// =====================================================

export const getAllExamHallsController = async (req, res) => {
  try {
    const institutionId = req.user.institution;

    const {
      page,
      limit,
      status,
      search,
    } = req.query;

    const result = await getAllExamHalls(
      institutionId,
      {
        page,
        limit,
        status,
        search,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Exam halls fetched successfully.",
      data: result.examHalls,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "Get All Exam Halls Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch exam halls.",
    });
  }
};

// =====================================================
// GET SINGLE EXAM HALL
// =====================================================

export const getExamHallByIdController = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const examHall = await getExamHallById(
      institutionId,
      hallId
    );

    return res.status(200).json({
      success: true,
      message: "Exam hall fetched successfully.",
      data: examHall,
    });
  } catch (error) {
    console.error("Get Exam Hall Error:", error);

    return res.status(404).json({
      success: false,
      message:
        error.message || "Exam hall not found.",
    });
  }
};

// =====================================================
// UPDATE EXAM HALL
// =====================================================

export const updateExamHallController = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const examHall = await updateExamHall(
      institutionId,
      hallId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Exam hall updated successfully.",
      data: examHall,
    });
  } catch (error) {
    console.error("Update Exam Hall Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to update exam hall.",
    });
  }
};

// =====================================================
// DELETE EXAM HALL
// =====================================================

export const deleteExamHallController = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    const { hallId } = req.params;

    const examHall = await deleteExamHall(
      institutionId,
      hallId
    );

    return res.status(200).json({
      success: true,
      message: "Exam hall deleted successfully.",
      data: examHall,
    });
  } catch (error) {
    console.error("Delete Exam Hall Error:", error);

    return res.status(404).json({
      success: false,
      message:
        error.message || "Exam hall not found.",
    });
  }
};