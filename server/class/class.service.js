import Class from "./class.model.js";
import Batch from "../batch/batch.model.js";
import mongoose from "mongoose";
import Institution from "../institution/institution.model.js";
import Department from "../department/department.model.js";
import Programme from "../programme/programme.model.js";

import TeachingFaculty from "../user/models/teachingFaculty.model.js";
import Student from "../student/student.model.js"


// create classes function 
export const createClassService = async (
  classData
) => {
const {
    institution,
    department,
    programme,
    batchId,
    section,
    classIncharge,
    subjects,
} = classData;

  // Check Institution
  const existingInstitution =
    await Institution.findById(
      institution
    );

  if (!existingInstitution) {
    throw new Error(
      "Institution not found"
    );
  }

  // Check Department
  const existingDepartment =
    await Department.findById(
      department
    );

  if (!existingDepartment) {
    throw new Error(
      "Department not found"
    );
  }

  // Check Programme
  const existingProgramme =
    await Programme.findById(
      programme
    );

  if (!existingProgramme) {
    throw new Error(
      "Programme not found"
    );
  }

  // Check Batch

const existingBatch =
  await Batch.findOne({
    _id: batchId,
    isDeleted: false,
  });

if (!existingBatch) {

  throw new Error(
    "Batch not found"
  );

}

  // Prevent duplicate class
const duplicateClass =
  await Class.findOne({
    institution,
    department,
    programme,
    batchId,
    section,

    isDeleted: false,
  });

  if (duplicateClass) {
    throw new Error(
      "Class already exists"
    );
  }

  // Create Class
 const newClass =
  await Class.create({

    institution,
    department,
    programme,
    batchId,
    section,
    classIncharge,
    subjects,

  });

  return newClass;
};
// get all classes 
// ==================== GET ALL ACTIVE CLASSES ====================
export const getAllClassesService = async () => {

  const classes = await Class.find({
    isDeleted: false,
    isActive: true,
  })
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
      "programmeName programmeCode"
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

  return classes;
};


// get my instituion class 
// get classes for logged-in institution
// ==================== GET MY INSTITUTION CLASSES ====================
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
    isActive: true,
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
// get single class by id 
// ==================== GET SINGLE CLASS ====================

export const getSingleClassService = async (classId) => {
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    throw new Error("Invalid class ID.");
  }

  // Fetch class
  const classData = await Class.findOne({
    _id: classId,
    isDeleted: false,
  })
    .populate(
      "institution",
      "institutionName institutionCode"
    )
    .populate(
      "department",
      "departmentName departmentCode"
    )
    .populate(
      "programme",
      "programmeName programmeCode programmeType"
    )
    .populate(
      "batchId",
      "batchName currentYear startYear endYear"
    )
    .populate(
      "classIncharge",
      "fullName email role"
    );

  if (!classData) {
    throw new Error("Class not found.");
  }

  // Fetch students assigned to this class
  const students = await Student.find({
    classId,
    isDeleted: false,
  })
    .select(`
      registerNumber
      studentName
      gender
      studentMobile
      studentEmail
      classId
      batchId
      programmeId
      departmentId
    `)
    .sort({
      studentName: 1,
    });

  return {
    class: classData,
    studentCount: students.length,
    students,
  };
};

// update classes function
// ==================== UPDATE CLASS ====================
export const updateClassService = async (
  classId,
  updateData
) => {

  // -------------------------
  // Validate Class ID
  // -------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // -------------------------
  // Check Class Exists
  // -------------------------

  const existingClass =
    await Class.findOne({
      _id: classId,
      isDeleted: false,
    });

  if (!existingClass) {
    throw new Error(
      "Class not found."
    );
  }


  // -------------------------
  // Validate Status
  // -------------------------

  if (
    updateData.isActive !== undefined &&
    typeof updateData.isActive !== "boolean"
  ) {
    throw new Error(
      "isActive must be true or false."
    );
  }


  // -------------------------
  // Prevent Deactivation
  // When Students Still Exist
  // -------------------------

  if (
    updateData.isActive === false &&
    existingClass.isActive === true
  ) {

    const studentCount =
      await Student.countDocuments({
        classId: existingClass._id,
        isDeleted: false,
      });

    if (studentCount > 0) {
      throw new Error(
        `Cannot deactivate this class because ${studentCount} student(s) are still assigned to it.`
      );
    }
  }


  // -------------------------
  // Check Whether Academic
  // Identity Is Being Changed
  // -------------------------

  const identityFields = [
    "institution",
    "department",
    "programme",
    "batchId",
    "section",
  ];

  const identityChanged =
    identityFields.some(
      (field) =>
        updateData[field] !== undefined
    );


  // -------------------------
  // Prevent Duplicate Class
  // Only When Identity Changes
  // -------------------------

  if (identityChanged) {

    const duplicateClass =
      await Class.findOne({

        institution:
          updateData.institution ??
          existingClass.institution,

        department:
          updateData.department ??
          existingClass.department,

        programme:
          updateData.programme ??
          existingClass.programme,

        batchId:
          updateData.batchId ??
          existingClass.batchId,

        section:
          updateData.section ??
          existingClass.section,

        _id: {
          $ne: classId,
        },

        isDeleted: false,
      });

    if (duplicateClass) {
      throw new Error(
        "Class already exists."
      );
    }
  }


  // -------------------------
  // Update Class
  // -------------------------

  const updatedClass =
    await Class.findByIdAndUpdate(
      classId,
      {
        $set: updateData,
      },
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
        "department",
        "departmentName"
      )
      .populate(
        "programme",
        "programmeName programmeCode"
      )
      .populate(
        "batchId",
        "batchName currentYear"
      )
      .populate(
        "classIncharge",
        "fullName email role"
      );


  // -------------------------
  // Return
  // -------------------------

  return updatedClass;
};
// delete classes function
export const deleteClassService = async (
  classId
) => {

  // -------------------------
  // Validate Class
  // -------------------------

  const existingClass =
    await Class.findOne({

      _id: classId,

      isDeleted: false,

    });

  if (!existingClass) {

    throw new Error(
      "Class not found."
    );

  }

  // -------------------------
  // Prevent Delete
  // When Students Exist
  // -------------------------

  const studentCount =
    await Student.countDocuments({

      classId,

      isDeleted: false,

    });

  if (studentCount > 0) {

    throw new Error(
      `Cannot delete this class because ${studentCount} student(s) are still assigned to it.`
    );

  }

  // -------------------------
  // Soft Delete
  // -------------------------

  const deletedClass =
    await Class.findByIdAndUpdate(

      classId,

      {

        isDeleted: true,

        deletedAt: new Date(),

      },

      {

        returnDocument: "after",

      }

    );

  return deletedClass;

};
// get classess by department 
// ==================== GET CLASSES BY DEPARTMENT ====================
export const getClassesByDepartmentService = async (departmentId) => {

  const [classes, totalStudents] = await Promise.all([

    Class.find({
      department: departmentId,
      isDeleted: false,
      isActive: true,
    })
      .populate(
        "programme",
        "programmeName programmeCode"
      )
      .populate(
        "department",
        "departmentName departmentCode"
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
      })
      .lean(),

    Student.countDocuments({
      departmentId: departmentId,
      isDeleted: false,
    }),

  ]);

  return {
    classes,

    stats: {
      totalClasses: classes.length,
      totalStudents,
    },
  };
};

// get my classes 
// ==================== GET MY CLASSES ====================
export const getMyClassesService = async (
  departmentId
) => {

  const classes = await Class.find({
    department: departmentId,
    isDeleted: false,
    isActive: true,
  })
    .populate(
      "programme",
      "programmeName programmeCode"
    )
    .populate(
      "department",
      "departmentName"
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

  return classes;
};


// fetch all deleted class
export const getDeletedClassesService =
  async () => {

    const classes =
      await Class.find({
        isDeleted: true,
      })
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
          "programmeName programmeCode"
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
          deletedAt: -1,
        });

    return classes;
  };

  // restore class  function 
  export const restoreClassService =
  async (classId) => {

    const existingClass =
      await Class.findOne({

        _id: classId,

        isDeleted: true,

      });

    if (!existingClass) {

      throw new Error(
        "Deleted class not found."
      );

    }

    const restoredClass =
      await Class.findByIdAndUpdate(
        classId,
        {
          isDeleted: false,

          deletedAt: null,
        },
        {
          returnDocument:
            "after",
        }
      );

    return restoredClass;
  };


//  delete from db 
export const permanentDeleteClassService =
  async (classId) => {

    const existingClass =
      await Class.findById(
        classId
      );

    if (!existingClass) {

      throw new Error(
        "Class not found."
      );

    }

    if (
      !existingClass.isDeleted
    ) {

      throw new Error(
        "Please move the class to the recycle bin before permanently deleting it."
      );

    }

    await Class.findByIdAndDelete(
      classId
    );

    return;
  };





