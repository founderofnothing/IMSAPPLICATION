import mongoose from "mongoose";

import IDCardAssignment from "../../models/IDCardAssignment/IDCardAssignment.model.js";
import IDCardTemplate from "../../models/IDCardTemplatefile/IDCardTemplate.model.js";
import Institution from "../../../institution/institution.model.js";
import Student from "../../../student/student.model.js";


// ============================================================
// CREATE ID CARD ASSIGNMENT
// ============================================================
export const createAssignment = async ({
  templateId,
  institutionId,
  targetType,
  fieldMappings,
  qrMapping,
  isDefault = false,
  userId,
  userInstitutionId,
}) => {

  // ==========================================================
  // BASIC VALIDATION
  // ==========================================================

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


  // ==========================================================
  // TARGET TYPE VALIDATION
  // ==========================================================

  const allowedTargetTypes = [
    "student",
    "teaching_faculty",
    "non_teaching_faculty",
  ];

  if (
    !allowedTargetTypes.includes(
      targetType
    )
  ) {
    throw new Error(
      "Invalid target type."
    );
  }


  // ==========================================================
  // INSTITUTION SECURITY CHECK
  // ==========================================================

  if (
    userInstitutionId &&
    userInstitutionId.toString() !==
      institutionId.toString()
  ) {
    throw new Error(
      "You are not authorized to assign templates to this institution."
    );
  }


  // ==========================================================
  // CHECK TEMPLATE
  // ==========================================================

  const template =
    await IDCardTemplate.findById(
      templateId
    );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }


  // ==========================================================
  // TEMPLATE STATUS
  // ==========================================================

  if (
    template.status !== "published"
  ) {
    throw new Error(
      "Only published templates can be assigned."
    );
  }


  // ==========================================================
  // CHECK INSTITUTION
  // ==========================================================

  const institution =
    await Institution.findById(
      institutionId
    );

  if (!institution) {
    throw new Error(
      "Institution not found."
    );
  }


  // ==========================================================
  // VALIDATE FIELD MAPPINGS
  // ==========================================================

  if (
    !Array.isArray(fieldMappings)
  ) {
    throw new Error(
      "Field mappings must be an array."
    );
  }


  const allowedFieldTypes = [
    "text",
    "image",
    "qr",
  ];


  for (
    const field of fieldMappings
  ) {

    if (
      !field.fieldId ||
      !field.fieldId.trim()
    ) {
      throw new Error(
        "Every field mapping must have a fieldId."
      );
    }


    if (
      !allowedFieldTypes.includes(
        field.fieldType
      )
    ) {
      throw new Error(
        `Invalid field type for ${field.fieldId}.`
      );
    }


    if (
      !field.dataPath ||
      !field.dataPath.trim()
    ) {
      throw new Error(
        `Data path is required for ${field.fieldId}.`
      );
    }
  }


  // ==========================================================
  // CHECK DUPLICATE FIELD IDs
  // ==========================================================

  const fieldIds =
    fieldMappings.map(
      (field) =>
        field.fieldId
    );

  const uniqueFieldIds =
    new Set(fieldIds);

  if (
    uniqueFieldIds.size !==
    fieldIds.length
  ) {
    throw new Error(
      "Duplicate field IDs are not allowed."
    );
  }


  // ==========================================================
  // QR VALIDATION
  // ==========================================================

  if (qrMapping) {

    if (
      !qrMapping.fieldId ||
      !qrMapping.fieldId.trim()
    ) {
      throw new Error(
        "QR field ID is required."
      );
    }

    if (
      qrMapping.dataSource &&
      qrMapping.dataSource !==
        "identityToken"
    ) {
      throw new Error(
        "Invalid QR data source."
      );
    }
  }


  // ==========================================================
  // PREVENT DUPLICATE ACTIVE ASSIGNMENT
  // ==========================================================

  const existingAssignment =
    await IDCardAssignment.findOne({
      institutionId,
      targetType,
      isActive: true,
    });

  if (existingAssignment) {
    throw new Error(
      `An active ID card template is already assigned for ${targetType}.`
    );
  }


  // ==========================================================
  // DEFAULT TEMPLATE
  // ==========================================================

  if (isDefault) {

    await IDCardAssignment.updateMany(
      {
        institutionId,
        targetType,
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );
  }


  // ==========================================================
  // CREATE ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.create({

      templateId,

      institutionId,

      targetType,

      fieldMappings,

      qrMapping:
        qrMapping || null,

      isActive: true,

      isDefault,

      assignedBy:
        userId,
    });


  return assignment;
};

