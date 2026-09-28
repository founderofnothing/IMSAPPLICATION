// ============================================================
// ID CARD DYNAMIC FIELD RESOLVER
// ============================================================
//
// Converts a dynamic field key stored in the ID-card template
// into the actual value from a Student document.
//
// Example:
//
// "studentName"
//      ↓
// student.studentName
//
// "departmentName"
//      ↓
// student.departmentId.departmentName
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


  // ----------------------------------------------------------
  // STUDENT BASIC INFORMATION
  // ----------------------------------------------------------

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
      return student.profilePhoto || null;


    // --------------------------------------------------------
    // ACADEMIC INFORMATION
    // --------------------------------------------------------

    case "departmentName":
      return (
        student.departmentId?.departmentName ||
        null
      );


    case "departmentCode":
      return (
        student.departmentId?.departmentCode ||
        null
      );


    case "programmeName":
      return (
        student.programmeId?.programmeName ||
        null
      );


    case "programmeCode":
      return (
        student.programmeId?.programmeCode ||
        null
      );


    // --------------------------------------------------------
    // CLASS INFORMATION
    // --------------------------------------------------------

    case "className":
      return (
        student.classId?.className ||
        null
      );


    case "section":
      return (
        student.classId?.section ||
        null
      );


    // --------------------------------------------------------
    // INSTITUTION INFORMATION
    // --------------------------------------------------------

    case "institutionName":
      return (
        student.institutionId?.institutionName ||
        null
      );


    case "institutionCode":
      return (
        student.institutionId?.institutionCode ||
        null
      );


    // --------------------------------------------------------
    // PERSONAL INFORMATION
    // --------------------------------------------------------

    case "religion":
      return student.religion || null;


    case "communityCategory":
      return (
        student.communityCategory ||
        null
      );


    case "subCaste":
      return student.subCaste || null;


    case "nativePlace":
      return student.nativePlace || null;


    case "motherTongue":
      return student.motherTongue || null;


    // --------------------------------------------------------
    // PARENT / GUARDIAN INFORMATION
    // --------------------------------------------------------

    case "fatherGuardianName":
      return (
        student.fatherGuardianName ||
        null
      );


    case "guardianRelationship":
      return (
        student.guardianRelationship ||
        null
      );


    case "motherName":
      return student.motherName || null;


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


    // --------------------------------------------------------
    // CONTACT INFORMATION
    // --------------------------------------------------------

    case "studentMobile":
      return student.studentMobile || null;


    case "studentEmail":
      return student.studentEmail || null;


    case "parentMobile":
      return student.parentMobile || null;


    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------

    case "communicationAddress":
      return formatAddress(
        student.communicationAddress
      );


    case "permanentAddress":
      return formatAddress(
        student.permanentAddress
      );


    // --------------------------------------------------------
    // GOVERNMENT IDENTIFICATION
    // --------------------------------------------------------

    case "aadharNumber":
      return student.aadharNumber || null;


    case "emisNumber":
      return student.emisNumber || null;


    // --------------------------------------------------------
    // FACILITIES / STATUS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // SPECIAL CATEGORY
    // --------------------------------------------------------

    case "specialCategory":
      return Array.isArray(
        student.specialCategory
      )
        ? student.specialCategory.join(", ")
        : null;


    // --------------------------------------------------------
    // ADMISSION
    // --------------------------------------------------------

    case "admissionStatus":
      return (
        student.admissionStatus ||
        null
      );


    // --------------------------------------------------------
    // QR CODE
    // --------------------------------------------------------
    //
    // QR is generated later.
    // We do NOT store a QR image in Student.
    //
    // The renderer will see this object and generate
    // the actual QR image for this student.
    // --------------------------------------------------------

    case "qrCode":
      return {
        type: "qrCode",
        studentId: student._id,
        registerNumber:
          student.registerNumber || null,
      };


    // --------------------------------------------------------
    // UNKNOWN FIELD
    // --------------------------------------------------------

    default:
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

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.district,
    address.state,
    address.pincode,
  ].filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(", ");
};