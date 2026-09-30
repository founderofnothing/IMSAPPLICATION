import fs from "fs";
import xlsx from "xlsx";

import mongoose from "mongoose";
import Institution  from "../institution/institution.model.js"
import Department from "./../department/department.model.js"
import Programme from "../programme/programme.model.js"
import Class from "../class/class.model.js"
import Batch from "../batch/batch.model.js"
import Student from "./student.model.js";
import StudentTransport from "./../transport/models/studentTransport.model.js";









// create student function 
export const createStudentService = async (
  studentData,
  user
) => {
  // ============================================================
  // VALIDATE INSTITUTION
  // ============================================================

  studentData.institutionId = user.institution;

  const institution = await Institution.findById(
    user.institution
  );

  if (!institution) {
    throw new Error("Institution not found.");
  }

  // ============================================================
  // GENERATE APPLICATION NUMBER
  // ============================================================

  const totalStudents = await Student.countDocuments({
    institutionId: studentData.institutionId,
  });

  const nextNumber = totalStudents + 1;

  studentData.applicationNumber =
    `${institution.institutionCode.toUpperCase()}${String(
      nextNumber
    ).padStart(4, "0")}`;

  // ============================================================
  // VALIDATE BATCH
  // ============================================================

  if (studentData.batchId) {
    const batch = await Batch.findOne({
      _id: studentData.batchId,
      isDeleted: false,
    });

    if (!batch) {
      throw new Error("Batch not found.");
    }
  }

  // ============================================================
  // ENTRY TYPE
  // ============================================================

  if (studentData.entryType) {
    const allowedEntryTypes = [
      "NORMAL",
      "LATER_ENTRY",
      "LATER_JOIN",
    ];

    if (
      !allowedEntryTypes.includes(
        studentData.entryType
      )
    ) {
      throw new Error(
        "Invalid entry type. Allowed values: NORMAL, LATER_ENTRY, LATER_JOIN."
      );
    }
  } else {
    studentData.entryType = "NORMAL";
  }

  // ============================================================
  // SYLLABUS TYPE
  // ============================================================

  if (studentData.syllabusType) {
    const allowedSyllabusTypes = [
      "CURRENT",
      "OLD",
    ];

    if (
      !allowedSyllabusTypes.includes(
        studentData.syllabusType
      )
    ) {
      throw new Error(
        "Invalid syllabus type. Allowed values: CURRENT, OLD."
      );
    }
  } else {
    studentData.syllabusType = "CURRENT";
  }

  // ============================================================
  // ARRANGEMENT NUMBER
  // ============================================================

  if (
    studentData.arrangementNumber !== undefined &&
    studentData.arrangementNumber !== null &&
    studentData.arrangementNumber !== ""
  ) {
    const arrangementNumber = Number(
      studentData.arrangementNumber
    );

    if (
      !Number.isInteger(arrangementNumber) ||
      arrangementNumber < 1
    ) {
      throw new Error(
        "Arrangement number must be a positive whole number."
      );
    }

    studentData.arrangementNumber =
      arrangementNumber;
  } else {
    studentData.arrangementNumber = null;
  }

  // ============================================================
  // CHECK DUPLICATE REGISTER NUMBER
  // ============================================================

  if (studentData.registerNumber) {
    const existingRegister =
      await Student.findOne({
        registerNumber:
          studentData.registerNumber,
      });

    if (existingRegister) {
      throw new Error(
        "Register number already exists."
      );
    }
  }

  // ============================================================
  // CHECK DUPLICATE STUDENT EMAIL
  // ============================================================

  if (studentData.studentEmail) {
    studentData.studentEmail =
      studentData.studentEmail
        .toLowerCase()
        .trim();

    const existingEmail =
      await Student.findOne({
        studentEmail:
          studentData.studentEmail,
      });

    if (existingEmail) {
      throw new Error(
        "Student email already exists."
      );
    }
  }

  // ============================================================
  // NORMALIZE STUDENT TYPE
  // ============================================================

  studentData.studentType =
    studentData.studentType
      ?.trim()
      .toUpperCase();

  // ============================================================
  // CLASS ASSIGNMENT
  // ============================================================

  studentData.classId =
    studentData.classId || null;

  // ============================================================
  // CREATE STUDENT
  // ============================================================

  const student = await Student.create(
    studentData
  );

  return student;
};
// get all student (all)
export const getAllStudentsService = async ({
  page = 1,
  limit = 10,
  institutionId,
  batchId,
  classId,
  search,
}) => {
  // Build filter object
  const filter = {};

  // Validate & Apply Institution Filter
  if (institutionId) {
    if (!mongoose.Types.ObjectId.isValid(institutionId)) {
      throw new Error("Invalid institution ID.");
    }

    filter.institutionId = institutionId;
  }

  // Validate & Apply Batch Filter
if (batchId) {
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new Error("Invalid batch ID.");
  }

  filter.batchId = batchId;
}

  // Validate & Apply Class Filter
  if (classId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID.");
    }

    filter.classId = classId;
  }

  // Search Filter
  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter.$or = [
      {
        registerNumber: searchRegex,
      },
      {
        studentEmail: searchRegex,
      },
      {
        bloodGroup: searchRegex,
      },
    ];
  }

  // Pagination
  const currentPage = Number(page);
  const pageSize = Number(limit);

  const skip = (currentPage - 1) * pageSize;

  // Fetch Data
  const [students, totalRecords] = await Promise.all([
    Student.find(filter)
    .select(
  `
  registerNumber
  studentName
  gender
  bloodGroup
  studentEmail
  institutionId
  batchId
  classId
`
)
   .populate({
  path: "institutionId",
  select: "institutionName",
})
.populate({
  path: "batchId",
  select:
    "batchName startYear endYear",
})
.populate({
  path: "classId",
  select: "year section",
})
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageSize),

    Student.countDocuments(filter),
  ]);

  return {
    students,
    currentPage,
    totalPages: Math.ceil(totalRecords / pageSize),
    totalRecords,
    count: students.length,
  };
};
// get class by the insitution 
// Get classes for logged-in institution
export const getMyInstitutionClassesService = async (
  institutionId,
  {
    departmentId,
    programmeId,
    batchId,
  } = {}
) => {
  const query = {
    institution: institutionId,
    isDeleted: false,
  };

  // Filter by Department
  if (departmentId) {
    query.department = departmentId;
  }

  // Filter by Programme
  if (programmeId) {
    query.programme = programmeId;
  }

  // Filter by Batch
  if (batchId) {
    query.batchId = batchId;
  }

  // Fetch Classes
  const classes = await Class.find(query)
    .populate(
      "institution",
      "institutionName institutionCode"
    )
    .populate(
      "department",
      "departmentName"
    )
    .populate(
      "programme",
      "programmeName programmeCode programmeType"
    )
    .populate(
      "batchId",
      "batchName currentYear"
    )
    .populate(
      "classIncharge",
      "fullName email role"
    )
    .sort({
      createdAt: -1,
    });

  // Add current student count to each class
  const classesWithStudentCount = await Promise.all(
    classes.map(async (classItem) => {
      const studentCount = await Student.countDocuments({
        institutionId,
        classId: classItem._id,
        isDeleted: false,
      });

      return {
        ...classItem.toObject(),
        studentCount,
      };
    })
  );

  return classesWithStudentCount;
};
// get single student function 
export const getSingleStudentService = async (studentId) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student ID.");
  }

  const student = await Student.findById(studentId)
 .populate(
  "institutionId",
  "institutionName"
)
.populate(
  "batchId",
  "batchName startYear endYear"
)

    .populate({
      path: "departmentId",
      select: "departmentName",
    })
    .populate({
      path: "programmeId",
      select: "programmeName programmeCode programmeType duration",
    })