// ============================================================
// GET ALL ID CARD ASSIGNMENTS
// ============================================================
export const getAssignments = async ({
  institutionId,
  targetType,
  isActive,
  isDefault,
  page = 1,
  limit = 20,
}) => {

  // ==========================================================
  // VALIDATE INSTITUTION
  // ==========================================================

  if (
    !institutionId ||
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const currentPage = Math.max(
    parseInt(page) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(
      parseInt(limit) || 20,
      1
    ),
    100
  );

  const skip =
    (currentPage - 1) *
    currentLimit;


  // ==========================================================
  // BUILD QUERY
  // ==========================================================

  const query = {
    institutionId,
  };


  // Target type filter

  if (targetType) {

    const allowedTargetTypes = [
      "student",
      "teaching_faculty",
      "non_teaching_faculty",
    ];

    if (
      !allowedTargetTypes.includes(
        targetType
      )
    ) {
      throw new Error(
        "Invalid target type."
      );
    }

    query.targetType =
      targetType;
  }


  // Active filter

  if (
    isActive !== undefined
  ) {

    query.isActive =
      isActive === true ||
      isActive === "true";
  }


  // Default filter

  if (
    isDefault !== undefined
  ) {

    query.isDefault =
      isDefault === true ||
      isDefault === "true";
  }


  // ==========================================================
  // FETCH DATA + COUNT
  // ==========================================================

  const [
    assignments,
    total,
  ] = await Promise.all([

    IDCardAssignment.find(query)

      .populate(
        "templateId",
        "name description status thumbnail version"
      )

      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      .populate(
        "assignedBy",
        "fullName email role"
      )

      .sort({
        updatedAt: -1,
      })

      .skip(skip)

      .limit(currentLimit)

      .lean(),

    IDCardAssignment.countDocuments(
      query
    ),
  ]);


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    assignments,

    pagination: {

      total,

      page:
        currentPage,

      limit:
        currentLimit,

      totalPages:
        Math.ceil(
          total /
          currentLimit
        ),
    },
  };
};



// ============================================================
// GET SINGLE ID CARD ASSIGNMENT
// ============================================================
export const getAssignmentById = async ({
  assignmentId,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE ASSIGNMENT ID
  // ==========================================================

  if (
    !assignmentId ||
    !mongoose.Types.ObjectId.isValid(
      assignmentId
    )
  ) {
    throw new Error(
      "Invalid assignment ID."
    );
  }


  // ==========================================================
  // VALIDATE INSTITUTION
  // ==========================================================

  if (
    !institutionId ||
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // FIND ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.findOne({

      _id: assignmentId,

      // IMPORTANT:
      // This prevents one institution from
      // accessing another institution's assignment.

      institutionId,
    })

      .populate(
        "templateId",
        "name description status thumbnail version design"
      )

      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      .populate(
        "assignedBy",
        "fullName email role"
      );


  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!assignment) {
    throw new Error(
      "ID card assignment not found."
    );
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return assignment;
};


