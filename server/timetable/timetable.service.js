import mongoose from "mongoose";
import Institution from "../institution/institution.model.js"
import Timetable from "../timetable/model/timetable.model.js";
import Class from "../class/class.model.js";
import Batch from "../batch/batch.model.js";
import Subject from "../subject/subject.model.js";
import ProgrammeStructure from "../subject/ProgrammeStructureSchema/programmeStructureSchema.model.js";
import TimetableAssignment from "../timetable/model/timetableAssignment.model.js";
import User from "../user/models/user.model.js";
import TeachingFaculty from "../user/models/teachingFaculty.model.js";
import Attendance from "../timetable/model/attendance.model.js";
import Student from "../student/student.model.js"
// ============================================================
// CREATE MASTER TIMETABLE
// ============================================================

// ============================================================
// ADD THIS IMPORT TO YOUR EXISTING IMPORTS
// ============================================================

// import Institution from "../institution/institution.model.js";


// ============================================================
// HELPER — CALCULATE PERIOD ATTENDANCE
// ============================================================

const getPeriodAttendance = (
  institutionAttendance,
  periodNumber,
  periodType
) => {

  // ============================================================
  // DEFAULT
  // ============================================================

  const result = {
    attendanceRequired: false,
    attendanceType: null,
  };

  // ============================================================
  // ATTENDANCE DISABLED
  // ============================================================

  if (!institutionAttendance?.enabled) {
    return result;
  }

  // ============================================================
  // BREAK / LUNCH
  // ============================================================

  if (periodType !== "Teaching") {
    return result;
  }

  const format =
    institutionAttendance.format;

  const schedule =
    institutionAttendance.schedule || {};

  // ============================================================
  // FULL DAY
  // ============================================================

  if (format === "FULL_DAY") {

    if (
      Number(schedule.fullDayPeriod) ===
      Number(periodNumber)
    ) {
      return {
        attendanceRequired: true,
        attendanceType: "FULL_DAY",
      };
    }

    return result;
  }

  // ============================================================
  // TWO PER DAY
  // ============================================================

  if (format === "TWO_PER_DAY") {

    if (
      Number(schedule.morningPeriod) ===
      Number(periodNumber)
    ) {
      return {
        attendanceRequired: true,
        attendanceType: "MORNING",
      };
    }

    if (
      Number(schedule.afternoonPeriod) ===
      Number(periodNumber)
    ) {
      return {
        attendanceRequired: true,
        attendanceType: "AFTERNOON",
      };
    }

    return result;
  }

  // ============================================================
  // HOUR BASED
  // ============================================================

  if (format === "HOUR_BASED") {

    return {
      attendanceRequired: true,
      attendanceType: "HOUR_BASED",
    };
  }

  return result;
};


// ============================================================
// CREATE MASTER TIMETABLE
// ============================================================

export const createTimetableService = async (
  timetableData,
  user
) => {

  const {
    classId,
    periodConfiguration,
    timetable,
  } = timetableData;


  // ============================================================
  // GET INSTITUTION / DEPARTMENT FROM LOGGED-IN USER
  // ============================================================

  const institutionId =
    user.institution;

  const departmentId =
    user.department;


  if (!institutionId) {
    throw new Error(
      "Institution is not associated with the logged-in user."
    );
  }


  if (!departmentId) {
    throw new Error(
      "Department is not associated with the logged-in user."
    );
  }


  // ============================================================
  // FETCH INSTITUTION
  // ============================================================

  const institution =
    await Institution.findOne({
      _id: institutionId,
      isDeleted: false,
    }).select(
      "institutionName attendance"
    );


  if (!institution) {
    throw new Error(
      "Institution not found."
    );
  }


  // ============================================================
  // VALIDATE CLASS ID
  // ============================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // ============================================================
  // CHECK CLASS
  // ============================================================

  const classData =
    await Class.findOne({
      _id: classId,

      institution:
        institutionId,

      department:
        departmentId,

      isDeleted: false,

      isActive: true,
    });


  if (!classData) {
    throw new Error(
      "Class not found."
    );
  }


  // ============================================================
  // CHECK BATCH
  // ============================================================

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


  // ============================================================
  // FIND PROGRAMME STRUCTURE
  // ============================================================

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


  // ============================================================
  // FIND ACTIVE SEMESTER FOR BATCH
  // ============================================================

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


  // ============================================================
  // CURRENT ACADEMIC INFORMATION
  // ============================================================

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


  // ============================================================
  // VALIDATE SEMESTER BELONGS TO STUDY YEAR
  // ============================================================

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


  // ============================================================
  // VALIDATE PERIOD CONFIGURATION
  // ============================================================

  if (
    !Array.isArray(
      periodConfiguration
    ) ||
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


  // ============================================================
  // CHECK DUPLICATE PERIOD NUMBERS
  // ============================================================

  const usedPeriods =
    new Set();


  for (
    const period of
    periodConfiguration
  ) {

    if (
      !Number.isInteger(
        period.periodNumber
      ) ||
      period.periodNumber < 1
    ) {
      throw new Error(
        "Invalid period number in period configuration."
      );
    }


    if (
      usedPeriods.has(
        period.periodNumber
      )
    ) {
      throw new Error(
        `Duplicate Period ${period.periodNumber} found.`
      );
    }


    usedPeriods.add(
      period.periodNumber
    );


    if (
      ![
        "Teaching",
        "Break",
        "Lunch",
      ].includes(
        period.periodType
      )
    ) {
      throw new Error(
        `Invalid period type for Period ${period.periodNumber}.`
      );
    }
  }


  // ============================================================
  // FETCH CURRENT SEMESTER SUBJECTS
  // ============================================================

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


  // ============================================================
  // VALID SUBJECT IDS
  // ============================================================

  const validSubjectIds =
    new Set(
      activeSubjects.map(
        (subject) =>
          subject._id.toString()
      )
    );


  // ============================================================
  // VALIDATE TIMETABLE
  // ============================================================

  if (
    timetable !== undefined &&
    !Array.isArray(timetable)
  ) {
    throw new Error(
      "Timetable must be an array."
    );
  }


  const timetableDays =
    timetable || [];


  // ============================================================
  // CHECK DUPLICATE DAY ORDERS
  // ============================================================

  const usedDays =
    new Set();


  for (
    const day of
    timetableDays
  ) {

    // ========================================================
    // VALIDATE DAY ORDER
    // ========================================================

    if (
      !Number.isInteger(
        day.dayOrder
      ) ||
      day.dayOrder < 1 ||
      day.dayOrder > 6
    ) {
      throw new Error(
        "Day order must be between 1 and 6."
      );
    }


    if (
      usedDays.has(
        day.dayOrder
      )
    ) {
      throw new Error(
        `Duplicate Day ${day.dayOrder} found.`
      );
    }


    usedDays.add(
      day.dayOrder
    );


    // ========================================================
    // VALIDATE PERIOD ARRAY
    // ========================================================

    if (
      !Array.isArray(
        day.periods
      )
    ) {
      throw new Error(
        `Periods must be an array for Day ${day.dayOrder}.`
      );
    }


    const usedPeriodsInDay =
      new Set();


    // ========================================================
    // VALIDATE EACH PERIOD
    // ========================================================

    for (
      const period of
      day.periods
    ) {

      // ======================================================
      // DUPLICATE PERIOD IN SAME DAY
      // ======================================================

      if (
        usedPeriodsInDay.has(
          period.periodNumber
        )
      ) {
        throw new Error(
          `Duplicate Period ${period.periodNumber} found in Day ${day.dayOrder}.`
        );
      }


      usedPeriodsInDay.add(
        period.periodNumber
      );


      // ======================================================
      // FIND PERIOD CONFIGURATION
      // ======================================================

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


      // ======================================================
      // CALCULATE ATTENDANCE
      // ======================================================

      const attendance =
        getPeriodAttendance(
          institution.attendance,
          period.periodNumber,
          periodInfo.periodType
        );


      // ======================================================
      // BREAK / LUNCH
      // ======================================================

      if (
        periodInfo.periodType !==
        "Teaching"
      ) {

        period.attendanceRequired =
          false;

        period.attendanceType =
          null;

        continue;
      }


      // ======================================================
      // TEACHING PERIOD REQUIRES SUBJECT
      // ======================================================

      if (!period.subjectId) {
        throw new Error(
          `Teaching Period ${period.periodNumber} requires a subject.`
        );
      }


      // ======================================================
      // VALIDATE SUBJECT ID
      // ======================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          period.subjectId
        )
      ) {
        throw new Error(
          `Invalid subject ID in Period ${period.periodNumber}.`
        );
      }


      // ======================================================
      // SUBJECT MUST BELONG TO CURRENT SEMESTER
      // ======================================================

      if (
        !validSubjectIds.has(
          period.subjectId.toString()
        )
      ) {
        throw new Error(
          `Subject in Period ${period.periodNumber} does not belong to the current batch semester.`
        );
      }


      // ======================================================
      // SAVE ATTENDANCE INFORMATION
      // ======================================================

      period.attendanceRequired =
        attendance.attendanceRequired;

      period.attendanceType =
        attendance.attendanceType;
    }
  }


  // ============================================================
  // PREVENT DUPLICATE TIMETABLE FOR CLASS
  // ============================================================

  const existingTimetable =
    await Timetable.findOne({
      classId,
    });


  if (existingTimetable) {
    throw new Error(
      "Timetable already exists for this class."
    );
  }


  // ============================================================
  // CREATE MASTER TIMETABLE
  // ============================================================

  const createdTimetable =
    await Timetable.create({

      institutionId,

      departmentId,

      classId,

      currentSemester,

      periodConfiguration,

      timetable:
        timetableDays,
    });


  // ============================================================
  // RETURN
  // ============================================================

  return createdTimetable;
};