.populate({
  path: "classId",
  populate: [
    {
      path: "department",
      select: "departmentName",
    },
    {
      path: "programme",
      select: "programmeName",
    },
    {
      path: "batchId",
      select: "batchName",
    },
  ],
})

  if (!student) {
    throw new Error("Student not found.");
  }

  return student;
};
// update student function 
export const updateStudentService = async (
  studentId,
  updateData
) => {
  // ============================================================
  // VALIDATE STUDENT ID
  // ============================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    throw new Error(
      "Invalid student ID."
    );
  }

  // ============================================================
  // CHECK STUDENT EXISTS
  // ============================================================

  const existingStudent =
    await Student.findById(studentId);

  if (!existingStudent) {
    throw new Error(
      "Student not found."
    );
  }

  // ============================================================
  // NORMALIZE EMAIL
  // ============================================================

  if (updateData.studentEmail) {
    updateData.studentEmail =
      updateData.studentEmail
        .toLowerCase()
        .trim();
  }

  // ============================================================
  // APPLICATION NUMBER CHECK
  // ============================================================

  if (
    updateData.applicationNumber &&
    updateData.applicationNumber !==
      existingStudent.applicationNumber
  ) {
    const existingApplication =
      await Student.findOne({
        applicationNumber:
          updateData.applicationNumber,
        _id: {
          $ne: studentId,
        },
      });

    if (existingApplication) {
      throw new Error(
        "This application number is already occupied."
      );
    }
  }

  // ============================================================
  // REGISTER NUMBER CHECK
  // ============================================================

  if (
    updateData.registerNumber &&
    updateData.registerNumber !==
      existingStudent.registerNumber
  ) {
    const existingRegister =
      await Student.findOne({
        registerNumber:
          updateData.registerNumber,
        _id: {
          $ne: studentId,
        },
      });

    if (existingRegister) {
      throw new Error(
        "This register number is already occupied."
      );
    }
  }

  // ============================================================
  // STUDENT EMAIL CHECK
  // ============================================================

  if (
    updateData.studentEmail &&
    updateData.studentEmail !==
      existingStudent.studentEmail
  ) {
    const existingEmail =
      await Student.findOne({
        studentEmail:
          updateData.studentEmail,
        _id: {
          $ne: studentId,
        },
      });

    if (existingEmail) {
      throw new Error(
        "This email address is already occupied."
      );
    }
  }

  // ============================================================
  // BATCH VALIDATION
  // ============================================================

  if (updateData.batchId) {
    if (
      !mongoose.Types.ObjectId.isValid(
        updateData.batchId
      )
    ) {
      throw new Error(
        "Invalid batch ID."
      );
    }

    const batch =
      await Batch.findOne({
        _id: updateData.batchId,
        isDeleted: false,
      });

    if (!batch) {
      throw new Error(
        "Batch not found."
      );
    }
  }

  // ============================================================
  // ENTRY TYPE VALIDATION
  // ============================================================

  if (
    updateData.entryType !== undefined
  ) {
    const allowedEntryTypes = [
      "NORMAL",
      "LATER_ENTRY",
      "LATER_JOIN",
    ];

    if (
      !allowedEntryTypes.includes(
        updateData.entryType
      )
    ) {
      throw new Error(
        "Invalid entry type. Allowed values: NORMAL, LATER_ENTRY, LATER_JOIN."
      );
    }
  }

  // ============================================================
  // SYLLABUS TYPE VALIDATION
  // ============================================================

  if (
    updateData.syllabusType !== undefined
  ) {
    const allowedSyllabusTypes = [
      "CURRENT",
      "OLD",
    ];

    if (
      !allowedSyllabusTypes.includes(
        updateData.syllabusType
      )
    ) {
      throw new Error(
        "Invalid syllabus type. Allowed values: CURRENT, OLD."
      );
    }
  }

  // ============================================================
  // ARRANGEMENT NUMBER VALIDATION
  // ============================================================

  if (
    updateData.arrangementNumber !==
      undefined &&
    updateData.arrangementNumber !==
      null &&
    updateData.arrangementNumber !== ""
  ) {
    const arrangementNumber =
      Number(
        updateData.arrangementNumber
      );

    if (
      !Number.isInteger(
        arrangementNumber
      ) ||
      arrangementNumber < 1
    ) {
      throw new Error(
        "Arrangement number must be a positive whole number."
      );
    }

    updateData.arrangementNumber =
      arrangementNumber;
  }

  // ============================================================
  // UPDATE STUDENT
  // ============================================================

  const updatedStudent =
    await Student.findByIdAndUpdate(
      studentId,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

  return updatedStudent;
};



