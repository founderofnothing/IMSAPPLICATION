import {
  assignTemplateToInstitutionService,
  getActiveTemplateForInstitutionService,
  getTemplateAssignmentByIdService,
  getActiveAssignmentForTemplateService,
  unassignTemplateFromInstitutionService,
} from "../../services/idCardTemplateAssignmentService/idCardTemplateAssignment.service.js";


// ============================================================
// ASSIGN TEMPLATE TO INSTITUTION
// ============================================================

export const assignTemplateToInstitution = async (
  req,
  res
) => {
  try {
    const {
      templateId,
      institutionId,
    } = req.body;

    const assignment =
      await assignTemplateToInstitutionService({
        templateId,
        institutionId,
        userId: req.user.userId,
      });

    return res.status(201).json({
      success: true,
      message:
        "ID card template assigned to institution successfully.",
      data: assignment,
    });

  } catch (error) {

    console.error(
      "Assign ID card template error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// GET ACTIVE TEMPLATE FOR INSTITUTION
// ============================================================

export const getActiveTemplateForInstitution =
  async (
    req,
    res
  ) => {
    try {

      const {
        institutionId,
      } = req.params;

      const assignment =
        await getActiveTemplateForInstitutionService(
          institutionId
        );

      return res.status(200).json({
        success: true,
        data: assignment,
      });

    } catch (error) {

      console.error(
        "Get active ID card template error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };


// ============================================================
// GET ASSIGNMENT BY ID
// ============================================================

export const getTemplateAssignmentById =
  async (
    req,
    res
  ) => {
    try {

      const assignment =
        await getTemplateAssignmentByIdService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: assignment,
      });

    } catch (error) {

      console.error(
        "Get ID card template assignment error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ============================================================
// GET ACTIVE ASSIGNMENT FOR TEMPLATE
// ============================================================
export const getActiveAssignmentForTemplate =
  async (
    req,
    res
  ) => {

    try {

      const assignment =
        await getActiveAssignmentForTemplateService(
          req.params.templateId
        );

      return res.status(200).json({
        success: true,
        data: assignment,
      });

    } catch (error) {

      console.error(
        "Get template assignment status error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
// ============================================================
// UNASSIGN TEMPLATE FROM INSTITUTION
// ============================================================

export const unassignTemplateFromInstitution =
  async (
    req,
    res
  ) => {
    try {

      const {
        institutionId,
      } = req.params;

      const assignment =
        await unassignTemplateFromInstitutionService(
          institutionId
        );

      return res.status(200).json({
        success: true,
        message:
          "ID card template unassigned from institution successfully.",
        data: assignment,
      });

    } catch (error) {

      console.error(
        "Unassign ID card template error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };