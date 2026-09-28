import {
  getAvailableStudents,
  createStudentPool,
  getStudentPools,
  deleteStudentPool,
  getExamCellStudents
} from "./examHallStudentPool.service.js";

// =====================================================
// GET AVAILABLE STUDENTS
// =====================================================

export const getAvailableStudentsController = async (
  req,
  res
) => {
  try {
    const institutionId =
      req.user.institution;

    const result =
      await getAvailableStudents(
        institutionId,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Available students fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Get Available Students Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch available students.",
    });
  }
};

// =====================================================
// CREATE STUDENT POOL
// =====================================================

export const createStudentPoolController =
  async (req, res) => {
    try {
      const institutionId =
        req.user.institution;

      const studentPool =
        await createStudentPool(
          institutionId,
          req.body
        );

      return res.status(201).json({
        success: true,
        message:
          "Student pool created successfully.",
        data: studentPool,
      });
    } catch (error) {
      console.error(
        "Create Student Pool Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to create student pool.",
      });
    }
  };

// =====================================================
// GET STUDENT POOLS
// =====================================================

export const getStudentPoolsController =
  async (req, res) => {
    try {
      const institutionId =
        req.user.institution;

      const { hallId } =
        req.params;

      const { examSessionId } =
        req.query;

      const pools =
        await getStudentPools(
          institutionId,
          hallId,
          examSessionId
        );

      return res.status(200).json({
        success: true,
        message:
          "Student pools fetched successfully.",
        data: pools,
      });
    } catch (error) {
      console.error(
        "Get Student Pools Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch student pools.",
      });
    }
  };

// =====================================================
// DELETE STUDENT POOL
// =====================================================

export const deleteStudentPoolController =
  async (req, res) => {
    try {
      const institutionId =
        req.user.institution;

      const { poolId } =
        req.params;

      const pool =
        await deleteStudentPool(
          institutionId,
          poolId
        );

      return res.status(200).json({
        success: true,
        message:
          "Student pool deleted successfully.",
        data: pool,
      });
    } catch (error) {
      console.error(
        "Delete Student Pool Error:",
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          "Student pool not found.",
      });
    }
  };





// =====================================================
// GET STUDENTS BY PROGRAMME + BATCH
// =====================================================

export const getExamCellStudentsController =
  async (req, res) => {
    try {
      const institutionId =
        req.user.institution;

      const {
        programmeId,
        batchId,
        page,
        limit,
        search,
      } = req.query;

      const result =
        await getExamCellStudents(
          institutionId,
          {
            programmeId,
            batchId,
            page,
            limit,
            search,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Students fetched successfully.",
        data: result.students,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error(
        "Get Exam Cell Students Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch students.",
      });
    }
  };