// soft delete student 
export const softDeleteStudentService =
  async (studentId) => {

    const student =
      await Student.findOne({
        _id: studentId,
        isDeleted: false,
      });

    if (!student) {
      throw new Error(
        "Student not found."
      );
    }

    student.isDeleted = true;
    student.deletedAt = new Date();

    await student.save();

    return student;
};
// get all delete student 
export const getDeletedStudentsService =
  async (
    institutionId
  ) => {

    const students =
      await Student.find({
        institutionId,
        isDeleted: true,
      })

      .populate(
        "departmentId",
        "departmentName"
      )

      .populate(
        "programmeId",
        "programmeName"
      )

      .populate(
        "batchId",
        "batchName"
      )

      .sort({
        deletedAt: -1,
      });

    return students;
};
// restore the student 
export const restoreStudentService =
  async (
    studentId
  ) => {

    const student =
      await Student.findOne({
        _id: studentId,
        isDeleted: true,
      });

    if (!student) {
      throw new Error(
        "Student not found."
      );
    }

    student.isDeleted =
      false;

    student.deletedAt =
      null;

    await student.save();

    return student;
};

// delete student function 
export const permanentDeleteStudentService =
  async (studentId) => {

    const student =
      await Student.findOne({
        _id: studentId,
        isDeleted: true,
      });

    if (!student) {
      throw new Error(
        "Student must be in recycle bin before permanent deletion."
      );
    }

    await Student.findByIdAndDelete(
      studentId
    );

    return {
      message:
        "Student permanently deleted.",
    };
};






// ==================== TRANSFER STUDENT ====================

export const transferStudentService = async ({
  studentId,
  departmentId,
  programmeId,
  batchId,
  classId = null,
  institutionId,
}) => {

  // ----------------------------------------------------
  // Validate Student ID
  // ----------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student ID.");
  }

  // ----------------------------------------------------
  // Validate Department
  // ----------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new Error("Invalid department ID.");
  }

  // ----------------------------------------------------
  // Validate Programme
  // ----------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(programmeId)) {
    throw new Error("Invalid programme ID.");
  }

  // ----------------------------------------------------
  // Validate Batch
  // ----------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new Error("Invalid batch ID.");
  }

  // ----------------------------------------------------
  // Find Student
  // ----------------------------------------------------

  const student = await Student.findOne({
    _id: studentId,
    institutionId,
    isDeleted: false,
  });

  if (!student) {
    throw new Error(
      "Student not found in your institution."
    );
  }

  // ----------------------------------------------------
  // Find Department
  // ----------------------------------------------------

  const department = await Department.findOne({
    _id: departmentId,
    institution: institutionId,
    isDeleted: false,
  });

  if (!department) {
    throw new Error(
      "Selected department does not belong to this institution."
    );
  }

  // ----------------------------------------------------
  // Find Programme
  // ----------------------------------------------------

  const programme = await Programme.findOne({
    _id: programmeId,
    department: departmentId,
    isDeleted: false,
  });

  if (!programme) {
    throw new Error(
      "Selected programme does not belong to the selected department."
    );
  }

  // ----------------------------------------------------
  // Find Batch
  // ----------------------------------------------------

  const batch = await Batch.findOne({
    _id: batchId,
    isDeleted: false,
  });

  if (!batch) {
    throw new Error("Selected batch not found.");
  }

  // ----------------------------------------------------
  // Optional Class Validation
  // ----------------------------------------------------

  if (classId) {

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID.");
    }

    const classData = await Class.findOne({
      _id: classId,
      institution: institutionId,
      department: departmentId,
      programme: programmeId,
      batchId: batchId,
      isDeleted: false,
      isActive: true,
    });

    if (!classData) {
      throw new Error(
        "Selected class does not belong to the selected department, programme and batch."
      );
    }
  }

  // ----------------------------------------------------
  // Update Student
  // ----------------------------------------------------

  student.departmentId = departmentId;
  student.programmeId = programmeId;
  student.batchId = batchId;

  // If no class is selected, student becomes unassigned
  student.classId = classId || null;

  await student.save();

  // ----------------------------------------------------
  // Return Updated Student
  // ----------------------------------------------------

  return Student.findById(student._id)
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .populate(
      "departmentId",
      "departmentName"
    )
    .populate(
      "programmeId",
      "programmeName programmeCode programmeType duration"
    )
    .populate(
      "batchId",
      "batchName startYear endYear"
    )
    .populate(
      "classId",
      "section"
    );
};





// fetch by jwt (institution )
export const getStudentsByInstitutionService = async ({
  institutionId,
  page = 1,
  limit = 10,
  classId,
  search = "",
}) => {

  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;


  // ==========================================================
  // INSTITUTION-WIDE STATISTICS
  // ==========================================================

  const statisticsMatch = {

    institutionId:
      new mongoose.Types.ObjectId(
        institutionId
      ),

    isDeleted: false,

  };


  // ==========================================================
  // STUDENT TABLE FILTER
  // ==========================================================

  const matchStage = {

    institutionId:
      new mongoose.Types.ObjectId(
        institutionId
      ),

    isDeleted: false,


    // --------------------------------------------------------
    // CLASS FILTER
    // --------------------------------------------------------

    ...(classId && {

      classId:
        new mongoose.Types.ObjectId(
          classId
        ),

    }),


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    ...(search && {

      $or: [

        {
          studentName: {
            $regex: search,
            $options: "i",
          },
        },

        {
          registerNumber: {
            $regex: search,
            $options: "i",
          },
        },

        {
          applicationNumber: {
            $regex: search,
            $options: "i",
          },
        },

        {
          studentEmail: {
            $regex: search,
            $options: "i",
          },
        },

      ],

    }),

  };


  // ==========================================================
  // INSTITUTION STATISTICS
  // ==========================================================

  const statisticsResult =
    await Student.aggregate([

      {
        $match:
          statisticsMatch,
      },


      {
        $group: {

          _id: null,


          // --------------------------------------------------
          // TOTAL STUDENTS
          // --------------------------------------------------

          totalStudents: {
            $sum: 1,
          },


          // --------------------------------------------------
          // UG STUDENTS
          // --------------------------------------------------

          ugStudents: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$studentType",
                    "UG",
                  ],
                },

                1,

                0,

              ],

            },

          },


          // --------------------------------------------------
          // PG STUDENTS
          // --------------------------------------------------

          pgStudents: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$studentType",
                    "PG",
                  ],
                },

                1,

                0,

              ],

            },

          },


          // --------------------------------------------------
          // MALE STUDENTS
          // --------------------------------------------------

          maleStudents: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$gender",
                    "Male",
                  ],
                },

                1,

                0,

              ],

            },

          },


          // --------------------------------------------------
          // FEMALE STUDENTS
          // --------------------------------------------------

          femaleStudents: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$gender",
                    "Female",
                  ],
                },

                1,

                0,

              ],

            },

          },

        },

      },

    ]);


  // ==========================================================
  // DEFAULT STATISTICS
  // ==========================================================

  const statistics =
    statisticsResult[0] || {

      totalStudents: 0,

      ugStudents: 0,

      pgStudents: 0,

      maleStudents: 0,

      femaleStudents: 0,

    };


  // ==========================================================
  // FETCH STUDENTS FOR TABLE
  // ==========================================================

  const students =
    await Student.find(
      matchStage
    )

      // ------------------------------------------------------
      // ONLY REQUIRED FIELDS
      // ------------------------------------------------------

      .select(
        "_id registerNumber studentName studentEmail dateOfBirth gender departmentId"
      )


      // ------------------------------------------------------
      // DEPARTMENT
      // ------------------------------------------------------

      .populate(
        "departmentId",
        "departmentName"
      )


      // ------------------------------------------------------
      // SORT
      // ------------------------------------------------------

      .sort({
        createdAt: -1,
      })


      // ------------------------------------------------------
      // PAGINATION
      // ------------------------------------------------------

      .skip(skip)

      .limit(limit)

      .lean();


  // ==========================================================
  // FILTERED TABLE TOTAL
  // ==========================================================

  const totalRecords =
    await Student.countDocuments(
      matchStage
    );


  // ==========================================================
  // TOTAL PAGES
  // ==========================================================

  const totalPages =
    Math.ceil(
      totalRecords / limit
    );


  // ==========================================================
  // RESPONSE
  // ==========================================================

  return {

    // --------------------------------------------------------
    // INSTITUTION STATISTICS
    // --------------------------------------------------------

    statistics: {

      totalStudents:
        statistics.totalStudents,

      ugStudents:
        statistics.ugStudents,

      pgStudents:
        statistics.pgStudents,

      maleStudents:
        statistics.maleStudents,

      femaleStudents:
        statistics.femaleStudents,

    },


    // --------------------------------------------------------
    // STUDENT TABLE DATA
    // --------------------------------------------------------

    students,


    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    currentPage:
      page,

    totalPages,

    totalRecords,

    count:
      students.length,

  };

};



// fetch std by jwt (department)
// ==================== GET STUDENTS BY DEPARTMENT ====================

// ==================== GET STUDENTS BY DEPARTMENT ====================

export const getStudentsByDepartmentService = async ({
  departmentId,
  page = 1,
  limit = 10,
  batchId,
  classId,
  search,
}) => {

  // =====================================================
  // VALIDATE DEPARTMENT ID
  // =====================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      departmentId
    )
  ) {
    throw new Error(
      "Invalid department ID."
    );
  }


  // =====================================================
  // BASE FILTER
  // =====================================================

  const filter = {

    departmentId,

    isDeleted: false,

  };


  // =====================================================
  // BATCH FILTER
  // =====================================================

  if (batchId) {

    if (
      !mongoose.Types.ObjectId.isValid(
        batchId
      )
    ) {
      throw new Error(
        "Invalid batch ID."
      );
    }

    filter.batchId =
      batchId;

  }


  // =====================================================
  // CLASS FILTER
  // =====================================================

  if (classId) {

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {
      throw new Error(
        "Invalid class ID."
      );
    }

    filter.classId =
      classId;

  }


  // =====================================================
  // SEARCH
  // =====================================================

  if (search) {

    const searchRegex =
      new RegExp(
        search,
        "i"
      );

    filter.$or = [

      {
        studentName:
          searchRegex,
      },

      {
        registerNumber:
          searchRegex,
      },

      {
        studentEmail:
          searchRegex,
      },

      {
        bloodGroup:
          searchRegex,
      },

    ];

  }


  // =====================================================
  // PAGINATION
  // =====================================================

  const currentPage =
    Number(page) || 1;

  const pageLimit =
    Number(limit) || 10;

  const skip =
    (currentPage - 1) *
    pageLimit;


  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const students =
    await Student.find(filter)

      .select(`
        registerNumber
        studentName
        gender
        bloodGroup
        studentEmail
        institutionId
        departmentId
        programmeId
        batchId
        classId
        studentType
      `)

      .populate(
        "institutionId",
        "institutionName"
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
        "batchId",
        "batchName admissionYear graduationYear"
      )

      .populate(
        "classId",
        "section"
      )

      .sort({
        studentName: 1,
      })

      .skip(skip)

      .limit(pageLimit);


  // =====================================================
  // TOTAL STUDENTS
  // =====================================================

  const totalStudents =
    await Student.countDocuments(
      filter
    );


  // =====================================================
  // UG STUDENTS
  // =====================================================

  const ugStudents =
    await Student.countDocuments({

      ...filter,

      studentType: "UG",

    });


  // =====================================================
  // PG STUDENTS
  // =====================================================

  const pgStudents =
    await Student.countDocuments({

      ...filter,

      studentType: "PG",

    });


  // =====================================================
  // MALE STUDENTS
  // =====================================================

  const maleStudents =
    await Student.countDocuments({

      ...filter,

      gender: "Male",

    });


  // =====================================================
  // FEMALE STUDENTS
  // =====================================================

  const femaleStudents =
    await Student.countDocuments({

      ...filter,

      gender: "Female",

    });


  // =====================================================
  // OTHER STUDENTS
  // =====================================================

  const otherStudents =
    await Student.countDocuments({

      ...filter,

      gender: "Other",

    });


  // =====================================================
  // RETURN
  // =====================================================

  return {

    // =========================
    // STUDENTS
    // =========================

    students,


    // =========================
    // PAGINATION
    // =========================

    currentPage,

    totalPages:
      Math.ceil(
        totalStudents /
        pageLimit
      ),

    totalRecords:
      totalStudents,

    count:
      students.length,


    // =========================
    // STUDENT STATISTICS
    // =========================

    totalStudents,

    ugStudents,

    pgStudents,

    maleStudents,

    femaleStudents,

    otherStudents,

  };

};
// fetch by class id 
export const getStudentsByClassService = async (
  classId,
  page = 1,
  limit = 10,
  search = ""
) => {
  const filter = {
    classId,
  };

  // Search
  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter.$or = [
      { studentName: searchRegex },
      { registerNumber: searchRegex },
      { studentEmail: searchRegex },
      { bloodGroup: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const students = await Student.find(filter)
  .select(`
  registerNumber
  studentName
  gender
  bloodGroup
  studentEmail
  institutionId
  departmentId
  programmeId
  batchId
  classId
`)
    .populate("institutionId", "institutionName")
    .populate("classId", "year section")
   .sort({
  studentName: 1,
})
    .skip(skip)
    .limit(limit);

  const totalRecords = await Student.countDocuments(filter);

  return {
    students,
    currentPage: page,
    totalPages: Math.ceil(totalRecords / limit),
    totalRecords,
    count: students.length,
  };
};















// student class assiging
// Get students for class assignment / management
export const getStudentClassAssignmentService = async ({
  institutionId,
  batchId,
  programmeId,
  classId,
  classAssigned,
  search = "",
}) => {
  // -------------------------
  // Base Filter
  // -------------------------

  const filter = {
    institutionId,
    isDeleted: false,
  };

  // -------------------------
  // Batch Filter
  // -------------------------

  if (batchId) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      throw new Error("Invalid batch ID.");
    }

    filter.batchId = batchId;
  }

  // -------------------------
  // Programme Filter
  // -------------------------

  if (programmeId) {
    if (!mongoose.Types.ObjectId.isValid(programmeId)) {
      throw new Error("Invalid programme ID.");
    }

    filter.programmeId = programmeId;
  }

  // -------------------------
  // Specific Class Filter
  // Useful for split / management
  // -------------------------

  if (classId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID.");
    }

    filter.classId = classId;
  }

  // -------------------------
  // Assigned / Unassigned
  // -------------------------

  if (!classId && classAssigned === "true") {
    filter.classId = { $ne: null };
  }

  if (!classId && classAssigned === "false") {
    filter.classId = null;
  }

  // -------------------------
  // Search
  // -------------------------

  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");

    filter.$or = [
      { registerNumber: regex },
      { studentName: regex },
      { studentEmail: regex },
      { studentMobile: regex },
    ];
  }

  // -------------------------
  // Fetch Students
  // -------------------------
console.log("FINAL STUDENT FILTER:", filter);
  const students = await Student.find(filter)
    .select(`
      registerNumber
      studentName
      gender
      studentMobile
      studentEmail
      institutionId
      departmentId
      programmeId
      batchId
      classId
    `)
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
      "batchId",
      "batchName currentYear startYear endYear"
    )
    .populate(
      "classId",
      "section"
    )
    .sort({
      studentName: 1,
    });

  // -------------------------
  // Return
  // -------------------------

  return {
    totalRecords: students.length,
    students,
  };
};

export const assignClassService = async (
  classId,
  studentIds,
  institutionId
) => {
  // Validate Class ID
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    throw new Error("Invalid class ID.");
  }

  // Validate Student IDs
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error("Please select at least one student.");
  }

  const uniqueStudentIds = [...new Set(studentIds)];

  for (const studentId of uniqueStudentIds) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error("One or more student IDs are invalid.");
    }
  }

  // Find Class
  const classData = await Class.findOne({
    _id: classId,
    institution: institutionId,
    isDeleted: false,
  });

  if (!classData) {
    throw new Error("Class not found in your institution.");
  }

  // Fetch Selected Students
  const students = await Student.find({
    _id: { $in: uniqueStudentIds },
    institutionId,
    isDeleted: false,
  });

  if (students.length !== uniqueStudentIds.length) {
    throw new Error(
      "One or more selected students were not found in your institution."
    );
  }

  // Validate Every Student
  for (const student of students) {
    if (student.classId) {
      throw new Error(
        `${student.studentName} is already assigned to a class.`
      );
    }

    if (
      String(student.departmentId) !==
      String(classData.department)
    ) {
      throw new Error(
        `${student.studentName} does not belong to this department.`
      );
    }

    if (
      String(student.programmeId) !==
      String(classData.programme)
    ) {
      throw new Error(
        `${student.studentName} does not belong to this programme.`
      );
    }

    if (
      String(student.batchId) !==
      String(classData.batchId)
    ) {
      throw new Error(
        `${student.studentName} does not belong to this batch.`
      );
    }
  }

  // Assign Class
  const result = await Student.updateMany(
    {
      _id: { $in: uniqueStudentIds },
      institutionId,
      classId: null,
      isDeleted: false,
    },
    {
      $set: {
        classId: classData._id,
      },
    }
  );

  if (result.modifiedCount !== uniqueStudentIds.length) {
    throw new Error(
      "Some students could not be assigned. Please refresh and try again."
    );
  }

  return {
    classId: classData._id,
    section: classData.section,
    assignedCount: result.modifiedCount,
    message: `${result.modifiedCount} student${
      result.modifiedCount === 1 ? "" : "s"
    } assigned to Section ${classData.section} successfully.`,
  };
};
// move student from the class
// ==================== MOVE STUDENTS BETWEEN CLASSES ====================
export const moveStudentsService = async ({
  sourceClassId,
  targetClassId,
  studentIds,
  institutionId,
}) => {
  // Validate Class IDs
  if (
    !mongoose.Types.ObjectId.isValid(sourceClassId) ||
    !mongoose.Types.ObjectId.isValid(targetClassId)
  ) {
    throw new Error("Invalid class ID.");
  }

  if (sourceClassId === targetClassId) {
    throw new Error(
      "Source and target class cannot be the same."
    );
  }

  // Validate Student IDs
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error(
      "Please select at least one student."
    );
  }

  const uniqueStudentIds = [...new Set(studentIds)];

  for (const studentId of uniqueStudentIds) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error(
        "One or more student IDs are invalid."
      );
    }
  }

  // Fetch Source + Target Classes
  const [sourceClass, targetClass] = await Promise.all([
    Class.findOne({
      _id: sourceClassId,
      institution: institutionId,
      isDeleted: false,
    }),

    Class.findOne({
      _id: targetClassId,
      institution: institutionId,
      isDeleted: false,
    }),
  ]);

  if (!sourceClass) {
    throw new Error("Source class not found.");
  }

  if (!targetClass) {
    throw new Error("Target class not found.");
  }

  // Both classes must represent same academic group
  if (
    String(sourceClass.department) !==
    String(targetClass.department)
  ) {
    throw new Error(
      "Classes belong to different departments."
    );
  }

  if (
    String(sourceClass.programme) !==
    String(targetClass.programme)
  ) {
    throw new Error(
      "Classes belong to different programmes."
    );
  }

  if (
    String(sourceClass.batchId) !==
    String(targetClass.batchId)
  ) {
    throw new Error(
      "Classes belong to different batches."
    );
  }

  // Fetch Selected Students
  const students = await Student.find({
    _id: {
      $in: uniqueStudentIds,
    },
    institutionId,
    classId: sourceClass._id,
    isDeleted: false,
  });

  if (students.length !== uniqueStudentIds.length) {
    throw new Error(
      "One or more selected students do not belong to the source class."
    );
  }

  // Additional academic validation
  for (const student of students) {
    if (
      String(student.departmentId) !==
      String(targetClass.department)
    ) {
      throw new Error(
        `${student.studentName} does not belong to the target department.`
      );
    }

    if (
      String(student.programmeId) !==
      String(targetClass.programme)
    ) {
      throw new Error(
        `${student.studentName} does not belong to the target programme.`
      );
    }

    if (
      String(student.batchId) !==
      String(targetClass.batchId)
    ) {
      throw new Error(
        `${student.studentName} does not belong to the target batch.`
      );
    }
  }

  // Move Students
  const result = await Student.updateMany(
    {
      _id: {
        $in: uniqueStudentIds,
      },
      institutionId,
      classId: sourceClass._id,
      isDeleted: false,
    },
    {
      $set: {
        classId: targetClass._id,
      },
    }
  );

  if (result.modifiedCount !== uniqueStudentIds.length) {
    throw new Error(
      "Some students could not be moved. Refresh and try again."
    );
  }

  return {
    sourceClassId: sourceClass._id,
    targetClassId: targetClass._id,
    sourceSection: sourceClass.section,
    targetSection: targetClass.section,
    movedCount: result.modifiedCount,
  };
};
// merge the class
// ==================== MERGE CLASS ====================
export const mergeClassService = async ({
  sourceClassId,
  targetClassId,
  institutionId,
}) => {
  // ==================== VALIDATE IDS ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      sourceClassId
    )
  ) {
    throw new Error(
      "Invalid source class ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      targetClassId
    )
  ) {
    throw new Error(
      "Invalid target class ID."
    );
  }

  if (
    String(sourceClassId) ===
    String(targetClassId)
  ) {
    throw new Error(
      "Source and target classes cannot be the same."
    );
  }

  // ==================== FETCH CLASSES ====================

  const sourceClass =
    await Class.findOne({
      _id: sourceClassId,
      institution: institutionId,
      isDeleted: false,
      isActive: true,
    });

  const targetClass =
    await Class.findOne({
      _id: targetClassId,
      institution: institutionId,
      isDeleted: false,
      isActive: true,
    });

  if (!sourceClass) {
    throw new Error(
      "Source class not found."
    );
  }

  if (!targetClass) {
    throw new Error(
      "Target class not found."
    );
  }

  // ==================== SAME INSTITUTION ====================

  if (
    String(sourceClass.institution) !==
    String(targetClass.institution)
  ) {
    throw new Error(
      "Classes must belong to the same institution."
    );
  }

  // ==================== SAME DEPARTMENT ====================

  if (
    String(sourceClass.department) !==
    String(targetClass.department)
  ) {
    throw new Error(
      "Classes must belong to the same department."
    );
  }

  // ==================== SAME PROGRAMME ====================

  if (
    String(sourceClass.programme) !==
    String(targetClass.programme)
  ) {
    throw new Error(
      "Classes must belong to the same programme."
    );
  }

  // ==================== SAME BATCH ====================

  if (
    String(sourceClass.batchId) !==
    String(targetClass.batchId)
  ) {
    throw new Error(
      "Classes must belong to the same batch."
    );
  }

  // ==================== MOVE ALL STUDENTS ====================

  const result =
    await Student.updateMany(
      {
        classId: sourceClass._id,
        isDeleted: false,
      },
      {
        $set: {
          classId: targetClass._id,
        },
      }
    );

  // ==================== DEACTIVATE SOURCE ====================

  sourceClass.isActive = false;

  await sourceClass.save();

  // ==================== RETURN ====================

  return {
    sourceClassId:
      sourceClass._id,

    sourceSection:
      sourceClass.section,

    targetClassId:
      targetClass._id,

    targetSection:
      targetClass.section,

    studentsMoved:
      result.modifiedCount,
  };
};