// ============================================================
// GET TIMETABLE BY CLASS
// ============================================================

export const getTimetableByClassService =
  async (classId) => {

    // ========================================================
    // VALIDATE CLASS ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {
      throw new Error(
        "Invalid class ID."
      );
    }


    // ========================================================
    // FETCH TIMETABLE
    // ========================================================

    const timetable =
      await Timetable.findOne({
        classId,
      })

        // ====================================================
        // POPULATE CLASS
        // ====================================================

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

        // ====================================================
        // POPULATE SUBJECT
        // ====================================================

        .populate(
          "timetable.periods.subjectId",

          "subjectName subjectCode subjectType"
        );


    // ========================================================
    // CHECK TIMETABLE
    // ========================================================

    if (!timetable) {
      throw new Error(
        "Timetable not found."
      );
    }


    // ========================================================
    // FETCH CURRENT INSTITUTION ATTENDANCE CONFIGURATION
    // ========================================================

    const institution =
      await Institution.findOne({
        _id:
          timetable.institutionId,

        isDeleted:
          false,
      }).select(
        "institutionName attendance"
      );


    if (!institution) {
      throw new Error(
        "Institution not found."
      );
    }


    // ========================================================
    // SORT PERIOD CONFIGURATION
    // ========================================================

    timetable.periodConfiguration.sort(
      (a, b) =>
        a.periodNumber -
        b.periodNumber
    );


    // ========================================================
    // SORT DAYS
    // ========================================================

    timetable.timetable.sort(
      (a, b) =>
        a.dayOrder -
        b.dayOrder
    );


    // ========================================================
    // APPLY CURRENT ATTENDANCE CONFIGURATION
    // ========================================================

    timetable.timetable.forEach(
      (day) => {

        day.periods.forEach(
          (period) => {

            const periodInfo =
              timetable.periodConfiguration.find(
                (item) =>
                  item.periodNumber ===
                  period.periodNumber
              );


            if (!periodInfo) {

              period.attendanceRequired =
                false;

              period.attendanceType =
                null;

              return;
            }


            const attendance =
              getPeriodAttendance(
                institution.attendance,
                period.periodNumber,
                periodInfo.periodType
              );


            period.attendanceRequired =
              attendance.attendanceRequired;

            period.attendanceType =
              attendance.attendanceType;
          }
        );


        // ==================================================
        // SORT PERIODS
        // ==================================================

        day.periods.sort(
          (a, b) =>
            a.periodNumber -
            b.periodNumber
        );
      }
    );


    // ========================================================
    // RETURN
    // ========================================================

    return timetable;
  };


// ============================================================
// UPDATE MASTER TIMETABLE
// ============================================================

export const updateTimetableService =
  async (
    timetableId,
    timetableData
  ) => {

    const {
      periodConfiguration,
      timetable,
    } = timetableData;


    // ========================================================
    // VALIDATE TIMETABLE ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        timetableId
      )
    ) {
      throw new Error(
        "Invalid timetable ID."
      );
    }


    // ========================================================
    // FIND EXISTING TIMETABLE
    // ========================================================

    const existingTimetable =
      await Timetable.findById(
        timetableId
      );


    if (!existingTimetable) {
      throw new Error(
        "Timetable not found."
      );
    }


    // ========================================================
    // FETCH INSTITUTION
    // ========================================================

    const institution =
      await Institution.findOne({
        _id:
          existingTimetable.institutionId,

        isDeleted:
          false,
      }).select(
        "institutionName attendance"
      );


    if (!institution) {
      throw new Error(
        "Institution not found."
      );
    }


    // ========================================================
    // FETCH CLASS
    // ========================================================

    const classData =
      await Class.findOne({
        _id:
          existingTimetable.classId,

        isDeleted:
          false,

        isActive:
          true,
      });


    if (!classData) {
      throw new Error(
        "Class not found or inactive."
      );
    }


    // ========================================================
    // CHECK BATCH
    // ========================================================

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


    // ========================================================
    // FIND PROGRAMME STRUCTURE
    // ========================================================

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


    // ========================================================
    // FIND ACTIVE SEMESTER
    // ========================================================

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


    // ========================================================
    // CURRENT ACADEMIC INFORMATION
    // ========================================================

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


    // ========================================================
    // VALIDATE SEMESTER
    // ========================================================

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


    // ========================================================
    // VALIDATE PERIOD CONFIGURATION
    // ========================================================

    if (
      !Array.isArray(
        periodConfiguration
      ) ||
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


    // ========================================================
    // CHECK DUPLICATE PERIOD NUMBERS
    // ========================================================

    const usedPeriods =
      new Set();


    for (
      const period of
      periodConfiguration
    ) {

      if (
        !Number.isInteger(
          period.periodNumber
        ) ||
        period.periodNumber < 1
      ) {
        throw new Error(
          "Invalid period number in period configuration."
        );
      }


      if (
        usedPeriods.has(
          period.periodNumber
        )
      ) {
        throw new Error(
          `Duplicate Period ${period.periodNumber} found.`
        );
      }


      usedPeriods.add(
        period.periodNumber
      );


      if (
        ![
          "Teaching",
          "Break",
          "Lunch",
        ].includes(
          period.periodType
        )
      ) {
        throw new Error(
          `Invalid period type for Period ${period.periodNumber}.`
        );
      }
    }


    // ========================================================
    // FETCH CURRENT SEMESTER SUBJECTS
    // ========================================================

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


    // ========================================================
    // VALID SUBJECT IDS
    // ========================================================

    const validSubjectIds =
      new Set(
        activeSubjects.map(
          (subject) =>
            subject._id.toString()
        )
      );


    // ========================================================
    // VALIDATE TIMETABLE
    // ========================================================

    if (
      !Array.isArray(
        timetable
      )
    ) {
      throw new Error(
        "Timetable must be an array."
      );
    }


    const usedDays =
      new Set();


    for (
      const day of
      timetable
    ) {

      // ======================================================
      // VALIDATE DAY
      // ======================================================

      if (
        !Number.isInteger(
          day.dayOrder
        ) ||
        day.dayOrder < 1 ||
        day.dayOrder > 6
      ) {
        throw new Error(
          "Day order must be between 1 and 6."
        );
      }


      if (
        usedDays.has(
          day.dayOrder
        )
      ) {
        throw new Error(
          `Duplicate Day ${day.dayOrder} found.`
        );
      }


      usedDays.add(
        day.dayOrder
      );


      // ======================================================
      // VALIDATE PERIOD ARRAY
      // ======================================================

      if (
        !Array.isArray(
          day.periods
        )
      ) {
        throw new Error(
          `Periods must be an array for Day ${day.dayOrder}.`
        );
      }


      const usedPeriodsInDay =
        new Set();


      // ======================================================
      // VALIDATE PERIODS
      // ======================================================

      for (
        const period of
        day.periods
      ) {

        // ====================================================
        // DUPLICATE PERIOD
        // ====================================================

        if (
          usedPeriodsInDay.has(
            period.periodNumber
          )
        ) {
          throw new Error(
            `Duplicate Period ${period.periodNumber} found in Day ${day.dayOrder}.`
          );
        }


        usedPeriodsInDay.add(
          period.periodNumber
        );


        // ====================================================
        // FIND PERIOD CONFIGURATION
        // ====================================================

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


        // ====================================================
        // CALCULATE ATTENDANCE
        // ====================================================

        const attendance =
          getPeriodAttendance(
            institution.attendance,
            period.periodNumber,
            periodInfo.periodType
          );


        // ====================================================
        // BREAK / LUNCH
        // ====================================================

        if (
          periodInfo.periodType !==
          "Teaching"
        ) {

          period.attendanceRequired =
            false;

          period.attendanceType =
            null;

          continue;
        }


        // ====================================================
        // SUBJECT REQUIRED
        // ====================================================

        if (!period.subjectId) {
          throw new Error(
            `Teaching Period ${period.periodNumber} requires a subject.`
          );
        }


        // ====================================================
        // VALIDATE SUBJECT ID
        // ====================================================

        if (
          !mongoose.Types.ObjectId.isValid(
            period.subjectId
          )
        ) {
          throw new Error(
            `Invalid subject ID in Period ${period.periodNumber}.`
          );
        }


        // ====================================================
        // SUBJECT MUST BELONG TO CURRENT SEMESTER
        // ====================================================

        if (
          !validSubjectIds.has(
            period.subjectId.toString()
          )
        ) {
          throw new Error(
            `Subject in Period ${period.periodNumber} does not belong to the current batch semester.`
          );
        }


        // ====================================================
        // SAVE ATTENDANCE INFORMATION
        // ====================================================

        period.attendanceRequired =
          attendance.attendanceRequired;

        period.attendanceType =
          attendance.attendanceType;
      }
    }


    // ========================================================
    // UPDATE
    // ========================================================

    existingTimetable.periodConfiguration =
      periodConfiguration;

    existingTimetable.timetable =
      timetable;

    existingTimetable.currentSemester =
      currentSemester;


    // ========================================================
    // SAVE
    // ========================================================

    await existingTimetable.save();


    // ========================================================
    // RETURN
    // ========================================================

    return existingTimetable;
  };


// ============================================================
// DELETE MASTER TIMETABLE
// ============================================================

export const deleteTimetableService =
  async (
    timetableId
  ) => {

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        timetableId
      )
    ) {
      throw new Error(
        "Invalid timetable ID."
      );
    }


    // ========================================================
    // FIND TIMETABLE
    // ========================================================

    const timetable =
      await Timetable.findById(
        timetableId
      );


    if (!timetable) {
      throw new Error(
        "Timetable not found."
      );
    }


    // ========================================================
    // DELETE
    // ========================================================

    await Timetable.findByIdAndDelete(
      timetableId
    );


    // ========================================================
    // RETURN
    // ========================================================

    return timetable;
  };









  // 2ND SLICE OF THE TIME TABLE 

// =====================================================
// HELPER — VALIDATE OBJECT ID
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// HELPER — GET MASTER TIMETABLE SLOT
// =====================================================

// const getTimetableSlot = (timetable, dayOrder, periodNumber) => {
//   const day = timetable.timetable.find(
//     (item) => item.dayOrder === Number(dayOrder)
//   );

//   if (!day) {
//     throw new Error(
//       `Day order ${dayOrder} does not exist in this timetable.`
//     );
//   }

//   const period = day.periods.find(
//     (item) => item.periodNumber === Number(periodNumber)
//   );

//   if (!period) {
//     throw new Error(
//       `Period ${periodNumber} does not exist on day order ${dayOrder}.`
//     );
//   }

//   // Check period configuration
//   const periodConfig = timetable.periodConfiguration.find(
//     (item) => item.periodNumber === Number(periodNumber)
//   );

//   if (!periodConfig) {
//     throw new Error(
//       `Period configuration not found for period ${periodNumber}.`
//     );
//   }

//   // Only teaching periods can receive faculty
//   if (periodConfig.periodType !== "Teaching") {
//     throw new Error(
//       `Period ${periodNumber} is ${periodConfig.periodType}. Faculty cannot be assigned to this period.`
//     );
//   }

//   return {
//     period,
//     periodConfig,
//   };
// };

// =====================================================
// HELPER — VALIDATE FACULTY
// =====================================================

const validateFaculty = async (facultyId, fieldName = "Faculty") => {
  if (!facultyId) {
    throw new Error(`${fieldName} is required.`);
  }

  if (!isValidObjectId(facultyId)) {
    throw new Error(`${fieldName} ID is invalid.`);
  }

  const user = await User.findOne({
    _id: facultyId,
    role: "teaching_faculty",
    status: "active",
    isDeleted: false,
  }).select("_id fullName email role status institution department");

  if (!user) {
    throw new Error(
      `${fieldName} does not exist, is inactive, deleted, or is not a teaching faculty.`
    );
  }

  // Confirm TeachingFaculty profile exists
  const teachingFaculty = await TeachingFaculty.findOne({
    userId: facultyId,
    isDeleted: false,
  }).select("_id userId employeeId designation department");

  if (!teachingFaculty) {
    throw new Error(
      `${fieldName} does not have an active TeachingFaculty profile.`
    );
  }

  return {
    user,
    teachingFaculty,
  };
};

// =====================================================
// 1. GET CLASS TIMETABLE FOR ASSIGNMENT
// =====================================================

export const getClassTimetableForAssignmentService = async (
  classId
) => {
  try {
    // -------------------------------------------------
    // Validate class ID
    // -------------------------------------------------

    if (!classId || !isValidObjectId(classId)) {
      throw new Error("Invalid class ID.");
    }

    // -------------------------------------------------
    // Get master timetable
    // -------------------------------------------------

    const timetable = await Timetable.findOne({
      classId,
    })
      .populate({
        path: "institutionId",
        select: "institutionName",
      })
      .populate({
        path: "departmentId",
        select: "departmentName",
      })
      .populate({
        path: "classId",
        populate: [
          {
            path: "programme",
            select: "programmeName",
          },
          {
            path: "batchId",
            select: "batchName currentYear",
          },
        ],
      })
      .populate({
        path: "timetable.periods.subjectId",
        select: "subjectName subjectCode",
      });

    if (!timetable) {
      throw new Error(
        "Master timetable not found for this class."
      );
    }

    // -------------------------------------------------
    // Get existing assignments
    // -------------------------------------------------

    const assignments = await TimetableAssignment.find({
      timetableId: timetable._id,
      status: "ACTIVE",
    })
      .populate({
        path: "facultyId",
        select: "fullName email role profileImage",
      })
      .populate({
        path: "attendanceFacultyId",
        select: "fullName email role profileImage",
      })
      .populate({
        path: "assignedBy",
        select: "fullName email",
      })
      .sort({
        dayOrder: 1,
        periodNumber: 1,
      });

    // -------------------------------------------------
    // Create assignment lookup
    // -------------------------------------------------

    const assignmentMap = {};

    assignments.forEach((assignment) => {
      const key = `${assignment.dayOrder}_${assignment.periodNumber}`;

      assignmentMap[key] = assignment;
    });

    // -------------------------------------------------
    // Attach assignment to each timetable period
    // -------------------------------------------------

    const timetableData = timetable.toObject();

    timetableData.timetable = timetableData.timetable.map(
      (day) => ({
        ...day,

        periods: day.periods.map((period) => {
          const key = `${day.dayOrder}_${period.periodNumber}`;

          return {
            ...period,
            assignment: assignmentMap[key] || null,
          };
        }),
      })
    );

    return {
      timetable: timetableData,
      assignments,
    };
  } catch (error) {
    throw error;
  }
};

// =====================================================
// 2. ASSIGN FACULTY TO TIMETABLE
// =====================================================

