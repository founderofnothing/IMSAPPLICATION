import mongoose from "mongoose";

import Timetable from "./model/timetable.model.js";
import Class from "../class/class.model.js";
import Batch from "../batch/batch.model.js";
import Subject from "../subject/subject.model.js";
import User from "../user/models/user.model.js";
import ProgrammeStructure from "../subject/ProgrammeStructureSchema/programmeStructureSchema.model.js";

// ============================================================
// IMPORT TEACHING FACULTY
// ============================================================

import TeachingFaculty from "../user/models/teachingFaculty.model.js";
// =====================================================
// CREATE TIMETABLE
// =====================================================

export const createTimetableService = async (
  timetableData,
  user
) => {

  const {
    classId,
    periodConfiguration,
    timetable,
  } = timetableData;

  const institutionId = user.institution;
  const departmentId = user.department;


  // =====================================================
  // VALIDATE CLASS ID
  // =====================================================

  if (
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    throw new Error("Invalid class ID.");
  }


  // =====================================================
  // CHECK CLASS
  // =====================================================

  const classData =
    await Class.findOne({

      _id: classId,

      institution: institutionId,

      department: departmentId,

      isDeleted: false,

      isActive: true,

    });

  if (!classData) {
    throw new Error("Class not found.");
  }


  // =====================================================
  // CHECK BATCH
  // =====================================================

  if (!classData.batchId) {
    throw new Error(
      "Batch is not assigned to this class."
    );
  }


  const batch =
    await Batch.findOne({

      _id: classData.batchId,

      status: "Active",

      isDeleted: false,

    });

  if (!batch) {
    throw new Error(
      "Batch not found or inactive."
    );
  }


  // =====================================================
  // FIND PROGRAMME STRUCTURE
  // =====================================================

  const programmeStructure =
    await ProgrammeStructure.findOne({

      programmeId:
        classData.programme,

      isDeleted: false,

      isActive: true,

    });

  if (!programmeStructure) {
    throw new Error(
      "Programme structure not found."
    );
  }


  // =====================================================
  // FIND ACTIVE SEMESTER FOR THIS BATCH
  // =====================================================

  const activeSemester =
    programmeStructure.activeSemesters.find(

      (item) =>
        item.batchId.toString() ===
        classData.batchId.toString()

    );


  if (!activeSemester) {

    throw new Error(
      "Current semester is not configured for this batch."
    );

  }


  // =====================================================
  // CURRENT ACADEMIC INFORMATION
  // =====================================================

  const currentStudyYear =
    batch.currentYear;

  const currentSemester =
    activeSemester.semesterNumber;


  if (
    !currentStudyYear ||
    currentStudyYear < 1
  ) {

    throw new Error(
      "Current study year is not configured for this batch."
    );

  }


  // =====================================================
  // VALIDATE SEMESTER BELONGS TO STUDY YEAR
  // =====================================================

  const yearStructure =
    programmeStructure.structure.find(

      (year) =>
        year.studyYear ===
        currentStudyYear

    );


  if (!yearStructure) {

    throw new Error(
      `Study Year ${currentStudyYear} not found in programme structure.`
    );

  }


  const semesterExists =
    yearStructure.semesters.some(

      (semester) =>
        semester.semesterNumber ===
        currentSemester

    );


  if (!semesterExists) {

    throw new Error(
      `Semester ${currentSemester} does not belong to Study Year ${currentStudyYear}.`
    );

  }


  // =====================================================
  // VALIDATE PERIOD CONFIGURATION
  // =====================================================

  if (
    !periodConfiguration ||
    periodConfiguration.length === 0
  ) {

    throw new Error(
      "Please configure at least one period."
    );

  }


  if (
    periodConfiguration.length > 10
  ) {

    throw new Error(
      "Maximum 10 periods are allowed."
    );

  }


  // =====================================================
  // CHECK DUPLICATE PERIOD NUMBERS
  // =====================================================

  const usedPeriods = [];


  for (
    const period
    of periodConfiguration
  ) {

    if (
      usedPeriods.includes(
        period.periodNumber
      )
    ) {

      throw new Error(
        `Duplicate Period ${period.periodNumber} found.`
      );

    }


    usedPeriods.push(
      period.periodNumber
    );

  }


  // =====================================================
  // FETCH CURRENT SEMESTER SUBJECTS
  // =====================================================

  const activeSubjects =
    await Subject.find({

      programmeId:
        classData.programme,

      studyYear:
        currentStudyYear,

      semesterNumber:
        currentSemester,

      isDeleted: false,

      isActive: true,

    }).select("_id");


  // =====================================================
  // VALIDATE SUBJECT AVAILABILITY
  // =====================================================

  if (
    activeSubjects.length === 0
  ) {

    throw new Error(
      `No subjects are configured for Study Year ${currentStudyYear}, Semester ${currentSemester}.`
    );

  }


  // =====================================================
  // VALID SUBJECT IDS
  // =====================================================

  const validSubjectIds =
    activeSubjects.map(

      (subject) =>
        subject._id.toString()

    );


  // =====================================================
  // VALIDATE TIMETABLE
  // =====================================================

  for (
    const day
    of timetable
  ) {


    // =================================================
    // DAY ORDER
    // =================================================

    if (
      day.dayOrder > 6
    ) {

      throw new Error(
        "Maximum 6 day orders are allowed."
      );

    }


    const usedPeriodsInDay = [];


    for (
      const period
      of day.periods
    ) {


      // ===============================================
      // DUPLICATE PERIOD IN SAME DAY
      // ===============================================

      if (
        usedPeriodsInDay.includes(
          period.periodNumber
        )
      ) {

        throw new Error(
          `Duplicate Period ${period.periodNumber} found in Day ${day.dayOrder}.`
        );

      }


      usedPeriodsInDay.push(
        period.periodNumber
      );


      // ===============================================
      // FIND PERIOD CONFIGURATION
      // ===============================================

      const periodInfo =
        periodConfiguration.find(

          (item) =>
            item.periodNumber ===
            period.periodNumber

        );


      if (!periodInfo) {

        throw new Error(
          `Period ${period.periodNumber} is not configured.`
        );

      }


      // ===============================================
      // BREAK / LUNCH
      // ===============================================

      if (
        periodInfo.periodType !==
        "Teaching"
      ) {

        continue;

      }


      // ===============================================
      // TEACHING PERIOD MUST HAVE SUBJECT
      // ===============================================

      if (
        !period.subjectId
      ) {

        throw new Error(
          `Teaching Period ${period.periodNumber} requires a subject.`
        );

      }


      // ===============================================
      // TEACHING PERIOD MUST HAVE FACULTY
      // ===============================================

      if (
        !period.facultyId
      ) {

        throw new Error(
          `Teaching Period ${period.periodNumber} requires a faculty.`
        );

      }


      // ===============================================
      // VALIDATE SUBJECT ID
      // ===============================================

      if (
        !mongoose.Types.ObjectId.isValid(
          period.subjectId
        )
      ) {

        throw new Error(
          `Invalid subject ID in Period ${period.periodNumber}.`
        );

      }


      // ===============================================
      // SUBJECT MUST BELONG TO CURRENT SEMESTER
      // ===============================================

      if (
        !validSubjectIds.includes(
          period.subjectId.toString()
        )
      ) {

        throw new Error(
          "One or more subjects do not belong to the current batch semester."
        );

      }


      // ===============================================
      // VALIDATE FACULTY ID
      // ===============================================

      if (
        !mongoose.Types.ObjectId.isValid(
          period.facultyId
        )
      ) {

        throw new Error(
          `Invalid faculty ID in Period ${period.periodNumber}.`
        );

      }

    }

  }


  // =====================================================
  // FETCH ALL FACULTIES USED IN TIMETABLE
  // =====================================================

  const facultyIds = [];


  for (
    const day
    of timetable
  ) {

    for (
      const period
      of day.periods
    ) {

      const periodInfo =
        periodConfiguration.find(

          (item) =>
            item.periodNumber ===
            period.periodNumber

        );


      // Only Teaching periods require faculty
      if (
        !periodInfo ||
        periodInfo.periodType !==
        "Teaching"
      ) {

        continue;

      }


      if (
        !facultyIds.includes(
          period.facultyId.toString()
        )
      ) {

        facultyIds.push(
          period.facultyId.toString()
        );

      }

    }

  }


  // =====================================================
  // VALIDATE FACULTIES
  // =====================================================

  if (
    facultyIds.length > 0
  ) {

    const faculties =
      await User.find({

        _id: {
          $in: facultyIds,
        },

        institution:
          institutionId,

        department:
          departmentId,

        role:
          "teaching_faculty",

        status:
          "active",

        isDeleted:
          false,

      }).select(
        "_id fullName email role institution department status"
      );


    // ===================================================
    // CHECK ALL FACULTIES WERE FOUND
    // ===================================================

    if (
      faculties.length !==
      facultyIds.length
    ) {

      throw new Error(
        "One or more selected faculties are invalid, inactive, deleted, or do not belong to this department."
      );

    }

  }


  // =====================================================
  // PREVENT DUPLICATE TIMETABLE
  // =====================================================

  const existingTimetable =
    await Timetable.findOne({

      classId,

    });


  if (existingTimetable) {

    throw new Error(
      "Timetable already exists for this class."
    );

  }


  // =====================================================
  // CREATE TIMETABLE
  // =====================================================

  const createdTimetable =
    await Timetable.create({

      institutionId,

      departmentId,

      classId,

      currentSemester,

      periodConfiguration,

      timetable,

    });


  // =====================================================
  // RETURN
  // =====================================================

  return createdTimetable;

};



// =====================================================
// GET TIMETABLE BY CLASS
// =====================================================

export const getTimetableByClassService =
  async (classId) => {


    // =================================================
    // VALIDATE CLASS ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {

      throw new Error(
        "Invalid class ID."
      );

    }


    // =================================================
    // FETCH TIMETABLE
    // =================================================

    const timetable =
      await Timetable.findOne({

        classId,

      })

        .populate({

          path: "classId",

          select:
            "programme batchId section",

          populate: [

            {

              path: "programme",

              select:
                "programmeName programmeCode",

            },

            {

              path: "batchId",

              select:
                "batchName admissionYear graduationYear currentYear status",

            },

          ],

        })

        // =============================================
        // POPULATE SUBJECT
        // =============================================

        .populate(

          "timetable.periods.subjectId",

          "subjectName subjectCode subjectType"

        )

        // =============================================
        // POPULATE FACULTY
        // =============================================

        .populate(

          "timetable.periods.facultyId",

          "fullName email profileImage role department"

        );


    // =================================================
    // VALIDATE
    // =================================================

    if (!timetable) {

      throw new Error(
        "Timetable not found."
      );

    }


    // =================================================
    // SORT PERIOD CONFIGURATION
    // =================================================

    timetable.periodConfiguration.sort(

      (a, b) =>
        a.periodNumber -
        b.periodNumber

    );


    // =================================================
    // SORT DAY ORDERS
    // =================================================

    timetable.timetable.sort(

      (a, b) =>
        a.dayOrder -
        b.dayOrder

    );


    // =================================================
    // SORT PERIODS
    // =================================================

    timetable.timetable.forEach(

      (day) => {

        day.periods.sort(

          (a, b) =>
            a.periodNumber -
            b.periodNumber

        );

      }

    );


    // =================================================
    // RETURN
    // =================================================

    return timetable;

  };



// =====================================================
// UPDATE TIMETABLE
// =====================================================

export const updateTimetableService =
  async (
    timetableId,
    timetableData
  ) => {


    const {
      periodConfiguration,
      timetable,
    } = timetableData;


    // =================================================
    // VALIDATE TIMETABLE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        timetableId
      )
    ) {

      throw new Error(
        "Invalid timetable ID."
      );

    }


    // =================================================
    // FIND EXISTING TIMETABLE
    // =================================================

    const existingTimetable =
      await Timetable.findById(
        timetableId
      );


    if (!existingTimetable) {

      throw new Error(
        "Timetable not found."
      );

    }


    // =================================================
    // VALIDATE PERIOD CONFIGURATION
    // =================================================

    if (
      !periodConfiguration ||
      periodConfiguration.length === 0
    ) {

      throw new Error(
        "Please configure at least one period."
      );

    }


    if (
      periodConfiguration.length > 10
    ) {

      throw new Error(
        "Maximum 10 periods are allowed."
      );

    }


    // =================================================
    // CHECK DUPLICATE PERIOD NUMBERS
    // =================================================

    const usedPeriods = [];


    for (
      const period
      of periodConfiguration
    ) {

      if (
        usedPeriods.includes(
          period.periodNumber
        )
      ) {

        throw new Error(
          `Duplicate Period ${period.periodNumber} found.`
        );

      }


      usedPeriods.push(
        period.periodNumber
      );

    }


    // =================================================
    // FETCH CLASS
    // =====================================================

    const classData =
      await Class.findById(
        existingTimetable.classId
      ).select(
        "institution department programme batchId isDeleted isActive"
      );


    if (!classData) {

      throw new Error(
        "Class not found."
      );

    }


    if (
      classData.isDeleted ||
      !classData.isActive
    ) {

      throw new Error(
        "Class is inactive or deleted."
      );

    }


    // =====================================================
    // CHECK BATCH
    // =====================================================

    if (!classData.batchId) {

      throw new Error(
        "Batch is not assigned to this class."
      );

    }


    const batch =
      await Batch.findOne({

        _id:
          classData.batchId,

        status:
          "Active",

        isDeleted:
          false,

      });


    if (!batch) {

      throw new Error(
        "Batch not found or inactive."
      );

    }


    // =====================================================
    // FIND PROGRAMME STRUCTURE
    // =====================================================

    const programmeStructure =
      await ProgrammeStructure.findOne({

        programmeId:
          classData.programme,

        isDeleted:
          false,

        isActive:
          true,

      });


    if (!programmeStructure) {

      throw new Error(
        "Programme structure not found."
      );

    }


    // =====================================================
    // FIND ACTIVE SEMESTER
    // =====================================================

    const activeSemester =
      programmeStructure.activeSemesters.find(

        (item) =>
          item.batchId.toString() ===
          classData.batchId.toString()

      );


    if (!activeSemester) {

      throw new Error(
        "Current semester is not configured for this batch."
      );

    }


    // =====================================================
    // CURRENT ACADEMIC INFORMATION
    // =====================================================

    const currentStudyYear =
      batch.currentYear;

    const currentSemester =
      activeSemester.semesterNumber;


    if (
      !currentStudyYear ||
      currentStudyYear < 1
    ) {

      throw new Error(
        "Current study year is not configured for this batch."
      );

    }


    // =====================================================
    // FETCH CURRENT SEMESTER SUBJECTS
    // =====================================================

    const activeSubjects =
      await Subject.find({

        programmeId:
          classData.programme,

        studyYear:
          currentStudyYear,

        semesterNumber:
          currentSemester,

        isDeleted:
          false,

        isActive:
          true,

      }).select("_id");


    if (
      activeSubjects.length === 0
    ) {

      throw new Error(
        `No subjects are configured for Study Year ${currentStudyYear}, Semester ${currentSemester}.`
      );

    }


    const validSubjectIds =
      activeSubjects.map(

        (subject) =>
          subject._id.toString()

      );


    // =====================================================
    // VALIDATE TIMETABLE
    // =====================================================

    const facultyIds = [];


    for (
      const day
      of timetable
    ) {


      // ================================================
      // DAY ORDER
      // ================================================

      if (
        day.dayOrder > 6
      ) {

        throw new Error(
          "Maximum 6 day orders are allowed."
        );

      }


      const usedPeriodsInDay = [];


      for (
        const period
        of day.periods
      ) {


        // ==============================================
        // DUPLICATE PERIOD
        // ==============================================

        if (
          usedPeriodsInDay.includes(
            period.periodNumber
          )
        ) {

          throw new Error(
            `Duplicate Period ${period.periodNumber} found in Day ${day.dayOrder}.`
          );

        }


        usedPeriodsInDay.push(
          period.periodNumber
        );


        // ==============================================
        // FIND PERIOD CONFIGURATION
        // ==============================================

        const periodInfo =
          periodConfiguration.find(

            (item) =>
              item.periodNumber ===
              period.periodNumber

          );


        if (!periodInfo) {

          throw new Error(
            `Period ${period.periodNumber} is not configured.`
          );

        }


        // ==============================================
        // BREAK / LUNCH
        // ==============================================

        if (
          periodInfo.periodType !==
          "Teaching"
        ) {

          continue;

        }


        // ==============================================
        // SUBJECT REQUIRED
        // ==============================================

        if (
          !period.subjectId
        ) {

          throw new Error(
            `Teaching Period ${period.periodNumber} requires a subject.`
          );

        }


        // ==============================================
        // FACULTY REQUIRED
        // ==============================================

        if (
          !period.facultyId
        ) {

          throw new Error(
            `Teaching Period ${period.periodNumber} requires a faculty.`
          );

        }


        // ==============================================
        // VALIDATE SUBJECT ID
        // ==============================================

        if (
          !mongoose.Types.ObjectId.isValid(
            period.subjectId
          )
        ) {

          throw new Error(
            `Invalid subject ID in Period ${period.periodNumber}.`
          );

        }


        // ==============================================
        // SUBJECT MUST BELONG TO CURRENT SEMESTER
        // ==============================================

        if (
          !validSubjectIds.includes(
            period.subjectId.toString()
          )
        ) {

          throw new Error(
            "One or more subjects do not belong to the current batch semester."
          );

        }


        // ==============================================
        // VALIDATE FACULTY ID
        // ==============================================

        if (
          !mongoose.Types.ObjectId.isValid(
            period.facultyId
          )
        ) {

          throw new Error(
            `Invalid faculty ID in Period ${period.periodNumber}.`
          );

        }


        // ==============================================
        // COLLECT FACULTY IDS
        // ==============================================

        if (
          !facultyIds.includes(
            period.facultyId.toString()
          )
        ) {

          facultyIds.push(
            period.facultyId.toString()
          );

        }

      }

    }


    // =====================================================
    // VALIDATE FACULTIES
    // =====================================================

    if (
      facultyIds.length > 0
    ) {

      const faculties =
        await User.find({

          _id: {
            $in: facultyIds,
          },

          institution:
            classData.institution,

          department:
            classData.department,

          role:
            "teaching_faculty",

          status:
            "active",

          isDeleted:
            false,

        }).select("_id");


      if (
        faculties.length !==
        facultyIds.length
      ) {

        throw new Error(
          "One or more selected faculties are invalid, inactive, deleted, or do not belong to this department."
        );

      }

    }


    // =====================================================
    // UPDATE
    // =====================================================

    existingTimetable.periodConfiguration =
      periodConfiguration;

    existingTimetable.timetable =
      timetable;

    existingTimetable.currentSemester =
      currentSemester;


    await existingTimetable.save();


    // =====================================================
    // RETURN
    // =====================================================

    return existingTimetable;

  };