// un assigned student 
// ==================== UNASSIGN STUDENTS FROM CLASS ====================

export const unassignStudentsService = async (
  classId,
  studentIds
) => {

  // Validate class ID
  if (
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }

  // Validate student IDs
  if (
    !Array.isArray(studentIds) ||
    studentIds.length === 0
  ) {
    throw new Error(
      "Please provide student IDs."
    );
  }

  // Check class
const classData = await Class.findOne({
  _id: classId,
  isDeleted: false,
});

  console.log("===== UNASSIGN DEBUG =====");
console.log("classId:", classId);
console.log("studentIds:", studentIds);

const rawClass = await Class.findById(classId);

console.log("RAW CLASS:", rawClass);

  if (!classData) {
    throw new Error(
      "Class not found."
    );
  }

  // Find selected students that actually
  // belong to this class
  const students = await Student.find({
    _id: {
      $in: studentIds,
    },

    classId: classId,
    isDeleted: false,
  });

  if (
    students.length !== studentIds.length
  ) {
    throw new Error(
      "One or more students do not belong to this class."
    );
  }

  // Remove class assignment
  const result = await Student.updateMany(
    {
      _id: {
        $in: studentIds,
      },

      classId: classId,
      isDeleted: false,
    },
    {
      $set: {
        classId: null,
      },
    }
  );

  return {
    studentsUnassigned:
      result.modifiedCount,

    message:
      `${result.modifiedCount} students removed from class successfully.`,
  };
};



// ==================== SPLIT CLASS ====================


export const splitClassService = async ({
  sourceClassId,
  newSection,
  studentIds,
  institutionId,
}) => {
  // Validate source class ID
  if (
    !mongoose.Types.ObjectId.isValid(
      sourceClassId
    )
  ) {
    throw new Error(
      "Invalid source class ID."
    );
  }

  // Validate students
  if (
    !Array.isArray(studentIds) ||
    studentIds.length === 0
  ) {
    throw new Error(
      "Please select students to split."
    );
  }

  const uniqueStudentIds = [
    ...new Set(studentIds),
  ];

  for (const studentId of uniqueStudentIds) {
    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      throw new Error(
        "One or more student IDs are invalid."
      );
    }
  }

  // Validate section
  const section =
    String(newSection || "")
      .trim()
      .toUpperCase();

  if (!section) {
    throw new Error(
      "New section is required."
    );
  }

  // Find source class
  const sourceClass =
    await Class.findOne({
      _id: sourceClassId,
      institution: institutionId,
      isDeleted: false,
      isActive: true,
    });

  if (!sourceClass) {
    throw new Error(
      "Source class not found."
    );
  }

  // Prevent splitting every student
  const sourceStudentCount =
    await Student.countDocuments({
      classId: sourceClass._id,
      isDeleted: false,
    });

  if (
    uniqueStudentIds.length >=
    sourceStudentCount
  ) {
    throw new Error(
      "At least one student must remain in the source class."
    );
  }

  // Prevent duplicate section
  const existingClass =
    await Class.findOne({
      institution:
        sourceClass.institution,

      department:
        sourceClass.department,

      programme:
        sourceClass.programme,

      batchId:
        sourceClass.batchId,

      section,

      isDeleted: false,
    });

  if (existingClass) {
    throw new Error(
      `Section ${section} already exists. Use Move Students instead.`
    );
  }

  // Verify selected students belong to source class
  const students =
    await Student.find({
      _id: {
        $in: uniqueStudentIds,
      },

      institutionId,

      classId:
        sourceClass._id,

      isDeleted: false,
    });

  if (
    students.length !==
    uniqueStudentIds.length
  ) {
    throw new Error(
      "One or more selected students do not belong to this class."
    );
  }

  // Create new class using source academic details
  const newClass =
    await Class.create({
      institution:
        sourceClass.institution,

      department:
        sourceClass.department,

      programme:
        sourceClass.programme,

      batchId:
        sourceClass.batchId,

      section,

      classIncharge: null,
      subjects: [],
    });

  try {
    // Move selected students into new class
    const result =
      await Student.updateMany(
        {
          _id: {
            $in: uniqueStudentIds,
          },

          classId:
            sourceClass._id,

          isDeleted: false,
        },
        {
          $set: {
            classId:
              newClass._id,
          },
        }
      );

    if (
      result.modifiedCount !==
      uniqueStudentIds.length
    ) {
      throw new Error(
        "Some students could not be moved."
      );
    }

    return {
      sourceClassId:
        sourceClass._id,

      sourceSection:
        sourceClass.section,

      newClassId:
        newClass._id,

      newSection:
        newClass.section,

      studentsMoved:
        result.modifiedCount,

      sourceStudentsRemaining:
        sourceStudentCount -
        result.modifiedCount,
    };

  } catch (error) {
    // Don't leave an empty class if assignment fails
    await Class.findByIdAndDelete(
      newClass._id
    );

    throw error;
  }
};