export const assignFacultyToTimetableService = async (
  assignmentData,
  user
) => {
  try {
    const {
      timetableId,
      dayOrder,
      periodNumber,
      facultyId,
      attendanceFacultyId,
      assignmentType = "REGULAR",
    } = assignmentData;

    // =================================================
    // VALIDATE AUTHENTICATED USER
    // =================================================

    if (!user || !user.userId) {
      throw new Error(
        "Authenticated user information is missing."
      );
    }

    // =================================================
    // VALIDATE REQUIRED FIELDS
    // =================================================

    if (!timetableId) {
      throw new Error(
        "Timetable ID is required."
      );
    }

    if (!isValidObjectId(timetableId)) {
      throw new Error(
        "Invalid timetable ID."
      );
    }

    if (
      dayOrder === undefined ||
      dayOrder === null
    ) {
      throw new Error(
        "Day order is required."
      );
    }

    if (
      periodNumber === undefined ||
      periodNumber === null
    ) {
      throw new Error(
        "Period number is required."
      );
    }

    if (!facultyId) {
      throw new Error(
        "Faculty ID is required."
      );
    }

    if (
      !["REGULAR", "COMBINED"].includes(
        assignmentType
      )
    ) {
      throw new Error(
        "Assignment type must be REGULAR or COMBINED."
      );
    }

    // =================================================
    // GET MASTER TIMETABLE
    // =================================================

    const timetable =
      await Timetable.findById(
        timetableId
      );

    if (!timetable) {
      throw new Error(
        "Master timetable not found."
      );
    }

    // =================================================
    // VERIFY TIMETABLE SLOT
    // =================================================

    const { period } =
      getTimetableSlot(
        timetable,
        dayOrder,
        periodNumber
      );

    // =================================================
    // VALIDATE FACULTY
    // =================================================

    await validateFaculty(
      facultyId,
      "Faculty"
    );

    // =================================================
    // ATTENDANCE FACULTY
    //
    // If attendanceFacultyId is not supplied,
    // the teaching faculty will also handle attendance.
    // =================================================

    const finalAttendanceFacultyId =
      attendanceFacultyId || facultyId;

    await validateFaculty(
      finalAttendanceFacultyId,
      "Attendance faculty"
    );

    // =================================================
    // CHECK SAME CLASS + SAME SLOT
    // =================================================

    const existingSlotAssignment =
      await TimetableAssignment.findOne({
        timetableId,
        dayOrder: Number(dayOrder),
        periodNumber: Number(
          periodNumber
        ),
        status: "ACTIVE",
      });

    if (existingSlotAssignment) {
      throw new Error(
        "This timetable period already has a faculty assignment."
      );
    }

    // =================================================
    // FACULTY DOUBLE-BOOKING CHECK
    // =================================================

    const existingFacultyAssignments =
      await TimetableAssignment.find({
        dayOrder: Number(dayOrder),
        periodNumber: Number(
          periodNumber
        ),
        status: "ACTIVE",

        $or: [
          {
            facultyId,
          },
          {
            attendanceFacultyId:
              facultyId,
          },
          {
            facultyId:
              finalAttendanceFacultyId,
          },
          {
            attendanceFacultyId:
              finalAttendanceFacultyId,
          },
        ],
      });

    // =================================================
    // REGULAR ASSIGNMENT
    // =================================================

    if (
      assignmentType === "REGULAR" &&
      existingFacultyAssignments.length > 0
    ) {
      throw new Error(
        "Faculty is already assigned to another timetable period at the same day and hour."
      );
    }

    // =================================================
    // COMBINED ASSIGNMENT
    // =================================================

    if (
      assignmentType === "COMBINED" &&
      existingFacultyAssignments.length > 0
    ) {
      const hasNonCombinedAssignment =
        existingFacultyAssignments.some(
          (assignment) =>
            assignment.assignmentType !==
            "COMBINED"
        );

      if (hasNonCombinedAssignment) {
        throw new Error(
          "This faculty is already assigned to a REGULAR period at the same day and hour. A COMBINED assignment cannot overlap a REGULAR assignment."
        );
      }
    }

    // =================================================
    // CREATE ASSIGNMENT
    // =================================================

    const assignment =
      await TimetableAssignment.create({
        // ---------------------------------------------
        // MASTER TIMETABLE
        // ---------------------------------------------

        timetableId:
          timetable._id,

        // ---------------------------------------------
        // DERIVED FROM MASTER TIMETABLE
        // ---------------------------------------------

        institutionId:
          timetable.institutionId,

        departmentId:
          timetable.departmentId,

        classId:
          timetable.classId,

        // ---------------------------------------------
        // SLOT
        // ---------------------------------------------

        dayOrder:
          Number(dayOrder),

        periodNumber:
          Number(periodNumber),

        // ---------------------------------------------
        // FACULTY
        // ---------------------------------------------

        facultyId,

        attendanceFacultyId:
          finalAttendanceFacultyId,

        // ---------------------------------------------
        // ASSIGNMENT TYPE
        // ---------------------------------------------

        assignmentType,

        // ---------------------------------------------
        // STATUS
        // ---------------------------------------------

        status: "ACTIVE",

        // ---------------------------------------------
        // AUDIT
        //
        // IMPORTANT:
        // JWT contains userId, not _id.
        // ---------------------------------------------

        assignedBy:
          user.userId,

        assignedAt:
          new Date(),
      });

    // =================================================
    // POPULATE RESPONSE
    // =================================================

    const populatedAssignment =
      await TimetableAssignment.findById(
        assignment._id
      )
        .populate({
          path: "facultyId",
          select:
            "fullName email role profileImage institution department",
        })
        .populate({
          path: "attendanceFacultyId",
          select:
            "fullName email role profileImage institution department",
        })
        .populate({
          path: "classId",
          select: "className",
        })
        .populate({
          path: "departmentId",
          select:
            "departmentName",
        })
        .populate({
          path: "assignedBy",
          select:
            "fullName email",
        });

    return populatedAssignment;

  } catch (error) {
    throw error;
  }
};

// =====================================================
// 3. GET CLASS FACULTY ASSIGNMENTS
// =====================================================

