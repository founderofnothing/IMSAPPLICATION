import mongoose from "mongoose";
import InternalMark from "./InternalMark.model.js";
import Class from "../../../class/class.model.js";
import Student from "../../../student/student.model.js";
import Subject from "../../../subject/subject.model.js";
import ProgrammeStructure from "../../../subject/ProgrammeStructureSchema/programmeStructureSchema.model.js";
import ExamTitle from "../../../exams/model/examTitle.model.js";


// ======================================================
// HELPER
// GET CURRENT SEMESTER CONTEXT FOR A CLASS
// ======================================================

const getClassAcademicContext = async (
  classId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID"
    );
  }


  // =========================
  // FIND CLASS
  // =========================

  const classData =
    await Class.findOne({
      _id: classId,
      isActive: true,
      isDeleted: false,
    })
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
        "batchName admissionYear graduationYear currentYear status"
      );


  if (!classData) {
    throw new Error(
      "Class not found"
    );
  }


  if (!classData.programme) {
    throw new Error(
      "Programme is not assigned to this class"
    );
  }


  if (!classData.batchId) {
    throw new Error(
      "Batch is not assigned to this class"
    );
  }


  // =========================
  // PROGRAMME STRUCTURE
  // =========================

  const programmeStructure =
    await ProgrammeStructure.findOne({
      programmeId:
        classData.programme._id,

      isActive: true,

      isDeleted: false,
    });


  if (!programmeStructure) {
    throw new Error(
      "Programme structure not found"
    );
  }


  // =========================
  // ACTIVE SEMESTER
  // FOR THIS BATCH
  // =========================

  const activeSemester =
    programmeStructure.activeSemesters.find(
      (item) =>
        item.batchId.toString() ===
        classData.batchId._id.toString()
    );


  if (!activeSemester) {
    throw new Error(
      "Current semester is not configured for this batch"
    );
  }


  const studyYear =
    Number(
      classData.batchId.currentYear
    );


  const semesterNumber =
    Number(
      activeSemester.semesterNumber
    );


  if (
    !Number.isInteger(
      studyYear
    ) ||
    studyYear < 1
  ) {
    throw new Error(
      "Current study year is not configured for this batch"
    );
  }


  if (
    !Number.isInteger(
      semesterNumber
    ) ||
    semesterNumber < 1
  ) {
    throw new Error(
      "Current semester is not configured"
    );
  }


  // =========================
  // VERIFY YEAR STRUCTURE
  // =========================

  const yearStructure =
    programmeStructure.structure.find(
      (year) =>
        Number(
          year.studyYear
        ) === studyYear
    );


  if (!yearStructure) {
    throw new Error(
      `Study Year ${studyYear} not found in programme structure`
    );
  }


  const semesterExists =
    yearStructure.semesters.some(
      (semester) =>
        Number(
          semester.semesterNumber
        ) === semesterNumber
    );


  if (!semesterExists) {
    throw new Error(
      `Semester ${semesterNumber} does not belong to Study Year ${studyYear}`
    );
  }


  return {
    classData,
    programmeStructure,
    studyYear,
    semesterNumber,
  };
};


// ======================================================
// 1. GET MY CLASS
// ======================================================

export const getMyClassService =
  async (
    user
  ) => {

    if (!user) {
      throw new Error(
        "Authentication information not found"
      );
    }


    if (!user.institution) {
      throw new Error(
        "Institution not found in authentication token"
      );
    }


    if (!user.userId) {
      throw new Error(
        "User ID not found in authentication token"
      );
    }


    const classData =
      await Class.findOne({

        institution:
          user.institution,

        classIncharge:
          user.userId,

        isActive: true,

        isDeleted: false,

      })
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
          "batchName admissionYear graduationYear currentYear status"
        );


    if (!classData) {
      throw new Error(
        "No active class is assigned to this class incharge"
      );
    }


    return classData;
  };


// ======================================================
// 2. GET CLASS INTERNAL MARK CONTEXT
// ======================================================

