import {
  createInstitutionService,
  getAllInstitutionsService,
  getInstitutionByIdService,
  updateInstitutionService,
  deleteInstitutionService,
  getDeletedInstitutionsService,
  restoreInstitutionService,
  permanentDeleteInstitutionService,
  getMyInstitutionService,
  getDepartmentsByInstitutionService,
} from "./institution.service.js";

// =====================================================
// CREATE INSTITUTION
// =====================================================

export const createInstitution = async (
  req,
  res
) => {
  try {
    const institution =
      await createInstitutionService(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Institution created successfully",
      data: institution,
    });
  } catch (error) {
    console.error(
      "CREATE INSTITUTION ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL INSTITUTIONS
// =====================================================

export const getAllInstitutions =
  async (req, res) => {
    try {
      const institutions =
        await getAllInstitutionsService();

      return res.status(200).json({
        success: true,
        count: institutions.length,
        data: institutions,
      });
    } catch (error) {
      console.error(
        "GET ALL INSTITUTIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// GET SINGLE INSTITUTION
// =====================================================

export const getInstitutionById =
  async (req, res) => {
    try {
      const institution =
        await getInstitutionByIdService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: institution,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// UPDATE INSTITUTION
// =====================================================

export const updateInstitution =
  async (req, res) => {
    try {
      const institution =
        await updateInstitutionService(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Institution updated successfully",
        data: institution,
      });
    } catch (error) {
      console.error(
        "UPDATE INSTITUTION ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// DELETE INSTITUTION
// =====================================================

export const deleteInstitution =
  async (req, res) => {
    try {
      await deleteInstitutionService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Institution deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// GET DELETED INSTITUTIONS
// =====================================================

export const getDeletedInstitutions =
  async (req, res) => {
    try {
      const institutions =
        await getDeletedInstitutionsService();

      return res.status(200).json({
        success: true,
        count: institutions.length,
        data: institutions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// RESTORE INSTITUTION
// =====================================================

export const restoreInstitution =
  async (req, res) => {
    try {
      const institution =
        await restoreInstitutionService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Institution restored successfully.",
        data: institution,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// PERMANENT DELETE INSTITUTION
// =====================================================

export const permanentDeleteInstitution =
  async (req, res) => {
    try {
      await permanentDeleteInstitutionService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Institution permanently deleted.",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// GET MY INSTITUTION FROM JWT
// =====================================================

export const getMyInstitution =
  async (req, res) => {
    try {
      if (
        !req.user ||
        !req.user.institution
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Institution information is missing from authentication.",
        });
      }

      const institution =
        await getMyInstitutionService(
          req.user.institution
        );

      return res.status(200).json({
        success: true,
        data: institution,
      });
    } catch (error) {
      console.error(
        "GET MY INSTITUTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// GET DEPARTMENTS BY INSTITUTION
// =====================================================

export const getDepartmentsByInstitution =
  async (req, res) => {
    try {
      const {
        institutionId,
      } = req.params;

      const departments =
        await getDepartmentsByInstitutionService(
          institutionId
        );

      return res.status(200).json({
        success: true,
        message:
          "Departments fetched successfully",
        data: departments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };