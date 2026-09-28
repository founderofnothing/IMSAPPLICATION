import Department from "./department.model.js";
import Institution from "../institution/institution.model.js";



import mongoose from "mongoose";

import Programme from "../programme/programme.model.js";
import Student from "../student/student.model.js";
import TeachingFaculty from "../user/models/teachingFaculty.model.js";
import Class from "../class/class.model.js";


// ============================================================
// GET DEPARTMENT COMPLETE OVERVIEW
// ============================================================

export const getDepartmentOverviewService = async (
  departmentId,
  {
    studentPage = 1,
    studentLimit = 10,
    facultyPage = 1,
    facultyLimit = 10,
  } = {}
) => {

  // ==========================================================
  // VALIDATE DEPARTMENT ID
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      departmentId
    )
  ) {
    throw new Error(
      "Invalid department ID."
    );
  }

  const departmentObjectId =
    new mongoose.Types.ObjectId(
      departmentId
    );


  // ==========================================================
  // PAGINATION
  // ==========================================================

  studentPage =
    Math.max(
      Number(studentPage) || 1,
      1
    );

  studentLimit =
    Math.max(
      Number(studentLimit) || 10,
      1
    );

  facultyPage =
    Math.max(
      Number(facultyPage) || 1,
      1
    );

  facultyLimit =
    Math.max(
      Number(facultyLimit) || 10,
      1
    );

  const studentSkip =
    (studentPage - 1) *
    studentLimit;

  const facultySkip =
    (facultyPage - 1) *
    facultyLimit;


  // ==========================================================
  // VERIFY DEPARTMENT
  // ==========================================================

  const department =
    await Department.findOne({
      _id: departmentObjectId,
      isDeleted: false,
    })
      .populate(
        "institution",
        "institutionName institutionCode"
      )
      .populate(
        "hod",
        "fullName email role"
      )
      .lean();

  if (!department) {
    throw new Error(
      "Department not found."
    );
  }


  // ==========================================================
  // RUN IN PARALLEL
  // ==========================================================

  const [

    // --------------------------------------------------------
    // STUDENT COUNTS
    // --------------------------------------------------------

    totalStudents,
    maleStudents,
    femaleStudents,
    otherStudents,
    ugStudents,
    pgStudents,

    // --------------------------------------------------------
    // FACULTY COUNTS
    // --------------------------------------------------------

    facultyCounts,

    // --------------------------------------------------------
    // PROGRAMMES
    // --------------------------------------------------------

    programmes,

    // --------------------------------------------------------
    // CLASSES
    // --------------------------------------------------------

    classes,

    // --------------------------------------------------------
    // STUDENTS
    // --------------------------------------------------------

    students,

    // --------------------------------------------------------
    // FACULTY
    // --------------------------------------------------------

    faculties,

    // --------------------------------------------------------
    // PAGINATION COUNTS
    // --------------------------------------------------------

    totalStudentRecords,
    totalFacultyRecords,

  ] = await Promise.all([

    // ========================================================
    // TOTAL STUDENTS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,
      isDeleted: false,
    }),


    // ========================================================
    // MALE STUDENTS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,
      gender: "Male",
      isDeleted: false,
    }),


    // ========================================================
    // FEMALE STUDENTS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,
      gender: "Female",
      isDeleted: false,
    }),


    // ========================================================
    // OTHER STUDENTS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,
      gender: "Other",
      isDeleted: false,
    }),


    // ========================================================
    // UG STUDENTS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,
      studentType: "UG",
      isDeleted: false,
    }),


    // ========================================================
    // PG STUDENTS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,
      studentType: "PG",
      isDeleted: false,
    }),


    // ========================================================
    // FACULTY STATISTICS
    // ========================================================

    TeachingFaculty.aggregate([

      {
        $match: {
          department:
            departmentObjectId,
          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          totalFaculty: {
            $sum: 1,
          },

          maleFaculty: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    {
                      $toLower: {
                        $ifNull: [
                          "$gender",
                          "",
                        ],
                      },
                    },
                    "male",
                  ],
                },
                1,
                0,
              ],
            },
          },

          femaleFaculty: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    {
                      $toLower: {
                        $ifNull: [
                          "$gender",
                          "",
                        ],
                      },
                    },
                    "female",
                  ],
                },
                1,
                0,
              ],
            },
          },

          otherFaculty: {
            $sum: {
              $cond: [
                {
                  $not: {
                    $in: [
                      {
                        $toLower: {
                          $ifNull: [
                            "$gender",
                            "",
                          ],
                        },
                      },
                      [
                        "male",
                        "female",
                      ],
                    ],
                  },
                },
                1,
                0,
              ],
            },
          },
        },
      },

    ]),


    // ========================================================
    // PROGRAMMES + STUDENT COUNT
    // ========================================================

    Programme.aggregate([

      {
        $match: {
          department:
            departmentObjectId,
          isDeleted: false,
        },
      },

      // ------------------------------------------------------
      // JOIN STUDENTS
      // ------------------------------------------------------

      {
        $lookup: {
          from: "students",

          let: {
            programmeId: "$_id",
          },

          pipeline: [

            {
              $match: {
                $expr: {
                  $and: [

                    {
                      $eq: [
                        "$programmeId",
                        "$$programmeId",
                      ],
                    },

                    {
                      $eq: [
                        "$departmentId",
                        departmentObjectId,
                      ],
                    },

                    {
                      $eq: [
                        "$isDeleted",
                        false,
                      ],
                    },

                  ],
                },
              },
            },

            {
              $group: {
                _id: null,

                totalStudents: {
                  $sum: 1,
                },

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

          ],

          as: "studentStats",
        },
      },

      // ------------------------------------------------------
      // FORMAT PROGRAMME
      // ------------------------------------------------------

      {
        $project: {

          _id: 1,

          programmeName: 1,

          programmeCode: 1,

          programmeType: 1,

          studentCount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$studentStats.totalStudents",
                  0,
                ],
              },
              0,
            ],
          },

          maleStudents: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$studentStats.maleStudents",
                  0,
                ],
              },
              0,
            ],
          },

          femaleStudents: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$studentStats.femaleStudents",
                  0,
                ],
              },
              0,
            ],
          },

        },
      },

      {
        $sort: {
          programmeName: 1,
        },
      },

    ]),


    // ========================================================
    // CLASSES
    // ========================================================
    //
    // IMPORTANT:
    // This assumes your Class model contains:
    //
    // department
    // programme
    // section
    // isDeleted
    //
    // If your actual Class model uses different field names,
    // we will change only this section.
    // ========================================================

    Class.aggregate([

      {
        $match: {
          department:
            departmentObjectId,
          isDeleted: false,
        },
      },

      // ------------------------------------------------------
      // PROGRAMME
      // ------------------------------------------------------

      {
        $lookup: {
          from: "programmes",

          localField: "programme",

          foreignField: "_id",

          as: "programmeData",
        },
      },

      {
        $unwind: {
          path: "$programmeData",

          preserveNullAndEmptyArrays: true,
        },
      },

      // ------------------------------------------------------
      // STUDENT COUNT
      // ------------------------------------------------------

      {
        $lookup: {

          from: "students",

          let: {
            classId: "$_id",
          },

          pipeline: [

            {
              $match: {

                $expr: {
                  $and: [

                    {
                      $eq: [
                        "$classId",
                        "$$classId",
                      ],
                    },

                    {
                      $eq: [
                        "$departmentId",
                        departmentObjectId,
                      ],
                    },

                    {
                      $eq: [
                        "$isDeleted",
                        false,
                      ],
                    },

                  ],
                },

              },
            },

            {
              $count:
                "studentCount",
            },

          ],

          as: "studentStats",
        },

      },

      // ------------------------------------------------------
      // FORMAT CLASS
      // ------------------------------------------------------

      {
        $project: {

          _id: 1,

          section: 1,

          className: 1,

          year: 1,

          semester: 1,

          programme: {

            _id:
              "$programmeData._id",

            programmeName:
              "$programmeData.programmeName",

            programmeCode:
              "$programmeData.programmeCode",

          },

          studentCount: {

            $ifNull: [

              {
                $arrayElemAt: [
                  "$studentStats.studentCount",
                  0,
                ],
              },

              0,

            ],

          },

        },

      },

      {
        $sort: {
          className: 1,
          section: 1,
        },
      },

    ]),


    // ========================================================
    // STUDENT LIST
    // ========================================================

    Student.find({

      departmentId:
        departmentObjectId,

      isDeleted: false,

    })

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
        "programmeId",
        "programmeName programmeCode programmeType"
      )

      .populate(
        "batchId",
        "batchName admissionYear graduationYear"
      )

      .populate(
        "classId",
        "section className year semester"
      )

      .sort({
        studentName: 1,
      })

      .skip(studentSkip)

      .limit(studentLimit)

      .lean(),


    // ========================================================
    // FACULTY LIST
    // ========================================================

    TeachingFaculty.aggregate([

      {
        $match: {
          department:
            departmentObjectId,

          isDeleted: false,
        },
      },

      {
        $lookup: {

          from: "users",

          localField: "userId",

          foreignField: "_id",

          as: "userId",

        },
      },

      {
        $unwind:
          "$userId",
      },

      {
        $match: {
          "userId.isDeleted":
            false,
        },
      },

      {
        $project: {

          _id: 1,

          employeeId: 1,

          designation: 1,

          gender: 1,

          maritalStatus: 1,

          bloodGroup: 1,

          userId: {

            _id:
              "$userId._id",

            fullName:
              "$userId.fullName",

            email:
              "$userId.email",

            phone:
              "$userId.phone",

            profileImage:
              "$userId.profileImage",

          },

        },

      },

      {
        $sort: {
          "userId.fullName": 1,
        },
      },

      {
        $skip:
          facultySkip,
      },

      {
        $limit:
          facultyLimit,
      },

    ]),


    // ========================================================
    // TOTAL STUDENT RECORDS
    // ========================================================

    Student.countDocuments({
      departmentId:
        departmentObjectId,

      isDeleted: false,
    }),


    // ========================================================
    // TOTAL FACULTY RECORDS
    // ========================================================

    TeachingFaculty.countDocuments({
      department:
        departmentObjectId,

      isDeleted: false,
    }),

  ]);


  // ==========================================================
  // FACULTY STATISTICS FORMAT
  // ==========================================================

  const facultyStatistics =
    facultyCounts.length > 0
      ? facultyCounts[0]
      : {
          totalFaculty: 0,
          maleFaculty: 0,
          femaleFaculty: 0,
          otherFaculty: 0,
        };


  // ==========================================================
  // FINAL RESPONSE
  // ==========================================================

  return {

    // ========================================================
    // DEPARTMENT
    // ========================================================

    department,


    // ========================================================
    // OVERALL STATISTICS
    // ========================================================

    statistics: {

      totalStudents,

      maleStudents,

      femaleStudents,

      otherStudents,

      ugStudents,

      pgStudents,

      totalFaculty:
        facultyStatistics.totalFaculty || 0,

      maleFaculty:
        facultyStatistics.maleFaculty || 0,

      femaleFaculty:
        facultyStatistics.femaleFaculty || 0,

      otherFaculty:
        facultyStatistics.otherFaculty || 0,

      totalProgrammes:
        programmes.length,

      totalClasses:
        classes.length,

    },


    // ========================================================
    // FACULTY
    // ========================================================

    faculty: {

      faculties,

      totalRecords:
        totalFacultyRecords,

      currentPage:
        facultyPage,

      totalPages:
        Math.ceil(
          totalFacultyRecords /
          facultyLimit
        ),

      limit:
        facultyLimit,

    },


    // ========================================================
    // STUDENTS
    // ========================================================

    students: {

      students,

      totalRecords:
        totalStudentRecords,

      currentPage:
        studentPage,

      totalPages:
        Math.ceil(
          totalStudentRecords /
          studentLimit
        ),

      limit:
        studentLimit,

      statistics: {

        totalStudents,

        maleStudents,

        femaleStudents,

        otherStudents,

        ugStudents,

        pgStudents,

      },

    },


    // ========================================================
    // PROGRAMMES
    // ========================================================

    programmes,


    // ========================================================
    // CLASSES
    // ========================================================

    classes,

  };
};








