import fs from "fs";
import xlsx from "xlsx";

import mongoose from "mongoose";
import Institution  from "../../institution/institution.model.js"
import Department from "../../department/department.model.js"
import Programme from "../../programme/programme.model.js"
import Class from "../../class/class.model.js"
import Batch from "../../batch/batch.model.js"
import Student from "../student.model.js";



// ============================================================
// BULK UPLOAD NORMALIZATION HELPERS
// ============================================================

const cleanText = (value, defaultValue = "") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
};


const cleanNullableText = (value) => {
  const cleaned = cleanText(value);

  return cleaned || null;
};


const cleanEmail = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned = String(value)
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

  return cleaned || null;
};

const isValidEmail = (value) => {
  // =========================
  // Empty Email
  // =========================
  //
  // Email is optional.
  // Missing email is therefore
  // NOT considered invalid.
  // =========================

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return true;
  }


  // =========================
  // Normalize
  // =========================

  const cleaned =
    cleanEmail(value);

  if (!cleaned) {
    return false;
  }


  // =========================
  // Basic Email Validation
  // =========================

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(
    cleaned
  );
};




const cleanNumber = (
  value,
  defaultValue = 0
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  // Already valid number
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : defaultValue;
  }

  // Remove common number formatting
  // 1,08,000 → 108000
  // 72,000   → 72000
  // " 548 "  → 548
  const cleaned =
    String(value)
      .trim()
      .replace(/,/g, "");

  if (!cleaned) {
    return defaultValue;
  }

  const number =
    Number(cleaned);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};


const cleanNullableNumber = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const cleaned =
    String(value)
      .trim()
      .replace(/,/g, "");

  if (!cleaned) {
    return null;
  }

  const number =
    Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
};

// ============================================================
// NORMALIZE EXAM MARK
// ============================================================
//
// Valid:
// 96       → 96
// "96"     → 96
// " 96 "   → 96
// "1,000"  → 1000
//
// Invalid / Missing:
// ""       → null
// null     → null
// "Absent" → null
// "AB"     → null
// "N/A"    → null
// "XYZ"    → null
//
// IMPORTANT:
// 0 is a valid mark.
//
// ============================================================

const normalizeMark = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const cleaned =
    String(value)
      .trim()
      .replace(/,/g, "");

  if (!cleaned) {
    return null;
  }

  const number =
    Number(cleaned);

  if (
    !Number.isFinite(number)
  ) {
    return null;
  }

  return number;
};

// ============================================================
// VALIDATE ONE HSC SUBJECT / MARK PAIR
// ============================================================

const validateHscSubjectPair = ({
  row,
  rowNumber,
  subjectNumber,
  fieldLocationMap,
}) => {
  const warnings = [];

  const nameField =
    `hscMarks.subject${subjectNumber}Name`;

  const markField =
    `hscMarks.subject${subjectNumber}Mark`;


  // =========================
  // Original Excel Values
  // =========================

  const originalName =
    row[nameField];

  const originalMark =
    row[markField];


  // =========================
  // Normalize
  // =========================

  const subjectName =
    cleanNullableText(
      originalName
    );

  const mark =
    normalizeMark(
      originalMark
    );


  // =========================
  // Both Missing
  //
  // Nothing to save.
  // Nothing to report.
  // =========================

  if (
    isMissingValue(
      originalName
    ) &&
    isMissingValue(
      originalMark
    )
  ) {
    return {
      subject: null,
      warnings,
    };
  }


  // =========================
  // Name Missing But Mark Exists
  // =========================

  if (
    !subjectName &&
    !isMissingValue(
      originalMark
    )
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        nameField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          nameField,

        receivedValue:
          originalName ?? null,

        reason:
          `Subject ${subjectNumber} name is missing, so this HSC mark cannot be imported.`,

        expected:
          "Subject name",

        example:
          "English",
      })
    );

    return {
      subject: null,
      warnings,
    };
  }


  // =========================
  // Name Exists But Mark Missing
  // =========================

  if (
    subjectName &&
    isMissingValue(
      originalMark
    )
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        markField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          markField,

        receivedValue:
          null,

        reason:
          `Mark is missing for "${subjectName}". This subject will not be imported.`,

        expected:
          "Numeric mark",

        example:
          "96",
      })
    );

    return {
      subject: null,
      warnings,
    };
  }


  // =========================
  // Mark Exists But Invalid
  //
  // Examples:
  // Absent
  // AB
  // N/A
  // XYZ
  // =========================

  if (
    subjectName &&
    mark === null
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        markField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          markField,

        receivedValue:
          originalMark,

        reason:
          `Invalid mark for "${subjectName}". This subject will not be imported.`,

        expected:
          "Numeric mark",

        example:
          "96",
      })
    );

    return {
      subject: null,
      warnings,
    };
  }


  // =========================
  // Valid Subject
  // =========================

  return {
    subject: {
      subjectName,
      mark,
    },

    warnings,
  };
};

const cleanBoolean = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "number"
  ) {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }

    return null;
  }

  const cleaned =
    cleanText(value)
      .toLowerCase()
      .replace(/\./g, "");


  // =========================
  // TRUE VALUES
  // =========================

  const trueValues = [
    "true",
    "yes",
    "y",
    "1",
  ];

  if (
    trueValues.includes(
      cleaned
    )
  ) {
    return true;
  }


  // =========================
  // FALSE VALUES
  // =========================

  const falseValues = [
    "false",
    "no",
    "n",
    "0",
  ];

  if (
    falseValues.includes(
      cleaned
    )
  ) {
    return false;
  }


  // =========================
  // Invalid Value
  // =========================

  return null;
};



// ============================================================
// NORMALIZE BLOOD GROUP
// ============================================================

const normalizeBloodGroup = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  let cleaned =
    String(value)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");


  // =========================
  // Normalize Rh Wording
  // =========================
  //
  // A+VE       → A+
  // A-VE       → A-
  // A1+VE      → A1+
  // A2B-VE     → A2B-
  // APOSITIVE  → A+
  // BNEGATIVE  → B-
  //
  // =========================

  cleaned =
    cleaned
      .replace(
        /POSITIVE$/,
        "+"
      )
      .replace(
        /NEGATIVE$/,
        "-"
      )
      .replace(
        /\+VE$/,
        "+"
      )
      .replace(
        /-VE$/,
        "-"
      )
      .replace(
        /\+POS$/,
        "+"
      )
      .replace(
        /-NEG$/,
        "-"
      );


  // =========================
  // Allowed Blood Groups
  // =========================

  const allowedBloodGroups =
    new Set([
      // Standard ABO
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",

      // A subgroups
      "A1+",
      "A1-",
      "A2+",
      "A2-",

      // AB subgroups
      "A1B+",
      "A1B-",
      "A2B+",
      "A2B-",
    ]);


  // =========================
  // Validate
  // =========================

  return allowedBloodGroups.has(
    cleaned
  )
    ? cleaned
    : null;
};






const normalizeGender = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    cleanText(value)
      .toLowerCase()
      .replace(/\./g, "")
      .trim();

  if (!cleaned) {
    return null;
  }

  const map = {
    // Male
    male: "Male",
    m: "Male",
    boy: "Male",

    // Female
    female: "Female",
    f: "Female",
    girl: "Female",

    // Other
    other: "Other",
    o: "Other",
    transgender: "Other",
    trans: "Other",
  };

  return map[cleaned] || null;
};




const normalizeReligion = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    cleanText(value)
      .toLowerCase()
      .replace(/\./g, "")
      .trim();

  if (!cleaned) {
    return null;
  }

  const map = {
    hindu: "Hindu",
    hinduism: "Hindu",

    muslim: "Muslim",
    islam: "Muslim",
    islamic: "Muslim",

    christian: "Christian",
    christianity: "Christian",

    other: "Other",
    others: "Other",
  };

  return map[cleaned] || null;
};


const normalizeCommunityCategory = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    cleanText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  if (!cleaned) {
    return null;
  }

  const map = {
    // Open Category
    OC: "OC",

    // Backward Class
    BC: "BC",

    // Most Backward Class
    MBC: "MBC",

    // Backward Class Muslim
    BCM: "BCM",
    BCMUSLIM: "BCM",
    BCMUSLIMS: "BCM",

    // Denotified Community
    DNC: "DNC",

    // Scheduled Caste
    SC: "SC",

    // Scheduled Caste Arunthathiyar
    SCA: "SCA",
    SCARUNTHATHIYAR: "SCA",
    SCARUNTHATHIYARS: "SCA",

    // Scheduled Tribe
    ST: "ST",

    // Explicit Other
    OTHER: "Other",
    OTHERS: "Other",
  };

  return map[cleaned] || null;
};

const normalizeSpecialCategory = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  const categoryMap = {
    sports: "Sports",
    nss: "NSS",
    ncc: "NCC",
    yrc: "YRC",
    rrc: "RRC",
    other: "Other",
  };


  // =========================
  // Values Meaning "None"
  // =========================

  const emptyValues =
    new Set([
      "nil",
      "na",
      "n/a",
      "none",
      "-",
    ]);


  return cleanText(value)
    .split(",")
    .map(
      (item) =>
        cleanText(item)
          .toLowerCase()
    )
    .filter(Boolean)

    // NIL / NA / NONE etc.
    // simply contribute no category.
    .filter(
      (item) =>
        !emptyValues.has(item)
    )

    .map(
      (item) =>
        categoryMap[item] ||
        "Other"
    );
};

const getInvalidSpecialCategories = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  const allowedCategories =
    new Set([
      "sports",
      "nss",
      "ncc",
      "yrc",
      "rrc",
      "other",
      "others",
    ]);

  return String(value)
    .split(",")
    .map((item) =>
      cleanText(item)
        .toLowerCase()
    )
    .filter(Boolean)
    .filter(
      (item) =>
        !allowedCategories.has(
          item
        )
    );
};


const normalizeMediumOfInstruction = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    cleanText(value)
      .toLowerCase()
      .replace(/\./g, "")
      .trim();

  if (!cleaned) {
    return null;
  }

  const map = {
    tamil: "Tamil",
    tam: "Tamil",

    english: "English",
    eng: "English",

    other: "Other",
    others: "Other",
  };

  return map[cleaned] || null;
};


const normalizeAdmissionStatus = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    cleanText(value)
      .toLowerCase()
      .replace(/\./g, "")
      .trim();

  if (!cleaned) {
    return null;
  }

  const map = {
    applied: "Applied",
    application: "Applied",

    selected: "Selected",
    select: "Selected",

    admitted: "Admitted",
    admission: "Admitted",

    discontinued:
      "Discontinued",

    discontinue:
      "Discontinued",
  };

  return map[cleaned] || null;
};


const normalizeSection = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    cleanText(value)
      .toUpperCase();

  return cleaned || null;
};