export const getClassInternalMarkContextService =
  async (
    classId,
    institutionId
  ) => {

    if (!institutionId) {
      throw new Error(
        "Institution ID is required"
      );
    }


    const {
      classData,
      studyYear,
      semesterNumber,
    } =
      await getClassAcademicContext(
        classId
      );


    // =========================
    // INSTITUTION SECURITY
    // =========================

    if (
      classData.institution.toString() !==
      institutionId.toString()
    ) {
      throw new Error(
        "This class does not belong to your institution"
      );
    }


    // =========================
    // GET STUDENTS
    // =========================

    const students =
      await Student.find({

        classId:
          classData._id,

        institutionId:
          institutionId,

        isDeleted: false,

      })
        .select(
          "_id registerNumber studentName applicationNumber"
        )
        .sort({
          registerNumber: 1,
        });


    // =========================
    // GET CURRENT SUBJECTS
    // =========================

    const subjects =
      await Subject.find({

        institutionId,

        programmeId:
          classData.programme._id,

        studyYear,

        semesterNumber,

        isDeleted: false,

        isActive: true,

      })
        .select(
          "_id subjectName subjectCode subjectType subjectScore"
        )
        .sort({
          subjectCode: 1,
        });


    return {

      classId:
        classData._id,

      department:
        classData.department,

      programme:
        classData.programme,

      batch:
        classData.batchId,

      studyYear,

      currentSemester:
        semesterNumber,

      students,

      subjects,

    };
  };


// ======================================================
// 3. CREATE INTERNAL MARK SHEET
// ======================================================

export const createInternalMarkService =
  async (
    markData,
    user
  ) => {

    const {
      examTitleId,
      classId,
      marks = [],
    } = markData;


    if (!examTitleId) {
      throw new Error(
        "Exam title is required"
      );
    }


    if (!classId) {
      throw new Error(
        "Class ID is required"
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        examTitleId
      )
    ) {
      throw new Error(
        "Invalid exam title ID"
      );
    }


    // =========================
    // CLASS CONTEXT
    // =========================

    const {
      classData,
      studyYear,
      semesterNumber,
    } =
      await getClassAcademicContext(
        classId
      );


    // =========================
    // INSTITUTION SECURITY
    // =========================

    if (
      classData.institution.toString() !==
      user.institution.toString()
    ) {
      throw new Error(
        "This class does not belong to your institution"
      );
    }


    // =========================
    // CLASS INCHARGE SECURITY
    // =========================

    if (
      !classData.classIncharge ||
      classData.classIncharge.toString() !==
        user.userId.toString()
    ) {
      throw new Error(
        "You are not the class incharge of this class"
      );
    }


    // =========================
    // EXAM TITLE
    // =========================

    const examTitle =
      await ExamTitle.findOne({

        _id:
          examTitleId,

        institutionId:
          classData.institution,

        isDeleted:
          false,

      });


    if (!examTitle) {
      throw new Error(
        "Exam title not found for this institution"
      );
    }


    // =========================
    // DUPLICATE MARK SHEET
    // =========================

    const existing =
      await InternalMark.findOne({

        classId,

        examTitleId,

        isDeleted: false,

      });


    if (existing) {
      throw new Error(
        "Internal mark sheet already exists for this class and exam title"
      );
    }


    // =========================
    // GET VALID STUDENTS
    // =========================

    const students =
      await Student.find({

        classId,

        institutionId:
          classData.institution,

        isDeleted: false,

      }).select("_id");


    const validStudentIds =
      new Set(
        students.map(
          (student) =>
            student._id.toString()
        )
      );


    // =========================
    // GET VALID SUBJECTS
    // =========================

    const subjects =
      await Subject.find({

        institutionId:
          classData.institution,

        programmeId:
          classData.programme._id,

        studyYear,

        semesterNumber,

        isDeleted: false,

        isActive: true,

      }).select(
        "_id subjectScore"
      );


    const subjectMap =
      new Map(
        subjects.map(
          (subject) => [
            subject._id.toString(),
            subject,
          ]
        )
      );


    // =========================
    // VALIDATE MARK DATA
    // =========================

    const normalizedMarks = [];


    for (
      const studentEntry
      of marks
    ) {

      if (
        !studentEntry.studentId
      ) {
        throw new Error(
          "Student ID is required"
        );
      }


      const studentId =
        studentEntry.studentId.toString();


      if (
        !validStudentIds.has(
          studentId
        )
      ) {
        throw new Error(
          "One or more students do not belong to this class"
        );
      }


      const normalizedSubjects = [];


      for (
        const subjectEntry
        of (
          studentEntry.subjects ||
          []
        )
      ) {

        const subjectId =
          subjectEntry.subjectId?.toString();


        if (!subjectId) {
          throw new Error(
            "Subject ID is required"
          );
        }


        const subject =
          subjectMap.get(
            subjectId
          );


        if (!subject) {
          throw new Error(
            "One or more subjects do not belong to the current semester of this class"
          );
        }


        const status =
          subjectEntry.status ||
          "NOT_ENTERED";


        if (
          ![
            "PRESENT",
            "ABSENT",
            "NOT_ENTERED",
          ].includes(status)
        ) {
          throw new Error(
            "Invalid internal mark status"
          );
        }


        let mark =
          subjectEntry.mark;


        if (
          status === "ABSENT"
        ) {
          mark = null;
        }


        if (
          status === "PRESENT"
        ) {

          if (
            mark === null ||
            mark === undefined ||
            mark === ""
          ) {
            throw new Error(
              "Mark is required for present students"
            );
          }


          mark =
            Number(mark);


          if (
            Number.isNaN(mark)
          ) {
            throw new Error(
              "Mark must be a valid number"
            );
          }


          if (
            mark < 0 ||
            mark > subject.subjectScore
          ) {
            throw new Error(
              `Mark must be between 0 and ${subject.subjectScore}`
            );
          }
        }


        normalizedSubjects.push({

          subjectId,

          mark,

          status,

        });
      }


      normalizedMarks.push({

        studentId,

        subjects:
          normalizedSubjects,

      });
    }


    // =========================
    // CREATE
    // =========================

    const internalMark =
      await InternalMark.create({

        institutionId:
          classData.institution,

        departmentId:
          classData.department._id,

        programmeId:
          classData.programme._id,

        classId,

        batchId:
          classData.batchId._id,

        examTitleId,

        studyYear,

        semesterNumber,

        marks:
          normalizedMarks,

        status:
          "DRAFT",

        createdBy:
          user.userId,

      });


    return internalMark;
  };


// ======================================================
// 4. GET EXISTING INTERNAL MARK SHEET
// ======================================================

export const getInternalMarkService =
  async (
    classId,
    examTitleId,
    user
  ) => {

    if (!user) {
      throw new Error(
        "Authentication information not found"
      );
    }


    if (!user.institution) {
      throw new Error(
        "Institution not found in authentication token"
      );
    }


    if (!user.userId) {
      throw new Error(
        "User ID not found in authentication token"
      );
    }


    // =========================
    // CLASS SECURITY
    // =========================

    const classData =
      await Class.findOne({

        _id:
          classId,

        institution:
          user.institution,

        isActive:
          true,

        isDeleted:
          false,

      });


    if (!classData) {
      throw new Error(
        "Class not found"
      );
    }


    if (
      !classData.classIncharge ||
      classData.classIncharge.toString() !==
        user.userId.toString()
    ) {
      throw new Error(
        "You are not the class incharge of this class"
      );
    }


    // =========================
    // FIND MARK SHEET
    // =========================

    const internalMark =
      await InternalMark.findOne({

        classId,

        examTitleId,

        institutionId:
          user.institution,

        isDeleted: false,

      })
        .populate(
          "classId",
          "section"
        )
        .populate(
          "batchId",
          "batchName admissionYear graduationYear currentYear"
        )
        .populate(
          "programmeId",
          "programmeName programmeCode programmeType"
        )
        .populate(
          "examTitleId",
          "title"
        )
        .populate(
          "marks.studentId",
          "registerNumber studentName"
        )
        .populate(
          "marks.subjects.subjectId",
          "subjectName subjectCode subjectType subjectScore"
        );


    if (!internalMark) {
      throw new Error(
        "Internal mark sheet not found"
      );
    }


    return internalMark;
  };


// ======================================================
// 5. UPDATE INTERNAL MARK SHEET
// ======================================================