export const getClassFacultyAssignmentsService = async (
  classId
) => {
  try {
    if (!classId || !isValidObjectId(classId)) {
      throw new Error("Invalid class ID.");
    }

    const assignments =
      await TimetableAssignment.find({
        classId,
        status: "ACTIVE",
      })
        .populate({
          path: "facultyId",
          select:
            "fullName email role profileImage institution department",
        })
        .populate({
          path: "attendanceFacultyId",
          select:
            "fullName email role profileImage institution department",
        })
        .populate({
          path: "classId",
          select: "className",
        })
        .populate({
          path: "departmentId",
          select: "departmentName",
        })
        .populate({
          path: "assignedBy",
          select: "fullName email",
        })
        .sort({
          dayOrder: 1,
          periodNumber: 1,
        });

    return assignments;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// 4. UPDATE FACULTY ASSIGNMENT
// =====================================================

export const updateFacultyAssignmentService = async (
  assignmentId,
  assignmentData
) => {
  try {
    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!assignmentId || !isValidObjectId(assignmentId)) {
      throw new Error("Invalid assignment ID.");
    }

    const assignment =
      await TimetableAssignment.findById(
        assignmentId
      );

    if (!assignment) {
      throw new Error("Faculty assignment not found.");
    }

    if (assignment.status !== "ACTIVE") {
      throw new Error(
        "This faculty assignment is inactive."
      );
    }

    const {
      facultyId,
      attendanceFacultyId,
      assignmentType,
    } = assignmentData;

    // -------------------------------------------------
    // Use existing values when not supplied
    // -------------------------------------------------

    const newFacultyId =
      facultyId || assignment.facultyId.toString();

    const newAttendanceFacultyId =
      attendanceFacultyId ||
      assignment.attendanceFacultyId.toString();

    const newAssignmentType =
      assignmentType || assignment.assignmentType;

    // -------------------------------------------------
    // Validate assignment type
    // -------------------------------------------------

    if (
      !["REGULAR", "COMBINED"].includes(
        newAssignmentType
      )
    ) {
      throw new Error(
        "Assignment type must be REGULAR or COMBINED."
      );
    }

    // -------------------------------------------------
    // Validate faculty
    // -------------------------------------------------

    await validateFaculty(
      newFacultyId,
      "Faculty"
    );

    await validateFaculty(
      newAttendanceFacultyId,
      "Attendance faculty"
    );

    // -------------------------------------------------
    // Check faculty conflict
    //
    // Ignore current assignment itself.
    // -------------------------------------------------

    const existingFacultyAssignments =
      await TimetableAssignment.find({
        _id: {
          $ne: assignment._id,
        },

        dayOrder: assignment.dayOrder,
        periodNumber: assignment.periodNumber,

        status: "ACTIVE",

        $or: [
          {
            facultyId: newFacultyId,
          },
          {
            attendanceFacultyId: newFacultyId,
          },
          {
            facultyId: newAttendanceFacultyId,
          },
          {
            attendanceFacultyId:
              newAttendanceFacultyId,
          },
        ],
      });

    if (
      newAssignmentType === "REGULAR" &&
      existingFacultyAssignments.length > 0
    ) {
      throw new Error(
        "Faculty is already assigned to another timetable period at the same day and hour."
      );
    }

    if (
      newAssignmentType === "COMBINED" &&
      existingFacultyAssignments.length > 0
    ) {
      const hasNonCombinedAssignment =
        existingFacultyAssignments.some(
          (item) =>
            item.assignmentType !== "COMBINED"
        );

      if (hasNonCombinedAssignment) {
        throw new Error(
          "A COMBINED assignment cannot overlap a REGULAR assignment."
        );
      }
    }

    // -------------------------------------------------
    // Update
    // -------------------------------------------------

    assignment.facultyId = newFacultyId;

    assignment.attendanceFacultyId =
      newAttendanceFacultyId;

    assignment.assignmentType =
      newAssignmentType;

    await assignment.save();

    // -------------------------------------------------
    // Populate
    // -------------------------------------------------

    return await TimetableAssignment.findById(
      assignment._id
    )
      .populate({
        path: "facultyId",
        select:
          "fullName email role profileImage institution department",
      })
      .populate({
        path: "attendanceFacultyId",
        select:
          "fullName email role profileImage institution department",
      })
      .populate({
        path: "classId",
        select: "className",
      })
      .populate({
        path: "departmentId",
        select: "departmentName",
      })
      .populate({
        path: "assignedBy",
        select: "fullName email",
      });
  } catch (error) {
    throw error;
  }
};

// =====================================================
// 5. REMOVE FACULTY ASSIGNMENT
// =====================================================

export const removeFacultyAssignmentService = async (
  assignmentId
) => {
  try {
    if (!assignmentId || !isValidObjectId(assignmentId)) {
      throw new Error("Invalid assignment ID.");
    }

    const assignment =
      await TimetableAssignment.findById(
        assignmentId
      );

    if (!assignment) {
      throw new Error(
        "Faculty assignment not found."
      );
    }

    // -------------------------------------------------
    // Soft remove
    // -------------------------------------------------

    assignment.status = "INACTIVE";

    await assignment.save();

    return assignment;
  } catch (error) {
    throw error;
  }
};







// 3rd layer


// =====================================================
// HELPER — VALIDATE OBJECT ID
// =====================================================

// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id);
// };

// =====================================================
// GET FACULTY TIMETABLE
// =====================================================

// =====================================================
// GET FACULTY TIMETABLE
// =====================================================

export const getFacultyTimetableService = async (
  facultyId
) => {
  try {
    // =================================================
    // 1. VALIDATE FACULTY ID
    // =================================================

    if (!facultyId) {
      throw new Error(
        "Faculty ID is required."
      );
    }

    if (!isValidObjectId(facultyId)) {
      throw new Error(
        "Invalid faculty ID."
      );
    }

    // =================================================
    // 2. GET FACULTY
    // =================================================

    const faculty = await User.findOne({
      _id: facultyId,
      role: "teaching_faculty",
      status: "active",
      isDeleted: false,
    }).select(
      "_id fullName email role profileImage institution department"
    );

    if (!faculty) {
      throw new Error(
        "Active teaching faculty not found."
      );
    }

    // =================================================
    // 3. GET ACTIVE FACULTY ASSIGNMENTS
    // =================================================

    const assignments =
      await TimetableAssignment.find({
        $or: [
          {
            facultyId: facultyId,
          },
          {
            attendanceFacultyId: facultyId,
          },
        ],
        status: "ACTIVE",
      })
        .populate({
          path: "institutionId",
          select:
            "institutionName attendance",
        })
        .populate({
          path: "departmentId",
          select:
            "departmentName",
        })
        .populate({
          path: "classId",
          populate: [
            {
              path: "programme",
              select:
                "programmeName",
            },
            {
              path: "batchId",
              select:
                "batchName currentYear",
            },
          ],
        })
        .populate({
          path: "facultyId",
          select:
            "fullName email role profileImage",
        })
        .populate({
          path: "attendanceFacultyId",
          select:
            "fullName email role profileImage",
        })
        .sort({
          dayOrder: 1,
          periodNumber: 1,
        });

    // =================================================
    // 4. NO ASSIGNMENTS
    // =================================================

    if (assignments.length === 0) {
      return {
        faculty,
        totalAssignments: 0,
        timetable: [],
      };
    }

    // =================================================
    // 5. GET ALL REQUIRED MASTER TIMETABLES
    // =================================================

    const timetableIds = [
      ...new Set(
        assignments.map(
          (assignment) =>
            assignment.timetableId.toString()
        )
      ),
    ];

    const timetables =
      await Timetable.find({
        _id: {
          $in: timetableIds,
        },
      }).populate({
        path: "timetable.periods.subjectId",
        select:
          "subjectName subjectCode",
      });

    // =================================================
    // 6. CREATE TIMETABLE LOOKUP
    // =================================================

    const timetableMap = new Map();

    timetables.forEach(
      (timetable) => {
        timetableMap.set(
          timetable._id.toString(),
          timetable
        );
      }
    );

    // =================================================
    // 7. BUILD FACULTY SCHEDULE
    // =================================================

    const schedule = assignments.map(
      (assignment) => {

        // ---------------------------------------------
        // GET MASTER TIMETABLE
        // ---------------------------------------------

        const timetable =
          timetableMap.get(
            assignment.timetableId.toString()
          );

        let subject = null;
        let periodConfig = null;

        // ---------------------------------------------
        // FIND DAY + PERIOD
        // ---------------------------------------------

        if (timetable) {

          const day =
            timetable.timetable.find(
              (item) =>
                item.dayOrder ===
                assignment.dayOrder
            );

          if (day) {

            const period =
              day.periods.find(
                (item) =>
                  item.periodNumber ===
                  assignment.periodNumber
              );

            if (period) {
              subject =
                period.subjectId;
            }
          }

          // -------------------------------------------
          // GET PERIOD CONFIGURATION
          // -------------------------------------------

          periodConfig =
            timetable.periodConfiguration.find(
              (item) =>
                item.periodNumber ===
                assignment.periodNumber
            );
        }

        // =================================================
        // 8. GET INSTITUTION ATTENDANCE CONFIG
        // =================================================

        const institution =
          assignment.institutionId;

        const attendanceConfig =
          institution?.attendance;

        let attendance = {
          enabled:
            attendanceConfig?.enabled === true,
          required: false,
          type: null,
        };

        // =================================================
        // 9. CALCULATE ATTENDANCE REQUIREMENT
        // =================================================

        if (
          attendance.enabled &&
          periodConfig?.periodType === "Teaching"
        ) {

          const format =
            attendanceConfig?.format;

          const scheduleConfig =
            attendanceConfig?.schedule || {};

          // ---------------------------------------------
          // FULL DAY
          // ---------------------------------------------

          if (format === "FULL_DAY") {

            if (
              Number(
                scheduleConfig.fullDayPeriod
              ) ===
              Number(
                assignment.periodNumber
              )
            ) {
              attendance.required = true;
              attendance.type = "FULL_DAY";
            }
          }

          // ---------------------------------------------
          // TWO PER DAY
          // ---------------------------------------------

          else if (
            format === "TWO_PER_DAY"
          ) {

            if (
              Number(
                scheduleConfig.morningPeriod
              ) ===
              Number(
                assignment.periodNumber
              )
            ) {
              attendance.required = true;
              attendance.type = "MORNING";
            }

            else if (
              Number(
                scheduleConfig.afternoonPeriod
              ) ===
              Number(
                assignment.periodNumber
              )
            ) {
              attendance.required = true;
              attendance.type = "AFTERNOON";
            }
          }

          // ---------------------------------------------
          // HOUR BASED
          // ---------------------------------------------

          else if (
            format === "HOUR_BASED"
          ) {
            attendance.required = true;
            attendance.type = "HOUR_BASED";
          }
        }

        // =================================================
        // 10. RETURN PERIOD
        // =================================================

        return {
          timetableAssignmentId:
            assignment._id,

          timetableId:
            assignment.timetableId,

          institution:
            assignment.institutionId,

          department:
            assignment.departmentId,

          class:
            assignment.classId,

          dayOrder:
            assignment.dayOrder,

          periodNumber:
            assignment.periodNumber,

          subject,

          faculty:
            assignment.facultyId,

          attendanceFaculty:
            assignment.attendanceFacultyId,

          assignmentType:
            assignment.assignmentType,

          status:
            assignment.status,

          // ---------------------------------------------
          // ATTENDANCE INFORMATION
          // ---------------------------------------------

          attendance,
        };
      }
    );

    // =================================================
    // 11. GROUP BY DAY
    // =================================================

    const dayMap = new Map();

    schedule.forEach(
      (item) => {

        if (
          !dayMap.has(
            item.dayOrder
          )
        ) {
          dayMap.set(
            item.dayOrder,
            []
          );
        }

        dayMap
          .get(item.dayOrder)
          .push(item);
      }
    );

    // =================================================
    // 12. BUILD DAY-WISE RESPONSE
    // =================================================

    const timetableByDay =
      Array.from(
        dayMap.entries()
      )
        .sort(
          ([dayA], [dayB]) =>
            dayA - dayB
        )
        .map(
          ([
            dayOrder,
            periods,
          ]) => ({
            dayOrder,

            periods:
              periods.sort(
                (a, b) =>
                  a.periodNumber -
                  b.periodNumber
              ),
          })
        );

    // =================================================
    // 13. RETURN
    // =================================================

    return {
      faculty,

      totalAssignments:
        assignments.length,

      timetable:
        timetableByDay,
    };

  } catch (error) {
    throw error;
  }
};





// layer 4th

/*
=========================================================
ATTENDANCE SERVICE
=========================================================

Flow:

TimetableAssignment
        ↓
Master Timetable
        ↓
Institution Attendance Configuration
        ↓
Attendance Context
        ↓
Student Attendance
        ↓
Attendance Record
=========================================================
*/

// =====================================================
// IMPORTS
// =====================================================

// Keep your existing project import paths if different.


// =====================================================
// HELPER — NORMALIZE DATE
// =====================================================

const normalizeDate = (dateValue = new Date()) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid attendance date.");
  }

  // Store attendance date as the calendar date.
  // Application is expected to operate in IST.

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  return new Date(
    Date.UTC(
      year,
      month,
      day,
      0,
      0,
      0,
      0
    )
  );
};