// ============================================================
// UPDATE ID CARD ASSIGNMENT
// ============================================================
export const updateAssignment = async ({
  assignmentId,
  institutionId,
  targetType,
  fieldMappings,
  qrMapping,
  isDefault,
}) => {

  // ==========================================================
  // VALIDATE ASSIGNMENT ID
  // ==========================================================

  if (
    !assignmentId ||
    !mongoose.Types.ObjectId.isValid(
      assignmentId
    )
  ) {
    throw new Error(
      "Invalid assignment ID."
    );
  }


  // ==========================================================
  // VALIDATE INSTITUTION
  // ==========================================================

  if (
    !institutionId ||
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // FIND ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.findOne({
      _id: assignmentId,
      institutionId,
    });

  if (!assignment) {
    throw new Error(
      "ID card assignment not found."
    );
  }


  // ==========================================================
  // TARGET TYPE
  // ==========================================================

  if (targetType !== undefined) {

    const allowedTargetTypes = [
      "student",
      "teaching_faculty",
      "non_teaching_faculty",
    ];

    if (
      !allowedTargetTypes.includes(
        targetType
      )
    ) {
      throw new Error(
        "Invalid target type."
      );
    }

    assignment.targetType =
      targetType;
  }


  // ==========================================================
  // FIELD MAPPINGS
  // ==========================================================

  if (
    fieldMappings !== undefined
  ) {

    if (
      !Array.isArray(
        fieldMappings
      )
    ) {
      throw new Error(
        "Field mappings must be an array."
      );
    }


    const allowedFieldTypes = [
      "text",
      "image",
      "qr",
    ];


    for (
      const field of fieldMappings
    ) {

      if (
        !field.fieldId ||
        !field.fieldId.trim()
      ) {
        throw new Error(
          "Every field mapping must have a fieldId."
        );
      }


      if (
        !allowedFieldTypes.includes(
          field.fieldType
        )
      ) {
        throw new Error(
          `Invalid field type for ${field.fieldId}.`
        );
      }


      if (
        !field.dataPath ||
        !field.dataPath.trim()
      ) {
        throw new Error(
          `Data path is required for ${field.fieldId}.`
        );
      }
    }


    // --------------------------------------------------------
    // DUPLICATE FIELD IDs
    // --------------------------------------------------------

    const fieldIds =
      fieldMappings.map(
        (field) =>
          field.fieldId
      );

    const uniqueFieldIds =
      new Set(fieldIds);

    if (
      uniqueFieldIds.size !==
      fieldIds.length
    ) {
      throw new Error(
        "Duplicate field IDs are not allowed."
      );
    }


    assignment.fieldMappings =
      fieldMappings;
  }


  // ==========================================================
  // QR MAPPING
  // ==========================================================

  if (
    qrMapping !== undefined
  ) {

    if (qrMapping === null) {

      assignment.qrMapping =
        null;

    } else {

      if (
        !qrMapping.fieldId ||
        !qrMapping.fieldId.trim()
      ) {
        throw new Error(
          "QR field ID is required."
        );
      }


      if (
        qrMapping.dataSource &&
        qrMapping.dataSource !==
          "identityToken"
      ) {
        throw new Error(
          "Invalid QR data source."
        );
      }


      assignment.qrMapping =
        qrMapping;
    }
  }


  // ==========================================================
  // DEFAULT STATUS
  // ==========================================================

  if (
    isDefault !== undefined
  ) {

    const makeDefault =
      isDefault === true ||
      isDefault === "true";


    if (makeDefault) {

      // Remove default from
      // other assignments belonging
      // to the same institution
      // and target type.

      await IDCardAssignment.updateMany(
        {
          institutionId,
          targetType:
            assignment.targetType,

          _id: {
            $ne: assignmentId,
          },

          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }


    assignment.isDefault =
      makeDefault;
  }


  // ==========================================================
  // SAVE
  // ==========================================================

  await assignment.save();


  // ==========================================================
  // RETURN UPDATED ASSIGNMENT
  // ==========================================================

  return IDCardAssignment
    .findById(
      assignment._id
    )

    .populate(
      "templateId",
      "name description status thumbnail version design"
    )

    .populate(
      "institutionId",
      "institutionName institutionCode"
    )

    .populate(
      "assignedBy",
      "fullName email role"
    );
};



// ============================================================
// DELETE ID CARD ASSIGNMENT
// ============================================================
export const deleteAssignment = async ({
  assignmentId,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE ASSIGNMENT ID
  // ==========================================================

  if (
    !assignmentId ||
    !mongoose.Types.ObjectId.isValid(
      assignmentId
    )
  ) {
    throw new Error(
      "Invalid assignment ID."
    );
  }


  // ==========================================================
  // VALIDATE INSTITUTION
  // ==========================================================

  if (
    !institutionId ||
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // FIND ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.findOne({
      _id: assignmentId,
      institutionId,
    });

  if (!assignment) {
    throw new Error(
      "ID card assignment not found."
    );
  }


  // ==========================================================
  // ACTIVE ASSIGNMENT PROTECTION
  // ==========================================================

  if (assignment.isActive) {
    throw new Error(
      "Active ID card assignments cannot be deleted. Deactivate the assignment first."
    );
  }


  // ==========================================================
  // DELETE
  // ==========================================================

  await IDCardAssignment.findByIdAndDelete(
    assignmentId
  );


  return true;
};



// ============================================================
// DEACTIVATE ID CARD ASSIGNMENT
// ============================================================
export const deactivateAssignment = async ({
  assignmentId,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE ASSIGNMENT ID
  // ==========================================================

  if (
    !assignmentId ||
    !mongoose.Types.ObjectId.isValid(
      assignmentId
    )
  ) {
    throw new Error(
      "Invalid assignment ID."
    );
  }


  // ==========================================================
  // VALIDATE INSTITUTION
  // ==========================================================

  if (
    !institutionId ||
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // FIND ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.findOne({
      _id: assignmentId,
      institutionId,
    });

  if (!assignment) {
    throw new Error(
      "ID card assignment not found."
    );
  }


  // ==========================================================
  // ALREADY INACTIVE
  // ==========================================================

  if (!assignment.isActive) {
    throw new Error(
      "ID card assignment is already inactive."
    );
  }


  // ==========================================================
  // DEACTIVATE
  // ==========================================================

  assignment.isActive = false;

  // If it was the default assignment,
  // it cannot remain the default while inactive.
  if (assignment.isDefault) {
    assignment.isDefault = false;
  }

  await assignment.save();


  // ==========================================================
  // RETURN UPDATED ASSIGNMENT
  // ==========================================================

  return IDCardAssignment
    .findById(
      assignment._id
    )

    .populate(
      "templateId",
      "name description status thumbnail version design"
    )

    .populate(
      "institutionId",
      "institutionName institutionCode"
    )

    .populate(
      "assignedBy",
      "fullName email role"
    );
};



// ============================================================
// ACTIVATE ID CARD ASSIGNMENT
// ============================================================

export const activateAssignment = async ({
  assignmentId,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE ASSIGNMENT ID
  // ==========================================================

  if (
    !assignmentId ||
    !mongoose.Types.ObjectId.isValid(
      assignmentId
    )
  ) {
    throw new Error(
      "Invalid assignment ID."
    );
  }


  // ==========================================================
  // VALIDATE INSTITUTION
  // ==========================================================

  if (
    !institutionId ||
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // FIND ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.findOne({
      _id: assignmentId,
      institutionId,
    });

  if (!assignment) {
    throw new Error(
      "ID card assignment not found."
    );
  }


  // ==========================================================
  // ALREADY ACTIVE
  // ==========================================================

  if (assignment.isActive) {
    throw new Error(
      "ID card assignment is already active."
    );
  }


  // ==========================================================
  // CHECK TEMPLATE
  // ==========================================================

  const template =
    await IDCardTemplate.findById(
      assignment.templateId
    );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }


  // ==========================================================
  // TEMPLATE MUST BE PUBLISHED
  // ==========================================================

  if (
    template.status !== "published"
  ) {
    throw new Error(
      "Only published templates can be activated."
    );
  }


  // ==========================================================
  // DEACTIVATE OTHER ACTIVE ASSIGNMENT
  // ==========================================================

  await IDCardAssignment.updateMany(
    {
      institutionId,

      targetType:
        assignment.targetType,

      _id: {
        $ne: assignmentId,
      },

      isActive: true,
    },
    {
      $set: {
        isActive: false,
        isDefault: false,
      },
    }
  );


  // ==========================================================
  // ACTIVATE THIS ASSIGNMENT
  // ==========================================================

  assignment.isActive = true;

  // It remains non-default unless explicitly
  // changed through the update operation.

  assignment.isDefault = false;

  await assignment.save();


  // ==========================================================
  // RETURN UPDATED ASSIGNMENT
  // ==========================================================

  return IDCardAssignment
    .findById(
      assignment._id
    )

    .populate(
      "templateId",
      "name description status thumbnail version design"
    )

    .populate(
      "institutionId",
      "institutionName institutionCode"
    )

    .populate(
      "assignedBy",
      "fullName email role"
    );
};