export const updateInternalMarkService =
  async (
    internalMarkId,
    markData,
    user
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        internalMarkId
      )
    ) {
      throw new Error(
        "Invalid internal mark ID"
      );
    }


    if (!user) {
      throw new Error(
        "Authentication information not found"
      );
    }


    // =========================
    // FIND MARK SHEET
    // =========================

    const internalMark =
      await InternalMark.findOne({

        _id:
          internalMarkId,

        institutionId:
          user.institution,

        isDeleted:
          false,

      });


    if (!internalMark) {
      throw new Error(
        "Internal mark sheet not found"
      );
    }


    // =========================
    // CLASS SECURITY
    // =========================

    const {
      classData,
      studyYear,
      semesterNumber,
    } =
      await getClassAcademicContext(
        internalMark.classId
      );


    if (
      classData.institution.toString() !==
      user.institution.toString()
    ) {
      throw new Error(
        "This class does not belong to your institution"
      );
    }


    if (
      !classData.classIncharge ||
      classData.classIncharge.toString() !==
        user.userId.toString()
    ) {
      throw new Error(
        "You are not the class incharge of this class"
      );
    }


    // =========================
    // UPDATE MARKS
    // =========================

    if (
      Array.isArray(
        markData.marks
      )
    ) {

      const validStudents =
        await Student.find({

          classId:
            internalMark.classId,

          institutionId:
            internalMark.institutionId,

          isDeleted:
            false,

        }).select("_id");


      const validStudentIds =
        new Set(
          validStudents.map(
            (student) =>
              student._id.toString()
          )
        );


      const validSubjects =
        await Subject.find({

          institutionId:
            internalMark.institutionId,

          programmeId:
            internalMark.programmeId,

          studyYear,

          semesterNumber,

          isDeleted:
            false,

          isActive:
            true,

        }).select(
          "_id subjectScore"
        );


      const subjectMap =
        new Map(
          validSubjects.map(
            (subject) => [
              subject._id.toString(),
              subject,
            ]
          )
        );


      const normalizedMarks = [];


      for (
        const studentEntry
        of markData.marks
      ) {

        const studentId =
          studentEntry.studentId?.toString();


        if (
          !studentId ||
          !validStudentIds.has(
            studentId
          )
        ) {
          throw new Error(
            "Invalid student for this class"
          );
        }


        const normalizedSubjects = [];


        for (
          const subjectEntry
          of (
            studentEntry.subjects ||
            []
          )
        ) {

          const subjectId =
            subjectEntry.subjectId?.toString();


          if (!subjectId) {
            throw new Error(
              "Subject ID is required"
            );
          }


          const subject =
            subjectMap.get(
              subjectId
            );


          if (!subject) {
            throw new Error(
              "Invalid subject for the current semester"
            );
          }


          const status =
            subjectEntry.status ||
            "NOT_ENTERED";


          if (
            ![
              "PRESENT",
              "ABSENT",
              "NOT_ENTERED",
            ].includes(status)
          ) {
            throw new Error(
              "Invalid internal mark status"
            );
          }


          let mark =
            subjectEntry.mark;


          if (
            status === "ABSENT"
          ) {
            mark = null;
          }


          if (
            status === "PRESENT"
          ) {

            if (
              mark === null ||
              mark === undefined ||
              mark === ""
            ) {
              throw new Error(
                "Mark is required for present students"
              );
            }


            mark =
              Number(mark);


            if (
              Number.isNaN(mark)
            ) {
              throw new Error(
                "Mark must be a valid number"
              );
            }


            if (
              mark < 0 ||
              mark > subject.subjectScore
            ) {
              throw new Error(
                `Mark must be between 0 and ${subject.subjectScore}`
              );
            }
          }


          normalizedSubjects.push({

            subjectId,

            mark,

            status,

          });
        }


        normalizedMarks.push({

          studentId,

          subjects:
            normalizedSubjects,

        });
      }


      internalMark.marks =
        normalizedMarks;
    }


    // =========================
    // STATUS
    // =========================

    if (
      markData.status
    ) {

      if (
        ![
          "DRAFT",
          "COMPLETED",
        ].includes(
          markData.status
        )
      ) {
        throw new Error(
          "Invalid mark sheet status"
        );
      }


      internalMark.status =
        markData.status;
    }


    internalMark.updatedBy =
      user.userId;


    await internalMark.save();


    return internalMark;
  };