// =====================================================
// HELPER — GET DAY ORDER FROM DATE
// =====================================================

const getDayOrderFromDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid attendance date.");
  }

  /*
    JavaScript:

    Sunday    = 0
    Monday    = 1
    Tuesday   = 2
    Wednesday = 3
    Thursday  = 4
    Friday    = 5
    Saturday  = 6

    Our timetable:

    Monday    = 1
    Tuesday   = 2
    Wednesday = 3
    Thursday  = 4
    Friday    = 5
    Saturday  = 6
  */

  const jsDay = date.getUTCDay();

  if (jsDay === 0) {
    return null;
  }

  return jsDay;
};


// =====================================================
// HELPER — GET MASTER TIMETABLE SLOT
// =====================================================

const getTimetableSlot = (
  timetable,
  dayOrder,
  periodNumber
) => {

  if (!timetable) {
    throw new Error(
      "Master timetable not found."
    );
  }

  const day =
    timetable.timetable.find(
      (item) =>
        Number(item.dayOrder) ===
        Number(dayOrder)
    );

  if (!day) {
    throw new Error(
      `Day order ${dayOrder} does not exist in the master timetable.`
    );
  }

  const period =
    day.periods.find(
      (item) =>
        Number(item.periodNumber) ===
        Number(periodNumber)
    );

  if (!period) {
    throw new Error(
      `Period ${periodNumber} does not exist on day order ${dayOrder}.`
    );
  }

  const periodConfig =
    timetable.periodConfiguration.find(
      (item) =>
        Number(item.periodNumber) ===
        Number(periodNumber)
    );

  if (!periodConfig) {
    throw new Error(
      `Period configuration not found for period ${periodNumber}.`
    );
  }

  if (
    periodConfig.periodType !==
    "Teaching"
  ) {
    throw new Error(
      `Period ${periodNumber} is ${periodConfig.periodType}. Attendance cannot be marked.`
    );
  }

  return {
    period,
    periodConfig,
  };
};


// =====================================================
// HELPER — GET INSTITUTION ATTENDANCE CONFIG
// =====================================================

const getInstitutionAttendanceConfig = async (
  institutionId
) => {

  if (
    !institutionId ||
    !isValidObjectId(institutionId)
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }

  const institution =
    await Institution.findOne({
      _id: institutionId,
      isDeleted: false,
    }).select(
      "institutionName attendance"
    );

  if (!institution) {
    throw new Error(
      "Institution not found."
    );
  }

  if (
    !institution.attendance ||
    institution.attendance.enabled !== true
  ) {
    throw new Error(
      "Attendance is disabled for this institution."
    );
  }

  return institution;
};


// =====================================================
// HELPER — DETERMINE ATTENDANCE TYPE
// =====================================================

const getAttendanceType = (
  attendanceConfig,
  periodNumber
) => {

  if (
    !attendanceConfig ||
    attendanceConfig.enabled !== true
  ) {
    return null;
  }

  const format =
    attendanceConfig.format;

  const schedule =
    attendanceConfig.schedule || {};


  // ===================================================
  // FULL DAY
  // ===================================================

  if (
    format === "FULL_DAY"
  ) {

    /*
      Current Institution CRUD implementation
      uses:

      schedule.fullDayPeriod
    */

    const configuredPeriod =
      schedule.fullDayPeriod ??
      schedule.fullDay?.periodNumber;

    if (
      Number(configuredPeriod) ===
      Number(periodNumber)
    ) {
      return "FULL_DAY";
    }

    return null;
  }


  // ===================================================
  // TWO PER DAY
  // ===================================================

  if (
    format === "TWO_PER_DAY"
  ) {

    /*
      Supports the current flat structure:

      morningPeriod
      afternoonPeriod

      and also the newer nested structure:

      morningPeriodNumber
      afternoonPeriodNumber
    */

    const morningPeriod =
      schedule.morningPeriod ??
      schedule.twoPerDay?.morningPeriodNumber;

    const afternoonPeriod =
      schedule.afternoonPeriod ??
      schedule.twoPerDay?.afternoonPeriodNumber;


    if (
      Number(morningPeriod) ===
      Number(periodNumber)
    ) {
      return "MORNING";
    }


    if (
      Number(afternoonPeriod) ===
      Number(periodNumber)
    ) {
      return "AFTERNOON";
    }

    return null;
  }


  // ===================================================
  // HOUR BASED
  // ===================================================

  if (
    format === "HOUR_BASED"
  ) {
    return "HOUR_BASED";
  }


  return null;
};


// =====================================================
// HELPER — VALIDATE ATTENDANCE AUTHORITY
// =====================================================

const validateAttendanceFaculty = async (
  assignment,
  userId
) => {

  if (!userId) {
    throw new Error(
      "Authenticated user information is missing."
    );
  }

  const facultyId =
    assignment.facultyId?.toString();

  const attendanceFacultyId =
    assignment.attendanceFacultyId?.toString();

  const authenticatedUserId =
    userId.toString();

  const isAuthorized =
    facultyId === authenticatedUserId ||
    attendanceFacultyId === authenticatedUserId;

  if (!isAuthorized) {
    throw new Error(
      "You are not authorized to mark attendance for this timetable assignment."
    );
  }

  return true;
};


// =====================================================
// HELPER — GET ACTIVE TIMETABLE ASSIGNMENT
// =====================================================

const getActiveAssignment = async (
  timetableAssignmentId
) => {

  if (
    !timetableAssignmentId ||
    !isValidObjectId(
      timetableAssignmentId
    )
  ) {
    throw new Error(
      "Invalid timetable assignment ID."
    );
  }

  const assignment =
    await TimetableAssignment.findOne({
      _id: timetableAssignmentId,
      status: "ACTIVE",
    });

  if (!assignment) {
    throw new Error(
      "Active timetable assignment not found."
    );
  }

  return assignment;
};


// =====================================================
// HELPER — GET MASTER TIMETABLE FOR ASSIGNMENT
// =====================================================

const getMasterTimetableForAssignment =
  async (assignment) => {

    const timetable =
      await Timetable.findOne({
        _id: assignment.timetableId,
        classId: assignment.classId,
        institutionId:
          assignment.institutionId,
        departmentId:
          assignment.departmentId,
      }).populate({
        path:
          "timetable.periods.subjectId",
        select:
          "subjectName subjectCode",
      });

    if (!timetable) {
      throw new Error(
        "Master timetable linked to this assignment was not found."
      );
    }

    return timetable;
  };


// =====================================================
// HELPER — GET STUDENTS OF CLASS
// =====================================================