// ============================================================
// RESOLVE VALUE FROM OBJECT PATH
// ============================================================

const resolvePath = (object, path) => {
  if (!object || !path) {
    return null;
  }

  return path
    .split(".")
    .reduce((current, key) => {
      if (current === null || current === undefined) {
        return null;
      }

      return current[key];
    }, object);
};


// ============================================================
// BUILD STUDENT ID CARD PREVIEW
// ============================================================

export const getStudentIDCardPreviewService = async ({
  studentId,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE STUDENT ID
  // ==========================================================

  if (
    !studentId ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    throw new Error(
      "Invalid student ID."
    );
  }


  // ==========================================================
  // VALIDATE INSTITUTION ID
  // ==========================================================

  if (
    institutionId &&
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  // ==========================================================
  // FETCH STUDENT
  // ==========================================================

  const student =
    await Student.findOne({
      _id: studentId,
      isDeleted: false,

      ...(institutionId
        ? { institutionId }
        : {}),
    })
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "departmentId",
        "departmentName departmentCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "classId",
        "year section className"
      )
      .populate(
        "batchId",
        "batchName"
      )
      .lean();


  // ==========================================================
  // STUDENT NOT FOUND
  // ==========================================================

  if (!student) {
    throw new Error(
      "Student not found."
    );
  }


  // ==========================================================
  // FIND ACTIVE STUDENT ASSIGNMENT
  // ==========================================================

  const assignment =
    await IDCardAssignment.findOne({
      institutionId:
        student.institutionId?._id ||
        student.institutionId,

      targetType:
        "student",

      isActive:
        true,
    })
      .populate(
        "templateId",
        "name description status version thumbnail design"
      )
      .lean();


  // ==========================================================
  // ASSIGNMENT NOT FOUND
  // ==========================================================

  if (!assignment) {
    throw new Error(
      "No active student ID card assignment found for this institution."
    );
  }


  // ==========================================================
  // TEMPLATE VALIDATION
  // ==========================================================

  if (!assignment.templateId) {
    throw new Error(
      "Assigned ID card template not found."
    );
  }


  if (
    assignment.templateId.status !==
    "published"
  ) {
    throw new Error(
      "Assigned ID card template is not published."
    );
  }


  // ==========================================================
  // RESOLVE ASSIGNED DYNAMIC FIELDS
  // ==========================================================

  const resolvedFields = {};


  for (
    const field of
    assignment.fieldMappings || []
  ) {

    const value =
      resolvePath(
        student,
        field.dataPath
      );

    resolvedFields[
      field.fieldId
    ] = {

      fieldId:
        field.fieldId,

      fieldType:
        field.fieldType,

      dataPath:
        field.dataPath,

      value:
        value ?? null,
    };
  }


  // ==========================================================
  // QR DATA
  // ==========================================================

  let qr = null;


  if (
    assignment.qrMapping
  ) {

    qr = {

      fieldId:
        assignment.qrMapping.fieldId,

      dataSource:
        assignment.qrMapping.dataSource,

      data: {

        studentId:
          student._id,

        registerNumber:
          student.registerNumber ||
          null,
      },
    };
  }


  // ==========================================================
  // RETURN PREVIEW DATA
  // ==========================================================
  //
  // IMPORTANT:
  //
  // We intentionally return only fields required by the
  // ID-card system.
  //
  // Sensitive / unnecessary student information is NOT
  // exposed here.
  //
  // ==========================================================

  return {

    student: {

      // ------------------------------------------------------
      // IDENTITY
      // ------------------------------------------------------

      _id:
        student._id,

      studentName:
        student.studentName,

      applicationNumber:
        student.applicationNumber,

      registerNumber:
        student.registerNumber,


      // ------------------------------------------------------
      // PERSONAL INFORMATION
      // ------------------------------------------------------

      dateOfBirth:
        student.dateOfBirth,

      age:
        student.age,

      gender:
        student.gender,

      bloodGroup:
        student.bloodGroup,


      // ------------------------------------------------------
      // PHOTO
      // ------------------------------------------------------

      profilePhoto:
        student.profilePhoto,


      // ------------------------------------------------------
      // CONTACT
      // ------------------------------------------------------

      studentMobile:
        student.studentMobile,

      phoneNumber:
        student.phoneNumber,

      studentEmail:
        student.studentEmail,


      // ------------------------------------------------------
      // ADDRESS
      // ------------------------------------------------------

      address:
        student.address,

      communicationAddress:
        student.communicationAddress,

      permanentAddress:
        student.permanentAddress,


      // ------------------------------------------------------
      // INSTITUTION
      // ------------------------------------------------------

      institution:
        student.institutionId,

      institutionId:
        student.institutionId,


      // ------------------------------------------------------
      // DEPARTMENT
      // ------------------------------------------------------

      department:
        student.departmentId,

      departmentId:
        student.departmentId,


      // ------------------------------------------------------
      // PROGRAMME
      // ------------------------------------------------------

      programme:
        student.programmeId,

      programmeId:
        student.programmeId,


      // ------------------------------------------------------
      // CLASS
      // ------------------------------------------------------

      class:
        student.classId,

      classId:
        student.classId,


      // ------------------------------------------------------
      // BATCH
      // ------------------------------------------------------

      batch:
        student.batchId,

      batchId:
        student.batchId,
    },


    // ========================================================
    // ASSIGNMENT
    // ========================================================

    assignment: {

      _id:
        assignment._id,

      targetType:
        assignment.targetType,

      fieldMappings:
        assignment.fieldMappings,

      qrMapping:
        assignment.qrMapping,

      isDefault:
        assignment.isDefault,
    },


    // ========================================================
    // TEMPLATE
    // ========================================================

    template: {

      _id:
        assignment.templateId._id,

      name:
        assignment.templateId.name,

      description:
        assignment.templateId.description,

      version:
        assignment.templateId.version,

      status:
        assignment.templateId.status,

      design:
        assignment.templateId.design,
    },


    // ========================================================
    // RESOLVED FIELDS
    // ========================================================

    resolvedFields,


    // ========================================================
    // QR
    // ========================================================

    qr,
  };
};