const normalizeExcelHeader = (header) => {
  if (
    header === null ||
    header === undefined
  ) {
    return "";
  }

  return String(header)
    .trim()
    .toLowerCase()

    // =========================
    // Normalize Apostrophes
    // =========================

    .replace(
      /[’‘`]/g,
      "'"
    )

    // =========================
    // Remove Possessive 's
    //
    // Father's Name
    // → Father Name
    //
    // Student's Email
    // → Student Email
    // =========================

    .replace(
      /'s\b/g,
      ""
    )

    // Remove remaining apostrophes
    .replace(
      /'/g,
      ""
    )

    // =========================
    // Remove all formatting
    //
    // spaces
    // dots
    // slashes
    // underscores
    // hyphens
    // brackets
    // etc.
    // =========================

    .replace(
      /[^a-z0-9]/g,
      ""
    );
};

// ============================================================
// EXCEL HEADER MAP
// ============================================================

const excelHeaderMap = {

  // =========================================================
  // ACADEMIC CONTEXT
  // =========================================================

  institution:
    "institution",

  institutionname:
    "institution",

  department:
    "department",

  departmentname:
    "department",

  programme:
    "programme",

  program:
    "programme",

  coursename:
    "programme",

  course:
    "programme",

  class:
    "class",

  classname:
    "class",

  section:
    "section",

  batch:
    "batch",

  batchname:
    "batch",

  academicyear:
    "academicYear",


  // =========================================================
  // IDENTIFICATION
  // =========================================================

  applicationnumber:
    "applicationNumber",

  applicationno:
    "applicationNumber",

  appnumber:
    "applicationNumber",

  appno:
    "applicationNumber",

  registernumber:
    "registerNumber",

  registerno:
    "registerNumber",

  registrationnumber:
    "registerNumber",

  registrationno:
    "registerNumber",

  regnumber:
    "registerNumber",

  regno:
    "registerNumber",

  studentname:
    "studentName",

  nameofstudent:
    "studentName",


profilephoto:
  "profilePhoto",

studentphoto:
  "profilePhoto",

studentsphoto:
  "profilePhoto",

studentphotograph:
  "profilePhoto",

photo:
  "profilePhoto",



  // =========================================================
  // PERSONAL
  // =========================================================

  dateofbirth:
    "dateOfBirth",

  dob:
    "dateOfBirth",

  birthdate:
    "dateOfBirth",

  age:
    "age",

  gender:
    "gender",

  sex:
    "gender",

  bloodgroup:
    "bloodGroup",

  bloodgrp:
    "bloodGroup",

  religion:
    "religion",

  communitycategory:
    "communityCategory",

  community:
    "communityCategory",

  subcaste:
    "subCaste",

  nativeplace:
    "nativePlace",

  mothertongue:
    "motherTongue",


  // =========================================================
  // PARENT / GUARDIAN
  // =========================================================

  fatherguardianname:
    "fatherGuardianName",

  fatherorguardianname:
    "fatherGuardianName",

  fathername:
    "fatherGuardianName",

  guardianname:
    "fatherGuardianName",

  parentname:
    "fatherGuardianName",

  parentsname:
    "fatherGuardianName",

  guardianrelationship:
    "guardianRelationship",

  relationshipwithguardian:
    "guardianRelationship",

  mothername:
    "motherName",

  fatheroccupation:
    "fatherOccupation",

  guardianoccupation:
    "fatherOccupation",

  motheroccupation:
    "motherOccupation",

  annualincome:
    "annualIncome",

  familyannualincome:
    "annualIncome",


  // =========================================================
  // GOVERNMENT IDs
  // =========================================================

  aadharnumber:
    "aadharNumber",

  aadhaarnumber:
    "aadharNumber",

  aadharno:
    "aadharNumber",

  aadhaarno:
    "aadharNumber",

  emisnumber:
    "emisNumber",

  emisno:
    "emisNumber",

  emis:
    "emisNumber",


  // =========================================================
  // COMMUNICATION ADDRESS
  // =========================================================

  communicationaddressaddressline1:
    "communicationAddress.addressLine1",

  communicationaddressline1:
    "communicationAddress.addressLine1",

  communicationaddressaddress1:
    "communicationAddress.addressLine1",

  communicationaddressaddressline2:
    "communicationAddress.addressLine2",

  communicationaddressline2:
    "communicationAddress.addressLine2",

  communicationaddressaddress2:
    "communicationAddress.addressLine2",

  communicationaddresscity:
    "communicationAddress.city",

  communicationcity:
    "communicationAddress.city",

  communicationaddressdistrict:
    "communicationAddress.district",

  communicationdistrict:
    "communicationAddress.district",

  communicationaddressstate:
    "communicationAddress.state",

  communicationstate:
    "communicationAddress.state",

  communicationaddresspincode:
    "communicationAddress.pincode",

  communicationpincode:
    "communicationAddress.pincode",

  communicationaddresspostalcode:
    "communicationAddress.pincode",


  // =========================================================
  // PERMANENT ADDRESS
  // =========================================================

  permanentaddressaddressline1:
    "permanentAddress.addressLine1",

  permanentaddressline1:
    "permanentAddress.addressLine1",

  permanentaddressaddress1:
    "permanentAddress.addressLine1",

  permanentaddressaddressline2:
    "permanentAddress.addressLine2",

  permanentaddressline2:
    "permanentAddress.addressLine2",

  permanentaddressaddress2:
    "permanentAddress.addressLine2",

  permanentaddresscity:
    "permanentAddress.city",

  permanentcity:
    "permanentAddress.city",

  permanentaddressdistrict:
    "permanentAddress.district",

  permanentdistrict:
    "permanentAddress.district",

  permanentaddressstate:
    "permanentAddress.state",

  permanentstate:
    "permanentAddress.state",

  permanentaddresspincode:
    "permanentAddress.pincode",

  permanentpincode:
    "permanentAddress.pincode",

  permanentaddresspostalcode:
    "permanentAddress.pincode",


  // =========================================================
  // CONTACT
  // =========================================================

  studentmobile:
    "studentMobile",

  studentmobileno:
    "studentMobile",

  studentmobilenumber:
    "studentMobile",

  studentphone:
    "studentMobile",

  studentemail:
    "studentEmail",

  studentemailid:
    "studentEmail",

  email:
    "studentEmail",

  emailid:
    "studentEmail",

  mail:
    "studentEmail",

  mailid:
    "studentEmail",

  gmail:
    "studentEmail",

  gmailid:
    "studentEmail",

  parentmobile:
    "parentMobile",

  parentmobileno:
    "parentMobile",

  parentmobilenumber:
    "parentMobile",

  guardianmobile:
    "parentMobile",

  guardianmobileno:
    "parentMobile",

  guardianmobilenumber:
    "parentMobile",


  // =========================================================
  // UG / HSC
  // =========================================================

  hscexammonth:
    "hscExamMonth",

  hscmonth:
    "hscExamMonth",

  hscexamyear:
    "hscExamYear",

  hscyear:
    "hscExamYear",

  hscschoolname:
    "hscSchoolName",

  schoolname:
    "hscSchoolName",

  lastschoolname:
    "hscSchoolName",

  lastschoolplace:
    "lastSchoolPlace",

  schoolplace:
    "lastSchoolPlace",

  mediumofinstruction:
    "mediumOfInstruction",

  medium:
    "mediumOfInstruction",

  hsctotalmark:
    "hscTotalMark",

  hsctotalmarks:
    "hscTotalMark",

  totalhscmark:
    "hscTotalMark",

  totalhscmarks:
    "hscTotalMark",


  // =========================================================
  // PG QUALIFICATION
  // =========================================================

  previouscollegename:
    "previousCollegeName",

  previouscollege:
    "previousCollegeName",

  qualifyingdegree:
    "qualifyingDegree",

  degreepassingmonth:
    "degreePassingMonth",

  passingmonth:
    "degreePassingMonth",

  degreepassingyear:
    "degreePassingYear",

  passingyear:
    "degreePassingYear",

  semestertype:
    "semesterType",

  major:
    "major",

  nonmajor:
    "nonMajor",

  degreetotalmark:
    "degreeTotalMark",

  degreetotalmarks:
    "degreeTotalMark",


  // =========================================================
  // FACILITIES
  // =========================================================

  hostelrequired:
    "hostelRequired",

  hostel:
    "hostelRequired",

  transportrequired:
    "transportRequired",

  transport:
    "transportRequired",

  scholarshipholder:
    "scholarshipHolder",

  scholarship:
    "scholarshipHolder",

  specialcategory:
    "specialCategory",


  // =========================================================
  // ADMISSION
  // =========================================================

  admissionstatus:
    "admissionStatus",
};

const mapDynamicExcelHeader = (
  normalizedHeader
) => {
  if (!normalizedHeader) {
    return null;
  }


  // =========================================================
  // HSC MARKS
  // =========================================================
  //
  // Examples that normalize correctly:
  //
  // HSC Marks.subject1 Name
  // HSC Marks.Subject 1 Name
  // HSC Marks - Subject 1 Name
  //
  // → hscmarkssubject1name
  //
  //
  // HSC Marks.subject1 Mark
  // HSC Marks.Subject 1 Mark
  //
  // → hscmarkssubject1mark
  // =========================================================

  let match =
    normalizedHeader.match(
      /^hscmarkssubject(\d+)(name|mark)$/
    );

  if (match) {
    const subjectNumber =
      Number(match[1]);

    if (
      !Number.isInteger(
        subjectNumber
      ) ||
      subjectNumber < 1
    ) {
      return null;
    }

    const property =
      match[2] === "name"
        ? "Name"
        : "Mark";

    return (
      `hscMarks.subject` +
      `${subjectNumber}` +
      `${property}`
    );
  }


  // =========================================================
  // PG DEGREE MARKS
  // =========================================================
  //
  // Examples:
  //
  // Degree Marks.Subject 1 Name
  // Degree Marks.Subject1 Maximum Mark
  // Degree Marks.Subject 1 Obtained Mark
  // Degree Marks.Subject1 Percentage
  // Degree Marks.Subject 1 Class Obtained
  //
  // =========================================================

  match =
    normalizedHeader.match(
      /^degreemarkssubject(\d+)(name|maximummark|obtainedmark|percentage|classobtained)$/
    );

  if (match) {
    const subjectNumber =
      Number(match[1]);

    if (
      !Number.isInteger(
        subjectNumber
      ) ||
      subjectNumber < 1
    ) {
      return null;
    }

    const propertyMap = {
      name:
        "Name",

      maximummark:
        "MaximumMark",

      obtainedmark:
        "ObtainedMark",

      percentage:
        "Percentage",

      classobtained:
        "ClassObtained",
    };

    const property =
      propertyMap[
        match[2]
      ];

    if (!property) {
      return null;
    }

    return (
      `degreeMarks.subject` +
      `${subjectNumber}` +
      `${property}`
    );
  }


  // =========================================================
  // Not a recognized dynamic header
  // =========================================================

  return null;
};


// ============================================================
// NORMALIZE EXCEL ROW
// ============================================================

const normalizeExcelRow = (row) => {
  const normalized = {};

  for (
    const [originalKey, value]
    of Object.entries(row)
  ) {
    // =========================
    // Normalize Header
    // =========================

    const normalizedKey =
      normalizeExcelHeader(
        originalKey
      );

    if (!normalizedKey) {
      continue;
    }


    // =========================
    // Static Header Map
    // =========================

    const mappedKey =
      excelHeaderMap[
        normalizedKey
      ];

    if (mappedKey) {
      normalized[mappedKey] =
        value;

      continue;
    }


    // =========================
    // Dynamic Headers
    //
    // HSC Marks
    // PG Degree Marks
    // =========================

    const dynamicKey =
      mapDynamicExcelHeader(
        normalizedKey
      );

    if (dynamicKey) {
      normalized[dynamicKey] =
        value;

      continue;
    }


    // =========================
    // UNKNOWN HEADER
    // =========================
    //
    // IMPORTANT:
    //
    // Do NOT do:
    //
    // normalized[normalizedKey] =
    //   value;
    //
    // Unknown Excel columns should
    // not enter student data.
    //
    // Header validation will report
    // them separately.
    // =========================
  }

  return normalized;
};

// ============================================================
// EXCEL COLUMN LETTER HELPER
// ============================================================

const getExcelColumnLetter = (index) => {
  let column = "";
  let number = index + 1;

  while (number > 0) {
    const remainder =
      (number - 1) % 26;

    column =
      String.fromCharCode(
        65 + remainder
      ) + column;

    number =
      Math.floor(
        (number - 1) / 26
      );
  }

  return column;
};


// ============================================================
// REQUIRED EXCEL HEADERS
// ============================================================
//
// Keep this list SMALL.
//
// These are columns that must exist in the Excel file itself
// before we attempt row processing.
//
// Academic IDs are coming from frontend/JWT, so institution,
// department, programme and batch do NOT need to be required
// Excel columns.
//
// We can change this list later after final schema decisions.
// ============================================================

const requiredExcelFields = [
  {
    field: "studentName",
    header: "Student Name",
  },
];


// ============================================================
// CHECK WHETHER HEADER IS RECOGNIZED
// ============================================================

const resolveExcelHeader = (
  originalHeader
) => {
  const normalizedHeader =
    normalizeExcelHeader(
      originalHeader
    );

  if (!normalizedHeader) {
    return null;
  }


  // Static alias
  const staticField =
    excelHeaderMap[
      normalizedHeader
    ];

  if (staticField) {
    return staticField;
  }


  // Dynamic HSC / PG field
  const dynamicField =
    mapDynamicExcelHeader(
      normalizedHeader
    );

  if (dynamicField) {
    return dynamicField;
  }


  return null;
};


// ============================================================
// VALIDATE EXCEL HEADERS
// ============================================================

const validateExcelHeaders = (
  headers = []
) => {
  const headerIssues = [];
  const recognizedFields =
    new Set();

    const fieldColumns =
  new Map();

  // =========================
  // Inspect Every Column
  // =========================

  headers.forEach(
    (originalHeader, index) => {
      const column =
        getExcelColumnLetter(
          index
        );

      const cleanedHeader =
        cleanText(
          originalHeader
        );


      // -------------------------
      // Empty Header
      // -------------------------

      if (!cleanedHeader) {
        headerIssues.push({
          type:
            "EMPTY_HEADER",

          severity:
            "warning",

          column,

          receivedHeader:
            null,

          reason:
            "This Excel column does not have a header.",

          action:
            "Column will be ignored.",
        });

        return;
      }


      // -------------------------
      // Resolve Header
      // -------------------------

      const resolvedField =
        resolveExcelHeader(
          originalHeader
        );


      // -------------------------
      // Unknown Header
      // -------------------------

      if (!resolvedField) {
        headerIssues.push({
          type:
            "UNRECOGNIZED_HEADER",

          severity:
            "warning",

          column,

          receivedHeader:
            cleanedHeader,

          reason:
            "This Excel header is not recognized.",

          action:
            "Column will be ignored.",
        });

        return;
      }


      // -------------------------
      // Recognized
      // -------------------------

    // -------------------------
// Duplicate Mapped Field
// -------------------------

if (
  fieldColumns.has(
    resolvedField
  )
) {
  const existing =
    fieldColumns.get(
      resolvedField
    );

  headerIssues.push({
    type:
      "DUPLICATE_MAPPED_HEADER",

    severity:
      "error",

    column,

    receivedHeader:
      cleanedHeader,

    field:
      resolvedField,

    conflictingColumn:
      existing.column,

    conflictingHeader:
      existing.header,

    reason:
      `This header and column ${existing.column} both map to "${resolvedField}".`,

    action:
      "Keep only one of these columns before uploading.",
  });

  return;
}


// -------------------------
// First Column For Field
// -------------------------

fieldColumns.set(
  resolvedField,
  {
    column,
    header:
      cleanedHeader,
  }
);

recognizedFields.add(
  resolvedField
);
    }
  );


  // =========================
  // Check Required Headers
  // =========================

  for (
    const required
    of requiredExcelFields
  ) {
    if (
      !recognizedFields.has(
        required.field
      )
    ) {
      headerIssues.push({
        type:
          "MISSING_REQUIRED_HEADER",

        severity:
          "error",

        column:
          null,

        receivedHeader:
          null,

        field:
          required.field,

        expectedHeader:
          required.header,

        reason:
          `Required Excel header "${required.header}" is missing.`,

        action:
          `Add the "${required.header}" column before uploading again.`,
      });
    }
  }


  // =========================
  // Result
  // =========================

  const errors =
    headerIssues.filter(
      (issue) =>
        issue.severity ===
        "error"
    );

  const warnings =
    headerIssues.filter(
      (issue) =>
        issue.severity ===
        "warning"
    );


  return {
    isValid:
      errors.length === 0,

    headerIssues,

    errors,

    warnings,

    recognizedFields: [
      ...recognizedFields,
    ],
  };
};

// ============================================================
// CHECK IF EXCEL CELL IS EMPTY
// ============================================================

const isEmptyExcelValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value === "string"
  ) {
    return value.trim() === "";
  }

  return false;
};


// ============================================================
// CHECK IF EXCEL ROW IS BLANK
// ============================================================

const isBlankExcelRow = (row) => {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return true;
  }

  const values =
    Object.values(row);

  if (values.length === 0) {
    return true;
  }

  return values.every(
    (value) =>
      isEmptyExcelValue(value)
  );
};

// ============================================================
// ROW ISSUE TYPES
// ============================================================

const ROW_ISSUE_SEVERITY = {
  ERROR: "error",
  WARNING: "warning",
};


// ============================================================
// CREATE ROW ISSUE
// ============================================================

const createRowIssue = ({
  row,
  column = null,
  header = null,
  field = null,
  receivedValue = null,
  reason,
  expected = null,
  example = null,
  severity = "error",
}) => {
  return {
    row,

    column,

    header,

    field,

    receivedValue:
      receivedValue === undefined
        ? null
        : receivedValue,

    reason,

    expected,

    example,

    severity,
  };
};

// ============================================================
// BUILD EXCEL FIELD LOCATION MAP
// ============================================================
//
// Converts:
//
// [
//   "Student Name",
//   "Date of Birth",
//   "Blood Group",
//   "Gmail ID"
// ]
//
// Into:
//
// {
//   studentName: {
//     column: "A",
//     header: "Student Name"
//   },
//
//   dateOfBirth: {
//     column: "B",
//     header: "Date of Birth"
//   },
//
//   bloodGroup: {
//     column: "C",
//     header: "Blood Group"
//   },
//
//   studentEmail: {
//     column: "D",
//     header: "Gmail ID"
//   }
// }
//
// ============================================================

// ============================================================
// GET EXCEL FIELD LOCATION
// ============================================================

const getExcelFieldLocation = (
  fieldLocationMap,
  field
) => {
  return (
    fieldLocationMap?.[
      field
    ] || {
      column: null,
      header: null,
    }
  );
};


const buildExcelFieldLocationMap = (
  headers = []
) => {
  const fieldLocationMap = {};

  headers.forEach(
    (originalHeader, index) => {
      const cleanedHeader =
        cleanText(
          originalHeader
        );

      if (!cleanedHeader) {
        return;
      }


      // -------------------------
      // Resolve Header
      // -------------------------

      const field =
        resolveExcelHeader(
          originalHeader
        );

      if (!field) {
        return;
      }


      // -------------------------
      // Excel Column
      // -------------------------

      const column =
        getExcelColumnLetter(
          index
        );


      // -------------------------
      // Store First Match Only
      // -------------------------
      //
      // Duplicate mapped headers
      // are already detected by
      // validateExcelHeaders().
      //
      // We never silently overwrite
      // an existing location.
      // -------------------------

      if (
        !fieldLocationMap[
          field
        ]
      ) {
        fieldLocationMap[
          field
        ] = {
          column,
          header:
            cleanedHeader,
        };
      }
    }
  );

  return fieldLocationMap;
};

// ============================================================
// CHECK IF VALUE IS MISSING
// ============================================================
//
// Missing:
// null
// undefined
// ""
// "   "
//
// NOT missing:
// 0
// false
// "0"
// "No"
// "Absent"
//
// ============================================================

const isMissingValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value === "string"
  ) {
    return value.trim() === "";
  }

  return false;
};


// ============================================================
// VALIDATE REQUIRED NORMALIZED VALUE
// ============================================================
//
// Use when:
//
// 1. Field is required
// 2. Original Excel value may be missing
// 3. Normalizer may return null for invalid data
//
// Example:
//
// DOB:
// blank         → missing error
// "long Absent" → invalid error
// "17-05-2007"  → valid
//
// ============================================================

const validateRequiredNormalizedValue = ({
  rowNumber,

  field,

  originalValue,

  normalizedValue,

  fieldLocationMap,

  missingReason =
    "Required value is missing.",

  invalidReason =
    "The provided value is invalid.",

  expected = null,

  example = null,
}) => {
  const location =
    getExcelFieldLocation(
      fieldLocationMap,
      field
    );


  // =========================
  // Missing
  // =========================

  if (
    isMissingValue(
      originalValue
    )
  ) {
    return createRowError({
      row:
        rowNumber,

      column:
        location.column,

      header:
        location.header,

      field,

      receivedValue:
        null,

      reason:
        missingReason,

      expected,

      example,
    });
  }


  // =========================
  // Present But Invalid
  // =========================

  if (
    normalizedValue === null ||
    normalizedValue === undefined
  ) {
    return createRowError({
      row:
        rowNumber,

      column:
        location.column,

      header:
        location.header,

      field,

      receivedValue:
        originalValue,

      reason:
        invalidReason,

      expected,

      example,
    });
  }


  // =========================
  // Valid
  // =========================

  return null;
};


// ============================================================
// VALIDATE OPTIONAL NORMALIZED VALUE
// ============================================================
//
// Optional field:
//
// blank
// → no issue
//
// invalid supplied value
// → warning
//
// valid supplied value
// → no issue
//
// ============================================================

const validateOptionalNormalizedValue = ({
  rowNumber,

  field,

  originalValue,

  normalizedValue,

  fieldLocationMap,

  invalidReason =
    "The provided value is invalid.",

  expected = null,

  example = null,
}) => {

  // =========================
  // Missing Is Fine
  // =========================

  if (
    isMissingValue(
      originalValue
    )
  ) {
    return null;
  }


  // =========================
  // Present And Valid
  // =========================

  if (
    normalizedValue !== null &&
    normalizedValue !== undefined
  ) {
    return null;
  }


  // =========================
  // Present But Invalid
  // =========================

  const location =
    getExcelFieldLocation(
      fieldLocationMap,
      field
    );

  return createRowWarning({
    row:
      rowNumber,

    column:
      location.column,

    header:
      location.header,

    field,

    receivedValue:
      originalValue,

    reason:
      invalidReason,

    expected,

    example,
  });
};

// ============================================================
// VALIDATE STUDENT EXCEL ROW
// ============================================================

const validateStudentExcelRow = ({
  row,
  rowNumber,
  fieldLocationMap,
}) => {
  const errors = [];
  const warnings = [];


  // =========================================================
  // NORMALIZED VALUES
  // =========================================================

  const studentName =
    cleanNullableText(
      row.studentName
    );

  const dateOfBirth =
    normalizeExcelDate(
      row.dateOfBirth
    );

  const gender =
    normalizeGender(
      row.gender
    );

  const religion =
    normalizeReligion(
      row.religion
    );

  const communityCategory =
    normalizeCommunityCategory(
      row.communityCategory
    );

  const bloodGroup =
    normalizeBloodGroup(
      row.bloodGroup
    );

  const studentEmail =
    cleanEmail(
      row.studentEmail
    );

  const mediumOfInstruction =
    normalizeMediumOfInstruction(
      row.mediumOfInstruction
    );

  const admissionStatus =
    normalizeAdmissionStatus(
      row.admissionStatus
    );


  // =========================================================
  // REQUIRED — STUDENT NAME
  // =========================================================

  if (!studentName) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        "studentName"
      );

    errors.push(
      createRowError({
        row: rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "studentName",

        receivedValue:
          row.studentName ??
          null,

        reason:
          "Student name is required.",

        expected:
          "Student name",

        example:
          "BRINDHA K",
      })
    );
  }


  // =========================================================
  // DATE OF BIRTH
  // =========================================================
  //
  // Your current schema requires DOB.
  //
  // Blank        → error
  // long Absent  → error
  // 17.05.2007   → valid
  //
  // =========================================================

  const dobIssue =
    validateRequiredNormalizedValue({
      rowNumber,

      field:
        "dateOfBirth",

      originalValue:
        row.dateOfBirth,

      normalizedValue:
        dateOfBirth,

      fieldLocationMap,

      missingReason:
        "Date of birth is required.",

      invalidReason:
        "Invalid date of birth format.",

     expected:
  "DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY or YYYY-MM-DD",

      example:
        "17-05-2007",
    });

  if (dobIssue) {
    errors.push(dobIssue);
  }


  // =========================================================
  // GENDER
  // =========================================================

  const genderIssue =
    validateRequiredNormalizedValue({
      rowNumber,

      field:
        "gender",

      originalValue:
        row.gender,

      normalizedValue:
        gender,

      fieldLocationMap,

      missingReason:
        "Gender is required.",

      invalidReason:
        "Unrecognized gender value.",

      expected:
        "Male, Female or Other",

      example:
        "Female",
    });

  if (genderIssue) {
    errors.push(
      genderIssue
    );
  }


  // =========================================================
  // RELIGION
  // =========================================================

  const religionIssue =
    validateRequiredNormalizedValue({
      rowNumber,

      field:
        "religion",

      originalValue:
        row.religion,

      normalizedValue:
        religion,

      fieldLocationMap,

      missingReason:
        "Religion is required.",

      invalidReason:
        "Unrecognized religion value.",

      expected:
        "Hindu, Muslim, Christian or Other",

      example:
        "Hindu",
    });

  if (religionIssue) {
    errors.push(
      religionIssue
    );
  }


  // =========================================================
  // COMMUNITY CATEGORY
  // =========================================================

  const communityIssue =
    validateRequiredNormalizedValue({
      rowNumber,

      field:
        "communityCategory",

      originalValue:
        row.communityCategory,

      normalizedValue:
        communityCategory,

      fieldLocationMap,

      missingReason:
        "Community category is required.",

      invalidReason:
        "Unrecognized community category.",

      expected:
        "OC, BC, MBC, BCM, DNC, SC, SCA, ST or Other",

      example:
        "MBC",
    });

  if (communityIssue) {
    errors.push(
      communityIssue
    );
  }


  // =========================================================
  // OPTIONAL — BLOOD GROUP
  // =========================================================

  const bloodGroupIssue =
    validateOptionalNormalizedValue({
      rowNumber,

      field:
        "bloodGroup",

      originalValue:
        row.bloodGroup,

      normalizedValue:
        bloodGroup,

      fieldLocationMap,

      invalidReason:
        "Unsupported blood group.",

   expected:
  "A+, A-, B+, B-, AB+, AB-, O+, O-, A1+, A1-, A2+, A2-, A1B+, A1B-, A2B+ or A2B-",

      example:
        "O+",
    });

  if (bloodGroupIssue) {
    warnings.push(
      bloodGroupIssue
    );
  }


  // =========================================================
  // OPTIONAL — STUDENT EMAIL
  // =========================================================

  if (
    !isMissingValue(
      row.studentEmail
    ) &&
    !isValidEmail(
      row.studentEmail
    )
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        "studentEmail"
      );

    warnings.push(
      createRowWarning({
        row: rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "studentEmail",

        receivedValue:
          row.studentEmail,

        reason:
          "Invalid student email format.",

        expected:
          "A valid email address",

        example:
          "student@example.com",
      })
    );
  }


  // =========================================================
  // OPTIONAL — MEDIUM OF INSTRUCTION
  // =========================================================

  const mediumIssue =
    validateOptionalNormalizedValue({
      rowNumber,

      field:
        "mediumOfInstruction",

      originalValue:
        row.mediumOfInstruction,

      normalizedValue:
        mediumOfInstruction,

      fieldLocationMap,

      invalidReason:
        "Unrecognized medium of instruction.",

      expected:
        "Tamil, English or Other",

      example:
        "English",
    });

  if (mediumIssue) {
    warnings.push(
      mediumIssue
    );
  }


  // =========================================================
  // OPTIONAL — ADMISSION STATUS
  // =========================================================

  const admissionIssue =
    validateOptionalNormalizedValue({
      rowNumber,

      field:
        "admissionStatus",

      originalValue:
        row.admissionStatus,

      normalizedValue:
        admissionStatus,

      fieldLocationMap,

      invalidReason:
        "Unrecognized admission status.",

      expected:
        "Applied, Selected, Admitted or Discontinued",

      example:
        "Applied",
    });

  if (admissionIssue) {
    warnings.push(
      admissionIssue
    );
  }


  // =========================================================
  // OPTIONAL BOOLEAN FIELDS
  // =========================================================

  const booleanFields = [
    {
      field:
        "hostelRequired",

      label:
        "Hostel Required",
    },

    {
      field:
        "transportRequired",

      label:
        "Transport Required",
    },

    {
      field:
        "scholarshipHolder",

      label:
        "Scholarship Holder",
    },
  ];


  for (
    const config
    of booleanFields
  ) {
    const originalValue =
      row[config.field];

    if (
      isMissingValue(
        originalValue
      )
    ) {
      continue;
    }

    const normalizedValue =
      cleanBoolean(
        originalValue
      );

    if (
      normalizedValue ===
      null
    ) {
      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          config.field
        );

      warnings.push(
        createRowWarning({
          row:
            rowNumber,

          column:
            location.column,

          header:
            location.header ||
            config.label,

          field:
            config.field,

          receivedValue:
            originalValue,

          reason:
            `Invalid value for ${config.label}.`,

          expected:
            "Yes or No",

          example:
            "Yes",
        })
      );
    }
  }


// =========================================================
// SPECIAL CATEGORY
// =========================================================

const specialCategory =
  normalizeSpecialCategory(
    row.specialCategory
  );

const invalidSpecialCategories =
  getInvalidSpecialCategories(
    row.specialCategory
  );

if (
  invalidSpecialCategories.length >
  0
) {
  const location =
    getExcelFieldLocation(
      fieldLocationMap,
      "specialCategory"
    );

  warnings.push(
    createRowWarning({
      row:
        rowNumber,

      column:
        location.column,

      header:
        location.header,

      field:
        "specialCategory",

      receivedValue:
        row.specialCategory,

      reason:
        `Unrecognized special category: ${invalidSpecialCategories.join(", ")}. Invalid value(s) were ignored.`,

      expected:
        "Sports, NSS, NCC, YRC, RRC or Other",

      example:
        "NSS, YRC",
    })
  );
}

  // =========================================================
// HSC MARKS
// =========================================================

const hscResult =
  validateHscMarks({
    row,
    rowNumber,
    fieldLocationMap,
  });

warnings.push(
  ...hscResult.warnings
);      

// =========================================================
// PG DEGREE MARKS
// =========================================================

const degreeResult =
  validateDegreeMarks({
    row,
    rowNumber,
    fieldLocationMap,
  });

warnings.push(
  ...degreeResult.warnings
);


  // =========================================================
  // RESULT
  // =========================================================

  return {
    isValid:
      errors.length === 0,

    errors,

    warnings,


    // These are safe normalized
    // values the service can reuse.

normalizedValues: {

  studentName,

  profilePhoto:
  cleanNullableText(
    row.profilePhoto
  ),

  applicationNumber:
    cleanNullableText(
      row.applicationNumber
    ),

  registerNumber:
    cleanNullableText(
      row.registerNumber
    ),

  academicYear:
    cleanNullableText(
      row.academicYear
    ),

  dateOfBirth,

  gender,

  religion,

  communityCategory,

  bloodGroup,

  studentEmail:
    isValidEmail(
      row.studentEmail
    )
      ? studentEmail
      : null,

  mediumOfInstruction,

  hscMarks:
    hscResult.hscMarks,

  hscTotalMark:
    hscResult.hscTotalMark,

  degreeMarks:
    degreeResult.degreeMarks,

  degreeTotalMark:
    degreeResult.degreeTotalMark,

  specialCategory,

  admissionStatus,

  hostelRequired:
    cleanBoolean(
      row.hostelRequired
    ),

  transportRequired:
    cleanBoolean(
      row.transportRequired
    ),

  scholarshipHolder:
    cleanBoolean(
      row.scholarshipHolder
    ),
},
  };
};

// ============================================================
// COLLECT AND VALIDATE ALL HSC SUBJECTS
// ============================================================

const validateHscMarks = ({
  row,
  rowNumber,
  fieldLocationMap,
}) => {
  const hscMarks = [];
  const warnings = [];

  const subjectNumbers =
    new Set();


  // =========================
  // Find Available Subjects
  // =========================
  //
  // Example keys:
  //
  // hscMarks.subject1Name
  // hscMarks.subject1Mark
  // hscMarks.subject2Name
  // hscMarks.subject2Mark
  //
  // =========================

  for (
    const key
    of Object.keys(row)
  ) {
    const match =
      key.match(
        /^hscMarks\.subject(\d+)(Name|Mark)$/
      );

    if (!match) {
      continue;
    }

    const subjectNumber =
      Number(match[1]);

    if (
      Number.isInteger(
        subjectNumber
      ) &&
      subjectNumber > 0
    ) {
      subjectNumbers.add(
        subjectNumber
      );
    }
  }


  // =========================
  // Sort Subject Numbers
  // =========================

  const sortedSubjectNumbers =
    [...subjectNumbers]
      .sort(
        (a, b) => a - b
      );


  // =========================
  // Validate Each Pair
  // =========================

  for (
    const subjectNumber
    of sortedSubjectNumbers
  ) {
    const result =
      validateHscSubjectPair({
        row,
        rowNumber,
        subjectNumber,
        fieldLocationMap,
      });

    warnings.push(
      ...result.warnings
    );

    if (result.subject) {
      hscMarks.push(
        result.subject
      );
    }
  }


  // =========================
  // HSC Total Mark
  // =========================

  const originalTotal =
    row.hscTotalMark;

  let hscTotalMark =
    normalizeMark(
      originalTotal
    );


  // Missing total is fine.
  // Calculate it from imported
  // subjects when possible.

  if (
    isMissingValue(
      originalTotal
    )
  ) {
    hscTotalMark =
      hscMarks.reduce(
        (total, subject) =>
          total +
          subject.mark,
        0
      );
  }


  // =========================
  // Invalid Supplied Total
  // =========================

  else if (
    hscTotalMark === null
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        "hscTotalMark"
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "hscTotalMark",

        receivedValue:
          originalTotal,

        reason:
          "Invalid HSC total mark. The total was recalculated from valid subject marks.",

        expected:
          "Numeric total mark",

        example:
          "548",
      })
    );


    hscTotalMark =
      hscMarks.reduce(
        (total, subject) =>
          total +
          subject.mark,
        0
      );
  }


  // =========================
// Total Mark Consistency
// =========================

const calculatedTotal =
  hscMarks.reduce(
    (total, subject) =>
      total + subject.mark,
    0
  );


// Only compare when:
//
// 1. Excel actually supplied a total
// 2. The supplied total is valid
// 3. We have valid subjects to compare
//
// Missing/invalid totals were already
// handled above.
// =========================

if (
  !isMissingValue(
    originalTotal
  ) &&
  normalizeMark(
    originalTotal
  ) !== null &&
  hscMarks.length > 0 &&
  hscTotalMark !==
    calculatedTotal
) {
  const location =
    getExcelFieldLocation(
      fieldLocationMap,
      "hscTotalMark"
    );

  warnings.push(
    createRowWarning({
      row:
        rowNumber,

      column:
        location.column,

      header:
        location.header,

      field:
        "hscTotalMark",

      receivedValue:
        originalTotal,

      reason:
        `HSC total mark does not match the sum of the valid subject marks. Calculated total is ${calculatedTotal}.`,

      expected:
        calculatedTotal,

      example:
        calculatedTotal,
    })
  );
}
  // =========================
  // Result
  // =========================

  return {
    hscMarks,

    hscTotalMark,

    warnings,
  };
};



// ============================================================
// VALIDATE ONE PG DEGREE SUBJECT
// ============================================================

const validateDegreeSubject = ({
  row,
  rowNumber,
  subjectNumber,
  fieldLocationMap,
}) => {
  const warnings = [];

  const nameField =
    `degreeMarks.subject${subjectNumber}Name`;

  const maximumMarkField =
    `degreeMarks.subject${subjectNumber}MaximumMark`;

  const obtainedMarkField =
    `degreeMarks.subject${subjectNumber}ObtainedMark`;

  const percentageField =
    `degreeMarks.subject${subjectNumber}Percentage`;

  const classField =
    `degreeMarks.subject${subjectNumber}ClassObtained`;


  // =========================
  // Original Values
  // =========================

  const originalName =
    row[nameField];

  const originalMaximumMark =
    row[maximumMarkField];

  const originalObtainedMark =
    row[obtainedMarkField];

  const originalPercentage =
    row[percentageField];

  const originalClass =
    row[classField];


  // =========================
  // Completely Empty Subject
  // =========================

  const allMissing = [
    originalName,
    originalMaximumMark,
    originalObtainedMark,
    originalPercentage,
    originalClass,
  ].every(
    (value) =>
      isMissingValue(value)
  );

  if (allMissing) {
    return {
      subject: null,
      warnings,
    };
  }


  // =========================
  // Subject Name
  // =========================

  const subjectName =
    cleanNullableText(
      originalName
    );

  if (!subjectName) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        nameField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          nameField,

        receivedValue:
          originalName ?? null,

        reason:
          `Degree subject ${subjectNumber} name is missing. This subject will not be imported.`,

        expected:
          "Subject name",

        example:
          "Computer Science",
      })
    );

    return {
      subject: null,
      warnings,
    };
  }


  // =========================
  // Marks
  // =========================

  const maximumMark =
    normalizeMark(
      originalMaximumMark
    );

  const obtainedMark =
    normalizeMark(
      originalObtainedMark
    );


  // Invalid supplied maximum mark

  if (
    !isMissingValue(
      originalMaximumMark
    ) &&
    maximumMark === null
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        maximumMarkField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          maximumMarkField,

        receivedValue:
          originalMaximumMark,

        reason:
          `Invalid maximum mark for "${subjectName}".`,

        expected:
          "Numeric mark",

        example:
          "100",
      })
    );
  }


  // Invalid supplied obtained mark

  if (
    !isMissingValue(
      originalObtainedMark
    ) &&
    obtainedMark === null
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        obtainedMarkField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          obtainedMarkField,

        receivedValue:
          originalObtainedMark,

        reason:
          `Invalid obtained mark for "${subjectName}".`,

        expected:
          "Numeric mark",

        example:
          "78",
      })
    );
  }


  // =========================
  // Percentage
  // =========================

  let percentage =
    normalizeMark(
      originalPercentage
    );

  if (
    !isMissingValue(
      originalPercentage
    ) &&
    percentage === null
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        percentageField
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          percentageField,

        receivedValue:
          originalPercentage,

        reason:
          `Invalid percentage for "${subjectName}".`,

        expected:
          "Numeric percentage",

        example:
          "78",
      })
    );
  }


  // =========================
  // Calculate Percentage
  // =========================

  if (
    percentage === null &&
    maximumMark !== null &&
    maximumMark > 0 &&
    obtainedMark !== null
  ) {
    percentage =
      Number(
        (
          (
            obtainedMark /
            maximumMark
          ) * 100
        ).toFixed(2)
      );
  }


  // =========================
  // Result
  // =========================

  return {
    subject: {
      subjectName,

      maximumMark:
        maximumMark ?? 0,

      obtainedMark:
        obtainedMark ?? 0,

      percentage:
        percentage ?? 0,

      classObtained:
        cleanNullableText(
          originalClass
        ),
    },

    warnings,
  };
};
// ============================================================
// COLLECT AND VALIDATE ALL PG DEGREE SUBJECTS
// ============================================================

const validateDegreeMarks = ({
  row,
  rowNumber,
  fieldLocationMap,
}) => {
  const degreeMarks = [];
  const warnings = [];

  const subjectNumbers =
    new Set();


  // =========================
  // Find Available Subjects
  // =========================

  for (
    const key
    of Object.keys(row)
  ) {
    const match =
      key.match(
        /^degreeMarks\.subject(\d+)(Name|MaximumMark|ObtainedMark|Percentage|ClassObtained)$/
      );

    if (!match) {
      continue;
    }

    const subjectNumber =
      Number(match[1]);

    if (
      Number.isInteger(
        subjectNumber
      ) &&
      subjectNumber > 0
    ) {
      subjectNumbers.add(
        subjectNumber
      );
    }
  }


  // =========================
  // Sort Subjects
  // =========================

  const sortedSubjectNumbers =
    [...subjectNumbers]
      .sort(
        (a, b) => a - b
      );


  // =========================
  // Validate Subjects
  // =========================

  for (
    const subjectNumber
    of sortedSubjectNumbers
  ) {
    const result =
      validateDegreeSubject({
        row,
        rowNumber,
        subjectNumber,
        fieldLocationMap,
      });

    warnings.push(
      ...result.warnings
    );

    if (result.subject) {
      degreeMarks.push(
        result.subject
      );
    }
  }


  // =========================
  // Degree Total Mark
  // =========================

  const originalTotal =
    row.degreeTotalMark;

  let degreeTotalMark =
    normalizeMark(
      originalTotal
    );


  // =========================
  // Calculate Obtained Total
  // =========================

  const calculatedTotal =
    degreeMarks.reduce(
      (total, subject) =>
        total +
        subject.obtainedMark,
      0
    );


  // =========================
  // Missing Total
  // =========================

  if (
    isMissingValue(
      originalTotal
    )
  ) {
    degreeTotalMark =
      calculatedTotal;
  }


  // =========================
  // Invalid Supplied Total
  // =========================

  else if (
    degreeTotalMark === null
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        "degreeTotalMark"
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "degreeTotalMark",

        receivedValue:
          originalTotal,

        reason:
          "Invalid degree total mark. The total was recalculated from valid obtained marks.",

        expected:
          "Numeric total mark",

        example:
          "1250",
      })
    );

    degreeTotalMark =
      calculatedTotal;
  }


  // =========================
  // Total Mismatch
  // =========================

  else if (
    degreeMarks.length > 0 &&
    degreeTotalMark !==
      calculatedTotal
  ) {
    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        "degreeTotalMark"
      );

    warnings.push(
      createRowWarning({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "degreeTotalMark",

        receivedValue:
          originalTotal,

        reason:
          `Degree total mark does not match the sum of valid obtained marks. Calculated total is ${calculatedTotal}.`,

        expected:
          calculatedTotal,

        example:
          calculatedTotal,
      })
    );
  }


  // =========================
  // Result
  // =========================

  return {
    degreeMarks,

    degreeTotalMark,

    warnings,
  };
};
// ============================================================
// CREATE ROW ERROR
// ============================================================

const createRowError = ({
  row,
  column = null,
  header = null,
  field = null,
  receivedValue = null,
  reason,
  expected = null,
  example = null,
}) => {
  return createRowIssue({
    row,
    column,
    header,
    field,
    receivedValue,
    reason,
    expected,
    example,

    severity:
      ROW_ISSUE_SEVERITY.ERROR,
  });
};


// ============================================================
// CREATE ROW WARNING
// ============================================================
const createRowWarning = ({
  row,
  column = null,
  header = null,
  field = null,
  receivedValue = null,
  reason,
  expected = null,
  example = null,
}) => {
  return createRowIssue({
    row,
    column,
    header,
    field,
    receivedValue,
    reason,
    expected,
    example,

    severity:
      ROW_ISSUE_SEVERITY.WARNING,
  });
};

const normalizeExcelDate = (value) => {
  // =========================
  // Missing
  // =========================

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  // =========================
  // JavaScript Date
  // =========================

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }


  // =========================
  // Excel Serial Date
  //
  // Example:
  // 39296
  // =========================

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    const excelEpoch =
      Date.UTC(
        1899,
        11,
        30
      );

    const milliseconds =
      Math.round(
        value * 86400000
      );

    const date =
      new Date(
        excelEpoch +
        milliseconds
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }


  // =========================
  // Clean String
  // =========================

const cleaned =
  cleanText(value)
    // Remove spaces around date separators.
    //
    // 2007 .01.15  → 2007.01.15
    // 17 / 05 / 2007 → 17/05/2007
    // 17 - 05 - 2007 → 17-05-2007
    .replace(
      /\s*([./-])\s*/g,
      "$1"
    );

if (!cleaned) {
  return null;
}


  // =========================
  // DD-MM-YYYY
  // DD/MM/YYYY
  // DD.MM.YYYY
  //
  // Examples:
  // 17-05-2007
  // 17/05/2007
  // 17.05.2007
  // =========================

  const dmyMatch =
    cleaned.match(
      /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/
    );

  if (dmyMatch) {
    const day =
      Number(dmyMatch[1]);

    const month =
      Number(dmyMatch[2]);

    const year =
      Number(dmyMatch[3]);

    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );


    // Prevent JS date rollover:
    // 31.02.2007 must NOT
    // become March automatically.

    if (
      date.getUTCFullYear() !==
        year ||
      date.getUTCMonth() !==
        month - 1 ||
      date.getUTCDate() !==
        day
    ) {
      return null;
    }

    return date;
  }


  // =========================
  // YYYY-MM-DD
  // YYYY/MM/DD
  // YYYY.MM.DD
  // =========================

  const ymdMatch =
    cleaned.match(
      /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/
    );

  if (ymdMatch) {
    const year =
      Number(ymdMatch[1]);

    const month =
      Number(ymdMatch[2]);

    const day =
      Number(ymdMatch[3]);

    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );

    if (
      date.getUTCFullYear() !==
        year ||
      date.getUTCMonth() !==
        month - 1 ||
      date.getUTCDate() !==
        day
    ) {
      return null;
    }

    return date;
  }


  // =========================
  // Invalid / Unsupported
  // =========================

  return null;
};





// bulk post 
export const bulkUploadStudentsService = async (
  file,
  {
    institutionId,
    departmentId,
    programmeId,
    batchId,
    section,
  }
) => {

  // ============================================================
// STEP 1 - VALIDATE BULK UPLOAD INPUT
// ============================================================

if (!file) {
  throw new Error(
    "Please upload an Excel file."
  );
}

if (!institutionId) {
  throw new Error(
    "Institution is required."
  );
}

if (!departmentId) {
  throw new Error(
    "Department is required."
  );
}

if (!programmeId) {
  throw new Error(
    "Programme is required."
  );
}

if (!batchId) {
  throw new Error(
    "Batch is required."
  );
}

const normalizedSection =
  normalizeSection(section);



  const idsToValidate = [
  {
    name: "institution",
    value: institutionId,
  },
  {
    name: "department",
    value: departmentId,
  },
  {
    name: "programme",
    value: programmeId,
  },
  {
    name: "batch",
    value: batchId,
  },
];

for (const item of idsToValidate) {
  if (
    !mongoose.Types.ObjectId.isValid(
      item.value
    )
  ) {
    throw new Error(
      `Invalid ${item.name} ID.`
    );
  }
}

// ============================================================
// STEP 2 - VALIDATE ACADEMIC RELATIONSHIPS
// ============================================================

const institution =
  await Institution.findById(
    institutionId
  );

if (!institution) {
  throw new Error(
    "Institution not found."
  );
}

const department =
  await Department.findOne({
    _id: departmentId,
    institution: institutionId,
  });

if (!department) {
  throw new Error(
    "Department does not belong to this institution."
  );
}

const programme =
  await Programme.findOne({
    _id: programmeId,
    department: departmentId,
  });

if (!programme) {
  throw new Error(
    "Programme does not belong to this department."
  );
}

const batch =
  await Batch.findOne({
    _id: batchId,
    isDeleted: false,
  });

if (!batch) {
  throw new Error(
    "Batch not found."
  );
}


// ============================================================
// STEP 3 - DETERMINE STUDENT TYPE
// ============================================================

const programmeType =
  cleanText(
    programme.programmeType
  ).toUpperCase();

if (
  !["UG", "PG"].includes(
    programmeType
  )
) {
  throw new Error(
    "Selected programme must be UG or PG."
  );
}

const studentType =
  programmeType;

   try {

// ============================================================
// STEP 4 - READ EXCEL WORKBOOK
// ============================================================

const workbook =
  xlsx.readFile(file.path);


  console.log(file);

console.log(workbook);

console.log(workbook.SheetNames);
const sheetName =
  workbook.SheetNames[0];

if (!sheetName) {
  throw new Error(
    "Uploaded Excel file does not contain any worksheet."
  );
}

const worksheet =
  workbook.Sheets[sheetName];

if (!worksheet) {
  throw new Error(
    "Unable to read the Excel worksheet."
  );
}


// ============================================================
// STEP 5 - READ ORIGINAL EXCEL HEADERS
// ============================================================

// Read worksheet as arrays first.
//
// This lets us preserve the ORIGINAL header text
// before converting rows into objects.

const sheetAsArray =
  xlsx.utils.sheet_to_json(
    worksheet,
    {
      header: 1,
      defval: null,
      raw: false,
    }
  );

if (
  !Array.isArray(sheetAsArray) ||
  sheetAsArray.length === 0
) {
  throw new Error(
    "Uploaded Excel file is empty."
  );
}

const originalHeaders =
  Array.isArray(sheetAsArray[0])
    ? sheetAsArray[0]
    : [];


// ============================================================
// STEP 6 - VALIDATE EXCEL HEADERS
// ============================================================

const headerValidation =
  validateExcelHeaders(
    originalHeaders
  );

if (!headerValidation.isValid) {
  const error =
    new Error(
      "Excel header validation failed."
    );

  error.code =
    "EXCEL_HEADER_VALIDATION_FAILED";

  error.details = {
    sheetName,

    totalColumns:
      originalHeaders.length,

    errors:
      headerValidation.errors,

    warnings:
      headerValidation.warnings,
  };

  throw error;
}


// ============================================================
// STEP 7 - BUILD FIELD LOCATION MAP
// ============================================================

const fieldLocationMap =
  buildExcelFieldLocationMap(
    originalHeaders
  );


// ============================================================
// STEP 8 - CONVERT EXCEL TO OBJECT ROWS
// ============================================================

const rawRows =
  xlsx.utils.sheet_to_json(
    worksheet,
    {
      defval: null,
      raw: false,
    }
  );

if (rawRows.length === 0) {
  throw new Error(
    "Excel file contains headers but no student rows."
  );
}


// ============================================================
// STEP 9 - NORMALIZE EXCEL ROW HEADERS
// ============================================================

const rows =
  rawRows
    .map(
      normalizeExcelRow
    )
    .filter((row) =>
      Object.values(row).some(
        (value) => {
          if (
            value === null ||
            value === undefined
          ) {
            return false;
          }

          return (
            String(value)
              .trim() !==
            ""
          );
        }
      )
    );


// ============================================================
// DEBUG - TEMPORARY
// ============================================================

console.log(
  "===== EXCEL IMPORT DEBUG ====="
);

console.log(
  "SHEET:",
  sheetName
);

console.log(
  "ORIGINAL HEADERS:",
  originalHeaders
);

console.log(
  "HEADER WARNINGS:",
  headerValidation.warnings
);

console.log(
  "TOTAL STUDENT ROWS:",
  rows.length
);

console.log(
  "FIRST NORMALIZED ROW:",
  rows[0] || null
);

  if (rows.length === 0) {

  throw new Error(
    "Uploaded excel file is empty."
  );

}

const validStudents = [];



const failedStudents = [];

const applicationSet =
  new Set();

const registerSet =
  new Set();

const emailSet =
  new Set();


// ==========================================
// STEP 6 - BUILD & VALIDATE STUDENTS
// ==========================================

for (
  let index = 0;
  index < rows.length;
  index++
) {
  const row = rows[index];

 // ==========================================================
// STEP 10A - VALIDATE + NORMALIZE CURRENT EXCEL ROW
// ==========================================================

// Excel row 1 contains headers,
// so rows[0] corresponds to Excel row 2.
const rowNumber =
  index + 2;

const rowValidation =
  validateStudentExcelRow({
    row,
    rowNumber,
    fieldLocationMap,
  });

const {
  isValid,
  errors,
  warnings,
  normalizedValues,
} = rowValidation;


// ==========================================================
// REJECT ROW ONLY WHEN IT HAS REAL ERRORS
// ==========================================================

if (!isValid) {
  failedStudents.push({
    row:
      rowNumber,

    studentName:
      normalizedValues
        ?.studentName ??
      cleanNullableText(
        row.studentName
      ) ??
      "Unknown",

    registerNumber:
      normalizedValues
        ?.registerNumber ??
      cleanNullableText(
        row.registerNumber
      ),

    applicationNumber:
      normalizedValues
        ?.applicationNumber ??
      cleanNullableText(
        row.applicationNumber
      ),

    reason:
      "Student row contains invalid required data.",

    errors,

    warnings,
  });

  continue;
}


// ==========================================================
// TRUSTED NORMALIZED VALUES
// ==========================================================

const normalized =
  normalizedValues;

// ==========================================================
// STEP 10B - BUILD STUDENT FROM TRUSTED NORMALIZED DATA
// ==========================================================

const student = {
  // =========================
  // Academic
  // =========================

  institutionId,
  departmentId,
  programmeId,
  batchId,

  classId: null,

  // Comes from selected programme,
  // NOT from Excel.
  studentType,

  academicYear:
    normalized.academicYear,


  // =========================
  // Identification
  // =========================

  applicationNumber:
    normalized.applicationNumber,

  registerNumber:
    normalized.registerNumber,


  // =========================
  // Personal Details
  // =========================

  studentName:
    normalized.studentName,

    profilePhoto:
  normalized.profilePhoto ??
  null,

  dateOfBirth:
    normalized.dateOfBirth,

  age:
    cleanNullableNumber(
      row.age
    ),

  gender:
    normalized.gender,

  bloodGroup:
    normalized.bloodGroup,

  religion:
    normalized.religion,

  communityCategory:
    normalized.communityCategory,

  subCaste:
    cleanNullableText(
      row.subCaste
    ),

  nativePlace:
    cleanNullableText(
      row.nativePlace
    ),

  motherTongue:
    cleanNullableText(
      row.motherTongue
    ),


  // =========================
  // Parent / Guardian
  // =========================

  fatherGuardianName:
    cleanNullableText(
      row.fatherGuardianName
    ),

  guardianRelationship:
    cleanNullableText(
      row.guardianRelationship
    ),

  motherName:
    cleanNullableText(
      row.motherName
    ),

  fatherOccupation:
    cleanNullableText(
      row.fatherOccupation
    ),

  motherOccupation:
    cleanNullableText(
      row.motherOccupation
    ),

  annualIncome:
    cleanNumber(
      row.annualIncome,
      0
    ),


  // =========================
  // Government IDs
  // =========================

  aadharNumber:
    cleanNullableText(
      row.aadharNumber
    ),

  emisNumber:
    cleanNullableText(
      row.emisNumber
    ),


  // =========================
  // Communication Address
  // =========================

  communicationAddress: {
    addressLine1:
      cleanNullableText(
        row[
          "communicationAddress.addressLine1"
        ]
      ),

    addressLine2:
      cleanNullableText(
        row[
          "communicationAddress.addressLine2"
        ]
      ),

    city:
      cleanNullableText(
        row[
          "communicationAddress.city"
        ]
      ),

    district:
      cleanNullableText(
        row[
          "communicationAddress.district"
        ]
      ),

    state:
      cleanNullableText(
        row[
          "communicationAddress.state"
        ]
      ),

    pincode:
      cleanNullableText(
        row[
          "communicationAddress.pincode"
        ]
      ),
  },


  // =========================
  // Permanent Address
  // =========================

  permanentAddress: {
    addressLine1:
      cleanNullableText(
        row[
          "permanentAddress.addressLine1"
        ]
      ),

    addressLine2:
      cleanNullableText(
        row[
          "permanentAddress.addressLine2"
        ]
      ),

    city:
      cleanNullableText(
        row[
          "permanentAddress.city"
        ]
      ),

    district:
      cleanNullableText(
        row[
          "permanentAddress.district"
        ]
      ),

    state:
      cleanNullableText(
        row[
          "permanentAddress.state"
        ]
      ),

    pincode:
      cleanNullableText(
        row[
          "permanentAddress.pincode"
        ]
      ),
  },


  // =========================
  // Contact
  // =========================

  studentMobile:
    cleanNullableText(
      row.studentMobile
    ),

  studentEmail:
    normalized.studentEmail,

  parentMobile:
    cleanNullableText(
      row.parentMobile
    ),


  // =========================
  // Facilities
  // =========================

  hostelRequired:
    normalized.hostelRequired ??
    false,

  transportRequired:
    normalized.transportRequired ??
    false,

  scholarshipHolder:
    normalized.scholarshipHolder ??
    false,


  // =========================
  // Special Category
  // =========================

  specialCategory:
    normalized.specialCategory ??
    [],


  // =========================
  // Admission
  // =========================

  admissionStatus:
    normalized.admissionStatus ??
    "Applied",
};


// ==========================================================
// UG ACADEMIC INFORMATION
// ==========================================================

if (studentType === "UG") {
  student.hscExamMonth =
    cleanNullableText(
      row.hscExamMonth
    );

  student.hscExamYear =
    cleanNullableNumber(
      row.hscExamYear
    );

  student.hscSchoolName =
    cleanNullableText(
      row.hscSchoolName
    );

  student.lastSchoolPlace =
    cleanNullableText(
      row.lastSchoolPlace
    );

  student.mediumOfInstruction =
    normalized.mediumOfInstruction;

  // These have already been validated
  // and normalized by the helper.

  student.hscMarks =
    normalized.hscMarks ??
    [];

  student.hscTotalMark =
    normalized.hscTotalMark ??
    0;
}


// ==========================================================
// PG QUALIFICATION
// ==========================================================

if (studentType === "PG") {
  student.previousCollegeName =
    cleanNullableText(
      row.previousCollegeName
    );

  student.qualifyingDegree =
    cleanNullableText(
      row.qualifyingDegree
    );

  student.degreePassingMonth =
    cleanNullableText(
      row.degreePassingMonth
    );

  student.degreePassingYear =
    cleanNullableNumber(
      row.degreePassingYear
    );

  student.semesterType =
    cleanNullableText(
      row.semesterType
    );

  student.major =
    cleanNullableText(
      row.major
    );

  student.nonMajor =
    cleanNullableText(
      row.nonMajor
    );

  // Already validated and normalized
  // by validateDegreeMarks().

  student.degreeMarks =
    normalized.degreeMarks ??
    [];

  student.degreeTotalMark =
    normalized.degreeTotalMark ??
    0;
}



// ==========================================================
// STEP 10C - DUPLICATE APPLICATION NUMBER INSIDE EXCEL
// ==========================================================

// Application number is optional.
//
// Only perform duplicate checking when
// the student actually has one.

if (
  student.applicationNumber
) {
  if (
    applicationSet.has(
      student.applicationNumber
    )
  ) {
    failedStudents.push({
      row:
        rowNumber,

      studentName:
        student.studentName ||
        "Unknown",

      registerNumber:
        student.registerNumber,

      applicationNumber:
        student.applicationNumber,

      reason:
        "Duplicate application number inside uploaded Excel.",

      errors: [
        {
          row:
            rowNumber,

          field:
            "applicationNumber",

          receivedValue:
            student.applicationNumber,

          reason:
            "Another row in this Excel file already uses this application number.",

          expected:
            "Unique application number",
        },
      ],

     warnings:
  warnings ?? [],
    });

    continue;
  }

  applicationSet.add(
    student.applicationNumber
  );
}
// ==========================================================
// STEP 10D - DUPLICATE REGISTER NUMBER INSIDE EXCEL
// ==========================================================

// Register number is optional.
// Only check duplicates when a value exists.

if (
  student.registerNumber
) {
  if (
    registerSet.has(
      student.registerNumber
    )
  ) {
    failedStudents.push({
      row:
        rowNumber,

      studentName:
        student.studentName ||
        "Unknown",

      registerNumber:
        student.registerNumber,

      applicationNumber:
        student.applicationNumber,

      reason:
        "Duplicate register number inside uploaded Excel.",

      errors: [
        {
          row:
            rowNumber,

          field:
            "registerNumber",

          receivedValue:
            student.registerNumber,

          reason:
            "Another row in this Excel file already uses this register number.",

          expected:
            "Unique register number",
        },
      ],

     warnings:
  warnings ?? [],
    });

    continue;
  }

  registerSet.add(
    student.registerNumber
  );
}

// ==========================================================
// STEP 10D - DUPLICATE EMAIL INSIDE EXCEL
// ==========================================================

if (
  student.studentEmail
) {
  if (
    emailSet.has(
      student.studentEmail
    )
  ) {
    failedStudents.push({
      row:
        rowNumber,

      studentName:
        student.studentName ||
        "Unknown",

      registerNumber:
        student.registerNumber,

      applicationNumber:
        student.applicationNumber,

      reason:
        "Duplicate student email inside uploaded Excel.",

      errors: [
        {
          row:
            rowNumber,

          field:
            "studentEmail",

          receivedValue:
            student.studentEmail,

          reason:
            "Another row in this Excel file already uses this student email.",

          expected:
            "Unique student email",
        },
      ],

   warnings:
  warnings ?? [],
    });

    continue;
  }

  emailSet.add(
    student.studentEmail
  );
}

// Passed Validation

validStudents.push({
  rowNumber,
  student,
  warnings,
});
}

// ==========================================
// STEP 7 - CHECK EXISTING STUDENTS IN DATABASE
// ==========================================

// -------------------------
// Collect Values
// -------------------------

const applicationNumbers =
  validStudents
    .map(
      (item) =>
        item.student
          .applicationNumber
    )
    .filter(Boolean);

const registerNumbers =
  validStudents
    .map(
      (item) =>
        item.student
          .registerNumber
    )
    .filter(Boolean);

const emails =
  validStudents
    .map(
      (item) =>
        item.student
          .studentEmail
    )
    .filter(Boolean);

// -------------------------
// Find Existing Students
// -------------------------

// ==========================================================
// STEP 11B - CHECK DUPLICATES ALREADY IN DATABASE
// ==========================================================

const duplicateConditions = [];

if (
  applicationNumbers.length > 0
) {
  duplicateConditions.push({
    applicationNumber: {
      $in: applicationNumbers,
    },
  });
}

if (
  registerNumbers.length > 0
) {
  duplicateConditions.push({
    registerNumber: {
      $in: registerNumbers,
    },
  });
}

if (
  emails.length > 0
) {
  duplicateConditions.push({
    studentEmail: {
      $in: emails,
    },
  });
}


const existingStudents =
  duplicateConditions.length > 0
    ? await Student.find({
        $or:
          duplicateConditions,
      })
        .select(
          "applicationNumber registerNumber studentEmail"
        )
        .lean()
    : [];


const existingApplicationSet =
  new Set(
    existingStudents
      .map(
        (student) =>
          student.applicationNumber
      )
      .filter(Boolean)
  );

const existingRegisterSet =
  new Set(
    existingStudents
      .map(
        (student) =>
          student.registerNumber
      )
      .filter(Boolean)
  );

const existingEmailSet =
  new Set(
    existingStudents
      .map(
        (student) =>
          student.studentEmail
      )
      .filter(Boolean)
  );


  // ==========================================================
// STEP 11C - SEPARATE DATABASE DUPLICATES
// ==========================================================

const studentsReadyToInsert = [];

for (
  const item of validStudents
) {
  const {
    rowNumber,
    student,
    warnings,
  } = item;

  const duplicateErrors = [];


  // =========================
  // Existing Application Number
  // =========================

  if (
    student.applicationNumber &&
    existingApplicationSet.has(
      student.applicationNumber
    )
  ) {
    duplicateErrors.push({
      row:
        rowNumber,

      field:
        "applicationNumber",

      receivedValue:
        student.applicationNumber,

      reason:
        "This application number already belongs to a student in the database.",

      expected:
        "Unique application number",
    });
  }


  // =========================
  // Existing Register Number
  // =========================

  if (
    student.registerNumber &&
    existingRegisterSet.has(
      student.registerNumber
    )
  ) {
    duplicateErrors.push({
      row:
        rowNumber,

      field:
        "registerNumber",

      receivedValue:
        student.registerNumber,

      reason:
        "This register number already belongs to a student in the database.",

      expected:
        "Unique register number",
    });
  }


  // =========================
  // Existing Student Email
  // =========================

  if (
    student.studentEmail &&
    existingEmailSet.has(
      student.studentEmail
    )
  ) {
    duplicateErrors.push({
      row:
        rowNumber,

      field:
        "studentEmail",

      receivedValue:
        student.studentEmail,

      reason:
        "This email already belongs to a student in the database.",

      expected:
        "Unique student email",
    });
  }


  // =========================
  // Reject Database Conflict
  // =========================

  if (
    duplicateErrors.length > 0
  ) {
    failedStudents.push({
      row:
        rowNumber,

      studentName:
        student.studentName ||
        "Unknown",

      registerNumber:
        student.registerNumber,

      applicationNumber:
        student.applicationNumber,

      reason:
        "Student conflicts with existing database data.",

      errors:
        duplicateErrors,

      warnings:
        warnings ?? [],
    });

    continue;
  }


  // =========================
  // Ready For MongoDB Insert
  // =========================

  studentsReadyToInsert.push({
    rowNumber,
    student,

    warnings:
      warnings ?? [],
  });
}

// ==========================================================
// STEP 12 - PREPARE FINAL STUDENTS FOR INSERTION
// ==========================================================

const studentsForInsertion =
  studentsReadyToInsert.map(
    (item) =>
      item.student
  );


// ==========================================================
// STEP 13 - COLLECT SUCCESSFUL ROW WARNINGS
// ==========================================================

const importedWithWarnings =
  studentsReadyToInsert
    .filter(
      (item) =>
        Array.isArray(
          item.warnings
        ) &&
        item.warnings.length > 0
    )
    .map(
      (item) => ({
        row:
          item.rowNumber,

        studentName:
          item.student
            .studentName ||
          "Unknown",

        registerNumber:
          item.student
            .registerNumber,

        applicationNumber:
          item.student
            .applicationNumber,

        warnings:
          item.warnings,
      })
    );


// ==========================================================
// STEP 14 - RESOLVE CLASS + INSERT STUDENTS
// ==========================================================

const session =
  await mongoose.startSession();

try {
  session.startTransaction();

  let classData =
    null;


  // ========================================================
// ONLY CREATE / RESOLVE CLASS WHEN STUDENTS WILL BE INSERTED
// ========================================================

  if (
    studentsForInsertion.length >
    0
  ) {
    classData =
      await Class.findOne({
        institution:
          institutionId,

        department:
          departmentId,

        programme:
          programmeId,

        batchId,

        section:
          normalizedSection,

        isDeleted:
          false,
      }).session(session);


    // ======================================================
    // REACTIVATE EXISTING CLASS
    // ======================================================

    if (classData) {
      if (
        !classData.isActive
      ) {
        classData.isActive =
          true;

        await classData.save({
          session,
        });
      }
    }


    // ======================================================
    // CREATE CLASS WHEN IT DOES NOT EXIST
    // ======================================================

    else {
      const createdClasses =
        await Class.create(
          [
            {
              institution:
                institutionId,

              department:
                departmentId,

              programme:
                programmeId,

              batchId,

              section:
                normalizedSection,

              isActive:
                true,
            },
          ],
          {
            session,
          }
        );

      classData =
        createdClasses[0];
    }


    // ======================================================
    // ASSIGN CLASS TO STUDENTS
    // ======================================================

    for (
      const student of
      studentsForInsertion
    ) {
      student.classId =
        classData._id;
    }


    // ======================================================
    // INSERT STUDENTS
    // ======================================================

    await Student.insertMany(
      studentsForInsertion,
      {
        session,

        // Transaction should either succeed
        // completely or roll back.
        ordered: true,
      }
    );
  }


  // ========================================================
  // COMMIT TRANSACTION
  // ========================================================

  await session.commitTransaction();


  // ========================================================
  // DELETE TEMPORARY EXCEL FILE
  // ========================================================

  if (
    file?.path &&
    fs.existsSync(
      file.path
    )
  ) {
    fs.unlinkSync(
      file.path
    );
  }


  // ========================================================
  // FINAL RESULT
  // ========================================================

  return {
    success:
      true,

    message:
      studentsForInsertion.length >
      0
        ? failedStudents.length > 0
          ? "Student bulk upload completed with some rejected rows."
          : importedWithWarnings.length > 0
            ? "Student bulk upload completed with warnings."
            : "Student bulk upload completed successfully."
        : "No students were uploaded.",

    totalRows:
      rows.length,

    insertedCount:
      studentsForInsertion.length,

    failedCount:
      failedStudents.length,

    warningCount:
      importedWithWarnings.length,

    class:
      classData
        ? {
            classId:
              classData._id,

            section:
              classData.section,

            isActive:
              classData.isActive,
          }
        : null,

    headerWarnings:
      headerValidation.warnings ??
      [],

    importedWithWarnings,

    failedStudents,
  };
}


// ==========================================================
// TRANSACTION FAILURE
// ==========================================================

catch (error) {
  await session.abortTransaction();

  throw error;
}


// ==========================================================
// END SESSION
// ==========================================================

finally {
  await session.endSession();
}

} catch (error) {

  // ========================================================
// DELETE TEMPORARY FILE AFTER FAILURE
// ========================================================

  if (
    file?.path &&
    fs.existsSync(
      file.path
    )
  ) {
    fs.unlinkSync(
      file.path
    );
  }

  throw error;
}

};


// bulk update 
export const bulkUpdateStudentsService =
  async (
    file
  ) => {

  try {

    // ==========================================
    // STEP 1 - READ EXCEL
    // ==========================================

// ============================================================
// STEP 1 - READ EXCEL WORKBOOK
// ============================================================

const workbook =
  xlsx.readFile(file.path);

const sheetName =
  workbook.SheetNames[0];

if (!sheetName) {
  throw new Error(
    "Uploaded Excel file does not contain any worksheet."
  );
}

const worksheet =
  workbook.Sheets[sheetName];

if (!worksheet) {
  throw new Error(
    "Unable to read the Excel worksheet."
  );
}


// ============================================================
// STEP 2 - READ ORIGINAL EXCEL HEADERS
// ============================================================
//
// Read the worksheet as arrays first so we can validate
// the ORIGINAL Excel headers before normalizeExcelRow()
// converts them into internal field names.
// ============================================================

const sheetAsArray =
  xlsx.utils.sheet_to_json(
    worksheet,
    {
      header: 1,
      defval: null,
      raw: false,
    }
  );

if (
  !Array.isArray(sheetAsArray) ||
  sheetAsArray.length === 0
) {
  throw new Error(
    "Uploaded Excel file is empty."
  );
}

const originalHeaders =
  Array.isArray(
    sheetAsArray[0]
  )
    ? sheetAsArray[0]
    : [];


// ============================================================
// STEP 3 - VALIDATE EXCEL HEADERS
// ============================================================

const headerValidation =
  validateExcelHeaders(
    originalHeaders
  );

if (
  !headerValidation.isValid
) {
  const error =
    new Error(
      "Excel header validation failed."
    );

  error.code =
    "EXCEL_HEADER_VALIDATION_FAILED";

  error.details = {
    sheetName,

    totalColumns:
      originalHeaders.length,

    errors:
      headerValidation.errors,

    warnings:
      headerValidation.warnings,
  };

  throw error;
}


// ============================================================
// STEP 4 - BUILD FIELD LOCATION MAP
// ============================================================
//
// We'll use this in the next block for structured update
// errors/warnings with Excel column + original header.
// ============================================================

const fieldLocationMap =
  buildExcelFieldLocationMap(
    originalHeaders
  );


// ============================================================
// STEP 5 - CONVERT EXCEL INTO OBJECT ROWS
// ============================================================

const rawRows =
  xlsx.utils.sheet_to_json(
    worksheet,
    {
      defval: null,
      raw: false,
    }
  );

if (
  rawRows.length === 0
) {
  throw new Error(
    "Excel file contains headers but no student rows."
  );
}


// ============================================================
// STEP 6 - NORMALIZE HEADERS + REMOVE EMPTY ROWS
// ============================================================

const rows =
  rawRows
    .map(
      normalizeExcelRow
    )
    .filter((row) =>
      Object.values(row).some(
        (value) => {
          if (
            value === null ||
            value === undefined
          ) {
            return false;
          }

          return (
            String(value)
              .trim() !==
            ""
          );
        }
      )
    );


if (
  rows.length === 0
) {
  throw new Error(
    "Excel file does not contain any student data."
  );
}


// ============================================================
// HEADER WARNINGS
// ============================================================

const headerWarnings =
  headerValidation.warnings ??
  [];


    // ==========================================
    // PROCESSING ARRAYS
    // ==========================================

    const failedStudents = [];

    const validStudents = [];
// ==========================================================
// STEP 2 - VALIDATE & BUILD PARTIAL UPDATES
// ==========================================================

rows.forEach((row, index) => {

  const rowNumber =
    index + 2;

  const errors = [];

  const warnings = [];


  // ========================================================
  // HELPER - CHECK WHETHER EXCEL ACTUALLY SUPPLIED A VALUE
  // ========================================================
  //
  // Blank cells mean:
  //
  // DO NOT UPDATE THE EXISTING DATABASE VALUE.
  //
  // ========================================================

  const hasValue = (value) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "";


  // ========================================================
  // APPLICATION NUMBER
  // ========================================================
  //
  // Required because this identifies the student being
  // updated. It is NOT itself changed.
  // ========================================================

  const applicationNumber =
    cleanNullableText(
      row.applicationNumber
    );

  const studentName =
    cleanNullableText(
      row.studentName
    ) || "";


  if (!applicationNumber) {

    const location =
      getExcelFieldLocation(
        fieldLocationMap,
        "applicationNumber"
      );

    failedStudents.push({
      row:
        rowNumber,

      studentName,

      applicationNumber:
        null,

      reason:
        "Application number is required to identify the student.",

      errors: [
        {
          row:
            rowNumber,

          column:
            location.column,

          header:
            location.header,

          field:
            "applicationNumber",

          receivedValue:
            row.applicationNumber,

          reason:
            "Application number is required to identify the student for bulk update.",

          expected:
            "Existing student application number",
        },
      ],

      warnings: [],
    });

    return;
  }


  // ========================================================
  // UPDATE DATA
  // ========================================================

  const updateData = {};


  // ========================================================
  // IDENTIFICATION
  // ========================================================

  if (
    hasValue(
      row.registerNumber
    )
  ) {
    updateData.registerNumber =
      cleanNullableText(
        row.registerNumber
      );
  }


  // ========================================================
  // PERSONAL DETAILS
  // ========================================================

  if (
    hasValue(
      row.studentName
    )
  ) {
    updateData.studentName =
      cleanNullableText(
        row.studentName
      );
  }


  // -------------------------
  // Profile Photo
  // -------------------------

  if (
    hasValue(
      row.profilePhoto
    )
  ) {
    updateData.profilePhoto =
      cleanNullableText(
        row.profilePhoto
      );
  }


  // -------------------------
  // Date Of Birth
  // -------------------------

  if (
    hasValue(
      row.dateOfBirth
    )
  ) {

    const dateOfBirth =
      normalizeExcelDate(
        row.dateOfBirth
      );

    if (!dateOfBirth) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "dateOfBirth"
        );

      errors.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "dateOfBirth",

        receivedValue:
          row.dateOfBirth,

        reason:
          "Invalid date of birth format.",

        expected:
          "DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY or YYYY-MM-DD",

        example:
          "17-05-2007",
      });

    } else {

      updateData.dateOfBirth =
        dateOfBirth;
    }
  }


  // -------------------------
  // Age
  // -------------------------

  if (
    hasValue(
      row.age
    )
  ) {

    const age =
      cleanNullableNumber(
        row.age
      );

    if (
      age === null ||
      age < 0
    ) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "age"
        );

      warnings.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "age",

        receivedValue:
          row.age,

        reason:
          "Invalid age. Existing age was left unchanged.",

        expected:
          "A non-negative number",
      });

    } else {

      updateData.age =
        age;
    }
  }


  // -------------------------
  // Gender
  // -------------------------

  if (
    hasValue(
      row.gender
    )
  ) {

    const gender =
      normalizeGender(
        row.gender
      );

    if (!gender) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "gender"
        );

      errors.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "gender",

        receivedValue:
          row.gender,

        reason:
          "Invalid gender.",

        expected:
          "Male, Female or Other",
      });

    } else {

      updateData.gender =
        gender;
    }
  }


  // -------------------------
  // Blood Group
  // -------------------------

  if (
    hasValue(
      row.bloodGroup
    )
  ) {

    const bloodGroup =
      normalizeBloodGroup(
        row.bloodGroup
      );

    if (!bloodGroup) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "bloodGroup"
        );

      warnings.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "bloodGroup",

        receivedValue:
          row.bloodGroup,

        reason:
          "Unrecognized blood group. Existing blood group was left unchanged.",

        expected:
          "A+, A-, B+, B-, AB+, AB-, O+, O-, A1+, A1-, A2+, A2-, A1B+, A1B-, A2B+ or A2B-",

        example:
          "O+",
      });

    } else {

      updateData.bloodGroup =
        bloodGroup;
    }
  }


  // -------------------------
  // Religion
  // -------------------------

  if (
    hasValue(
      row.religion
    )
  ) {

    const religion =
      normalizeReligion(
        row.religion
      );

    if (!religion) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "religion"
        );

      errors.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "religion",

        receivedValue:
          row.religion,

        reason:
          "Invalid religion.",

        expected:
          "Hindu, Muslim, Christian or Other",
      });

    } else {

      updateData.religion =
        religion;
    }
  }


  // -------------------------
  // Community Category
  // -------------------------

  if (
    hasValue(
      row.communityCategory
    )
  ) {

    const communityCategory =
      normalizeCommunityCategory(
        row.communityCategory
      );

    if (!communityCategory) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "communityCategory"
        );

      errors.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "communityCategory",

        receivedValue:
          row.communityCategory,

        reason:
          "Invalid community category.",

        expected:
          "OC, BC, MBC, BCM, DNC, SC, SCA, ST or Other",
      });

    } else {

      updateData.communityCategory =
        communityCategory;
    }
  }


  // -------------------------
  // Simple Personal Fields
  // -------------------------

  if (hasValue(row.subCaste)) {
    updateData.subCaste =
      cleanNullableText(
        row.subCaste
      );
  }

  if (hasValue(row.nativePlace)) {
    updateData.nativePlace =
      cleanNullableText(
        row.nativePlace
      );
  }

  if (hasValue(row.motherTongue)) {
    updateData.motherTongue =
      cleanNullableText(
        row.motherTongue
      );
  }


  // ========================================================
  // PARENT / GUARDIAN
  // ========================================================

  if (
    hasValue(
      row.fatherGuardianName
    )
  ) {
    updateData.fatherGuardianName =
      cleanNullableText(
        row.fatherGuardianName
      );
  }

  if (
    hasValue(
      row.guardianRelationship
    )
  ) {
    updateData.guardianRelationship =
      cleanNullableText(
        row.guardianRelationship
      );
  }

  if (
    hasValue(
      row.motherName
    )
  ) {
    updateData.motherName =
      cleanNullableText(
        row.motherName
      );
  }

  if (
    hasValue(
      row.fatherOccupation
    )
  ) {
    updateData.fatherOccupation =
      cleanNullableText(
        row.fatherOccupation
      );
  }

  if (
    hasValue(
      row.motherOccupation
    )
  ) {
    updateData.motherOccupation =
      cleanNullableText(
        row.motherOccupation
      );
  }


  // -------------------------
  // Annual Income
  // -------------------------

  if (
    hasValue(
      row.annualIncome
    )
  ) {

    const annualIncome =
      cleanNullableNumber(
        row.annualIncome
      );

    if (
      annualIncome === null ||
      annualIncome < 0
    ) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "annualIncome"
        );

      warnings.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "annualIncome",

        receivedValue:
          row.annualIncome,

        reason:
          "Invalid annual income. Existing value was left unchanged.",

        expected:
          "A non-negative number",
      });

    } else {

      updateData.annualIncome =
        annualIncome;
    }
  }


  // ========================================================
  // GOVERNMENT IDS
  // ========================================================

  if (
    hasValue(
      row.aadharNumber
    )
  ) {
    updateData.aadharNumber =
      cleanNullableText(
        row.aadharNumber
      );
  }

  if (
    hasValue(
      row.emisNumber
    )
  ) {
    updateData.emisNumber =
      cleanNullableText(
        row.emisNumber
      );
  }


  // ========================================================
  // CONTACT DETAILS
  // ========================================================

  if (
    hasValue(
      row.studentMobile
    )
  ) {
    updateData.studentMobile =
      cleanNullableText(
        row.studentMobile
      );
  }


  // -------------------------
  // Student Email
  // -------------------------

  if (
    hasValue(
      row.studentEmail
    )
  ) {

    const studentEmail =
      cleanNullableText(
        row.studentEmail
      )?.toLowerCase();

    if (
      !isValidEmail(
        studentEmail
      )
    ) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "studentEmail"
        );

      warnings.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "studentEmail",

        receivedValue:
          row.studentEmail,

        reason:
          "Invalid student email format. Existing email was left unchanged.",

        expected:
          "A valid email address",

        example:
          "student@example.com",
      });

    } else {

      updateData.studentEmail =
        studentEmail;
    }
  }


  if (
    hasValue(
      row.parentMobile
    )
  ) {
    updateData.parentMobile =
      cleanNullableText(
        row.parentMobile
      );
  }


  // ========================================================
  // FACILITIES
  // ========================================================

  if (
    hasValue(
      row.hostelRequired
    )
  ) {

    const value =
      cleanBoolean(
        row.hostelRequired
      );

    if (value !== null) {
      updateData.hostelRequired =
        value;
    }
  }


  if (
    hasValue(
      row.transportRequired
    )
  ) {

    const value =
      cleanBoolean(
        row.transportRequired
      );

    if (value !== null) {
      updateData.transportRequired =
        value;
    }
  }


  if (
    hasValue(
      row.scholarshipHolder
    )
  ) {

    const value =
      cleanBoolean(
        row.scholarshipHolder
      );

    if (value !== null) {
      updateData.scholarshipHolder =
        value;
    }
  }


  // ========================================================
  // SPECIAL CATEGORY
  // ========================================================

  if (
    hasValue(
      row.specialCategory
    )
  ) {

    updateData.specialCategory =
      normalizeSpecialCategory(
        row.specialCategory
      );
  }


  // ========================================================
  // ADMISSION STATUS
  // ========================================================

  if (
    hasValue(
      row.admissionStatus
    )
  ) {

    const admissionStatus =
      normalizeAdmissionStatus(
        row.admissionStatus
      );

    if (!admissionStatus) {

      const location =
        getExcelFieldLocation(
          fieldLocationMap,
          "admissionStatus"
        );

      warnings.push({
        row:
          rowNumber,

        column:
          location.column,

        header:
          location.header,

        field:
          "admissionStatus",

        receivedValue:
          row.admissionStatus,

        reason:
          "Invalid admission status. Existing status was left unchanged.",

        expected:
          "Applied, Selected, Admitted or Discontinued",
      });

    } else {

      updateData.admissionStatus =
        admissionStatus;
    }
  }


  // ========================================================
  // REJECT ROW WHEN REQUIRED UPDATE DATA IS INVALID
  // ========================================================

  if (
    errors.length > 0
  ) {

    failedStudents.push({
      row:
        rowNumber,

      studentName:
        studentName ||
        "Unknown",

      applicationNumber,

      reason:
        "Student update row contains invalid data.",

      errors,

      warnings,
    });

    return;
  }


  // ========================================================
  // NOTHING TO UPDATE
  // ========================================================

  if (
    Object.keys(
      updateData
    ).length === 0
  ) {

    failedStudents.push({
      row:
        rowNumber,

      studentName:
        studentName ||
        "Unknown",

      applicationNumber,

      reason:
        "No valid update values were supplied.",

      errors: [],

      warnings,
    });

    return;
  }


  // ========================================================
  // VALID UPDATE
  // ========================================================

  validStudents.push({
    rowNumber,

    applicationNumber,

    studentName,

    updateData,

    warnings,
  });
});

// ==========================================================
// STEP 3 - CHECK DUPLICATE APPLICATION NUMBERS INSIDE EXCEL
// ==========================================================

const applicationNumberMap =
  new Map();

const duplicateApplicationNumbers =
  new Set();


for (
  const item of validStudents
) {
  const applicationNumber =
    item.applicationNumber;

  if (!applicationNumber) {
    continue;
  }

  if (
    applicationNumberMap.has(
      applicationNumber
    )
  ) {
    duplicateApplicationNumbers.add(
      applicationNumber
    );
  } else {
    applicationNumberMap.set(
      applicationNumber,
      item.rowNumber ??
        item.row
    );
  }
}


// ==========================================================
// REMOVE DUPLICATE ROWS FROM VALID STUDENTS
// ==========================================================

let studentsForDatabaseCheck =
  validStudents;


if (
  duplicateApplicationNumbers.size >
  0
) {
  studentsForDatabaseCheck =
    validStudents.filter(
      (item) => {
        if (
          !duplicateApplicationNumbers.has(
            item.applicationNumber
          )
        ) {
          return true;
        }


        const firstRow =
          applicationNumberMap.get(
            item.applicationNumber
          );


        failedStudents.push({
          row:
            item.rowNumber ??
            item.row,

          studentName:
            item.studentName ||
            "Unknown",

          applicationNumber:
            item.applicationNumber,

          reason:
            "Duplicate application number inside uploaded Excel.",

          errors: [
            {
              row:
                item.rowNumber ??
                item.row,

              field:
                "applicationNumber",

              receivedValue:
                item.applicationNumber,

              reason:
                `Application number is repeated in this Excel file. First occurrence is at row ${firstRow}.`,

              expected:
                "One update row per application number",
            },
          ],

          warnings:
            item.warnings ??
            [],
        });


        return false;
      }
    );
}

// ==========================================================
// STEP 4 - FETCH EXISTING STUDENTS
// ==========================================================

const applicationNumberList =
  studentsForDatabaseCheck
    .map(
      (item) =>
        item.applicationNumber
    )
    .filter(Boolean);


const existingStudents =
  applicationNumberList.length > 0
    ? await Student.find({
        applicationNumber: {
          $in:
            applicationNumberList,
        },

        isDeleted:
          false,
      })
        .select(
          "applicationNumber"
        )
        .lean()
    : [];


const existingApplicationNumbers =
  new Set(
    existingStudents
      .map(
        (student) =>
          student.applicationNumber
      )
      .filter(Boolean)
  );


// ==========================================================
// STEP 4B - UNIQUE FIELD CONFLICT CHECK
// ==========================================================

const registerNumbersToCheck =
  studentsForDatabaseCheck
    .map(
      (item) =>
        item.updateData
          ?.registerNumber
    )
    .filter(Boolean);


const emailsToCheck =
  studentsForDatabaseCheck
    .map(
      (item) =>
        item.updateData
          ?.studentEmail
    )
    .filter(Boolean);


// ----------------------------------------------------------
// Build conflict query
// ----------------------------------------------------------

const conflictConditions = [];


if (
  registerNumbersToCheck.length >
  0
) {
  conflictConditions.push({
    registerNumber: {
      $in:
        registerNumbersToCheck,
    },
  });
}


if (
  emailsToCheck.length >
  0
) {
  conflictConditions.push({
    studentEmail: {
      $in:
        emailsToCheck,
    },
  });
}


// ----------------------------------------------------------
// Find owners of register numbers / emails
// ----------------------------------------------------------

const conflictingStudents =
  conflictConditions.length > 0
    ? await Student.find({
        $or:
          conflictConditions,

        isDeleted:
          false,
      })
        .select(
          "applicationNumber registerNumber studentEmail"
        )
        .lean()
    : [];


const registerOwnerMap =
  new Map();

const emailOwnerMap =
  new Map();


for (
  const student of
  conflictingStudents
) {

  if (
    student.registerNumber
  ) {
    registerOwnerMap.set(
      student.registerNumber,
      student.applicationNumber
    );
  }


  if (
    student.studentEmail
  ) {
    emailOwnerMap.set(
      String(
        student.studentEmail
      )
        .trim()
        .toLowerCase(),

      student.applicationNumber
    );
  }
}


// ==========================================================
// CHECK CONFLICTS FOR EACH UPDATE
// ==========================================================

const studentsWithoutConflicts =
  [];


for (
  const item of
  studentsForDatabaseCheck
) {

  const errors = [];

  const rowNumber =
    item.rowNumber ??
    item.row;


  const newRegisterNumber =
    item.updateData
      ?.registerNumber;


  const newStudentEmail =
    item.updateData
      ?.studentEmail;


  // --------------------------------------------------------
  // Register Number
  // --------------------------------------------------------

  if (
    newRegisterNumber
  ) {

    const owner =
      registerOwnerMap.get(
        newRegisterNumber
      );


    if (
      owner &&
      owner !==
        item.applicationNumber
    ) {

      errors.push({
        row:
          rowNumber,

        field:
          "registerNumber",

        receivedValue:
          newRegisterNumber,

        reason:
          "Register number already belongs to another student.",

        expected:
          "Unique register number",
      });
    }
  }


  // --------------------------------------------------------
  // Student Email
  // --------------------------------------------------------

  if (
    newStudentEmail
  ) {

    const normalizedEmail =
      String(
        newStudentEmail
      )
        .trim()
        .toLowerCase();


    const owner =
      emailOwnerMap.get(
        normalizedEmail
      );


    if (
      owner &&
      owner !==
        item.applicationNumber
    ) {

      errors.push({
        row:
          rowNumber,

        field:
          "studentEmail",

        receivedValue:
          newStudentEmail,

        reason:
          "Student email already belongs to another student.",

        expected:
          "Unique student email",
      });
    }
  }


  // --------------------------------------------------------
  // Reject Conflict
  // --------------------------------------------------------

  if (
    errors.length > 0
  ) {

    failedStudents.push({
      row:
        rowNumber,

      studentName:
        item.studentName ||
        "Unknown",

      applicationNumber:
        item.applicationNumber,

      reason:
        "Student update conflicts with existing unique data.",

      errors,

      warnings:
        item.warnings ??
        [],
    });


    continue;
  }


  studentsWithoutConflicts.push(
    item
  );
}


// ==========================================================
// STEP 5 - BUILD BULK UPDATE OPERATIONS
// ==========================================================

const operations = [];

const updatedWithWarnings = [];


// ----------------------------------------------------------
// Process conflict-free rows
// ----------------------------------------------------------

for (
  const item of
  studentsWithoutConflicts
) {

  const rowNumber =
    item.rowNumber ??
    item.row;


  const applicationNumber =
    item.applicationNumber;


  // --------------------------------------------------------
  // Student Must Exist
  // --------------------------------------------------------

  if (
    !existingApplicationNumbers.has(
      applicationNumber
    )
  ) {

    failedStudents.push({
      row:
        rowNumber,

      studentName:
        item.studentName ||
        "Unknown",

      applicationNumber,

      reason:
        "Student not found in database.",

      errors: [
        {
          row:
            rowNumber,

          field:
            "applicationNumber",

          receivedValue:
            applicationNumber,

          reason:
            "No active student exists with this application number.",

          expected:
            "Existing student application number",
        },
      ],

      warnings:
        item.warnings ??
        [],
    });


    continue;
  }


  // --------------------------------------------------------
  // Safety Check
  // --------------------------------------------------------

  if (
    !item.updateData ||
    Object.keys(
      item.updateData
    ).length === 0
  ) {

    failedStudents.push({
      row:
        rowNumber,

      studentName:
        item.studentName ||
        "Unknown",

      applicationNumber,

      reason:
        "No valid fields were supplied for update.",

      errors: [],

      warnings:
        item.warnings ??
        [],
    });


    continue;
  }


  // --------------------------------------------------------
  // MongoDB Operation
  // --------------------------------------------------------

  operations.push({
    updateOne: {

      filter: {
        applicationNumber,

        isDeleted:
          false,
      },

      update: {
        $set:
          item.updateData,
      },
    },
  });


  // --------------------------------------------------------
  // Keep Successful Warnings
  // --------------------------------------------------------

  if (
    item.warnings?.length >
    0
  ) {

    updatedWithWarnings.push({
      row:
        rowNumber,

      studentName:
        item.studentName ||
        item.updateData
          ?.studentName ||
        "Unknown",

      applicationNumber,

      warnings:
        item.warnings,
    });
  }
}


// ==========================================================
// STEP 6 - NO VALID STUDENTS TO UPDATE
// ==========================================================

if (
  operations.length === 0
) {

  if (
    file?.path &&
    fs.existsSync(
      file.path
    )
  ) {

    fs.unlinkSync(
      file.path
    );
  }


  return {
    success: false,

    code:
      "NO_STUDENTS_UPDATED",

    message:
      "No students were updated. Please review the rejected rows and try again.",

    totalRows:
      rows.length,

    processedCount:
      0,

    matchedCount:
      0,

    modifiedCount:
      0,

    failedCount:
      failedStudents.length,

    warningCount:
      0,

    headerWarnings,

    updatedWithWarnings:
      [],

    failedStudents,
  };
}


// ==========================================================
// STEP 7 - RUN BULK UPDATE TRANSACTION
// ==========================================================

const session =
  await mongoose.startSession();


let bulkResult;


try {

  session.startTransaction();


  bulkResult =
    await Student.bulkWrite(
      operations,
      {
        session,

        ordered:
          true,
      }
    );


  await session.commitTransaction();


} catch (error) {

  await session.abortTransaction();

  throw error;


} finally {

  await session.endSession();
}


// ==========================================================
// DELETE EXCEL AFTER SUCCESS
// ==========================================================

if (
  file?.path &&
  fs.existsSync(
    file.path
  )
) {

  fs.unlinkSync(
    file.path
  );
}


// ==========================================================
// STEP 8 - BUILD FINAL REPORT
// ==========================================================

const matchedCount =
  bulkResult?.matchedCount ??
  0;

  

const modifiedCount =
  bulkResult?.modifiedCount ??
  0;

  const unchangedCount =
  matchedCount -
  modifiedCount;

const warningCount =
  updatedWithWarnings.reduce(
    (
      total,
      item
    ) =>
      total +
      (
        item.warnings
          ?.length ??
        0
      ),

    0
  );


const hasFailures =
  failedStudents.length >
  0;


const hasWarnings =
  warningCount > 0 ||
  headerWarnings.length > 0;


let message =
  "Bulk Student Update Completed Successfully.";


if (
  hasFailures
) {

  message =
    "Student bulk update completed with some rejected rows.";

} else if (
  hasWarnings
) {

  message =
    "Student bulk update completed with warnings.";
}


// ==========================================================
// RETURN REPORT
// ==========================================================

return {
  success: true,

  message,

  totalRows:
    rows.length,

  processedCount:
    operations.length,

  matchedCount,

  modifiedCount,

  unchangedCount,

  failedCount:
    failedStudents.length,

  warningCount,

  headerWarnings,

  updatedWithWarnings,

  failedStudents,
};


  }  catch (error) {

  // Delete uploaded Excel file

  if (
    file?.path &&
    fs.existsSync(file.path)
  ) {

    fs.unlinkSync(file.path);

  }

  throw error;

}

};
