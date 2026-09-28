import {
  ID_CARD_DYNAMIC_FIELDS,
} from "./dynamicFieldRegistry";




// ============================================================
// ID CARD DYNAMIC FIELD RESOLVER
// ============================================================
//
// Converts an ID-card dynamic field key into the
// actual value from the student context.
//
// This file does NOT modify Fabric objects.
// It only resolves:
//
// dynamicKey → actual value
//
// ============================================================


// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const year =
    date.getFullYear();

  return `${day}/${month}/${year}`;
};


// ============================================================
// FORMAT ADDRESS
// ============================================================

const formatAddress = (
  address
) => {

  if (!address) {
    return "";
  }

  if (
    typeof address === "string"
  ) {
    return address.trim();
  }

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.district,
    address.state,
    address.pincode,
  ];

  return parts
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
    .map(
      (value) =>
        String(value).trim()
    )
    .join(", ");
};


// ============================================================
// RESOLVE DYNAMIC FIELD
// ============================================================

export const resolveDynamicField = (
  dynamicKey,
  context = {}
) => {

  const {
    student = null,
    department = null,
    programme = null,
    classData = null,
    institution = null,
  } = context;


  // ----------------------------------------------------------
  // SAFETY
  // ----------------------------------------------------------

  if (!dynamicKey) {
    return "";
  }


  // ==========================================================
  // STUDENT FIELDS
  // ==========================================================

  switch (dynamicKey) {

    case "studentName":
      return (
        student?.studentName ||
        ""
      );


    case "applicationNumber":
      return (
        student?.applicationNumber ||
        ""
      );


    case "registerNumber":
      return (
        student?.registerNumber ||
        ""
      );


    case "dateOfBirth":
      return formatDate(
        student?.dateOfBirth
      );


    case "age":
      return (
        student?.age !== undefined &&
        student?.age !== null
          ? String(student.age)
          : ""
      );


    case "gender":
      return (
        student?.gender ||
        ""
      );


    case "bloodGroup":
      return (
        student?.bloodGroup ||
        ""
      );


    case "studentPhoto":
      return (
        student?.profilePhoto ||
        ""
      );


    case "phoneNumber":
      return (
        student?.studentMobile ||
        ""
      );


    case "address":
      return formatAddress(
        student?.communicationAddress
      );


    // ========================================================
    // ACADEMIC FIELDS
    // ========================================================

    case "departmentName":
      return (
        department?.departmentName ||
        ""
      );


    case "programmeName":
      return (
        programme?.programmeName ||
        ""
      );


    case "programmeCode":
      return (
        programme?.programmeCode ||
        ""
      );


    case "section":
      return (
        classData?.section ||
        ""
      );


    case "academicYear":
      return (
        student?.academicYear ||
        ""
      );


    // ========================================================
    // INSTITUTION FIELDS
    // ========================================================

    case "institutionName":
      return (
        institution?.institutionName ||
        ""
      );


    case "institutionCode":
      return (
        institution?.institutionCode ||
        ""
      );


    // ========================================================
    // GENERATED FIELDS
    // ========================================================

    case "qrCode":
      // QR generation will be handled
      // separately in the QR generation phase.
      return "";


    // ========================================================
    // UNKNOWN FIELD
    // ========================================================

    default:
      return "";
  }
};


// ============================================================
// RESOLVE ALL DYNAMIC FIELDS
// ============================================================
//
// Useful later when generating one student's complete card.
//
// Returns:
//
// {
//   studentName: "...",
//   registerNumber: "...",
//   departmentName: "...",
//   ...
// }
//
// ============================================================

export const resolveAllDynamicFields = (
  dynamicFields = [],
  context = {}
) => {

  const resolved = {};

  dynamicFields.forEach(
    (field) => {

      const dynamicKey =
        typeof field === "string"
          ? field
          : field?.key;

      if (!dynamicKey) {
        return;
      }

      resolved[dynamicKey] =
        resolveDynamicField(
          dynamicKey,
          context
        );
    }
  );

  return resolved;
};


// ============================================================
// VALIDATE REQUIRED DYNAMIC FIELDS
// ============================================================
//
// Checks required data fields defined by the
// ID_CARD_DYNAMIC_FIELDS registry.
//
// Generated fields such as QR Code are skipped here
// because they are produced separately.
// ============================================================

export const validateDynamicFields = (
  resolvedFields = {}
) => {

  const missingFields = [];

  ID_CARD_DYNAMIC_FIELDS.forEach(
    (field) => {

      // --------------------------------------------------------
      // Skip fields that are generated later
      // --------------------------------------------------------

      if (field.generated === true) {
        return;
      }

      // --------------------------------------------------------
      // Only validate required fields
      // --------------------------------------------------------

      if (field.required !== true) {
        return;
      }

      const value =
        resolvedFields[field.key];

      const isMissing =
        value === undefined ||
        value === null ||
        String(value).trim() === "";

      if (isMissing) {

        missingFields.push({
          key: field.key,
          label: field.label,
        });

      }

    }
  );

  return {
    valid:
      missingFields.length === 0,

    missingFields,
  };
};