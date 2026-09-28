import mongoose from "mongoose";

import IDCardTemplateAssignment from "../../models/idCardTemplateAssignment/IDCardTemplateAssignment.model.js";

import IDCardTemplate from "../../models/IDCardTemplatefile/IDCardTemplate.model.js";

import Institution from "../../../institution/institution.model.js";


// ============================================================
// ASSIGN TEMPLATE TO INSTITUTION
// ============================================================

export const assignTemplateToInstitutionService =
  async ({
    templateId,
    institutionId,
    userId,
  }) => {

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        templateId
      )
    ) {
      throw new Error(
        "Invalid template ID."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    if (!userId) {
      throw new Error(
        "Authenticated user is required."
      );
    }


    // ----------------------------------------------------------
    // CHECK TEMPLATE
    // ----------------------------------------------------------

    const template =
      await IDCardTemplate.findById(
        templateId
      );

    if (!template) {
      throw new Error(
        "ID card template not found."
      );
    }


    // Only published templates can be assigned

    if (
      template.status !== "published"
    ) {
      throw new Error(
        "Only published ID card templates can be assigned."
      );
    }


    // ----------------------------------------------------------
    // CHECK INSTITUTION
    // ----------------------------------------------------------

    const institution =
      await Institution.findOne({
        _id: institutionId,
        isDeleted: false,
      });

    if (!institution) {
      throw new Error(
        "Institution not found."
      );
    }


    // ----------------------------------------------------------
    // DEACTIVATE CURRENT ASSIGNMENT
    // ----------------------------------------------------------

    await IDCardTemplateAssignment.updateMany(
      {
        institutionId,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
        },
      }
    );


    // ----------------------------------------------------------
    // CREATE NEW ASSIGNMENT
    // ----------------------------------------------------------

    const assignment =
      await IDCardTemplateAssignment.create({
        templateId,
        institutionId,
        assignedBy: userId,
        isActive: true,
        assignedAt: new Date(),
      });


    // ----------------------------------------------------------
    // RETURN POPULATED ASSIGNMENT
    // ----------------------------------------------------------

    return await IDCardTemplateAssignment.findById(
      assignment._id
    )
      .populate(
        "templateId",
        "name description status version thumbnail"
      )
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "assignedBy",
        "fullName email role"
      )
      .lean();
  };


// ============================================================
// GET ACTIVE TEMPLATE FOR INSTITUTION
// ============================================================

export const getActiveTemplateForInstitutionService =
  async (
    institutionId
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }


    const assignment =
      await IDCardTemplateAssignment.findOne({
        institutionId,
        isActive: true,
      })
        .populate(
          "templateId",
          "name description status version thumbnail design"
        )
        .populate(
          "institutionId",
          "institutionName institutionCode"
        )
        .populate(
          "assignedBy",
          "fullName email role"
        )
        .lean();


    if (!assignment) {
      return null;
    }


    return assignment;
  };


// ============================================================
// GET ASSIGNMENT BY ID
// ============================================================

export const getTemplateAssignmentByIdService =
  async (
    assignmentId
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        assignmentId
      )
    ) {
      throw new Error(
        "Invalid assignment ID."
      );
    }


    const assignment =
      await IDCardTemplateAssignment.findById(
        assignmentId
      )
        .populate(
          "templateId",
          "name description status version thumbnail"
        )
        .populate(
          "institutionId",
          "institutionName institutionCode"
        )
        .populate(
          "assignedBy",
          "fullName email role"
        )
        .lean();


    if (!assignment) {
      throw new Error(
        "ID card template assignment not found."
      );
    }


    return assignment;
  };



// ============================================================
// GET ALL ACTIVE ASSIGNMENTS FOR TEMPLATE
// ============================================================

export const getActiveAssignmentForTemplateService =
async (templateId) => {

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      templateId
    )
  ) {
    throw new Error(
      "Invalid template ID."
    );
  }

  // ----------------------------------------------------------
  // GET ALL ACTIVE INSTITUTION ASSIGNMENTS
  // ----------------------------------------------------------

  const assignments =
    await IDCardTemplateAssignment.find({
      templateId,
      isActive: true,
    })
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "assignedBy",
        "fullName email role"
      )
      .sort({
        assignedAt: -1,
      })
      .lean();

  // ----------------------------------------------------------
  // RETURN ALL ASSIGNMENTS
  // ----------------------------------------------------------

  return assignments;
};


// ============================================================
// UNASSIGN TEMPLATE
// ============================================================

export const unassignTemplateFromInstitutionService =
  async (
    institutionId
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }


    const assignment =
      await IDCardTemplateAssignment.findOne({
        institutionId,
        isActive: true,
      });


    if (!assignment) {
      throw new Error(
        "No active ID card template assignment found for this institution."
      );
    }


    assignment.isActive =
      false;


    await assignment.save();


    return assignment;
  };