// ======================================================
// 6. DELETE INTERNAL MARK SHEET
// ======================================================

export const deleteInternalMarkService =
  async (
    internalMarkId,
    user
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        internalMarkId
      )
    ) {
      throw new Error(
        "Invalid internal mark ID"
      );
    }


    const internalMark =
      await InternalMark.findOne({

        _id:
          internalMarkId,

        institutionId:
          user.institution,

        isDeleted:
          false,

      });


    if (!internalMark) {
      throw new Error(
        "Internal mark sheet not found"
      );
    }


    // =========================
    // SECURITY
    // =========================

    const classData =
      await Class.findOne({

        _id:
          internalMark.classId,

        institution:
          user.institution,

        isActive:
          true,

        isDeleted:
          false,

      });


    if (!classData) {
      throw new Error(
        "Class not found"
      );
    }


    if (
      !classData.classIncharge ||
      classData.classIncharge.toString() !==
        user.userId.toString()
    ) {
      throw new Error(
        "You are not the class incharge of this class"
      );
    }


    // =========================
    // SOFT DELETE
    // =========================

    internalMark.isDeleted =
      true;

    internalMark.deletedAt =
      new Date();


    // Only keep this if your
    // InternalMark schema has isActive.

    if (
      typeof internalMark.isActive !==
      "undefined"
    ) {
      internalMark.isActive =
        false;
    }


    internalMark.updatedBy =
      user.userId;


    await internalMark.save();


    return internalMark;
  };


// ======================================================
// 7. RESTORE INTERNAL MARK SHEET
// ======================================================

export const restoreInternalMarkService =
  async (
    internalMarkId,
    user
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        internalMarkId
      )
    ) {
      throw new Error(
        "Invalid internal mark ID"
      );
    }


    const internalMark =
      await InternalMark.findOne({

        _id:
          internalMarkId,

        institutionId:
          user.institution,

        isDeleted:
          true,

      });


    if (!internalMark) {
      throw new Error(
        "Deleted internal mark sheet not found"
      );
    }


    // =========================
    // SECURITY
    // =========================

    const classData =
      await Class.findOne({

        _id:
          internalMark.classId,

        institution:
          user.institution,

        isActive:
          true,

        isDeleted:
          false,

      });


    if (!classData) {
      throw new Error(
        "Class not found"
      );
    }


    if (
      !classData.classIncharge ||
      classData.classIncharge.toString() !==
        user.userId.toString()
    ) {
      throw new Error(
        "You are not the class incharge of this class"
      );
    }


    // =========================
    // CHECK ACTIVE DUPLICATE
    // =========================

    const existing =
      await InternalMark.findOne({

        _id: {
          $ne:
            internalMarkId,
        },

        classId:
          internalMark.classId,

        examTitleId:
          internalMark.examTitleId,

        institutionId:
          user.institution,

        isDeleted:
          false,

      });


    if (existing) {
      throw new Error(
        "An active internal mark sheet already exists for this class and exam title"
      );
    }


    // =========================
    // RESTORE
    // =========================

    internalMark.isDeleted =
      false;

    internalMark.deletedAt =
      null;


    // Only keep this if your
    // InternalMark schema has isActive.

    if (
      typeof internalMark.isActive !==
      "undefined"
    ) {
      internalMark.isActive =
        true;
    }


    internalMark.updatedBy =
      user.userId;


    await internalMark.save();


    return internalMark;
  };

  // ======================================================
// 8. COMPLETE INTERNAL MARK SHEET
// ======================================================

