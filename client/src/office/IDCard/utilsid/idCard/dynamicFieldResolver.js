// ============================================================
// ID CARD DYNAMIC FIELD RESOLVER
// ============================================================
//
// Converts a dynamic field key stored in the ID-card template
// into the actual value from the Student document.
//
// This resolver supports the field names used by both:
// - ID Card Designer
// - ID Card Verification Preview
//
// ============================================================

export const resolveDynamicField = (
  key,
  student
) => {

  // ----------------------------------------------------------
  // SAFETY
  // ----------------------------------------------------------

  if (!key || !student) {
    return null;
  }

  // ==========================================================
  // STUDENT BASIC INFORMATION
  // ==========================================================

  switch (key) {

    case "studentName":
      return student.studentName || null;

    case "applicationNumber":
      return student.applicationNumber || null;

    case "registerNumber":
      return student.registerNumber || null;

    case "dateOfBirth":
      return student.dateOfBirth || null;

    case "age":
      return student.age ?? null;

    case "gender":
      return student.gender || null;

    case "bloodGroup":
      return student.bloodGroup || null;

    case "studentType":
      return student.studentType || null;

    case "academicYear":
      return student.academicYear || null;


    // --------------------------------------------------------
    // STUDENT PHOTO
    // --------------------------------------------------------

    case "studentPhoto":
    case "profilePhoto":
      return (
        student.profilePhoto ||
        student.studentPhoto ||
        null
      );


    // ==========================================================
    // ACADEMIC INFORMATION
    // ==========================================================

    case "departmentName":
      return (
        student.departmentId?.departmentName ||
        student.department?.departmentName ||
        null
      );

    case "departmentCode":
      return (
        student.departmentId?.departmentCode ||
        student.department?.departmentCode ||
        null
      );

    case "programmeName":
      return (
        student.programmeId?.programmeName ||
        student.programme?.programmeName ||
        null
      );

    case "programmeCode":
      return (
        student.programmeId?.programmeCode ||
        student.programme?.programmeCode ||
        null
      );


    // ==========================================================
    // CLASS INFORMATION
    // ==========================================================

    case "className":
      return (
        student.classId?.className ||
        student.class?.className ||
        null
      );

    case "section":
      return (
        student.classId?.section ||
        student.class?.section ||
        null
      );


    // ==========================================================
    // INSTITUTION INFORMATION
    // ==========================================================

    case "institutionName":
      return (
        student.institutionId?.institutionName ||
        student.institution?.institutionName ||
        null
      );

    case "institutionCode":
      return (
        student.institutionId?.institutionCode ||
        student.institution?.institutionCode ||
        null
      );


    // ==========================================================
    // CONTACT INFORMATION
    // ==========================================================

    // Preferred field used by the current Student schema
    case "studentMobile":
      return (
        student.studentMobile ||
        student.phoneNumber ||
        student.mobileNumber ||
        null
      );

    // Alias used by the verification/template UI
    case "phoneNumber":
      return (
        student.phoneNumber ||
        student.studentMobile ||
        student.mobileNumber ||
        null
      );

    case "studentEmail":
      return (
        student.studentEmail ||
        student.email ||
        null
      );

    case "parentMobile":
      return (
        student.parentMobile ||
        student.parentPhoneNumber ||
        null
      );


    // ==========================================================
    // ADDRESS
    // ==========================================================

    // Generic address field used by the ID-card template
    case "address":
      return (
        formatAddress(
          student.address
        ) ||

        formatAddress(
          student.communicationAddress
        ) ||

        formatAddress(
          student.permanentAddress
        ) ||

        student.address ||

        null
      );


    case "communicationAddress":
      return (
        formatAddress(
          student.communicationAddress
        ) ||

        formatAddress(
          student.address
        ) ||

        null
      );


    case "permanentAddress":
      return (
        formatAddress(
          student.permanentAddress
        ) ||

        formatAddress(
          student.address
        ) ||

        null
      );


    // ==========================================================
    // PARENT / GUARDIAN
    // ==========================================================

    case "fatherGuardianName":
      return (
        student.fatherGuardianName ||
        student.fatherName ||
        student.guardianName ||
        null
      );

    case "guardianRelationship":
      return (
        student.guardianRelationship ||
        null
      );

    case "motherName":
      return (
        student.motherName ||
        null
      );

    case "fatherOccupation":
      return (
        student.fatherOccupation ||
        null
      );

    case "motherOccupation":
      return (
        student.motherOccupation ||
        null
      );


    // ==========================================================
    // FACILITIES / STATUS
    // ==========================================================

    case "hostelRequired":
      return student.hostelRequired
        ? "Yes"
        : "No";

    case "transportRequired":
      return student.transportRequired
        ? "Yes"
        : "No";

    case "scholarshipHolder":
      return student.scholarshipHolder
        ? "Yes"
        : "No";


    // ==========================================================
    // SPECIAL CATEGORY
    // ==========================================================

    case "specialCategory":
      return Array.isArray(
        student.specialCategory
      )
        ? student.specialCategory.join(", ")
        : (
            student.specialCategory ||
            null
          );


    // ==========================================================
    // ADMISSION
    // ==========================================================

    case "admissionStatus":
      return (
        student.admissionStatus ||
        null
      );


    // ==========================================================
    // QR CODE
    // ==========================================================

    case "qrCode":

      return {
        type:
          "qrCode",

        studentId:
          student._id,

        registerNumber:
          student.registerNumber ||
          null,
      };


    // ==========================================================
    // UNKNOWN FIELD
    // ==========================================================

    default:

      console.warn(
        "ID CARD DYNAMIC FIELD NOT RESOLVED:",
        {
          key,
          student,
        }
      );

      return null;
  }
};


// ============================================================
// ADDRESS FORMATTER
// ============================================================

const formatAddress = (
  address
) => {

  if (!address) {
    return null;
  }


  // ----------------------------------------------------------
  // If address is already a string
  // ----------------------------------------------------------

  if (
    typeof address ===
    "string"
  ) {
    return address.trim() ||
      null;
  }


  // ----------------------------------------------------------
  // Object address
  // ----------------------------------------------------------

  if (
    typeof address !==
    "object"
  ) {
    return null;
  }


  const parts = [

    address.addressLine1,

    address.addressLine2,

    address.street,

    address.area,

    address.village,

    address.city,

    address.town,

    address.district,

    address.state,

    address.pincode,

  ].filter(Boolean);


  if (
    parts.length === 0
  ) {
    return null;
  }


  return parts.join(", ");
};