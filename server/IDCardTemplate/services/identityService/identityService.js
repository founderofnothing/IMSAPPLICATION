import crypto from "crypto";
import mongoose from "mongoose";

import Identity from "../../models/Identity/Identity.model.js";
import Student from "../../../student/student.model.js";
import TeachingFaculty from "../../../user/models/teachingFaculty.model.js";
import NonTeachingFaculty from "../../../user/models/nonTeachingFaculty.model.js";

// ============================================================
// GENERATE UNIQUE IDENTITY TOKEN
// ============================================================

const generateIdentityToken = () => {

  return crypto.randomBytes(32).toString("hex");

};


// ============================================================
// CREATE IDENTITY
// ============================================================

export const createIdentity = async ({
  personType,
  personId,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE PERSON TYPE
  // ==========================================================

  const allowedPersonTypes = [
    "student",
    "teaching_faculty",
    "non_teaching_faculty",
  ];

  if (
    !allowedPersonTypes.includes(
      personType
    )
  ) {
    throw new Error(
      "Invalid person type."
    );
  }


  // ==========================================================
  // VALIDATE PERSON ID
  // ==========================================================

  if (
    !personId ||
    !mongoose.Types.ObjectId.isValid(
      personId
    )
  ) {
    throw new Error(
      "Invalid person ID."
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
  // CHECK EXISTING IDENTITY
  // ==========================================================

  const existingIdentity =
    await Identity.findOne({

      institutionId,

      personType,

      personId,
    });

  if (existingIdentity) {

    throw new Error(
      "Identity already exists for this person."
    );
  }


  // ==========================================================
  // GENERATE TOKEN
  // ==========================================================

  let identityToken;

  let tokenExists = true;


  // Extremely unlikely collision protection

  while (tokenExists) {

    identityToken =
      generateIdentityToken();

    tokenExists =
      await Identity.exists({
        identityToken,
      });
  }


  // ==========================================================
  // CREATE IDENTITY
  // ==========================================================

  const identity =
    await Identity.create({

      identityToken,

      personType,

      personId,

      institutionId,

      status: "active",
    });


  // ==========================================================
  // RETURN
  // ==========================================================

  return identity;
};


// ============================================================
// BULK CREATE IDENTITIES
// ============================================================

export const createBulkIdentities = async ({
  personType,
  personIds,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE PERSON TYPE
  // ==========================================================

  const allowedPersonTypes = [
    "student",
    "teaching_faculty",
    "non_teaching_faculty",
  ];

  if (
    !allowedPersonTypes.includes(
      personType
    )
  ) {
    throw new Error(
      "Invalid person type."
    );
  }


  // ==========================================================
  // VALIDATE PERSON IDS
  // ==========================================================

  if (
    !Array.isArray(personIds) ||
    personIds.length === 0
  ) {
    throw new Error(
      "personIds must be a non-empty array."
    );
  }


  // Prevent unnecessarily huge requests
  if (personIds.length > 1000) {
    throw new Error(
      "Maximum 1000 persons can be processed at once."
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
  // REMOVE DUPLICATE IDS
  // ==========================================================

  const uniquePersonIds = [
    ...new Set(
      personIds.map(
        (id) => String(id)
      )
    ),
  ];


  // ==========================================================
  // VALIDATE EVERY PERSON ID
  // ==========================================================

  const invalidIds =
    uniquePersonIds.filter(
      (id) =>
        !mongoose.Types.ObjectId.isValid(
          id
        )
    );

  if (
    invalidIds.length > 0
  ) {
    throw new Error(
      "One or more person IDs are invalid."
    );
  }


  // ==========================================================
  // FIND EXISTING IDENTITIES
  // ==========================================================

  const existingIdentities =
    await Identity.find({

      institutionId,

      personType,

      personId: {
        $in: uniquePersonIds,
      },

    }).lean();


  // ==========================================================
  // BUILD EXISTING ID SET
  // ==========================================================

  const existingPersonIds =
    new Set(
      existingIdentities.map(
        (identity) =>
          String(
            identity.personId
          )
      )
    );


  // ==========================================================
  // FIND MISSING PERSON IDS
  // ==========================================================

  const missingPersonIds =
    uniquePersonIds.filter(
      (personId) =>
        !existingPersonIds.has(
          String(personId)
        )
    );


  // ==========================================================
  // GENERATE IDENTITIES
  // ==========================================================

  const documents =
    [];

  for (
    const personId
    of missingPersonIds
  ) {

    let identityToken;

    let tokenExists = true;


    while (
      tokenExists
    ) {

      identityToken =
        crypto
          .randomBytes(32)
          .toString("hex");


      tokenExists =
        await Identity.exists({
          identityToken,
        });
    }


    documents.push({

      identityToken,

      personType,

      personId,

      institutionId,

      status: "active",

    });
  }


  // ==========================================================
  // INSERT NEW IDENTITIES
  // ==========================================================

  let createdIdentities =
    [];

  if (
    documents.length > 0
  ) {

    createdIdentities =
      await Identity.insertMany(
        documents,
        {
          ordered: true,
        }
      );
  }


  // ==========================================================
  // RETURN CREATED + EXISTING
  // ==========================================================

  const allIdentities =
    await Identity.find({

      institutionId,

      personType,

      personId: {
        $in: uniquePersonIds,
      },

    })
      .sort({
        createdAt: 1,
      })
      .lean();


  return {

    requestedCount:
      personIds.length,

    uniqueCount:
      uniquePersonIds.length,

    existingCount:
      existingIdentities.length,

    createdCount:
      createdIdentities.length,

    identities:
      allIdentities,

  };
};

// ============================================================
// RESOLVE IDENTITY TOKEN
// ============================================================

export const resolveIdentity = async ({
  identityToken,
  institutionId,
}) => {

  // ==========================================================
  // VALIDATE TOKEN
  // ==========================================================

  if (
    !identityToken ||
    !identityToken.trim()
  ) {
    throw new Error(
      "Identity token is required."
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
  // FIND IDENTITY
  // ==========================================================

  const identity =
    await Identity.findOne({

      identityToken:
        identityToken.trim(),

      institutionId,

    }).lean();


  if (!identity) {
    throw new Error(
      "Identity not found."
    );
  }


  // ==========================================================
  // CHECK STATUS
  // ==========================================================

  if (
    identity.status !== "active"
  ) {
    throw new Error(
      "This identity is inactive."
    );
  }


  // ==========================================================
  // RESOLVE PERSON
  // ==========================================================

  let person = null;


  switch (
    identity.personType
  ) {

    // --------------------------------------------------------
    // STUDENT
    // --------------------------------------------------------

case "student":

  person =
    await Student.findOne({

      _id:
        identity.personId,

      institutionId,

      isDeleted: false,

    })

    // Only return the fields that are
    // useful for normal identity operations.

    .select(
      [
        "institutionId",
        "departmentId",
        "programmeId",
        "classId",
        "batchId",
        "applicationNumber",
        "studentType",
        "registerNumber",
        "studentName",
        "profilePhoto",
        "dateOfBirth",
        "age",
        "gender",
        "bloodGroup",
        "studentMobile",
        "studentEmail",
        "admissionStatus",
      ].join(" ")
    )

    .populate(
      "departmentId",
      "departmentName"
    )

    .populate(
      "programmeId",
      "programmeName programmeCode"
    )

    .populate(
      "classId",
      "section"
    )

    .populate(
      "batchId",
      "batchName admissionYear graduationYear currentYear"
    )

    .lean();

  break;


    // --------------------------------------------------------
    // TEACHING FACULTY
    // --------------------------------------------------------

case "teaching_faculty":

  person =
    await TeachingFaculty.findOne({

      _id:
        identity.personId,

      isDeleted: false,

    })

    .select(
      [
        "userId",
        "employeeId",
        "designation",
        "department",
        "fatherOrSpouseName",
        "dateOfBirth",
        "gender",
        "bloodGroup",
        "dateOfJoining",
        "yearsOfExperience",
        "qualification",
        "specialization",
      ].join(" ")
    )

    .populate(
      "userId",
      "fullName email phone profileImage role status"
    )

    .populate(
      "department",
      "departmentName"
    )

    .lean();

  break;


    // --------------------------------------------------------
    // NON-TEACHING FACULTY
    // --------------------------------------------------------

case "non_teaching_faculty":

  person =
    await NonTeachingFaculty.findOne({

      _id:
        identity.personId,

      isDeleted: false,

    })

    .select(
      [
        "userId",
        "employeeId",
        "designation",
        "department",
        "fatherOrSpouseName",
        "dateOfBirth",
        "gender",
        "bloodGroup",
        "dateOfJoining",
        "yearsOfExperience",
        "qualification",
        "specialization",
      ].join(" ")
    )

    .populate(
      "userId",
      "fullName email phone profileImage role status"
    )

    .populate(
      "department",
      "departmentName"
    )

    .lean();

  break;


    // --------------------------------------------------------
    // UNKNOWN TYPE
    // --------------------------------------------------------

    default:

      throw new Error(
        "Unsupported identity person type."
      );
  }


  // ==========================================================
  // PERSON NOT FOUND
  // ==========================================================

  if (!person) {

    throw new Error(
      "Person associated with this identity was not found."
    );
  }


  // ==========================================================
  // RETURN RESOLVED IDENTITY
  // ==========================================================

  return {

    identity: {

      id:
        identity._id,

      personType:
        identity.personType,

      status:
        identity.status,
    },

    person,
  };
};