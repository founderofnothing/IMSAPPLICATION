// ============================================================
// ID CARD DYNAMIC FIELD REGISTRY
// ============================================================
//
// Single source of truth for dynamic fields used by:
//
// 1. ID Card Designer
// 2. Dynamic Field Resolver
// 3. Student Validation
// 4. ID Card Preview
// 5. PDF Generation
//
// ============================================================

export const ID_CARD_DYNAMIC_FIELDS = [

  // ==========================================================
  // STUDENT
  // ==========================================================

  {
    key: "studentName",
    label: "Student Name",
    type: "text",
    required: true,
  },

  {
    key: "applicationNumber",
    label: "Application Number",
    type: "text",
    required: false,
  },

  {
    key: "registerNumber",
    label: "Register Number",
    type: "text",
    required: true,
  },

  {
    key: "dateOfBirth",
    label: "Date of Birth",
    type: "text",
    required: false,
  },

  {
    key: "age",
    label: "Age",
    type: "text",
    required: false,
  },

  {
    key: "gender",
    label: "Gender",
    type: "text",
    required: false,
  },

  {
    key: "bloodGroup",
    label: "Blood Group",
    type: "text",
    required: false,
  },

  {
    key: "studentPhoto",
    label: "Student Photo",
    type: "photo",
    required: true,
  },

  {
    key: "phoneNumber",
    label: "Student Phone",
    type: "text",
    required: false,
  },

  {
    key: "address",
    label: "Communication Address",
    type: "text",
    required: false,
  },


  // ==========================================================
  // ACADEMIC
  // ==========================================================

  {
    key: "departmentName",
    label: "Department Name",
    type: "text",
    required: true,
  },

  {
    key: "programmeName",
    label: "Programme Name",
    type: "text",
    required: false,
  },

  {
    key: "programmeCode",
    label: "Programme Code",
    type: "text",
    required: false,
  },

  {
    key: "section",
    label: "Section",
    type: "text",
    required: false,
  },

  {
    key: "academicYear",
    label: "Academic Year",
    type: "text",
    required: false,
  },


  // ==========================================================
  // INSTITUTION
  // ==========================================================

  {
    key: "institutionName",
    label: "Institution Name",
    type: "text",
    required: true,
  },

  {
    key: "institutionCode",
    label: "Institution Code",
    type: "text",
    required: false,
  },


  // ==========================================================
  // GENERATED
  // ==========================================================

  {
    key: "qrCode",
    label: "QR Code",
    type: "qr",
    required: true,
    generated: true,
  },

];


// ============================================================
// FIND FIELD
// ============================================================

export const getDynamicFieldByKey = (
  key
) => {

  return ID_CARD_DYNAMIC_FIELDS.find(
    (field) =>
      field.key === key
  ) || null;
};


// ============================================================
// GET ALL KEYS
// ============================================================

export const getDynamicFieldKeys = () => {

  return ID_CARD_DYNAMIC_FIELDS.map(
    (field) =>
      field.key
  );
};