export const completeInternalMarkSheetService =
  async (
    internalMarkId,
    user
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        internalMarkId
      )
    ) {
      throw new Error(
        "Invalid internal mark ID"
      );
    }

    if (!user) {
      throw new Error(
        "Authentication information not found"
      );
    }

    // =========================
    // FIND MARK SHEET
    // =========================

    const internalMark =
      await InternalMark.findOne({
        _id: internalMarkId,
        institutionId: user.institution,
        isDeleted: false,
      });

    if (!internalMark) {
      throw new Error(
        "Internal mark sheet not found"
      );
    }

    // =========================
    // CLASS SECURITY
    // =========================

    const classData =
      await Class.findOne({
        _id: internalMark.classId,
        institution: user.institution,
        isActive: true,
        isDeleted: false,
      });

    if (!classData) {
      throw new Error(
        "Class not found"
      );
    }

    if (
      !classData.classIncharge ||
      classData.classIncharge.toString() !==
        user.userId.toString()
    ) {
      throw new Error(
        "You are not the class incharge of this class"
      );
    }

    // =========================
    // MUST BE DRAFT
    // =========================

    if (
      internalMark.status ===
      "COMPLETED"
    ) {
      throw new Error(
        "Internal mark sheet is already completed"
      );
    }

    // =========================
    // GET CURRENT STUDENTS
    // =========================

    const students =
      await Student.find({
        classId: internalMark.classId,
        institutionId:
          internalMark.institutionId,
        isDeleted: false,
      }).select("_id");

    // =========================
    // GET CURRENT SUBJECTS
    // =========================

    const subjects =
      await Subject.find({
        institutionId:
          internalMark.institutionId,

        programmeId:
          internalMark.programmeId,

        studyYear:
          internalMark.studyYear,

        semesterNumber:
          internalMark.semesterNumber,

        isDeleted: false,
        isActive: true,
      }).select("_id");

    // =========================
    // VALIDATE STUDENTS
    // =========================

    const studentMarkMap =
      new Map(
        internalMark.marks.map(
          (entry) => [
            entry.studentId.toString(),
            entry,
          ]
        )
      );

    for (
      const student of students
    ) {

      const studentEntry =
        studentMarkMap.get(
          student._id.toString()
        );

      if (!studentEntry) {

        const error =
          new Error(
            "All students must have internal marks entered before completing the mark sheet"
          );

        error.code =
          "INCOMPLETE_MARKS";

        throw error;
      }

      // =========================
      // VALIDATE SUBJECTS
      // =========================

      const subjectMarkMap =
        new Map(
          studentEntry.subjects.map(
            (entry) => [
              entry.subjectId.toString(),
              entry,
            ]
          )
        );

      for (
        const subject of subjects
      ) {

        const subjectEntry =
          subjectMarkMap.get(
            subject._id.toString()
          );

        if (!subjectEntry) {

          const error =
            new Error(
              "All subjects must have a mark status entered before completing the mark sheet"
            );

          error.code =
            "INCOMPLETE_MARKS";

          throw error;
        }

        // =========================
        // NOT ENTERED NOT ALLOWED
        // =========================

        if (
          subjectEntry.status ===
          "NOT_ENTERED"
        ) {

          const error =
            new Error(
              "All subjects must be marked as PRESENT or ABSENT before completing the mark sheet"
            );

          error.code =
            "INCOMPLETE_MARKS";

          error.details = {
            studentId:
              student._id,
            subjectId:
              subject._id,
          };

          throw error;
        }

        // =========================
        // PRESENT MUST HAVE MARK
        // =========================

        if (
          subjectEntry.status ===
          "PRESENT" &&
          (
            subjectEntry.mark ===
              null ||
            subjectEntry.mark ===
              undefined
          )
        ) {

          const error =
            new Error(
              "Present students must have a mark before completing the mark sheet"
            );

          error.code =
            "INVALID_MARKS";

          error.details = {
            studentId:
              student._id,
            subjectId:
              subject._id,
          };

          throw error;
        }

        // =========================
        // ABSENT MUST NOT HAVE MARK
        // =========================

        if (
          subjectEntry.status ===
            "ABSENT" &&
          subjectEntry.mark !==
            null
        ) {

          subjectEntry.mark =
            null;
        }
      }
    }

    // =========================
    // COMPLETE
    // =========================

    internalMark.status =
      "COMPLETED";

    internalMark.updatedBy =
      user.userId;

    await internalMark.save();

    return internalMark;
  };