// new updateee
// post department
export const createDepartmentService = async (
  departmentData
) => {
  const {
    departmentName,
    institution,
    hod,
  } = departmentData;

  // Check Duplicate Department

  const existingDepartment =
    await Department.findOne({
      institution,
      departmentName,
      isDeleted: false,
    });

  if (existingDepartment) {
    throw new Error(
      "Department already exists."
    );
  }

  // Validate Institution

  const existingInstitution =
    await Institution.findOne({
      _id: institution,
      isDeleted: false,
    });

  if (!existingInstitution) {
    throw new Error(
      "Institution not found."
    );
  }

  // Create Department

  const department =
    await Department.create({
      departmentName,
      institution,
      hod,
    });

  // Push Department into Institution

  await Institution.findByIdAndUpdate(
    institution,
    {
      $push: {
        departments: department._id,
      },
    }
  );

  return department;
};
// get all department
export const getAllDepartmentsService = async () => {
  const departments =  await Department.find({
    isDeleted: false,
  })
    .populate(
      "institution",
      "institutionName institutionCode"
    )
    .populate(
      "hod",
      "fullName email role"
    );

  return departments;
};
// get single department
export const getDepartmentByIdService = async (
  departmentId
) => {
  const department = await Department.findOne({
  _id: departmentId,
  isDeleted: false,
})
    .populate(
      "institution",
      "institutionName institutionCode"
    )
    .populate(
      "hod",
      "fullName email role"
    );

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};
// update departent function 
export const updateDepartmentService = async (
  departmentId,
  updateData
) => {
  // Find the existing department
const existingDepartment =
  await Department.findOne({
    _id: departmentId,
    isDeleted: false,
  });
  if (!existingDepartment) {
    throw new Error("Department not found");
  }
  if (
  updateData.departmentName
) {

  const duplicate =
    await Department.findOne({

      institution:
        updateData.institution ??
        existingDepartment.institution,

      departmentName:
        updateData.departmentName,

      _id: {
        $ne: departmentId,
      },

      isDeleted: false,
    });

  if (duplicate) {
    throw new Error(
      "Department already exists."
    );
  }
}

  // Check if institution is being changed
  if (
    updateData.institution &&
    updateData.institution.toString() !==
      existingDepartment.institution.toString()
  ) {
    // Remove department from old institution
    await Institution.findByIdAndUpdate(
      existingDepartment.institution,
      {
        $pull: {
          departments: existingDepartment._id,
        },
      }
    );

    // Add department to new institution
    await Institution.findByIdAndUpdate(
      updateData.institution,
      {
        $push: {
          departments: existingDepartment._id,
        },
      }
    );
  }

  // Update department

  const updatedDepartment =
    await Department.findByIdAndUpdate(
      departmentId,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate(
        "institution",
        "institutionName institutionCode"
      )
      .populate(
        "hod",
        "fullName email role"
      );

  return updatedDepartment;
};
// delete department 
export const deleteDepartmentService = async (
  departmentId
) => {
  // Find the department first
const department =
  await Department.findOne({
    _id: departmentId,
    isDeleted: false,
  });

if (!department) {
  throw new Error(
    "Department not found"
  );
}

const deletedDepartment =
  await Department.findByIdAndUpdate(
    departmentId,
    {
      isDeleted: true,
      deletedAt:
        new Date(),
    },
    {
      returnDocument:
        "after",
    }
  );

return deletedDepartment;
};
//  get dpt info with jwt
export const getMyDepartmentService =
  async (departmentId) => {

    console.log(
      "Searching for Department ID:",
      departmentId
    );

    const department =
      await Department.findOne({
        _id: departmentId,
        isDeleted: false,
      })
        .populate(
          "institution",
          "institutionName institutionCode"
        )
        .populate(
          "hod",
          "fullName email role"
        )
        .populate(
          "programmes",
          "programmeName programmeCode programmeType duration"
        );

    console.log(
      "Department Result:",
      department
    );

    if (!department) {
      throw new Error(
        "Department not found"
      );
    }

    return department;
};
// get the deleted department
export const getDeletedDepartmentsService =
  async () => {

    return await Department.find({
      isDeleted: true,
    })
      .populate(
        "institution",
        "institutionName institutionCode"
      )
      .populate(
        "hod",
        "fullName email role"
      );
};
// restore the deleted department
export const restoreDepartmentService =
  async (
    departmentId
  ) => {

    const department =
      await Department.findOne({
        _id:
          departmentId,

        isDeleted:
          true,
      });

    if (!department) {
      throw new Error(
        "Department not found."
      );
    }

    return await Department.findByIdAndUpdate(
      departmentId,
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        returnDocument:
          "after",
      }
    );
};
// delete from the db
export const permanentDeleteDepartmentService =
  async (
    departmentId
  ) => {

    const department =
      await Department.findById(
        departmentId
      );

    if (!department) {
      throw new Error(
        "Department not found."
      );
    }

    await Institution.findByIdAndUpdate(
      department.institution,
      {
        $pull: {
          departments:
            department._id,
        },
      }
    );

    return await Department.findByIdAndDelete(
      departmentId
    );
};