export const assignClassInchargeService = async (
  classId,
  facultyUserId,
  institutionId
) => {

  // ==================================
  // FIND CLASS
  // ==================================

const classData =
  await Class.findOne({
    _id: classId,
    isDeleted: false,
  });

if (!classData) {
  throw new Error(
    "Class not found."
  );
}

console.log("CLASS ID:", classId);
console.log("CLASS INSTITUTION:", classData.institution);
console.log("REQUEST INSTITUTION:", institutionId);

if (
  !classData.institution
) {
  throw new Error(
    "Class institution is missing."
  );
}

if (
  !institutionId
) {
  throw new Error(
    "Logged-in user institution is missing."
  );
}

if (
  classData.institution.toString() !==
  institutionId.toString()
) {
  throw new Error(
    "You cannot assign an incharge to a class from another institution."
  );
}


  // ==================================
  // REMOVE CLASS INCHARGE
  // ==================================

  if (!facultyUserId) {

    classData.classIncharge = null;

    await classData.save();

    return classData;
  }


  // ==================================
  // FIND TEACHING FACULTY
  // ==================================

  const faculty =
    await TeachingFaculty.findOne({
      userId: facultyUserId,
      department: classData.department,
      isDeleted: false,
    }).populate({
      path: "userId",
      select:
        "fullName email phone role status institution isDeleted",
    });


  if (!faculty) {

    throw new Error(
      "Faculty does not belong to this class department."
    );

  }


  // ==================================
  // CHECK USER ACCOUNT
  // ==================================

  if (!faculty.userId) {

    throw new Error(
      "Faculty user account not found."
    );

  }


  // ==================================
  // CHECK ROLE
  // ==================================

  if (
    faculty.userId.role !==
    "teaching_faculty"
  ) {

    throw new Error(
      "Selected user is not teaching faculty."
    );

  }


  // ==================================
  // CHECK STATUS
  // ==================================

  if (
    faculty.userId.status !==
    "active"
  ) {

    throw new Error(
      "Selected faculty is not active."
    );

  }


  // ==================================
  // CHECK DELETED
  // ==================================

  if (
    faculty.userId.isDeleted
  ) {

    throw new Error(
      "Selected faculty has been deleted."
    );

  }


  // ==================================
  // CHECK INSTITUTION
  // ==================================

  if (
    faculty.userId.institution.toString() !==
    institutionId.toString()
  ) {

    throw new Error(
      "Faculty does not belong to this institution."
    );

  }


  // ==================================
  // ASSIGN CLASS INCHARGE
  // ==================================

  classData.classIncharge =
    facultyUserId;


  await classData.save();


  // ==================================
  // RETURN UPDATED CLASS
  // ==================================

  return Class.findById(
    classId
  )

    .populate(
      "classIncharge",
      "fullName email phone role status"
    )

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
      "programmeName programmeCode"
    )

    .populate(
      "batchId",
      "batchName startYear endYear"
    );

};




// =====================================================
// GET MY CLASS
// =====================================================

export const getMyClassService = async (user) => {

  // ===================================================
  // VALIDATE USER
  // ===================================================

  if (!user?.userId) {
    throw new Error("User information not found.");
  }


  // ===================================================
  // VALIDATE USER ID
  // ===================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      user.userId
    )
  ) {

    throw new Error(
      "Invalid user ID."
    );

  }


  // ===================================================
  // FIND CLASS IN WHICH USER IS CLASS INCHARGE
  // ===================================================

  const classData =
    await Class.findOne({

      classIncharge:
        user.userId,

      institution:
        user.institution,

      department:
        user.department,

      isDeleted:
        false,

      isActive:
        true,

    })

      // ===============================================
      // PROGRAMME
      // ===============================================

      .populate(
        "programme",
        "programmeName programmeCode programmeType duration"
      )

      // ===============================================
      // BATCH
      // ===============================================

      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )

      // ===============================================
      // DEPARTMENT
      // ===============================================

      .populate(
        "department",
        "departmentName"
      )

      // ===============================================
      // INSTITUTION
      // ===============================================

      .populate(
        "institution",
        "institutionName institutionCode"
      )

      // ===============================================
      // CLASS INCHARGE
      // ===============================================

      .populate(
        "classIncharge",
        "fullName email phone profileImage role"
      );


  // ===================================================
  // CLASS NOT FOUND
  // ===================================================

  if (!classData) {

    throw new Error(
      "No class is assigned to you as class incharge."
    );

  }


  // ===================================================
  // FETCH STUDENTS
  // ===================================================

  const students =
    await Student.find({

      classId:
        classData._id,

      institutionId:
        user.institution,

      departmentId:
        user.department,

      isDeleted:
        false,

      admissionStatus: {
        $in: [
          "Admitted",
          "Selected",
        ],
      },

    })

      .select(
        [
          "_id",
          "studentName",
          "registerNumber",
          "applicationNumber",
          "profilePhoto",
          "dateOfBirth",
          "gender",
          "studentType",
          "academicYear",
          "batchId",
          "programmeId",
          "classId",
          "studentMobile",
          "studentEmail",
          "admissionStatus",
        ].join(" ")
      )

      .sort({
        studentName: 1,
      });


  // ===================================================
  // RETURN
  // ===================================================

  return {

    class: classData,

    studentCount:
      students.length,

    students,

  };

};