const getClassStudents = async (
  classId
) => {

  if (
    !classId ||
    !isValidObjectId(classId)
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }

  const students =
    await Student.find({
      classId,
      isDeleted: false,
    })
      .select(
        "_id registerNumber studentName gender studentMobile studentEmail classId batchId programmeId departmentId"
      )
      .sort({
        studentName: 1,
      });

  return students;
};


// =====================================================
// HELPER — VALIDATE STUDENTS
// =====================================================

const validateStudentsBelongToClass = async (
  students,
  classId
) => {

  if (!Array.isArray(students)) {
    throw new Error(
      "Students must be provided as an array."
    );
  }

  if (students.length === 0) {
    throw new Error(
      "At least one student attendance record is required."
    );
  }


  // ===================================================
  // CHECK DUPLICATE STUDENT IDS
  // ===================================================

  const studentIds =
    students.map(
      (item) => item.studentId
    );


  const uniqueStudentIds =
    new Set(
      studentIds.map(
        (id) => id?.toString()
      )
    );


  if (
    uniqueStudentIds.size !==
    studentIds.length
  ) {
    throw new Error(
      "Duplicate student attendance entries are not allowed."
    );
  }


  // ===================================================
  // VALIDATE IDS + STATUS
  // ===================================================

  const allowedStatuses = [
    "PRESENT",
    "ABSENT",
    "OD",
    "MEDICAL_LEAVE",
  ];


  for (const item of students) {

    if (
      !item.studentId ||
      !isValidObjectId(
        item.studentId
      )
    ) {
      throw new Error(
        "Invalid student ID in attendance data."
      );
    }

    if (
      !allowedStatuses.includes(
        item.status
      )
    ) {
      throw new Error(
        `Invalid attendance status for student ${item.studentId}.`
      );
    }
  }


  // ===================================================
  // FETCH CLASS STUDENTS
  // ===================================================

  const classStudents =
    await Student.find({
      classId,
      isDeleted: false,
    }).select("_id");


  const validStudentIds =
    new Set(
      classStudents.map(
        (student) =>
          student._id.toString()
      )
    );


  // ===================================================
  // ENSURE EVERY STUDENT BELONGS TO CLASS
  // ===================================================

  for (const item of students) {

    if (
      !validStudentIds.has(
        item.studentId.toString()
      )
    ) {
      throw new Error(
        `Student ${item.studentId} does not belong to the assigned class.`
      );
    }
  }


  return true;
};


// =====================================================
// 1. GET ATTENDANCE CONTEXT
// =====================================================

export const getAttendanceContextService =
  async (
    timetableAssignmentId,
    userId,
    dateValue = new Date()
  ) => {

    try {

      // ===============================================
      // GET ASSIGNMENT
      // ===============================================

      const assignment =
        await getActiveAssignment(
          timetableAssignmentId
        );


      // ===============================================
      // AUTHORIZATION
      // ===============================================

      await validateAttendanceFaculty(
        assignment,
        userId
      );


      // ===============================================
      // GET INSTITUTION
      // ===============================================

      const institution =
        await getInstitutionAttendanceConfig(
          assignment.institutionId
        );


      // ===============================================
      // GET MASTER TIMETABLE
      // ===============================================

      const timetable =
        await getMasterTimetableForAssignment(
          assignment
        );


      // ===============================================
      // NORMALIZE DATE
      // ===============================================

      const date =
        normalizeDate(dateValue);


      // ===============================================
      // GET DAY ORDER
      // ===============================================

      const dayOrder =
        getDayOrderFromDate(date);


      if (!dayOrder) {
        throw new Error(
          "Attendance cannot be marked on Sunday."
        );
      }


      // ===============================================
      // VERIFY ASSIGNMENT DAY
      // ===============================================

      if (
        Number(dayOrder) !==
        Number(assignment.dayOrder)
      ) {
        throw new Error(
          "This timetable assignment does not belong to the selected date."
        );
      }


      // ===============================================
      // GET TIMETABLE SLOT
      // ===============================================

      const {
        period,
        periodConfig,
      } =
        getTimetableSlot(
          timetable,
          assignment.dayOrder,
          assignment.periodNumber
        );


      // ===============================================
      // GET ATTENDANCE TYPE
      // ===============================================

      const attendanceType =
        getAttendanceType(
          institution.attendance,
          assignment.periodNumber
        );


      if (!attendanceType) {
        throw new Error(
          "Attendance is not required for this timetable period."
        );
      }


      // ===============================================
      // GET SUBJECT
      // ===============================================

      const subject =
        period.subjectId;


      if (!subject) {
        throw new Error(
          "Subject not found for this timetable period."
        );
      }


      // ===============================================
      // GET CLASS STUDENTS
      // ===============================================

      const students =
        await getClassStudents(
          assignment.classId
        );


      // ===============================================
      // CHECK EXISTING ATTENDANCE
      // ===============================================

      const existingAttendance =
        await Attendance.findOne({
          timetableAssignmentId:
            assignment._id,
          date,
          attendanceType,
        })
          .populate({
            path: "markedBy",
            select:
              "fullName email role",
          });


      // ===============================================
      // RETURN CONTEXT
      // ===============================================

      return {
        attendance: {
          existing:
            Boolean(existingAttendance),

          attendanceId:
            existingAttendance?._id ||
            null,

          attendanceType,

          date,

          dayOrder:
            assignment.dayOrder,

          periodNumber:
            assignment.periodNumber,

          periodType:
            periodConfig.periodType,
        },

        institution: {
          _id:
            institution._id,

          institutionName:
            institution.institutionName,
        },

        assignment: {
          timetableAssignmentId:
            assignment._id,

          timetableId:
            assignment.timetableId,

          institutionId:
            assignment.institutionId,

          departmentId:
            assignment.departmentId,

          classId:
            assignment.classId,

          facultyId:
            assignment.facultyId,

          attendanceFacultyId:
            assignment.attendanceFacultyId,

          assignmentType:
            assignment.assignmentType,
        },

        subject,

        students:
          students.map(
            (student) => ({
              _id:
                student._id,

              registerNumber:
                student.registerNumber,

              studentName:
                student.studentName,

              gender:
                student.gender,

              studentMobile:
                student.studentMobile,

              studentEmail:
                student.studentEmail,

              classId:
                student.classId,

              currentStatus:
                existingAttendance
                  ? existingAttendance.students.find(
                      (item) =>
                        item.studentId.toString() ===
                        student._id.toString()
                    )?.status || null
                  : null,
            })
          ),

        existingAttendance:
          existingAttendance || null,
      };

    } catch (error) {
      throw error;
    }
  };


// =====================================================
// 2. CREATE ATTENDANCE
// =====================================================