// ==================== GET ALLOCATION CLASSES ====================
export const getAllocationClassesService = async (
  institutionId,
  {
    departmentId,
    programmeId,
    batchId,
  } = {}
) => {
  const query = {
    institution: institutionId,
    isDeleted: false,
  };

  if (departmentId) {
    query.department = departmentId;
  }

  if (programmeId) {
    query.programme = programmeId;
  }

  if (batchId) {
    query.batchId = batchId;
  }

  // Notice:
  // NO isActive filter here.
  // We intentionally want active + inactive classes.

  const classes = await Class.find(query)
    .populate(
      "department",
      "departmentName"
    )
    .populate(
      "programme",
      "programmeName programmeCode programmeType"
    )
    .populate(
      "batchId",
      "batchName currentYear"
    )
    .populate(
      "classIncharge",
      "fullName email role"
    )
    .sort({
      section: 1,
    });

  const classesWithStudentCount =
    await Promise.all(
      classes.map(async (classData) => {
        const studentCount =
          await Student.countDocuments({
            classId: classData._id,
            isDeleted: false,
          });

        return {
          ...classData.toObject(),
          studentCount,
        };
      })
    );

  return classesWithStudentCount;
};




// get student assignment list
export const getStudentAssignmentService =
async ({
  page = 1,
  limit = 10,
  institutionId,
  classId,
  search,
}) => {

  // -------------------------
  // Filter
  // -------------------------

  const filter = {};

  if (institutionId) {

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    filter.institutionId =
      institutionId;

  }

  if (classId) {

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {
      throw new Error(
        "Invalid class ID."
      );
    }

    filter.classId =
      classId;

  }

  if (search) {

    const regex =
      new RegExp(search, "i");

    filter.$or = [

      {
        registerNumber: regex,
      },

      {
        studentName: regex,
      },

      {
        studentEmail: regex,
      },

    ];

  }

  // -------------------------
  // Pagination
  // -------------------------

  const currentPage =
    Number(page);

  const pageLimit =
    Number(limit);

  const skip =
    (currentPage - 1) *
    pageLimit;

  // -------------------------
  // Fetch Students
  // -------------------------

  const [students, totalRecords] =
    await Promise.all([

      Student.find(filter)

        .select(`
          registerNumber
          studentName
          gender
          studentEmail
          institutionId
          departmentId
          classId
        `)

        .populate(
          "institutionId",
          "institutionName"
        )

        .populate(
          "departmentId",
          "departmentName"
        )

        .populate(
          "classId",
          "year section"
        )

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(pageLimit),

      Student.countDocuments(
        filter
      ),

    ]);

  // -------------------------
  // Attach Assignment
  // -------------------------

  const formattedStudents =
    await Promise.all(

      students.map(
        async (student) => {

          const transport =
            await StudentTransport
              .findOne({

                studentId:
                  student._id,

                isDeleted: false,

              })

              .populate(
                "busId",
                "busNumber"
              )

              .populate(
                "routeId",
                "routeName"
              );

          return {

            ...student.toObject(),

            assigned:
              !!transport,

            assignedBus:
              transport?.busId ||
              null,

            assignedRoute:
              transport?.routeId ||
              null,

          };

        }
      )

    );

  return {

    currentPage,

    totalPages:
      Math.ceil(
        totalRecords /
          pageLimit
      ),

    totalRecords,

    limit:
      pageLimit,

    students:
      formattedStudents,

  };

};







// ============================================================
// GET STUDENT DATA FOR ID CARD
// ============================================================
//
// Returns all student + academic + institution data required
// by the ID card dynamic-field resolver.
//
// This is intentionally separate from the class-assignment API.
// ============================================================

export const getStudentIdCardDataService = async (
  studentId
) => {

  // ----------------------------------------------------------
  // VALIDATE STUDENT ID
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    throw new Error(
      "Invalid student ID."
    );
  }


  // ----------------------------------------------------------
  // FETCH STUDENT
  // ----------------------------------------------------------

  const student =
    await Student.findOne({
      _id: studentId,
      isDeleted: false,
    })
      .select(`
        institutionId
        departmentId
        programmeId
        classId
        batchId

        applicationNumber
        academicYear
        studentType
        registerNumber
        studentName
        profilePhoto
        dateOfBirth
        age
        gender
        bloodGroup

        studentMobile
        studentEmail

        communicationAddress
      `)

      // ------------------------------------------------------
      // INSTITUTION
      // ------------------------------------------------------

      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      // ------------------------------------------------------
      // DEPARTMENT
      // ------------------------------------------------------

      .populate(
        "departmentId",
        "departmentName"
      )

      // ------------------------------------------------------
      // PROGRAMME
      // ------------------------------------------------------

      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )

      // ------------------------------------------------------
      // CLASS
      // ------------------------------------------------------

      .populate(
        "classId",
        "section"
      )

      // ------------------------------------------------------
      // BATCH
      // ------------------------------------------------------

      .populate(
        "batchId",
        "batchName currentYear startYear endYear"
      )

      .lean();


  // ----------------------------------------------------------
  // STUDENT NOT FOUND
  // ----------------------------------------------------------

  if (!student) {
    throw new Error(
      "Student not found."
    );
  }


  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return student;
};