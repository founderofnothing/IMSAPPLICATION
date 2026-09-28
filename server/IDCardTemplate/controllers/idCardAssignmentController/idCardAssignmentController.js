import * as idCardAssignmentService
  from "../../services/idCardAssignmentService/idCardAssignmentService.js";
import {getStudentIDCardPreviewService} from "./../../services/idCardAssignmentService/idCardAssignmentService.js"

// ============================================================
// CREATE ID CARD ASSIGNMENT
// ============================================================
export const createIDCardAssignment = async (
  req,
  res
) => {

  try {

    const assignment =
      await idCardAssignmentService.createAssignment({

        // Template selected by admin
        templateId:
          req.body.templateId,

        // Institution where the template
        // should be assigned
        institutionId:
          req.body.institutionId,

        // student / teaching_faculty /
        // non_teaching_faculty
        targetType:
          req.body.targetType,

        // Dynamic field mappings
        fieldMappings:
          req.body.fieldMappings,

        // QR configuration
        qrMapping:
          req.body.qrMapping,

        // Whether this becomes the
        // default template
        isDefault:
          req.body.isDefault,

        // Authenticated user
        userId:
          req.user.userId,

        // Institution belonging to
        // authenticated user
        userInstitutionId:
          req.user.institution,
      });


    return res.status(201).json({

      success: true,

      message:
        "ID card template assigned successfully.",

      assignment,
    });

  } catch (error) {

    console.error(
      "Create ID card assignment error:",
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
// GET ALL ID CARD ASSIGNMENTS
// ============================================================
export const getIDCardAssignments = async (
  req,
  res
) => {

  try {

    const result =
      await idCardAssignmentService.getAssignments({

        // IMPORTANT:
        // Institution comes from JWT,
        // NOT from the frontend.

        institutionId:
          req.user.institution,

        targetType:
          req.query.targetType,

        isActive:
          req.query.isActive,

        isDefault:
          req.query.isDefault,

        page:
          req.query.page,

        limit:
          req.query.limit,
      });


    return res.status(200).json({

      success: true,

      ...result,
    });

  } catch (error) {

    console.error(
      "Get ID card assignments error:",
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
// GET SINGLE ID CARD ASSIGNMENT
// ============================================================
export const getIDCardAssignmentById = async (
  req,
  res
) => {

  try {

    const assignment =
      await idCardAssignmentService.getAssignmentById({

        assignmentId:
          req.params.id,

        institutionId:
          req.user.institution,
      });


    return res.status(200).json({

      success: true,

      assignment,
    });

  } catch (error) {

    console.error(
      "Get ID card assignment error:",
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
// UPDATE ID CARD ASSIGNMENT
// ============================================================
export const updateIDCardAssignment = async (
  req,
  res
) => {

  try {

    const assignment =
      await idCardAssignmentService.updateAssignment({

        assignmentId:
          req.params.id,

        institutionId:
          req.user.institution,

        targetType:
          req.body.targetType,

        fieldMappings:
          req.body.fieldMappings,

        qrMapping:
          req.body.qrMapping,

        isDefault:
          req.body.isDefault,
      });


    return res.status(200).json({

      success: true,

      message:
        "ID card assignment updated successfully.",

      assignment,
    });

  } catch (error) {

    console.error(
      "Update ID card assignment error:",
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
// DELETE ID CARD ASSIGNMENT
// ============================================================
export const deleteIDCardAssignment = async (
  req,
  res
) => {

  try {

    await idCardAssignmentService.deleteAssignment({

      assignmentId:
        req.params.id,

      institutionId:
        req.user.institution,
    });


    return res.status(200).json({

      success: true,

      message:
        "ID card assignment deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete ID card assignment error:",
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
// DEACTIVATE ID CARD ASSIGNMENT
// ============================================================
export const deactivateIDCardAssignment = async (
  req,
  res
) => {

  try {

    const assignment =
      await idCardAssignmentService.deactivateAssignment({

        assignmentId:
          req.params.id,

        institutionId:
          req.user.institution,
      });


    return res.status(200).json({

      success: true,

      message:
        "ID card assignment deactivated successfully.",

      assignment,
    });

  } catch (error) {

    console.error(
      "Deactivate ID card assignment error:",
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
// ACTIVATE ID CARD ASSIGNMENT
// ============================================================
export const activateIDCardAssignment = async (
  req,
  res
) => {

  try {

    const assignment =
      await idCardAssignmentService.activateAssignment({

        assignmentId:
          req.params.id,

        institutionId:
          req.user.institution,
      });


    return res.status(200).json({

      success: true,

      message:
        "ID card assignment activated successfully.",

      assignment,
    });

  } catch (error) {

    console.error(
      "Activate ID card assignment error:",
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
// GET STUDENT ID CARD PREVIEW
// ============================================================

export const getStudentIDCardPreview = async (
  req,
  res
) => {

  try {

    const {
      studentId,
    } = req.params;


    const institutionId =
      req.user?.institutionId;


    const data =
      await getStudentIDCardPreviewService({
        studentId,
        institutionId,
      });


    return res.status(200).json({

      success:
        true,

      message:
        "Student ID card preview data fetched successfully.",

      data,
    });

  } catch (error) {

    console.error(
      "GET STUDENT ID CARD PREVIEW ERROR:",
      error
    );


    return res.status(400).json({

      success:
        false,

      message:
        error?.message ||
        "Failed to fetch student ID card preview data.",
    });
  }
};