export const createAttendanceService =
  async (
    attendanceData,
    userId
  ) => {

    try {

      const {
        timetableAssignmentId,
        students,
        date: requestedDate,
      } = attendanceData;


      // ===============================================
      // REQUIRED DATA
      // ===============================================

      if (!timetableAssignmentId) {
        throw new Error(
          "Timetable assignment ID is required."
        );
      }


      if (
        !Array.isArray(students) ||
        students.length === 0
      ) {
        throw new Error(
          "Student attendance data is required."
        );
      }


      // ===============================================
      // GET ASSIGNMENT
      // ===============================================

      const assignment =
        await getActiveAssignment(
          timetableAssignmentId
        );


      // ===============================================
      // AUTHORIZATION
      // ===============================================

      await validateAttendanceFaculty(
        assignment,
        userId
      );


      // ===============================================
      // GET INSTITUTION
      // ===============================================

      const institution =
        await getInstitutionAttendanceConfig(
          assignment.institutionId
        );


      // ===============================================
      // GET MASTER TIMETABLE
      // ===============================================

      const timetable =
        await getMasterTimetableForAssignment(
          assignment
        );


      // ===============================================
      // NORMALIZE DATE
      // ===============================================

      const date =
        normalizeDate(
          requestedDate || new Date()
        );


      // ===============================================
      // GET DAY ORDER
      // ===============================================

      const dayOrder =
        getDayOrderFromDate(date);


      if (!dayOrder) {
        throw new Error(
          "Attendance cannot be marked on Sunday."
        );
      }


      // ===============================================
      // VERIFY DAY
      // ===============================================

      if (
        Number(dayOrder) !==
        Number(assignment.dayOrder)
      ) {
        throw new Error(
          "This timetable assignment does not match the selected attendance date."
        );
      }


      // ===============================================
      // GET TIMETABLE SLOT
      // ===============================================

      const {
        period,
        periodConfig,
      } =
        getTimetableSlot(
          timetable,
          assignment.dayOrder,
          assignment.periodNumber
        );


      // ===============================================
      // GET ATTENDANCE TYPE
      // ===============================================

      const attendanceType =
        getAttendanceType(
          institution.attendance,
          assignment.periodNumber
        );


      if (!attendanceType) {
        throw new Error(
          "Attendance is not required for this timetable period."
        );
      }


      // ===============================================
      // GET SUBJECT
      // ===============================================

      const subject =
        period.subjectId;


      if (!subject) {
        throw new Error(
          "Subject not found for this timetable period."
        );
      }


      const subjectId =
        subject._id ||
        subject;


      // ===============================================
      // VALIDATE STUDENTS
      // ===============================================

      await validateStudentsBelongToClass(
        students,
        assignment.classId
      );


      // ===============================================
      // CHECK DUPLICATE ATTENDANCE
      // ===============================================

      const existingAttendance =
        await Attendance.findOne({
          timetableAssignmentId:
            assignment._id,

          date,

          attendanceType,
        });


      if (existingAttendance) {
        throw new Error(
          "Attendance has already been marked for this timetable period and date."
        );
      }


      // ===============================================
      // CREATE ATTENDANCE
      // ===============================================

      const attendance =
        await Attendance.create({

          // ---------------------------------------------
          // ORGANIZATION
          // ---------------------------------------------

          institutionId:
            assignment.institutionId,

          departmentId:
            assignment.departmentId,

          classId:
            assignment.classId,


          // ---------------------------------------------
          // ACADEMIC
          // ---------------------------------------------

          subjectId,


          // ---------------------------------------------
          // TIMETABLE
          // ---------------------------------------------

          timetableId:
            assignment.timetableId,

          timetableAssignmentId:
            assignment._id,


          // ---------------------------------------------
          // SLOT
          // ---------------------------------------------

          date,

          dayOrder:
            assignment.dayOrder,

          periodNumber:
            assignment.periodNumber,


          // ---------------------------------------------
          // ATTENDANCE TYPE
          // ---------------------------------------------

          attendanceType,


          // ---------------------------------------------
          // MARKED BY
          // ---------------------------------------------

          markedBy:
            userId,


          // ---------------------------------------------
          // STUDENTS
          // ---------------------------------------------

          students,

          // ---------------------------------------------
          // SUBMISSION
          // ---------------------------------------------

          submittedAt:
            new Date(),
        });


      // ===============================================
      // POPULATE RESPONSE
      // ===============================================

      const populatedAttendance =
        await Attendance.findById(
          attendance._id
        )
          .populate({
            path: "institutionId",
            select:
              "institutionName",
          })
          .populate({
            path: "departmentId",
            select:
              "departmentName",
          })
          .populate({
            path: "classId",
            select:
              "className",
          })
          .populate({
            path: "subjectId",
            select:
              "subjectName subjectCode",
          })
          .populate({
            path: "timetableAssignmentId",
          })
          .populate({
            path: "markedBy",
            select:
              "fullName email role profileImage",
          })
          .populate({
            path: "students.studentId",
            select:
              "registerNumber studentName gender",
          });


      return populatedAttendance;

    } catch (error) {

      // ===============================================
      // MONGODB DUPLICATE KEY
      // ===============================================

      if (
        error.code === 11000
      ) {
        throw new Error(
          "Attendance has already been marked for this timetable period and date."
        );
      }

      throw error;
    }
  };


// =====================================================
// 3. GET ATTENDANCE BY ID
// =====================================================

export const getAttendanceByIdService =
  async (
    attendanceId,
    userId
  ) => {

    try {

      // ===============================================
      // VALIDATE ID
      // ===============================================

      if (
        !attendanceId ||
        !isValidObjectId(
          attendanceId
        )
      ) {
        throw new Error(
          "Invalid attendance ID."
        );
      }


      // ===============================================
      // GET ATTENDANCE
      // ===============================================

      const attendance =
        await Attendance.findById(
          attendanceId
        )
          .populate({
            path: "institutionId",
            select:
              "institutionName attendance",
          })
          .populate({
            path: "departmentId",
            select:
              "departmentName",
          })
          .populate({
            path: "classId",
            select:
              "className",
          })
          .populate({
            path: "subjectId",
            select:
              "subjectName subjectCode",
          })
          .populate({
            path: "timetableAssignmentId",
          })
          .populate({
            path: "markedBy",
            select:
              "fullName email role profileImage",
          })
          .populate({
            path: "students.studentId",
            select:
              "registerNumber studentName gender",
          });


      if (!attendance) {
        throw new Error(
          "Attendance record not found."
        );
      }


      // ===============================================
      // AUTHORIZATION
      // ===============================================

      const assignment =
        await TimetableAssignment.findById(
          attendance.timetableAssignmentId?._id ||
          attendance.timetableAssignmentId
        );


      if (!assignment) {
        throw new Error(
          "Timetable assignment linked to attendance was not found."
        );
      }


      await validateAttendanceFaculty(
        assignment,
        userId
      );


      return attendance;

    } catch (error) {
      throw error;
    }
  };


// =====================================================
// 4. UPDATE ATTENDANCE
// =====================================================

export const updateAttendanceService =
  async (
    attendanceId,
    attendanceData,
    userId
  ) => {

    try {

      // ===============================================
      // VALIDATE ID
      // ===============================================

      if (
        !attendanceId ||
        !isValidObjectId(
          attendanceId
        )
      ) {
        throw new Error(
          "Invalid attendance ID."
        );
      }


      // ===============================================
      // GET ATTENDANCE
      // ===============================================

      const attendance =
        await Attendance.findById(
          attendanceId
        );


      if (!attendance) {
        throw new Error(
          "Attendance record not found."
        );
      }


      // ===============================================
      // GET ASSIGNMENT
      // ===============================================

      const assignment =
        await getActiveAssignment(
          attendance.timetableAssignmentId
        );


      // ===============================================
      // AUTHORIZATION
      // ===============================================

      await validateAttendanceFaculty(
        assignment,
        userId
      );


      // ===============================================
      // STUDENT DATA
      // ===============================================

      const {
        students,
      } = attendanceData;


      if (
        !Array.isArray(students) ||
        students.length === 0
      ) {
        throw new Error(
          "Student attendance data is required."
        );
      }


      // ===============================================
      // VALIDATE STUDENTS
      // ===============================================

      await validateStudentsBelongToClass(
        students,
        assignment.classId
      );


      // ===============================================
      // UPDATE
      // ===============================================

      attendance.students =
        students;

      attendance.markedBy =
        userId;

      attendance.submittedAt =
        new Date();


      await attendance.save();


      // ===============================================
      // RETURN POPULATED RECORD
      // ===============================================

      return await Attendance.findById(
        attendance._id
      )
        .populate({
          path: "institutionId",
          select:
            "institutionName",
        })
        .populate({
          path: "departmentId",
          select:
            "departmentName",
        })
        .populate({
          path: "classId",
          select:
            "className",
        })
        .populate({
          path: "subjectId",
          select:
            "subjectName subjectCode",
        })
        .populate({
          path: "timetableAssignmentId",
        })
        .populate({
          path: "markedBy",
          select:
            "fullName email role profileImage",
        })
        .populate({
          path: "students.studentId",
          select:
            "registerNumber studentName gender",
        });

    } catch (error) {
      throw error;
    }
  };


// =====================================================
// 5. DELETE ATTENDANCE
// =====================================================

export const deleteAttendanceService =
  async (
    attendanceId,
    userId
  ) => {

    try {

      // ===============================================
      // VALIDATE ID
      // ===============================================

      if (
        !attendanceId ||
        !isValidObjectId(
          attendanceId
        )
      ) {
        throw new Error(
          "Invalid attendance ID."
        );
      }


      // ===============================================
      // GET ATTENDANCE
      // ===============================================

      const attendance =
        await Attendance.findById(
          attendanceId
        );


      if (!attendance) {
        throw new Error(
          "Attendance record not found."
        );
      }


      // ===============================================
      // GET ASSIGNMENT
      // ===============================================

      const assignment =
        await getActiveAssignment(
          attendance.timetableAssignmentId
        );


      // ===============================================
      // AUTHORIZATION
      // ===============================================

      await validateAttendanceFaculty(
        assignment,
        userId
      );


      // ===============================================
      // DELETE
      // ===============================================

      await Attendance.findByIdAndDelete(
        attendanceId
      );


      return {
        attendanceId,
        deleted: true,
      };

    } catch (error) {
      throw error;
    }
  };