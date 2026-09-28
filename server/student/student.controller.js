import {
  createStudentService,
  getAllStudentsService,
  getSingleStudentService,
  updateStudentService,
  softDeleteStudentService,
  getDeletedStudentsService,
  restoreStudentService,
  permanentDeleteStudentService,

  getStudentsByInstitutionService,
  getStudentsByDepartmentService,
  getStudentsByClassService,


getMyInstitutionClassesService,
  getStudentAssignmentService,

  // Academic Allocation
  moveStudentsService,
  getStudentClassAssignmentService,
  assignClassService,
  getStudentIdCardDataService,
  mergeClassService,
  getAllocationClassesService,
  unassignStudentsService,
  transferStudentService,
  splitClassService

} from "./student.service.js";

import {  bulkUploadStudentsService,
  bulkUpdateStudentsService, } from "./bukUpload/studentBulk.service.js"





// create student function 
export const createStudent = async (req, res) => {
  try {
const student =
  await createStudentService(
    req.body,
    req.user
  );

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: student,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// get all student function 
export const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      institutionId,
      classId,
      search,
    } = req.query;

    const result = await getAllStudentsService({
      page: Number(page),
      limit: Number(limit),
      institutionId,
      classId,
      search,
    });

    return res.status(200).json({
      success: true,
      message:
        result.totalRecords > 0
          ? "Students fetched successfully."
          : "No students found.",

      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
      count: result.count,
      data: result.students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get class by the insitution
// Get classes for logged-in institution
export const getMyInstitutionClasses = async (req, res) => {
  try {
    const classes = await getMyInstitutionClassesService(
      req.user.institution,
      req.query
    );

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Single Student
export const getSingleStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await getSingleStudentService(id);

    return res.status(200).json({
      success: true,
      message: "Student fetched successfully.",
      data: student,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
// Update Student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedStudent = await updateStudentService(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      data: updatedStudent,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// soft delete student 
export const softDeleteStudent =
  async (req, res) => {

    try {

      const result =
        await softDeleteStudentService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Student moved to recycle bin.",
        data: result,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
};
// get all delete student 
export const getDeletedStudents =
  async (req, res) => {

    try {

      const result =
        await getDeletedStudentsService(
          req.user.institution
        );

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
};
// restore the student 
export const restoreStudent =
  async (req, res) => {

    try {

      const result =
        await restoreStudentService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Student restored successfully.",
        data: result,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
};
// 
// delete student function 
export const permanentDeleteStudent =
  async (req, res) => {

    try {

      const result =
        await permanentDeleteStudentService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        ...result,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
};



// ==================== TRANSFER STUDENT ====================

export const transferStudent = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      departmentId,
      programmeId,
      batchId,
      classId = null,
    } = req.body;

    // Basic required fields
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    if (!programmeId) {
      return res.status(400).json({
        success: false,
        message: "Programme is required.",
      });
    }

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch is required.",
      });
    }

    const student =
      await transferStudentService({
        studentId: id,
        departmentId,
        programmeId,
        batchId,
        classId,
        institutionId: req.user.institution,
      });

    return res.status(200).json({
      success: true,
      message: classId
        ? "Student transferred and assigned to class successfully."
        : "Student transferred successfully.",
      data: student,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};






// fetch std by institution
// ==========================================================
// GET STUDENTS BY PRINCIPAL'S INSTITUTION
// ==========================================================

export const getInstitutionStudents = async (
  req,
  res
) => {

  try {


    // ========================================================
    // GET INSTITUTION FROM JWT
    // ========================================================

    const institutionId =
      req.user.institution;


    // ========================================================
    // QUERY PARAMETERS
    // ========================================================

    const {
      page = 1,
      limit = 10,
      classId,
      search = "",
    } = req.query;


    // ========================================================
    // SERVICE
    // ========================================================

    const result =
      await getStudentsByInstitutionService({

        institutionId,

        page:
          Number(page),

        limit:
          Number(limit),

        classId,

        search,

      });


    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({

      success: true,


      // ======================================================
      // INSTITUTION STATISTICS
      // ======================================================

      statistics:
        result.statistics,


      // ======================================================
      // PAGINATION
      // ======================================================

      pagination: {

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

      },


      // ======================================================
      // CURRENT PAGE COUNT
      // ======================================================

      count:
        result.count,


      // ======================================================
      // STUDENT DATA
      // ======================================================

      data:
        result.students,

    });


  } catch (error) {


    console.error(
      "GET INSTITUTION STUDENTS ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};
// fetch std by dpt id 
// ======================================================
// GET STUDENTS BY MY DEPARTMENT
// ======================================================

export const getStudentsByDepartment = async (
  req,
  res
) => {

  try {

    // ==================================================
    // CHECK JWT DEPARTMENT
    // ==================================================

    if (!req.user?.department) {

      return res.status(400).json({

        success: false,

        message:
          "Department not found in token.",

      });

    }


    // ==================================================
    // GET QUERY PARAMETERS
    // ==================================================

    const {

      page = 1,

      limit = 10,

      batchId,

      classId,

      search = "",

    } = req.query;


    // ==================================================
    // FETCH STUDENTS
    // ==================================================

    const result =
      await getStudentsByDepartmentService({

        // IMPORTANT:
        // Department comes from JWT

        departmentId:
          req.user.department,

        page:
          Number(page),

        limit:
          Number(limit),

        batchId,

        classId,

        search,

      });


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      success: true,

      message:
        "Department students fetched successfully.",

      data: result,

    });

  } catch (error) {

    // ==================================================
    // ERROR
    // ==================================================

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });

  }

};




// fetch std by class id
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const result = await getStudentsByClassService(
      classId,
      Number(page),
      Number(limit),
      search
    );

    return res.status(200).json({
      success: true,

      message:
        result.totalRecords > 0
          ? "Students fetched successfully."
          : "No students found.",

      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
      count: result.count,

      data: result.students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





//  get student to assign student to class
// Get students for class assignment / management
export const getStudentClassAssignment = async (req, res) => {
  try {
    console.log("=== CLASS ASSIGNMENT CONTROLLER ===");
    console.log("QUERY:", req.query);
    console.log("USER:", req.user);
    console.log("INSTITUTION:", req.user?.institution);

    const result = await getStudentClassAssignmentService({
      ...req.query,
      institutionId: req.user.institution,
    });

    console.log("TOTAL STUDENTS FOUND:", result.totalRecords);

    return res.status(200).json({
      success: true,
      message:
        result.totalRecords > 0
          ? "Students fetched successfully."
          : "No students found.",
      totalRecords: result.totalRecords,
      count: result.students.length,
      data: result.students,
    });

  } catch (error) {
    console.error("CLASS ASSIGNMENT ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// // assign class
// export const assignClass =
//   async (req, res) => {
//     try {

//       const {
//         classId,
//         studentIds,
//       } = req.body;

//       const result =
//         await assignClassService(
//           classId,
//           studentIds
//         );

//       return res.status(200).json({
//         success: true,
//         ...result,
//       });

//     } catch (error) {

//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });

//     }
// };


// ==================== ASSIGN STUDENTS TO EXISTING CLASS ====================
// assign class
export const assignClass = async (req, res) => {
  try {
    const {
      classId,
      studentIds,
    } = req.body;

    const result = await assignClassService(
      classId,
      studentIds,
      req.user.institution
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        classId: result.classId,
        section: result.section,
        assignedCount: result.assignedCount,
      },
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// move student form the class
// ==================== MOVE STUDENTS ====================
export const moveStudents = async (req, res) => {
  try {
    const {
      sourceClassId,
      targetClassId,
      studentIds,
    } = req.body;

    const result = await moveStudentsService({
      sourceClassId,
      targetClassId,
      studentIds,
      institutionId: req.user.institution,
    });

    return res.status(200).json({
      success: true,

      message:
        `${result.movedCount} student${
          result.movedCount === 1 ? "" : "s"
        } moved from Section ${result.sourceSection} ` +
        `to Section ${result.targetSection} successfully.`,

      data: result,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// merge class
// ==================== MERGE CLASS ====================
export const mergeClass = async (
  req,
  res
) => {
  try {
    const {
      sourceClassId,
      targetClassId,
    } = req.body;

    const result =
      await mergeClassService({
        sourceClassId,
        targetClassId,

        institutionId:
          req.user.institution,
      });

    return res.status(200).json({
      success: true,

      message:
        `Section ${result.sourceSection} merged into ` +
        `Section ${result.targetSection}. ` +
        `${result.studentsMoved} students moved successfully.`,

      data: result,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// split class
// ==================== SPLIT CLASS ====================
export const splitClass = async (
  req,
  res
) => {
  try {
    const {
      sourceClassId,
      newSection,
      studentIds,
    } = req.body;

    const result =
      await splitClassService({
        sourceClassId,
        newSection,
        studentIds,

        institutionId:
          req.user.institution,
      });

    return res.status(201).json({
      success: true,

      message:
        `${result.studentsMoved} student${
          result.studentsMoved === 1
            ? ""
            : "s"
        } moved to Section ${result.newSection} successfully.`,

      data: result,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



// ==================== GET ALLOCATION CLASSES ====================

export const getAllocationClasses = async (req, res) => {
  try {
    const {
      departmentId,
      programmeId,
      batchId,
    } = req.query;

    const classes =
      await getAllocationClassesService(
        req.user.institution,
        {
          departmentId,
          programmeId,
          batchId,
        }
      );

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });

  } catch (error) {
    console.error(
      "GET ALLOCATION CLASSES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch allocation classes.",
    });
  }
};
// un assigned student 
// ==================== UNASSIGN STUDENTS FROM CLASS ====================

export const unassignStudents = async (req, res) => {
  try {
    const {
      classId,
      studentIds,
    } = req.body;

    const result =
      await unassignStudentsService(
        classId,
        studentIds
      );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        studentsUnassigned:
          result.studentsUnassigned,
      },
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};













// bulk post 
// ==================== BULK UPLOAD STUDENTS ====================

export const bulkUploadStudents = async (
  req,
  res
) => {
  try {
    // ======================================================
    // CHECK UPLOADED FILE
    // ======================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,

        code:
          "EXCEL_FILE_REQUIRED",

        message:
          "Please upload an Excel file.",
      });
    }


    // ======================================================
    // GET INSTITUTION FROM JWT
    // ======================================================

    const institutionId =
      req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,

        code:
          "INSTITUTION_REQUIRED",

        message:
          "Institution not found in user account.",
      });
    }


    // ======================================================
    // GET ACADEMIC SELECTION FROM FRONTEND
    // ======================================================

    const {
      departmentId,
      programmeId,
      batchId,
      section,
    } = req.body;


    // ======================================================
    // CALL BULK UPLOAD SERVICE
    // ======================================================

    const result =
      await bulkUploadStudentsService(
        req.file,
        {
          institutionId,

          departmentId,

          programmeId,

          batchId,

          section:
            typeof section === "string" &&
            section.trim()
              ? section.trim()
              : null,
        }
      );


    // ======================================================
    // NO STUDENTS INSERTED
    // ======================================================
    //
    // The service can successfully process the Excel file
    // while rejecting every student row.
    //
    // In that case this is NOT a successful bulk upload.
    // Preserve failedStudents/headerWarnings so the frontend
    // can explain exactly why nothing was imported.
    // ======================================================

    if (
      !result.insertedCount ||
      result.insertedCount <= 0
    ) {
      return res.status(422).json({
        ...result,

        success: false,

        code:
          "NO_STUDENTS_INSERTED",

        message:
          result.failedCount > 0
            ? "No students were imported. Please correct the rejected student data and try again."
            : "No students were imported from the uploaded Excel file.",
      });
    }


    // ======================================================
    // SUCCESS / PARTIAL SUCCESS
    // ======================================================
    //
    // 201:
    // All valid students were inserted.
    //
    // failedStudents may still contain rejected rows.
    // This remains a successful bulk operation because
    // at least one student was actually created.
    // ======================================================

    return res
      .status(201)
      .json({
        ...result,

        success: true,
      });

  } catch (error) {

    console.error(
      "BULK STUDENT UPLOAD ERROR:",
      error
    );


    // ======================================================
    // EXCEL HEADER VALIDATION ERROR
    // ======================================================

    if (
      error.code ===
      "EXCEL_HEADER_VALIDATION_FAILED"
    ) {
      return res.status(400).json({
        success: false,

        code:
          error.code,

        message:
          error.message,

        sheetName:
          error.details
            ?.sheetName ??
          null,

        totalColumns:
          error.details
            ?.totalColumns ??
          0,

        errors:
          error.details
            ?.errors ??
          [],

        warnings:
          error.details
            ?.warnings ??
          [],
      });
    }


    // ======================================================
    // MONGODB DUPLICATE KEY ERROR
    // ======================================================

    if (
      error.code === 11000
    ) {
      const duplicateField =
        Object.keys(
          error.keyPattern ??
          error.keyValue ??
          {}
        )[0] ?? null;

      const duplicateValue =
        duplicateField
          ? error.keyValue?.[
              duplicateField
            ] ?? null
          : null;

      return res.status(409).json({
        success: false,

        code:
          "DUPLICATE_STUDENT_DATA",

        message:
          duplicateField
            ? `A student already exists with the same ${duplicateField}.`
            : "Student data conflicts with an existing record.",

        field:
          duplicateField,

        receivedValue:
          duplicateValue,

        expected:
          duplicateField
            ? `Unique ${duplicateField}`
            : null,
      });
    }


    // ======================================================
    // MONGOOSE VALIDATION ERROR
    // ======================================================

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors ?? {}
        ).map(
          (validationError) => ({
            field:
              validationError.path ??
              null,

            receivedValue:
              validationError.value ??
              null,

            reason:
              validationError.message,
          })
        );

      return res.status(400).json({
        success: false,

        code:
          "STUDENT_VALIDATION_FAILED",

        message:
          "Student data failed database validation.",

        errors,
      });
    }


    // ======================================================
    // INVALID MONGODB OBJECT ID / CAST ERROR
    // ======================================================

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,

        code:
          "INVALID_REFERENCE_ID",

        message:
          "One of the selected academic references is invalid.",

        field:
          error.path ??
          null,

        receivedValue:
          error.value ??
          null,
      });
    }


    // ======================================================
    // GENERAL BULK UPLOAD ERROR
    // ======================================================

    return res.status(400).json({
      success: false,

      code:
        error.code ??
        "BULK_UPLOAD_FAILED",

      message:
        error.message ||
        "Student bulk upload failed.",
    });
  }
};

// bulk update 
export const bulkUpdateStudents = async (
  req,
  res
) => {

  try {

    if (!req.file) {

      return res.status(400).json({

        success: false,

        message:
          "Please upload an Excel file.",

      });

    }

    const result =
      await bulkUpdateStudentsService(
        req.file
      );

    return res.status(200).json(result);

 } catch (error) {

  console.error(
    "BULK STUDENT UPDATE ERROR:",
    error
  );

  return res.status(400).json({

    success: false,

    message:
      error.message ||
      "Student bulk update failed.",

  });

}

};


  // get student assignment list
export const getStudentAssignment =
async (req,res)=>{

  try{

    const result =
      await getStudentAssignmentService(
        req.query
      );

    return res.status(200).json({

      success:true,

      message:
        result.totalRecords > 0
        ? "Student assignment list fetched successfully."
        : "No students found.",

      currentPage:
        result.currentPage,

      totalPages:
        result.totalPages,

      totalRecords:
        result.totalRecords,

      limit:
        result.limit,

      data:
        result.students,

    });

  }catch(error){

    return res.status(400).json({

      success:false,

      message:error.message,

    });

  }

};




// ============================================================
// GET STUDENT DATA FOR ID CARD
// ============================================================

export const getStudentIdCardData = async (
  req,
  res
) => {

  try {

    const {
      studentId,
    } = req.params;


    // --------------------------------------------------------
    // FETCH ID CARD DATA
    // --------------------------------------------------------

    const student =
      await getStudentIdCardDataService(
        studentId
      );


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Student ID card data fetched successfully.",
      data: student,
    });

  } catch (error) {

    console.error(
      "GET STUDENT ID CARD DATA ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};