// =====================================================
// DELETE TIMETABLE
// =====================================================

export const deleteTimetableService =
  async (timetableId) => {


    // =================================================
    // VALIDATE
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        timetableId
      )
    ) {

      throw new Error(
        "Invalid timetable ID."
      );

    }


    // =================================================
    // FIND TIMETABLE
    // =================================================

    const timetable =
      await Timetable.findById(
        timetableId
      );


    if (!timetable) {

      throw new Error(
        "Timetable not found."
      );

    }


    // =================================================
    // DELETE
    // =================================================

    await Timetable.findByIdAndDelete(
      timetableId
    );


    // =================================================
    // RETURN
    // =================================================

    return timetable;

  };


  // =====================================================
// GET FACULTY WORKING HOURS TIMETABLE
// =====================================================

// ============================================================
// GET SINGLE FACULTY TIMETABLE
// ============================================================

export const getSingleFacultyTimetableService = async (
  facultyId
) => {

  // ============================================================
  // 1. VALIDATE TEACHING FACULTY ID
  // ============================================================

  if (
    !mongoose.Types.ObjectId.isValid(facultyId)
  ) {
    throw new Error("Invalid faculty ID.");
  }


  // ============================================================
  // 2. FIND TEACHING FACULTY
  // ============================================================

  const faculty =
    await TeachingFaculty.findOne({
      _id: facultyId,
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select:
          "fullName email phone profileImage institution department role status",
      })
      .lean();


  // ============================================================
  // 3. FACULTY NOT FOUND
  // ============================================================

  if (!faculty) {
    throw new Error(
      "Teaching faculty not found."
    );
  }


  // ============================================================
  // 4. GET ACTUAL USER ID
  // ============================================================

  const userId =
    faculty.userId?._id;


  if (!userId) {
    throw new Error(
      "Teaching faculty is not linked to a user."
    );
  }


  // ============================================================
  // 5. FIND TIMETABLES
  // ============================================================

  const timetables =
    await Timetable.find({
      institutionId:
        faculty.userId.institution,

      departmentId:
        faculty.department,

    })
      .populate({
        path: "classId",
        select:
          "programme batchId section className",
        populate: [
          {
            path: "programme",
            select:
              "programmeName programmeCode",
          },
          {
            path: "batchId",
            select:
              "batchName admissionYear graduationYear currentYear status",
          },
        ],
      })
      .populate(
        "timetable.periods.subjectId",
        "subjectName subjectCode subjectType"
      )
      .populate(
        "timetable.periods.facultyId",
        "fullName email profileImage role department"
      )
      .lean();


  // ============================================================
  // 6. PREPARE DAYS
  // ============================================================

  const days = [
    {
      dayOrder: 1,
      name: "Monday",
    },
    {
      dayOrder: 2,
      name: "Tuesday",
    },
    {
      dayOrder: 3,
      name: "Wednesday",
    },
    {
      dayOrder: 4,
      name: "Thursday",
    },
    {
      dayOrder: 5,
      name: "Friday",
    },
    {
      dayOrder: 6,
      name: "Saturday",
    },
  ];


  // ============================================================
  // 7. INITIALIZE FACULTY TIMETABLE
  // ============================================================

  const facultyTimetable = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };


  // ============================================================
  // 8. FIND FACULTY PERIODS
  // ============================================================

  timetables.forEach(
    (timetable) => {

      if (
        !timetable.timetable ||
        !Array.isArray(
          timetable.timetable
        )
      ) {
        return;
      }


      timetable.timetable.forEach(
        (day) => {

          const dayInfo =
            days.find(
              (item) =>
                item.dayOrder ===
                day.dayOrder
            );


          if (!dayInfo) {
            return;
          }


          if (
            !day.periods ||
            !Array.isArray(
              day.periods
            )
          ) {
            return;
          }


          day.periods.forEach(
            (period) => {

              // ==================================================
              // ONLY MATCH THIS FACULTY
              // ==================================================

              if (
                !period.facultyId
              ) {
                return;
              }


              const periodFacultyId =
                period.facultyId?._id
                  ? period.facultyId._id.toString()
                  : period.facultyId.toString();


              if (
                periodFacultyId !==
                userId.toString()
              ) {
                return;
              }


              // ==================================================
              // FIND PERIOD CONFIGURATION
              // ==================================================

              const periodConfiguration =
                timetable.periodConfiguration?.find(
                  (item) =>
                    item.periodNumber ===
                    period.periodNumber
                );


              // ==================================================
              // ADD FACULTY PERIOD
              // ==================================================

              facultyTimetable[
                dayInfo.name
              ].push({

                periodNumber:
                  period.periodNumber,

                type:
                  periodConfiguration?.periodType ||
                  "Teaching",

                subject:
                  period.subjectId
                    ? {
                        _id:
                          period.subjectId._id,

                        subjectName:
                          period.subjectId.subjectName,

                        subjectCode:
                          period.subjectId.subjectCode,

                        subjectType:
                          period.subjectId.subjectType,
                      }
                    : null,

                class:
                  timetable.classId
                    ? {
                        _id:
                          timetable.classId._id,

                        className:
                          timetable.classId.className,

                        section:
                          timetable.classId.section,

                        programme:
                          timetable.classId.programme
                            ? {
                                _id:
                                  timetable.classId
                                    .programme._id,

                                programmeName:
                                  timetable.classId
                                    .programme
                                    .programmeName,

                                programmeCode:
                                  timetable.classId
                                    .programme
                                    .programmeCode,
                              }
                            : null,

                        batchId:
                          timetable.classId.batchId
                            ? {
                                _id:
                                  timetable.classId
                                    .batchId._id,

                                batchName:
                                  timetable.classId
                                    .batchId
                                    .batchName,

                                admissionYear:
                                  timetable.classId
                                    .batchId
                                    .admissionYear,

                                graduationYear:
                                  timetable.classId
                                    .batchId
                                    .graduationYear,

                                currentYear:
                                  timetable.classId
                                    .batchId
                                    .currentYear,
                              }
                            : null,
                      }
                    : null,

                timetableId:
                  timetable._id,

              });

            }
          );

        }
      );

    }
  );


  // ============================================================
  // 9. SORT PERIODS
  // ============================================================

  Object.keys(
    facultyTimetable
  ).forEach(
    (dayName) => {

      facultyTimetable[
        dayName
      ].sort(
        (a, b) =>
          a.periodNumber -
          b.periodNumber
      );

    }
  );


  // ============================================================
  // 10. COUNT TEACHING PERIODS
  // ============================================================

  let totalTeachingPeriods = 0;


  Object.values(
    facultyTimetable
  ).forEach(
    (periods) => {

      totalTeachingPeriods +=
        periods.filter(
          (period) =>
            period.type ===
            "Teaching"
        ).length;

    }
  );


  // ============================================================
  // 11. COUNT WORKING DAYS
  // ============================================================

  const workingDays =
    Object.values(
      facultyTimetable
    ).filter(
      (periods) =>
        periods.some(
          (period) =>
            period.type ===
            "Teaching"
        )
    ).length;


  // ============================================================
  // 12. RETURN RESULT
  // ============================================================

  return {

    faculty: {

      _id:
        faculty._id,

      userId:
        faculty.userId?._id ||
        null,

      employeeId:
        faculty.employeeId ||
        null,

      designation:
        faculty.designation ||
        null,

      department:
        faculty.department ||
        null,

      fullName:
        faculty.userId?.fullName ||
        null,

      email:
        faculty.userId?.email ||
        null,

      phone:
        faculty.userId?.phone ||
        null,

      profileImage:
        faculty.userId?.profileImage ||
        null,

    },

    timetable:
      facultyTimetable,

    totalTeachingPeriods,

    workingDays,

  };
};